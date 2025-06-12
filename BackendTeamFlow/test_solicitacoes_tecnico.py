import requests
import json

# Configurações da API
BASE_URL = "http://localhost:8000"

def test_fluxo_completo_solicitacoes_tecnico():
    """
    Teste completo do fluxo de solicitações para técnicos:
    1. Jogador solicita entrada no clube
    2. Técnico visualiza solicitações
    3. Técnico aprova/rejeita solicitações
    """
    
    # Passo 1: Criar usuário jogador
    print("\n=== PASSO 1: Criando usuário jogador ===")
    jogador_data = {
        "nome": "João Silva",
        "email": "joao.teste@example.com",
        "data_nascimento": "1995-05-15",
        "telefone": "11999999999",
        "senha": "123456",
        "tipo_user_id": 1
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=jogador_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        jogador = response.json()
        jogador_id = jogador["id"]
        print(f"Jogador criado com ID: {jogador_id}")
    else:
        print(f"Erro ao criar jogador: {response.text}")
        return
    
    # Passo 2: Criar usuário técnico
    print("\n=== PASSO 2: Criando usuário técnico ===")
    tecnico_data = {
        "nome": "Carlos Técnico",
        "email": "carlos.tecnico@example.com",
        "data_nascimento": "1980-01-01",
        "telefone": "11888888888",
        "senha": "123456",
        "tipo_user_id": 2
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=tecnico_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        tecnico = response.json()
        tecnico_id = tecnico["id"]
        print(f"Técnico criado com ID: {tecnico_id}")
    else:
        print(f"Erro ao criar técnico: {response.text}")
        return
    
    # Passo 3: Criar clube com o técnico
    print("\n=== PASSO 3: Criando clube ===")
    clube_data = {
        "nome": "Clube de Teste",
        "tecnico_id": tecnico_id,
        "procurando_jogadores": True
    }
    
    response = requests.post(f"{BASE_URL}/clubes/", json=clube_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        clube = response.json()
        clube_id = clube["id"]
        print(f"Clube criado com ID: {clube_id}")
    else:
        print(f"Erro ao criar clube: {response.text}")
        return
    
    # Passo 4: Jogador solicita entrada no clube
    print("\n=== PASSO 4: Jogador solicitando entrada ===")
    solicitacao_data = {
        "clube_id": clube_id,
        "observacao": "Gostaria muito de fazer parte do time!"
    }
    
    response = requests.post(
        f"{BASE_URL}/solicitacoes-acesso/?user_id={jogador_id}",
        json=solicitacao_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        solicitacao = response.json()
        solicitacao_id = solicitacao["id"]
        print(f"Solicitação criada com ID: {solicitacao_id}")
    else:
        print(f"Erro ao criar solicitação: {response.text}")
        return
    
    # Passo 5: Técnico visualiza solicitações
    print("\n=== PASSO 5: Técnico visualizando solicitações ===")
    response = requests.get(
        f"{BASE_URL}/solicitacoes-acesso/clube/{clube_id}?user_id={tecnico_id}"
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        solicitacoes = response.json()
        print(f"Solicitações encontradas: {len(solicitacoes)}")
        
        if solicitacoes:
            for sol in solicitacoes:
                print(f"  - ID: {sol['id']}, Status: {sol['status']}, Jogador: {sol['jogador']['nome'] if sol['jogador'] else 'N/A'}")
        else:
            print("Nenhuma solicitação encontrada")
            return
    else:
        print(f"Erro ao buscar solicitações: {response.text}")
        return
    
    # Passo 6: Técnico aprova a solicitação
    print("\n=== PASSO 6: Técnico aprovando solicitação ===")
    resposta_data = {
        "status": "aprovado",
        "observacao": "Bem-vindo ao time!"
    }
    
    response = requests.put(
        f"{BASE_URL}/solicitacoes-acesso/{solicitacao_id}?user_id={tecnico_id}",
        json=resposta_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        resposta = response.json()
        print(f"Solicitação aprovada! Status: {resposta['status']}")
    else:
        print(f"Erro ao aprovar solicitação: {response.text}")
        return
    
    # Passo 7: Verificar se jogador foi adicionado ao clube
    print("\n=== PASSO 7: Verificando se jogador foi adicionado ao clube ===")
    response = requests.get(f"{BASE_URL}/users/{jogador_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        jogador_atualizado = response.json()
        print(f"Clube do jogador: {jogador_atualizado.get('clube_id')}")
        if jogador_atualizado.get('clube_id') == clube_id:
            print("✅ SUCESSO: Jogador foi adicionado ao clube!")
        else:
            print("❌ ERRO: Jogador não foi adicionado ao clube")
    else:
        print(f"Erro ao verificar jogador: {response.text}")
    
    # Passo 8: Teste de rejeição (criar outro jogador)
    print("\n=== PASSO 8: Testando rejeição de solicitação ===")
    
    # Criar segundo jogador
    jogador2_data = {
        "nome": "Maria Santos",
        "email": "maria.teste@example.com",
        "data_nascimento": "1992-03-20",
        "telefone": "11777777777",
        "senha": "123456",
        "tipo_user_id": 1
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=jogador2_data)
    if response.status_code == 201:
        jogador2 = response.json()
        jogador2_id = jogador2["id"]
        print(f"Segundo jogador criado com ID: {jogador2_id}")
        
        # Criar solicitação
        solicitacao2_data = {
            "clube_id": clube_id,
            "observacao": "Também gostaria de participar!"
        }
        
        response = requests.post(
            f"{BASE_URL}/solicitacoes-acesso/?user_id={jogador2_id}",
            json=solicitacao2_data
        )
        
        if response.status_code == 200:
            solicitacao2 = response.json()
            solicitacao2_id = solicitacao2["id"]
            
            # Rejeitar solicitação
            resposta_rejeitacao = {
                "status": "rejeitado",
                "observacao": "Não temos vagas no momento"
            }
            
            response = requests.put(
                f"{BASE_URL}/solicitacoes-acesso/{solicitacao2_id}?user_id={tecnico_id}",
                json=resposta_rejeitacao
            )
            
            if response.status_code == 200:
                resposta_rej = response.json()
                print(f"Solicitação rejeitada! Status: {resposta_rej['status']}")
                
                # Verificar se jogador NÃO foi adicionado
                response = requests.get(f"{BASE_URL}/users/{jogador2_id}")
                if response.status_code == 200:
                    jogador2_atualizado = response.json()
                    if jogador2_atualizado.get('clube_id') is None:
                        print("✅ SUCESSO: Jogador rejeitado não foi adicionado ao clube!")
                    else:
                        print("❌ ERRO: Jogador rejeitado foi adicionado ao clube")
    
    print("\n=== TESTE COMPLETO! ===")

if __name__ == "__main__":
    test_fluxo_completo_solicitacoes_tecnico() 