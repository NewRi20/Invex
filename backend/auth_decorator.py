import os
import jwt
from functools import wraps
from flask import request, jsonify
from supabase_client import supabase

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'authorization' in request.headers:
            token = request.headers['authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        if not JWT_SECRET:
            return jsonify({'message': 'JWT_SECRET not set'}), 500

        try:
            # 1. Decode the token
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            
            # 2. Get user_id from token
            user_id = data.get('sub')
            if not user_id:
                 return jsonify({'message': 'Token is invalid!'}), 401
            
            # 3. Get the full user from Supabase auth
            user_response = supabase.auth.get_user(token)
            current_user = user_response.user
            
            if not current_user:
                 return jsonify({'message': 'User not found!'}), 401
                 
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        # Pass the user's ID to the route
        return f(current_user.id, *args, **kwargs)

    return decorated