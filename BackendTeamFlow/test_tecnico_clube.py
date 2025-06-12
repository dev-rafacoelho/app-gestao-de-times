import requests
import json

# Configuração da API
API_URL = "https://teste-faculdade-backend.lvbgea.easypanel.host"

def test_tecnico_login():
    """Testa o login de um técnico"""
    response = requests.post(f"{API_URL}/auth/login", json={
        "email": "tecnico1@example.com",  # Substitua por um email de técnico válido
        "senha": "senha123"  # Substitua por uma senha válida
    })
    
    print(f"=== Teste: Login do Técnico ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Login bem-sucedido: {data}")
        return data
    else:
        print(f"Erro no login: {response.text}")
        return None

def test_buscar_clube_tecnico(tecnico_id):
    """Testa a busca do clube de um técnico"""
    response = requests.get(f"{API_URL}/clubes/meu-clube/{tecnico_id}")
    
    print(f"\n=== Teste: Buscar Clube do Técnico {tecnico_id} ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Clube encontrado: {data['nome']} (ID: {data['id']})")
        print(f"Procurando jogadores: {data['procurando_jogadores']}")
        print(f"Jogadores no time: {len(data['usuarios'])}")
        return data
    else:
        print(f"Erro: {response.text}")
        return None

def test_atualizar_status_procurando(clube_id, novo_status):
    """Testa atualizar o status de procurando jogadores"""
    response = requests.patch(
        f"{API_URL}/clubes/{clube_id}/procurando-jogadores",
        json={"procurando_jogadores": novo_status}
    )
    
    print(f"\n=== Teste: Atualizar Status Procurando ({novo_status}) ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Status atualizado com sucesso: {data['procurando_jogadores']}")
        return data
    else:
        print(f"Erro: {response.text}")
        return None

if __name__ == "__main__":
    print("=== TESTE DAS FUNCIONALIDADES DO TÉCNICO ===")
    
    # Testa login do técnico
    login_data = test_tecnico_login()
    
    if login_data and login_data.get("tipo_user_id") == 2:
        tecnico_id = login_data.get("user_id")
        clube_id = login_data.get("clube_id")
        
        print(f"\nTécnico ID: {tecnico_id}")
        print(f"Clube ID no login: {clube_id}")
        
        # Testa buscar clube do técnico
        clube_data = test_buscar_clube_tecnico(tecnico_id)
        
        if clube_data:
            # Testa alternar status de procurando jogadores
            current_status = clube_data["procurando_jogadores"]
            new_status = not current_status
            
            test_atualizar_status_procurando(clube_data["id"], new_status)
            
            # Volta ao status original
            test_atualizar_status_procurando(clube_data["id"], current_status)
    else:
        print("Login falhou ou usuário não é técnico") 