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
    query = supabase.table('sale_report') \
        .select('*, item(item_name, price, item_category(name))') \
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
        qty = int(record['unit_sold'])
        
        category_data = item.get('item_category')
        category = category_data.get('name', 'Uncategorized') if category_data else 'Uncategorized'
        
        records.append({
            'Date': record['sale_date'],
            'Item': item_name,
            'Category': category,
            'Quantity': qty,
            'Price': price,
            'Total': qty * price
        })
    
    if not records:
        return pd.DataFrame(columns=['Date', 'Item', 'Category', 'Quantity', 'Price', 'Total'])
        
    return pd.DataFrame(records)

def generate_pdf_report(df, filepath, start_date, end_date):
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title_text = f"Weekly Sales Report"
    date_range = f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
    
    elements.append(Paragraph(title_text, styles['Title']))
    elements.append(Paragraph(date_range, styles['Normal']))
    elements.append(Spacer(1, 12))
    
    # Summary
    total_revenue = df['Total'].sum() if not df.empty else 0
    total_items = df['Quantity'].sum() if not df.empty else 0
    
    summary_text = f"<b>Total Revenue:</b> ${total_revenue:,.2f}<br/><b>Total Items Sold:</b> {total_items}"
    elements.append(Paragraph(summary_text, styles['Normal']))
    elements.append(Spacer(1, 20))
    
    if not df.empty:
        # Table Data
        headers = ['Date', 'Item', 'Category', 'Qty', 'Price', 'Total']
        data = [headers]
        
        for _, row in df.iterrows():
            data.append([
                str(row['Date']),
                str(row['Item'])[:30], # Truncate long names
                str(row['Category']),
                str(row['Quantity']),
                f"${row['Price']:.2f}",
                f"${row['Total']:.2f}"
            ])
            
        # Table Style
        table = Table(data, colWidths=[80, 150, 100, 50, 60, 70])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        elements.append(table)
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
