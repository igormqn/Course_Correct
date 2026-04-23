#!/usr/bin/env python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=== Vérification des utilisateurs et mots de passe ===\n")
for user in User.objects.all():
    print(f"Username: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Nom: {user.first_name} {user.last_name}")
    print(f"  Is Active: {user.is_active}")
    print(f"  Password hash: {user.password[:50]}...")
    print()

print("\n=== Test des mots de passe ===")
test_credentials = [
    ("admin", "admin123"),
    ("alex.morgan", "student123"),
    ("admin01", "student123"),
]

from django.contrib.auth import authenticate

for username, password in test_credentials:
    user = authenticate(username=username, password=password)
    if user:
        print(f"✅ {username}:{password} -> SUCCESS")
    else:
        print(f"❌ {username}:{password} -> FAILED")
