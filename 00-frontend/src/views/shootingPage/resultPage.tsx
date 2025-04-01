import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack"; 
import Svg, { Circle } from "react-native-svg"; 
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import UserInfo from "../userPage/userInfo";
import Row from "../../components/rowBack";
import ResultStyle from "../../styles/resultStyle";
import { RootStackParamList } from "../../navigations/AppNavigator"; 

// Định nghĩa kiểu navigation
type ResultScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Result"
>;

const Result: React.FC = () => {
  const navigation = useNavigation<ResultScreenNavigationProp>(); 
  const [emotion, setEmotion] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const imageUrl = "https://via.placeholder.com/150"; 

  useEffect(() => {
    const fetchEmotion = async () => {
      try {
        const storedEmotion = await AsyncStorage.getItem("emotion");
        setEmotion(storedEmotion || "Unknown");
      } catch (error) {
        console.error("❌ Error fetching emotion:", error);
      } finally {
        setScanning(false);
      }
    };

    fetchEmotion();
  }, []);

  const getCircleColor = () => {
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
        return "#D1D1D1"; // Default gray
    }
  };

  const handleHome = () => {
    navigation.navigate("Home");
  };
  
  // Add function to navigate to food recommendation
  const handleStartRecommend = () => {
    navigation.navigate("ChoosingPref");
  };

  return (
    <View style={ResultStyle.container}>
      <View style={ResultStyle.topinfo}>
        <View style={ResultStyle.info}>
          <Row />
          <UserInfo />
        </View>
        <View style={ResultStyle.mainphoto}>
          <View style={ResultStyle.content}>
            <View style={ResultStyle.elipse2}>
              <View style={ResultStyle.elipse}>
                {imageUrl && (
                  <Image source={{ uri: imageUrl }} style={ResultStyle.img} />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={ResultStyle.bottominfo}>
        <View style={ResultStyle.circleChart}>
          {scanning ? (
            <View style={ResultStyle.circleChartPercentage}>
              <Text style={ResultStyle.scanningText}>Scanning...</Text>
            </View>
          ) : (
            <View style={ResultStyle.circleChartPercentage}>
              <Svg
                style={ResultStyle.circleChartBackground}
                viewBox="0 0 50 50"
              >
                <Circle
                  cx={25}
                  cy={25}
                  r={24}
                  strokeWidth={2}
                  stroke={getCircleColor()}
                  strokeDasharray={151.94744}
                  strokeDashoffset={75} 
                  fill="transparent"
                  strokeLinecap="round"
                  transform="rotate(-90, 25, 25)"
                />
              </Svg>
              <View style={ResultStyle.contents}>
                <Text style={ResultStyle.resultText}>{emotion}</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Add Start Recommendation button */}
        {!scanning && emotion && (
          <TouchableOpacity
            style={{
              backgroundColor: getCircleColor(),
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              marginTop: 20,
              alignSelf: "center",
              elevation: 2,
            }}
            onPress={handleStartRecommend}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Start Recommendation
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Result;