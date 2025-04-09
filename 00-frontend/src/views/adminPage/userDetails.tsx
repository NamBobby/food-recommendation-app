import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigations/AdminNavigator';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faEdit, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '../../services/api';
import styles from '../../styles/userDetailsStyle';

type UserDetailsRouteProp = RouteProp<AdminStackParamList, 'UserDetails'>;
type UserDetailsNavigationProp = StackNavigationProp<AdminStackParamList, 'UserDetails'>;

interface UserLog {
  id: number;
  date: string;
  time: string;
  meal_time: string;
  food_type: string;
  recommended_food: string;
  emotion: string;
  rating: number;
}

interface UserDetailData {
  id: number;
  name: string;
  email: string;
  role: string;
  date_of_birth: string;
  status: string;
  created_at?: string;
  logs: UserLog[];
}

const UserDetails: React.FC = () => {
  const route = useRoute<UserDetailsRouteProp>();
  const navigation = useNavigation<UserDetailsNavigationProp>();
  const { userId } = route.params;
  
  const [userData, setUserData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<{
    name: string;
    email: string;
    role: string;
    status: string;
  }>({
    name: '',
    email: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get(`/api/admin/users/${userId}`);
      
      if (response.data && response.data.status === 'success') {
        setUserData(response.data.user);
        setEditedUser({
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          status: response.data.user.status
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Validate form
      if (!editedUser.name.trim() || !editedUser.email.trim()) {
        Alert.alert('Error', 'Name and email are required.');
        return;
      }
      
      await apiClient.put(`/api/admin/users/${userId}`, editedUser);
      
      // Update local state
      if (userData) {
        setUserData({
          ...userData,
          ...editedUser
        });
      }
      
      setEditMode(false);
      Alert.alert('Success', 'User information updated successfully.');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user information. Please try again.');
    }
  };

  const handleDeleteUser = () => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userData?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/admin/users/${userId}`);
              
              Alert.alert('Success', 'User has been deleted.');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy': return '#5CEA7E'; // Green
      case 'sad': return '#805AE3'; // Purple
      case 'angry': return '#FF5A63'; // Red
      case 'neutral': return '#6EA9F7'; // Blue
      case 'surprise': return '#FFA500'; // Orange
      default: return '#6EA9F7'; // Default blue
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} style={{ color: i < rating ? '#F59E0B' : '#D1D5DB', marginRight: 2 }}>
          ★
        </Text>
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EA9F7" />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>User Details</Text>
        {!editMode ? (
          <TouchableOpacity 
            style={styles.editIcon}
            onPress={() => setEditMode(true)}
          >
            <FontAwesomeIcon icon={faEdit} size={20} color="#6EA9F7" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.saveIcon}
            onPress={handleSaveChanges}
          >
            <FontAwesomeIcon icon={faSave} size={20} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfoSection}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            {editMode ? (
              <TextInput
                style={styles.editInput}
                value={editedUser.name}
                onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
                placeholder="Enter name"
              />
            ) : (
              <Text style={styles.infoValue}>{userData.name}</Text>
            )}
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            {editMode ? (
              <TextInput
                style={styles.editInput}
                value={editedUser.email}
                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{userData.email}</Text>
            )}
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Role</Text>
            {editMode ? (
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    editedUser.role === 'user' && styles.roleSelected
                  ]}
                  onPress={() => setEditedUser({ ...editedUser, role: 'user' })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      editedUser.role === 'user' && styles.roleTextSelected
                    ]}
                  >
                    User
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    editedUser.role === 'admin' && styles.roleSelected
                  ]}
                  onPress={() => setEditedUser({ ...editedUser, role: 'admin' })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      editedUser.role === 'admin' && styles.roleTextSelected
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.infoValue}>{userData.role}</Text>
            )}
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{userData.date_of_birth}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.toggleContainer}>
              <Text style={styles.infoLabel}>Status</Text>
              {editMode ? (
                <Switch
                  value={editedUser.status === 'active'}
                  onValueChange={(value) =>
                    setEditedUser({
                      ...editedUser,
                      status: value ? 'active' : 'inactive'
                    })
                  }
                  trackColor={{ false: '#E5E7EB', true: '#6EA9F7' }}
                  thumbColor="#FFFFFF"
                />
              ) : (
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        userData.status === 'active' ? '#10B981' : '#EF4444'
                    }
                  ]}
                >
                  {userData.status}
                </Text>
              )}
            </View>
          </View>
          
          {userData.created_at && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Joined</Text>
              <Text style={styles.infoValue}>{userData.created_at}</Text>
            </View>
          )}
        </View>
        
        {!editMode && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setEditMode(true)}
            >
              <FontAwesomeIcon icon={faEdit} size={20} color="#6EA9F7" />
              <Text style={styles.actionText}>Edit User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteUser}
            >
              <FontAwesomeIcon icon={faTrash} size={20} color="#EF4444" />
              <Text style={[styles.actionText, styles.dangerText]}>
                Delete User
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {userData.logs && userData.logs.length > 0 && (
          <View style={styles.logSection}>
            <Text style={styles.sectionTitle}>Food Recommendation History</Text>
            
            {userData.logs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logDate}>
                    {log.date} • {log.time}
                  </Text>
                  <View
                    style={[
                      styles.emotionBadge,
                      { backgroundColor: getEmotionColor(log.emotion) }
                    ]}
                  >
                    <Text style={styles.emotionText}>
                      {log.emotion.charAt(0).toUpperCase() + log.emotion.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.logFood}>{log.recommended_food}</Text>
                
                <View style={styles.logMeta}>
                  <Text style={styles.logDetails}>
                    {log.meal_time} • {log.food_type}
                  </Text>
                  {renderStars(log.rating)}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDetails;