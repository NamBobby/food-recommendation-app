//export const API_URL = "http://10.0.2.2:5000"; // Nếu dùng Android Emulator
// export const API_URL = "http://localhost:5000"; // Nếu chạy trên Web
import axios from "axios";
import { API_URL } from "../../config"; 

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 🟢 Tăng timeout lên 10 giây để tránh lỗi `timeout exceeded`
}); 

export const fetchFoods = async () => {
  try {
    const response = await fetch(`${API_URL}/get-foods`);
    if (!response.ok) throw new Error("Failed to fetch foods");
    return await response.json();
  } catch (error) {
    console.error("Error fetching foods:", error);
    return [];
  }
};

export const fetchNutrientEffectiveness = async () => {
  try {
    const response = await fetch(`${API_URL}/get-nutrient-effectiveness`);
    if (!response.ok) throw new Error("Failed to fetch nutrient effectiveness");
    return await response.json();
  } catch (error) {
    console.error("Error fetching nutrient effectiveness:", error);
    return [];
  }
};

export const registerUser = async (name: string, email: string, password: string, day: number, month: number, year: number) => {
  try {
    console.log("🔗 Register API Call:", API_URL); // 🟢 Debug kiểm tra API URL
    const response = await apiClient.post("/register", {
      name,
      email,
      password,
      day,
      month,
      year,
    });
    console.log("✅ Register API Success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Register API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error: any) {
    console.error("❌ Login API Error:", error.response?.data || error.message);
    throw error;
  }
};
