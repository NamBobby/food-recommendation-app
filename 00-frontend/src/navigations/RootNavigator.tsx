import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './AppNavigator';
import AdminNavigator from './AdminNavigator';
import Login from '../views/authPage/login';

const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check user authentication status
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userString = await AsyncStorage.getItem('user');
        
        if (token && userString) {
          const user = JSON.parse(userString);
          setUserRole(user.role);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6ea9f7" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show login
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Login />
      </NavigationContainer>
    );
  }

  // If authenticated as admin, show admin navigator
  if (userRole === 'admin') {
    return <AdminNavigator />;
  }

  // Otherwise show regular app navigator
  return <AppNavigator />;
};

export default RootNavigator;