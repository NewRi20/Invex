from flask import Flask, jsonify
from flask_cors import CORS

from routes.user_routes import user_bp
from routes.item_routes import item_bp
from routes.business_routes import business_bp
from routes.report_routes import report_bp


app = Flask(__name__)
CORS(app) 


app.register_blueprint(report_bp, url_prefix='/api/reports')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(item_bp, url_prefix='/api/items')
app.register_blueprint(business_bp, url_prefix='/api/business')




@app.route('/')
def home():
    return jsonify({'status': 'Flask backend is running!'})

if __name__ == '__main__':
    app.run(debug=True) 