#!/usr/bin/env python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=== Utilisateurs dans la base de données ===")
for user in User.objects.all():
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Nom: {user.first_name} {user.last_name}, Role: {user.role}")
