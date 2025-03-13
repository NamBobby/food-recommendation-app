import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";
import AppNavigator from "./navigations/AppNavigator";
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
} from "@fortawesome/free-solid-svg-icons";

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
    faEyeSlash
  );

  return <AppNavigator />;
}

registerRootComponent(App);
AppRegistry.registerComponent("main", () => App);
