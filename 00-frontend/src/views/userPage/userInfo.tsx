import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/userInfoStyle";

interface UserInfoProps {
  userName?: string; // 🟢 Cho phép bỏ trống, mặc định là "Guest"
  handleSignOut: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ userName = "Guest", handleSignOut }) => {
  const [showSignOutButton, setShowSignOutButton] = useState(false);

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
