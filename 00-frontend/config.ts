import Constants from "expo-constants";

// 🟢 Kiểm tra API_URL từ app.json, nếu không có thì dùng giá trị mặc định
export const API_URL = Constants.expoConfig?.extra?.API_URL || "http://192.168.3.100:5000";

console.log("🔗 API_URL:", API_URL); // 🟢 Debug kiểm tra API_URL khi chạy app
