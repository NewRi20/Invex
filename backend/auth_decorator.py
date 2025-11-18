import os
from functools import wraps
from flask import request, jsonify
from supabase_client import supabase

# We no longer need the 'jwt' library or the 'JWT_SECRET'

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'authorization' in request.headers:
            token = request.headers['authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            user_response = supabase.auth.get_user(token)
            current_user = user_response.user
            
            if not current_user:
                 return jsonify({'message': 'User not found or token invalid!'}), 401
                 
        except Exception as e:
            # This will catch expired tokens or other auth errors
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        # Pass the user's ID to the route
        return f(current_user.id, *args, **kwargs)

    return decorated