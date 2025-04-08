import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import date, timedelta

# Constants
SUPPORTED_EMOTIONS = ['sad', 'disgust', 'angry', 'neutral', 'surprise', 'happy', 'fear']
SUPPORTED_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
SUPPORTED_FOOD_TYPES = ['Fruits', 'Vegetables', 'Meat', 'Dairy', 'Grains', 'Snacks', 'Beverages']

# Priority nutrients for each emotion - for API to return to frontend
# Priority nutrients for each emotion - for API to return to frontend
EMOTION_PRIORITY_NUTRIENTS = {
    'happy': ['Protein', 'Carbohydrates', 'Vitamin D', 'Polyunsaturated Fats', 'Magnesium'],
    'sad': [
        'Polyunsaturated Fats', 'Vitamin D', 'Protein', 'Vitamin B6', 'Vitamin B12', 'Magnesium', 'Zinc'
    ], 
    'angry': ['Magnesium', 'Vitamin C'],
    'fear': ['Magnesium', 'Polyunsaturated Fats', 'Vitamin B6', 'Vitamin B12', 'Vitamin C'],
    'neutral': [
        'Carbohydrates', 'Protein', 'Vitamin B1', 'Vitamin B2', 'Vitamin B3',
        'Vitamin B5', 'Vitamin B6', 'Vitamin B12', 'Magnesium', 'Zinc', 'Iron'
    ],
    'surprise': [
        'Carbohydrates', 'Vitamin B1', 'Vitamin B2', 'Vitamin B3', 'Vitamin B5',
        'Vitamin B6', 'Vitamin B12', 'Protein', 'Vitamin C', 'Vitamin D'
    ],
    'disgust': ['Dietary Fiber', 'Magnesium', 'Zinc', 'Vitamin B6']
}

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
    nutrition_general_limits = {
    'Caloric Value': {'child': 1800, 'adult': 3300},
    'Fat': {'child': 70000, 'adult': 128333.33},
    'Polyunsaturated Fats': {'child': 3000, 'adult': 3000},
    'Carbohydrates': {'child': 292500, 'adult': 536250},
    'Sugars': {'child': 45000, 'adult': 82500},
    'Protein': {'child': 27000, 'adult': 71000},
    'Dietary Fiber': {'child': 13000, 'adult': 30000},
    'Sodium': {'child': 1500, 'adult': 2000},
    'Vitamin A': {'child': 900, 'adult': 3000},
    'Vitamin B1': {'child': 0.7, 'adult': 1.4},
    'Vitamin B11': {'child': 0.4, 'adult': 1},
    'Vitamin B12': {'child': 0.0015, 'adult': 0.003},
    'Vitamin B2': {'child': 0.7, 'adult': 1.7},
    'Vitamin B3': {'child': 12, 'adult': 16},
    'Vitamin B5': {'child': 4, 'adult': 5},
    'Vitamin B6': {'child': 0.9, 'adult': 1.7},
    'Vitamin C': {'child': 50, 'adult': 100},
    'Vitamin D': {'child': 0.05, 'adult': 0.1},
    'Vitamin E': {'child': 100, 'adult': 300},
    'Vitamin K': {'child': 0.06, 'adult': 0.12},
    'Calcium': {'child': 1000, 'adult': 2500},
    'Iron': {'child': 10, 'adult': 18},
    'Copper': {'child': 0.7, 'adult': 0.9},
    'Magnesium': {'child': 200, 'adult': 420},
    'Manganese': {'child': 1.5, 'adult': 2.3},
    'Phosphorus': {'child': 800, 'adult': 1250},
    'Potassium': {'child': 2600, 'adult': 4700},
    'Zinc': {'child': 12, 'adult': 40}
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
        dict: Contains recommendation and alternatives
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
        for nutrient in food.index:
            if not pd.isna(food[nutrient]):
                try:
                    nutrition_data[nutrient] = float(food[nutrient])
                except:
                    nutrition_data[nutrient] = food[nutrient]
        
        # Create result entry
        results.append({
            'food': food['food'],
            'type': food['food_type'],
            'nutrition_data': nutrition_data,
            'image_url': food.get('image_url', '')  # Include image URL if available
        })
    
    # Sort by score (calculated internally)
    results.sort(key=lambda x: calculate_compatibility_score(x['nutrition_data'], emotion, age_group), reverse=True)
    
    # Get priority nutrients for the current emotion to return to frontend
    priority_nutrients = EMOTION_PRIORITY_NUTRIENTS.get(emotion, ['Protein', 'Vitamin C', 'Iron', 'Calcium'])
    
    # Return main recommendation and up to 3 alternatives
    return {
        'status': 'success',
        'recommendation': results[0] if results else None,
        'alternatives': results[1:4] if len(results) > 1 else [],
        'priority_nutrients': priority_nutrients
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
        if entry.feedback_rating:
            user_history.append({
                'food': entry.recommended_food,
                'rating': entry.feedback_rating,
                'mood': entry.mood,
                'meal_time': entry.meal_time,
                'timestamp': entry.created_at
            })
    
    return user_history

def personalized_recommendation(user_id, emotion, age, meal_time, preferred_food_type=None):
    """
    Provide personalized food recommendations based on user history
    
    Args:
        user_id: ID of the user for personalization
        emotion: Current emotion 
        age: User's age
        meal_time: Current meal time
        preferred_food_type: Optional food type preference
        
    Returns:
        dict: Personalized food recommendations
    """
    # Get user history
    user_history = get_user_history(user_id)
    
    # Get base recommendations
    base_recs = get_food_recommendations(
        emotion, 
        date.today() - timedelta(days=age*365), 
        meal_time=meal_time, 
        food_type=preferred_food_type
    )
    
    # If no history or base recommendations failed, return base recommendations
    if not user_history or 'error' in base_recs:
        return base_recs
    
    # Analyze user preferences
    liked_foods = [entry['food'] for entry in user_history if entry['rating'] >= 4]
    disliked_foods = [entry['food'] for entry in user_history if entry['rating'] <= 2]
    
    # Get main recommendation and alternatives
    recommendation = base_recs.get('recommendation')
    alternatives = base_recs.get('alternatives', [])
    
    # Combine into one list for processing
    all_recommendations = [recommendation] + alternatives if recommendation else alternatives
    
    # Filter and reorder based on user preferences
    adjusted_recommendations = []
    
    # First add liked foods that are in recommendations
    for rec in all_recommendations:
        if rec['food'] in liked_foods:
            adjusted_recommendations.append(rec)
    
    # Then add other recommendations that are not disliked
    for rec in all_recommendations:
        if rec['food'] not in disliked_foods and rec not in adjusted_recommendations:
            adjusted_recommendations.append(rec)
    
    # If no adjusted recommendations, use original ones
    if not adjusted_recommendations:
        adjusted_recommendations = all_recommendations
    
    # Return recommended and alternatives with priority nutrients
    priority_nutrients = EMOTION_PRIORITY_NUTRIENTS.get(emotion, ['Protein', 'Vitamin C', 'Iron', 'Calcium'])
    
    return {
        'status': 'success',
        'recommendation': adjusted_recommendations[0] if adjusted_recommendations else None,
        'alternatives': adjusted_recommendations[1:4] if len(adjusted_recommendations) > 1 else [],
        'priority_nutrients': priority_nutrients
    }