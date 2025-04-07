import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerBackButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    color: "#1F2937",
  },
  userGreeting: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  userGreetingText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    textAlign: "center",
  },
  highlightText: {
    fontWeight: "700",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  scrollContent: {
    flex: 1,
  },
  mainFoodCard: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  mainFoodImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#E5E7EB",
  },
  mainFoodDetails: {
    padding: 16,
  },
  foodTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mainFoodName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  foodType: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  ratingContainer: {
    marginTop: 24,
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  starIcon: {
    marginRight: 8,
  },
  ratedContainer: {
    marginTop: 8,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  ratedText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    textAlign: "center",
  },
  suggestionsSection: {
    padding: 16,
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  suggestionCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "white",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  suggestionImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#F3F4F6",
  },
  suggestionDetails: {
    padding: 10,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  suggestionType: {
    fontSize: 12,
    color: "#6B7280",
  },
  nutritionSection: {
    padding: 16,
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  nutrientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nutrientItem: {
    width: "48%",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  nutrientItemPriority: {
    backgroundColor: "#F0F9FF", // Light blue background for priority nutrients
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  nutrientName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  nutrientUnit: {
    fontSize: 12,
    color: "#6B7280",
  },
  priorityLabel: {
    fontSize: 10,
    color: "#3B82F6",
    fontWeight: "500",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  footerButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  footerSaveButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  priorityNutrientSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    marginBottom: 16,
  },
  priorityNutrientTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: 8,
  },
  priorityNutrientDescription: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  }
});