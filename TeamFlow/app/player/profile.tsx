import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Environment";
import NavigationBar from "../../components/NavigationBar";

interface UserData {
  nome: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  tipo_user_id: number;
  clube_id: number | null;
  id: number;
  tipo_user: {
    nome: string;
    is_tecnico: boolean;
    id: number;
  };
  clube: any | null;
  clube_tecnico: any[];
}

export default function PlayerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("user_id");
        setUserId(storedUserId);

        if (storedUserId) {
          const response = await fetch(`${API_URL}/users/${storedUserId}`, {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserData(data);
            setNome(data.nome);
            setEmail(data.email);
            setDataNascimento(data.data_nascimento);
            setTelefone(data.telefone);
          } else {
            Alert.alert(
              "Erro",
              "Não foi possível carregar os dados do usuário"
            );
          }
        }
      } catch (error) {
        Alert.alert("Erro", "Ocorreu um erro ao carregar os dados");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          data_nascimento: dataNascimento,
          telefone,
        }),
      });
      if (response.ok) {
        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
        // Refresh user data after successful update
        const updatedData = await response.json();
        setUserData(updatedData);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o perfil.");
      }
    } catch (e) {
      Alert.alert("Erro", "Ocorreu um erro ao salvar.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a41aa" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Image
              source={require("../../assets/avatar.jpg")}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          {userData?.tipo_user && (
            <Text style={styles.userType}>
              {userData.tipo_user.nome.charAt(0).toUpperCase() +
                userData.tipo_user.nome.slice(1)}
            </Text>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={styles.input}
              value={dataNascimento}
              onChangeText={setDataNascimento}
              placeholder="AAAA-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="Telefone"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Salvando..." : "Salvar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <NavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  avatarContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  userType: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  saveButton: {
    backgroundColor: "#1a41aa",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
