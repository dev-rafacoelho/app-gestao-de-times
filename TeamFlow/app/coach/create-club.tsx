import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Config';

export default function CreateClub() {
  const router = useRouter();
  const [clubName, setClubName] = useState('');
  const [procurandoJogadores, setProcurandoJogadores] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreateClub = async () => {
    try {
      if (!clubName.trim()) {
        Alert.alert('Erro', 'Por favor, insira o nome do clube');
        return;
      }

      setLoading(true);

      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        router.replace('/login');
        return;
      }

      // Criar o clube
      const response = await fetch(`${API_URL}/clubes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          nome: clubName.trim(),
          tecnico_id: parseInt(userId),
          procurando_jogadores: procurandoJogadores,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Armazenar o clube_id
        await AsyncStorage.setItem('clube_id', String(responseData.id));
        
        Alert.alert(
          'Sucesso!',
          'Clube criado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Voltar para o menu do técnico que agora mostrará as opções completas
                router.replace('/menus/coach-menu');
              },
            },
          ]
        );
      } else {
        throw new Error(responseData.detail || 'Erro ao criar clube');
      }
    } catch (error) {
      console.error('Erro ao criar clube:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <Text style={styles.title}>Criar Clube</Text>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  Crie seu clube para começar a gerenciar treinos e jogadores
                </Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nome do Clube *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={clubName}
                    onChangeText={setClubName}
                    placeholder="Ex: FC Barcelona, Real Madrid..."
                    returnKeyType="done"
                    onSubmitEditing={handleCreateClub}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Procurando Jogadores</Text>
                    <Text style={styles.switchDescription}>
                      Permitir que jogadores vejam e solicitem entrada no seu clube
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.switch,
                      procurandoJogadores && styles.switchActive,
                    ]}
                    onPress={() => setProcurandoJogadores(!procurandoJogadores)}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        procurandoJogadores && styles.switchThumbActive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Create button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!clubName.trim() || loading) && styles.createButtonDisabled,
                ]}
                onPress={handleCreateClub}
                disabled={!clubName.trim() || loading}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Criando...' : 'Criar Clube'}
                </Text>
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
    backgroundColor: '#1a41aa',
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  descriptionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1a41aa',
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#1a41aa',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  createButton: {
    backgroundColor: '#1a41aa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 