import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import ShootingStyle from "../../styles/shootingStyle";
import { detectEmotion } from "../../services/api";
import { RootStackParamList } from "../../navigations/AppNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCamera,
  faCameraRotate,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import Row from "../../components/rowHome";
import UserInfo from "../userPage/userInfo";

const facescan = require("../../assets/image/face-scan.png");

type ShootingNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Shooting"
>;

const Shooting: React.FC = () => {
  const navigation = useNavigation<ShootingNavigationProp>();
  const cameraRef = useRef<CameraView | null>(null);

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    type?: string;
  } | null>(null);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [cameraType, setCameraType] = useState<"front" | "back">("front");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "You need to enable camera permissions in settings."
        );
        return;
      }
      setHasPermission(true);
    };

    requestPermissions();
  }, []);

  const handleTakePhoto = async () => {
    if (!hasPermission) {
      Alert.alert("Permission Required", "Camera access is required.");
      return;
    }

    if (!isOpenCamera) {
      setIsOpenCamera(true); // ✅ Nếu camera chưa mở, chỉ mở mà không chụp
      return;
    }

    if (cameraRef.current && !isTakingPhoto) {
      setIsTakingPhoto(true); // ✅ Đánh dấu đang chụp ảnh để tránh chụp liên tục
      const photo = await cameraRef.current.takePictureAsync({ base64: true });

      if (!photo || !photo.base64) {
        console.warn("⚠️ Failed to capture photo.");
        setIsTakingPhoto(false);
        return;
      }

      setSelectedFile({
        uri: `data:image/jpg;base64,${photo.base64}`,
        type: "image/jpg",
      });

      setIsOpenCamera(false); // ✅ Đóng camera sau khi chụp ảnh
      setIsTakingPhoto(false);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedFile({ uri: result.assets[0].uri, type: "image/jpg" });
      }
    } catch (error) {
      console.error("Error selecting image from gallery:", error);
    }
  };

  const toggleCameraType = () => {
    setCameraType((prev) => (prev === "front" ? "back" : "front"));
  };

  const handleStartTesting = async () => {
    if (!selectedFile) {
      Alert.alert("No Image", "Please take or select an image first.");
      return;
    }

    try {
      const emotion = await detectEmotion(selectedFile.uri);
      await AsyncStorage.setItem("emotion", emotion);
      navigation.navigate("Result");
    } catch (error) {
      Alert.alert("Error", "Failed to detect emotion.");
    }
  };

  const handleHome = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={ShootingStyle.container}>
      <View style={ShootingStyle.topinfo}>
        <View style={ShootingStyle.info}>
          <Row handleHome={handleHome} />
          <UserInfo />
        </View>
        <View style={ShootingStyle.mainphoto}>
          <View style={ShootingStyle.content}>
            <View style={ShootingStyle.elipse2}>
              <View style={ShootingStyle.elipse}>
                {isOpenCamera ? (
                  <CameraView
                    style={ShootingStyle.camera}
                    facing={cameraType}
                    ref={(ref) => (cameraRef.current = ref)}
                    onCameraReady={() => setIsCameraReady(true)}
                  />
                ) : selectedFile ? (
                  <Image
                    source={{ uri: selectedFile.uri }}
                    style={ShootingStyle.selectedImage}
                  />
                ) : (
                  <Image source={facescan} style={ShootingStyle.defaultImage} />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={ShootingStyle.bottominfo}>
        <View style={ShootingStyle.buttonmenu}>
          <View style={ShootingStyle.upload}>
            <TouchableOpacity
              onPress={handleTakePhoto}
              style={ShootingStyle.rectangleB}
            >
              <FontAwesomeIcon icon={faCamera} size={30} color="#5C6A7E" />
            </TouchableOpacity>
            {isOpenCamera ? (
              <TouchableOpacity
                onPress={toggleCameraType}
                style={ShootingStyle.rectangleB}
              >
                <FontAwesomeIcon
                  icon={faCameraRotate}
                  size={30}
                  color="#5C6A7E"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleChooseFromGallery}
                style={ShootingStyle.rectangleB}
              >
                <FontAwesomeIcon icon={faImage} size={30} color="#5C6A7E" />
              </TouchableOpacity>
            )}
          </View>
          <View style={ShootingStyle.test}>
            <TouchableOpacity
              onPress={handleStartTesting}
              style={ShootingStyle.rectangleC}
            >
              <Text style={ShootingStyle.testText}>Start Testing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Shooting;
