from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # On met l'email en PREMIER pour qu'il soit bien visible "en gros"
    list_display = ['email', 'username', 'role', 'first_name', 'last_name', 'is_staff']
    
    # On rend l'email cliquable pour entrer dans la fiche
    list_display_links = ('email', 'username')
    
    # On ajoute la recherche par email pour le trouver instantanément
    search_fields = ('email', 'username', 'first_name', 'last_name')
    
    list_filter = ['role', 'is_staff', 'is_superuser']

    fieldsets = UserAdmin.fieldsets + (
        ('Informations Supplémentaires', {'fields': ('role', 'phone')}),
    )