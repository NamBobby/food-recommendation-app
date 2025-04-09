import React from 'react';
import { View, Text, FlatList } from 'react-native';
import styles from '../styles/foodTrendsStyle';
import { FoodTrendItem, getEmotionColor } from './types';

interface FoodTrendListProps {
  filteredTrends: FoodTrendItem[];
}

const FoodTrendList: React.FC<FoodTrendListProps> = ({ filteredTrends }) => {
  if (filteredTrends.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No data available for the selected filters</Text>
      </View>
    );
  }
  
  // Sort trends by rating (highest first)
  const sortedTrends = [...filteredTrends].sort((a, b) => b.rating - a.rating);
  
  return (
    <FlatList
      data={sortedTrends}
      keyExtractor={(item, index) => `${item.food}-${index}`}
      renderItem={({ item }) => (
        <View style={styles.foodItem}>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{item.food}</Text>
            <View style={styles.foodMetaContainer}>
              <View style={[
                styles.emotionBadge,
                { backgroundColor: getEmotionColor(item.emotion) }
              ]}>
                <Text style={styles.emotionBadgeText}>{item.emotion}</Text>
              </View>
              <Text style={styles.foodType}>{item.food_type}</Text>
              <Text style={styles.mealTime}>{item.meal_time}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.foodRating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.foodCount}>{item.count} ratings</Text>
          </View>
        </View>
      )}
      style={{ marginTop: 8 }}
    />
  );
};

export default FoodTrendList;