from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

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
    mood = db.Column(db.String(50))  # Cảm xúc lúc chọn món
    recommended_food_mood = db.Column(db.String(255))  # Món được recommend theo tâm trạng
    recommended_food_preference = db.Column(db.String(255))  # Món được recommend theo sở thích
    chosen_food = db.Column(db.String(255))  # Món mà người dùng chọn
    food_preference_type = db.Column(db.String(50))  # Loại món ăn đã chọn (Cake, Drink, Dessert...)
    priority_nutrient = db.Column(db.String(100))  # Chất dinh dưỡng ưu tiên
    selected_at = db.Column(db.DateTime, default=db.func.current_timestamp())

# Bảng lưu hiệu quả của chất dinh dưỡng
class NutrientEffectiveness(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nutrient_name = db.Column(db.String(100))
    linked_emotion = db.Column(db.String(50))
    effectiveness = db.Column(db.Text)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✅ Database & Tables Created Successfully!")
