// src/views/adminPage/userManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigations/AdminNavigator';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faSearch,
  faFilter,
  faSort,
  faEdit,
  faTrash,
  faTimes,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '../../services/api';
import styles from '../../styles/userManagementStyle';

type UserManagementNavigationProp = StackNavigationProp<AdminStackParamList, 'UserDetails'>;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  date_of_birth: string;
  status: string;
  created_at?: string;
}

const UserManagement: React.FC = () => {
  const navigation = useNavigation<UserManagementNavigationProp>();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, statusFilter, users, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/api/admin/users');
      
      if (response.data && response.data.status === 'success') {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // Apply sorting (by name)
    result.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(result);
  };

  const handleUserPress = (userId: number) => {
    navigation.navigate('UserDetails', { userId });
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/admin/users/${user.id}`);
              
              // Remove user from state
              const updatedUsers = users.filter(u => u.id !== user.id);
              setUsers(updatedUsers);
              
              Alert.alert('Success', 'User has been deleted.');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={() => handleUserPress(item.id)}
      >
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <View style={[
            styles.roleBadge, 
            {backgroundColor: item.role === 'admin' ? '#F59E0B' : '#6EA9F7'}
          ]}>
            <Text style={styles.roleBadgeText}>{item.role}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            {backgroundColor: item.status === 'active' ? '#10B981' : '#EF4444'}
          ]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleUserPress(item.id)}
        >
          <FontAwesomeIcon icon={faEdit} size={16} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item)}
        >
          <FontAwesomeIcon icon={faTrash} size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Users</Text>
            <TouchableOpacity 
              onPress={() => setFilterModalVisible(false)}
              style={styles.closeButton}
            >
              <FontAwesomeIcon icon={faTimes} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Role</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption,
                  roleFilter === 'all' && styles.filterOptionSelected
                ]}
                onPress={() => setRoleFilter('all')}
              >
                <Text style={[
                  styles.filterOptionText,
                  roleFilter === 'all' && styles.filterOptionTextSelected
                ]}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterOption,
                  roleFilter === 'admin' && styles.filterOptionSelected
                ]}
                onPress={() => setRoleFilter('admin')}
              >
                <Text style={[
                  styles.filterOptionText,
                  roleFilter === 'admin' && styles.filterOptionTextSelected
                ]}>Admin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterOption,
                  roleFilter === 'user' && styles.filterOptionSelected
                ]}
                onPress={() => setRoleFilter('user')}
              >
                <Text style={[
                  styles.filterOptionText,
                  roleFilter === 'user' && styles.filterOptionTextSelected
                ]}>User</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption,
                  statusFilter === 'all' && styles.filterOptionSelected
                ]}
                onPress={() => setStatusFilter('all')}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === 'all' && styles.filterOptionTextSelected
                ]}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterOption,
                  statusFilter === 'active' && styles.filterOptionSelected
                ]}
                onPress={() => setStatusFilter('active')}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === 'active' && styles.filterOptionTextSelected
                ]}>Active</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterOption,
                  statusFilter === 'inactive' && styles.filterOptionSelected
                ]}
                onPress={() => setStatusFilter('inactive')}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === 'inactive' && styles.filterOptionTextSelected
                ]}>Inactive</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EA9F7" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => Alert.alert('Info', 'Add user functionality would go here')}
        >
          <FontAwesomeIcon icon={faPlus} size={18} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} size={16} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <FontAwesomeIcon icon={faFilter} size={16} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={toggleSortOrder}
          >
            <FontAwesomeIcon icon={faSort} size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {renderFilterModal()}
    </SafeAreaView>
  );
};

export default UserManagement;