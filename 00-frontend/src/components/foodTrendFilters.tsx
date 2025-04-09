import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/foodTrendsStyle';
import { emotions, mealTimes, foodTypes } from './types';

interface FoodTrendFiltersProps {
  visible: boolean;
  onClose: () => void;
  emotionFilter: string;
  setEmotionFilter: (value: string) => void;
  mealTimeFilter: string;
  setMealTimeFilter: (value: string) => void;
  foodTypeFilter: string;
  setFoodTypeFilter: (value: string) => void;
  resetFilters: () => void;
}

const FoodTrendFilters: React.FC<FoodTrendFiltersProps> = ({
  visible,
  onClose,
  emotionFilter,
  setEmotionFilter,
  mealTimeFilter,
  setMealTimeFilter,
  foodTypeFilter,
  setFoodTypeFilter,
  resetFilters
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Trends</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              <FontAwesomeIcon icon={faTimes} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {/* Emotion Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Emotion</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    emotionFilter === 'all' && styles.filterOptionSelected
                  ]}
                  onPress={() => setEmotionFilter('all')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    emotionFilter === 'all' && styles.filterOptionTextSelected
                  ]}>All</Text>
                </TouchableOpacity>
                
                {emotions.map((emotion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterOption,
                      emotionFilter === emotion && styles.filterOptionSelected
                    ]}
                    onPress={() => setEmotionFilter(emotion)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      emotionFilter === emotion && styles.filterOptionTextSelected
                    ]}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Meal Time Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Meal Time</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    mealTimeFilter === 'all' && styles.filterOptionSelected
                  ]}
                  onPress={() => setMealTimeFilter('all')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    mealTimeFilter === 'all' && styles.filterOptionTextSelected
                  ]}>All</Text>
                </TouchableOpacity>
                
                {mealTimes.map((mealTime, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterOption,
                      mealTimeFilter === mealTime && styles.filterOptionSelected
                    ]}
                    onPress={() => setMealTimeFilter(mealTime)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      mealTimeFilter === mealTime && styles.filterOptionTextSelected
                    ]}>{mealTime}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Food Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Food Type</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    foodTypeFilter === 'all' && styles.filterOptionSelected
                  ]}
                  onPress={() => setFoodTypeFilter('all')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    foodTypeFilter === 'all' && styles.filterOptionTextSelected
                  ]}>All</Text>
                </TouchableOpacity>
                
                {foodTypes.map((foodType, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterOption,
                      foodTypeFilter === foodType && styles.filterOptionSelected
                    ]}
                    onPress={() => setFoodTypeFilter(foodType)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      foodTypeFilter === foodType && styles.filterOptionTextSelected
                    ]}>{foodType}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[styles.applyButton, { flex: 1, backgroundColor: '#9CA3AF', marginRight: 8 }]}
                onPress={() => {
                  resetFilters();
                  onClose();
                }}
              >
                <Text style={styles.applyButtonText}>Reset Filters</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.applyButton, { flex: 1 }]}
                onPress={onClose}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FoodTrendFilters;