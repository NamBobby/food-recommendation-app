from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from database.config import Config
from werkzeug.security import generate_password_hash

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

# Bảng lưu thông tin người dùng
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(10), nullable=False, default="user")
    date_of_birth = db.Column(db.Date, nullable=False)  # Ngày sinh để tính tuổi

# Bảng lưu lịch sử chọn món của người dùng
class UserFoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"))
    
    # Input information
    mood = db.Column(db.String(50), nullable=False)  # User's emotion
    meal_time = db.Column(db.String(50))  # Meal time (Breakfast, Lunch, etc.)
    food_type = db.Column(db.String(50))  # Food type preference
    
    # Recommendation results
    recommended_food = db.Column(db.String(255))  # Recommended food
    recommended_food_alternatives = db.Column(db.Text)  # JSON string of alternative recommendations
    
    # User selection and feedback
    chosen_food = db.Column(db.String(255))  # Food chosen by user
    compatibility_score = db.Column(db.Float)  # Compatibility score from model
    feedback_rating = db.Column(db.Integer)  # User rating (1-5 stars)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

# Bảng lưu hiệu quả của chất dinh dưỡng
class NutrientEffectiveness(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nutrient_name = db.Column(db.String(100))
    linked_emotion = db.Column(db.String(50))
    effectiveness = db.Column(db.Text)

def seed_default_users():
    """Thêm tài khoản mặc định nếu chưa tồn tại"""
    admin_email = "admin@example.com"
    user_email = "user@example.com"

    admin = User.query.filter_by(email=admin_email).first()
    user = User.query.filter_by(email=user_email).first()

    if not admin:
        admin_password_hash = generate_password_hash("admin123", method="pbkdf2:sha256")  
        new_admin = User(
            name="Admin",
            email=admin_email,
            password_hash=admin_password_hash,
            role="admin",
            date_of_birth="1990-01-01"
        )
        db.session.add(new_admin)

    if not user:
        user_password_hash = generate_password_hash("123456", method="pbkdf2:sha256") 
        new_user = User(
            name="User",
            email=user_email,
            password_hash=user_password_hash,
            role="user",
            date_of_birth="2000-01-01"
        )
        db.session.add(new_user)

    db.session.commit()
    print("✅ Default Admin & User accounts added!")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_default_users()
        print("✅ Database & Tables Created Successfully!")
