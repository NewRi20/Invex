from flask import Blueprint, jsonify, request
from supabase_client import supabase
from auth_decorator import token_required
from datetime import datetime, timedelta

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/sales', methods=['GET'])
@token_required
def get_sales_report(current_user_id):
    try:

        time_filter = request.args.get('filter', 'day')
        today = datetime.now().date()
        if time_filter == 'week':
            start_date = today - timedelta(days=7)
        elif time_filter == 'month':
            start_date = today - timedelta(days=30)
        else: # 'day'
            start_date = today

        # Fetch Sales Data (Fixed Join Syntax to be simpler)
        response = supabase.table('sale_report') \
                           .select('*, item(id, item_name, price, item_category(name))') \
                           .eq('user_id', current_user_id) \
                           .gte('sale_date', start_date.isoformat()) \
                           .execute()
        
        sales_data = response.data
        
        # Metrics
        total_items_sold = 0
        total_revenue = 0
        item_agg = {} 
        cat_agg = {} 

        for sale in sales_data:
            units = int(sale['unit_sold'])
            item_info = sale.get('item') 

            if not item_info or item_info.get('price') is None:
                item_name_key = 'UNLISTED ITEM'
                revenue = 0
                category = 'Uncategorized'
            else:
                price = float(item_info['price'])
                name = item_info['item_name']
                category_obj = item_info.get('item_category') 
                category = category_obj.get('name') if category_obj and category_obj.get('name') else 'Uncategorized'
                revenue = units * price
                item_name_key = name

            # Global Totals
            total_items_sold += units
            total_revenue += revenue

            # Aggregate by Item (Now using item_name_key)
            if item_name_key not in item_agg:
                item_agg[item_name_key] = {'name': item_name_key, 'unitSold': 0, 'revenue': 0}
            item_agg[item_name_key]['unitSold'] += units
            item_agg[item_name_key]['revenue'] += revenue

            # Aggregate by Category (Skip aggregation for unlisted/deleted items)
            if category != 'UNLISTED ITEM':
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
        print("--- SALES REPORT CRASH TRACE ---")
        print(e)
        print("-------------------------------")
        return jsonify({'message': 'Error generating report: Server Crash', 'detail': str(e)}), 500
    

@report_bp.route('/sales', methods=['POST'])
@token_required
def add_sale(current_user_id):
    try:
        data = request.get_json()
        item_id = data.get('item_id')
        quantity_sold = int(data.get('quantity'))

        if not item_id or not quantity_sold:
            return jsonify({'message': 'Item and Quantity are required'}), 400

        item_res = supabase.table('item') \
                           .select('quantity') \
                           .eq('id', item_id) \
                           .single() \
                           .execute()
        
        item = item_res.data
        current_stock = item['quantity']

        
        if current_stock < quantity_sold:
            return jsonify({'message': f'Not enough stock! Only {current_stock} left.'}), 400

        sale_record = {
            'user_id': current_user_id,
            'item_id': item_id,
            'unit_sold': quantity_sold,
        }
        sale_response = supabase.table('sale_report').insert(sale_record).execute()

        new_quantity = current_stock - quantity_sold

        
        supabase.table('item') \
                 .update({'quantity': new_quantity}) \
                 .eq('id', item_id) \
                 .execute()
        
        message = "Sale recorded and stock updated."

        return jsonify({'message': message, 'sale': sale_response.data}), 201

    except Exception as e:
        return jsonify({'message': 'Error recording sale: Internal Server Error', 'detail': str(e)}), 500
    


# --- Delete Sale Stock Record ---
@report_bp.route('/<sale_id>', methods=['DELETE'])
@token_required
def delete_sale(current_user_id, sale_id):
    try:

        sale_res = supabase.table('sale_report') \
                           .select('*, item(quantity)') \
                           .eq('id', sale_id) \
                           .eq('user_id', current_user_id) \
                           .single() \
                           .execute()
                           
        sale_data = sale_res.data
        if not sale_data:
            return jsonify({'message': 'Sale record not found or unauthorized.'}), 404

        item_id = sale_data.get('item_id')
        units_sold = sale_data['unit_sold']
        
        
        item_stock = sale_data['item']['quantity'] if sale_data.get('item') else None
        
        
        supabase.table('sale_report') \
                .delete() \
                .eq('id', sale_id) \
                .execute()
        
        # 3. Restore Stock (if the item still exists in the inventory master table)
        if item_stock is not None:
            new_quantity = item_stock + units_sold
            
            supabase.table('item') \
                    .update({'quantity': new_quantity}) \
                    .eq('id', item_id) \
                    .execute()
        
        return jsonify({'message': f'Sale transaction {sale_id} deleted and stock restored.'}), 200

    except Exception as e:
        return jsonify({'message': 'Error deleting sale', 'error': str(e)}), 500
    

# --- Edit Sale Stock Record ---
@report_bp.route('/<sale_id>', methods=['PATCH'])
@token_required
def edit_sale_quantity(current_user_id, sale_id):
    try:
        data = request.get_json()
        new_units_sold = int(data.get('unit_sold'))
        
        if new_units_sold is None:
            return jsonify({'message': 'New unit_sold quantity is required.'}), 400


        sale_res = supabase.table('sale_report') \
                           .select('unit_sold, item_id, item(quantity)') \
                           .eq('id', sale_id) \
                           .eq('user_id', current_user_id) \
                           .single() \
                           .execute()
                           
        sale_data = sale_res.data
        if not sale_data:
            return jsonify({'message': 'Sale record not found or unauthorized.'}), 404

        item_id = sale_data.get('item_id')
        original_units_sold = sale_data['unit_sold']
        item_stock = sale_data['item']['quantity'] if sale_data.get('item') else None
        
        
        stock_delta = new_units_sold - original_units_sold
        
        # 3. Validate Stock (Ensure we don't go negative if increasing units sold)
        if item_stock is not None and item_stock - stock_delta < 0:
            return jsonify({'message': 'Error: Cannot reduce stock below zero (Only non-sale stock can be adjusted).'}), 400
            
        # 4. Update the Sale Record
        supabase.table('sale_report') \
                .update({'unit_sold': new_units_sold}) \
                .eq('id', sale_id) \
                .execute()
        
        # 5. Adjust Inventory Stock
        if item_stock is not None:
            new_quantity = item_stock - stock_delta # Subtract the net change (e.g., old was 10, new is 8, delta is -2. stock becomes stock - (-2) = stock + 2)
            
            supabase.table('item') \
                    .update({'quantity': new_quantity}) \
                    .eq('id', item_id) \
                    .execute()
        
        return jsonify({'message': f'Sale transaction {sale_id} updated and stock adjusted.'}), 200

    except Exception as e:
        return jsonify({'message': 'Error updating sale', 'error': str(e)}), 500