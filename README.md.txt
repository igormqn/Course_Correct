usecaseDiagram
title Course Correct – Use Case Diagram

actor Visitor
actor Student
actor Tutor
actor Administrator

Visitor --> (View courses)
Visitor --> (Create an account)
Visitor --> (Log in)

Student --> (Log in)
Student --> (View courses)
Student --> (Select a subject)
Student --> (Submit an assignment)
Student --> (Choose a type of correction)
Student --> (Pay a service)
Student --> (View corrections)
Student --> (View homework history)
Student --> (Manage your profile)

Tutor --> (Log in)
Tutor --> (Consult the assignments to be corrected)
Tutor --> (Correct an assignment)
Tutor --> (Add comments)
Tutor --> (Assign a rating)
Tutor --> (Close a correction)

Administrator --> (Log in)
Administrator --> (Manage users)
Administrator --> (Create courses)
Administrator --> (Manage Materials)
Administrator --> (Assign tutors)
Administrator --> (Configure services)
Administrator --> (Schedule courses)

FR
titre Course Correct – Diagramme de cas d'utilisation

acteur Visiteur
acteur Étudiant
acteur Tuteur
acteur Administrateur

Visiteur --> (Consulter les cours)
Visiteur --> (Créer un compte)
Visiteur --> (Se connecter)

Étudiant --> (Se connecter)
Étudiant --> (Consulter les cours)
Étudiant --> (Sélectionner une matière)
Étudiant --> (Déposer un devoir)
Étudiant --> (Choisir un type de correction)
Étudiant --> (Payer un service)
Étudiant --> (Consulter les corrections)
Étudiant --> (Consulter l’historique des devoirs)
Étudiant --> (Gérer son profil)

Tuteur --> (Se connecter)
Tuteur --> (Consulter les devoirs à corriger)
Tuteur --> (Corriger un devoir)
Tuteur --> (Ajouter des commentaires)
Tuteur --> (Attribuer une note)
Tuteur --> (Clôturer une correction)

Administrateur --> (Se connecter)
Administrateur --> (Gérer les utilisateurs)
Administrateur --> (Créer des cours)
Administrateur --> (Gérer les matières)
Administrateur --> (Affecter les tuteurs)
Administrateur --> (Configurer les services)
Administrateur --> (Planifier les cours)

FR
Diagrame de séquence
    actor Étudiant
    participant Frontend
    participant Backend
    participant BaseDeDonnées

    Étudiant ->> Frontend: Sélectionner une matière
    Frontend ->> Backend: GET /cours
    Backend ->> BaseDeDonnées: Récupérer les cours
    BaseDeDonnées -->> Backend: Liste des cours
    Backend -->> Frontend: Liste des cours

    Étudiant ->> Frontend: Déposer un devoir
    Frontend ->> Backend: POST /devoir
    Backend ->> BaseDeDonnées: Enregistrer le devoir
    BaseDeDonnées -->> Backend: Confirmation
    Backend -->> Frontend: Devoir enregistré

    Frontend -->> Étudiant: Confirmation de dépôt
EN

sequenceDiagram
    actor Student
    participant Frontend
    participant Backend
    participant BaseDeDonnées

    Student ->> Frontend: Select a Subject
    Frontend ->> Backend: GET /cours
    Backend -> BaseDeDonnées: Retrieve courses
    BaseDeDonnées -->> Backend: Course list
    Backend -->> Frontend: Course list

    Student ->> Frontend: Submit an assignment
    Frontend ->> Backend: POST /devoir
    Backend -> BaseDeDonnées: Save Assignment
    BaseDeDonnées -->> Backend: Confirmation
    Backend -->> Frontend: Saved Assignment

    Frontend -->> Student: Deposit confirmation

FR
UTILISATEUR
- id_utilisateur
- nom
- prénom
- email
- mot_de_passe

ROLE
- id_role
- libelle

COURS
- id_cours
- nom
- description
- date_debut
- date_fin

MATIERE
- id_matiere
- nom

DEVOIR
- id_devoir
- date_depot
- fichier
- statut

CORRECTION
- id_correction
- commentaire
- note
- date_correction
