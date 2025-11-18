# routes/user_routes.py
from flask import Blueprint, jsonify, request
from supabase_client import supabase
from auth_decorator import token_required

# Create a 'Blueprint'
# This is like a mini-Flask-app for just user routes
user_bp = Blueprint('user_bp', __name__)

# --- PROTECTED ROUTE: Get the logged-in user's profile ---
# This is the one you will use most.
@user_bp.route('/me', methods=['GET'])
@token_required  # <-- This secures the route
def get_my_profile(current_user_id):
    # current_user_id is passed from the @token_required decorator
    try:
        # Fetch from your 'user' table
        response = supabase.table('user') \
                           .select('*') \
                           .eq('id', current_user_id) \
                           .single() \
                           .execute()

        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching profile', 'error': str(e)}), 500

# --- PUBLIC ROUTE: Get a specific user's profile by their ID ---
@user_bp.route('/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    try:
        response = supabase.table('user') \
                           .select('id, first_name, last_name') \
                           .eq('id', user_id) \
                           .single() \
                           .execute()
        
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching user', 'error': str(e)}), 500

# --- PUBLIC ROUTE: Get all users ---
@user_bp.route('/', methods=['GET'])
def get_all_users():
    try:
        response = supabase.table('user') \
                           .select('id, first_name, last_name, home_address, birthday') \
                           .execute() 
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching users', 'error': str(e)}), 500
    

# --- PROTECTED ROUTE: Update the logged-in user's profile ---
@user_bp.route('/me', methods=['PUT'])
@token_required  # <-- Secures the route
def update_my_profile(current_user_id):
    try:
        profile_data = request.get_json()
        response = supabase.table('user') \
                           .update(profile_data) \
                           .eq('id', current_user_id) \
                           .execute()

        return jsonify(response.data), 200

    except Exception as e:
        return jsonify({'message': 'Error updating profile', 'error': str(e)}), 500
    
@user_bp.route('/me', methods=['PUT'])
@token_required 
def update_business_info(current_user_id):
    try:
        business_data = request.get_json()
        response = supabase.table('user') \
                           .update(business_data) \
                           .eq('id', current_user_id) \
                           .execute()

        return jsonify(response.data), 200

    except Exception as e:
        return jsonify({'message': 'Error updating business info', 'error': str(e)}), 500