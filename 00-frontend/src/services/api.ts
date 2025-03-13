//export const API_URL = "http://10.0.2.2:5000"; // Nếu dùng Android Emulator
// export const API_URL = "http://localhost:5000"; // Nếu chạy trên Web
export const API_URL = "http://192.168.100.3:5000"; 

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
