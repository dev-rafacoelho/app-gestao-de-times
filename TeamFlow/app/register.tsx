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
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={styles.scrollView}>
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

          {/* Registration form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome completo</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Lois Becket"
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
                />
                <TouchableOpacity style={styles.calendarIcon}>
                  <Ionicons name="calendar-outline" size={24} color="#999" />
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
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
