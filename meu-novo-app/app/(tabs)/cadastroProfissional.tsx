import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedView } from '@/components/AnimatedView';

const CadastroProfissional = () => {
  const router = useRouter();
  const [esporteSelecionado, setEsporteSelecionado] = useState(false);
  const [objetivoSelecionado, setObjetivoSelecionado] = useState(false);
  const [periodosSelecionados, setPeriodosSelecionados] = useState([]);
  const [openEsporte, setOpenEsporte] = useState(false);
  const [esporte, setEsporte] = useState(null);
  const [openPosicao, setOpenPosicao] = useState(false);
  const [posicao, setPosicao] = useState(null);
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [periodosExpandidos, setPeriodosExpandidos] = useState({});
  const [horariosSelecionados, setHorariosSelecionados] = useState({});

  const handleSalvar = () => {
    // Implemente a lógica para salvar o cadastro
  };

  const togglePeriodo = (key) => {
    setPeriodosExpandidos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleHorario = (horario) => {
    setHorariosSelecionados(prev => ({
      ...prev,
      [horario]: !prev[horario]
    }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.gradient}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedView delay={0}>
              <View style={styles.card}>
                <AnimatedView delay={100}>
                  <Text style={styles.title}>Cadastro Profissional</Text>
                </AnimatedView>

                <AnimatedView delay={200}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Qual esporte você pratica?</Text>
                    <DropDownPicker
                      open={openEsporte}
                      value={esporte}
                      items={ESPORTES.map(esporte => ({ label: esporte, value: esporte }))}
                      setOpen={setOpenEsporte}
                      setValue={setEsporte}
                      placeholder="Selecione o esporte"
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                      zIndex={3000}
                      zIndexInverse={1000}
                      listMode="MODAL"
                      searchable={true}
                      searchPlaceholder="Buscar esporte..."
                      searchTextInputStyle={styles.searchInput}
                    />
                  </View>
                </AnimatedView>

                {esporte && (
                  <AnimatedView delay={300}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Qual posição você joga?</Text>
                      <DropDownPicker
                        open={openPosicao}
                        value={posicao}
                        items={POSICOES[esporte as keyof typeof POSICOES].map(posicao => ({ label: posicao, value: posicao }))}
                        setOpen={setOpenPosicao}
                        setValue={setPosicao}
                        placeholder="Selecione a posição"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        zIndex={2000}
                        zIndexInverse={2000}
                        listMode="MODAL"
                      />
                    </View>
                  </AnimatedView>
                )}

                <AnimatedView delay={400}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Quantos anos de experiência você tem?</Text>
                    <TextInput
                      style={styles.input}
                      value={anosExperiencia}
                      onChangeText={setAnosExperiencia}
                      placeholder="Digite o número de anos"
                      keyboardType="numeric"
                    />
                  </View>
                </AnimatedView>

                <AnimatedView delay={500}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Horários Disponíveis</Text>
                    <View style={styles.periodosContainer}>
                      {Object.entries(PERIODOS).map(([key, periodo]) => (
                        <AnimatedView key={key} delay={600 + parseInt(key) * 100}>
                          <View style={styles.periodoContainer}>
                            <TouchableOpacity
                              style={[
                                styles.periodoButton,
                                periodosExpandidos[key] && styles.periodoButtonExpanded
                              ]}
                              onPress={() => togglePeriodo(key)}
                            >
                              <Text style={styles.periodoText}>{periodo.nome}</Text>
                              <Ionicons
                                name={periodosExpandidos[key] ? 'chevron-down' : 'chevron-forward'}
                                size={20}
                                color="#4A4A4A"
                              />
                            </TouchableOpacity>
                            
                            {periodosExpandidos[key] && (
                              <View style={styles.horariosContainer}>
                                {periodo.horarios.map(horario => (
                                  <AnimatedView key={horario} delay={700 + parseInt(key) * 100}>
                                    <TouchableOpacity
                                      style={[
                                        styles.horarioButton,
                                        horariosSelecionados[horario] && styles.horarioButtonSelected
                                      ]}
                                      onPress={() => toggleHorario(horario)}
                                    >
                                      <Text style={[
                                        styles.horarioText,
                                        horariosSelecionados[horario] && styles.horarioTextSelected
                                      ]}>
                                        {horario}
                                      </Text>
                                    </TouchableOpacity>
                                  </AnimatedView>
                                ))}
                              </View>
                            )}
                          </View>
                        </AnimatedView>
                      ))}
                    </View>
                  </View>
                </AnimatedView>

                <AnimatedView delay={1000}>
                  <TouchableOpacity 
                    style={[
                      styles.button,
                      (!esporte || !posicao || !anosExperiencia || Object.keys(horariosSelecionados).length === 0) && styles.buttonDisabled
                    ]} 
                    onPress={handleSalvar}
                    disabled={!esporte || !posicao || !anosExperiencia || Object.keys(horariosSelecionados).length === 0}
                  >
                    <Text style={styles.buttonText}>Salvar</Text>
                  </TouchableOpacity>
                </AnimatedView>

                <AnimatedView delay={1100}>
                  <TouchableOpacity 
                    style={[styles.button, styles.testButton]} 
                    onPress={() => router.push('/perfil')}
                  >
                    <Text style={styles.buttonText}>Avançar (Teste)</Text>
                  </TouchableOpacity>
                </AnimatedView>
              </View>
            </AnimatedView>
          </ScrollView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
  },
  dropdownContainer: {
    maxHeight: 200,
  },
  searchInput: {
    padding: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  periodosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  periodoContainer: {
    marginRight: 10,
    marginBottom: 10,
  },
  periodoButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  periodoButtonExpanded: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  periodoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  horariosContainer: {
    marginTop: 10,
  },
  horarioButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  horarioButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  horarioText: {
    fontSize: 18,
  },
  horarioTextSelected: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#6B7280',
  },
});

export default CadastroProfissional; 