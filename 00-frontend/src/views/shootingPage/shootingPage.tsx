import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigations/AppNavigator";
import { Camera, CameraView } from "expo-camera"; 
import * as ImagePicker from "expo-image-picker";
import ShootingStyle from "../../styles/shootingStyle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Row from "../../components/rowHome";
import UserInfo from "../userPage/userInfo";

// 🟢 Import hình ảnh đúng cách
const facescan = require("../../assets/image/face-scan.png");

type ShootingNavigationProp = StackNavigationProp<RootStackParamList, "Shooting">;

const Shooting: React.FC = () => {
  const navigation = useNavigation<ShootingNavigationProp>();
  const [selectedFile, setSelectedFile] = useState<{ uri: string } | null>(null);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("front"); 

  const cameraRef = useRef<CameraView | null>(null); 

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      if (isCapturing) return;
      setIsCapturing(true);

      try {
        let photo = await cameraRef.current.takePictureAsync();
        if (!photo) return; // 🟢 Kiểm tra `photo` trước khi sử dụng
        setSelectedFile({ uri: photo.uri });
        setIsOpenCamera(false);
      } catch (error) {
        console.log(error);
      } finally {
        setIsCapturing(false);
      }
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

      if (!result.canceled) {
        setSelectedFile({ uri: result.assets[0].uri });
        setIsOpenCamera(false);
        setIsCameraReady(false);
      } else {
        alert("No image selected.");
      }
    } catch (error) {
      console.log("Error selecting image from gallery:", error);
      alert("An error occurred while selecting an image.");
    }
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access the camera was denied.");
      }
    };

    getCameraPermission();
  }, []);

  const toggleCameraFacing = () => {
    setFacing((prevFacing) => (prevFacing === "front" ? "back" : "front"));
  };

  const handleSignOut = () => {
    navigation.navigate("Login");
  };

  const handleHome = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={ShootingStyle.container}>
      <View style={ShootingStyle.topinfo}>
        <View style={ShootingStyle.info}>
          <Row handleHome={handleHome} />
          <UserInfo userName="Guest" handleSignOut={handleSignOut} />
        </View>
        <View style={ShootingStyle.mainphoto}>
          <View style={ShootingStyle.content}>
            <View style={ShootingStyle.elipse2}>
              <View style={ShootingStyle.elipse}>
                {isOpenCamera ? (
                  <CameraView
                    style={ShootingStyle.camera}
                    facing={facing} 
                    ref={(ref) => (cameraRef.current = ref)}
                    onCameraReady={handleCameraReady}
                  />
                ) : selectedFile ? (
                  <Image source={{ uri: selectedFile.uri }} style={ShootingStyle.selectedImage} />
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
            <TouchableOpacity onPress={handleTakePhoto} style={ShootingStyle.rectangleB}>
              <FontAwesomeIcon icon="camera" size={30} color="#5C6A7E" />
            </TouchableOpacity>
            {isCameraReady ? (
              <TouchableOpacity onPress={toggleCameraFacing} style={ShootingStyle.rectangleB}>
                <FontAwesomeIcon icon="camera-rotate" size={30} color="#5C6A7E" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleChooseFromGallery} style={ShootingStyle.rectangleB}>
                <FontAwesomeIcon icon="image" size={30} color="#5C6A7E" />
              </TouchableOpacity>
            )}
          </View>
          <View style={ShootingStyle.test}>
            <TouchableOpacity style={ShootingStyle.rectangleC}>
              <Text style={ShootingStyle.testText}>Start Testing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Shooting;
