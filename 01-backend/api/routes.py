import pandas as pd
import jwt
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database.db_init import db, User, UserFoodLog
from datetime import datetime, timedelta, timezone
from database.config import Config
from models.mood_prediction_model import predict_emotion 
from models.food_recommendation_model import get_food_recommendations, get_available_nutrients
from models.food_explaination_ai import FoodExplanationAI

csv_api = Blueprint("csv_api", __name__)
auth_api = Blueprint("auth_api", __name__)
emotion_api = Blueprint("emotion_api", __name__)
food_api = Blueprint("food_api", __name__)
explanation_api = Blueprint("explanation_api", __name__)

# 🟢 Hàm tạo JWT token
def create_jwt(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=1),  # Token hết hạn sau 1 ngày
        "iat": datetime.now(timezone.utc)
    }
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")
    return token

def get_user_from_token(token):
    """Get user from JWT token"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            return None
        
        user = User.query.get(user_id)
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

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

@emotion_api.route("/detect-emotion", methods=["POST"])
def detect_emotion():
    """API nhận ảnh từ frontend và trả về cảm xúc dự đoán."""
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    image_bytes = file.read()  # Đọc ảnh dưới dạng bytes

    # Nhận diện cảm xúc bằng mô hình AI
    emotion = predict_emotion(image_bytes)

    if emotion:
        return jsonify({"emotion": emotion})
    else:
        return jsonify({"error": "Failed to process image."}), 500
    
@food_api.route("/get-nutrients", methods=["GET"])
def get_nutrients():
    """API trả về danh sách các chất dinh dưỡng có thể chọn"""
    nutrients = get_available_nutrients()
    return jsonify({
        "status": "success",
        "nutrients": nutrients
    })

@food_api.route("/get-food-types", methods=["GET"])
def get_food_types():
    """API trả về danh sách các loại thực phẩm có thể chọn"""
    food_types = ["dessert", "drink", "cake", "sweet"]
    return jsonify({
        "status": "success",
        "food_types": food_types
    })

@food_api.route("/recommend-food", methods=["POST"])
def recommend_food():
    """API trả về gợi ý món ăn dựa trên cảm xúc và thông tin người dùng"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Authentication required"}), 401
    
    token = auth_header.split(" ")[1]
    user = get_user_from_token(token)
    
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    data = request.json
    
    # Lấy dữ liệu đầu vào
    emotion = data.get("emotion")
    food_type = data.get("food_type")
    desired_nutrient = data.get("desired_nutrient")  
    
    # Kiểm tra cảm xúc
    if not emotion:
        return jsonify({"error": "Emotion is required"}), 400
    
    try:
        # Lấy gợi ý từ model
        recommendations = get_food_recommendations(
            emotion=emotion,
            birth_date=user.date_of_birth,
            food_type=food_type,
            desired_nutrient=desired_nutrient
        )
        
        # Lưu lịch sử gợi ý vào database
        log_entry = UserFoodLog(
            user_id=user.id,
            mood=emotion,
            recommended_food_mood=recommendations.get('mood_optimized', {}).get('recommended', {}).get('food', ''),
            recommended_food_preference=recommendations.get('preference_based', {}).get('recommended', {}).get('food', ''),
            food_preference_type=food_type if food_type else '',
            priority_nutrient=desired_nutrient if desired_nutrient else ''
        )
        db.session.add(log_entry)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "user_name": user.name,
            "recommendations": recommendations,
            "log_id": log_entry.id
        })
        
    except Exception as e:
        print(f"❌ Error getting recommendations: {e}")
        return jsonify({"error": "Failed to get recommendations"}), 500

@food_api.route("/select-food", methods=["POST"])
def select_food():
    """API ghi nhận món ăn mà người dùng đã chọn"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Authentication required"}), 401
    
    token = auth_header.split(" ")[1]
    user = get_user_from_token(token)
    
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    data = request.json
    log_id = data.get("log_id")
    chosen_food = data.get("chosen_food")
    
    if not log_id or not chosen_food:
        return jsonify({"error": "Log ID and chosen food are required"}), 400
    
    try:
        log_entry = UserFoodLog.query.filter_by(id=log_id, user_id=user.id).first()
        
        if not log_entry:
            return jsonify({"error": "Log entry not found"}), 404
        
        # Cập nhật món ăn đã chọn
        log_entry.chosen_food = chosen_food
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Food selection recorded successfully"
        })
        
    except Exception as e:
        print(f"❌ Error recording food selection: {e}")
        return jsonify({"error": "Failed to record food selection"}), 500
    
explanation_ai = FoodExplanationAI()

@explanation_api.route("/explain-recommendation", methods=["POST"])
def explain_recommendation():
    """API giải thích chi tiết và đa dạng tại sao món ăn được đề xuất"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Authentication required"}), 401
    
    token = auth_header.split(" ")[1]
    user = get_user_from_token(token)
    
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    data = request.json
    recommendation = data.get("recommendation")
    
    if not recommendation:
        return jsonify({"error": "Recommendation data is required"}), 400
    
    # Thêm thông tin người dùng vào context
    user_data = {
        "emotion": data.get("emotion", "neutral"),
        "age": (datetime.now().date() - user.date_of_birth).days // 365,
        "desired_nutrient": data.get("desired_nutrient")
    }
    
    # Tạo giải thích bằng Explanation AI
    explanation = explanation_ai.explain_recommendation(recommendation, user_data)
    
    return jsonify({
        "status": "success",
        "explanation": explanation
    })

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

