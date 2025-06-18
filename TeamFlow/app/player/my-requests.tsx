import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Config';
import NavigationBar from '../../components/NavigationBar';

interface Clube {
  id: number;
  nome: string;
  tecnico_id: number;
  procurando_jogadores: boolean;
}

interface MinhasSolicitacoes {
  id: number;
  jogador_id: number;
  clube_id: number;
  status: string;
  data_solicitacao: string;
  data_resposta: string | null;
  observacao: string | null;
  clube: Clube;
}

export default function MyRequests() {
  const router = useRouter();
  const [solicitacoes, setSolicitacoes] = useState<MinhasSolicitacoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClube, setSelectedClube] = useState<Clube | null>(null);
  const [observacao, setObservacao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);

  const fetchMinhasSolicitacoes = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const clubeId = await AsyncStorage.getItem('clube_id');

      if (!userId) {
        console.error('User ID não encontrado');
        return;
      }

      // Verificar se o jogador tem time
      setHasTeam(!!clubeId);

      const response = await fetch(
        `${API_URL}/solicitacoes-acesso/minhas-solicitacoes?user_id=${userId}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSolicitacoes(data);
      } else {
        console.error('Erro ao buscar solicitações');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMinhasSolicitacoes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMinhasSolicitacoes();
  };

  const handleReenviarSolicitacao = async () => {
    if (!selectedClube || !observacao.trim()) {
      Alert.alert('Erro', 'Por favor, adicione uma mensagem para sua solicitação');
      return;
    }

    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');

      if (!userId) {
        Alert.alert('Erro', 'Usuário não identificado');
        return;
      }

      const response = await fetch(
        `${API_URL}/solicitacoes-acesso/?user_id=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            clube_id: selectedClube.id,
            observacao: observacao.trim(),
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          'Sucesso!',
          'Nova solicitação enviada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                setObservacao('');
                setSelectedClube(null);
                fetchMinhasSolicitacoes(); // Recarregar lista
              },
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.detail || 'Não foi possível enviar a solicitação');
      }
    } catch (error) {
      console.error('Erro ao reenviar solicitação:', error);
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  const abrirModalReenvio = (clube: Clube) => {
    setSelectedClube(clube);
    setObservacao('');
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return '#ff9800';
      case 'aprovado':
        return '#4CAF50';
      case 'rejeitado':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Aguardando Resposta';
      case 'aprovado':
        return 'Aprovado - Você faz parte do time!';
      case 'rejeitado':
        return 'Não aprovado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'time-outline';
      case 'aprovado':
        return 'checkmark-circle';
      case 'rejeitado':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderSolicitacao = (solicitacao: MinhasSolicitacoes) => (
    <View key={solicitacao.id} style={styles.solicitacaoCard}>
      <View style={styles.clubeHeader}>
        <View style={styles.clubeInfo}>
          <Ionicons name="shield" size={24} color="#1a41aa" />
          <View style={styles.clubeTexto}>
            <Text style={styles.clubeNome}>{solicitacao.clube?.nome || 'Clube não encontrado'}</Text>
            <Text style={styles.dataText}>
              Solicitado em: {formatDate(solicitacao.data_solicitacao)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Ionicons 
          name={getStatusIcon(solicitacao.status) as any} 
          size={20} 
          color={getStatusColor(solicitacao.status)} 
        />
        <Text style={[styles.statusText, { color: getStatusColor(solicitacao.status) }]}>
          {getStatusText(solicitacao.status)}
        </Text>
      </View>

      {solicitacao.data_resposta && (
        <View style={styles.respostaInfo}>
          <Text style={styles.respostaData}>
            Respondido em: {formatDate(solicitacao.data_resposta)}
          </Text>
        </View>
      )}

      {solicitacao.observacao && (
        <View style={styles.observacaoContainer}>
          <Text style={styles.observacaoLabel}>
            {solicitacao.status === 'pendente' ? 'Sua mensagem:' : 'Resposta do técnico:'}
          </Text>
          <Text style={styles.observacaoTexto}>{solicitacao.observacao}</Text>
        </View>
      )}

      {solicitacao.status === 'aprovado' && (
        <View style={styles.successContainer}>
          <Ionicons name="trophy" size={20} color="#4CAF50" />
          <Text style={styles.successText}>
            Parabéns! Você agora faz parte do {solicitacao.clube?.nome}
          </Text>
        </View>
      )}

      {solicitacao.status === 'rejeitado' && solicitacao.clube && (
        <View style={styles.rejectedActions}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => abrirModalReenvio(solicitacao.clube)}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {hasTeam === false ? 'Solicitações de Times' : 'Minhas Solicitações'}
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a41aa" />
          <Text style={styles.loadingText}>Carregando suas solicitações...</Text>
        </View>
        
        <NavigationBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Solicitações</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {solicitacoes.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {solicitacoes.filter(s => s.status === 'pendente').length}
                </Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {solicitacoes.filter(s => s.status === 'aprovado').length}
                </Text>
                <Text style={styles.statLabel}>Aprovadas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {solicitacoes.filter(s => s.status === 'rejeitado').length}
                </Text>
                <Text style={styles.statLabel}>Rejeitadas</Text>
              </View>
            </View>

            {hasTeam === false && solicitacoes.filter(s => s.status === 'rejeitado').length > 0 && (
              <>
                <View style={styles.rejectedSection}>
                  <View style={styles.rejectedHeader}>
                    <Ionicons name="refresh-circle" size={24} color="#ff9800" />
                    <Text style={styles.rejectedTitle}>Solicitações para Tentar Novamente</Text>
                  </View>
                  <Text style={styles.rejectedSubtext}>
                    Essas solicitações foram rejeitadas, mas você pode tentar novamente!
                  </Text>
                </View>
                
                {solicitacoes
                  .filter(s => s.status === 'rejeitado')
                  .sort((a, b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime())
                  .map(renderSolicitacao)}
              </>
            )}
            
            <Text style={styles.sectionTitle}>
              {hasTeam === false ? 'Todas as Solicitações' : 'Histórico de Solicitações'}
            </Text>
            {solicitacoes
              .sort((a, b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime())
              .map(renderSolicitacao)}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {hasTeam === false ? 'Você ainda não tem solicitações' : 'Nenhuma solicitação encontrada'}
            </Text>
            <Text style={styles.emptySubText}>
              {hasTeam === false 
                ? 'Procure times que estão aceitando jogadores e envie sua solicitação!'
                : 'Quando você solicitar entrada em times, elas aparecerão aqui'
              }
            </Text>
            <TouchableOpacity
              style={styles.findTeamsButton}
              onPress={() => router.push('/player/find-teams')}
            >
              <Text style={styles.findTeamsButtonText}>
                {hasTeam === false ? 'Encontrar Times' : 'Procurar Times'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Solicitar Novamente
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.clubeInfo}>
                <Ionicons name="shield" size={20} color="#1a41aa" />
                <Text style={styles.clubeNomeModal}>
                  {selectedClube?.nome}
                </Text>
              </View>

              <Text style={styles.modalLabel}>
                Escreva uma mensagem para sua nova solicitação:
              </Text>
              
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ex: Olá! Gostaria muito de fazer parte do time..."
                value={observacao}
                onChangeText={setObservacao}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />

              <Text style={styles.characterCount}>
                {observacao.length}/500
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitButton, submitting && styles.modalSubmitButtonDisabled]}
                  onPress={handleReenviarSolicitacao}
                  disabled={submitting || !observacao.trim()}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color="#fff" />
                      <Text style={styles.modalSubmitText}>Enviar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <NavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a41aa',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a41aa',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  solicitacaoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clubeHeader: {
    marginBottom: 15,
  },
  clubeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubeTexto: {
    marginLeft: 12,
    flex: 1,
  },
  clubeNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dataText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  respostaInfo: {
    marginBottom: 12,
  },
  respostaData: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  observacaoContainer: {
    padding: 12,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1a41aa',
    marginBottom: 12,
  },
  observacaoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  observacaoTexto: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  findTeamsButton: {
    backgroundColor: '#1a41aa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findTeamsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectedActions: {
    marginTop: 12,
    alignItems: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a41aa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  clubeNomeModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSubmitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a41aa',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectedSection: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  rejectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rejectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginLeft: 8,
  },
  rejectedSubtext: {
    fontSize: 14,
    color: '#ef6c00',
    lineHeight: 20,
  },
}); 