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
    # Simple, robust PDF generator with optional Unicode TTF font for peso sign
    from reportlab.lib.units import inch
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    # Candidate font paths to try (common locations)
    candidate_paths = [
        os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'DejaVuSans.ttf'),
        os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'Arial.ttf'),
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
    ]

    # Allow explicit override via env var REPORT_FONT_PATH
    env_font = os.environ.get('REPORT_FONT_PATH')
    if env_font:
        candidate_paths.insert(0, env_font)

    unicode_font_name = None
    for p in candidate_paths:
        try:
            if p and os.path.exists(p):
                font_key = 'ReportSans'
                pdfmetrics.registerFont(TTFont(font_key, p))
                unicode_font_name = font_key
                break
        except Exception:
            continue

    # If no TTF found, leave unicode_font_name as None and fallback to built-ins

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

    # Summary block (plain text; no HTML)
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
        s = styles['Normal'].clone('s')
        s.spaceAfter = 4
        if unicode_font_name:
            s.fontName = unicode_font_name
        if is_bold:
            s.fontName = unicode_font_name or 'Helvetica-Bold'
        elements.append(Paragraph(text, s))

    elements.append(Spacer(1, 20))

    # Table of transactions
    if not df.empty:
        headers = ['Date', 'Item', 'Category', 'Qty', 'Price', 'Cost', 'Revenue', 'Profit']
        data = [headers]
        for _, row in df.iterrows():
            data.append([
                str(row['Date'])[:10],
                str(row['Item'])[:25],
                str(row['Category'])[:15],
                str(int(row['Quantity'])),
                fmt_currency(row['Price']),
                fmt_currency(row['Cost']),
                fmt_currency(row['Revenue']),
                fmt_currency(row['Profit'])
            ])

        colWidths = [70, 120, 80, 40, 50, 50, 60, 60]
        table = Table(data, colWidths=colWidths)

        # Base table style
        base_font = unicode_font_name or 'Helvetica'
        header_font = unicode_font_name or 'Helvetica-Bold'

        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), header_font),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('FONTNAME', (0, 1), (-1, -1), base_font),
        ]))

        elements.append(table)
    else:
        empty_style = styles['Normal'].clone('empty')
        if unicode_font_name:
            empty_style.fontName = unicode_font_name
        elements.append(Paragraph("No sales data recorded for this period.", empty_style))

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
