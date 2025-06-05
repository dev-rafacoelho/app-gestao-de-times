import requests
import json

# Teste de login
login_data = {
    "email": "tec",
    "senha": "tev"
}

try:
    response = requests.post(
        "http://localhost:8000/auth/login",
        headers={"Content-Type": "application/json"},
        json=login_data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print("Login successful!")
        print(f"User ID: {data.get('user_id')}")
        print(f"Tipo User ID: {data.get('tipo_user_id')}")
        print(f"Clube ID: {data.get('clube_id')}")
    else:
        print("Login failed!")
        
except requests.exceptions.ConnectionError:
    print("Error: Could not connect to the server. Make sure the backend is running.")
except Exception as e:
    print(f"Error: {e}") 