#!/usr/bin/env python3
"""
Script de teste para verificar a funcionalidade de remoção de jogadores pelo técnico
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_remover_jogador():
    """Testa a funcionalidade de remoção de jogador pelo técnico"""
    
    print("=== TESTE: REMOVER JOGADOR DO CLUBE ===\n")
    
    # IDs de exemplo - substitua pelos IDs reais dos seus dados de teste
    tecnico_id = 2  # ID do técnico
    jogador_id = 3  # ID do jogador a ser removido
    
    print(f"Tentando remover jogador ID {jogador_id} usando técnico ID {tecnico_id}")
    
    # Primeiro, verificar se o jogador está no clube
    print("\n1. Verificando status do jogador antes da remoção...")
    response = requests.get(f"{BASE_URL}/users/{jogador_id}")
    
    if response.status_code == 200:
        jogador = response.json()
        print(f"   Jogador: {jogador.get('nome')}")
        print(f"   Clube ID atual: {jogador.get('clube_id')}")
        
        if not jogador.get('clube_id'):
            print("   ❌ Jogador não está em nenhum clube!")
            return False
    else:
        print(f"   ❌ Erro ao buscar jogador: {response.status_code}")
        return False
    
    # Tentar remover o jogador
    print("\n2. Tentando remover o jogador...")
    response = requests.patch(
        f"{BASE_URL}/users/{jogador_id}/remover-do-clube?tecnico_id={tecnico_id}"
    )
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Sucesso: {data.get('message')}")
        
        # Verificar se o jogador foi realmente removido
        print("\n3. Verificando se o jogador foi removido...")
        response = requests.get(f"{BASE_URL}/users/{jogador_id}")
        
        if response.status_code == 200:
            jogador_atualizado = response.json()
            clube_id_atual = jogador_atualizado.get('clube_id')
            
            if clube_id_atual is None:
                print("   ✅ Confirmado: Jogador foi removido do clube!")
                return True
            else:
                print(f"   ❌ Erro: Jogador ainda está no clube {clube_id_atual}")
                return False
        else:
            print(f"   ❌ Erro ao verificar jogador: {response.status_code}")
            return False
    else:
        try:
            error_data = response.json()
            print(f"   ❌ Erro: {error_data.get('detail', 'Erro desconhecido')}")
        except:
            print(f"   ❌ Erro HTTP: {response.status_code}")
        return False

def test_casos_de_erro():
    """Testa casos de erro da API"""
    
    print("\n=== TESTE: CASOS DE ERRO ===\n")
    
    # Teste 1: Técnico inexistente
    print("1. Testando com técnico inexistente...")
    response = requests.patch(
        f"{BASE_URL}/users/3/remover-do-clube?tecnico_id=999"
    )
    print(f"   Status: {response.status_code}")
    if response.status_code != 200:
        try:
            error = response.json()
            print(f"   ✅ Erro esperado: {error.get('detail')}")
        except:
            print(f"   ✅ Erro HTTP: {response.status_code}")
    
    # Teste 2: Jogador inexistente
    print("\n2. Testando com jogador inexistente...")
    response = requests.patch(
        f"{BASE_URL}/users/999/remover-do-clube?tecnico_id=2"
    )
    print(f"   Status: {response.status_code}")
    if response.status_code != 200:
        try:
            error = response.json()
            print(f"   ✅ Erro esperado: {error.get('detail')}")
        except:
            print(f"   ✅ Erro HTTP: {response.status_code}")
    
    # Teste 3: Técnico tentando remover jogador de outro clube
    print("\n3. Testando técnico tentando remover jogador de outro clube...")
    # Este teste só funcionará se houver múltiplos clubes/técnicos
    
    print("\n=== TESTES DE ERRO CONCLUÍDOS ===")

if __name__ == "__main__":
    print("Iniciando testes do endpoint de remoção de jogadores...\n")
    
    # Teste principal
    sucesso = test_remover_jogador()
    
    # Testes de casos de erro
    test_casos_de_erro()
    
    print(f"\n=== RESULTADO FINAL ===")
    if sucesso:
        print("✅ TESTE PRINCIPAL PASSOU!")
    else:
        print("❌ TESTE PRINCIPAL FALHOU!")
    
    print("\nNota: Certifique-se de ajustar os IDs no script conforme seus dados de teste.") 