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
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

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
    # 1. Register BOTH Regular and Bold fonts to support the Peso sign AND bold styling
    font_pairs = [
        # Windows
        (os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'arial.ttf'),
         os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'arialbd.ttf')),
        # Linux / Unix fallbacks
        ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
         '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
        ('/usr/share/fonts/truetype/freefont/FreeSans.ttf',
         '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'),
    ]

    unicode_font_name = None
    for reg_path, bold_path in font_pairs:
        if os.path.exists(reg_path) and os.path.exists(bold_path):
            try:
                pdfmetrics.registerFont(TTFont('ReportSans', reg_path))
                pdfmetrics.registerFont(TTFont('ReportSans-Bold', bold_path))
                unicode_font_name = 'ReportSans'
                break
            except Exception:
                continue

    def fmt_currency(amount):
        if unicode_font_name:
            return f"₱{amount:,.2f}"
        return f"PHP {amount:,.2f}"

    doc = SimpleDocTemplate(filepath, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # Title and date
    elements.append(Paragraph("Weekly Sales Report", styles['Title']))
    date_range = f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
    subtitle = styles['Normal'].clone('subtitle')
    subtitle.spaceAfter = 12
    if unicode_font_name:
        subtitle.fontName = unicode_font_name
    elements.append(Paragraph(date_range, subtitle))
    elements.append(Spacer(1, 12))

    # Summary block 
    total_revenue = df['Revenue'].sum() if not df.empty else 0
    total_cost = df['Total Cost'].sum() if not df.empty else 0
    total_profit = df['Profit'].sum() if not df.empty else 0
    total_items = df['Quantity'].sum() if not df.empty else 0
    profit_margin = ((total_profit / total_revenue * 100) if total_revenue > 0 else 0)

    summary_lines = [
        ('Financial Summary:', True),
        (f"Total Revenue: {fmt_currency(total_revenue)}", False),
        (f"Total Cost: {fmt_currency(total_cost)}", False),
        (f"Total Profit: {fmt_currency(total_profit)}", False),
        (f"Profit Margin: {profit_margin:.1f}%", False),
        (f"Total Items Sold: {int(total_items)}", False)
    ]

    for text, is_bold in summary_lines:
        s = styles['Normal'].clone(f's_{is_bold}')
        s.spaceAfter = 4
        
        # 2. Fix the styling logic: explicitly assign the bold variant
        if is_bold:
            s.fontName = f"{unicode_font_name}-Bold" if unicode_font_name else 'Helvetica-Bold'
        else:
            s.fontName = unicode_font_name if unicode_font_name else 'Helvetica'
            
        elements.append(Paragraph(text, s))

    elements.append(Spacer(1, 20))

    # Table of transactions
    if not df.empty:
        headers = ['Date', 'Item', 'Category', 'Qty', 'Price', 'Cost', 'Revenue', 'Profit']
        data = [headers]
        
        # 3. Create a Paragraph style for table cells
        cell_style = styles['Normal'].clone('cell_style')
        cell_style.fontName = unicode_font_name if unicode_font_name else 'Helvetica'
        cell_style.fontSize = 8
        cell_style.leading = 10
        
        for _, row in df.iterrows():
            # Wrapping 'Item' in a Paragraph() parses HTML tags so they format correctly
            # instead of showing up as raw text. It also nicely wraps long item names.
            data.append([
                str(row['Date'])[:10],
                Paragraph(str(row['Item']), cell_style), 
                str(row['Category'])[:15],
                str(int(row['Quantity'])),
                fmt_currency(row['Price']),
                fmt_currency(row['Cost']),
                fmt_currency(row['Revenue']),
                fmt_currency(row['Profit'])
            ])

        colWidths = [65, 130, 80, 30, 50, 50, 60, 60]
        table = Table(data, colWidths=colWidths)

        header_font = f"{unicode_font_name}-Bold" if unicode_font_name else 'Helvetica-Bold'
        base_font = unicode_font_name if unicode_font_name else 'Helvetica'

        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), header_font),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('FONTNAME', (0, 1), (-1, -1), base_font),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), # Vertically aligns cells with Paragraphs
        ]))

        elements.append(table)
    else:
        empty_style = styles['Normal'].clone('empty')
        if unicode_font_name:
            empty_style.fontName = unicode_font_name
        elements.append(Paragraph("No sales data recorded for this period.", empty_style))

    doc.build(elements)

def send_email_with_attachment(to_email, file_path, html_body=None):
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

    msg = MIMEMultipart('mixed')
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = "Invex: Weekly Sales Report"
    
    body_part = MIMEMultipart('alternative')
    plain_text = "Please find attached your weekly sales report generated by Invex."
    body_part.attach(MIMEText(plain_text, 'plain', 'utf-8'))
    
    if html_body:
        body_part.attach(MIMEText(html_body, 'html', 'utf-8'))

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
