import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, Animated, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PasswordField } from '@/components/PasswordField';
import { AnimatedView } from '@/components/AnimatedView';

const PERIODOS = {
  MANHA: {
    nome: 'Manhã',
    horarios: ['7h', '8h', '9h', '10h', '11h']
  },
  TARDE: {
    nome: 'Tarde',
    horarios: ['13h', '14h', '15h', '16h', '17h']
  },
  NOITE: {
    nome: 'Noite',
    horarios: ['18h', '19h', '20h', '21h', '22h']
  }
};

const { width, height } = Dimensions.get('window');

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [emailValido, setEmailValido] = useState<boolean | null>(null);
  const [telefoneValido, setTelefoneValido] = useState<boolean | null>(null);
  const [senhaForca, setSenhaForca] = useState<number>(0);
  const [senhasCoincidem, setSenhasCoincidem] = useState<boolean | null>(null);
  const [dicasSenha, setDicasSenha] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cpf, setCpf] = useState('');
  const [isCpfValid, setIsCpfValid] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const validarEmail = async (email: string) => {
    const dominiosValidos = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dominio = email.split('@')[1];
    const valido = regex.test(email) && dominiosValidos.includes(dominio);

    // Verificar se o email já existe
    if (valido) {
      try {
        const usuarios = await AsyncStorage.getItem('usuarios');
        if (usuarios) {
          const listaUsuarios = JSON.parse(usuarios);
          const emailDuplicado = listaUsuarios.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (emailDuplicado) {
            setEmailValido(false);
            return false;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar email:', error);
      }
    }

    setEmailValido(valido);
    return valido;
  };

  const formatarTelefone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    const valido = cleaned.length === 11;
    setTelefoneValido(valido);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return text;
  };

  const formatarDataNascimento = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 8) {
      cleaned = cleaned.slice(0, 8);
    }
    if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4) + '/' + cleaned.slice(4);
    }
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const calcularForcaSenha = (senha: string) => {
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;
    return forca;
  };

  const getStrengthBars = () => {
    return calcularForcaSenha(senha);
  };

  const getStrengthColor = () => {
    const forca = calcularForcaSenha(senha);
    switch (forca) {
      case 0:
      case 1:
        return '#EF4444'; // Vermelho
      case 2:
        return '#F59E0B'; // Amarelo
      case 3:
        return '#3B82F6'; // Azul
      case 4:
        return '#10B981'; // Verde
      default:
        return '#E5E7EB'; // Cinza
    }
  };

  const getStrengthText = () => {
    const forca = calcularForcaSenha(senha);
    switch (forca) {
      case 0:
      case 1:
        return 'Muito Fraca';
      case 2:
        return 'Fraca';
      case 3:
        return 'Média';
      case 4:
        return 'Forte';
      default:
        return '';
    }
  };

  const formatarCPF = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }
    if (cleaned.length > 9) {
      cleaned = cleaned.slice(0, 9) + '-' + cleaned.slice(9);
    }
    if (cleaned.length > 6) {
      cleaned = cleaned.slice(0, 6) + '.' + cleaned.slice(6);
    }
    if (cleaned.length > 3) {
      cleaned = cleaned.slice(0, 3) + '.' + cleaned.slice(3);
    }
    return cleaned;
  };

  const handleCpfChange = async (text: string) => {
    const formatted = formatarCPF(text);
    setCpf(formatted);
    
    // Verificar se o CPF já existe
    if (formatted.length === 14) {
      try {
        const usuarios = await AsyncStorage.getItem('usuarios');
        if (usuarios) {
          const listaUsuarios = JSON.parse(usuarios);
          const cpfDuplicado = listaUsuarios.some((u: any) => u.cpf === formatted);
          setIsCpfValid(!cpfDuplicado);
        } else {
          setIsCpfValid(true);
        }
      } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        setIsCpfValid(true);
      }
    } else {
      setIsCpfValid(false);
    }
  };

  const handleSubmit = async () => {
    if (await validarFormulario()) {
      try {
        const dadosCadastro = {
          nome,
          email,
          telefone,
          dataNascimento: formatarDataNascimento(dataNascimento),
          peso,
          altura,
          sexo,
          cpf,
          senha
        };

        // Salvar dados do usuário
        const usuarios = await AsyncStorage.getItem('usuarios');
        const listaUsuarios = usuarios ? JSON.parse(usuarios) : [];
        listaUsuarios.push(dadosCadastro);
        await AsyncStorage.setItem('usuarios', JSON.stringify(listaUsuarios));

        // Salvar dados do cadastro atual
        await AsyncStorage.setItem('dadosCadastro', JSON.stringify(dadosCadastro));

        // Limpar a pilha de navegação e redirecionar para o cadastro profissional
        router.replace('/cadastroProfissional');
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
        Alert.alert('Erro', 'Não foi possível salvar os dados');
      }
    } else {
      // Mostrar erros no formulário
      Object.entries(errors).forEach(([field, message]) => {
        Alert.alert('Atenção', message);
      });
    }
  };

  const handleTelefoneChange = (text: string) => {
    const formatted = formatarTelefone(text);
    setTelefone(formatted);
  };

  const handleDataNascimentoChange = (text: string) => {
    const formatted = formatarDataNascimento(text);
    setDataNascimento(formatted);
  };

  const handleDatePickerConfirm = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    setDataNascimento(formattedDate);
    setShowDatePicker(false);
  };

  const handlePesoChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPeso(cleaned);
  };

  const handleAlturaChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setAltura(cleaned);
  };

  const validarFormulario = async () => {
    const errors: Record<string, string> = {};

    // Validação de nome
    if (!nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    // Validação de email
    if (!email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validarEmail(email)) {
      errors.email = 'Email já existe ou é inválido';
    }

    // Validação de senha
    if (!senha || !confirmarSenha || senha !== confirmarSenha) {
      errors.senha = 'As senhas não coincidem';
    }

    if (senhaForca < 3) {
      errors.senha = 'A senha está muito fraca. Por favor, use uma senha mais forte';
    }

    // Validação de telefone
    if (!telefone || !telefoneValido) {
      errors.telefone = 'Por favor, insira um telefone válido';
    }

    // Validação de data de nascimento
    if (!dataNascimento) {
      errors.dataNascimento = 'Por favor, insira uma data de nascimento válida';
    }

    // Validação de peso
    if (!peso) {
      errors.peso = 'Por favor, insira um peso válido';
    }

    // Validação de altura
    if (!altura) {
      errors.altura = 'Por favor, insira uma altura válida';
    }

    // Validação de sexo
    if (!sexo) {
      errors.sexo = 'Por favor, selecione um sexo';
    }

    // Validação de CPF
    if (!cpf || !isCpfValid) {
      errors.cpf = 'Por favor, insira um CPF válido';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
      backgroundColor: '#F8FAFF',
    },
    scrollView: {
      flex: 1,
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      margin: width * 0.05,
      padding: width * 0.06,
      borderRadius: width * 0.06,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    title: {
      fontSize: width * 0.08,
      fontWeight: '700',
      marginBottom: height * 0.03,
      textAlign: 'center',
      color: '#1A1A1A',
      letterSpacing: -0.5,
    },
    inputContainer: {
      marginBottom: height * 0.015,
      width: '100%',
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: width * 0.03,
    },
    label: {
      fontSize: width * 0.035,
      marginBottom: height * 0.008,
      color: '#4A4A4A',
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    input: {
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      borderRadius: width * 0.04,
      padding: width * 0.04,
      fontSize: width * 0.04,
      backgroundColor: '#FFFFFF',
      color: '#1A1A1A',
      height: height * 0.06,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    inputFocused: {
      borderColor: '#6366F1',
      backgroundColor: '#FFFFFF',
      shadowColor: '#6366F1',
      shadowOpacity: 0.1,
    },
    dateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      borderRadius: width * 0.04,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      height: height * 0.06,
    },
    dateInput: {
      flex: 1,
      fontSize: width * 0.04,
      color: '#1A1A1A',
      padding: width * 0.04,
      height: '100%',
    },
    calendarButton: {
      padding: width * 0.03,
      borderLeftWidth: 1,
      borderLeftColor: '#E5E7EB',
      height: '100%',
      justifyContent: 'center',
    },
    unitInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: width * 0.02,
    },
    unitInput: {
      flex: 1,
      height: height * 0.06,
    },
    unitText: {
      fontSize: width * 0.035,
      color: '#6B7280',
      fontWeight: '500',
    },
    validationText: {
      fontSize: width * 0.03,
      marginTop: height * 0.005,
      fontWeight: '500',
    },
    validationSuccess: {
      color: '#10B981',
    },
    validationError: {
      color: '#EF4444',
    },
    radioContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: width * 0.03,
      marginTop: height * 0.01,
    },
    radioButton: {
      flex: 1,
      padding: width * 0.04,
      borderRadius: width * 0.04,
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    radioButtonSelected: {
      backgroundColor: '#6366F1',
      borderColor: '#6366F1',
    },
    radioText: {
      fontSize: width * 0.035,
      color: '#4A4A4A',
      fontWeight: '600',
    },
    radioTextSelected: {
      color: '#FFFFFF',
    },
    button: {
      backgroundColor: '#6366F1',
      padding: height * 0.02,
      borderRadius: width * 0.04,
      alignItems: 'center',
      marginTop: height * 0.03,
      shadowColor: '#6366F1',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonDisabled: {
      backgroundColor: '#E5E7EB',
      shadowOpacity: 0,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: width * 0.04,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    testButton: {
      display: 'none',
    },
    inputError: {
      borderColor: '#EF4444',
      backgroundColor: '#FEF2F2',
    },
  });

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
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedView delay={0}>
              <View style={styles.card}>
                <AnimatedView delay={100}>
                  <Text style={styles.title}>Cadastro</Text>
                </AnimatedView>

                <AnimatedView delay={200}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nome Completo</Text>
                    <TextInput
                      style={[styles.input, focusedInput === 'nome' && styles.inputFocused]}
                      value={nome}
                      onChangeText={setNome}
                      onFocus={() => setFocusedInput('nome')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Digite seu nome completo"
                    />
                  </View>
                </AnimatedView>

                <AnimatedView delay={300}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        validarEmail(text);
                      }}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Digite seu email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {email !== '' && (
                      <Text style={[styles.validationText, emailValido ? styles.validationSuccess : styles.validationError]}>
                        {emailValido ? 'E-mail válido' : 'E-mail já existe ou é inválido'}
                      </Text>
                    )}
                  </View>
                </AnimatedView>

                <AnimatedView delay={400}>
                  <PasswordField
                    label="Senha"
                    value={senha}
                    onChangeText={(text) => {
                      setSenha(text);
                      setSenhasCoincidem(text === confirmarSenha);
                    }}
                    placeholder="Digite sua senha"
                    showStrength
                    onStrengthChange={setSenhaForca}
                  />
                </AnimatedView>

                <AnimatedView delay={500}>
                  <PasswordField
                    label="Confirmar Senha"
                    value={confirmarSenha}
                    onChangeText={(text) => {
                      setConfirmarSenha(text);
                      setSenhasCoincidem(text === senha);
                    }}
                    placeholder="Confirme sua senha"
                  />
                </AnimatedView>

                <AnimatedView delay={600}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput
                      style={[styles.input, focusedInput === 'telefone' && styles.inputFocused]}
                      value={telefone}
                      onChangeText={handleTelefoneChange}
                      onFocus={() => setFocusedInput('telefone')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="(00) 00000-0000"
                      keyboardType="phone-pad"
                      maxLength={15}
                    />
                    {telefone !== '' && (
                      <Text style={[styles.validationText, telefoneValido ? styles.validationSuccess : styles.validationError]}>
                        {telefoneValido ? 'Telefone válido' : 'Telefone inválido'}
                      </Text>
                    )}
                  </View>
                </AnimatedView>

                <AnimatedView delay={700}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Data de Nascimento</Text>
                    <View style={styles.dateInputContainer}>
                      <TextInput
                        style={[
                          styles.dateInput,
                          focusedInput === 'dataNascimento' && styles.inputFocused,
                        ]}
                        value={dataNascimento}
                        onChangeText={handleDataNascimentoChange}
                        placeholder="dd/mm/aaaa"
                        keyboardType="numeric"
                        maxLength={10}
                        onFocus={() => setFocusedInput('dataNascimento')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      <TouchableOpacity
                        style={styles.calendarButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Ionicons name="calendar" size={width * 0.05} color="#4A4A4A" />
                      </TouchableOpacity>
                    </View>
                    {showDatePicker && (
                      <DateTimePicker
                        value={dataNascimento ? new Date(dataNascimento.split('/').reverse().join('-')) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          if (date) {
                            handleDatePickerConfirm(date);
                          } else {
                            setShowDatePicker(false);
                          }
                        }}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                      />
                    )}
                  </View>
                </AnimatedView>

                <AnimatedView delay={800}>
                  <View style={styles.rowContainer}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.label}>Peso</Text>
                      <View style={styles.unitInputContainer}>
                        <TextInput
                          style={[styles.input, styles.unitInput, focusedInput === 'peso' && styles.inputFocused]}
                          value={peso}
                          onChangeText={handlePesoChange}
                          onFocus={() => setFocusedInput('peso')}
                          onBlur={() => setFocusedInput(null)}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                        <Text style={styles.unitText}>kg</Text>
                      </View>
                    </View>

                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                      <Text style={styles.label}>Altura</Text>
                      <View style={styles.unitInputContainer}>
                        <TextInput
                          style={[styles.input, styles.unitInput, focusedInput === 'altura' && styles.inputFocused]}
                          value={altura}
                          onChangeText={handleAlturaChange}
                          onFocus={() => setFocusedInput('altura')}
                          onBlur={() => setFocusedInput(null)}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                        <Text style={styles.unitText}>cm</Text>
                      </View>
                    </View>
                  </View>
                </AnimatedView>

                <AnimatedView delay={900}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Sexo</Text>
                    <View style={styles.radioContainer}>
                      <TouchableOpacity
                        style={[styles.radioButton, sexo === 'M' && styles.radioButtonSelected]}
                        onPress={() => setSexo('M')}
                      >
                        <Text style={[styles.radioText, sexo === 'M' && styles.radioTextSelected]}>Masculino</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.radioButton, sexo === 'F' && styles.radioButtonSelected]}
                        onPress={() => setSexo('F')}
                      >
                        <Text style={[styles.radioText, sexo === 'F' && styles.radioTextSelected]}>Feminino</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </AnimatedView>

                <AnimatedView delay={1000}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>CPF</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedInput === 'cpf' && styles.inputFocused,
                        !isCpfValid && cpf.length > 0 && styles.inputError,
                      ]}
                      value={cpf}
                      onChangeText={handleCpfChange}
                      placeholder="000.000.000-00"
                      keyboardType="numeric"
                      maxLength={14}
                      onFocus={() => setFocusedInput('cpf')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    {!isCpfValid && cpf.length > 0 && (
                      <Text style={[styles.validationText, styles.validationError]}>
                        {cpf.length === 14 ? 'CPF já cadastrado' : 'CPF inválido'}
                      </Text>
                    )}
                  </View>
                </AnimatedView>

                <AnimatedView delay={1100}>
                  <TouchableOpacity 
                    style={[
                      styles.button,
                      (!nome || !email || !senha || !confirmarSenha || !telefone || !dataNascimento || !peso || !altura || !sexo || !emailValido || !telefoneValido || senhaForca < 3 || !isCpfValid) && styles.buttonDisabled
                    ]} 
                    onPress={handleSubmit}
                    disabled={!nome || !email || !senha || !confirmarSenha || !telefone || !dataNascimento || !peso || !altura || !sexo || !emailValido || !telefoneValido || senhaForca < 3 || !isCpfValid}
                  >
                    <Text style={styles.buttonText}>Próximo</Text>
                  </TouchableOpacity>
                </AnimatedView>
              </View>
            </AnimatedView>
          </ScrollView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
