import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  useEffect(() => {
    const redirect = async () => {
      try {
        // Adiciona um pequeno delay para garantir que o SplashScreen foi carregado
        await new Promise(resolve => setTimeout(resolve, 1000));
        await router.replace('/login');
      } catch (error) {
        console.error('Erro ao redirecionar:', error);
      }
    };
    redirect();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0066FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});