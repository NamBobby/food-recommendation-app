import React from "react";
import { View, Text } from "react-native";
import styles from "../../styles/homeStyle";
import { useNavigation, useRoute } from "@react-navigation/native";
import UserInfo from "../userPage/userInfo";
import Option from "../../components/option";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigations/AppNavigator";


type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;
//type HomeScreenRouteProp = { params: { user: { name: string; email: string; userId: number } } };

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  //const route = useRoute<HomeScreenRouteProp>();
  //const { user } = route.params;

  const navigateToShooting = () => {
    //navigation.navigate("Shooting", { user });
    navigation.navigate("Shooting");
  };

  const navigateToTracking = () => {
    //navigation.navigate("Tracking", { user });
    navigation.navigate("Tracking");
  };

  const handleSignOut = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topinfo}>
        <View style={styles.info}>
          {/* <UserInfo userName={user.name} handleSignOut={handleSignOut} /> */}
          <UserInfo handleSignOut={handleSignOut} />
        </View>
        <View style={styles.frame}>
          <Text style={styles.textframe}>C & Y</Text>
        </View>
        <View style={styles.buttonmenu}>
          <Option onPressShooting={navigateToShooting} onPressTracking={navigateToTracking} />
        </View>
      </View>
    </View>
  );
};

export default Home;
