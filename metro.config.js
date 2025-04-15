// Configuração do Metro Bundler
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Caminho para o diretório do projeto real
const projectRoot = path.resolve(__dirname, 'meu-novo-app');

const config = getDefaultConfig(projectRoot);

// Adiciona o diretório raiz aos watchFolders para permitir importações absolutas
config.watchFolders = [__dirname];

// Assegura que o resolver encontre módulos em ambos os diretórios node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config; 