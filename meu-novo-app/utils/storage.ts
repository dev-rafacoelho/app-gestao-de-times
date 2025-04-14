import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  USUARIOS: 'usuarios',
  USUARIO_ATUAL: 'usuario_atual',
  CONFIGURACOES: 'configuracoes',
  TIMES: 'times',
  JOGADORES: 'jogadores',
  PARTIDAS: 'partidas',
  NOTIFICACOES: 'notificacoes',
  MENSAGENS: 'mensagens',
  BACKUP: 'backup',
} as const;

export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Erro ao buscar item ${key}:`, error);
    return null;
  }
};

export const setItem = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar item ${key}:`, error);
    return false;
  }
};

export const removeItem = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Erro ao remover item ${key}:`, error);
    return false;
  }
};

export const clearAll = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Erro ao limpar armazenamento:', error);
    return false;
  }
}; 