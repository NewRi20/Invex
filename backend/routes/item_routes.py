from flask import Blueprint, jsonify, request
from supabase_client import supabase
from auth_decorator import token_required
from datetime import datetime

item_bp = Blueprint('item_bp', __name__)

# --- 1. Get ALL Items (Protected) ---
@item_bp.route('/', methods=['GET'])
@token_required
def get_items(current_user_id):
    try:
        # Fetch all items for this user
        # We also fetch the LINKED category name using the foreign key
        # Syntax: column, link_table(column)
        response = supabase.table('item') \
                           .select('*, item_category(name)') \
                           .eq('user_id', current_user_id) \
                           .execute()
        
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching items', 'error': str(e)}), 500

# --- 2. Get Categories  ---
@item_bp.route('/categories', methods=['GET'])
@token_required
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
        data = request.get_json()
        new_price_str = data.get('price') # Price comes as a string from frontend input
        
        if new_price_str is None or new_price_str == "":
            return jsonify({'message': 'Price is required'}), 400

        new_price_num = float(new_price_str)
        
        update_payload = {
            'price': new_price_num,
            'price_last_update': datetime.now().date().isoformat()
        }
        
        # Update the price in the database
        response = supabase.table('item') \
                           .update(update_payload) \
                           .eq('id', item_id) \
                           .eq('user_id', current_user_id) \
                           .execute()
        
        return jsonify(response.data), 200
    
    except ValueError:
         return jsonify({'message': 'Invalid price format. Must be a number.'}), 400
    except Exception as e:
        return jsonify({'message': 'Error updating price', 'error': str(e)}), 500
    

# --- 4. Update Stock & Damaged Quantity (PATCH) ---
@item_bp.route('/<item_id>/stock', methods=['PATCH'])
@token_required
def update_item_stock(current_user_id, item_id):
    try:
        # 1. Get incoming data from the frontend
        incoming_data = request.get_json()
        
        # Fetching the current state first
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

        #Extracting inputs from the frontend payload (assumes keys from React component)
        stock_added = int(incoming_data.get('addStock', 0))
        damaged_removed = int(incoming_data.get('removeDamaged', 0))
        
        # Calculate New Values based on your business logic
        net_stock_change = stock_added - damaged_removed
        
        # B. Damaged Quantity Change: Add new damaged items
        net_damaged_change = damaged_removed # We assume the input is the NEW TOTAL to add to damaged count
        
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
        data = request.get_json()
        
        # 1. Map input names to DB names (assuming React sends name, category_id, quantity, price, etc.)
        # The frontend will be updated to send the category ID, not the name.
        item_record = {
            'item_name': data.get('name'),
            'item_category': int(data.get('category_id', 0)), 
            'quantity': int(data.get('quantity', 0)),
            'price': float(data.get('price', 0)),
            'damaged_quantity': 0,
            'user_id': current_user_id
        }
        
        # 2. Insert into the item table
        response = supabase.table('item').insert(item_record).execute()
        
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({'message': 'Error adding item', 'error': str(e)}), 500



# --- 6. Update Item Details (PATCH: Rename/Category/Price) ---
@item_bp.route('/<item_id>', methods=['PATCH'])
@token_required
def update_item_details(current_user_id, item_id):
    try:
        data = request.get_json()
        # Ensure only updatable fields are passed
        updatable_fields = ['item_name', 'item_category', 'quantity', 'damaged_quantity']
        payload = {k: v for k, v in data.items() if k in updatable_fields}

        if not payload:
            return jsonify({'message': 'No valid fields provided for update.'}), 400
        
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
    

# --- Get Low Stock Items ---
@item_bp.route('/low-stock', methods=['GET'])
@token_required
def get_low_stock_items(current_user_id):
    try:
        # Define the low stock threshold (e.g., quantity <= 5)
        response = supabase.table('item') \
                           .select('item_name, quantity') \
                           .eq('user_id', current_user_id) \
                           .lte('quantity', 5) \
                           .order('quantity') \
                           .limit(6) \
                           .execute()
        
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching low stock list', 'error': str(e)}), 500