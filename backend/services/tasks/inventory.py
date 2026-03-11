import os
import requests
import smtplib
from collections import defaultdict
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from .core import celery, supabase

LOW_STOCK_THRESHOLD = int(os.environ.get('LOW_STOCK_THRESHOLD', 10))
DISCORD_WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL')

@celery.task(name="tasks.generate_restock_reminder")
def generate_restock_reminder(user_email=None, user_id=None):
    """
    Analyzes inventory levels and sends a weekly restock guide
    containing items falling below the threshold.
    """
    print(f"Generating restock reminder for user_id={user_id}, email={user_email}")
    
    try:
        # 1. Fetch items
        items = fetch_items_needing_restock(user_id)
        
        if not items:
            print("Inventory is healthy. No restock needed.")
            return "Inventory healthy. No email sent."

        # 2. Format as a shopping list
        email_body = format_restock_email_body(items)
        discord_msg = format_restock_discord_msg(items)
        
        # 3. Send Notification
        notification_sent = False
        target_email = user_email or ADMIN_EMAIL
        
        if target_email:
            send_restock_email(target_email, email_body, len(items))
            notification_sent = True
        
        if DISCORD_WEBHOOK_URL:
            send_discord_alert(discord_msg)
            notification_sent = True
            
        if notification_sent:
            return f"Restock reminder sent for {len(items)} items."
        else:
            print("Items need restock, but no EMAIL or DISCORD_WEBHOOK_URL configured.")
            return "Items found, no alert sent."

    except Exception as e:
        print(f"Error in generate_restock_reminder: {e}")
        # raise rule so celery sees failure
        raise e

def fetch_items_needing_restock(user_id=None):
    if not supabase:
        raise Exception("Supabase client not initialized")
    
    # Selecting item_category(name) relies on foreign key relation
    query = supabase.table('item') \
        .select('item_name, quantity, user_id, item_category(name)') \
        .lt('quantity', LOW_STOCK_THRESHOLD) \
        .order('quantity')  # Sort by lowest stock first
    
    if user_id:
        query = query.eq('user_id', user_id)
        
    response = query.execute()
    return response.data

def format_restock_email_body(items):
    # Group by category for a better shopping list experience
    by_category = defaultdict(list)
    for item in items:
        cat_data = item.get('item_category')
        cat_name = "Uncategorized"
        if isinstance(cat_data, dict):
            cat_name = cat_data.get('name', 'Uncategorized')
        by_category[cat_name].append(item)

    lines = ["Here is your Weekly Restock Guide.", ""]
    lines.append(f"We noticed the following {len(items)} items are running low. We recommend restocking them soon:")
    lines.append("")

    for category, cat_items in sorted(by_category.items()):
        lines.append(f"--- {category} ---")
        for item in cat_items:
            # Simple checkbox style for readability
            lines.append(f"[ ] {item['item_name']} (Current: {item['quantity']})")
        lines.append("")
    
    lines.append("Tip: Keeping your inventory stocked prevents missed sales opportunities.")
    return "\n".join(lines)

def format_restock_discord_msg(items):
    # Keep discord message shorter
    return f"**Weekly Restock Alert**\n{len(items)} items are below threshold. Check your email for the detailed shopping list."

def send_restock_email(to_email, body_text, item_count):
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    sender_email = os.environ.get('SMTP_EMAIL')
    sender_password = os.environ.get('SMTP_PASSWORD')

    if not sender_email or not sender_password:
        print("Missing SMTP_EMAIL or SMTP_PASSWORD. Cannot send email.")
        return

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = f"Invex: Weekly Restock Guide ({item_count} items)"
    
    msg.attach(MIMEText(body_text, 'plain'))
    
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print(f"Restock email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send restock email: {e}")

def send_discord_alert(message_text):
    if not DISCORD_WEBHOOK_URL:
        return
    try:
        payload = {"content": message_text}
        resp = requests.post(DISCORD_WEBHOOK_URL, json=payload)
        resp.raise_for_status()
        print("Discord notification sent.")
    except Exception as e:
        print(f"Failed to send Discord webhook: {e}")
