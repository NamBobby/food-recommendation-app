import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import Home from "../views/homePage/homePage";
import FoodList from "../views/foodListPage/foodList";
import Login from "../views/authPage/login";
import Register from "../views/authPage/register";
import Shooting from "../views/shootingPage/shooting";
import Result from "../views/resultPage/result";
import Tracking from "../views/trackingPage/tracking";

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    FoodList: undefined;
    Home: undefined;
    Shooting: undefined;
    Result: undefined;
    Tracking: undefined;
  };

  const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator(): React.ReactElement {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="FoodList" component={FoodList} /> 
                <Stack.Screen name="Shooting" component={Shooting} />
                <Stack.Screen name="Result" component={Result} />
                <Stack.Screen name="Tracking" component={Tracking} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}