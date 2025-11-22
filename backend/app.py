from flask import Flask, jsonify
from flask_cors import CORS

from routes.user_routes import user_bp
from routes.item_routes import item_bp
from routes.business_routes import business_bp
from routes.report_routes import report_bp

import re

app = Flask(__name__)

# Allow requests from localhost and any Vercel deployment
def is_allowed_origin(origin):
    if not origin:
        return False
    allowed_patterns = [
        r'^http://localhost:\d+$',
        r'^https://.*\.vercel\.app$',
    ]
    return any(re.match(pattern, origin) for pattern in allowed_patterns)

# Simple CORS - Allow all Vercel subdomains
CORS(app, 
     origins=lambda origin, *args: origin if is_allowed_origin(origin) else None,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     supports_credentials=True)


app.register_blueprint(report_bp, url_prefix='/api/reports')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(item_bp, url_prefix='/api/items')
app.register_blueprint(business_bp, url_prefix='/api/business')




@app.route('/')
def home():
    return jsonify({'status': 'Flask backend is running!'})

if __name__ == '__main__':
    app.run() 