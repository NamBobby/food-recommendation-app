// src/views/adminPage/foodTrends.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Dimensions
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFilter, faChartBar, faList, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '../../services/api';
import styles from '../../styles/foodTrendsStyle';

import FoodTrendFilters from '../../components/foodTrendFilters';
import FoodTrendCharts from '../../components/foodTrendCharts';
import FoodTrendInsights from '../../components/foodTrendInsights';
import FoodTrendList from '../../components/foodTrendList';
import { FoodTrendItem } from '../../components/types';

const FoodTrends: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<FoodTrendItem[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [mealTimeFilter, setMealTimeFilter] = useState<string>('all');
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>('all');
  const [filteredTrends, setFilteredTrends] = useState<FoodTrendItem[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'list' | 'insights'>('chart');

  useEffect(() => {
    fetchTrends();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trends, emotionFilter, mealTimeFilter, foodTypeFilter]);

  const fetchTrends = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.get('/api/admin/food-trends');
      
      if (response.data && response.data.status === 'success') {
        setTrends(response.data.trends);
      }
    } catch (error) {
      console.error('Error fetching food trends:', error);
      setError('Failed to load food trends. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrends();
  };

  const applyFilters = () => {
    let filtered = [...trends];
    
    if (emotionFilter !== 'all') {
      filtered = filtered.filter(item => item.emotion === emotionFilter);
    }
    
    if (mealTimeFilter !== 'all') {
      filtered = filtered.filter(item => item.meal_time === mealTimeFilter);
    }
    
    if (foodTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.food_type === foodTypeFilter);
    }
    
    setFilteredTrends(filtered);
  };

  const resetFilters = () => {
    setEmotionFilter('all');
    setMealTimeFilter('all');
    setFoodTypeFilter('all');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EA9F7" />
        <Text style={styles.loadingText}>Loading food trends...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Trends</Text>
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <FontAwesomeIcon icon={faFilter} size={16} color="#374151" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
        
        {(emotionFilter !== 'all' || mealTimeFilter !== 'all' || foodTypeFilter !== 'all') && (
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: '#FEE2E2' }]}
            onPress={resetFilters}
          >
            <Text style={styles.filterButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chart' && styles.activeTab]}
          onPress={() => setActiveTab('chart')}
        >
          <FontAwesomeIcon 
            icon={faChartBar} 
            size={18} 
            color={activeTab === 'chart' ? '#6EA9F7' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'chart' && styles.activeTabText]}>
            Charts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <FontAwesomeIcon 
            icon={faList} 
            size={18} 
            color={activeTab === 'list' ? '#6EA9F7' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
            List View
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <FontAwesomeIcon 
            icon={faLightbulb} 
            size={18} 
            color={activeTab === 'insights' ? '#6EA9F7' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            {activeTab === 'chart' && (
              <FoodTrendCharts filteredTrends={filteredTrends} />
            )}
            
            {activeTab === 'list' && (
              <FoodTrendList filteredTrends={filteredTrends} />
            )}
            
            {activeTab === 'insights' && (
              <FoodTrendInsights 
                filteredTrends={filteredTrends} 
                emotionFilter={emotionFilter} 
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FoodTrendFilters
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        emotionFilter={emotionFilter}
        setEmotionFilter={setEmotionFilter}
        mealTimeFilter={mealTimeFilter}
        setMealTimeFilter={setMealTimeFilter}
        foodTypeFilter={foodTypeFilter}
        setFoodTypeFilter={setFoodTypeFilter}
        resetFilters={resetFilters}
      />
    </SafeAreaView>
  );
};

export default FoodTrends;