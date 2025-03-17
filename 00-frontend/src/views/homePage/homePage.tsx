import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/homeStyle";
import { useNavigation } from "@react-navigation/native";
import UserInfo from "../userPage/userInfo";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigations/AppNavigator";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass, faChartLine } from "@fortawesome/free-solid-svg-icons";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const navigateToShooting = () => {
    navigation.navigate("Shooting");
  };

  const navigateToTracking = () => {
    navigation.navigate("Tracking");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topinfo}>
        <View style={styles.info}>
          <UserInfo/>
        </View>
        <View style={styles.frame}>
          <Text style={styles.textframe}>C & Y</Text>
        </View>
        <View style={styles.buttonmenu}>
          <View style={styles.option}>
            <TouchableOpacity style={styles.rectangle} onPress={navigateToShooting}>
              <View style={styles.option}>
                <FontAwesomeIcon icon={faMagnifyingGlass} size={30} color="#535773" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rectangle} onPress={navigateToTracking}>
              <View style={styles.option}>
                <FontAwesomeIcon icon={faChartLine} size={30} color="#535773" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Home;
