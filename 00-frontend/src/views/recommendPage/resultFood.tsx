import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { 
  faArrowLeft, 
  faFloppyDisk, 
  faStar,
  faInfoCircle,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";
import * as Haptics from "expo-haptics";
import { RootStackParamList } from "../../navigations/AppNavigator";
import { 
  getFoodRecommendations, 
  selectFood,
  rateFood,
  getFoodExplanation
} from "../../services/api";
import { styles } from "../../styles/resultFoodStyle";

// Extended interfaces
interface NutrientExplanation {
  name: string;
  value: number;
  explanation: string;
}

interface Recommendation {
  food: string;
  type: string;
  nutrition_data: Record<string, number>;
  image_url?: string;
}

interface ExplanationResponse {
  food_name: string;
  food_type: string;
  emotion_explanation: string;
  food_explanation: string;
  priority_nutrients: NutrientExplanation[];
  scientific_summary: string;
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
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(true);
  const [logId, setLogId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [priorityNutrients, setPriorityNutrients] = useState<string[]>([]);
  const [loadingNutrients, setLoadingNutrients] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientExplanation | null>(null);
  
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
            
            // Get explanation for this recommendation
            fetchExplanation(response.recommendation, storedEmotion || "neutral");
          } else {
            setError("No recommendations found");
          }
          
          // Set priority nutrients
          if (response.priority_nutrients) {
            setPriorityNutrients(response.priority_nutrients);
            setLoadingNutrients(false);
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

  const fetchExplanation = async (recommendation: Recommendation, emotion: string) => {
    try {
      setLoadingExplanation(true);
      const explanationData = await getFoodExplanation(recommendation, emotion);
      setExplanation(explanationData);
    } catch (error) {
      console.error("Error fetching explanation:", error);
      // Continue without explanation if there's an error
    } finally {
      setLoadingExplanation(false);
    }
  };

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

  const showNutrientDetail = (nutrient: NutrientExplanation) => {
    setSelectedNutrient(nutrient);
    setModalVisible(true);
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

  // Get explanation for a nutrient
  const getNutrientExplanation = (nutrient: string) => {
    if (!explanation || !explanation.priority_nutrients) return null;
    
    return explanation.priority_nutrients.find(
      pn => nutrient.toLowerCase() === pn.name.toLowerCase()
    );
  };

  // Function to get appropriate unit for a nutrient
  const getNutrientUnit = (nutrientName: string) => {
    if (nutrientName === "Caloric Value") return "kcal";
    return "mg"; 
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
            
            {/* Scientific explanation - new section */}
            {explanation && (
              <View style={[styles.explanationSection, { borderLeftColor: getEmotionColor() }]}>
                <Text style={styles.explanationTitle}>
                  <FontAwesomeIcon icon={faLightbulb} size={16} color={getEmotionColor()} /> 
                  How this helps your {emotion} mood:
                </Text>
                <Text style={styles.explanationText}>
                  {explanation.emotion_explanation}
                </Text>
                
                {explanation.scientific_summary && (
                  <Text style={styles.scientificSummary}>
                    {explanation.scientific_summary}
                  </Text>
                )}
              </View>
            )}
            
            {/* Priority nutrients section - enhanced version */}
            {priorityNutrients && priorityNutrients.length > 0 ? (
              <View style={styles.priorityNutrientsContainer}>
                <Text style={[styles.priorityNutrientTitle, { color: getEmotionColor() }]}>
                  Key Nutrients for {emotion.charAt(0).toUpperCase() + emotion.slice(1)} Mood:
                </Text>
                
                {priorityNutrients.map((nutrientName, index) => {
                  // Find the nutrient data in the recommendation
                  const nutrientKey = Object.keys(recommendation.nutrition_data).find(
                    key => key.toLowerCase() === nutrientName.toLowerCase() ||
                          key.toLowerCase().includes(nutrientName.toLowerCase())
                  );
                  
                  if (!nutrientKey) return null;
                  
                  const nutrientValue = recommendation.nutrition_data[nutrientKey];
                  const nutrientExp = explanation?.priority_nutrients?.find(pn => 
                    pn.name.toLowerCase() === nutrientName.toLowerCase() ||
                    pn.name.toLowerCase().includes(nutrientName.toLowerCase())
                  );
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.priorityNutrientItem}
                      onPress={() => nutrientExp && showNutrientDetail(nutrientExp)}
                      disabled={!nutrientExp}
                    >
                      <View style={styles.priorityNutrientHeader}>
                        <Text style={styles.priorityNutrientName}>{nutrientName}</Text>
                        {nutrientExp && (
                          <FontAwesomeIcon icon={faInfoCircle} size={16} color={getEmotionColor()} />
                        )}
                      </View>
                      <Text style={styles.priorityNutrientValue}>
                        {typeof nutrientValue === 'number' ? nutrientValue.toFixed(1) : nutrientValue}
                        {' '}{getNutrientUnit(nutrientKey)}
                      </Text>
                      {nutrientExp && (
                        <Text style={styles.priorityNutrientShortDesc} numberOfLines={2}>
                          {nutrientExp.explanation}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : !loadingNutrients && (
              <View style={styles.priorityNutrientSection}>
                <Text style={[styles.priorityNutrientTitle, { color: getEmotionColor() }]}>
                  No specific key nutrients found for this mood
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
        
        {/* Complete Nutritional information */}
        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Complete Nutritional Information</Text>
          <View style={styles.nutrientsGrid}>
            {recommendation.nutrition_data && 
              Object.entries(recommendation.nutrition_data)
                .filter(([name, _]) => name !== 'food' && name !== 'food_type')
                .sort((a, b) => {
                  // Sort priority nutrients first based on their order in priorityNutrients array
                  const aIndex = priorityNutrients.findIndex(n => 
                    a[0].toLowerCase().includes(n.toLowerCase())
                  );
                  const bIndex = priorityNutrients.findIndex(n => 
                    b[0].toLowerCase().includes(n.toLowerCase())
                  );
                  
                  // If both are priority nutrients, sort by their order in priorityNutrients
                  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                  
                  // If only one is a priority nutrient, it comes first
                  if (aIndex !== -1) return -1;
                  if (bIndex !== -1) return 1;
                  
                  // Otherwise sort alphabetically
                  return a[0].localeCompare(b[0]);
                })
                .map(([name, value], index) => {
                  const isPriority = isPriorityNutrient(name);
                  const nutrientExp = getNutrientExplanation(name);
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.nutrientItem, 
                        isPriority && styles.nutrientItemPriority
                      ]}
                      onPress={() => nutrientExp && showNutrientDetail(nutrientExp)}
                      disabled={!nutrientExp}
                    >
                      <Text style={styles.nutrientName}>{name}</Text>
                      <Text style={styles.nutrientValue}>
                        {typeof value === 'number' ? value.toFixed(1) : value}
                        <Text style={styles.nutrientUnit}>{getNutrientUnit(name)}</Text>
                      </Text>
                      {isPriority && (
                        <Text style={[styles.priorityLabel, { color: getEmotionColor() }]}>
                          KEY FOR {emotion.toUpperCase()}
                          {nutrientExp && " ℹ️"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })
            }
          </View>
        </View>
      </ScrollView>

      {/* Nutrient detail modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nutrient Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            {selectedNutrient && (
              <View style={styles.modalBody}>
                <Text style={styles.modalNutrientName}>{selectedNutrient.name}</Text>
                <Text style={styles.modalNutrientValue}>
                  {selectedNutrient.value.toFixed(1)} {getNutrientUnit(selectedNutrient.name)} in this {recommendation.type}
                </Text>
                
                <View style={styles.modalDivider} />
                
                <Text style={styles.modalSectionTitle}>
                  How it helps your {emotion} mood:
                </Text>
                <Text style={styles.modalExplanation}>
                  {selectedNutrient.explanation}
                </Text>
                
                <View style={styles.modalDivider} />
                
                <Text style={styles.modalSectionTitle}>
                  Research-backed benefits:
                </Text>
                <Text style={styles.modalResearch}>
                  Studies have shown that {selectedNutrient.name} can significantly impact your emotional state, especially when experiencing {emotion} moods.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

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