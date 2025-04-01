# models/food_explanation_ai.py
from pathlib import Path
import random
import json
import numpy as np

class FoodExplanationAI:
    def __init__(self):
        # Tải các mẫu giải thích và dữ liệu dinh dưỡng
        template_path = Path(__file__).parent / "explanation_templates.json"
        fact_path = Path(__file__).parent / "nutritional_facts.json"
        
        try:
            with open(template_path, 'r') as f:
                self.templates = json.load(f)
                
            with open(fact_path, 'r') as f:
                self.nutritional_facts = json.load(f)
            
            print("✅ Explanation AI loaded successfully")
        except Exception as e:
            print(f"❌ Error loading Explanation AI: {e}")
            self.templates = {}
            self.nutritional_facts = {}
    
    def get_emotion_explanation(self, emotion):
        """Tạo giải thích về mối liên hệ giữa cảm xúc và dinh dưỡng"""
        if emotion not in self.templates.get('emotions', {}):
            emotion = 'neutral'
            
        templates = self.templates.get('emotions', {}).get(emotion, [])
        if not templates:
            return "Your emotional state can be influenced by what you eat."
            
        return random.choice(templates)
    
    def get_nutrient_explanation(self, nutrient, emotion):
        """Tạo giải thích về tác dụng của chất dinh dưỡng đối với cảm xúc"""
        emotion_nutrients = self.nutritional_facts.get('emotion_nutrients', {}).get(emotion, {})
        general_facts = self.nutritional_facts.get('nutrients', {}).get(nutrient, [])
        
        explanation = ""
        
        # Thêm tác dụng đặc thù với cảm xúc
        if nutrient in emotion_nutrients:
            explanation += random.choice(emotion_nutrients[nutrient])
        
        # Thêm thông tin tổng quát về chất dinh dưỡng
        if general_facts:
            if explanation:
                explanation += " "
            explanation += random.choice(general_facts)
            
        if not explanation:
            explanation = f"{nutrient} is an important nutrient for your health."
            
        return explanation
    
    def get_food_explanation(self, food_name, food_type, emotion, top_nutrients):
        """Tạo giải thích về lý do tại sao món ăn này được đề xuất"""
        templates = self.templates.get('food_recommendations', [])
        if not templates:
            return f"This {food_type} is recommended because it contains nutrients that may help with your {emotion} mood."
            
        template = random.choice(templates)
        
        # Tạo danh sách chất dinh dưỡng dạng chuỗi (ví dụ: "Vitamin C, Magnesium, and Zinc")
        if len(top_nutrients) == 1:
            nutrient_text = top_nutrients[0]
        elif len(top_nutrients) == 2:
            nutrient_text = f"{top_nutrients[0]} and {top_nutrients[1]}"
        else:
            nutrient_text = ", ".join(top_nutrients[:-1]) + f", and {top_nutrients[-1]}"
            
        # Điền vào template
        explanation = template.format(
            food_name=food_name,
            food_type=food_type,
            emotion=emotion,
            nutrients=nutrient_text
        )
        
        return explanation
    
    def explain_recommendation(self, recommendation, user_data):
        """Tạo giải thích tổng hợp cho đề xuất món ăn"""
        if not recommendation:
            return {
                "error": "No recommendation provided to explain"
            }
        
        food_name = recommendation.get('food', '')
        food_type = recommendation.get('type', '')
        emotion = user_data.get('emotion', 'neutral')
        nutrition_data = recommendation.get('nutrition_data', {})
        
        # Tạo giải thích tổng quan
        emotion_explanation = self.get_emotion_explanation(emotion)
        
        # Lấy top 3 chất dinh dưỡng quan trọng nhất
        important_nutrients = list(nutrition_data.keys())[:3] if nutrition_data else []
        
        # Tạo giải thích cho từng chất dinh dưỡng
        nutrient_explanations = {}
        for nutrient in important_nutrients:
            nutrient_explanations[nutrient] = {
                "value": nutrition_data.get(nutrient, 0),
                "explanation": self.get_nutrient_explanation(nutrient, emotion)
            }
        
        # Tạo giải thích cho món ăn
        food_explanation = self.get_food_explanation(
            food_name, food_type, emotion, important_nutrients
        )
        
        # Tổng hợp kết quả
        return {
            "food_name": food_name,
            "food_type": food_type,
            "emotion_explanation": emotion_explanation,
            "food_explanation": food_explanation,
            "nutrient_explanations": nutrient_explanations,
            "summary": f"This {food_type} can help improve your {emotion} mood because of its nutritional content."
        }