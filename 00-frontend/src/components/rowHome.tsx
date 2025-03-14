import React from "react";
import { View, TouchableOpacity } from "react-native";
import RowStyle from "../styles/rowhomeStyle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

interface RowProps {
  handleHome: () => void;
}

const Row: React.FC<RowProps> = ({ handleHome }) => {
  return (
    <View style={RowStyle.backmenu}>
      <TouchableOpacity onPress={handleHome}>
        <View style={RowStyle.rectangleA}>
          <FontAwesomeIcon icon="home" size={30} color="#EDD8E9" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Row;
