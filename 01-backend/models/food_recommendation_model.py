import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import date

# Constants
SUPPORTED_EMOTIONS = ['sad', 'disgust', 'angry', 'neutral', 'surprise', 'happy', 'fear']
ALL_NUTRIENTS = [
    'Caloric Value', 'Fat', 'Saturated Fats', 'Monounsaturated Fats', 'Polyunsaturated Fats',
    'Carbohydrates', 'Sugars', 'Protein', 'Dietary Fiber', 'Cholesterol', 'Sodium', 'Water',
    'Vitamin A', 'Vitamin B1', 'Vitamin B11', 'Vitamin B12', 'Vitamin B2', 'Vitamin B3',
    'Vitamin B5', 'Vitamin B6', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K',
    'Calcium', 'Iron', 'Magnesium', 'Phosphorus', 'Potassium', 'Zinc'
]
SUPPORTED_FOOD_TYPES = ['dessert', 'drink', 'cake', 'sweet']

# Nutrition priorities for each emotion
NUTRITION_PRIORITIES = {
    'sad': [
        'Polyunsaturated Fats',
        'Vitamin D',
        'Protein'
        'Vitamin B6',
        'Vitamin B12',
        'Magnesium',
        'Zinc'
    ],
    'happy': [
        'Protein',
        'Carbohydrates',
        'Vitamin D',
        'Polyunsaturated Fats',
        'Magnesium'
    ],
    'angry': [
        'Magnesium',
        'Vitamin C'
    ],
    'disgust': [
        'Dietary Fiber',
        'Magnesium',
        'Zinc',
        'Vitamin B6'
    ],
    'neutral': [
        'Carbohydrates',
        'Protein',
        'Vitamin B1',
        'Vitamin B2',
        'Vitamin B3',
        'Vitamin B5',
        'Vitamin B6',
        'Vitamin B12',
        'Magnesium',
        'Zinc',
        'Iron'
    ],
    'surprise': [
        'Carbohydrates',
        'Vitamin B1',
        'Vitamin B2',
        'Vitamin B3',
        'Vitamin B5',
        'Vitamin B6',
        'Vitamin B12',
        'Protein',
        'Vitamin C',
        'Vitamin D'
    ],
    'fear': [
        'Magnesium',
        'Polyunsaturated Fats',
        'Vitamin B6',
        'Vitamin B12',
        'Vitamin C'
    ]
}

# Load models and data
model_path = Path(__file__).parent / "food_recommendation_model.pkl"
mappings_path = Path(__file__).parent / "model_mappings.pkl"
food_data_path = Path(__file__).parent / "../data/food_nutrition.csv"

try:
    model = joblib.load(model_path)
    mappings = joblib.load(mappings_path)
    food_data = pd.read_csv(food_data_path)
    model_loaded = True
    print("✅ Food recommendation model loaded successfully")
except Exception as e:
    print(f"❌ Error loading food recommendation model: {e}")
    model_loaded = False

def get_priority_nutrients(emotion):
    """Get list of priority nutrients for an emotion"""
    return NUTRITION_PRIORITIES.get(emotion.lower(), [])

def prepare_model_data(sample_df):
    """Prepare data for model prediction"""
    X = pd.DataFrame()
    
    # Add emotion encoding
    for emotion in SUPPORTED_EMOTIONS:
        X[f'emotion_{emotion}'] = (sample_df['emotion'] == emotion).astype(int)
    
    # Add age and food type features
    X['age'] = sample_df['age']
    X['age_group'] = (sample_df['age_group'] == 'adult').astype(int)
    
    for food_type in SUPPORTED_FOOD_TYPES:
        X[f'food_type_{food_type}'] = (sample_df['food_type'] == food_type).astype(int)
    
    # Add desired nutrient encoding
    if 'desired_nutrient' in sample_df.columns and sample_df['desired_nutrient'].iloc[0]:
        for nutrient in ALL_NUTRIENTS:
            X[f'desired_{nutrient}'] = (sample_df['desired_nutrient'] == nutrient).astype(int)
    else:
        for nutrient in ALL_NUTRIENTS:
            X[f'desired_{nutrient}'] = 0
    
    # Add nutrition data if available
    for nutrient in ALL_NUTRIENTS:
        if nutrient in sample_df.columns:
            X[f'nutrient_{nutrient}'] = sample_df[nutrient].fillna(0)
        else:
            X[f'nutrient_{nutrient}'] = 0
    
    # Fill missing values
    X = X.fillna(0)
    
    return X

def calculate_age(birth_date):
    """Calculate age from birth date"""
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

def get_food_recommendations(emotion, birth_date, food_type=None, desired_nutrient=None):
    """
    Get food recommendations for the user based on emotion and preferences
    
    Args:
        emotion (str): User's emotion (sad, happy, angry, etc.)
        birth_date (date): User's date of birth
        food_type (str, optional): Type of food (dessert, drink, cake, sweet)
        desired_nutrient (str, optional): Specific nutrient the user desires
        
    Returns:
        dict: Contains mood-optimized and preference-based recommendations
    """
    if not model_loaded:
        return {"error": "Recommendation model not loaded"}
    
    # Normalize input
    emotion = emotion.lower() if emotion else "neutral"
    if emotion not in SUPPORTED_EMOTIONS:
        emotion = "neutral"
    
    # Calculate age
    age = calculate_age(birth_date)
    age_group = 'child' if age <= 15 else 'adult'
    
    # Normalize food type
    if food_type:
        food_type = food_type.lower()
        if food_type not in SUPPORTED_FOOD_TYPES:
            food_type = None
    
    # Get priority nutrients for the emotion
    priority_nutrients = get_priority_nutrients(emotion)
    
    # Filter foods by type if specified
    if food_type:
        filtered_foods = food_data[food_data['Types'].str.lower() == food_type]
        if filtered_foods.empty:
            filtered_foods = food_data
    else:
        filtered_foods = food_data
    
    # Process predictions
    mood_recommendations = []
    preference_recommendations = []
    
    for _, food in filtered_foods.iterrows():
        food_name = food['food']
        
        # Create base sample
        base_sample = {
            'emotion': emotion,
            'age': age,
            'age_group': age_group,
            'food_type': food_type if food_type else 'any',
            'recommended_food': food_name
        }
        
        # Add nutritional data
        for nutrient in ALL_NUTRIENTS:
            if nutrient in food and not pd.isna(food[nutrient]):
                base_sample[nutrient] = food[nutrient]
        
        # Create mood-optimized sample (without desired nutrient)
        mood_sample = base_sample.copy()
        mood_df = pd.DataFrame([mood_sample])
        
        # Create preference-based sample (with desired nutrient)
        preference_sample = base_sample.copy()
        if desired_nutrient:
            preference_sample['desired_nutrient'] = desired_nutrient
        preference_df = pd.DataFrame([preference_sample])
        
        try:
            # Process mood-optimized recommendation
            X_mood = prepare_model_data(mood_df)
            
            if food_name in mappings['food_mapping']:
                food_idx = mappings['food_mapping'][food_name]
                mood_probs = model.predict_proba(X_mood)[0]
                
                mood_prob = mood_probs[food_idx] if food_idx < len(mood_probs) else 0.1
                
                mood_recommendations.append({
                    'food': food_name,
                    'type': food['Types'],
                    'probability': float(mood_prob),
                    'nutrition_data': {
                        nutrient: float(food[nutrient]) 
                        for nutrient in priority_nutrients 
                        if nutrient in food and not pd.isna(food[nutrient])
                    }
                })
            
            # Process preference-based recommendation if desired nutrient specified
            if desired_nutrient:
                X_pref = prepare_model_data(preference_df)
                
                if food_name in mappings['food_mapping']:
                    food_idx = mappings['food_mapping'][food_name]
                    pref_probs = model.predict_proba(X_pref)[0]
                    
                    pref_prob = pref_probs[food_idx] if food_idx < len(pref_probs) else 0.1
                    
                    # Boost probability based on nutrient content
                    if desired_nutrient in food and not pd.isna(food[desired_nutrient]):
                        nutrient_value = food[desired_nutrient]
                        max_value = food_data[desired_nutrient].max() if desired_nutrient in food_data else 1
                        
                        if max_value > 0:
                            boost_factor = 1 + (nutrient_value / max_value)
                            pref_prob *= boost_factor
                    
                    preference_recommendations.append({
                        'food': food_name,
                        'type': food['Types'],
                        'probability': float(pref_prob),
                        'nutrition_data': {
                            nutrient: float(food[nutrient]) 
                            for nutrient in (priority_nutrients + [desired_nutrient])
                            if nutrient in food and not pd.isna(food[nutrient])
                        }
                    })
        except Exception as e:
            print(f"Error processing {food_name}: {e}")
            continue
    
    # Sort recommendations by probability
    mood_recommendations.sort(key=lambda x: x['probability'], reverse=True)
    preference_recommendations.sort(key=lambda x: x['probability'], reverse=True)
    
    result = {
        'mood_optimized': {
            'recommended': mood_recommendations[0] if mood_recommendations else None,
            'suggested': mood_recommendations[1:min(4, len(mood_recommendations))] if len(mood_recommendations) > 1 else []
        }
    }
    
    if desired_nutrient and preference_recommendations:
        result['preference_based'] = {
            'recommended': preference_recommendations[0],
            'suggested': preference_recommendations[1:min(4, len(preference_recommendations))] if len(preference_recommendations) > 1 else []
        }
    
    return result

def get_available_nutrients():
    """Return list of all available nutrients that can be selected by the user"""
    # Simply return the existing ALL_NUTRIENTS list
    return ALL_NUTRIENTS