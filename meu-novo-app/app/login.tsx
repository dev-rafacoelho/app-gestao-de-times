import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated, Dimensions } from 'react-native';
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface Usuario {
  email: string;
  senha: string;
  nome?: string;
  // Adicione outros campos conforme necessário
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [botaoBloqueado, setBotaoBloqueado] = useState(false);
  const [tentativasErradas, setTentativasErradas] = useState(0);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // Carregar email salvo
  useEffect(() => {
    const carregarEmailSalvo = async () => {
      try {
        const emailSalvo = await AsyncStorage.getItem('emailSalvo');
        if (emailSalvo) {
          setEmail(emailSalvo);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Erro ao carregar email salvo:', error);
      }
    };
    carregarEmailSalvo();
  }, []);

  const handleLogin = useCallback(async () => {
    if (botaoBloqueado) {
      Alert.alert(
        'Conta Bloqueada',
        'Você errou a senha 3 vezes. Por favor, recupere sua conta.',
        [
          {
            text: 'Recuperar Conta',
            onPress: () => router.push('/esqueceuSenha')
          }
        ]
      );
      return;
    }

    try {
      const usuarios = await AsyncStorage.getItem('usuarios');
      if (!usuarios) {
        Alert.alert('Erro', 'Nenhum usuário cadastrado');
        return;
      }

      const listaUsuarios: Usuario[] = JSON.parse(usuarios);
      const usuario = listaUsuarios.find(
        (u: Usuario) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
      );

      if (usuario) {
        // Resetar tentativas em caso de sucesso
        setTentativasErradas(0);
        setBotaoBloqueado(false);
        
        // Salvar email se "Lembrar-se de mim" estiver ativo
        if (rememberMe) {
          await AsyncStorage.setItem('emailSalvo', email);
        } else {
          await AsyncStorage.removeItem('emailSalvo');
        }
        
        // Salvar dados do usuário atual
        await AsyncStorage.setItem('dadosCadastro', JSON.stringify(usuario));
        
        // Verificar se já tem cadastro profissional
        const dadosProfissionais = await AsyncStorage.getItem('dadosProfissionais');
        if (!dadosProfissionais) {
          // Se não tiver cadastro profissional, redireciona para essa tela
          router.replace('/cadastroProfissional');
        } else {
          // Se já tiver cadastro profissional, redireciona para o perfil
          router.replace('/perfil');
        }
      } else {
        const novasTentativas = tentativasErradas + 1;
        setTentativasErradas(novasTentativas);
        
        if (novasTentativas >= 3) {
          setBotaoBloqueado(true);
          Alert.alert(
            'Conta Bloqueada',
            'Você errou a senha 3 vezes. Por favor, recupere sua conta.',
            [
              {
                text: 'Recuperar Conta',
                onPress: () => router.push('/esqueceuSenha')
              }
            ]
          );
        } else {
          Alert.alert('Erro', 'E-mail ou senha incorretos');
        }
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', 'Não foi possível fazer login');
    }
  }, [email, senha, botaoBloqueado, tentativasErradas, rememberMe]);

  // Memoizar animações
  const animations = useMemo(() => ({
    fadeIn: Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }),
    slideUp: Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    })
  }), [fadeAnim, slideAnim]);

  useEffect(() => {
    Animated.parallel([
      animations.fadeIn,
      animations.slideUp
    ]).start();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={['#1a237e', '#0d47a1', '#1976d2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <Animated.View 
            style={[
              styles.card,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.loginBox}>
              
              {/* Imagem no topo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require('./assets/team-management-logo.png')}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </View>

              {/* Título Login */}
              <Text style={styles.title}>Login</Text>
              
              {/* Link Registrar-se */}
              <TouchableOpacity onPress={() => router.push('/cadastro')}>
                <Text style={styles.registerLink}>Não tem conta? Registre-se</Text>
              </TouchableOpacity>

              {/* Campo E-mail */}
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              
              {/* Campo Senha com Olhinho */}
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={senha}
                  onChangeText={setSenha}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Esqueceu senha e lembrar de mim */}
              <View style={styles.optionsRow}>
                <TouchableOpacity onPress={() => router.push('/esqueceuSenha')}>
                  <Text style={styles.optionText}>Esqueceu a senha?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                  <Text style={styles.optionText}>
                    {rememberMe ? '✓' : ''} Lembrar-se de mim
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Botão Entrar */}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    marginHorizontal: 20,
  },
  loginBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#1a237e',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  registerLink: {
    color: '#0066FF',
    marginBottom: 25,
    fontSize: 15,
  },
  label: {
    fontSize: 15,
    color: '#000000',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    width: '100%',
    marginBottom: 15,
    fontSize: 15,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  optionText: {
    fontSize: 13,
    color: '#0066FF',
  },
  button: {
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
