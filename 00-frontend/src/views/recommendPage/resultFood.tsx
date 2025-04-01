import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { faArrowLeft, faFloppyDisk, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { RootStackParamList } from "../../navigations/AppNavigator";
import { getFoodRecommendations, getFoodExplanation } from "../../services/api";

type ResultFoodNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ResultFood"
>;

interface Recommendation {
  food: string;
  type: string;
  probability: number;
  nutrition_data: Record<string, number>;
}

interface RecommendationResponse {
  mood_optimized: {
    recommended: Recommendation | null;
    suggested: Recommendation[];
  };
  preference_based?: {
    recommended: Recommendation | null;
    suggested: Recommendation[];
  };
  log_id?: number;
  user_name?: string;
}

const ResultFood: React.FC = () => {
  const navigation = useNavigation<ResultFoodNavigationProp>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string>("neutral");
  const [foodType, setFoodType] = useState<string>("dessert");
  const [desiredNutrient, setDesiredNutrient] = useState<string>("");
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [logId, setLogId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<"mood" | "preference">("mood");
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [explanation, setExplanation] = useState<any>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get saved preferences from AsyncStorage
        const storedEmotion = await AsyncStorage.getItem("emotion");
        const storedFoodType = await AsyncStorage.getItem("foodType");
        const storedNutrient = await AsyncStorage.getItem("desiredNutrient");

        if (storedEmotion) setEmotion(storedEmotion);
        if (storedFoodType) setFoodType(storedFoodType);
        if (storedNutrient) setDesiredNutrient(storedNutrient);

        // Get recommendations from API
        const response = await getFoodRecommendations(
          storedEmotion || "neutral",
          storedFoodType || "dessert",
          storedNutrient || ""
        );

        setRecommendations(response);
        if (response.log_id) {
          setLogId(response.log_id);
        }

        // Set the initial selected recommendation
        if (response.mood_optimized && response.mood_optimized.recommended) {
          setSelectedRecommendation(response.mood_optimized.recommended);
          
          // Get explanation for the mood-optimized recommendation
          try {
            const explanationData = await getFoodExplanation(
              response.mood_optimized.recommended,
              storedEmotion || "neutral",
              storedNutrient || ""
            );
            setExplanation(explanationData);
          } catch (explanationError) {
            console.error("❌ Error fetching explanation:", explanationError);
            // Just set explanation to null if it fails
            setExplanation(null);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching recommendations:", error);
        setError("Failed to get food recommendations. Please try again.");
        setRecommendations(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    navigation.navigate("Home");
  };

  const handleSaveRecommendation = async () => {
    Alert.alert(
      "Success",
      "Food recommendation saved to your profile!",
      [{ text: "OK" }]
    );
  };

  const handleTrackMood = () => {
    navigation.navigate("Tracking");
  };

  const handleTabChange = async (tab: "mood" | "preference") => {
    setSelectedTab(tab);
    
    if (tab === "mood" && recommendations?.mood_optimized?.recommended) {
      setSelectedRecommendation(recommendations.mood_optimized.recommended);
    } else if (tab === "preference" && recommendations?.preference_based?.recommended) {
      setSelectedRecommendation(recommendations.preference_based.recommended);
      
      // Try to get explanation for the preference-based recommendation if it changes
      try {
        const explanationData = await getFoodExplanation(
          recommendations.preference_based.recommended,
          emotion,
          desiredNutrient
        );
        setExplanation(explanationData);
      } catch (error) {
        console.error("❌ Error fetching explanation:", error);
        setExplanation(null);
      }
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={getEmotionColor()} />
        <Text style={styles.loadingText}>Finding the perfect food for your mood...</Text>
      </View>
    );
  }

  if (error || !selectedRecommendation) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>{error || "No recommendations found."}</Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: getEmotionColor(), marginTop: 20 }]}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#5C6A7E" />
        </TouchableOpacity>
        <Text style={styles.title}>Food Recommendation</Text>
      </View>

      {/* Tabs for switching between mood and preference recommendations */}
      {recommendations?.preference_based?.recommended && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "mood" && [styles.activeTab, { borderBottomColor: getEmotionColor() }]
            ]}
            onPress={() => handleTabChange("mood")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "mood" && [styles.activeTabText, { color: getEmotionColor() }]
              ]}
            >
              Mood Optimized
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "preference" && [styles.activeTab, { borderBottomColor: getEmotionColor() }]
            ]}
            onPress={() => handleTabChange("preference")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "preference" && [styles.activeTabText, { color: getEmotionColor() }]
              ]}
            >
              {desiredNutrient ? `${desiredNutrient} Enhanced` : "Preference"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Food image placeholder */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/300" }}
            style={styles.foodImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.recommendationContent}>
          <Text style={styles.foodName}>{selectedRecommendation.food}</Text>
          <Text style={styles.foodType}>
            {selectedRecommendation.type.charAt(0).toUpperCase() + selectedRecommendation.type.slice(1)}
          </Text>
          
          {explanation && (
            <>
              <View style={styles.explanationSection}>
                <Text style={styles.sectionTitle}>Why This Food?</Text>
                <Text style={styles.explanationText}>{explanation.emotion_explanation}</Text>
                <Text style={styles.explanationText}>{explanation.food_explanation}</Text>
              </View>
              
              <View style={styles.nutritionSection}>
                <Text style={styles.sectionTitle}>Key Nutrients</Text>
                {explanation.nutrient_explanations && Object.entries(explanation.nutrient_explanations).map(([name, data]: [string, any]) => (
                  <View key={name} style={styles.nutrientItem}>
                    <View style={styles.nutrientHeader}>
                      <Text style={styles.nutrientName}>{name}</Text>
                      <Text style={styles.nutrientValue}>
                        {typeof data.value === 'number' ? data.value.toFixed(1) : data.value}mg
                      </Text>
                    </View>
                    <Text style={styles.nutrientExplanation}>{data.explanation}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.summarySection}>
                <Text style={styles.summaryText}>{explanation.summary}</Text>
              </View>
            </>
          )}
          
          {!explanation && (
            <View style={styles.nutritionSection}>
              <Text style={styles.sectionTitle}>Nutritional Content</Text>
              {selectedRecommendation.nutrition_data && Object.entries(selectedRecommendation.nutrition_data).map(([name, value]) => (
                <View key={name} style={styles.nutrientItem}>
                  <View style={styles.nutrientHeader}>
                    <Text style={styles.nutrientName}>{name}</Text>
                    <Text style={styles.nutrientValue}>{typeof value === 'number' ? value.toFixed(1) : value}mg</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: "#F3F4F6" }]}
          onPress={handleSaveRecommendation}
        >
          <FontAwesomeIcon icon={faFloppyDisk} size={20} color="#5C6A7E" />
          <Text style={styles.footerButtonText}>Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: getEmotionColor() }]}
          onPress={handleTrackMood}
        >
          <FontAwesomeIcon icon={faChartLine} size={20} color="white" />
          <Text style={[styles.footerButtonText, { color: "white" }]}>Track Mood</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  headerBackButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    color: "#1F2937",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#E5E7EB",
  },
  foodImage: {
    width: "100%",
    height: "100%",
  },
  recommendationContent: {
    padding: 16,
  },
  foodName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  foodType: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  explanationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
  },
  nutritionSection: {
    marginBottom: 24,
  },
  nutrientItem: {
    marginBottom: 16,
  },
  nutrientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nutrientName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#059669",
  },
  nutrientExplanation: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  summarySection: {
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  footerButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
});

export default ResultFood;