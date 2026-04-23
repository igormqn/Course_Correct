#!/usr/bin/env python
import json
import urllib.request
import urllib.error

url = "http://localhost:8000/api/auth/login/"
data = {
    "username": "alex.morgan",
    "password": "student123"
}

try:
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(f"Status: {response.status}")
        print(f"Response:")
        print(json.dumps(result, indent=2))
        
except urllib.error.HTTPError as e:
    error_data = json.loads(e.read().decode('utf-8'))
    print(f"Status: {e.code}")
    print(f"Error Response:")
    print(json.dumps(error_data, indent=2))
    
except Exception as e:
    print(f"Erreur: {e}")
