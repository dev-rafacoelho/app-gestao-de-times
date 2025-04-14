import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Mantém a tela de splash visível enquanto carregamos os recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (fontError) {
          throw fontError;
        }

        if (fontsLoaded) {
          await SplashScreen.hideAsync();
          setIsReady(true);
        }
      } catch (e) {
        setError(e as Error);
        console.warn('Erro ao carregar recursos:', e);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ocorreu um erro ao carregar o aplicativo</Text>
        <Text style={styles.errorDetails}>{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: true,
            presentation: 'modal',
          }}
        >
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
          <Stack.Screen 
            name="+not-found" 
            options={{
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="cadastro"
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="perfil"
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              fullScreenGestureEnabled: true,
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
