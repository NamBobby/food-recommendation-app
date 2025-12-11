from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from database.config import Config
from werkzeug.security import generate_password_hash
import logging

# ---------------------------------------------------
# Setup Flask + SQLAlchemy
# ---------------------------------------------------
app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

# ---------------------------------------------------
# Logging configuration
# ---------------------------------------------------
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('db_init')


# ---------------------------------------------------
# Models
# ---------------------------------------------------
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(10), nullable=False, default="user")
    date_of_birth = db.Column(db.Date, nullable=False)


class UserFoodLog(db.Model):
    __tablename__ = "user_food_log"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"))

    mood = db.Column(db.String(50), nullable=False)
    meal_time = db.Column(db.String(50))
    food_type = db.Column(db.String(50))
    recommended_food = db.Column(db.String(255))
    feedback_rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())


# ---------------------------------------------------
# Seed default admin + user
# ---------------------------------------------------
def seed_default_users():
    admin_email = "admin@example.com"
    user_email = "user@example.com"

    # Admin
    if not User.query.filter_by(email=admin_email).first():
        new_admin = User(
            name="Admin",
            email=admin_email,
            password_hash=generate_password_hash("admin123"),
            role="admin",
            date_of_birth="1990-01-01"
        )
        db.session.add(new_admin)
        logger.info("Added default admin (admin@example.com / admin123)")

    # User
    if not User.query.filter_by(email=user_email).first():
        new_user = User(
            name="User",
            email=user_email,
            password_hash=generate_password_hash("123456"),
            role="user",
            date_of_birth="2000-01-01"
        )
        db.session.add(new_user)
        logger.info("Added default user (user@example.com / 123456)")

    db.session.commit()


# ---------------------------------------------------
# Reset database
# ---------------------------------------------------
def reset_database():
    logger.warning("⚠️ RESET DATABASE ENABLED — Dropping ALL tables...")
    db.drop_all()
    logger.info("🗑 All tables dropped. Recreating...")
    db.create_all()
    seed_default_users()
    logger.info("✅ Database reset complete.")


# ---------------------------------------------------
# Initialize DB
# ---------------------------------------------------
def init_db():
    logger.info("Starting DB initialization...")

    # Check if DB_RESET is true
    if Config.DB_RESET:
        reset_database()
        return

    # Otherwise normal init
    try:
        inspector = db.inspect(db.engine)
        existing_tables = inspector.get_table_names()
        logger.info(f"Existing tables: {existing_tables}")

    except Exception as e:
        logger.error(f"Error reading DB metadata: {e}")
        existing_tables = []

    if "user" not in existing_tables or "user_food_log" not in existing_tables:
        logger.info("Tables missing → Creating tables...")
        db.create_all()
        seed_default_users()
        logger.info("Database initialized.")

    else:
        logger.info("Tables already exist → No creation needed.")


# ---------------------------------------------------
# Run if executed directly
# ---------------------------------------------------
if __name__ == "__main__":
    with app.app_context():
        init_db()
