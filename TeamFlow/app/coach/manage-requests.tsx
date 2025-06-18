import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import NavigationBar from '../../components/NavigationBar';

export default function ManageRequests() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Gerenciar Solicitações</Text>
        <Text style={styles.subtitle}>Gerencie as solicitações de jogadores para seu time</Text>
      </View>
      
      <NavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
}); 