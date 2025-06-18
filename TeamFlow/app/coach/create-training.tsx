import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Config";
import NavigationBar from "../../components/NavigationBar";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateTraining() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const combineDateTime = () => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  const handleCreateTraining = async () => {
    if (!titulo.trim() || !local.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const dataHora = combineDateTime();
    if (dataHora <= new Date()) {
      Alert.alert("Erro", "A data e hora do treino deve ser no futuro");
      return;
    }

    setIsLoading(true);

    try {
      const tecnicoId = await AsyncStorage.getItem("user_id");

      if (!tecnicoId) {
        Alert.alert("Erro", "Usuário não identificado");
        return;
      }

      const response = await fetch(
        `${API_URL}/treinos/?tecnico_id=${tecnicoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            titulo: titulo.trim(),
            descricao: descricao.trim() || null,
            data_hora: dataHora.toISOString(),
            local: local.trim(),
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          "Sucesso",
          "Treino criado com sucesso! Todos os jogadores do time foram notificados.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Erro",
          errorData.detail || "Não foi possível criar o treino"
        );
      }
    } catch (error) {
      console.error("Erro ao criar treino:", error);
      Alert.alert("Erro", "Ocorreu um erro ao criar o treino");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Treino</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Título do Treino <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex: Treino Técnico - Finalizações"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descreva os objetivos e atividades do treino..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Local <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={local}
              onChangeText={setLocal}
              placeholder="Ex: Campo Principal, Quadra A, etc."
              maxLength={100}
            />
          </View>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeGroup}>
              <Text style={styles.label}>
                Data <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeGroup}>
              <Text style={styles.label}>
                Horário <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color="#666" />
                <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
            />
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#1a41aa" />
            <Text style={styles.infoText}>
              Ao criar o treino, todos os jogadores do seu time receberão uma
              notificação e poderão confirmar ou recusar a participação.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              isLoading && styles.createButtonDisabled,
            ]}
            onPress={handleCreateTraining}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? "Criando..." : "Criar Treino"}
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#1a41aa",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#f44336",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateTimeContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  dateTimeGroup: {
    flex: 1,
  },
  dateTimeButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    color: "#1a41aa",
    flex: 1,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: "#1a41aa",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#999",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
