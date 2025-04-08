import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faHome,
  faArrowLeft,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { LineChart } from "react-native-chart-kit";
import { RootStackParamList } from "../../navigations/AppNavigator";
import TrackingStyle from "../../styles/trackingStyle";
import { getUserFoodLogs } from "../../services/api";

// Define interfaces for food log data
interface FoodLog {
  id: number;
  date: string;
  time: string;
  meal_time: string;
  food_type: string;
  recommended_food: string;
  emotion: string;
  rating: number;
}

type TrackingNavigationProp = StackNavigationProp<RootStackParamList, "Tracking">;

const Tracking: React.FC = () => {
  const navigation = useNavigation<TrackingNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [todayEmotion, setTodayEmotion] = useState<string | null>(null);
  const [todayFood, setTodayFood] = useState<string | null>(null);
  const [todayMealTime, setTodayMealTime] = useState<string | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(Dimensions.get('window').width - 140);

  // All emotions supported by the app with numeric representation for charting
  const emotionIndexMap: { [key: string]: number } = {
    "angry": 1,
    "disgust": 2,
    "fear": 3,
    "sad": 4,
    "neutral": 5,
    "happy": 6,
    "surprise": 7
  };
  
  const emotions = Object.keys(emotionIndexMap);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle chart container width changes
  const onChartContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Set chart width with space for emotion labels
    setChartWidth(width - 100);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get today's emotion from AsyncStorage if available
      const storedEmotion = await AsyncStorage.getItem("emotion");
      if (storedEmotion) {
        setTodayEmotion(storedEmotion);
      }

      // Get last meal time selected
      const storedMealTime = await AsyncStorage.getItem("mealTime");
      if (storedMealTime) {
        setTodayMealTime(storedMealTime);
      }

      // Call API to get user food logs
      try {
        const response = await getUserFoodLogs();
        
        if (response && response.status === "success" && response.logs) {
          setFoodLogs(response.logs);
          
          // Get most recent food recommendation if available
          if (response.logs.length > 0) {
            const latestLog = response.logs[0];
            
            // Set today's food from the most recent log
            setTodayFood(latestLog.recommended_food);
            
            // Also set emotion and meal time if not already set
            if (!todayEmotion) {
              setTodayEmotion(latestLog.emotion);
            }
            if (!todayMealTime) {
              setTodayMealTime(latestLog.meal_time);
            }
          }
        } else {
          setFoodLogs([]);
        }
      } catch (error) {
        console.error("Error fetching food logs:", error);
        // For development, generate demo data if API fails
        setFoodLogs(generateDemoData());
        setError(null); // Clear error to show demo data
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = (): FoodLog[] => {
    const emotions = ["happy", "sad", "neutral", "angry", "surprise", "fear", "disgust"];
    const mealTimes = ["Breakfast", "Lunch", "Dinner", "Snack"];
    const foodTypes = ["Fruits", "Vegetables", "Meat", "Dairy", "Grains", "Snacks"];
    const foods = [
      "Grilled Salmon", "Spinach Salad", "Greek Yogurt", 
      "Avocado Toast", "Blueberry Smoothie", "Chicken Soup",
      "Dark Chocolate", "Whole Grain Pasta", "Vegetable Stir Fry",
      "Banana Oatmeal", "Almond Butter"
    ];
    
    const demoData: FoodLog[] = [];
    
    // Generate 7 days of data with varying emotions
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const formattedDate = date.toISOString().split('T')[0];
      const hours = Math.floor(Math.random() * 12) + 8; // Random hour between 8 and 19
      const minutes = Math.floor(Math.random() * 60);
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      demoData.push({
        id: i + 1,
        date: formattedDate,
        time: formattedTime,
        meal_time: mealTimes[Math.floor(Math.random() * mealTimes.length)],
        food_type: foodTypes[Math.floor(Math.random() * foodTypes.length)],
        recommended_food: foods[Math.floor(Math.random() * foods.length)],
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        rating: Math.floor(Math.random() * 5) + 1
      });
    }
    
    // Sort by date and time (newest first)
    demoData.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    return demoData;
  };

  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  const getEmotionColor = (emotion: string): string => {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          size={12}
          color={i <= rating ? "#FFC107" : "#E5E7EB"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderEmotionChart = () => {
    if (foodLogs.length <= 2) {
      return (
        <View style={TrackingStyle.noDataContainer}>
          <Text style={TrackingStyle.noDataText}>
            Not enough data to display emotion history
          </Text>
          <Text style={TrackingStyle.noDataSubText}>
            Try getting more food recommendations
          </Text>
        </View>
      );
    }

    // Take only the 7 most recent logs and reverse them (oldest first for the chart)
    const recentLogs = [...foodLogs].slice(0, 7).reverse();
    
    // Prepare data for the chart
    const labels = recentLogs.map(log => `${formatDate(log.date)}\n${log.time}`);
    const emotionValues = recentLogs.map(log => emotionIndexMap[log.emotion] || 4);
    const recommendedFoods = recentLogs.map(log => log.recommended_food);
    
    // Dynamic width based on number of data points
    const dynamicWidth = Math.max(
      chartWidth, 
      recentLogs.length * 120 // Give each point enough space
    );
    
    // Create chart data object
    const chartData = {
      labels: labels,
      datasets: [
        {
          data: emotionValues,
          strokeWidth: 2,
          color: () => 'rgba(110, 169, 247, 1)', // Line color
        }
      ],
      // Extra data for rendering food names
      recommendedFoods: recommendedFoods
    };
    
    // Chart configuration
    const chartConfig = {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 0,
      color: () => 'rgba(110, 169, 247, 1)',
      labelColor: () => '#4B5563',
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      },
      propsForVerticalLabels: {
        fontSize: 9,
        rotation: 45
      }
    };
    
    return (
      <View style={TrackingStyle.chartContainer} onLayout={onChartContainerLayout}>
        <Text style={TrackingStyle.chartTitle}>Your Mood History</Text>
        
        {/* Y-axis emotion labels */}
        <View style={TrackingStyle.emotionLegend}>
          {emotions.map((emotion, index) => (
            <View key={emotion} style={[
              TrackingStyle.emotionLegendItem,
              {bottom: `${index * (100 / (emotions.length - 1))}%`}
            ]}>
              <View style={[
                TrackingStyle.emotionDot,
                {backgroundColor: getEmotionColor(emotion)}
              ]} />
              <Text style={TrackingStyle.emotionLegendText}>
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Scrollable chart container */}
        <ScrollView
          horizontal
          ref={scrollViewRef}
          showsHorizontalScrollIndicator={true}
          style={TrackingStyle.chartScrollView}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <View style={{ marginLeft: 0 }}>
            {/* The line chart */}
            <LineChart
              data={chartData}
              width={dynamicWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={TrackingStyle.lineChart}
              withHorizontalLines={false}
              withVerticalLines={false}
              withInnerLines={false}
              withOuterLines={false}
              fromZero
              yAxisSuffix=""
              yAxisLabel=""
              renderDotContent={({x, y, index, indexData}) => {
                // Get the emotion for this point
                const emotion = recentLogs[index].emotion;
                const foodName = recommendedFoods[index];
                const shortFoodName = foodName.length > 10 ? 
                  foodName.substring(0, 10) + '...' : foodName;
                
                return (
                  <View key={index}>
                    {/* Emotion dot */}
                    <View style={[
                      TrackingStyle.dotContent,
                      {left: x - 6, top: y - 6, backgroundColor: getEmotionColor(emotion)}
                    ]} />
                    
                    {/* Food name above dot */}
                    <View style={[
                      TrackingStyle.foodNameTag,
                      {left: x - 40, top: y - 30}
                    ]}>
                      <Text style={TrackingStyle.foodNameText}>{shortFoodName}</Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </ScrollView>
        
        {/* Scroll hint */}
        <Text style={TrackingStyle.scrollHint}>
          Swipe left/right to see more
        </Text>
      </View>
    );
  };

  const renderRecentLogs = () => {
    if (foodLogs.length === 0) {
      return null;
    }

    // Take only the 5 most recent logs
    const recentLogs = foodLogs.slice(0, 5);

    return (
      <View style={TrackingStyle.recentLogsContainer}>
        <Text style={TrackingStyle.recentLogsTitle}>Recent Recommendations</Text>
        
        {recentLogs.map((log) => (
          <View key={log.id} style={TrackingStyle.logItem}>
            <View style={TrackingStyle.logHeader}>
              <Text style={TrackingStyle.logDateText}>
                {formatDate(log.date)} • {log.time}
              </Text>
              <View 
                style={[
                  TrackingStyle.emotionBadge,
                  { backgroundColor: getEmotionColor(log.emotion) }
                ]}
              >
                <Text style={TrackingStyle.emotionBadgeText}>
                  {log.emotion.charAt(0).toUpperCase() + log.emotion.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={TrackingStyle.logContent}>
              <Text style={TrackingStyle.logFoodName}>{log.recommended_food}</Text>
              <View style={TrackingStyle.logInfo}>
                <Text style={TrackingStyle.logInfoText}>
                  {log.meal_time} • {log.food_type}
                </Text>
                <View style={TrackingStyle.ratingContainer}>
                  <Text style={TrackingStyle.ratingLabel}>Rating:</Text>
                  <View style={TrackingStyle.starContainer}>
                    {renderStars(log.rating)}
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTodayMessage = () => {
    if (todayEmotion && todayFood && todayMealTime) {
      return (
        <Text style={TrackingStyle.todayMessage}>
          Today, you may feel <Text style={[TrackingStyle.emotionText, { color: getEmotionColor(todayEmotion) }]}>
            {todayEmotion}</Text> and I've suggested you eat <Text style={TrackingStyle.highlightText}>
            {todayFood}</Text> for <Text style={TrackingStyle.highlightText}>{todayMealTime.toLowerCase()}</Text>
        </Text>
      );
    } else {
      return (
        <Text style={TrackingStyle.todayMessage}>
          Today, have you checked your mood?
        </Text>
      );
    }
  };

  if (loading) {
    return (
      <View style={TrackingStyle.centerContainer}>
        <ActivityIndicator size="large" color="#6EA9F7" />
        <Text style={TrackingStyle.loadingText}>Loading your mood history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={TrackingStyle.centerContainer}>
        <Text style={TrackingStyle.noDataText}>{error}</Text>
        <TouchableOpacity
          style={[TrackingStyle.footerButton, { marginTop: 20, width: '50%' }]}
          onPress={fetchData}
        >
          <Text style={TrackingStyle.footerButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={TrackingStyle.container}>
      {/* Header */}
      <View style={TrackingStyle.header}>
        <TouchableOpacity onPress={handleGoHome} style={TrackingStyle.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#5C6A7E" />
        </TouchableOpacity>
        <Text style={TrackingStyle.title}>Mood Tracking</Text>
      </View>

      {/* Today's message */}
      <View style={TrackingStyle.messageContainer}>
        {renderTodayMessage()}
      </View>

      <ScrollView style={TrackingStyle.scrollContainer}>
        {/* Emotion Chart */}
        {renderEmotionChart()}
        
        {/* Recent Logs */}
        {renderRecentLogs()}
      </ScrollView>
      
      {/* Footer */}
      <View style={TrackingStyle.footer}>
        <TouchableOpacity
          style={TrackingStyle.footerButton}
          onPress={handleGoHome}
        >
          <FontAwesomeIcon icon={faHome} size={20} color="white" />
          <Text style={TrackingStyle.footerButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Tracking;