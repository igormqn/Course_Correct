#!/usr/bin/env python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=== Réinitialisation des mots de passe ===\n")

passwords = {
    "admin": "admin123",
    "admin01": "student123",
    "alex.morgan": "student123",
    "james.williams": "tutor123",
    "sarah.morrison": "tutor123",
    "michael.greene": "tutor123",
    "li.chen": "tutor123",
}

for username, password in passwords.items():
    try:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"✅ {username} -> mot de passe défini à '{password}'")
    except User.DoesNotExist:
        print(f"❌ {username} -> utilisateur non trouvé")

print("\n=== Test des nouveaux mots de passe ===")
from django.contrib.auth import authenticate

for username, password in passwords.items():
    user = authenticate(username=username, password=password)
    if user:
        print(f"✅ {username}:{password} -> SUCCESS")
    else:
        print(f"❌ {username}:{password} -> FAILED")
