import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Config";
import NavigationBar from "../../components/NavigationBar";

export default function CoachMenu() {
  const router = useRouter();
  const [hasClube, setHasClube] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCoachClub();
  }, []);

  const checkCoachClub = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        router.replace("/login");
        return;
      }

      // Verificar se o técnico tem clube
      const response = await fetch(`${API_URL}/clubes/meu-clube/${userId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        const clubeData = await response.json();
        console.log("Técnico tem clube:", clubeData);
        setHasClube(true);
        // Armazenar o clube_id se encontrado
        await AsyncStorage.setItem("clube_id", String(clubeData.id));
      } else {
        console.log("Técnico não tem clube");
        setHasClube(false);
        // Remover clube_id se não tem clube
        await AsyncStorage.removeItem("clube_id");
      }
    } catch (error) {
      console.error("Erro ao verificar clube do técnico:", error);
      setHasClube(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirmar Logout",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            // Limpar dados armazenados
            await AsyncStorage.multiRemove([
              "user_id",
              "tipo_user_id",
              "clube_id",
              "user_profile",
            ]);
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleCreateClub = () => {
    router.push("/coach/create-club");
  };

  const fullMenuItems = [
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
      route: "/coach/my-team",
      color: "#ff9800",
    },
    {
      id: 4,
      title: "Solicitações de Acesso",
      subtitle: "Aceitar ou recusar jogadores",
      icon: "person-add",
      route: "/coach/manage-requests",
      color: "#9c27b0",
    },
  ];

  const noClubMenuItems = [
    {
      id: 1,
      title: "Criar Clube",
      subtitle: "Crie seu clube para começar a gerenciar",
      icon: "add-circle",
      action: handleCreateClub,
      color: "#1a41aa",
    },
    {
      id: 2,
      title: "Sair",
      subtitle: "Fazer logout da conta",
      icon: "log-out",
      action: handleLogout,
      color: "#f44336",
    },
  ];

  const handleMenuPress = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.route) {
      router.push(item.route);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = hasClube ? fullMenuItems : noClubMenuItems;
  const welcomeText = hasClube 
    ? "Bem-vindo ao TeamFlow!" 
    : "Crie seu clube para começar!";
  const subText = hasClube 
    ? "Gerencie seu time e treinos" 
    : "Você precisa criar um clube antes de acessar as outras funcionalidades";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu do Técnico</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>{welcomeText}</Text>
          <Text style={styles.subText}>{subText}</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={() => handleMenuPress(item)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
  },
});
