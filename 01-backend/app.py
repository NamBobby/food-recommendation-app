from flask import Flask
from flask_cors import CORS
from database.config import Config
from database.db_init import db  
from api.routes import csv_api, auth_api

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)  # 🟢 Chỉ gắn `db` vào Flask ở đây

app.register_blueprint(csv_api)
app.register_blueprint(auth_api)

@app.route("/")
def home():
    return "✅ Flask & PostgreSQL Connected Successfully!"

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # 🟢 Đảm bảo database được khởi tạo
    app.run(host="0.0.0.0", port=5000, debug=True)
