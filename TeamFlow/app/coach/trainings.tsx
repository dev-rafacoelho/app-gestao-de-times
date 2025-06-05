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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Config";

interface Participacao {
  id: number;
  treino_id: number;
  jogador_id: number;
  status: string;
  data_resposta: string | null;
  observacao: string | null;
  jogador: {
    id: number;
    nome: string;
    email: string;
  };
}

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
  participacoes: Participacao[];
}

export default function CoachTrainings() {
  const router = useRouter();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTreinos = async () => {
    try {
      const tecnicoId = await AsyncStorage.getItem("user_id");

      if (!tecnicoId) {
        Alert.alert("Erro", "Usuário não identificado");
        return;
      }

      const response = await fetch(
        `${API_URL}/treinos/meus-treinos?tecnico_id=${tecnicoId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const treinosData = await response.json();
        setTreinos(treinosData);
      } else {
        Alert.alert("Erro", "Não foi possível carregar os treinos");
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

  const getParticipacaoStats = (participacoes: Participacao[]) => {
    const aceitos = participacoes.filter((p) => p.status === "aceito").length;
    const rejeitados = participacoes.filter(
      (p) => p.status === "rejeitado"
    ).length;
    const pendentes = participacoes.filter(
      (p) => p.status === "pendente"
    ).length;
    const total = participacoes.length;

    return { aceitos, rejeitados, pendentes, total };
  };

  const renderTreinoCard = (treino: Treino) => {
    const { date, time } = formatDateTime(treino.data_hora);
    const stats = getParticipacaoStats(treino.participacoes);
    const isPast = new Date(treino.data_hora) < new Date();

    return (
      <View
        key={treino.id}
        style={[styles.treinoCard, isPast && styles.pastTraining]}
      >
        <View style={styles.treinoHeader}>
          <View style={styles.titleContainer}>
            <Ionicons name="fitness" size={24} color="#1a41aa" />
            <Text style={styles.treinoTitle}>{treino.titulo}</Text>
          </View>
          {isPast && (
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>Realizado</Text>
            </View>
          )}
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

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Participação dos Jogadores:</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#4CAF50" }]} />
              <Text style={styles.statText}>{stats.aceitos} Confirmaram</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#f44336" }]} />
              <Text style={styles.statText}>{stats.rejeitados} Não vão</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#ff9800" }]} />
              <Text style={styles.statText}>{stats.pendentes} Pendentes</Text>
            </View>
          </View>
        </View>

        {treino.participacoes.length > 0 && (
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => {
              // Aqui você pode navegar para uma tela de detalhes
              Alert.alert(
                "Participações",
                treino.participacoes
                  .map((p) => `${p.jogador.nome}: ${p.status}`)
                  .join("\n")
              );
            }}
          >
            <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
            <Ionicons name="chevron-forward" size={16} color="#1a41aa" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Treinos</Text>
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
        <Text style={styles.headerTitle}>Meus Treinos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/coach/create-training")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
            <Text style={styles.emptyText}>Nenhum treino criado ainda</Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => router.push("/coach/create-training")}
            >
              <Text style={styles.createFirstButtonText}>
                Criar Primeiro Treino
              </Text>
            </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: "#1a41aa",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  pastTraining: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: "#ccc",
  },
  treinoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  treinoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  pastBadge: {
    backgroundColor: "#ccc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pastBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
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
  statsContainer: {
    marginBottom: 15,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 10,
  },
  detailsButtonText: {
    color: "#1a41aa",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },
});
