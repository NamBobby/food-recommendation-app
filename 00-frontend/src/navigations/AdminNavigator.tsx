import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUsers,
  faChartLine,
  faUtensils,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";

// Admin screens
import AdminDashboard from "../views/adminPage/adminDashboard";
import UserManagement from "../views/adminPage/userManagement";
import FoodTrends from "../views/adminPage/foodTrends";
import UserDetails from "../views/adminPage/userDetails";
import { useAuth } from "../context/AuthContext";
import { TouchableOpacity, Text, View } from "react-native";

export type AdminStackParamList = {
  AdminTabs: undefined;
  UserDetails: { userId: number };
};

const Stack = createStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator();

// Empty component for the logout tab
const EmptyComponent: React.FC = () => <View />;

// Custom tab button component to handle logout
const LogoutTabButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <FontAwesomeIcon icon={faSignOutAlt} size={24} color="#FF5A63" />
    <Text style={{ fontSize: 10, color: "#999", marginTop: 2 }}>Logout</Text>
  </TouchableOpacity>
);

// Admin Tab Navigator component
const AdminTabNavigator = () => {
  const { logout } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6ea9f7",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faChartLine} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={UserManagement}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faUsers} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Food Trends"
        component={FoodTrends}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faUtensils} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Logout"
        component={EmptyComponent}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            // Custom logout action
            logout();
          },
        }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faSignOutAlt} size={size} color="#FF5A63" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Admin Stack Navigator
const AdminNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AdminTabs"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
        <Stack.Screen
          name="UserDetails"
          component={UserDetails}
          options={{ headerShown: true, title: "User Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AdminNavigator;