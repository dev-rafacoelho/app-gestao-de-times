import React, { useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Animated } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PlayerMenu() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkTeamStatus = async () => {
      const clubeId = await AsyncStorage.getItem("clube_id");
      if (!clubeId) {
        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Navigate with animation
          router.push({
            pathname: "/player/find-teams",
            params: { animation: "fade" },
          });
        });
      }
    };

    checkTeamStatus();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu do Jogador</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Bem-vindo ao TeamFlow!</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#1a41aa",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  welcomeContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
});
