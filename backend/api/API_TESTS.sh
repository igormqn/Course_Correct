# TESTS API - COURSE CORRECT
# Utilise ces commandes avec curl ou Postman/Thunder Client

# BASE URL
BASE_URL="http://localhost:8000/api"

# ========================================
# 1. AUTHENTIFICATION
# ========================================

# Login (Étudiant)
curl -X POST $BASE_URL/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alex.morgan",
    "password": "student123"
  }'

# Login (Tuteur)
curl -X POST $BASE_URL/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "james.williams",
    "password": "tutor123"
  }'

# Login (Admin)
curl -X POST $BASE_URL/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# RÉSULTAT : Tu recevras un access_token et un refresh_token
# Copie le access_token et utilise-le dans les requêtes suivantes


# ========================================
# 2. UTILISATEURS
# ========================================

# Créer un nouvel utilisateur (étudiant)
curl -X POST $BASE_URL/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john.doe@nyu.edu",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "STUDENT"
  }'

# Obtenir les infos de l'utilisateur connecté
curl -X GET $BASE_URL/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"


# ========================================
# 3. SERVICES
# ========================================

# Liste des services
curl -X GET $BASE_URL/services/

# Détail d'un service
curl -X GET $BASE_URL/services/1/


# ========================================
# 4. MATIÈRES & COURS
# ========================================

# Liste des matières
curl -X GET $BASE_URL/subjects/

# Liste des cours
curl -X GET $BASE_URL/courses/

# Détail d'un cours
curl -X GET $BASE_URL/courses/1/


# ========================================
# 5. DEVOIRS (ASSIGNMENTS)
# ========================================

# Liste des devoirs (selon le rôle de l'utilisateur)
curl -X GET $BASE_URL/assignments/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Mes devoirs (étudiant uniquement)
curl -X GET $BASE_URL/assignments/my_assignments/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Devoirs à corriger (tuteur uniquement)
curl -X GET $BASE_URL/assignments/to_correct/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Détail d'un devoir
curl -X GET $BASE_URL/assignments/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Créer un devoir (étudiant)
# Note : Pour l'upload de fichier, utilise Postman ou un formulaire
curl -X POST $BASE_URL/assignments/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course": 1,
    "service": 1,
    "file": "assignments/test.pdf"
  }'

# Mettre à jour le statut d'un devoir
curl -X PATCH $BASE_URL/assignments/1/update_status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'


# ========================================
# 6. CORRECTIONS
# ========================================

# Liste des corrections
curl -X GET $BASE_URL/corrections/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Créer une correction (tuteur)
curl -X POST $BASE_URL/corrections/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignment": 2,
    "comment": "Bon travail ! Quelques points à améliorer...",
    "grade": 15.5
  }'

# Marquer une correction comme terminée
curl -X PATCH $BASE_URL/corrections/1/complete/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"


# ========================================
# TESTS AVEC POSTMAN / THUNDER CLIENT
# ========================================

# 1. Créer une collection "Course Correct API"
# 2. Ajouter une variable d'environnement :
#    - BASE_URL = http://localhost:8000/api
#    - TOKEN = (sera rempli après le login)
# 
# 3. Pour chaque requête :
#    - URL : {{BASE_URL}}/endpoint
#    - Headers : Authorization: Bearer {{TOKEN}}
#    - Body (pour POST/PATCH) : JSON


# ========================================
# ENDPOINTS DISPONIBLES
# ========================================

GET     /api/auth/login/                    # Login
POST    /api/auth/refresh/                  # Refresh token

GET     /api/users/                         # Liste utilisateurs
POST    /api/users/                         # Créer utilisateur
GET     /api/users/me/                      # Utilisateur connecté
GET     /api/users/{id}/                    # Détail utilisateur

GET     /api/services/                      # Liste services
GET     /api/services/{id}/                 # Détail service

GET     /api/subjects/                      # Liste matières
GET     /api/subjects/{id}/                 # Détail matière

GET     /api/courses/                       # Liste cours
GET     /api/courses/{id}/                  # Détail cours

GET     /api/assignments/                   # Liste devoirs
POST    /api/assignments/                   # Créer devoir
GET     /api/assignments/{id}/              # Détail devoir
PATCH   /api/assignments/{id}/              # Modifier devoir
DELETE  /api/assignments/{id}/              # Supprimer devoir
GET     /api/assignments/my_assignments/    # Mes devoirs (étudiant)
GET     /api/assignments/to_correct/        # À corriger (tuteur)
PATCH   /api/assignments/{id}/update_status/ # Changer statut

GET     /api/corrections/                   # Liste corrections
POST    /api/corrections/                   # Créer correction
GET     /api/corrections/{id}/              # Détail correction
PATCH   /api/corrections/{id}/complete/     # Terminer correction
