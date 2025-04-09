import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Dimensions
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUsers,
  faUtensils,
  faSmile,
  faSadTear,
  faAngry,
  faMeh,
  faSurprise,
  faGrimace,
  faFrown
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigations/AdminNavigator';
import { apiClient } from '../../services/api';
import styles from '../../styles/adminDashboardStyle';
import { LineChart, PieChart } from 'react-native-chart-kit';

type AdminDashboardProps = StackNavigationProp<AdminStackParamList, 'AdminTabs'>;

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRecommendations: number;
  emotionDistribution: {
    [key: string]: number;
  };
  topRatedFoods: Array<{
    food: string;
    rating: number;
    emotion: string;
    count: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<AdminDashboardProps>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.get('/api/admin/dashboard-stats');
      
      if (response.data && response.data.status === 'success') {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy': return faSmile;
      case 'sad': return faSadTear;
      case 'angry': return faAngry;
      case 'neutral': return faMeh;
      case 'surprise': return faSurprise;
      case 'disgust': return faGrimace;
      case 'fear': return faFrown;
      default: return faMeh;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy': return '#5CEA7E'; // Green
      case 'sad': return '#805AE3'; // Purple
      case 'angry': return '#FF5A63'; // Red
      case 'neutral': return '#6EA9F7'; // Blue
      case 'surprise': return '#FFA500'; // Orange
      case 'disgust': return '#8B4513'; // Brown
      case 'fear': return '#9932CC'; // Dark Orchid
      default: return '#6EA9F7'; // Default blue
    }
  };

  const renderEmotionDistributionChart = () => {
    if (!stats || !stats.emotionDistribution) return null;

    const chartData = Object.entries(stats.emotionDistribution).map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      population: count,
      color: getEmotionColor(emotion),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));

    return (
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={screenWidth - 64}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EA9F7" />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
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
          <>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <FontAwesomeIcon icon={faUsers} size={24} color="#6EA9F7" />
                <Text style={styles.summaryValue}>{stats?.totalUsers || 0}</Text>
                <Text style={styles.summaryLabel}>Total Users</Text>
              </View>
              
              <View style={styles.summaryCard}>
                <FontAwesomeIcon icon={faUsers} size={24} color="#5CEA7E" />
                <Text style={styles.summaryValue}>{stats?.activeUsers || 0}</Text>
                <Text style={styles.summaryLabel}>Active Users</Text>
              </View>
              
              <View style={styles.summaryCard}>
                <FontAwesomeIcon icon={faUtensils} size={24} color="#FF5A63" />
                <Text style={styles.summaryValue}>{stats?.totalRecommendations || 0}</Text>
                <Text style={styles.summaryLabel}>Recommendations</Text>
              </View>
            </View>

            {/* Emotion Distribution */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Emotion Distribution</Text>
              
              {/* Render Pie Chart */}
              {renderEmotionDistributionChart()}
              
              <View style={styles.emotionContainer}>
                {stats?.emotionDistribution && Object.entries(stats.emotionDistribution).map(([emotion, count], index) => (
                  <View key={index} style={styles.emotionItem}>
                    <View style={[styles.emotionIconContainer, { backgroundColor: getEmotionColor(emotion) }]}>
                      <FontAwesomeIcon icon={getEmotionIcon(emotion)} size={20} color="white" />
                    </View>
                    <Text style={styles.emotionLabel}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
                    <Text style={styles.emotionCount}>{count}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top Rated Foods */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Top Rated Foods</Text>
              {stats?.topRatedFoods && stats.topRatedFoods.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.food}</Text>
                    <View style={styles.foodMetaContainer}>
                      <View style={[styles.emotionBadge, { backgroundColor: getEmotionColor(food.emotion) }]}>
                        <Text style={styles.emotionBadgeText}>{food.emotion}</Text>
                      </View>
                      <Text style={styles.foodCount}>{food.count} ratings</Text>
                    </View>
                  </View>
                  <Text style={styles.foodRating}>{food.rating.toFixed(1)}</Text>
                </View>
              ))}
            </View>

            {/* Insights Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Mood-Food Insights</Text>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Most common emotion</Text>
                <Text style={styles.statValue}>
                  {stats?.emotionDistribution ? 
                    Object.entries(stats.emotionDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([emotion]) => emotion.charAt(0).toUpperCase() + emotion.slice(1))[0]
                    : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Highest rated food type</Text>
                <Text style={styles.statValue}>
                  {stats?.topRatedFoods && stats.topRatedFoods.length > 0 ? 
                    stats.topRatedFoods[0].food.split(' ')[0] : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Average user engagement</Text>
                <Text style={styles.statValue}>
                  {stats?.totalRecommendations && stats.totalUsers ? 
                    (stats.totalRecommendations / stats.totalUsers).toFixed(1) + ' recommendations/user' 
                    : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>User retention rate</Text>
                <Text style={styles.statValue}>
                  {stats?.activeUsers && stats.totalUsers ? 
                    ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) + '%' 
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Quick Links */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <View style={styles.quickLinksContainer}>
                <TouchableOpacity 
                  style={styles.quickLinkButton}
                  onPress={() => navigation.navigate('UserManagement')}
                >
                  <FontAwesomeIcon icon={faUsers} size={20} color="white" />
                  <Text style={styles.quickLinkText}>User Management</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickLinkButton, { backgroundColor: '#FF5A63' }]}
                  onPress={() => navigation.navigate('FoodTrends')}
                >
                  <FontAwesomeIcon icon={faUtensils} size={20} color="white" />
                  <Text style={styles.quickLinkText}>Food Trends</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;