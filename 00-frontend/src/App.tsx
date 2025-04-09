// src/App.tsx
import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faHome,
  faArrowLeft,
  faCameraRotate,
  faCamera,
  faMagnifyingGlass,
  faImage,
  faFloppyDisk,
  faChartLine,
  faEye,
  faEyeSlash,
  faUsers,
  faCog,
  faUtensils,
  faSignOutAlt,
  faPlus,
  faTrash,
  faEdit,
  faFilter,
  faSort,
  faCheck,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

import RootNavigator from "./navigations/RootNavigator";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("./assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null; 
  }

  // Add all icons used in the app
  library.add(
    faHome,
    faArrowLeft,
    faCameraRotate,
    faCamera,
    faMagnifyingGlass,
    faImage,
    faFloppyDisk,
    faChartLine,
    faEye,
    faEyeSlash,
    faUsers,
    faCog,
    faUtensils,
    faSignOutAlt,
    faPlus,
    faTrash,
    faEdit,
    faFilter,
    faSort,
    faCheck,
    faTimes
  );

  return <RootNavigator />;
}

registerRootComponent(App);
AppRegistry.registerComponent("main", () => App);