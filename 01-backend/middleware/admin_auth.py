from flask import request, jsonify
from functools import wraps
from api.routes import get_user_from_token

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401
        
        token = auth_header.split(" ")[1]
        user = get_user_from_token(token)
        
        # Check if user exists and has admin role
        if not user or user.role != "admin":
            return jsonify({"error": "Admin privileges required"}), 403
            
        return f(*args, **kwargs)
    return decorated_function