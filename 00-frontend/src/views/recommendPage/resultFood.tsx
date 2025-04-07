import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { 
  faArrowLeft, 
  faFloppyDisk, 
  faStar
} from "@fortawesome/free-solid-svg-icons";
import * as Haptics from "expo-haptics";
import { RootStackParamList } from "../../navigations/AppNavigator";
import { 
  getFoodRecommendations, 
  selectFood,
  rateFood,
  fetchAvailableNutrients 
} from "../../services/api";
import { styles } from "../../styles/resultFoodStyle";

// Đặt interface ở ngoài component
interface Recommendation {
  food: string;
  type: string;
  nutrition_data: Record<string, number>;
  image_url?: string;
}

interface ApiResponse {
  status: string;
  user_name?: string;
  recommendation: Recommendation | null;
  priority_nutrients: string[];
  log_id: number;
}

type ResultFoodNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ResultFood"
>;

const ResultFood: React.FC = () => {
  const navigation = useNavigation<ResultFoodNavigationProp>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string>("neutral");
  const [mealTime, setMealTime] = useState<string>("Lunch");
  const [foodType, setFoodType] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [logId, setLogId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [priorityNutrients, setPriorityNutrients] = useState<string[]>([]);
  const [loadingNutrients, setLoadingNutrients] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get saved preferences from AsyncStorage
        const storedEmotion = await AsyncStorage.getItem("emotion");
        const storedFoodType = await AsyncStorage.getItem("foodType");
        const storedMealTime = await AsyncStorage.getItem("mealTime");
  
        if (storedEmotion) setEmotion(storedEmotion);
        if (storedFoodType) setFoodType(storedFoodType);
        if (storedMealTime) setMealTime(storedMealTime);
        
        // Get recommendations from API
        const response = await getFoodRecommendations(
          storedEmotion || "neutral",
          storedMealTime || "Lunch",
          storedFoodType || undefined
        );
  
        if (!response) {
          setError("Empty response from server");
          return;
        }
        
        // Process API response
        if (response.status === "success") {
          // Set username if available
          if (response.user_name) {
            setUserName(response.user_name);
          }
          
          // Set log ID
          if (response.log_id) {
            setLogId(response.log_id);
          }
          
          // Set recommendation
          if (response.recommendation) {
            setRecommendation(response.recommendation);
          } else {
            setError("No recommendations found");
          }
          
          // Set priority nutrients
          if (response.priority_nutrients) {
            setPriorityNutrients(response.priority_nutrients);
          }
        } else {
          setError("Invalid response format");
        }
      } catch (error: any) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to get food recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRecommendations();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRating = async (rating: number) => {
    if (!logId) return;
    
    setUserRating(rating);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasRated(true);
    
    try {
      await rateFood(logId, rating);
      
      setTimeout(() => {
        Alert.alert(
          "Thank You!",
          "Your feedback helps us improve our recommendations.",
          [{ text: "OK" }]
        );
      }, 500);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleSaveRecommendation = async () => {
    if (!recommendation || !logId) {
      Alert.alert("Error", "No recommendation to save");
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      await selectFood(
        logId, 
        recommendation.food
      );
      
      Alert.alert(
        "Success",
        "Food recommendation saved to your profile!",
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } catch (error: any) {
      console.error("Error saving recommendation:", error);
      Alert.alert("Error", "Failed to save recommendation");
    }
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case "angry":
        return "#FF5A63"; // Red
      case "happy":
        return "#5CEA7E"; // Green
      case "neutral":
        return "#6EA9F7"; // Blue
      case "sad":
        return "#805AE3"; // Purple
      case "surprise":
        return "#FFA500"; // Orange
      case "fear":
        return "#9932CC"; // Dark Orchid
      case "disgust":
        return "#8B4513"; // Saddle Brown
      default:
        return "#6EA9F7"; // Default blue
    }
  };

  // Helper function to check if a nutrient is a priority
  const isPriorityNutrient = (nutrient: string) => {
    if (!priorityNutrients || priorityNutrients.length === 0) return false;
    
    return priorityNutrients.some(
      pn => nutrient.toLowerCase().includes(pn.toLowerCase())
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={getEmotionColor()} />
        <Text style={styles.loadingText}>Finding the perfect food for your mood...</Text>
      </View>
    );
  }

  if (error || !recommendation) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>{error || "No recommendations found."}</Text>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: getEmotionColor(), marginTop: 20 }]}
          onPress={handleBack}
        >
          <Text style={styles.actionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#5C6A7E" />
        </TouchableOpacity>
        <Text style={styles.title}>Food Recommendation</Text>
      </View>

      {/* User greeting */}
      <View style={styles.userGreeting}>
        <Text style={styles.userGreetingText}>
          Hey{userName ? ` ${userName}` : ""}! Based on your 
          <Text style={[styles.highlightText, { color: getEmotionColor() }]}> {emotion} </Text> 
          mood, here's what we recommend for 
          <Text style={styles.highlightText}> {mealTime}</Text>
        </Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Main food card */}
        <View style={styles.mainFoodCard}>
          <Image
            source={{ 
              uri: recommendation.image_url || 
                `https://via.placeholder.com/400/${getEmotionColor().substring(1)}/FFFFFF?text=${encodeURIComponent(recommendation.food)}`
            }}
            style={styles.mainFoodImage}
            resizeMode="cover"
          />
          
          <View style={styles.mainFoodDetails}>
            <View style={styles.foodTitleRow}>
              <Text style={styles.mainFoodName}>
                {recommendation.food}
              </Text>
            </View>
            
            <Text style={styles.foodType}>
              {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
            </Text>
            
            {/* Priority nutrients section - only show if we have data */}
            {!loadingNutrients && priorityNutrients.length > 0 && (
              <View style={styles.priorityNutrientSection}>
                <Text style={[styles.priorityNutrientTitle, { color: getEmotionColor() }]}>
                  Key Nutrients for {emotion.charAt(0).toUpperCase() + emotion.slice(1)} Mood:
                </Text>
                <Text style={styles.priorityNutrientDescription}>
                  {priorityNutrients.join(', ')}
                </Text>
              </View>
            )}
            
            {/* Rate this recommendation */}
            {!hasRated && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rate this recommendation:</Text>
                <View style={styles.starContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity 
                      key={star}
                      onPress={() => handleRating(star)}
                    >
                      <FontAwesomeIcon 
                        icon={faStar} 
                        size={24} 
                        color={userRating >= star ? "#FFC107" : "#E5E7EB"} 
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {hasRated && (
              <View style={styles.ratedContainer}>
                <Text style={styles.ratedText}>
                  Thanks for your rating of {userRating}/5!
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Nutritional information */}
        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Nutritional Information</Text>
          <View style={styles.nutrientsGrid}>
            {recommendation.nutrition_data && 
              Object.entries(recommendation.nutrition_data)
                .sort((a, b) => {
                  // Sort priority nutrients first
                  const aPriority = isPriorityNutrient(a[0]);
                  const bPriority = isPriorityNutrient(b[0]);
                  
                  if (aPriority && !bPriority) return -1;
                  if (!aPriority && bPriority) return 1;
                  return a[0].localeCompare(b[0]);
                })
                .map(([name, value], index) => {
                  const isPriority = isPriorityNutrient(name);
                  
                  return (
                    <View 
                      key={index} 
                      style={[
                        styles.nutrientItem, 
                        isPriority && styles.nutrientItemPriority
                      ]}
                    >
                      <Text style={styles.nutrientName}>{name}</Text>
                      <Text style={styles.nutrientValue}>
                        {typeof value === 'number' ? value.toFixed(1) : value}
                        <Text style={styles.nutrientUnit}>mg</Text>
                      </Text>
                      {isPriority && (
                        <Text style={[styles.priorityLabel, { color: getEmotionColor() }]}>
                          KEY FOR {emotion.toUpperCase()}
                        </Text>
                      )}
                    </View>
                  );
                })
            }
          </View>
        </View>
      </ScrollView>

      {/* Footer action buttons - show save button only after rating */}
      {hasRated && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerSaveButton, { backgroundColor: getEmotionColor() }]}
            onPress={handleSaveRecommendation}
          >
            <FontAwesomeIcon icon={faFloppyDisk} size={20} color="white" />
            <Text style={[styles.footerButtonText, { color: "white" }]}>
              Save & Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ResultFood;