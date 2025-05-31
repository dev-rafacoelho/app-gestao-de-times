import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function Menu() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a41aa" />
      <View style={styles.content}>
        <Text style={styles.title}>Menu Principal</Text>
        <Text style={styles.welcomeText}>Bem-vindo ao TeamFlow!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a41aa",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: "#fff",
  },
});
