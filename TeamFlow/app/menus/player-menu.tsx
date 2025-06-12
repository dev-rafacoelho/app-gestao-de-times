import React, { useState } from "react";
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

export default function PlayerMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);

  // Verificar se o jogador tem um time
  React.useEffect(() => {
    const checkTeam = async () => {
      const clubeId = await AsyncStorage.getItem("clube_id");
      setHasTeam(!!clubeId);
    };
    checkTeam();
  }, []);

  const menuItemsWithTeam = [
    {
      id: 1,
      title: "Meu Time",
      subtitle: "Ver informações do meu time",
      icon: "people",
      route: "/player/my-team",
      color: "#1a41aa",
    },
    {
      id: 2,
      title: "Treinos",
      subtitle: "Ver e responder aos treinos",
      icon: "fitness",
      route: "/player/trainings",
      color: "#4CAF50",
    },
    {
      id: 3,
      title: "Procurar Times",
      subtitle: "Procurar outro time",
      icon: "search",
      route: "/player/find-teams",
      color: "#ff9800",
    },
    {
      id: 4,
      title: "Sair do Time",
      subtitle: "Deixar o time atual",
      icon: "exit",
      route: "/player/leave-team",
      color: "#f44336",
      action: "leave-team",
    },
  ];

  const menuItemsWithoutTeam = [
    {
      id: 1,
      title: "Procurar Times",
      subtitle: "Encontrar e solicitar entrada em um time",
      icon: "search",
      route: "/player/find-teams",
      color: "#1a41aa",
    },
  ];

  const menuItems = hasTeam ? menuItemsWithTeam : menuItemsWithoutTeam;

  const handleLeaveTeam = async () => {
    Alert.alert(
      "Sair do Time",
      "Tem certeza que deseja sair do seu time atual?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const userId = await AsyncStorage.getItem("user_id");

              if (!userId) {
                Alert.alert("Erro", "Usuário não identificado");
                return;
              }

              const response = await fetch(
                `${API_URL}/users/${userId}/sair-clube`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                  },
                }
              );

              if (response.ok) {
                // Remover clube_id do AsyncStorage
                await AsyncStorage.removeItem("clube_id");

                Alert.alert("Sucesso", "Você saiu do time com sucesso!", [
                  {
                    text: "OK",
                    onPress: () => {
                      // Atualizar o estado para refletir que não tem mais time
                      setHasTeam(false);
                      // Já estamos no menu, apenas atualizamos a interface
                    },
                  },
                ]);
              } else {
                const errorData = await response.json();
                Alert.alert(
                  "Erro",
                  errorData.detail || "Não foi possível sair do time"
                );
              }
            } catch (error) {
              console.error("Erro ao sair do time:", error);
              Alert.alert("Erro", "Ocorreu um erro ao sair do time");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleMenuPress = (route: string, action?: string) => {
    if (action === "leave-team") {
      handleLeaveTeam();
    } else {
      router.push(route);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu do Jogador</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Bem-vindo ao TeamFlow!</Text>
          <Text style={styles.subText}>
            {hasTeam === null
              ? "Carregando..."
              : hasTeam
              ? "Gerencie seu time e treinos"
              : "Encontre um time para participar"}
          </Text>
        </View>

        <View style={styles.menuContainer}>
          {hasTeam !== null &&
            menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  { borderLeftColor: item.color },
                  loading && styles.menuItemDisabled,
                ]}
                onPress={() =>
                  !loading && handleMenuPress(item.route, item.action)
                }
                disabled={loading}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={loading ? "#ccc" : item.color}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[
                      styles.menuTitle,
                      loading && styles.menuTitleDisabled,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.menuSubtitle,
                      loading && styles.menuSubtitleDisabled,
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={loading ? "#ccc" : "#ccc"}
                />
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  menuContainer: {
    paddingHorizontal: 15,
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
  menuItemDisabled: {
    backgroundColor: "#f0f0f0",
  },
  menuTitleDisabled: {
    color: "#ccc",
  },
  menuSubtitleDisabled: {
    color: "#ccc",
  },
});
