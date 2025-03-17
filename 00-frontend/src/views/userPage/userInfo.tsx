import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/userInfoStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigations/AppNavigator";

interface UserInfoProps {}

type UserInfoNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

const UserInfo: React.FC<UserInfoProps> = () => {
  const navigation = useNavigation<UserInfoNavigationProp>();
  const [userName, setUserName] = useState<string>("Guest");
  const [showSignOutButton, setShowSignOutButton] = useState(false);

  // Lấy thông tin người dùng từ AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserName(parsedUser.name || "Guest");
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Xử lý đăng xuất: Xóa token và user, chuyển về Login
  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      navigation.navigate("Login");
    } catch (error) {
      console.error("❌ Error during sign out:", error);
    }
  };

  return (
    <View style={styles.userInfo}>
      <TouchableOpacity
        style={styles.username}
        onPress={() => setShowSignOutButton(!showSignOutButton)}
      >
        <Text style={styles.userName}>{userName}</Text>
      </TouchableOpacity>
      {showSignOutButton && (
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default UserInfo;
