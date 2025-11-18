from flask import Flask, jsonify
from flask_cors import CORS

from routes.user_routes import user_bp
from routes.item_routes import item_bp
from routes.business_routes import business_bp


app = Flask(__name__)
# Enable CORS for your React app
CORS(app) 


app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(item_bp, url_prefix='/api/items')
app.register_blueprint(business_bp, url_prefix='/api/business')



# A simple health check route
@app.route('/')
def home():
    return jsonify({'status': 'Flask backend is running!'})

if __name__ == '__main__':
    app.run(debug=True) # Runs on http://127.0.0.1:5000