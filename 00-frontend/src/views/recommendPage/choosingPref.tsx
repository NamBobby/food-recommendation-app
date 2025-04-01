import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { RootStackParamList } from "../../navigations/AppNavigator";
import { fetchAvailableNutrients, fetchFoodTypes } from "../../services/api";

type ChoosingPrefNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ChoosingPref"
>;

const ChoosingPref: React.FC = () => {
  const navigation = useNavigation<ChoosingPrefNavigationProp>();
  const [emotion, setEmotion] = useState<string>("neutral");
  const [selectedFoodType, setSelectedFoodType] = useState<string>("dessert");
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(
    "None"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [nutrients, setNutrients] = useState<string[]>(["None"]);
  const [foodTypes, setFoodTypes] = useState<string[]>([]);

  // Dropdown open states
  const [nutrientOpen, setNutrientOpen] = useState(false);

  // State for dropdown search
  const [nutrientSearch, setNutrientSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Get emotion from AsyncStorage
        const storedEmotion = await AsyncStorage.getItem("emotion");
        if (storedEmotion) {
          setEmotion(storedEmotion);
        }

        // Fetch available food types
        try {
          const fetchedFoodTypes = await fetchFoodTypes();

          if (
            fetchedFoodTypes &&
            Array.isArray(fetchedFoodTypes) &&
            fetchedFoodTypes.length > 0
          ) {
            setFoodTypes(fetchedFoodTypes);
            setSelectedFoodType(fetchedFoodTypes[0]);
          }
        } catch (error) {
          console.error("❌ Error fetching food types:", error);
        }

        // Fetch available nutrients
        try {
          const fetchedNutrients = await fetchAvailableNutrients();

          if (
            fetchedNutrients &&
            Array.isArray(fetchedNutrients) &&
            fetchedNutrients.length > 0
          ) {
            // Add "None" at the beginning of the list
            setNutrients(["None", ...fetchedNutrients]);
          }
        } catch (error) {
          console.error("❌ Error fetching nutrients:", error);
        }
      } catch (error) {
        console.error("❌ General error in data fetching:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      // Save preferences to AsyncStorage
      await AsyncStorage.setItem("foodType", selectedFoodType);
      await AsyncStorage.setItem(
        "desiredNutrient",
        selectedNutrient === "None" ? "" : selectedNutrient || ""
      );

      // Navigate to result page
      navigation.navigate("ResultFood");
    } catch (error) {
      console.error("❌ Error saving preferences:", error);
    } finally {
      setLoading(false);
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

  if (loadingData) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={getEmotionColor()} />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#5C6A7E" />
        </TouchableOpacity>
        <Text style={styles.title}>Food Preferences</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.emotionContainer}>
          <Text style={styles.emotionText}>
            Today you may feel{" "}
            <Text
              style={[styles.emotionHighlight, { color: getEmotionColor() }]}
            >
              {emotion && emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </Text>
          </Text>
          <Text style={styles.subtitle}>Please select your preferences</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Type</Text>
          <View style={styles.radioGroup}>
            {foodTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.radioButton,
                  selectedFoodType === type && {
                    backgroundColor: getEmotionColor(),
                  },
                ]}
                onPress={() => setSelectedFoodType(type)}
              >
                <Text
                  style={[
                    styles.radioText,
                    selectedFoodType === type && styles.radioTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { zIndex: 1000 }]}>
          <Text style={styles.sectionTitle}>Desired Nutrient (Optional)</Text>
          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={nutrientOpen}
              value={selectedNutrient}
              items={nutrients.map((nutrient) => ({
                label: nutrient,
                value: nutrient,
              }))}
              setOpen={setNutrientOpen}
              setValue={setSelectedNutrient}
              setItems={() => {}} // Required but not used here
              placeholder="Select a nutrient"
              searchable={true}
              searchPlaceholder="Search for a nutrient..."
              onChangeSearchText={setNutrientSearch}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              listItemLabelStyle={styles.dropdownItemLabel}
              zIndex={3000}
              zIndexInverse={1000}
              maxHeight={300}
            />
          </View>
        </View>

        <View style={styles.spacer} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: getEmotionColor() }]}
          onPress={handleStart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.startButtonText}>Get Recommendations</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    color: "#1F2937",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emotionContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  emotionText: {
    fontSize: 18,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 8,
  },
  emotionHighlight: {
    fontWeight: "bold",
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  radioButton: {
    width: "48%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  radioText: {
    color: "#4B5563",
    fontWeight: "500",
  },
  radioTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: "white",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
  },
  dropdownList: {
    backgroundColor: "white",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownItemLabel: {
    color: "#4B5563",
    fontSize: 14,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  startButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ChoosingPref;
