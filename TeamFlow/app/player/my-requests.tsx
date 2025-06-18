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

  const fetchMinhasSolicitacoes = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');

      if (!userId) {
        console.error('User ID não encontrado');
        return;
      }

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
          <Text style={styles.headerTitle}>Minhas Solicitações</Text>
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
            
            <Text style={styles.sectionTitle}>Histórico de Solicitações</Text>
            {solicitacoes
              .sort((a, b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime())
              .map(renderSolicitacao)}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma solicitação encontrada</Text>
            <Text style={styles.emptySubText}>
              Quando você solicitar entrada em times, elas aparecerão aqui
            </Text>
            <TouchableOpacity
              style={styles.findTeamsButton}
              onPress={() => router.push('/player/find-teams')}
            >
              <Text style={styles.findTeamsButtonText}>Procurar Times</Text>
            </TouchableOpacity>
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
}); 