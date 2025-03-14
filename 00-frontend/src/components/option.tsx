import React from "react";
import { View, TouchableOpacity } from "react-native";
import styles from "../styles/homeStyle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

interface OptionProps {
  onPressShooting: () => void;
  onPressTracking: () => void;
  onPressInstruction?: () => void; 
}

const Option: React.FC<OptionProps> = ({ onPressShooting, onPressTracking, onPressInstruction }) => {
  return (
    <View style={styles.option}>
      <View style={styles.rectangle}>
        <TouchableOpacity onPress={onPressShooting}>
          <View style={styles.option}>
            <FontAwesomeIcon icon="magnifying-glass" size={30} color="#535773" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.rectangle}>
        <TouchableOpacity onPress={onPressTracking}>
          <View style={styles.option}>
            <FontAwesomeIcon icon="chart-line" size={30} color="#535773" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Option;
