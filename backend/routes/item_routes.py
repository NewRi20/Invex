from flask import Blueprint, jsonify, request
from extensions import cache
from supabase_client import supabase
from auth_decorator import token_required
from datetime import datetime, timezone
from services.tasks import adjust_prices_daily
import pandas as pd
import io

item_bp = Blueprint('item_bp', __name__)

MAX_FILE_SIZE = 16 * 1024 * 1024 # 16MB file limit


def normalize_user_id(user_id):
    return str(user_id).strip().lower() if user_id is not None else ''


def clear_low_stock_cache(current_user_id):
    cache.delete_memoized(_get_low_stock_items_cached, normalize_user_id(current_user_id))

@item_bp.route('/import', methods=['POST'])
@token_required
def import_items(current_user_id):
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    cache.delete_memoized(get_items, current_user_id)
    cache.delete_memoized(get_categories, current_user_id)
    clear_low_stock_cache(current_user_id)

    file = request.files['file']

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if not file.filename.lower().endswith(('.csv', '.xlsx', '.xls')):
        return jsonify({'message': 'Invalid file type. Only CSV and Excel files are allowed.'}), 400

    try:
        # 1. Read file into DataFrame
        if file.filename.lower().endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        # 2. Normalize and check required columns
        # Expected: 'item_name', 'quantity', 'price', Optional: 'category_name' or just 'category'
        # Convert user columns to lower case for leniency
        df.columns = df.columns.astype(str).str.lower().str.strip()
        
        required_cols = {'item_name', 'quantity', 'price'}
        if not required_cols.issubset(df.columns):
            return jsonify({'message': f'Missing required columns. Found: {list(df.columns)}. Required: item_name, quantity, price'}), 400

        # Handle NaNs
        df = df.fillna('')
        
        # 3. Handle Categories
        # Fetch all existing categories for user to map them
        cat_response = supabase.table('item_category').select('id, name').eq('user_id', current_user_id).execute()
        existing_categories = {row['name'].lower(): row['id'] for row in cat_response.data}

        # Identify unique new categories
        category_col = next((col for col in df.columns if 'category' in col), None)
        
        if category_col:
            # Get unique category names from file that don't exist in DB
            new_cats = set()
            for cat_name in df[category_col].unique():
                if cat_name and str(cat_name).strip() and str(cat_name).strip().lower() not in existing_categories:
                    new_cats.add(str(cat_name).strip())
            
            # Create new categories
            if new_cats:
                new_cat_objects = [{'name': name, 'user_id': current_user_id} for name in new_cats]
                # Insert and return created categories
                new_cat_res = supabase.table('item_category').insert(new_cat_objects).execute()
                for row in new_cat_res.data:
                    existing_categories[row['name'].lower()] = row['id']

        # 4. Prepare Items for Bulk Insert
        items_to_insert = []
        for _, row in df.iterrows():
            item_name = str(row['item_name']).strip()
            if not item_name:
                continue

            try:
                qty = int(float(row['quantity'])) if row['quantity'] != '' else 0
                price = float(row['price']) if row['price'] != '' else 0.0
            except ValueError:
                continue # Skip rows with bad numbers

            category_id = None
            if category_col:
                cat_val = str(row[category_col]).strip()
                if cat_val:
                    category_id = existing_categories.get(cat_val.lower())

            item_data = {
                'user_id': current_user_id,
                'item_name': item_name,
                'quantity': qty,
                'price': price,
                'item_category': category_id,
                'date_added': datetime.now(timezone.utc).isoformat()
            }
            items_to_insert.append(item_data)

        if not items_to_insert:
            return jsonify({'message': 'No valid items found to insert.'}), 400

        # 5. Bulk Insert
        # Supabase API might have limits, doing chunks of 100 just in case
        chunk_size = 100
        for i in range(0, len(items_to_insert), chunk_size):
            chunk = items_to_insert[i:i + chunk_size]
            supabase.table('item').insert(chunk).execute()

        return jsonify({'message': f'Successfully imported {len(items_to_insert)} items.'}), 201

    except Exception as e:
        return jsonify({'message': 'Error processing file', 'error': str(e)}), 500

# --- 0. Run Smart Pricing (Test Feature) ---
@item_bp.route('/run-pricing-job', methods=['POST'])
@token_required
def run_pricing_job(current_user_id):
    try:
        cache.delete_memoized(get_items, current_user_id)
        # Run directly for testing feedback
        result = adjust_prices_daily(user_id=current_user_id)
        return jsonify({'message': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- 1. Get ALL Items (Protected) ---
@item_bp.route('/', methods=['GET'])
@token_required
@cache.memoize(timeout=60)
def get_items(current_user_id):
    try:
        response = supabase.table('item') \
                           .select('*, item_category(name)') \
                           .eq('user_id', current_user_id) \
                           .execute()
        all_items = response.data
        

        sales_response = supabase.table('sale_report') \
                                 .select('item_id, unit_sold') \
                                 .eq('user_id', current_user_id) \
                                 .execute()
        
        sales_map = {}
        for sale in sales_response.data:
            i_id = sale.get('item_id')
            # If item was deleted (null), skip it
            if i_id is not None:
                sales_map[i_id] = sales_map.get(i_id, 0) + int(sale['unit_sold'])

        total_inventory_value = 0

        for item in all_items:
            quantity_str = item.get('quantity')
            price_str = item.get('price')
            
            
            def safe_float_convert(value):
                try:
                    return float(str(value).replace(',', '').strip())
                except (ValueError, TypeError):
                    return 0.0

            quantity = safe_float_convert(quantity_str)
            price = safe_float_convert(price_str)

            item['unit_sold'] = sales_map.get(item['id'], 0)
            
            if quantity > 0 and price > 0:
                total_inventory_value += quantity * price


        return jsonify({
            'items': all_items,
            'totalInventoryValue': total_inventory_value 
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching items', 'error': str(e)}), 500
    


# --- 2. Get Categories  ---
@item_bp.route('/categories', methods=['GET'])
@token_required
@cache.memoize(timeout=300)
def get_categories(current_user_id):
    try:
        response = supabase.table('item_category').select('*').execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching categories', 'error': str(e)}), 500
    

# --- 3. Update Item Price ---
@item_bp.route('/<item_id>/price', methods=['PATCH'])
@token_required
def update_item_price(current_user_id, item_id):
    try:
        cache.delete_memoized(get_items, current_user_id)
        
        data = request.get_json()
        new_price_str = data.get('price') 
        
        if new_price_str is None or new_price_str == "":
            return jsonify({'message': 'Price is required'}), 400

        new_price_num = float(new_price_str)
        
        current_item_res = supabase.table('item') \
                                   .select('price') \
                                   .eq('id', item_id) \
                                   .eq('user_id', current_user_id) \
                                   .single() \
                                   .execute()
        
        old_price = float(current_item_res.data.get('price', 0))

        update_payload = {'price': new_price_num}

        # 2. CONDITIONAL UPDATE: Only stamp date if the price is genuinely different
        if new_price_num != old_price:
            timestamp_utc = datetime.now(timezone.utc)
            # Use standard format for timestamp with time zone (timestamptz)
            update_payload['price_last_update'] = timestamp_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        # 3. Execute Update
        response = supabase.table('item') \
                           .update(update_payload) \
                           .eq('id', item_id) \
                           .eq('user_id', current_user_id) \
                           .execute()
        
        if not response.data:
             return jsonify({'message': 'Item not found or unauthorized.'}), 404
             
        return jsonify(response.data[0]), 200
        
    except ValueError:
         return jsonify({'message': 'Invalid price format. Must be a number.'}), 400
    except Exception as e:
        return jsonify({'message': 'Error updating price', 'error': str(e)}), 500
    

# --- 4. Update Stock & Damaged Quantity (PATCH) ---
@item_bp.route('/<item_id>/stock', methods=['PATCH'])
@token_required
def update_item_stock(current_user_id, item_id):
    try:
        cache.delete_memoized(get_items, current_user_id)
        clear_low_stock_cache(current_user_id)
        incoming_data = request.get_json()
        
        current_item_res = supabase.table('item') \
                                   .select('quantity, damaged_quantity') \
                                   .eq('id', item_id) \
                                   .eq('user_id', current_user_id) \
                                   .single() \
                                   .execute()
                                   
        if not current_item_res.data:
            return jsonify({'message': 'Item not found or unauthorized.'}), 404
            
        current_stock = current_item_res.data.get('quantity', 0)
        current_damaged = current_item_res.data.get('damaged_quantity', 0)

        
        stock_added = int(incoming_data.get('addStock', 0))
        damaged_removed = int(incoming_data.get('removeDamaged', 0))
        net_stock_change = stock_added - damaged_removed
        net_damaged_change = damaged_removed

        new_total_stock = current_stock + net_stock_change
        new_total_damaged = current_damaged + net_damaged_change
        
        if new_total_stock < 0:
            return jsonify({'message': 'Error: Saleable stock cannot be negative.'}), 400

        update_payload = {
            'quantity': new_total_stock,
            'damaged_quantity': new_total_damaged
        }

        response = supabase.table('item') \
                           .update(update_payload) \
                           .eq('id', item_id) \
                           .eq('user_id', current_user_id) \
                           .execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        return jsonify({'message': 'Error updating stock', 'error': str(e)}), 500
    


# --- 5. Add New Item ---
@item_bp.route('/add', methods=['POST'])
@token_required
def add_new_item(current_user_id):
    try:
        cache.delete_memoized(get_items, current_user_id)
        clear_low_stock_cache(current_user_id)
        data = request.get_json()
        timestamp_utc = datetime.now(timezone.utc)
        item_record = {
            'item_name': data.get('name'),
            'item_category': int(data.get('category_id', 0)), 
            'quantity': int(data.get('quantity', 0)),
            'price': float(data.get('price', 0)),
            'damaged_quantity': 0,
            'user_id': current_user_id,
            'price_last_update': timestamp_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
        
        response = supabase.table('item').insert(item_record).execute()
        
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({'message': 'Error adding item', 'error': str(e)}), 500



# --- 6. Update Item Details (PATCH: Rename/Category/Price) ---
@item_bp.route('/<item_id>', methods=['PATCH'])
@token_required
def update_item_details(current_user_id, item_id):
    try:
        cache.delete_memoized(get_items, current_user_id)
        clear_low_stock_cache(current_user_id)
        data = request.get_json()
        
        updatable_fields = ['item_name', 'item_category', 'price', 'quantity', 'damaged_quantity']
        payload = {k: v for k, v in data.items() if k in updatable_fields}

        if 'price' in payload:
            timestamp_utc = datetime.now(timezone.utc)
            payload['price_last_update'] = timestamp_utc.strftime('%Y-%m-%dT%H:%M:%SZ') 

        response = supabase.table('item') \
                           .update(payload) \
                           .eq('id', item_id) \
                           .eq('user_id', current_user_id) \
                           .execute()
        
        if not response.data:
            return jsonify({'message': 'Item not found or unauthorized.'}), 404
        
        return jsonify(response.data[0]), 200
    except Exception as e:
        return jsonify({'message': 'Error updating item details', 'error': str(e)}), 500


# --- 7. Delete Item (DELETE) ---
@item_bp.route('/<item_id>', methods=['DELETE'])
@token_required
def delete_item(current_user_id, item_id):
    try:
        cache.delete_memoized(get_items, current_user_id)
        clear_low_stock_cache(current_user_id)
        response = supabase.table('item') \
                           .delete() \
                           .eq('id', item_id) \
                           .eq('user_id', current_user_id) \
                           .execute()
        
        return jsonify({'message': f'Item {item_id} deleted.'}), 200
    except Exception as e:
        return jsonify({'message': 'Error deleting item', 'error': str(e)}), 500


# --- 8. Add New Category (POST) ---
@item_bp.route('/categories', methods=['POST'])
@token_required
def add_new_category(current_user_id):
    try:
        cache.delete_memoized(get_categories, current_user_id)
        data = request.get_json()
        category_name = data.get('name')

        if not category_name:
            return jsonify({'message': 'Category name is required.'}), 400

        response = supabase.table('item_category').insert({'name': category_name}).execute()
        
        # Return the new category object
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({'message': 'Error adding category', 'error': str(e)}), 500
    

# --- 9. Delete Category (DELETE) ---
@item_bp.route('/categories/<category_id>', methods=['DELETE'])
@token_required
def delete_category(current_user_id, category_id):
    try:
        cache.delete_memoized(get_categories, current_user_id)
        cache.delete_memoized(get_items, current_user_id)

        
        # Check if the category exists and perform deletion
        response = supabase.table('item_category') \
                           .delete() \
                           .eq('id', category_id) \
                           .execute()
        
        if not response.data:
            return jsonify({'message': 'Category not found.'}), 404
        
        # Database automatically sets item.item_category to NULL (due to ON DELETE SET NULL)
        
        return jsonify({'message': f'Category {category_id} deleted. Items were unlinked.'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Error deleting category', 'error': str(e)}), 500
    
# Newly added modification: Clear low stock cache when categories are updated, since category changes can affect low stock item listings. 
# This is done in the add_new_category and delete_category routes by calling clear_low_stock_cache(current_user_id) after modifying categories.
# --- Get Low Stock Items ---
@cache.memoize(timeout=60)
def _get_low_stock_items_cached(normalized_user_id):
    try:
        response = supabase.table('item') \
                           .select('item_name, quantity') \
                           .eq('user_id', normalized_user_id) \
                           .lte('quantity', 5) \
                           .order('quantity') \
                           .limit(6) \
                           .execute()
        
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching low stock list', 'error': str(e)}), 500


@item_bp.route('/low-stock', methods=['GET'])
@token_required
def get_low_stock_items(current_user_id):
    normalized_user_id = normalize_user_id(current_user_id)
    return _get_low_stock_items_cached(normalized_user_id)
    
