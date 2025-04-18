// src/views/adminPage/foodTrends/FoodTrendCharts.tsx
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import styles from '../styles/foodTrendsStyle';
import { FoodTrendItem, getEmotionColor } from './types';

interface FoodTrendChartsProps {
  filteredTrends: FoodTrendItem[];
}

const FoodTrendCharts: React.FC<FoodTrendChartsProps> = ({ filteredTrends }) => {
  const screenWidth = Dimensions.get('window').width - 40;

  // Prepare data for emotion chart
  const getEmotionChartData = () => {
    const emotionData: { [key: string]: { count: number, total: number }} = {};
    
    filteredTrends.forEach(item => {
      if (!emotionData[item.emotion]) {
        emotionData[item.emotion] = { count: 0, total: 0 };
      }
      emotionData[item.emotion].count += item.count;
      emotionData[item.emotion].total += item.rating * item.count;
    });
    
    const chartData = Object.entries(emotionData).map(([emotion, data]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count: data.count,
      avgRating: data.count > 0 ? (data.total / data.count) : 0,
      color: getEmotionColor(emotion)
    }));
    
    return chartData;
  };

  // Prepare data for meal time chart
  const getMealTimeChartData = () => {
    const mealTimeData: { [key: string]: { count: number, total: number }} = {};
    
    filteredTrends.forEach(item => {
      if (!mealTimeData[item.meal_time]) {
        mealTimeData[item.meal_time] = { count: 0, total: 0 };
      }
      mealTimeData[item.meal_time].count += item.count;
      mealTimeData[item.meal_time].total += item.rating * item.count;
    });
    
    const chartData = Object.entries(mealTimeData).map(([mealTime, data]) => ({
      name: mealTime,
      count: data.count,
      avgRating: data.count > 0 ? (data.total / data.count) : 0
    }));
    
    return chartData;
  };

  // Prepare data for food type chart
  const getFoodTypeChartData = () => {
    const foodTypeData: { [key: string]: { count: number, total: number }} = {};
    
    filteredTrends.forEach(item => {
      if (!foodTypeData[item.food_type]) {
        foodTypeData[item.food_type] = { count: 0, total: 0 };
      }
      foodTypeData[item.food_type].count += item.count;
      foodTypeData[item.food_type].total += item.rating * item.count;
    });
    
    const chartData = Object.entries(foodTypeData).map(([foodType, data]) => ({
      name: foodType,
      count: data.count,
      avgRating: data.count > 0 ? (data.total / data.count) : 0
    }));
    
    return chartData;
  };

  // Render emotion chart
  const renderEmotionChart = () => {
    const emotionData = getEmotionChartData();
    
    if (emotionData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for the selected filters</Text>
        </View>
      );
    }
    
    const chartData = {
      labels: emotionData.map(item => item.name),
      datasets: [
        {
          data: emotionData.map(item => item.avgRating),
          color: (opacity = 1) => `rgba(110, 169, 247, ${opacity})`,
        }
      ]
    };
    
    return (
      <View>
        <Text style={styles.sectionTitle}>Average Rating by Emotion</Text>
        <BarChart
          data={chartData}
          width={screenWidth}
          height={220}
          yAxisSuffix=""
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(110, 169, 247, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            barPercentage: 0.7
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        <View style={styles.legendContainer}>
          {emotionData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render meal time chart
  const renderMealTimeChart = () => {
    const mealTimeData = getMealTimeChartData();
    
    if (mealTimeData.length === 0) {
      return null;
    }
    
    const chartData = {
      labels: mealTimeData.map(item => item.name),
      datasets: [
        {
          data: mealTimeData.map(item => item.avgRating),
          color: (opacity = 1) => `rgba(92, 234, 126, ${opacity})`,
        }
      ]
    };
    
    return (
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Average Rating by Meal Time</Text>
        <BarChart
          data={chartData}
          width={screenWidth}
          height={220}
          yAxisSuffix=""
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(92, 234, 126, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            barPercentage: 0.7
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
    );
  };

  // Render food type chart
  const renderFoodTypeChart = () => {
    const foodTypeData = getFoodTypeChartData();
    
    if (foodTypeData.length === 0) {
      return null;
    }
    
    const chartData = {
      labels: foodTypeData.map(item => item.name),
      datasets: [
        {
          data: foodTypeData.map(item => item.avgRating),
          color: (opacity = 1) => `rgba(255, 90, 99, ${opacity})`,
        }
      ]
    };
    
    return (
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Average Rating by Food Type</Text>
        <BarChart
          data={chartData}
          width={screenWidth}
          height={220}
          yAxisSuffix=""
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 90, 99, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            barPercentage: 0.7
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
    );
  };

  return (
    <>
      {renderEmotionChart()}
      {renderMealTimeChart()}
      {renderFoodTypeChart()}
    </>
  );
};

export default FoodTrendCharts;