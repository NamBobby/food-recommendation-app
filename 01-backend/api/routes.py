import jwt
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database.db_init import db, User  
from datetime import datetime, timedelta, timezone
from database.config import Config

csv_api = Blueprint("csv_api", __name__)
auth_api = Blueprint("auth_api", __name__)

# 🟢 Hàm tạo JWT token
def create_jwt(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=1),  # Token hết hạn sau 1 ngày
        "iat": datetime.now(timezone.utc)
    }
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")
    return token

@auth_api.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    day = data.get("day")
    month = data.get("month")
    year = data.get("year")

    if not name or not email or not password or not day or not month or not year:
        return jsonify({"error": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400
    
    try:
        date_of_birth = datetime(int(year), int(month), int(day)).date()
    except ValueError:
        return jsonify({"error": "Invalid date"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password_hash=hashed_password, date_of_birth=date_of_birth, role="user")

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@auth_api.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    # 🟢 Tạo JWT token hợp lệ
    token = create_jwt(user.id)

    return jsonify({
        "message": "Login successful",
        "token": token,  
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200


# Hàm đọc dữ liệu từ file CSV
def load_food_data():
    df = pd.read_csv("data/foods.csv")
    return df.to_dict(orient="records")

def load_nutrient_data():
    df = pd.read_csv("data/nutrient_effectiveness.csv")
    return df.to_dict(orient="records")

# API trả danh sách món ăn từ `foods.csv`
@csv_api.route("/get-foods", methods=["GET"])
def get_foods():
    foods = load_food_data()
    return jsonify(foods)

# API trả dữ liệu hiệu quả của chất dinh dưỡng từ `nutrient_effectiveness.csv`
@csv_api.route("/get-nutrient-effectiveness", methods=["GET"])
def get_nutrient_effectiveness():
    nutrients = load_nutrient_data()
    return jsonify(nutrients)

