import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DateTimePickerEvent {
  type: string;
  nativeEvent: {
    timestamp: number;
  };
}

export default function EditarPerfil() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('email@example.com');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date>(new Date());
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [lateralidade, setLateralidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [esporte, setEsporte] = useState('');
  const [posicao, setPosicao] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEsporteList, setShowEsporteList] = useState(false);

  const listaEsportes = [
    { label: 'Futebol', value: 'futebol' },
    { label: 'Vôlei', value: 'volei' },
    { label: 'Basquete', value: 'basquete' },
    { label: 'Natação', value: 'natacao' },
    { label: 'Tênis', value: 'tenis' },
    { label: 'Handebol', value: 'handebol' },
    { label: 'Atletismo', value: 'atletismo' },
    { label: 'Surfe', value: 'surfe' },
    { label: 'Jiu-jitsu', value: 'jiujitsu' },
    { label: 'Capoeira', value: 'capoeira' },
    { label: 'Futsal', value: 'futsal' },
    { label: 'Ginástica', value: 'ginastica' },
    { label: 'Ciclismo', value: 'ciclismo' },
    { label: 'Boxe', value: 'boxe' },
    { label: 'Rugby', value: 'rugby' },
  ];

  const posicoesPorEsporte: Record<string, { label: string; value: string }[]> = {
    futebol: [
      { label: 'Goleiro', value: 'goleiro' },
      { label: 'Zagueiro', value: 'zagueiro' },
      { label: 'Meio-campo', value: 'meio' },
      { label: 'Atacante', value: 'atacante' },
      { label: 'Lateral', value: 'lateral' },
    ],
    jiujitsu: [
      { label: 'Faixa Branca', value: 'faixa-branca' },
      { label: 'Faixa Azul', value: 'faixa-azul' },
      { label: 'Faixa Roxa', value: 'faixa-roxa' },
      { label: 'Faixa Marrom', value: 'faixa-marrom' },
      { label: 'Faixa Preta', value: 'faixa-preta' },
    ],
    capoeira: [
      { label: 'Corda Branca', value: 'corda-branca' },
      { label: 'Corda Amarela', value: 'corda-amarela' },
      { label: 'Corda Azul', value: 'corda-azul' },
      { label: 'Corda Verde', value: 'corda-verde' },
    ],
    boxe: [
      { label: 'Peso Leve', value: 'peso-leve' },
      { label: 'Peso Médio', value: 'peso-medio' },
      { label: 'Peso Pesado', value: 'peso-pesado' },
    ],
    // Pode adicionar mais esportes aqui se quiser
  };

  const escolherImagem = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0].uri);
    }
  };

  const salvarPerfil = async () => {
    if (!nome || !telefone || !altura || !peso || !lateralidade || !esporte || !posicao || !descricao || !dataNascimento) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const perfilParaSalvar = {
      nome,
      email,
      telefone,
      altura,
      peso,
      lateralidade,
      esporte,
      posicao,
      descricao,
      dataNascimento: dataNascimento.toLocaleDateString(),
      imagem,
    };

    try {
      await AsyncStorage.setItem('perfil', JSON.stringify(perfilParaSalvar));
      Alert.alert('Sucesso!', 'Perfil salvo com sucesso!');
      router.push('/perfil');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || dataNascimento;
    setShowDatePicker(false);
    setDataNascimento(currentDate);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Foto de Perfil */}
        <TouchableOpacity onPress={escolherImagem}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>Adicionar Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nome */}
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
        />

        {/* Email (Travado) */}
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#eee' }]}
          value={email}
          editable={false}
        />

        {/* Telefone */}
        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          placeholder="(XX) XXXXX-XXXX"
          placeholderTextColor="#999"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        {/* Data de Nascimento */}
        <Text style={styles.label}>Data de Nascimento</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: dataNascimento ? '#000' : '#999' }}>
            {dataNascimento ? dataNascimento.toLocaleDateString() : 'Selecione sua data'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dataNascimento || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            onChange={onChangeDate}
          />
        )}

        {/* Altura */}
        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 180"
          placeholderTextColor="#999"
          value={altura}
          onChangeText={setAltura}
          keyboardType="numeric"
        />

        {/* Peso */}
        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 75"
          placeholderTextColor="#999"
          value={peso}
          onChangeText={setPeso}
          keyboardType="numeric"
        />

        {/* Lateralidade */}
        <Text style={styles.label}>Lateralidade</Text>
        <TextInput
          style={styles.input}
          placeholder="Destro, Canhoto ou Ambos"
          placeholderTextColor="#999"
          value={lateralidade}
          onChangeText={setLateralidade}
        />

        {/* Esporte */}
        <Text style={styles.label}>Esporte</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowEsporteList(!showEsporteList)}
        >
          <Text style={{ color: esporte ? '#000' : '#999' }}>
            {esporte || 'Selecione um esporte'}
          </Text>
        </TouchableOpacity>

        {showEsporteList && (
          <View style={styles.esporteList}>
            {listaEsportes.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.esporteItem}
                onPress={() => {
                  setEsporte(item.value);
                  setShowEsporteList(false);
                }}
              >
                <Text style={styles.esporteItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Posição */}
        <Text style={styles.label}>Posição / Faixa / Categoria</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Goleiro, Faixa Preta, Peso Leve..."
          placeholderTextColor="#999"
          value={posicao}
          onChangeText={setPosicao}
        />

        {/* Descrição */}
        <Text style={styles.label}>Descrição Pessoal</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Fale um pouco sobre você..."
          placeholderTextColor="#999"
          multiline
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.button} onPress={salvarPerfil}>
          <Text style={styles.buttonText}>Salvar Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#D6E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#0066FF',
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePlaceholderText: {
    color: '#666',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#A0C4FF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#0066FF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  esporteList: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A0C4FF',
    borderRadius: 10,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  esporteItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  esporteItemText: {
    fontSize: 16,
  },
});
