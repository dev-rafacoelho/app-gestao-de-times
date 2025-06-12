import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Config";

interface Usuario {
  nome: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  tipo_user_id: number;
  clube_id: number | null;
  id: number;
}

interface Tecnico {
  nome: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  tipo_user_id: number;
  clube_id: number | null;
  id: number;
}

interface TeamInfo {
  nome: string;
  tecnico_id: number;
  procurando_jogadores: boolean;
  id: number;
  tecnico: Tecnico;
  usuarios: Usuario[];
}

export default function CoachMyTeam() {
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeamInfo = async () => {
    try {
      const tecnicoId = await AsyncStorage.getItem("user_id");

      if (!tecnicoId) {
        Alert.alert("Erro", "Usuário não identificado");
        return;
      }

      console.log("Debug - Buscando clube para técnico ID:", tecnicoId);

      // Para técnicos, usar a rota específica que busca pelo tecnico_id
      const response = await fetch(`${API_URL}/clubes/meu-clube/${tecnicoId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      console.log("Debug - Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Debug - Dados do clube:", data);
        setTeamInfo(data);
      } else {
        const errorData = await response.json();
        console.log("Debug - Error data:", errorData);

        if (response.status === 404) {
          Alert.alert(
            "Clube não encontrado",
            "Você ainda não possui um clube associado. Entre em contato com o administrador."
          );
        } else {
          Alert.alert(
            "Erro",
            "Não foi possível carregar as informações do time"
          );
        }
      }
    } catch (error) {
      console.error("Erro ao buscar informações do time:", error);
      Alert.alert("Erro", "Ocorreu um erro ao carregar as informações do time");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamInfo();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamInfo();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const toggleProcurandoJogadores = async () => {
    if (!teamInfo) return;

    try {
      const response = await fetch(
        `${API_URL}/clubes/${teamInfo.id}/procurando-jogadores`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            procurando_jogadores: !teamInfo.procurando_jogadores,
          }),
        }
      );

      if (response.ok) {
        const updatedClube = await response.json();
        setTeamInfo(updatedClube);
        Alert.alert(
          "Status atualizado",
          updatedClube.procurando_jogadores
            ? "Seu time agora está procurando jogadores"
            : "Seu time não está mais procurando jogadores"
        );
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o status");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Ocorreu um erro ao atualizar o status");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Time</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a41aa" />
          <Text style={styles.loadingText}>
            Carregando informações do time...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!teamInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Time</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            Você ainda não possui um time associado
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Time</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Informações do Time */}
        <View style={styles.teamCard}>
          <View style={styles.teamHeader}>
            <Ionicons name="trophy" size={24} color="#1a41aa" />
            <Text style={styles.teamName}>{teamInfo.nome}</Text>
          </View>

          <View style={styles.teamStatus}>
            <View style={styles.statusRow}>
              <Ionicons
                name={
                  teamInfo.procurando_jogadores
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={teamInfo.procurando_jogadores ? "#4CAF50" : "#f44336"}
              />
              <Text style={styles.statusText}>
                {teamInfo.procurando_jogadores
                  ? "Procurando jogadores"
                  : "Não está procurando jogadores"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                teamInfo.procurando_jogadores && styles.toggleButtonActive,
              ]}
              onPress={toggleProcurandoJogadores}
            >
              <Text style={styles.toggleButtonText}>
                {teamInfo.procurando_jogadores
                  ? "Parar de procurar"
                  : "Procurar jogadores"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de Jogadores */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={24} color="#1a41aa" />
            <Text style={styles.sectionTitle}>
              Jogadores ({teamInfo.usuarios.length})
            </Text>
          </View>

          {teamInfo.usuarios.map((jogador, index) => (
            <View key={jogador.id} style={styles.playerCard}>
              <View style={styles.playerHeader}>
                <Ionicons name="person" size={20} color="#1a41aa" />
                <Text style={styles.playerName}>{jogador.nome}</Text>
              </View>

              <View style={styles.playerInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={14} color="#666" />
                  <Text style={styles.smallInfoText}>{jogador.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={14} color="#666" />
                  <Text style={styles.smallInfoText}>{jogador.telefone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={14} color="#666" />
                  <Text style={styles.smallInfoText}>
                    {formatDate(jogador.data_nascimento)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {teamInfo.usuarios.length === 0 && (
            <View style={styles.emptyPlayersContainer}>
              <Text style={styles.emptyPlayersText}>
                Nenhum jogador no time ainda
              </Text>
              <Text style={styles.emptyPlayersSubText}>
                {teamInfo.procurando_jogadores
                  ? "Aguarde novas solicitações de jogadores"
                  : "Ative 'Procurar jogadores' para receber solicitações"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#1a41aa",
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  teamName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  teamStatus: {
    marginTop: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  toggleButton: {
    backgroundColor: "#1a41aa",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  toggleButtonActive: {
    backgroundColor: "#f44336",
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  smallInfoText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  playerCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#1a41aa",
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  playerInfo: {
    marginLeft: 28,
  },
  emptyPlayersContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyPlayersText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyPlayersSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
