import os
import smtplib
from datetime import datetime, timezone, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from .core import celery, supabase


@celery.task(name="tasks.send_daily_report")
def send_daily_report(user_email, user_id=None):
    """
    Generates and sends a daily summary email containing:
    - Low stock items
    - Sales made today
    - New items added today
    """
    print(f"Generating daily report for {user_email}, user_id={user_id}")

    try:
        low_stock_items = _fetch_low_stock(user_id)
        today_sales = _fetch_today_sales(user_id)
        new_items_today = _fetch_new_items_today(user_id)

        html_body = _build_daily_report_html(low_stock_items, today_sales, new_items_today)

        _send_daily_email(user_email, html_body)

        return f"Daily report sent to {user_email}"

    except Exception as e:
        print(f"Error in send_daily_report: {e}")
        raise e


def _fetch_low_stock(user_id):
    threshold = int(os.environ.get('LOW_STOCK_THRESHOLD', 10))
    query = supabase.table('item') \
        .select('item_name, quantity, item_category(name)') \
        .lt('quantity', threshold) \
        .order('quantity')

    if user_id:
        query = query.eq('user_id', user_id)

    return query.execute().data


def _fetch_today_sales(user_id):
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    query = supabase.table('sale_report') \
        .select('unit_sold, sale_date, item(item_name, price)') \
        .gte('sale_date', start_of_day)

    if user_id:
        query = query.eq('user_id', user_id)

    return query.execute().data


def _fetch_new_items_today(user_id):
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    query = supabase.table('item') \
        .select('item_name, quantity, price, item_category(name)') \
        .gte('date_added', start_of_day)

    if user_id:
        query = query.eq('user_id', user_id)

    return query.execute().data


def _build_daily_report_html(low_stock_items, today_sales, new_items_today):
    today_str = datetime.now().strftime('%B %d, %Y')

    # Calculate sales totals
    total_units = sum(int(s.get('unit_sold', 0)) for s in today_sales)
    total_revenue = 0
    for s in today_sales:
        item_info = s.get('item') or {}
        price = float(item_info.get('price', 0))
        qty = int(s.get('unit_sold', 0))
        total_revenue += price * qty

    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background: #1a1a2e; color: #ffffff; padding: 24px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 22px; }}
            .header p {{ margin: 6px 0 0; color: #a0a0c0; font-size: 13px; }}
            .section {{ padding: 20px 24px; }}
            .section h2 {{ font-size: 16px; color: #1a1a2e; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-top: 0; }}
            table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
            th {{ background: #f8f8fa; text-align: left; padding: 8px 10px; color: #555; font-weight: 600; }}
            td {{ padding: 8px 10px; border-bottom: 1px solid #f0f0f0; }}
            .low {{ color: #e74c3c; font-weight: bold; }}
            .badge {{ display: inline-block; background: #e74c3c; color: white; border-radius: 12px; padding: 2px 10px; font-size: 12px; font-weight: bold; }}
            .badge-green {{ background: #27ae60; }}
            .badge-blue {{ background: #2980b9; }}
            .summary {{ display: flex; gap: 12px; margin-bottom: 16px; }}
            .stat-box {{ flex: 1; background: #f8f8fa; border-radius: 8px; padding: 12px; text-align: center; }}
            .stat-box .num {{ font-size: 24px; font-weight: bold; color: #1a1a2e; }}
            .stat-box .label {{ font-size: 11px; color: #888; margin-top: 4px; }}
            .footer {{ background: #f8f8fa; padding: 16px 24px; text-align: center; color: #999; font-size: 11px; }}
            .empty {{ color: #999; font-style: italic; padding: 12px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Invex Daily Report</h1>
                <p>{today_str}</p>
            </div>

            <div class="section">
                <table style="width:100%; border:none;">
                    <tr>
                        <td style="text-align:center; border:none; padding:12px;">
                            <div style="font-size:24px; font-weight:bold; color:#e74c3c;">{len(low_stock_items)}</div>
                            <div style="font-size:11px; color:#888; margin-top:4px;">Low Stock Items</div>
                        </td>
                        <td style="text-align:center; border:none; padding:12px;">
                            <div style="font-size:24px; font-weight:bold; color:#27ae60;">{total_units}</div>
                            <div style="font-size:11px; color:#888; margin-top:4px;">Units Sold Today</div>
                        </td>
                        <td style="text-align:center; border:none; padding:12px;">
                            <div style="font-size:24px; font-weight:bold; color:#2980b9;">{len(new_items_today)}</div>
                            <div style="font-size:11px; color:#888; margin-top:4px;">New Items Today</div>
                        </td>
                    </tr>
                </table>
            </div>
    """

    # Low Stock Section
    html += '<div class="section"><h2>⚠️ Low Stock Items <span class="badge">' + str(len(low_stock_items)) + '</span></h2>'
    if low_stock_items:
        html += '<table><tr><th>Item</th><th>Category</th><th>Qty Left</th></tr>'
        for item in low_stock_items:
            cat = item.get('item_category')
            cat_name = cat.get('name', 'Uncategorized') if isinstance(cat, dict) else 'Uncategorized'
            qty = item.get('quantity', 0)
            qty_class = ' class="low"' if qty <= 5 else ''
            html += f'<tr><td>{item["item_name"]}</td><td>{cat_name}</td><td{qty_class}>{qty}</td></tr>'
        html += '</table>'
    else:
        html += '<p class="empty">All items are well-stocked. 🎉</p>'
    html += '</div>'

    # Sales Today Section
    html += '<div class="section"><h2>💰 Sales Today <span class="badge badge-green">' + f"₱{total_revenue:,.2f}" + '</span></h2>'
    if today_sales:
        html += '<table><tr><th>Item</th><th>Qty Sold</th><th>Revenue</th></tr>'
        for sale in today_sales:
            item_info = sale.get('item') or {}
            name = item_info.get('item_name', 'Unknown')
            price = float(item_info.get('price', 0))
            qty = int(sale.get('unit_sold', 0))
            rev = price * qty
            html += f'<tr><td>{name}</td><td>{qty}</td><td>₱{rev:,.2f}</td></tr>'
        html += '</table>'
    else:
        html += '<p class="empty">No sales recorded today yet.</p>'
    html += '</div>'

    # New Items Section
    html += '<div class="section"><h2>🆕 New Items Today <span class="badge badge-blue">' + str(len(new_items_today)) + '</span></h2>'
    if new_items_today:
        html += '<table><tr><th>Item</th><th>Category</th><th>Qty</th><th>Price</th></tr>'
        for item in new_items_today:
            cat = item.get('item_category')
            cat_name = cat.get('name', 'Uncategorized') if isinstance(cat, dict) else 'Uncategorized'
            price = float(item.get('price', 0))
            html += f'<tr><td>{item["item_name"]}</td><td>{cat_name}</td><td>{item.get("quantity", 0)}</td><td>₱{price:,.2f}</td></tr>'
        html += '</table>'
    else:
        html += '<p class="empty">No new items added today.</p>'
    html += '</div>'

    html += """
            <div class="footer">
                This report was automatically generated by Invex. Do not reply to this email.
            </div>
        </div>
    </body>
    </html>
    """

    return html


def _send_daily_email(to_email, html_body):
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    sender_email = os.environ.get('SMTP_EMAIL')
    sender_password = os.environ.get('SMTP_PASSWORD')

    if not sender_email or not sender_password:
        print("Missing SMTP_EMAIL or SMTP_PASSWORD. Cannot send daily report email.")
        return

    sender_password = sender_password.replace(' ', '')
    today_str = datetime.now().strftime('%b %d, %Y')

    msg = MIMEMultipart('alternative')
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = f"Invex Daily Report — {today_str}"

    # Plain text fallback
    plain = "Your Invex Daily Report is ready. Please view this email in an HTML-compatible client."
    msg.attach(MIMEText(plain, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print(f"Daily report email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send daily report email: {e}")
