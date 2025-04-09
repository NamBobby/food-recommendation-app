import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUsers,
  faChartLine,
  faCog,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";

// Admin screens (we'll create these files next)
import AdminDashboard from "../views/adminPage/adminDashboard";
import UserManagement from "../views/adminPage/userManagement";
import FoodTrends from "../views/adminPage/foodTrends";
import SystemSettings from "../views/adminPage/systemSettings";
import UserDetails from "../views/adminPage/userDetails";

// Auth screens
import Login from "../views/authPage/login";

export type AdminStackParamList = {
  AdminTabs: undefined;
  UserDetails: { userId: number };
  Login: undefined;
};

const Stack = createStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator();

// Admin Tab Navigator component
const AdminTabNavigator = () => {
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
        name="Settings"
        component={SystemSettings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faCog} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Admin Stack Navigator
export default function AdminNavigator(): React.ReactElement {
  return (
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
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}
