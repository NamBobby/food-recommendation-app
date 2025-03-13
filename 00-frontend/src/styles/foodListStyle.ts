import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  foodItem: {
    backgroundColor: "#FFB3C6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  foodCategory: {
    fontSize: 14,
    color: "#FFFFFF",
  },
});

export default styles;
