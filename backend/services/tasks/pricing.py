import os
from datetime import datetime, timedelta, timezone
from .core import celery, supabase

# Configuration
STALE_THRESHOLD_DAYS = 60
DISCOUNT_RATE = 0.10  # 10% off
HIGH_DEMAND_WINDOW_DAYS = 7
HIGH_DEMAND_MIN_SALES = 10
LOW_STOCK_THRESHOLD = 5
PRICE_SURGE_RATE = 0.05  # 5% increase
PRICE_COOLDOWN_DAYS = 7  # Don't change price again for 7 days

@celery.task(name="tasks.adjust_prices_daily")
def adjust_prices_daily(user_id=None):
    """
    Automated Pricing Strategy:
    1. Discounts items that haven't sold in 60+ days.
    2. Increases price for low stock items with high recent demand.
    """
    print(f"Starting dynamic pricing adjustment task for user_id={user_id}")
    
    try:
        # 1. Fetch relevant item data
        # We need: id, price, quantity, date_added, price_last_update
        # And we need to derive: last_sale_date, recent_sales_count
        
        # This is complex to do purely in Supabase JS/Python client with one query
        # We will fetch items first
        items_query = supabase.table('item').select('*')
        if user_id:
            items_query = items_query.eq('user_id', user_id)
        
        items = items_query.execute().data
        
        updates_made = 0
        
        for item in items:
            item_id = item['id']
            current_price = item['price']
            quantity = item['quantity']
            date_added_str = item['date_added']
            price_last_update_str = item.get('price_last_update')
            
            # Parse dates
            # Ensure "now" is timezone-aware (UTC) to match Supabase timestamptz
            now = datetime.now(timezone.utc)
            
            # Helper to make a naive datetime aware (assume UTC) if needed
            def ensure_aware(dt):
                if dt and dt.tzinfo is None:
                    return dt.replace(tzinfo=timezone.utc)
                return dt

            date_added = ensure_aware(datetime.fromisoformat(date_added_str)) if date_added_str else now
            
            last_update = None
            if price_last_update_str:
                # Handle potential variation in timestamp format
                try:
                    # Supabase often sends 'Z', verify replacement or native handling
                    clean_str = price_last_update_str.replace('Z', '+00:00')
                    last_update = datetime.fromisoformat(clean_str)
                    last_update = ensure_aware(last_update)
                except ValueError:
                    pass
            
            # Guard: Don't change price if it was updated recently
            if last_update:
                diff = now - last_update
                if diff.days < PRICE_COOLDOWN_DAYS:
                    continue

            # Check Sales History
            # Get max sale date and count of sales in last 7 days
            sales_stats = get_item_sales_stats(item_id, window_days=HIGH_DEMAND_WINDOW_DAYS)
            last_sale_date = sales_stats['last_sale_date']
            recent_sales_count = sales_stats['recent_count']
            
            # Determine "Last Activity" (Sale or Creation)
            last_activity = last_sale_date if last_sale_date else date_added
            days_inactive = (now - last_activity).days
            
            new_price = None
            reason = ""

            # LOGIC 1: Stale Inventory (Discount)
            if days_inactive > STALE_THRESHOLD_DAYS:
                new_price = current_price * (1 - DISCOUNT_RATE)
                reason = f"Stale inventory: inactive for {days_inactive} days"

            # LOGIC 2: High Demand + Low Stock (Surge)
            # Only apply if not already discounted (stale logic takes precedence or mutual exclusion?)
            # Usually if it's stale, it's not high demand. So one or the other.
            elif quantity <= LOW_STOCK_THRESHOLD and recent_sales_count >= HIGH_DEMAND_MIN_SALES:
                new_price = current_price * (1 + PRICE_SURGE_RATE)
                reason = f"High demand ({recent_sales_count} sales/wk) & low stock"

            # Execute Update
            if new_price and new_price != current_price:
                update_price(item_id, new_price, reason)
                updates_made += 1
        
        return f"Pricing adjustment complete. Updated {updates_made} items."

    except Exception as e:
        print(f"Error in adjust_prices_daily: {e}")
        raise e

def get_item_sales_stats(item_id, window_days=7):
    """
    Returns dict: {'last_sale_date': datetime|None, 'recent_count': int}
    """
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(days=window_days)
    
    # We query sale_report for this item
    # To find last sale date
    response = supabase.table('sale_report') \
        .select('sale_date, unit_sold') \
        .eq('item_id', item_id) \
        .order('sale_date', desc=True) \
        .execute()
    
    sales = response.data
    
    last_sale_date = None
    recent_count = 0
    
    if sales:
        last_sale_str = sales[0]['sale_date']
        if last_sale_str:
             # sale_date in DB is usually just 'YYYY-MM-DD' (naive) or ISO
             try:
                dt = datetime.fromisoformat(last_sale_str)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                last_sale_date = dt
             except ValueError:
                 pass
        
        # Count sales in window
        for sale in sales:
            sale_date_str = sale['sale_date']
            if not sale_date_str: continue
            
            try:
                sale_date = datetime.fromisoformat(sale_date_str)
                if sale_date.tzinfo is None:
                    sale_date = sale_date.replace(tzinfo=timezone.utc)
                
                if sale_date >= window_start:
                    recent_count += (sale.get('unit_sold') or 0)
            except ValueError:
                continue
    
    return {
        'last_sale_date': last_sale_date,
        'recent_count': recent_count
    }

def update_price(item_id, new_price, reason):
    """
    Updates the price and logs the action
    """
    rounded_price = round(new_price, 2)
    print(f"Updating Item {item_id}: ${rounded_price} ({reason})")
    
    now_iso = datetime.utcnow().isoformat()
    
    supabase.table('item') \
        .update({
            'price': rounded_price,
            'price_last_update': now_iso # Update timestamp to prevent immediate re-adjustment
        }) \
        .eq('id', item_id) \
        .execute()
