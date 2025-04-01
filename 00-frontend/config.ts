import Constants from "expo-constants";

// 🟢 Kiểm tra API_URL từ app.json, nếu không có thì dùng giá trị mặc định
export const API_URL = Constants.expoConfig?.extra?.API_URL || "http://192.168.3.100:5000";

// Default timeout for API requests (in milliseconds)
export const API_TIMEOUT = 15000;

// JWT token key for AsyncStorage
export const JWT_TOKEN_KEY = "token";

// App configuration
export const APP_CONFIG = {
  app_name: "Mood Food",
  version: "1.0.0"
};
