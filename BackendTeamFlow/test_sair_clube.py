import requests
import json

# Configuração da API
API_URL = "https://teste-faculdade-backend.lvbgea.easypanel.host"

def test_jogador_login():
    """Testa o login de um jogador"""
    response = requests.post(f"{API_URL}/auth/login", json={
        "email": "jogador1@example.com",  # Substitua por um email de jogador válido
        "senha": "senha123"  # Substitua por uma senha válida
    })
    
    print(f"=== Teste: Login do Jogador ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Login bem-sucedido: {data}")
        return data
    else:
        print(f"Erro no login: {response.text}")
        return None

def test_verificar_clube_atual(jogador_id):
    """Verifica o clube atual do jogador"""
    response = requests.get(f"{API_URL}/users/{jogador_id}")
    
    print(f"\n=== Teste: Verificar Clube Atual ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        clube_id = data.get("clube_id")
        print(f"Jogador está no clube ID: {clube_id}")
        
        if clube_id:
            clube_nome = data.get("clube", {}).get("nome", "N/A")
            print(f"Nome do clube: {clube_nome}")
        else:
            print("Jogador não faz parte de nenhum clube")
        
        return clube_id
    else:
        print(f"Erro: {response.text}")
        return None

def test_sair_clube(jogador_id):
    """Testa a funcionalidade de sair do clube"""
    response = requests.patch(f"{API_URL}/users/{jogador_id}/sair-clube")
    
    print(f"\n=== Teste: Sair do Clube ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Saída bem-sucedida!")
        print(f"Clube ID após sair: {data.get('clube_id')}")
        return True
    else:
        print(f"Erro: {response.text}")
        return False

def test_verificar_clube_apos_sair(jogador_id):
    """Verifica se o jogador realmente saiu do clube"""
    response = requests.get(f"{API_URL}/users/{jogador_id}")
    
    print(f"\n=== Teste: Verificar Após Sair ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        clube_id = data.get("clube_id")
        print(f"Clube ID após sair: {clube_id}")
        
        if clube_id is None:
            print("✅ Sucesso: Jogador não faz mais parte de nenhum clube")
            return True
        else:
            print("❌ Erro: Jogador ainda faz parte de um clube")
            return False
    else:
        print(f"Erro: {response.text}")
        return False

if __name__ == "__main__":
    print("=== TESTE DA FUNCIONALIDADE DE SAIR DO CLUBE ===")
    
    # Testa login do jogador
    login_data = test_jogador_login()
    
    if login_data and login_data.get("tipo_user_id") == 1:
        jogador_id = login_data.get("user_id")
        
        # Verifica clube atual
        clube_atual = test_verificar_clube_atual(jogador_id)
        
        if clube_atual:
            # Testa sair do clube
            if test_sair_clube(jogador_id):
                # Verifica se realmente saiu
                test_verificar_clube_apos_sair(jogador_id)
        else:
            print("Jogador não faz parte de nenhum clube para testar a saída")
            
    else:
        print("Login falhou ou usuário não é jogador") 