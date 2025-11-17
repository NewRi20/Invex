from flask import Flask, jsonify
from flask_cors import CORS

# Import all your blueprint "controllers"
from routes.user_routes import user_bp
from routes.item_routes import item_bp
# ... import your other blueprints ...
# from routes.category_routes import category_bp
# from routes.report_routes import report_bp
# from routes.business_routes import business_bp

app = Flask(__name__)
# Enable CORS for your React app
CORS(app) 

# --- Register Blueprints ---
# This tells Flask to use the routes from your other files
# and gives them a URL prefix
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(item_bp, url_prefix='/api/items')
# ... register your other blueprints ...
# app.register_blueprint(category_bp, url_prefix='/api/categories')
# app.register_blueprint(report_bp, url_prefix='/api/reports')
# app.register_blueprint(business_bp, url_prefix='/api/business')


# A simple health check route
@app.route('/')
def home():
    return jsonify({'status': 'Flask backend is running!'})

if __name__ == '__main__':
    app.run(debug=True) # Runs on http://127.0.0.1:5000