import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/Environment";

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"jogador" | "tecnico" | null>(null);

  // Formatador de telefone: (XX)XXXXXXXXX
  const formatPhone = (text) => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, "");

    // Limita a 11 dígitos (2 para DDD + 9 para o número)
    const trimmed = cleaned.substring(0, 11);

    // Aplica a formatação conforme a quantidade de dígitos
    if (trimmed.length === 0) return "";
    if (trimmed.length <= 2) return `(${trimmed}`;
    return `(${trimmed.substring(0, 2)})${trimmed.substring(2)}`;
  };

  // Formatador de data: DD/MM/AAAA
  const formatBirthDate = (text) => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, "");

    // Limita a 8 dígitos
    const trimmed = cleaned.substring(0, 8);

    // Aplica a formatação conforme a quantidade de dígitos
    if (trimmed.length === 0) return "";
    if (trimmed.length <= 2) return trimmed;
    if (trimmed.length <= 4)
      return `${trimmed.substring(0, 2)}/${trimmed.substring(2)}`;
    return `${trimmed.substring(0, 2)}/${trimmed.substring(
      2,
      4
    )}/${trimmed.substring(4)}`;
  };

  // Handlers para formatação durante a digitação
  const handlePhoneChange = (text) => {
    setPhone(formatPhone(text));
  };

  const handleBirthDateChange = (text) => {
    setBirthDate(formatBirthDate(text));
  };

  const handleRegister = async () => {
    try {
      // Validar campos obrigatórios
      if (
        !fullName ||
        !email ||
        !birthDate ||
        !phone ||
        !password ||
        !userType
      ) {
        alert("Por favor, preencha todos os campos");
        return;
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Por favor, insira um email válido");
        return;
      }

      // Validar data de nascimento (mínimo básico)
      if (!birthDate || !birthDate.includes("/")) {
        alert("Por favor, insira uma data de nascimento no formato DD/MM/AAAA");
        return;
      }

      // Converter a data do formato DD/MM/YYYY para YYYY-MM-DD
      const dateParts = birthDate.split("/");
      const [day, month, year] = dateParts;
      
      if (!day || !month || !year || year.length !== 4) {
        alert("Data incompleta. Use o formato DD/MM/AAAA");
        return;
      }

      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      console.log("Data original:", birthDate);
      console.log("Data formatada:", formattedDate);

      // Preparar dados para envio
      const userData = {
        nome: fullName,
        email: email.toLowerCase().trim(),
        data_nascimento: formattedDate,
        telefone: phone.replace(/[^0-9]/g, ""), // Remove caracteres não numéricos
        senha: password,
        tipo_user_id: userType === "tecnico" ? 2 : 1, // 2 para técnico, 1 para jogador
      };

      console.log("Dados sendo enviados:", userData);

      // Fazer requisição para a API - tenta diferentes URLs em desenvolvimento
      const possibleUrls = __DEV__ 
        ? [
            "https://teste-faculdade-backend.lvbgea.easypanel.host", // Android Emulator
            "http://127.0.0.1:8000", // Localhost
            "http://localhost:8000", // Localhost alternativo
            API_URL // URL de produção como fallback
          ]
        : [API_URL];

      let response;
      let responseData;
      let lastError;

      for (const apiUrl of possibleUrls) {
        try {
          console.log("Tentando URL:", `${apiUrl}/auth/register`);
          
          response = await fetch(`${apiUrl}/auth/register`, {
            method: "POST",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          responseData = await response.json();
          console.log("Resposta da API:", responseData);
          break; // Se chegou aqui, a requisição funcionou
        } catch (error) {
          console.log(`Falha na URL ${apiUrl}:`, error);
          lastError = error;
          continue; // Tenta a próxima URL
        }
      }

      if (!response) {
        throw lastError || new Error("Não foi possível conectar com o servidor");
      }

      if (!response.ok) {
        throw new Error(responseData.detail || "Erro ao registrar usuário");
      }

      // Registro bem sucedido
      alert("Registro realizado com sucesso!");
      router.replace("/login");
    } catch (error) {
      console.error("Erro no registro:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      if (errorMessage.includes("Network request failed") || errorMessage.includes("fetch")) {
        alert("Erro de conexão. Verifique se o servidor está rodando e tente novamente.");
      } else {
        alert(errorMessage || "Erro ao registrar usuário");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* Header with back button */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <Text style={styles.title}>Registrar</Text>
              </View>

              {/* Login link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já possui uma conta? </Text>
                <Link href="/login" style={styles.loginLink}>
                  Login
                </Link>
              </View>

              {/* User Type Selection */}
              <View style={styles.userTypeContainer}>
                <Text style={styles.inputLabel}>Tipo de Usuário</Text>
                <View style={styles.userTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === "jogador" && styles.userTypeButtonSelected,
                    ]}
                    onPress={() => setUserType("jogador")}
                  >
                    <Text
                      style={[
                        styles.userTypeButtonText,
                        userType === "jogador" &&
                          styles.userTypeButtonTextSelected,
                      ]}
                    >
                      Jogador
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === "tecnico" && styles.userTypeButtonSelected,
                    ]}
                    onPress={() => setUserType("tecnico")}
                  >
                    <Text
                      style={[
                        styles.userTypeButtonText,
                        userType === "tecnico" &&
                          styles.userTypeButtonTextSelected,
                      ]}
                    >
                      Técnico
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Registration form */}
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nome completo</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Lois Becket"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>E-mail</Text>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Loisbecket@gmail.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Data de nascimento</Text>
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={birthDate}
                      onChangeText={handleBirthDateChange}
                      placeholder="DD/MM/AAAA"
                      keyboardType="numeric"
                      maxLength={10}
                      returnKeyType="next"
                    />
                    <TouchableOpacity style={styles.calendarIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Telefone</Text>
                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="(XX)XXXXXXXXX"
                    keyboardType="phone-pad"
                    maxLength={13}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Senha</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.textInput, styles.passwordInput]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••"
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={24}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Register button */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
              >
                <Text style={styles.registerButtonText}>Registrar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a41aa",
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  loginContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    color: "#1a41aa",
    fontWeight: "bold",
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  userTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 5,
    alignItems: "center",
  },
  userTypeButtonSelected: {
    backgroundColor: "#1a41aa",
    borderColor: "#1a41aa",
  },
  userTypeButtonText: {
    color: "#666",
    fontSize: 16,
  },
  userTypeButtonTextSelected: {
    color: "#fff",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  dateInputContainer: {
    position: "relative",
  },
  calendarIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  registerButton: {
    backgroundColor: "#1a41aa",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
