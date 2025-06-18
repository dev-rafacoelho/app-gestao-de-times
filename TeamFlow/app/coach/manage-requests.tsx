import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Config';
import NavigationBar from '../../components/NavigationBar';

interface Jogador {
  id: number;
  nome: string;
  email: string;
}

interface Clube {
  id: number;
  nome: string;
  tecnico_id: number;
  procurando_jogadores: boolean;
}

interface Solicitacao {
  id: number;
  jogador_id: number;
  clube_id: number;
  status: string;
  data_solicitacao: string;
  data_resposta: string | null;
  observacao: string | null;
  jogador: Jogador;
  clube: Clube;
}

export default function ManageRequests() {
  const router = useRouter();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchSolicitacoes = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const clubeId = await AsyncStorage.getItem('clube_id');

      if (!userId || !clubeId) {
        Alert.alert('Erro', 'Dados do usuário não encontrados');
        return;
      }

      const response = await fetch(
        `${API_URL}/solicitacoes-acesso/clube/${clubeId}?user_id=${userId}`,
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
        const errorData = await response.json();
        console.error('Erro ao buscar solicitações:', errorData);
        Alert.alert('Erro', 'Não foi possível carregar as solicitações');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitacoes();
  };

  const handleResponse = async (solicitacaoId: number, status: 'aprovado' | 'rejeitado', observacao?: string) => {
    try {
      setProcessingId(solicitacaoId);
      const userId = await AsyncStorage.getItem('user_id');

      if (!userId) {
        Alert.alert('Erro', 'Usuário não identificado');
        return;
      }

      const response = await fetch(
        `${API_URL}/solicitacoes-acesso/${solicitacaoId}?user_id=${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            status,
            observacao: observacao || (status === 'aprovado' ? 'Bem-vindo ao time!' : 'Não foi possível aceitar no momento'),
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          'Sucesso!',
          status === 'aprovado' 
            ? 'Jogador aprovado e adicionado ao time!' 
            : 'Solicitação rejeitada'
        );
        fetchSolicitacoes(); // Recarregar lista
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.detail || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro ao responder solicitação:', error);
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setProcessingId(null);
    }
  };

  const confirmAction = (solicitacao: Solicitacao, action: 'aprovado' | 'rejeitado') => {
    const actionText = action === 'aprovado' ? 'aprovar' : 'rejeitar';
    
    Alert.alert(
      `Confirmar ${actionText}`,
      `Deseja ${actionText} a solicitação de ${solicitacao.jogador.nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: action === 'aprovado' ? 'Aprovar' : 'Rejeitar',
          style: action === 'aprovado' ? 'default' : 'destructive',
          onPress: () => handleResponse(solicitacao.id, action),
        },
      ]
    );
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
        return 'Pendente';
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const renderSolicitacao = (solicitacao: Solicitacao) => (
    <View key={solicitacao.id} style={styles.solicitacaoCard}>
      <View style={styles.solicitacaoHeader}>
        <View style={styles.jogadorInfo}>
          <Ionicons name="person" size={24} color="#1a41aa" />
          <View style={styles.jogadorTexto}>
            <Text style={styles.jogadorNome}>{solicitacao.jogador.nome}</Text>
            <Text style={styles.jogadorEmail}>{solicitacao.jogador.email}</Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(solicitacao.status) }]}>
          <Text style={styles.statusText}>{getStatusText(solicitacao.status)}</Text>
        </View>
      </View>

      <View style={styles.solicitacaoDetalhes}>
        <View style={styles.detalheRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detalheText}>
            Solicitado em: {formatDate(solicitacao.data_solicitacao)}
          </Text>
        </View>
        
        {solicitacao.data_resposta && (
          <View style={styles.detalheRow}>
            <Ionicons name="checkmark-circle" size={16} color="#666" />
            <Text style={styles.detalheText}>
              Respondido em: {formatDate(solicitacao.data_resposta)}
            </Text>
          </View>
        )}
        
        {solicitacao.observacao && (
          <View style={styles.observacaoContainer}>
            <Text style={styles.observacaoLabel}>Observação:</Text>
            <Text style={styles.observacaoTexto}>{solicitacao.observacao}</Text>
          </View>
        )}
      </View>

      {solicitacao.status === 'pendente' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => confirmAction(solicitacao, 'rejeitado')}
            disabled={processingId === solicitacao.id}
          >
            {processingId === solicitacao.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="close" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Rejeitar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => confirmAction(solicitacao, 'aprovado')}
            disabled={processingId === solicitacao.id}
          >
            {processingId === solicitacao.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Aprovar</Text>
              </>
            )}
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
          <Text style={styles.headerTitle}>Solicitações de Acesso</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a41aa" />
          <Text style={styles.loadingText}>Carregando solicitações...</Text>
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
        <Text style={styles.headerTitle}>Solicitações de Acesso</Text>
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
            
            {solicitacoes.map(renderSolicitacao)}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma solicitação encontrada</Text>
            <Text style={styles.emptySubText}>
              Quando jogadores solicitarem entrada no seu time, elas aparecerão aqui
            </Text>
          </View>
        )}
      </ScrollView>

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
    marginBottom: 15,
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
  solicitacaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  jogadorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jogadorTexto: {
    marginLeft: 12,
    flex: 1,
  },
  jogadorNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  jogadorEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  solicitacaoDetalhes: {
    marginBottom: 15,
  },
  detalheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detalheText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  observacaoContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1a41aa',
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  },
}); 