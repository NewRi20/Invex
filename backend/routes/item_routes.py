from flask import Blueprint, jsonify, request
from supabase_client import supabase
from auth_decorator import token_required

item_bp = Blueprint('item_bp', __name__)

# --- Get all items (public) ---
@item_bp.route('/', methods=['GET'])
def get_items():
    try:
        # Note: .select("*, item_category(name)") fetches the category name
        response = supabase.table('item') \
                           .select('*, item_category(name)') \
                           .execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# --- Get one item by ID (public) ---
@item_bp.route('/<item_id>', methods=['GET'])
def get_item(item_id):
    try:
        response = supabase.table('item') \
                           .select('*, item_category(name)') \
                           .eq('id', item_id) \
                           .single() \
                           .execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# --- Create a new item (protected) ---
@item_bp.route('/', methods=['POST'])
@token_required
def create_item(current_user_id):
    # 'current_user_id' is available, but we don't need it
    # unless 'item' was linked to a user.
    try:
        data = request.get_json()
        
        # Add logic to check who created it
        # data['created_by_user_id'] = current_user_id
        
        response = supabase.table('item').insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# --- Update an item (protected) ---
@item_bp.route('/<item_id>', methods=['PUT'])
@token_required
def update_item(current_user_id, item_id):
    try:
        data = request.get_json()
        response = supabase.table('item') \
                           .update(data) \
                           .eq('id', item_id) \
                           .execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# --- Delete an item (protected) ---
@item_bp.route('/<item_id>', methods=['DELETE'])
@token_required
def delete_item(current_user_id, item_id):
    try:
        response = supabase.table('item') \
                           .delete() \
                           .eq('id', item_id) \
                           .execute()
        return jsonify({'message': f'Item {item_id} deleted'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500