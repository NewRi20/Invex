from flask import Flask, jsonify
from flask_cors import CORS

from routes.user_routes import user_bp
from routes.item_routes import item_bp
from routes.business_routes import business_bp
from routes.report_routes import report_bp

app = Flask(__name__)

# Configure CORS with explicit origins (required for credentials)
CORS(app, 
     resources={r"/api/*": {
         "origins": [
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