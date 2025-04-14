import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';

export default function PerfilEsporteScreen() {
  const router = useRouter();
  const [openEsporte, setOpenEsporte] = useState(false);
  const [openPosicao, setOpenPosicao] = useState(false);
  const [esporte, setEsporte] = useState(null);
  const [posicao, setPosicao] = useState(null);
  const [descricao, setDescricao] = useState('');

  const esportes = [
    { label: 'Futebol', value: 'futebol' },
    { label: 'Vôlei', value: 'volei' },
    { label: 'Basquete', value: 'basquete' },
    { label: 'Jiu-Jitsu', value: 'jiujitsu' },
    { label: 'Capoeira', value: 'capoeira' },
    { label: 'Boxe', value: 'boxe' },
    { label: 'Natação', value: 'natacao' },
    { label: 'Tênis', value: 'tenis' },
    { label: 'Handebol', value: 'handebol' },
    { label: 'Atletismo', value: 'atletismo' },
  ];

  const posicoes = {
    futebol: [
      { label: 'Goleiro', value: 'goleiro' },
      { label: 'Zagueiro', value: 'zagueiro' },
      { label: 'Meio-campo', value: 'meio' },
      { label: 'Atacante', value: 'atacante' },
    ],
    volei: [
      { label: 'Levantador', value: 'levantador' },
      { label: 'Líbero', value: 'libero' },
      { label: 'Oposto', value: 'oposto' },
      { label: 'Central', value: 'central' },
    ],
    basquete: [
      { label: 'Armador', value: 'armador' },
      { label: 'Ala', value: 'ala' },
      { label: 'Pivô', value: 'pivo' },
    ],
    jiujitsu: [
      { label: 'Faixa Branca', value: 'branca' },
      { label: 'Faixa Azul', value: 'azul' },
      { label: 'Faixa Roxa', value: 'roxa' },
      { label: 'Faixa Marrom', value: 'marrom' },
      { label: 'Faixa Preta', value: 'preta' },
    ],
    capoeira: [
      { label: 'Corda Branca', value: 'corda_branca' },
      { label: 'Corda Azul', value: 'corda_azul' },
      { label: 'Corda Verde', value: 'corda_verde' },
      { label: 'Corda Roxa', value: 'corda_roxa' },
    ],
    boxe: [
      { label: 'Leve', value: 'leve' },
      { label: 'Médio', value: 'medio' },
      { label: 'Pesado', value: 'pesado' },
    ],
    natacao: [
      { label: 'Velocista', value: 'velocista' },
      { label: 'Fundista', value: 'fundista' },
    ],
    tenis: [
      { label: 'Simples', value: 'simples' },
      { label: 'Duplas', value: 'duplas' },
    ],
    handebol: [
      { label: 'Goleiro', value: 'goleiro' },
      { label: 'Pivô', value: 'pivo' },
      { label: 'Armador', value: 'armador' },
      { label: 'Ala', value: 'ala' },
    ],
    atletismo: [
      { label: 'Corredor', value: 'corredor' },
      { label: 'Saltador', value: 'saltador' },
      { label: 'Lançador', value: 'lancador' },
    ],
  };

  const getPosicoesParaEsporte = (esporteSelecionado) => {
    return posicoes[esporteSelecionado] || [];
  };

  const handleSalvar = () => {
    if (!esporte) {
      Alert.alert('Erro', 'Por favor, selecione um esporte.');
      return;
    }

    if (!posicao) {
      Alert.alert('Erro', 'Por favor, selecione sua posição/faixa/categoria.');
      return;
    }

    if (!descricao.trim()) {
      Alert.alert('Erro', 'Por favor, adicione uma descrição sobre você.');
      return;
    }

    // Aqui você pode salvar os dados no AsyncStorage ou em um banco de dados
    Alert.alert('Sucesso', 'Perfil esportivo salvo com sucesso!');
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Escolha seu Esporte</Text>

        {/* Escolher Esporte */}
        <Text style={styles.label}>Seu Esporte</Text>
        <DropDownPicker
          items={esportes}
          placeholder="Selecione seu esporte"
          open={openEsporte}
          setOpen={setOpenEsporte}
          value={esporte}
          setValue={setEsporte}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          onOpen={() => setOpenPosicao(false)}
          zIndex={3000}
          zIndexInverse={1000}
          listMode="MODAL"
        />

        {/* Escolher Posição */}
        {esporte && (
          <>
            <Text style={styles.label}>
              {esporte === 'jiujitsu'
                ? 'Sua Faixa'
                : esporte === 'capoeira'
                ? 'Sua Corda'
                : esporte === 'boxe'
                ? 'Sua Categoria'
                : 'Sua Posição'}
            </Text>

            <DropDownPicker
              items={getPosicoesParaEsporte(esporte)}
              placeholder="Selecione sua posição"
              open={openPosicao}
              setOpen={setOpenPosicao}
              value={posicao}
              setValue={setPosicao}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              onOpen={() => setOpenEsporte(false)}
              zIndex={2000}
              zIndexInverse={2000}
              listMode="MODAL"
            />
          </>
        )}

        {/* Descrição */}
        <Text style={styles.label}>Descrição Pessoal</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Fale um pouco sobre você..."
          value={descricao}
          onChangeText={setDescricao}
          multiline
          textAlignVertical="top"
        />

        {/* Botão */}
        <TouchableOpacity style={styles.button} onPress={handleSalvar}>
          <Text style={styles.buttonText}>Salvar Perfil</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 5,
  },
  dropdown: {
    width: '100%',
    marginBottom: 10,
    borderColor: '#A0C4FF',
    backgroundColor: '#F5F5F5',
    zIndex: 1,
  },
  dropdownContainer: {
    borderColor: '#A0C4FF',
    backgroundColor: '#F5F5F5',
    zIndex: 2,
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
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 