import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, SafeAreaView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function PerfilScreen() {
  const [editing, setEditing] = useState(false);
  const [showSportModal, setShowSportModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    sexo: '',
    peso: '',
    altura: '',
    esporte: '',
    posicao: '',
    horarios: {
      manha: [],
      tarde: [],
      noite: []
    }
  });

  const esportesComPosicoes = {
    'Futebol': ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-campo', 'Atacante'],
    'Basquete': ['Armador', 'Ala-armador', 'Ala', 'Ala-pivô', 'Pivô'],
    'Vôlei': ['Levantador', 'Oposto', 'Ponteiro', 'Central', 'Líbero'],
    'Tênis': ['Simples', 'Duplas'],
    'Natação': ['Livre', 'Costas', 'Peito', 'Borboleta'],
    'Handebol': ['Goleiro', 'Armador', 'Meia', 'Ponta', 'Pivô'],
    'Rugby': ['Pilar', 'Hooker', 'Segunda linha', 'Terceira linha', 'Abertura', 'Centro', 'Ala', 'Fullback'],
    'Beisebol': ['Arremessador', 'Receptor', 'Primeira base', 'Segunda base', 'Terceira base', 'Shortstop', 'Campo esquerdo', 'Campo central', 'Campo direito'],
    'Cricket': ['Batedor', 'Arremessador', 'Wicket-keeper', 'All-rounder'],
    'Golfe': ['Profissional', 'Amador'],
    'Atletismo': ['Corrida', 'Salto', 'Arremesso', 'Lançamento'],
    'Boxe': ['Peso mosca', 'Peso galo', 'Peso pena', 'Peso leve', 'Peso médio', 'Peso pesado'],
    'Judô': ['Leve', 'Médio', 'Pesado'],
    'Taekwondo': ['Leve', 'Médio', 'Pesado'],
    'Karatê': ['Kata', 'Kumite'],
    'Esgrima': ['Florete', 'Espada', 'Sabre'],
    'Ginástica': ['Artística', 'Rítmica', 'Trampolim'],
    'Nado Sincronizado': ['Solo', 'Dueto', 'Equipe'],
    'Polo Aquático': ['Goleiro', 'Atacante', 'Defensor'],
    'Hóquei': ['Goleiro', 'Defensor', 'Meio-campo', 'Atacante']
  };

  const horariosDisponiveis = {
    manha: ['7h', '8h', '9h'],
    tarde: ['13h', '14h', '15h'],
    noite: ['19h', '20h', '21h']
  };

  useEffect(() => {
    carregarDadosDoCadastro();
  }, []);

  const carregarDadosDoCadastro = async () => {
    try {
      const dadosCadastro = await AsyncStorage.getItem('dadosCadastro');
      const dadosProfissional = await AsyncStorage.getItem('dadosProfissionais');
      
      if (dadosCadastro) {
        const dados = JSON.parse(dadosCadastro);
        setProfile(prev => ({
          ...prev,
          nome: dados.nome || '',
          email: dados.email || '',
          telefone: dados.telefone || '',
          data_nascimento: dados.dataNascimento || '',
          sexo: dados.sexo === 'M' ? 'Masculino' : dados.sexo === 'F' ? 'Feminino' : dados.sexo || '',
          peso: dados.peso ? `${dados.peso} kg` : '',
          altura: dados.altura ? `${dados.altura} cm` : ''
        }));
      }

      if (dadosProfissional) {
        const dados = JSON.parse(dadosProfissional);
        setProfile(prev => ({
          ...prev,
          esporte: dados.esporte || '',
          posicao: dados.posicao || '',
          horarios: dados.horarios || prev.horarios
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('dadosProfissionais', JSON.stringify({
        esporte: profile.esporte,
        posicao: profile.posicao,
        horarios: profile.horarios
      }));
      setEditing(false);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const toggleHorario = (periodo: string, horario: string) => {
    setProfile(prev => {
      const horariosAtuais = prev.horarios[periodo] || [];
      const novosHorarios = horariosAtuais.includes(horario)
        ? horariosAtuais.filter(h => h !== horario)
        : [...horariosAtuais, horario];
      
      return {
        ...prev,
        horarios: {
          ...prev.horarios,
          [periodo]: novosHorarios
        }
      };
    });
  };

  const handleDeleteProfile = async () => {
    try {
      // Buscar senha salva
      const userData = await AsyncStorage.getItem('dadosCadastro');
      if (!userData) {
        Alert.alert('Erro', 'Não foi possível encontrar os dados do usuário');
        return;
      }

      const { senha } = JSON.parse(userData);

      // Validar senha
      if (password !== senha) {
        Alert.alert('Erro', 'Senha incorreta');
        return;
      }

      // Excluir todos os dados
      await AsyncStorage.multiRemove([
        'dadosCadastro',
        'dadosProfissionais',
        'userToken',
        'userEmail',
        'userPassword'
      ]);

      // Fechar todos os modais antes de navegar
      setShowDeleteModal(false);
      setEditing(false);

      // Redirecionar para login
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      Alert.alert('Erro', 'Não foi possível excluir o perfil');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Excluir Perfil',
      'Deseja mesmo excluir seu perfil?',
      [
        {
          text: 'Não',
          style: 'cancel',
          onPress: () => setShowDeleteModal(false)
        },
        {
          text: 'Sim',
          onPress: () => setShowDeleteModal(true)
        }
      ]
    );
  };

  const renderDadosPessoais = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Dados Pessoais</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Nome:</Text>
        <TextInput
          style={styles.value}
          value={profile.nome}
          onChangeText={(text) => setProfile(prev => ({ ...prev, nome: text }))}
          editable={editing}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>E-mail:</Text>
        <TextInput
          style={styles.value}
          value={profile.email}
          onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
          editable={editing}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Telefone:</Text>
        <TextInput
          style={styles.value}
          value={profile.telefone}
          onChangeText={(text) => setProfile(prev => ({ ...prev, telefone: text }))}
          editable={editing}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Data de Nascimento:</Text>
        <TextInput
          style={styles.value}
          value={profile.data_nascimento}
          onChangeText={(text) => setProfile(prev => ({ ...prev, data_nascimento: text }))}
          editable={editing}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Sexo:</Text>
        <TextInput
          style={styles.value}
          value={profile.sexo}
          onChangeText={(text) => setProfile(prev => ({ ...prev, sexo: text }))}
          editable={editing}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Peso:</Text>
        <TextInput
          style={styles.value}
          value={profile.peso}
          onChangeText={(text) => setProfile(prev => ({ ...prev, peso: text }))}
          editable={editing}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Altura:</Text>
        <TextInput
          style={styles.value}
          value={profile.altura}
          onChangeText={(text) => setProfile(prev => ({ ...prev, altura: text }))}
          editable={editing}
        />
      </View>
    </View>
  );

  const renderDadosProfissionais = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Dados Profissionais</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Esporte Principal:</Text>
        <TouchableOpacity
          style={[styles.value, !editing && styles.valueDisabled]}
          onPress={() => setShowSportModal(true)}
          disabled={!editing}
        >
          <Text style={styles.valueText}>{profile.esporte}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Posição:</Text>
        <TouchableOpacity
          style={[styles.value, !editing && styles.valueDisabled]}
          onPress={() => setShowPositionModal(true)}
          disabled={!editing}
        >
          <Text style={styles.valueText}>{profile.posicao}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHorarios = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Horários Disponíveis</Text>
      {Object.entries(horariosDisponiveis).map(([periodo, horarios]) => (
        <View key={periodo} style={styles.periodoContainer}>
          <Text style={styles.periodoTitulo}>{periodo.toUpperCase()}</Text>
          <View style={styles.horariosContainer}>
            {horarios.map((horario) => (
              <TouchableOpacity
                key={horario}
                style={[
                  styles.horarioItem,
                  profile.horarios[periodo]?.includes(horario) && styles.horarioSelecionado
                ]}
                onPress={() => editing && toggleHorario(periodo, horario)}
              >
                <Text style={[
                  styles.horarioTexto,
                  profile.horarios[periodo]?.includes(horario) && styles.horarioTextoSelecionado
                ]}>
                  {horario}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  // Limpar estados quando a tela perder o foco
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setEditing(false);
        setShowSportModal(false);
        setShowPositionModal(false);
        setShowDeleteModal(false);
        setPassword('');
      };
    }, [])
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? "close" : "create"} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          bounces={false}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
        >
          {renderDadosPessoais()}
          {renderDadosProfissionais()}
          {renderHorarios()}

          {editing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.buttonText}>Excluir Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Modal de Exclusão */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
              <Text style={styles.modalText}>Digite sua senha para confirmar a exclusão:</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Senha"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setPassword('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleDeleteProfile}
                >
                  <Text style={styles.modalButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showSportModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione o Esporte Principal</Text>
              <ScrollView style={styles.modalScroll}>
                {Object.keys(esportesComPosicoes).map(esporte => (
                  <TouchableOpacity
                    key={esporte}
                    style={styles.modalItem}
                    onPress={() => {
                      setProfile(prev => ({ ...prev, esporte }));
                      setShowSportModal(false);
                      setShowPositionModal(true);
                    }}
                  >
                    <Text style={styles.modalItemText}>{esporte}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowSportModal(false)}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showPositionModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione a Posição</Text>
              <ScrollView style={styles.modalScroll}>
                {esportesComPosicoes[profile.esporte]?.map(posicao => (
                  <TouchableOpacity
                    key={posicao}
                    style={styles.modalItem}
                    onPress={() => {
                      setProfile(prev => ({ ...prev, posicao }));
                      setShowPositionModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{posicao}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowPositionModal(false)}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#4A90E2',
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  field: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  valueDisabled: {
    backgroundColor: '#F5F5F5',
  },
  valueText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  periodoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodoTitulo: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  horariosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  horarioItem: {
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  horarioSelecionado: {
    backgroundColor: '#4A90E2',
  },
  horarioTexto: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  horarioTextoSelecionado: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 25,
    width: 150,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#00F5FF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalScroll: {
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    color: '#1A1A1A',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 15,
    textAlign: 'center',
  },
  passwordInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    padding: 15,
    borderRadius: 25,
    width: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  modalButton: {
    backgroundColor: '#00F5FF',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});