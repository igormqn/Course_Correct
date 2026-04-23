#!/usr/bin/env python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

import json
import requests

# Tester le login
url = "http://localhost:8000/api/auth/login/"
data = {
    "username": "alex.morgan",
    "password": "student123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Erreur: {e}")
