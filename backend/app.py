from flask import Flask, jsonify
from flask_cors import CORS
from extensions import cache

# Import Celery for task initialization
# This ensures all tasks are registered when the app starts
try:
    from services.tasks.core import celery
    from services.tasks import inventory, pricing, sales_report
except ImportError:
    print("Warning: Celery tasks could not be imported. Background tasks may not work.")

from routes.user_routes import user_bp
from routes.item_routes import item_bp
from routes.business_routes import business_bp
from routes.report_routes import report_bp

app = Flask(__name__)
cache.init_app(app, config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300})

# Initialize Celery with Flask app context
celery.conf.update(app.config)

# Configure CORS with explicit origins (required for credentials)
CORS(app, 
     resources={r"/api/*": {
         "origins": [
             "https://inv3x.vercel.app",
             "https://invex-five.vercel.app",      
             "https://*.vercel.app",                
             "http://localhost:5173",               
             "http://localhost:5174"                
         ]
     }},
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