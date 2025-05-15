import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export default function LogoPlaceholder() {
  return (
    <View style={styles.container}>
      <Svg width="80" height="80" viewBox="0 0 100 100" fill="none">
        <Circle cx="50" cy="30" r="10" fill="#FFFFFF" />
        <Circle cx="30" cy="30" r="10" fill="#FFFFFF" />
        <Circle cx="70" cy="30" r="10" fill="#FFFFFF" />
        <Path
          d="M20 45C20 35 35 50 50 50C65 50 80 35 80 45V70C80 77.5 65 85 50 85C35 85 20 77.5 20 70V45Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
        />
        <Path
          d="M35 65L50 75L65 65"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Path
          d="M50 50V75"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.text}>TEAMFLOW</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
});
