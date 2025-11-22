import os
from functools import wraps
from flask import request, jsonify
from supabase_client import supabase

# We no longer need the 'jwt' library or the 'JWT_SECRET'

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check for Authorization header (case-insensitive)
        auth_header = request.headers.get('Authorization') or request.headers.get('authorization')
        
        if auth_header:
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            user_response = supabase.auth.get_user(token)
            
            # Handle different response formats from Supabase client
            current_user = None
            if hasattr(user_response, 'user'):
                current_user = user_response.user
            elif hasattr(user_response, 'data') and hasattr(user_response.data, 'user'):
                current_user = user_response.data.user
            elif isinstance(user_response, dict) and 'user' in user_response:
                current_user = user_response['user']
            
            if not current_user:
                return jsonify({'message': 'User not found or token invalid!'}), 401
            
            # Get user ID
            user_id = current_user.id if hasattr(current_user, 'id') else current_user.get('id')
            if not user_id:
                return jsonify({'message': 'User ID not found!'}), 401
                 
        except Exception as e:
            # This will catch expired tokens or other auth errors
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        # Pass the user's ID to the route
        return f(user_id, *args, **kwargs)

    return decorated