import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import date, timedelta

# Constants
SUPPORTED_EMOTIONS = ['sad', 'disgust', 'angry', 'neutral', 'surprise', 'happy', 'fear']
SUPPORTED_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
SUPPORTED_FOOD_TYPES = ['Fruits', 'Vegetables', 'Meat', 'Dairy', 'Grains', 'Snacks', 'Beverages']

# Load models and data
model_path = Path(__file__).parent / "food_recommendation_model.pkl"
mappings_path = Path(__file__).parent / "model_mappings.pkl"
food_data_path = Path(__file__).parent / "../data/processed_food_data.csv"
nutrition_priorities_path = Path(__file__).parent / "nutrition_priorities.pkl"

try:
    model = joblib.load(model_path)
    mappings = joblib.load(mappings_path)
    food_data = pd.read_csv(food_data_path)
    nutrition_priorities = joblib.load(nutrition_priorities_path)
    model_loaded = True
    print("✅ Food recommendation model loaded successfully")
except Exception as e:
    print(f"❌ Error loading food recommendation model: {e}")
    model_loaded = False
    nutrition_priorities = {}

def check_nutrient_limits(food_row, age_group, tolerance=1.5):
    """
    Returns True if food is within nutritional limits, False if it violates limits.
    """
    # Define nutrition general limits according to age group
    # This is simplified - you should replace with your actual limits from the notebook
    nutrition_general_limits = {
        'Caloric Value': {'child': 1800, 'adult': 3300},
        'Fat': {'child': 70000, 'adult': 128333.33},
        'Carbohydrates': {'child': 292500, 'adult': 536250},
        'Protein': {'child': 27000, 'adult': 71000},
        # Add more nutrients based on your model
    }
    
    for nutrient, group_limits in nutrition_general_limits.items():
        if nutrient not in food_row:
            continue
        try:
            value = float(food_row[nutrient])
            limit = float(group_limits[age_group])

            if value > limit * tolerance:
                return False  # Violates nutrition limit
        except:
            continue  # Skip if error reading value
    
    return True  # Within limits if no violations found

def calculate_compatibility_score(food_row, emotion, age_group='adult'):
    """
    Calculates compatibility score of food with emotion:
    - Based on priority nutrients order
    - Higher score = better match with emotion
    """
    priority_nutrients = nutrition_priorities.get(emotion, [])
    
    if not priority_nutrients:
        return 0  # If no priority defined for this emotion
    
    weights = np.linspace(1.0, 0.1, num=len(priority_nutrients))  # Decreasing weights
    total_weight = np.sum(weights)
    score = 0
    
    for idx, nutrient in enumerate(priority_nutrients):
        val = food_row.get(nutrient, 0)
        
        # Check if the value is present and can be converted to float
        try:
            val = float(val)
            # Simple scoring formula - could be enhanced
            score += (weights[idx] / total_weight) * min(10, val/100)
        except:
            continue  # Skip if error
    
    return round(score, 2)

def get_food_recommendations(emotion, birth_date, user_id=None, meal_time=None, food_type=None):
    """
    Get food recommendations based on emotion, user info, and preferences
    
    Args:
        emotion (str): User's emotion (sad, happy, angry, etc.)
        birth_date (date): User's date of birth to calculate age
        user_id (int, optional): User ID for personalized recommendations
        meal_time (str, optional): Meal time (Breakfast, Lunch, Dinner, Snack)
        food_type (str, optional): Type of food preferred
        
    Returns:
        dict: Contains recommendations and alternatives
    """
    if not model_loaded:
        return {"error": "Recommendation model not loaded"}
    
    # Normalize input
    emotion = emotion.lower() if emotion else "neutral"
    if emotion not in SUPPORTED_EMOTIONS:
        emotion = "neutral"
    
    # Calculate age
    today = date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    age_group = 'child' if age <= 15 else 'adult'
    
    # Filter foods by type if specified
    filtered_foods = food_data
    if food_type:
        filtered_foods = food_data[food_data['food_type'].str.lower() == food_type.lower()]
        # If no foods match the type, use all foods
        if filtered_foods.empty:
            filtered_foods = food_data
    
    # Process and score foods
    results = []
    
    for _, food in filtered_foods.iterrows():
        # Check nutrition limits
        if not check_nutrient_limits(food, age_group):
            continue
            
        # Calculate compatibility score
        compatibility_score = calculate_compatibility_score(food, emotion, age_group)
        
        # Get priority nutrients for this emotion
        priority_nutrients = nutrition_priorities.get(emotion, [])
        
        # Get nutrition data for these nutrients
        nutrition_data = {}
        for nutrient in priority_nutrients:
            if nutrient in food and not pd.isna(food[nutrient]):
                nutrition_data[nutrient] = float(food[nutrient])
        
        # Create result entry
        results.append({
            'food': food['food'],
            'type': food['food_type'],
            'score': compatibility_score,
            'nutrition_data': nutrition_data,
            'image_url': food.get('image_url', '')  # Include image URL if available
        })
    
    # Sort by score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    # Return top recommendation and alternatives
    return {
        'recommendation': results[0] if results else None,
        'alternatives': results[1:min(4, len(results))] if len(results) > 1 else []
    }

def get_available_nutrients():
    """Return list of nutrients that can be selected by the user"""
    all_nutrients = [
        'Caloric Value', 'Fat', 'Saturated Fats', 'Monounsaturated Fats', 'Polyunsaturated Fats',
        'Carbohydrates', 'Sugars', 'Protein', 'Dietary Fiber', 'Cholesterol', 'Sodium',
        'Vitamin A', 'Vitamin B1', 'Vitamin B11', 'Vitamin B12', 'Vitamin B2', 'Vitamin B3',
        'Vitamin B5', 'Vitamin B6', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K',
        'Calcium', 'Iron', 'Magnesium', 'Phosphorus', 'Potassium', 'Zinc'
    ]
    return all_nutrients

def get_user_history(user_id):
    """Get user's food selection history from database"""
    from database.db_init import UserFoodLog, db
    
    history_entries = UserFoodLog.query.filter_by(user_id=user_id).all()
    user_history = []
    
    for entry in history_entries:
        if entry.chosen_food and entry.feedback_rating:
            user_history.append({
                'food': entry.chosen_food,
                'rating': entry.feedback_rating,
                'mood': entry.mood,
                'meal_time': entry.meal_time,
                'timestamp': entry.created_at
            })
    
    return user_history

def personalized_recommendation(user_id, emotion, age, meal_time, preferred_food_type=None, top_k=3):
    """
    Provide personalized food recommendations based on user history
    
    Args:
        user_id: ID of the user for personalization
        emotion: Current emotion 
        age: User's age
        meal_time: Current meal time
        preferred_food_type: Optional food type preference
        top_k: Number of recommendations to return
        
    Returns:
        list: Personalized food recommendations
    """
    # Get user history
    user_history = get_user_history(user_id)
    
    # If no history, return basic recommendations
    if not user_history:
        base_recs = get_food_recommendations(emotion, date.today() - timedelta(days=age*365), 
                                           meal_time=meal_time, food_type=preferred_food_type)
        return base_recs['recommendation'], base_recs['alternatives'][:top_k-1]
    
    # Analyze user preferences
    liked_foods = [entry['food'] for entry in user_history if entry['rating'] >= 4]
    disliked_foods = [entry['food'] for entry in user_history if entry['rating'] <= 2]
    
    # Get base recommendations 
    base_recs = get_food_recommendations(emotion, date.today() - timedelta(days=age*365), 
                                         meal_time=meal_time, food_type=preferred_food_type)
    
    base_recommendation = base_recs['recommendation']
    base_alternatives = base_recs['alternatives']
    
    # Combine into one list for processing
    all_recommendations = [base_recommendation] + base_alternatives if base_recommendation else base_alternatives
    
    # Filter and reorder based on user preferences
    adjusted_recommendations = []
    
    # First add liked foods that are in recommendations
    for rec in all_recommendations:
        if rec['food'] in liked_foods:
            # Boost score for liked foods
            rec['score'] *= 1.2  
            adjusted_recommendations.append(rec)
    
    # Then add other recommendations that are not disliked
    for rec in all_recommendations:
        if rec['food'] not in disliked_foods and rec not in adjusted_recommendations:
            adjusted_recommendations.append(rec)
    
    # Sort by adjusted score
    adjusted_recommendations.sort(key=lambda x: x['score'], reverse=True)
    
    # Return top recommendation and alternatives
    if adjusted_recommendations:
        return adjusted_recommendations[0], adjusted_recommendations[1:top_k]
    else:
        return None, []