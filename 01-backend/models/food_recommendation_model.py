import joblib
import json
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import date, timedelta
import warnings

# Ẩn warning về feature names
warnings.filterwarnings("ignore", category=UserWarning, 
                       message="X does not have valid feature names, but RandomForest")

# Constants
SUPPORTED_EMOTIONS = ['sad', 'disgust', 'angry', 'neutral', 'surprise', 'happy', 'fear']
SUPPORTED_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
SUPPORTED_FOOD_TYPES = ['Fruits', 'Vegetables', 'Meat', 'Dairy', 'Grains', 'Snacks', 'Beverages']

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

# Predefined nutrition general limits by age group
NUTRITION_GENERAL_LIMITS = {
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

# Define models path
models_dir = Path(__file__).parent / "recommendation_models"
data_dir = Path(__file__).parent / "../data"

# Load models, encoders, and data
try:
    # Load trained models
    rank_model = joblib.load(models_dir / "rank_model.pkl")
    reg_model = joblib.load(models_dir / "score_model.pkl")
    binary_model = joblib.load(models_dir / "binary_model.pkl")
    
    # Load encoders
    encoders = joblib.load(models_dir / "encoders.pkl")
    meal_type_encoder = encoders['meal_type_encoder']
    food_type_encoder = encoders['food_type_encoder']
    emotion_encoder = encoders['emotion_encoder']
    
    # Load nutrition info
    with open(models_dir / "nutrition_info.json", 'r') as f:
        nutrition_info = json.load(f)
        nutrition_priorities = nutrition_info.get('nutrition_priorities', {})
        all_nutrients = nutrition_info.get('all_nutrients', [])
        feature_cols = nutrition_info.get('feature_cols', [])
    
    # Use predefined nutrition limits
    nutrition_general_limits = NUTRITION_GENERAL_LIMITS
    
    # Load reduced dataset
    food_data = pd.read_csv(data_dir / "reduced_nutrition_df.csv")
    
    # Initialize scaler for feature scaling
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    
    # Fit scaler on numeric columns of food data
    numeric_columns = food_data.select_dtypes(include=['float64', 'int64']).columns
    numeric_data = food_data[numeric_columns].fillna(0)
    scaler.fit(numeric_data)
    
    model_loaded = True
    print("✅ Food recommendation models loaded successfully")
except Exception as e:
    print(f"❌ Error loading food recommendation models: {e}")
    model_loaded = False
    nutrition_priorities = {}
    all_nutrients = []
    feature_cols = []
    nutrition_general_limits = NUTRITION_GENERAL_LIMITS  # Always use predefined limits

def check_nutrient_limits(food_row, age_group, tolerance=1.5):
    """
    Returns True if food is within nutritional limits, False if it violates limits.
    """
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
    Calculate compatibility score of food based on emotion with improved scaling
    """
    priority_nutrients = nutrition_priorities.get(emotion, [])
    if not priority_nutrients:
        return 0

    weights = np.linspace(1.0, 0.1, num=len(priority_nutrients))
    total_weight = np.sum(weights)
    score = 0

    for idx, nutrient in enumerate(priority_nutrients):
        if nutrient not in food_row:
            continue

        try:
            val = float(food_row.get(nutrient, 0))
            ideal = nutrition_general_limits.get(nutrient, {}).get(age_group, 1)
            ideal = float(ideal)

            if ideal > 0:
                # Calculate how close the value is to the ideal
                ratio = val / ideal
                if ratio > 2:  # More than double the ideal
                    factor = max(0, 1 - (ratio - 2) / 3)  # Penalty for excessive values
                elif ratio < 0.1:  # Less than 10% of ideal
                    factor = ratio * 2  # Small penalty for very low values
                else:
                    factor = 1 - min(1, abs(val - ideal) / ideal)

                score += (weights[idx] / total_weight) * factor * 10
        except:
            continue

    return round(score, 2)

def create_feature_vector(food_row, emotion, meal_type, age):
    """
    Create a feature vector from food information and context with improved feature handling
    """
    # Dictionary to store features with correct names
    feature_dict = {}
    
    # Fill in basic information with proper names
    for col in feature_cols:
        feature_dict[col] = 0  # Default value
        
        if col == 'age':
            feature_dict[col] = age
        elif col == 'Meal_Type_encoded':
            if meal_type in meal_type_encoder.classes_:
                feature_dict[col] = meal_type_encoder.transform([meal_type])[0]
        elif col == 'emotion_encoded':
            if emotion in emotion_encoder.classes_:
                feature_dict[col] = emotion_encoder.transform([emotion])[0]
        elif col == 'food_type_encoded':
            food_type = food_row['food_type']
            if food_type in food_type_encoder.classes_:
                feature_dict[col] = food_type_encoder.transform([food_type])[0]
        elif col == 'month_encoded':
            # Current month normalized to 0-1
            current_month = date.today().month
            feature_dict[col] = current_month / 12
    
    # Process nutrition data with proper feature names
    for nutrient in all_nutrients:
        if nutrient in food_row:
            try:
                val = float(food_row[nutrient])
                scaled_name = f'{nutrient}_scaled'
                if scaled_name in feature_cols:
                    feature_dict[scaled_name] = val
            except:
                continue
    
    # Create interaction features
    for e in nutrition_priorities.keys():
        priority_nutrients = nutrition_priorities.get(e, [])[:3]  # Top 3 priority nutrients
        for nutrient in priority_nutrients:
            feature_name = f'interaction_{e}_{nutrient}'
            if feature_name in feature_cols:
                if e == emotion:
                    # Get scaled nutrient value
                    scaled_name = f'{nutrient}_scaled'
                    if scaled_name in feature_dict:
                        feature_dict[feature_name] = feature_dict[scaled_name]
                else:
                    feature_dict[feature_name] = 0
    
    # Convert the dict to a feature vector array with exact same ordering as feature_cols
    feature_vector = np.zeros(len(feature_cols))
    for i, col in enumerate(feature_cols):
        feature_vector[i] = feature_dict.get(col, 0)
    
    return feature_vector

def parallel_with_direct_scoring(emotion, meal_type, age, food_type=None, num_recommendations=5):
    """
    Parallel approach but uses direct scoring for final sorting:
    1. Get separate recommendations from each model
    2. Combine and create consensus ranking
    3. Final ordering based on direct scoring
    """
    # Age group determination
    age_group = 'adult' if age > 15 else 'child'
    
    # Filter by food type if specified
    if food_type:
        valid_foods = food_data[food_data['food_type'] == food_type]
        if valid_foods.empty:  # If no foods match the filter, use all foods
            valid_foods = food_data
    else:
        valid_foods = food_data
    
    # Filter by nutrition limits
    valid_foods = valid_foods[valid_foods.apply(
        lambda row: check_nutrient_limits(row, age_group), axis=1
    )]
    
    if valid_foods.empty:
        return None, []
    
    # Process all valid foods through each model
    food_scores = {}
    
    for _, food_row in valid_foods.iterrows():
        food_name = food_row['food']
        food_type_val = food_row['food_type']
        
        if food_type_val not in food_type_encoder.classes_:
            continue
            
        try:
            feature_vector = create_feature_vector(food_row, emotion, meal_type, age)
            
            # Get scores from all models
            rank_prediction = rank_model.predict([feature_vector])[0]
            binary_score = binary_model.predict_proba([feature_vector])[0][1]
            reg_score = reg_model.predict([feature_vector])[0]
            
            # Calculate direct score
            direct_score = calculate_compatibility_score(food_row, emotion, age_group)
            
            food_scores[food_name] = {
                'food': food_name,
                'food_type': food_type_val,
                'rank_score': rank_prediction,  # Lower is better
                'binary_score': binary_score,   # Higher is better
                'reg_score': reg_score,         # Higher is better
                'direct_score': direct_score,   # Higher is better
                'feature_vector': feature_vector,
                'food_row': food_row
            }
        except Exception as e:
            print(f"Error processing food {food_name}: {e}")
            continue
    
    # Exit if no valid foods were processed
    if not food_scores:
        return None, []
    
    # Get top recommendations by each model
    top_by_rank = sorted(food_scores.values(), key=lambda x: x['rank_score'])[:5]
    top_by_binary = sorted(food_scores.values(), key=lambda x: x['binary_score'], reverse=True)[:5]
    top_by_reg = sorted(food_scores.values(), key=lambda x: x['reg_score'], reverse=True)[:5]
    
    # Create a set of unique foods from all models
    unique_foods = {}
    
    # Add foods with their "votes" (appearance count)
    for food in top_by_rank + top_by_binary + top_by_reg:
        name = food['food']
        if name in unique_foods:
            unique_foods[name]['votes'] += 1
        else:
            unique_foods[name] = food.copy()
            unique_foods[name]['votes'] = 1
    
    # Create consensus ranking
    for name, food in unique_foods.items():
        # Calculate average position
        rank_pos = next((i+1 for i, f in enumerate(top_by_rank) if f['food'] == name), 999)
        binary_pos = next((i+1 for i, f in enumerate(top_by_binary) if f['food'] == name), 999)
        reg_pos = next((i+1 for i, f in enumerate(top_by_reg) if f['food'] == name), 999)
        
        # Normalize to 0-1 where 0 is best
        positions = []
        if rank_pos <= 5: positions.append((rank_pos-1)/4)
        if binary_pos <= 5: positions.append((binary_pos-1)/4)
        if reg_pos <= 5: positions.append((reg_pos-1)/4)
        
        food['avg_position'] = sum(positions)/len(positions) if positions else 1.0
        
        # Calculate consensus score
        food['consensus_score'] = food['votes'] - food['avg_position']
    
    # Identify top candidates by consensus
    consensus_candidates = sorted(unique_foods.values(),
                               key=lambda x: (x['votes'], -x['avg_position']),
                               reverse=True)[:10]  # Take top 10 by consensus
    
    # FINAL STEP: Use direct scoring to sort the consensus candidates
    final_sorted = sorted(consensus_candidates, key=lambda x: x['direct_score'], reverse=True)
    
    # Get top recommendation and alternatives
    recommendation = None
    alternatives = []
    
    if final_sorted:
        top_food = final_sorted[0]
        food_row = top_food['food_row']
        
        # Extract nutrition data, including all nutrients with zero values
        nutrition_data = {}
        for nutrient in food_row.index:
            if not pd.isna(food_row[nutrient]):
                try:
                    nutrition_data[nutrient] = float(food_row[nutrient])
                except:
                    nutrition_data[nutrient] = food_row[nutrient]
        
        # Ensure all standard nutrients are present, even if zero
        for nutrient in get_available_nutrients():
            if nutrient not in nutrition_data:
                nutrition_data[nutrient] = 0.0
        
        # Format recommendation
        recommendation = {
            'food': top_food['food'],
            'type': top_food['food_type'],
            'nutrition_data': nutrition_data,
            'image_url': food_row.get('image_url', ''),  # Include image URL if available
            'model_scores': {
                'rank_score': float(top_food['rank_score']),
                'binary_score': float(top_food['binary_score']),
                'reg_score': float(top_food['reg_score']),
                'direct_score': float(top_food['direct_score']),
                'votes': int(top_food['votes']),
                'consensus_score': float(top_food['consensus_score'])
            }
        }
        
        # Format alternatives (up to 3)
        for alt_food in final_sorted[1:min(4, len(final_sorted))]:
            food_row = alt_food['food_row']
            
            # Extract nutrition data with zero values
            alt_nutrition_data = {}
            for nutrient in food_row.index:
                if not pd.isna(food_row[nutrient]):
                    try:
                        alt_nutrition_data[nutrient] = float(food_row[nutrient])
                    except:
                        alt_nutrition_data[nutrient] = food_row[nutrient]
            
            # Ensure all standard nutrients are present
            for nutrient in get_available_nutrients():
                if nutrient not in alt_nutrition_data:
                    alt_nutrition_data[nutrient] = 0.0
            
            alternatives.append({
                'food': alt_food['food'],
                'type': alt_food['food_type'],
                'nutrition_data': alt_nutrition_data,
                'image_url': food_row.get('image_url', '')
            })
    
    return recommendation, alternatives

def get_food_recommendations(emotion, birth_date, user_id=None, meal_time=None, food_type=None):
    """
    Get food recommendations based on emotion, user info, and preferences using the parallel model approach
    """
    if not model_loaded:
        return {"error": "Recommendation model not loaded"}
    
    # Normalize input
    emotion = emotion.lower() if emotion else "neutral"
    if emotion not in SUPPORTED_EMOTIONS:
        return {
            "error": f"Unsupported emotion: {emotion}. Valid emotions are: {', '.join(SUPPORTED_EMOTIONS)}",
            "status": "error"
        }
    
    if not meal_time or meal_time not in SUPPORTED_MEAL_TYPES:
        return {
            "error": f"Unsupported meal type: {meal_time}. Valid meal types are: {', '.join(SUPPORTED_MEAL_TYPES)}",
            "status": "error"
        }
    
    # Calculate age
    today = date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    
    try:
        # Get recommendations using parallel approach
        recommendation, alternatives = parallel_with_direct_scoring(
            emotion=emotion,
            meal_type=meal_time,
            age=age,
            food_type=food_type
        )
        
        # Kiểm tra xem có tìm được recommendation không
        if not recommendation:
            return {
                "error": f"No suitable food found for {emotion} emotion" + 
                        (f" and {food_type} type" if food_type else ""),
                "status": "error"
            }
        
        # Kiểm tra trực tiếp emotion trong EMOTION_PRIORITY_NUTRIENTS
        if emotion not in EMOTION_PRIORITY_NUTRIENTS:
            return {
                "error": f"Priority nutrients not defined for emotion: {emotion}",
                "status": "error"
            }
            
        # Lấy priority nutrients trực tiếp
        priority_nutrients = EMOTION_PRIORITY_NUTRIENTS[emotion]
        
        return {
            'status': 'success',
            'recommendation': recommendation,
            'alternatives': alternatives,
            'priority_nutrients': priority_nutrients
        }
    
    except Exception as e:
        print(f"❌ Error in recommendation process: {e}")
        return {
            "error": f"Failed to generate recommendations: {str(e)}",
            "status": "error"
        }

def get_available_nutrients():
    """Return list of nutrients that can be selected by the user"""
    return [
        'Caloric Value', 'Fat', 'Saturated Fats', 'Monounsaturated Fats', 'Polyunsaturated Fats',
        'Carbohydrates', 'Sugars', 'Protein', 'Dietary Fiber', 'Cholesterol', 'Sodium',
        'Vitamin A', 'Vitamin B1', 'Vitamin B11', 'Vitamin B12', 'Vitamin B2', 'Vitamin B3',
        'Vitamin B5', 'Vitamin B6', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K',
        'Calcium', 'Iron', 'Magnesium', 'Phosphorus', 'Potassium', 'Zinc'
    ]

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
    """
    # Kiểm tra emotion hợp lệ
    if emotion.lower() not in SUPPORTED_EMOTIONS:
        return {
            "error": f"Unsupported emotion: {emotion}. Valid emotions are: {', '.join(SUPPORTED_EMOTIONS)}",
            "status": "error"
        }
    
    # Kiểm tra meal_time hợp lệ
    if meal_time not in SUPPORTED_MEAL_TYPES:
        return {
            "error": f"Unsupported meal type: {meal_time}. Valid meal types are: {', '.join(SUPPORTED_MEAL_TYPES)}",
            "status": "error"
        }
    
    # Kiểm tra food_type nếu được cung cấp
    if preferred_food_type and preferred_food_type not in SUPPORTED_FOOD_TYPES:
        return {
            "error": f"Unsupported food type: {preferred_food_type}. Valid food types are: {', '.join(SUPPORTED_FOOD_TYPES)}",
            "status": "error"
        }
    
    # Get user history
    user_history = get_user_history(user_id)
    
    # Get base recommendations
    base_recs = get_food_recommendations(
        emotion, 
        date.today() - timedelta(days=age*365), 
        meal_time=meal_time, 
        food_type=preferred_food_type
    )
    
    # Kiểm tra nếu base_recs có lỗi
    if 'error' in base_recs:
        return base_recs
    
    # Kiểm tra nếu không có lịch sử
    if not user_history:
        return base_recs
    
    # Analyze user preferences
    liked_foods = [entry['food'] for entry in user_history if entry['rating'] >= 4]
    disliked_foods = [entry['food'] for entry in user_history if entry['rating'] <= 2]
    
    # Get main recommendation and alternatives
    recommendation = base_recs.get('recommendation')
    alternatives = base_recs.get('alternatives', [])
    
    # Combine into one list for processing
    all_recommendations = [recommendation] + alternatives if recommendation else alternatives
    
    # Kiểm tra nếu không có recommendation
    if not all_recommendations:
        return {
            "error": "No recommendations available after filtering",
            "status": "error"
        }
    
    # Filter and reorder based on user preferences
    adjusted_recommendations = []
    
    # First add liked foods that are in recommendations
    for rec in all_recommendations:
        if rec.get('food') in liked_foods:
            adjusted_recommendations.append(rec)
    
    # Then add other recommendations that are not disliked
    for rec in all_recommendations:
        if rec.get('food') not in disliked_foods and rec not in adjusted_recommendations:
            adjusted_recommendations.append(rec)
    
    # Kiểm tra nếu tất cả thức ăn đều bị ghét
    if not adjusted_recommendations:
        return {
            "error": "All potential recommendations have been disliked by user",
            "status": "error",
            "disliked_foods": disliked_foods
        }
    
    # Lấy priority nutrients trực tiếp
    if emotion not in EMOTION_PRIORITY_NUTRIENTS:
        return {
            "error": f"Priority nutrients not defined for emotion: {emotion}",
            "status": "error"
        }
    
    priority_nutrients = EMOTION_PRIORITY_NUTRIENTS[emotion]
    
    return {
        'status': 'success',
        'recommendation': adjusted_recommendations[0],
        'alternatives': adjusted_recommendations[1:4] if len(adjusted_recommendations) > 1 else [],
        'priority_nutrients': priority_nutrients
    }