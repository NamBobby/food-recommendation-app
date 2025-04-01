from flask import Flask
from flask_cors import CORS
from database.config import Config
from database.db_init import db  
from api.routes import csv_api, auth_api, emotion_api, food_api, explanation_api

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)  

app.register_blueprint(csv_api, url_prefix='/api/csv')
app.register_blueprint(auth_api, url_prefix='/api/auth')
app.register_blueprint(emotion_api, url_prefix='/api/emotion')
app.register_blueprint(food_api, url_prefix='/api/food')
app.register_blueprint(explanation_api, url_prefix='/api/explanation')

@app.route("/")
def home():
    return "✅ Flask & PostgreSQL & AI Model Connected Successfully!"

if __name__ == "__main__":
    with app.app_context():
        db.create_all() 
    app.run(host="0.0.0.0", port=5000, debug=True)
