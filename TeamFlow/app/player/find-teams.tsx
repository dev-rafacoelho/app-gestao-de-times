import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/Environment";

interface Team {
  nome: string;
  tecnico_id: number;
  procurando_jogadores: boolean;
  id: number;
  tecnico: {
    nome: string;
    email: string;
    data_nascimento: string;
    telefone: string;
    tipo_user_id: number;
    clube_id: number;
    id: number;
  };
  usuarios: any[];
}

export default function FindTeams() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch teams when component mounts and when debounced query changes
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const url = debouncedQuery.trim()
          ? `${API_URL}/clubes/procurando-jogadores?nome=${encodeURIComponent(
              debouncedQuery
            )}`
          : `${API_URL}/clubes/procurando-jogadores`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        } else {
          Alert.alert("Erro", "Não foi possível buscar os times");
        }
      } catch (error) {
        Alert.alert("Erro", "Ocorreu um erro ao buscar os times");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [debouncedQuery]);

  const handleRequestJoin = async (teamId: number) => {
    try {
      // TODO: Implement join request functionality
      Alert.alert(
        "Solicitação Enviada",
        "Sua solicitação para entrar no time foi enviada com sucesso!"
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a solicitação");
    }
  };

  const renderTeamItem = ({ item }: { item: Team }) => (
    <View style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{item.nome}</Text>
        {item.procurando_jogadores && (
          <View style={styles.searchingBadge}>
            <Text style={styles.searchingText}>Procurando Jogadores</Text>
          </View>
        )}
      </View>

      <View style={styles.teamInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>Técnico: {item.tecnico.nome}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={16} color="#666" />
          <Text style={styles.infoText}>{item.tecnico.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#666" />
          <Text style={styles.infoText}>{item.tecnico.telefone}</Text>
        </View>
      </View>

      {item.procurando_jogadores && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleRequestJoin(item.id)}
        >
          <Text style={styles.joinButtonText}>Solicitar Entrada</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Encontrar Times</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar times..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a41aa" />
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTeamItem}
          contentContainerStyle={styles.teamList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Nenhum time encontrado com esse nome"
                  : "Nenhum time disponível no momento"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#1a41aa",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  teamList: {
    padding: 16,
    paddingBottom: 100, // Space for navigation bar
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  searchingBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchingText: {
    color: "#1a41aa",
    fontSize: 12,
    fontWeight: "500",
  },
  teamInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  joinButton: {
    backgroundColor: "#1a41aa",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
