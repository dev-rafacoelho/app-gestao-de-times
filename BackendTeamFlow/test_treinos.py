import requests
import json
from datetime import datetime, timedelta

# Configuração da API
API_URL = "https://teste-faculdade-backend.lvbgea.easypanel.host"

def test_login():
    """Testa o login e retorna as credenciais"""
    response = requests.post(f"{API_URL}/login", json={
        "email": "jogador1@example.com",  # Substitua por um email válido
        "senha": "senha123"  # Substitua por uma senha válida
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"Login bem-sucedido: {data}")
        return data
    else:
        print(f"Erro no login: {response.status_code} - {response.text}")
        return None

def test_treinos_clube(clube_id, jogador_id):
    """Testa a busca de treinos de um clube"""
    response = requests.get(f"{API_URL}/treinos/clube/{clube_id}?jogador_id={jogador_id}")
    
    print(f"\n=== Teste: Treinos do Clube {clube_id} ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Treinos encontrados: {len(data)}")
        for treino in data:
            print(f"- {treino['titulo']} ({treino['data_hora']})")
    else:
        print(f"Erro: {response.text}")

def test_participacoes(jogador_id):
    """Testa a busca de participações de um jogador"""
    response = requests.get(f"{API_URL}/treinos/minhas-participacoes?jogador_id={jogador_id}")
    
    print(f"\n=== Teste: Participações do Jogador {jogador_id} ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Participações encontradas: {len(data)}")
        for part in data:
            print(f"- Treino {part['treino_id']}: {part['status']}")
    else:
        print(f"Erro: {response.text}")

def test_responder_treino(treino_id, jogador_id, status="aceito"):
    """Testa responder a um treino"""
    response = requests.put(
        f"{API_URL}/treinos/participacao/{treino_id}?jogador_id={jogador_id}",
        json={"status": status}
    )
    
    print(f"\n=== Teste: Responder Treino {treino_id} ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Resposta registrada: {data['status']}")
    else:
        print(f"Erro: {response.text}")

if __name__ == "__main__":
    print("=== TESTE DAS FUNCIONALIDADES DE TREINOS ===")
    
    # Primeiro, tenta fazer login
    login_data = test_login()
    
    if login_data:
        user_id = login_data.get("user_id")
        clube_id = login_data.get("clube_id")
        
        if user_id and clube_id:
            # Testa buscar treinos do clube
            test_treinos_clube(clube_id, user_id)
            
            # Testa buscar participações
            test_participacoes(user_id)
            
            # Pode testar responder a um treino específico se souber o ID
            # test_responder_treino(1, user_id, "aceito")
        else:
            print("Usuário não tem clube associado ou dados incompletos")
    else:
        print("Não foi possível fazer login. Verifique as credenciais.") 