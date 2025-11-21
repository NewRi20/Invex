from flask import Blueprint, jsonify, request
from supabase_client import supabase
from auth_decorator import token_required

business_bp = Blueprint('business_bp', __name__)

# --- PROTECTED ROUTE: Get the logged-in user's business info ---
@business_bp.route('/me', methods=['GET'])
@token_required
def get_my_business_info(current_user_id):
    try:
        response = supabase.table('business_info') \
                           .select('*') \
                           .eq('user_id', current_user_id) \
                           .maybe_single() \
                           .execute()
        
        business = response.data

        if business is None:
            return jsonify({
                'business_name': '',
                'business_address': '',
                'year_founded': '',
                'user_id': current_user_id
            }), 200
                   
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching business info', 'error': str(e)}), 500
    

# --- PROTECTED ROUTE: Create or Update the user's business info ---
@business_bp.route('/me', methods=['PUT'])
@token_required
def update_my_business_info(current_user_id):
    try:
        data = request.get_json()

        # Map React form names to database column names
        db_data = {
            'business_name': data.get('name'),
            'business_address': data.get('address'),
            'year_founded': data.get('started'),
            'user_id': current_user_id  # This is crucial
        }

        # Use upsert() to either create a new row or update the existing one
        # based on the unique 'user_id'
        response = supabase.table('business_info') \
                           .upsert(db_data, on_conflict='user_id') \
                           .execute()
        
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'message': 'Error updating business info', 'error': str(e)}), 500