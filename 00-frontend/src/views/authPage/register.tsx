import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import RegisterStyle from "../../styles/registerStyle";
import { useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { StackNavigationProp } from "@react-navigation/stack";

import { RootStackParamList } from "../../navigations/AppNavigator";
type NavigationProps = StackNavigationProp<RootStackParamList, "Register">;

const Register = () => {
  const navigation = useNavigation<NavigationProps>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Alert", "Please fill in all information.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Alert", "The password confirmation does not match.");
      return;
    }
    // TODO: Thêm logic đăng ký tài khoản
    navigation.navigate("Login");
  };

  return (
    <View style={RegisterStyle.container}>
      <View style={RegisterStyle.topinfo}>
        <View style={RegisterStyle.frame}>
          <Text style={RegisterStyle.textframe}>C & Y</Text>
        </View>
        <View style={RegisterStyle.inputContainer}>
          <Text style={RegisterStyle.texttitle}>Please fill your details to sign up.</Text>
          
          <View style={RegisterStyle.inputText}>
            <Text style={RegisterStyle.text}>Username</Text>
            <View style={RegisterStyle.inputframe}>
              <TextInput style={RegisterStyle.input} placeholder="Username" onChangeText={setName} />
            </View>
          </View>

          <View style={RegisterStyle.inputText}>
            <Text style={RegisterStyle.text}>Email</Text>
            <View style={RegisterStyle.inputframe}>
              <TextInput style={RegisterStyle.input} placeholder="Email" onChangeText={setEmail} />
            </View>
          </View>

          <View style={RegisterStyle.inputText}>
            <Text style={RegisterStyle.text}>Password</Text>
            <View style={RegisterStyle.inputframe}>
              <TextInput
              style={RegisterStyle.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              />
              <TouchableOpacity style={RegisterStyle.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={RegisterStyle.text}>
                    {showPassword ?
                      (<FontAwesomeIcon icon="eye" size={25} color="#EDD8E9" />
                      ) : (
                        <FontAwesomeIcon icon="eye-slash" size={25} color="#EDD8E9" />
                      )}
                  </Text>
                </TouchableOpacity>
            </View>
          </View>

          <View style={RegisterStyle.inputText}>
            <Text style={RegisterStyle.text}>Password Confirm</Text>
            <View style={RegisterStyle.inputframe}>
              <TextInput
                style={RegisterStyle.input}
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity style={RegisterStyle.showPasswordButton} onPress={() => setShowConfirmPassword(!showPassword)}>
                  <Text style={RegisterStyle.text}>
                    {showPassword ?
                      (<FontAwesomeIcon icon="eye" size={25} color="#EDD8E9" />
                      ) : (
                        <FontAwesomeIcon icon="eye-slash" size={25} color="#EDD8E9" />
                      )}
                  </Text>
                </TouchableOpacity>
            </View>
          </View>
        
          <TouchableOpacity style={RegisterStyle.buttonUp} onPress={handleSignUp}>
            <Text style={RegisterStyle.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={RegisterStyle.text}>Already have an account? <Text style={RegisterStyle.textsignUp}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Register;
