import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import LoginStyle from "../../styles/loginStyle";
import { useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { StackNavigationProp } from "@react-navigation/stack";

import { RootStackParamList } from "../../navigations/AppNavigator";
type NavigationProps = StackNavigationProp<RootStackParamList, "Login">;

const Login = () => {
  const navigation = useNavigation<NavigationProps>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (email === "" || password === "") {
      Alert.alert("Alert", "Please fill in all information.");
      return;
    }
    // TODO: Thêm logic kiểm tra tài khoản
    navigation.navigate("Home");
  };

  return (
    <View style={LoginStyle.container}>
      <View style={LoginStyle.topinfo}>
        <View style={LoginStyle.frame}>
          <Text style={LoginStyle.textframe}>C & Y</Text>
        </View>
        <View style={LoginStyle.inputContainer}>
          <Text style={LoginStyle.texttitle}>Please fill your details to sign in.</Text>
          <View style={LoginStyle.inputText}>
            <Text style={LoginStyle.text}>Email</Text>
            <View style={LoginStyle.inputframe}>
              <TextInput
                style={LoginStyle.input}
                placeholder="Email"
                onChangeText={setEmail}
              />
            </View>
          </View>
          <View style={LoginStyle.inputText}>
            <Text style={LoginStyle.text}>Password</Text>
            <View style={LoginStyle.inputframe}>
              <TextInput
                style={LoginStyle.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={LoginStyle.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
                <FontAwesomeIcon icon={showPassword ? "eye" : "eye-slash"} size={25} color="#EDD8E9"/>
              </TouchableOpacity>
            </View>
          </View>
              <TouchableOpacity style={LoginStyle.buttonIn} onPress={handleSignIn}>
                <Text style={LoginStyle.buttonText}>Sign In</Text>
              </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={LoginStyle.text}>Don't have an account? <Text style={LoginStyle.textsignIn}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;