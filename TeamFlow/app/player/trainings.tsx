import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Config";

interface Treino {
  id: number;
  titulo: string;
  descricao: string | null;
  data_hora: string;
  local: string;
  clube_id: number;
  criado_por: number;
  data_criacao: string;
  ativo: boolean;
}

interface ParticipacaoTreino {
  id: number;
  treino_id: number;
  jogador_id: number;
  status: string; // pendente, aceito, rejeitado
  data_resposta: string | null;
  observacao: string | null;
}

export default function PlayerTrainings() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [participacoes, setParticipacoes] = useState<ParticipacaoTreino[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);

  const fetchTreinos = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const clubeId = await AsyncStorage.getItem("clube_id");

      if (!userId || !clubeId) {
        Alert.alert("Erro", "Dados do usuário não encontrados");
        return;
      }

      // Buscar treinos do clube
      const treinosResponse = await fetch(
        `${API_URL}/treinos/clube/${clubeId}?jogador_id=${userId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (treinosResponse.ok) {
        const treinosData = await treinosResponse.json();
        setTreinos(treinosData);
      }

      // Buscar participações do jogador
      const participacoesResponse = await fetch(
        `${API_URL}/treinos/minhas-participacoes?jogador_id=${userId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (participacoesResponse.ok) {
        const participacoesData = await participacoesResponse.json();
        setParticipacoes(participacoesData);
      }
    } catch (error) {
      console.error("Erro ao buscar treinos:", error);
      Alert.alert("Erro", "Não foi possível carregar os treinos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTreinos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreinos();
  };

  const responderTreino = async (treinoId: number, status: string) => {
    try {
      setRespondingTo(treinoId);
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert("Erro", "Usuário não identificado");
        return;
      }

      const response = await fetch(
        `${API_URL}/treinos/participacao/${treinoId}?jogador_id=${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          "Sucesso",
          status === "aceito"
            ? "Presença confirmada no treino!"
            : "Você informou que não poderá participar do treino."
        );
        fetchTreinos(); // Recarregar dados
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Erro",
          errorData.detail || "Não foi possível responder ao treino"
        );
      }
    } catch (error) {
      console.error("Erro ao responder treino:", error);
      Alert.alert("Erro", "Ocorreu um erro ao responder ao treino");
    } finally {
      setRespondingTo(null);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("pt-BR"),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getParticipacaoStatus = (treinoId: number) => {
    return participacoes.find((p) => p.treino_id === treinoId);
  };

  const renderTreinoCard = (treino: Treino) => {
    const participacao = getParticipacaoStatus(treino.id);
    const { date, time } = formatDateTime(treino.data_hora);
    const isResponding = respondingTo === treino.id;

    return (
      <View key={treino.id} style={styles.treinoCard}>
        <View style={styles.treinoHeader}>
          <Ionicons name="fitness" size={24} color="#1a41aa" />
          <Text style={styles.treinoTitle}>{treino.titulo}</Text>
        </View>

        {treino.descricao && (
          <Text style={styles.treinoDescription}>{treino.descricao}</Text>
        )}

        <View style={styles.treinoInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.infoText}>{date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.infoText}>{time}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.infoText}>{treino.local}</Text>
          </View>
        </View>

        {participacao ? (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                participacao.status === "aceito" && styles.statusAceito,
                participacao.status === "rejeitado" && styles.statusRejeitado,
                participacao.status === "pendente" && styles.statusPendente,
              ]}
            >
              <Text style={styles.statusText}>
                {participacao.status === "aceito" && "✓ Confirmado"}
                {participacao.status === "rejeitado" && "✗ Não vou"}
                {participacao.status === "pendente" && "⏳ Pendente"}
              </Text>
            </View>
          </View>
        ) : null}

        {(!participacao || participacao.status === "pendente") && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => responderTreino(treino.id, "aceito")}
              disabled={isResponding}
            >
              {isResponding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Confirmar</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => responderTreino(treino.id, "rejeitado")}
              disabled={isResponding}
            >
              {isResponding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Não vou</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Treinos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a41aa" />
          <Text style={styles.loadingText}>Carregando treinos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Treinos</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {treinos.length > 0 ? (
          treinos.map(renderTreinoCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum treino agendado</Text>
          </View>
        )}
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
  content: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  treinoCard: {
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
  treinoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  treinoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  treinoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  treinoInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  statusAceito: {
    backgroundColor: "#4CAF50",
  },
  statusRejeitado: {
    backgroundColor: "#f44336",
  },
  statusPendente: {
    backgroundColor: "#ff9800",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 5,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
