from flask import Blueprint, jsonify, request
from supabase_client import supabase
from auth_decorator import token_required
from datetime import datetime, timedelta

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/sales', methods=['GET'])
@token_required
def get_sales_report(current_user_id):
    try:
        # 1. Get the time filter (default to 'day')
        time_filter = request.args.get('filter', 'day')
        
        # Calculate the start date based on filter
        today = datetime.now().date()
        if time_filter == 'week':
            start_date = today - timedelta(days=7)
        elif time_filter == 'month':
            start_date = today - timedelta(days=30)
        else: # 'day'
            start_date = today

        # 2. Fetch Sales Data (Fixed Join Syntax to be simpler)
        # We join with 'item' table to get price and name, and 'item_category' for category name
        response = supabase.table('sale_report') \
                           .select('*, item(id, item_name, price, item_category(name))') \
                           .eq('user_id', current_user_id) \
                           .gte('sale_date', start_date.isoformat()) \
                           .execute()
        
        sales_data = response.data
        
        # 3. Calculate Metrics (This logic is now highly robust and simplified)
        total_items_sold = 0
        total_revenue = 0
        item_agg = {} 
        cat_agg = {} 

        for sale in sales_data:
            units = sale['unit_sold']
            item_info = sale.get('item') # This will be the joined item object

            # --- CRITICAL FIX: Graceful handling of missing/deleted item ---
            if not item_info or item_info.get('price') is None:
                # If the item doesn't exist, we skip revenue calculation
                item_name_key = 'UNLISTED ITEM'
                revenue = 0
                category = 'Uncategorized'
            else:
                price = item_info['price']
                name = item_info['item_name']
                category_obj = item_info.get('item_category') 
                category = category_obj.get('name') if category_obj and category_obj.get('name') else 'Uncategorized'
                revenue = units * price
                item_name_key = name
            # ----------------------------------------------------------------------------

            # Global Totals
            total_items_sold += units
            total_revenue += revenue

            # Aggregate by Item (Now using item_name_key)
            if item_name_key not in item_agg:
                item_agg[item_name_key] = {'name': item_name_key, 'unitSold': 0, 'revenue': 0}
            item_agg[item_name_key]['unitSold'] += units
            item_agg[item_name_key]['revenue'] += revenue

            # Aggregate by Category (Skip aggregation for unlisted/deleted items)
            if category != 'Uncategorized':
                if category not in cat_agg:
                    cat_agg[category] = {'name': category, 'unitSold': 0, 'revenue': 0}
                cat_agg[category]['unitSold'] += units
                cat_agg[category]['revenue'] += revenue

        # 4. Sort Top Lists (correct)
        top_items = sorted(item_agg.values(), key=lambda x: x['revenue'], reverse=True)
        top_categories = sorted(cat_agg.values(), key=lambda x: x['revenue'], reverse=True)

        # Add ranks
        for i, item in enumerate(top_items): item['rank'] = i + 1
        for i, cat in enumerate(top_categories): cat['rank'] = i + 1

        return jsonify({
            'total_items_sold': total_items_sold,
            'total_revenue': total_revenue,
            'top_items': top_items[:5],
            'top_categories': top_categories[:5],
            'raw_sales': sales_data 
        }), 200

    except Exception as e:
        # We need to print the error in the server log to debug it!
        print("--- SALES REPORT CRASH TRACE ---")
        print(e)
        print("-------------------------------")
        return jsonify({'message': 'Error generating report: Server Crash', 'detail': str(e)}), 500
    

# In backend/routes/report_routes.py
@report_bp.route('/sales', methods=['POST'])
@token_required
def add_sale(current_user_id):
    try:
        data = request.get_json()
        item_id = data.get('item_id')
        quantity_sold = int(data.get('quantity'))

        if not item_id or not quantity_sold:
            return jsonify({'message': 'Item and Quantity are required'}), 400

        # 1. Fetch current item details to check stock
        # (This line will crash if item_id is a string but DB expects bigint, but we'll assume it's fixed)
        item_res = supabase.table('item') \
                           .select('quantity') \
                           .eq('id', item_id) \
                           .single() \
                           .execute()
        
        item = item_res.data
        current_stock = item['quantity']

        # 2. Validate Stock
        if current_stock < quantity_sold:
            return jsonify({'message': f'Not enough stock! Only {current_stock} left.'}), 400

        # 3. Record the Sale FIRST (Keep history)
        sale_record = {
            'user_id': current_user_id,
            'item_id': item_id,
            'unit_sold': quantity_sold,
        }
        sale_response = supabase.table('sale_report').insert(sale_record).execute()

        # 4. Calculate New Quantity
        new_quantity = current_stock - quantity_sold

        # 5. Logic: UPDATE quantity (REMOVED DELETE LOGIC)
        supabase.table('item') \
                 .update({'quantity': new_quantity}) \
                 .eq('id', item_id) \
                 .execute()
        
        message = "Sale recorded and stock updated."

        return jsonify({'message': message, 'sale': sale_response.data}), 201

    except Exception as e:
        # Since we removed the complex logic, the crash is now highly likely RLS or schema.
        return jsonify({'message': 'Error recording sale: Internal Server Error', 'detail': str(e)}), 500