from flask import Blueprint, jsonify
import pandas as pd

csv_api = Blueprint("csv_api", __name__)

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
