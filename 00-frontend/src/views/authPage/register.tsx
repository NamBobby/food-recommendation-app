import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import RegisterStyle from "../../styles/registerStyle";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { RootStackParamList } from "../../navigations/AppNavigator";
import DropDownPicker from "react-native-dropdown-picker";
import { registerUser } from "../../services/api";

type NavigationProps = StackNavigationProp<RootStackParamList, "Register">;

const Register = () => {
  const navigation = useNavigation<NavigationProps>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🟢 State cho DropdownPicker
  const [dayOpen, setDayOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  // 🟢 Danh sách năm giảm dần từ 2025
  const years = Array.from({ length: 2025 - 1899 }, (_, i) => (2025 - i).toString());

  // 🟢 Danh sách tháng từ 1-12
  const months =
  year === currentYear.toString()
    ? Array.from({ length: currentMonth }, (_, i) => (i + 1).toString())
    : Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // 🟢 Danh sách ngày 1-31 (cho phép chọn trước)
  let days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // 🟢 Cập nhật ngày hợp lệ khi chọn month & year
  if (month && year) {
    const selectedMonth = parseInt(month);
    const selectedYear = parseInt(year);

    // Kiểm tra số ngày thực tế của tháng
    const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
    days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => (i + 1).toString());

    // Nếu ngày hiện tại không hợp lệ, reset lại
    if (day && parseInt(day) > days.length) {
      setDay(null);
    }

    // Nếu chọn tháng & năm là hiện tại, giới hạn ngày theo hôm nay
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      days = days.filter((d) => parseInt(d) <= currentDay);
      if (day && parseInt(day) > currentDay) {
        setDay(null);
      }
    }
  }

  // 🟢 Kiểm tra email hợp lệ
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword || !day || !month || !year) {
      Alert.alert("Alert", "Please fill in all information.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Alert", "Invalid email format.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Alert", "The password confirmation does not match.");
      return;
    }

    try {
      const response = await registerUser(name, email, password, parseInt(day!), parseInt(month!), parseInt(year!));
      console.log("✅ API Response:", response); // 🟢 Debug log
      Alert.alert("Success", "Account created successfully.");
      navigation.navigate("Login");
    } catch (error: any) {
      console.error("❌ Register Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Something went wrong.");
    }
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
            <TextInput style={RegisterStyle.input} placeholder="Username" onChangeText={setName} />
          </View>

          <View style={RegisterStyle.inputText}>
            <Text style={RegisterStyle.text}>Email</Text>
            <TextInput style={RegisterStyle.input} placeholder="Email" onChangeText={setEmail} />
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

          <View style={RegisterStyle.inputText}>
            <Text style={RegisterStyle.text}>Date of Birth</Text>
          </View>
          
          <View style={RegisterStyle.dateContainer}>
            <DropDownPicker
              open={dayOpen}
              value={day}
              items={days.map((d) => ({ label: d, value: d }))}
              setOpen={setDayOpen}
              setValue={setDay}
              placeholder="Day"
              containerStyle={RegisterStyle.dropdown}
            />
            <DropDownPicker
              open={monthOpen}
              value={month}
              items={months.map((m) => ({ label: m, value: m }))}
              setOpen={setMonthOpen}
              setValue={setMonth}
              placeholder="Month"
              containerStyle={RegisterStyle.dropdown}
            />
            <DropDownPicker
              open={yearOpen}
              value={year}
              items={years.map((y) => ({ label: y, value: y }))}
              setOpen={setYearOpen}
              setValue={setYear}
              placeholder="Year"
              containerStyle={RegisterStyle.dropdown}
            />
          </View>

          <TouchableOpacity style={RegisterStyle.buttonUp} onPress={handleSignUp}>
            <Text style={RegisterStyle.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={RegisterStyle.text}>
            Already have an account? <Text style={RegisterStyle.textsignUp}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Register;
