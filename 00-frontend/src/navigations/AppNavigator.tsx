import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import Home from "../views/homePage/homePage";
import Login from "../views/authPage/login";
import Register from "../views/authPage/register";
import Shooting from "../views/shootingPage/shootingPage";
import Result from "../views/shootingPage/resultPage";
import Tracking from "../views/trackingPage/trackingPage";
import ChoosingPref from "../views/recommendPage/choosingPref";
import ResultFood from "../views/recommendPage/resultFood";

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    FoodList: undefined;
    Home: undefined;
    Shooting: undefined;
    Result: undefined;
    Tracking: undefined;
    ChoosingPref: undefined;
    ResultFood: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator(): React.ReactElement {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Shooting" component={Shooting} />
                <Stack.Screen name="Result" component={Result} />
                <Stack.Screen name="Tracking" component={Tracking} />
                <Stack.Screen name="ChoosingPref" component={ChoosingPref} />
                <Stack.Screen name="ResultFood" component={ResultFood} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}