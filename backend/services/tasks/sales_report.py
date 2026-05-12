import os
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from .core import celery, supabase

@celery.task(name="tasks.send_weekly_report")
def send_weekly_report(user_email, user_id=None):
    """
    Generates a weekly sales PDF report and emails it to the user.
    If user_id is provided, filters for that user. Otherwise fetches all sales.
    """
    print(f"Starting weekly report generation for {user_email}")
    
    try:
        # 1. Fetch data
        start_date, end_date, sales_data = fetch_weekly_sales(user_id)
        
        if not sales_data:
            print(f"No sales data found for period {start_date} to {end_date}.")
            return f"No sales data found for {user_email}"

        # 2. Process data
        df = process_sales_data(sales_data)
        
        # 3. Generate PDF
        current_dir = os.path.dirname(os.path.abspath(__file__))
        reports_dir = os.path.join(current_dir, 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        pdf_filename = f"weekly_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_path = os.path.join(reports_dir, pdf_filename)
        
        generate_pdf_report(df, pdf_path, start_date, end_date)
        
        # 4. Send Email
        send_email_with_attachment(user_email, pdf_path)
        
        # Cleanup (Optional)
        # os.remove(pdf_path)
        
        return f"Report sent successfully to {user_email}"
    
    except Exception as e:
        print(f"Error sending report: {str(e)}")
        # Optionally re-raise to let Celery retry
        raise e

def fetch_weekly_sales(user_id=None):
    if not supabase:
        raise Exception("Supabase client not initialized")
        
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    # Query logic matching report_routes.py
    # Include cost column for profit calculation
    query = supabase.table('sale_report') \
        .select('*, item(item_name, price, cost, item_category(name))') \
        .gte('sale_date', start_date.isoformat()) \
        .lte('sale_date', end_date.isoformat())
        
    if user_id:
        query = query.eq('user_id', user_id)
        
    response = query.execute()
    return start_date, end_date, response.data

def process_sales_data(data):
    records = []
    for record in data:
        item = record.get('item') or {}
        # Handle flattened structure from join
        item_name = item.get('item_name', 'Unknown Item')
        price = float(item.get('price', 0))
        cost = float(item.get('cost', 0))  # Get cost for profit calculation
        qty = int(record['unit_sold'])
        
        category_data = item.get('item_category')
        category = category_data.get('name', 'Uncategorized') if category_data else 'Uncategorized'
        
        # Calculate revenue and profit
        revenue = qty * price
        total_cost = qty * cost
        profit = revenue - total_cost
        
        records.append({
            'Date': record['sale_date'],
            'Item': item_name,
            'Category': category,
            'Quantity': qty,
            'Price': price,
            'Cost': cost,
            'Revenue': revenue,
            'Total Cost': total_cost,
            'Profit': profit
        })
    
    if not records:
        return pd.DataFrame(columns=['Date', 'Item', 'Category', 'Quantity', 'Price', 'Cost', 'Revenue', 'Total Cost', 'Profit'])
        
    return pd.DataFrame(records)

def generate_pdf_report(df, filepath, start_date, end_date):
    from reportlab.lib.units import inch
    
    doc = SimpleDocTemplate(filepath, pagesize=letter, topMargin=0.75*inch, bottomMargin=0.75*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles for professional minimalist design
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    
    # Create custom title style
    title_style = styles['Heading1']
    title_style.fontSize = 24
    title_style.textColor = colors.HexColor('#1a1a1a')
    title_style.spaceAfter = 6
    title_style.alignment = TA_LEFT
    
    subtitle_style = styles['Normal']
    subtitle_style.fontSize = 10
    subtitle_style.textColor = colors.HexColor('#666666')
    subtitle_style.spaceAfter = 24
    
    # Header with company name
    elements.append(Paragraph("INVEX", styles['Heading2']))
    elements.append(Paragraph("Weekly Sales Report", title_style))
    
    period_text = f"<font color='#999999'>{start_date.strftime('%B %d, %Y')} – {end_date.strftime('%B %d, %Y')}</font>"
    elements.append(Paragraph(period_text, subtitle_style))
    elements.append(Spacer(1, 12))
    
    # Summary section with minimalist cards
    total_revenue = df['Revenue'].sum() if not df.empty else 0
    total_cost = df['Total Cost'].sum() if not df.empty else 0
    total_profit = df['Profit'].sum() if not df.empty else 0
    total_items = df['Quantity'].sum() if not df.empty else 0
    profit_margin = ((total_profit / total_revenue * 100) if total_revenue > 0 else 0)
    
    # Create summary table (4 key metrics in a grid)
    summary_data = [
        [f"<b>Total Revenue</b><br/><font size=14><b>₱{total_revenue:,.2f}</b></font>",
         f"<b>Total Profit</b><br/><font size=14><b>₱{total_profit:,.2f}</b></font>"],
        [f"<b>Profit Margin</b><br/><font size=14><b>{profit_margin:.1f}%</b></font>",
         f"<b>Items Sold</b><br/><font size=14><b>{int(total_items)}</b></font>"]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f8f8')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a1a1a')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 20),
        ('TOPPADDING', (0, 0), (-1, -1), 20),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e0e0e0')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8f8f8')])
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 20))
    
    # Details section header
    if not df.empty:
        elements.append(Paragraph("Transaction Details", styles['Heading2']))
        elements.append(Spacer(1, 8))
        
        # Table Data
        headers = ['Date', 'Item', 'Category', 'Qty', 'Price', 'Cost', 'Revenue', 'Profit']
        data = [headers]
        
        for _, row in df.iterrows():
            data.append([
                str(row['Date'])[:10],  # Just the date part
                str(row['Item'])[:25],
                str(row['Category'])[:15],
                str(int(row['Quantity'])),
                f"₱{row['Price']:.2f}",
                f"₱{row['Cost']:.2f}",
                f"₱{row['Revenue']:.2f}",
                f"₱{row['Profit']:.2f}"
            ])
        
        # Professional table styling - minimalist
        table = Table(data, colWidths=[60, 110, 75, 40, 50, 50, 60, 65])
        table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#ffffff')),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ffffff')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#333333')),
            ('ALIGN', (0, 1), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 1), (1, -1), 'LEFT'),  # Item and Category left-aligned
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),  # Category centered
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('PADDING', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f9f9f9')]),
            
            # Borders
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#2c3e50')),
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.HexColor('#e0e0e0')),
            ('GRID', (0, 1), (-1, -1), 0.5, colors.HexColor('#e0e0e0')),
        ]))
        
        elements.append(table)
        
        # Footer with summary
        elements.append(Spacer(1, 16))
        footer_text = f"""
        <font size=9 color='#666666'>
        <b>Summary:</b> Total Cost: ₱{total_cost:,.2f} | Net Profit: ₱{total_profit:,.2f}<br/>
        <i>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</i>
        </font>
        """
        elements.append(Paragraph(footer_text, styles['Normal']))
    else:
        elements.append(Paragraph("No sales data recorded for this period.", styles['Normal']))
    
    doc.build(elements)

def send_email_with_attachment(to_email, file_path):
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    sender_email = os.environ.get('SMTP_EMAIL')
    sender_password = os.environ.get('SMTP_PASSWORD')

    if not sender_email or not sender_password:
        print("SMTP_EMAIL or SMTP_PASSWORD not set in environment variables. Skipping email.")
        return
    
    # Strip spaces from password if user copied them directly from Google
    sender_password = sender_password.replace(' ', '')

    print(f"DEBUG: Attempting to send email via {smtp_server}:{smtp_port}")
    print(f"DEBUG: Sender: {sender_email}")
    print(f"DEBUG: Password length: {len(sender_password)} characters")

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = "Invex: Weekly Sales Report"
    
    body = "Please find attached your weekly sales report generated by Invex."
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        with open(file_path, "rb") as f:
            part = MIMEApplication(f.read(), Name=os.path.basename(file_path))
            part['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            msg.attach(part)
        
        # Connect to SMTP Server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, to_email, text)
        server.quit()
        print(f"Email sent successfully to {to_email}")

    except smtplib.SMTPAuthenticationError:
        print("Error: SMTP Authentication Failed.")
        print("If using Gmail, ensure you are using an App Password, not your regular password.")
        print("See: https://support.google.com/accounts/answer/185833")
    except Exception as e:
        print(f"Failed to send email: {e}")
