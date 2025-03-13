import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, ActivityIndicator } from "react-native";
import { fetchFoods } from "../../services/api";
import styles from "../../styles/foodListStyle"; 

interface FoodItem {
    id: number;
    name: string;
    category: string;
    calories: number;
    sugars: number;
    omega_3: number;
    protein: number;
    image_url: string;
    name_display: string;
  }

const FoodList = () => {
    const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFoods = async () => {
      const data = await fetchFoods();
      setFoods(data);
      setLoading(false);
    };
    loadFoods();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#FFB3C6" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.foodItem}>
            <Image source={{ uri: item.image_url }} style={styles.foodImage} />
            <Text style={styles.foodName}>{item.name_display}</Text>
            <Text style={styles.foodCategory}>{item.category}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default FoodList;
