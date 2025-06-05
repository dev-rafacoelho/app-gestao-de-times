import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NavigationBar from "../../components/NavigationBar";

export default function CoachMenu() {
  const router = useRouter();

  const menuItems = [
    {
      id: 1,
      title: "Gerenciar Treinos",
      subtitle: "Ver e gerenciar treinos criados",
      icon: "fitness",
      route: "/coach/trainings",
      color: "#4CAF50",
    },
    {
      id: 2,
      title: "Criar Treino",
      subtitle: "Agendar novo treino para o time",
      icon: "add-circle",
      route: "/coach/create-training",
      color: "#1a41aa",
    },
    {
      id: 3,
      title: "Meu Time",
      subtitle: "Ver informações do time",
      icon: "people",
      route: "/player/my-team",
      color: "#ff9800",
    },
  ];

  const handleMenuPress = (route: string) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu do Técnico</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Bem-vindo ao TeamFlow!</Text>
          <Text style={styles.subText}>Gerencie seu time e treinos</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={() => handleMenuPress(item.route)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={28}
                  color={item.color}
                />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <NavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    paddingHorizontal: 15,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 12,
    marginTop: 15,
  },
  welcomeText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  menuIconContainer: {
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
