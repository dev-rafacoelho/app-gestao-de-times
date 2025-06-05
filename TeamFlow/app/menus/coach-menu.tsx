import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import NavigationBar from "../../components/NavigationBar";

export default function CoachMenu() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu do Técnico</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Bem-vindo ao TeamFlow!</Text>
      </View>

      <NavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  content: {
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
