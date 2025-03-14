import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Svg, { Circle } from "react-native-svg"; // 🟢 Import đúng cách
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import UserInfo from "../userPage/userInfo";
import Row from "../../components/rowBack";
import ResultStyle from "../../styles/resultStyle";

const Result: React.FC = () => {
  const [result, setResult] = useState<string>("level_1"); // 🟢 Giá trị mặc định để test UI
  const [scanning, setScanning] = useState(true);
  const imageUrl = "https://via.placeholder.com/150"; // 🟢 Ảnh giả để test UI

  useEffect(() => {
    setTimeout(() => {
      setScanning(false);
    }, 2000);
  }, []);

  const getCircleChartPercentage = () => {
    switch (result) {
      case "level_0":
        return 113.96058;
      case "level_1":
        return 75.97372;
      case "level_2":
        return 37.98686;
      case "level_3":
        return 0;
      default:
        return 0;
    }
  };

  const getCircleColor = () => {
    switch (result) {
      case "level_0":
        return "#5CEA7E"; // Green
      case "level_1":
        return "#6EA9F7"; // Blue
      case "level_2":
        return "#805AE3"; // Purple
      case "level_3":
        return "#FF5A63"; // Red
      default:
        return "#D1D1D1"; // Default gray
    }
  };

  return (
    <View style={ResultStyle.container}>
      <View style={ResultStyle.topinfo}>
        <View style={ResultStyle.info}>
          <Row />
          <UserInfo userName="Guest" handleSignOut={() => {}} /> {/* 🟢 Không làm gì khi bấm Sign Out */}
        </View>
        <View style={ResultStyle.mainphoto}>
          <View style={ResultStyle.content}>
            <View style={ResultStyle.elipse2}>
              <View style={ResultStyle.elipse}>
                {imageUrl && <Image source={{ uri: imageUrl }} style={ResultStyle.img} />}
              </View>
            </View>
          </View>
        </View>
        <View style={ResultStyle.infos}>
          <View style={ResultStyle.backmenu}>
            <TouchableOpacity style={ResultStyle.rectangleA}>
              <FontAwesomeIcon icon="floppy-disk" size={30} color="#AEB5BF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={ResultStyle.bottominfo}>
        <View style={ResultStyle.circleChart}>
          {scanning ? (
            <View style={ResultStyle.circleChartPercentage}>
              <View style={ResultStyle.contents}>
                <Text style={ResultStyle.scanningText}>Scanning...</Text>
              </View>
            </View>
          ) : (
            <View style={ResultStyle.circleChartPercentage}>
              <Svg style={ResultStyle.circleChartBackground} viewBox="0 0 50 50">
                <Circle
                  cx={25}
                  cy={25}
                  r={24}
                  strokeWidth={2}
                  stroke={getCircleColor()}
                  strokeDasharray={151.94744}
                  strokeDashoffset={getCircleChartPercentage()}
                  fill="transparent"
                  strokeLinecap="round"
                  transform="rotate(-90, 25, 25)" // 🟢 Đổi từ `style` sang `transform`
                />
              </Svg>
              <View style={ResultStyle.contents}>
                <Text style={ResultStyle.resultText}>{result}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default Result;
