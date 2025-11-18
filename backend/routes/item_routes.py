from flask import Blueprint, jsonify, request
from supabase_client import supabase
from auth_decorator import token_required

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

# --- 2. Get Categories (Public/Protected) ---
# We use token_required just to be safe, though the data is generic
@item_bp.route('/categories', methods=['GET'])
@token_required
def get_categories(current_user_id):
    try:
        response = supabase.table('item_category').select('*').execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching categories', 'error': str(e)}), 500