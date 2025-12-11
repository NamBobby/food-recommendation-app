import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { CameraView, useCameraPermissions } from "expo-camera";
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

const facescan = require("../../assets/image/facescan.gif");

type ShootingNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Shooting"
>;

const Shooting: React.FC = () => {
  const navigation = useNavigation<ShootingNavigationProp>();

  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const [selectedFile, setSelectedFile] = useState<{ uri: string; type?: string } | null>(null);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("front");

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission, requestPermission]);

  const toggleCameraType = () => {
    setFacing((prev) => (prev === "front" ? "back" : "front"));
  };

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert("Permission Required", "Camera access is required.");
        return;
      }
    }

    if (!isOpenCamera) {
      setIsOpenCamera(true);
      return;
    }

    if (!cameraRef.current) {
      Alert.alert("Camera Error", "Camera not ready.");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
      });

      setSelectedFile({ uri: photo.uri, type: "image/jpg" });
    } catch {
      Alert.alert("Error", "Failed to take photo.");
    } finally {
      setIsOpenCamera(false);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedFile({ uri: result.assets[0].uri });
      }
    } catch {
      Alert.alert("Error", "Cannot open gallery.");
    }
  };

  const handleStartTesting = async () => {
    if (!selectedFile) {
      Alert.alert("No Image", "Please take or select an image first.");
      return;
    }

    try {
      const emotion = await detectEmotion(selectedFile.uri);
      await AsyncStorage.setItem("emotion", emotion);
      await AsyncStorage.setItem("capturedImageUri", selectedFile.uri);

      navigation.navigate("Result", { capturedImageUri: selectedFile.uri });
    } catch {
      Alert.alert("Error", "Emotion detection failed.");
    }
  };

  return (
    <View style={ShootingStyle.container}>
      <View style={ShootingStyle.topinfo}>
        <View style={ShootingStyle.info}>
          <Row handleHome={() => navigation.navigate("Home")} />
        </View>
        <View style={ShootingStyle.mainphoto}>
          <View style={ShootingStyle.content}>
            <View style={ShootingStyle.elipse2}>
              <View style={ShootingStyle.elipse}>
                {isOpenCamera ? (
                  <CameraView ref={cameraRef} style={ShootingStyle.camera} facing={facing} />
                ) : selectedFile ? (
                  <Image source={{ uri: selectedFile.uri }} style={ShootingStyle.selectedImage} />
                ) : (
                  <Image source={facescan} style={ShootingStyle.defaultImage} resizeMode="cover" />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={ShootingStyle.bottominfo}>
        <View style={ShootingStyle.buttonmenu}>
          <View style={ShootingStyle.upload}>
            <TouchableOpacity onPress={handleTakePhoto} style={ShootingStyle.rectangleB}>
              <FontAwesomeIcon icon={faCamera} size={30} color="#1E1E1E" />
            </TouchableOpacity>

            {isOpenCamera ? (
              <TouchableOpacity onPress={toggleCameraType} style={ShootingStyle.rectangleB}>
                <FontAwesomeIcon icon={faCameraRotate} size={30} color="#1E1E1E" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleChooseFromGallery} style={ShootingStyle.rectangleB}>
                <FontAwesomeIcon icon={faImage} size={30} color="#1E1E1E" />
              </TouchableOpacity>
            )}
          </View>

          <View style={ShootingStyle.test}>
            <TouchableOpacity onPress={handleStartTesting} style={ShootingStyle.rectangleC}>
              <Text style={ShootingStyle.testText}>Start Testing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Shooting;
