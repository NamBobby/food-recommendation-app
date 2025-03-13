from flask import Flask
from flask_cors import CORS
from database.config import Config
from flask_sqlalchemy import SQLAlchemy
from api.routes import csv_api  # Import API đọc file CSV

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
db = SQLAlchemy(app)

# Đăng ký API đọc file CSV
app.register_blueprint(csv_api)

@app.route("/")
def home():
    return "✅ Flask & PostgreSQL Connected Successfully!"

if __name__ == "__main__":
    app.run(debug=True)
