import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LogoPlaceholder from "../components/LogoPlaceholder";
import { API_URL } from "../constants/Config";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginResponse {
  message: string;
  user_id: number;
  tipo_user_id: number;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          email: email,
          senha: password,
        }),
      });

      const data = await response.json();
      console.log("Debug - Login response:", data); // Debug log

      if (response.ok && data.user_id && data.tipo_user_id) {
        // Armazena os dados do usuário
        await AsyncStorage.setItem("user_id", String(data.user_id));
        await AsyncStorage.setItem("tipo_user_id", String(data.tipo_user_id));

        // Verificar se os dados foram salvos
        const savedUserId = await AsyncStorage.getItem("user_id");
        const savedTipoUserId = await AsyncStorage.getItem("tipo_user_id");
        console.log("Debug - Saved user_id:", savedUserId); // Debug log
        console.log("Debug - Saved tipo_user_id:", savedTipoUserId); // Debug log

        // Redireciona baseado no tipo de usuário
        switch (data.tipo_user_id) {
          case 1: // Jogador
            router.replace("/menus/player-menu");
            break;
          case 2: // Técnico
            router.replace("/menus/coach-menu");
            break;
          default:
            Alert.alert("Erro", "Tipo de usuário não reconhecido");
        }
      } else {
        const errorMessage = data.message || "Credenciais inválidas";
        console.log("Debug - Login error:", errorMessage); // Debug log
        Alert.alert("Erro", errorMessage);
      }
    } catch (error) {
      console.error("Debug - Login error:", error); // Debug log
      Alert.alert(
        "Erro",
        "Erro ao conectar com o servidor. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a41aa" />

      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* Logo placement:
            To use your own logo, replace <LogoPlaceholder /> with:
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            
            Make sure to place your logo.png file in the assets folder */}
          <LogoPlaceholder />
        </View>
      </View>

      {/* Login Card */}
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>Login</Text>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem uma conta ainda? </Text>
          <Link href="/register" style={styles.registerLink}>
            Registrar-se
          </Link>
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

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <View style={styles.checkboxContainer}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? "#1a41aa" : undefined}
          />
          <Text style={styles.checkboxLabel}>Lembrar-se de mim</Text>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a41aa",
  },
  header: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
  },
  loginCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  registerText: {
    color: "#666",
  },
  registerLink: {
    color: "#1a41aa",
    fontWeight: "bold",
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
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "#1a41aa",
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
    borderRadius: 4,
    width: 20,
    height: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#666",
  },
  loginButton: {
    backgroundColor: "#1a41aa",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#999",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flex: 1,
  },
});
