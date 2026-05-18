#!/usr/bin/env bash
# Script de déploiement PythonAnywhere
# À exécuter dans la console Bash de PythonAnywhere
# Remplace TON_USERNAME par ton nom d'utilisateur PythonAnywhere

USERNAME=$(whoami)
REPO="https://github.com/igormqn/Course_Correct.git"
PROJECT_DIR="/home/$USERNAME/Course_Correct"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_DIR="/home/$USERNAME/.virtualenvs/coursecorrect"

echo "=== Clonage du projet ==="
cd /home/$USERNAME
git clone $REPO || (cd Course_Correct && git pull)

echo "=== Création du virtualenv ==="
python3 -m venv $VENV_DIR

echo "=== Installation des dépendances ==="
source $VENV_DIR/bin/activate
pip install -r $BACKEND_DIR/requirements.txt

echo "=== Migrations ==="
cd $BACKEND_DIR
python manage.py migrate
python manage.py collectstatic --no-input

echo "=== Données de test ==="
python populate_db.py

echo ""
echo "=== TERMINÉ ==="
echo "Configure maintenant le fichier WSGI dans l'onglet Web de PythonAnywhere."
echo "Chemin du projet  : $BACKEND_DIR"
echo "Chemin du venv    : $VENV_DIR"
