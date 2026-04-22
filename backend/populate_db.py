#!/usr/bin/env python
"""
Script pour peupler la base de données Course Correct avec des données de test
Usage: python populate_db.py
"""

# À exécuter depuis le répertoire racine du projet Django :
# python populate_db.py

from datetime import datetime, timedelta
from decimal import Decimal

# Configuration Django
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from services.models import Service
from courses.models import Subject, Course, TutorAssignment
from assignments.models import Assignment
from corrections.models import Correction

User = get_user_model()

def create_users():
    """Créer les utilisateurs de test"""
    print("📝 Création des utilisateurs...")
    
    # Admin
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@stansfield.edu',
            'first_name': 'Admin',
            'last_name': 'System',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print("   ✅ Admin créé")
    else:
        print("   ℹ️  Admin déjà existant")
    
    # Étudiant : Alex Morgan
    student, created = User.objects.get_or_create(
        username='alex.morgan',
        defaults={
            'email': 'alex.morgan@stansfield.edu',
            'first_name': 'Alex',
            'last_name': 'Morgan',
            'role': 'STUDENT',
            'phone': '+1 (917) 555-0142'
        }
    )
    if created:
        student.set_password('student123')
        student.save()
        print("   ✅ Étudiant Alex Morgan créé")
    else:
        print("   ℹ️  Étudiant Alex Morgan déjà existant")
    
    # Tuteurs (étudiants qui corrigent)
    tutors_data = [
        {
            'username': 'james.williams',
            'email': 'james.williams@stansfield.edu',
            'first_name': 'James',
            'last_name': 'Williams',
            'phone': '+1 (917) 555-0201',
            'specialty': 'Chemistry'
        },
        {
            'username': 'sarah.morrison',
            'email': 'sarah.morrison@stansfield.edu',
            'first_name': 'Sarah',
            'last_name': 'Morrison',
            'phone': '+1 (917) 555-0202',
            'specialty': 'Literature'
        },
        {
            'username': 'michael.greene',
            'email': 'michael.greene@stansfield.edu',
            'first_name': 'Michael',
            'last_name': 'Greene',
            'phone': '+1 (917) 555-0203',
            'specialty': 'Economics'
        },
        {
            'username': 'li.chen',
            'email': 'li.chen@stansfield.edu',
            'first_name': 'Li',
            'last_name': 'Chen',
            'phone': '+1 (917) 555-0204',
            'specialty': 'Mathematics'
        }
    ]
    
    created_tutors = []
    for tutor_data in tutors_data:
        specialty = tutor_data.pop('specialty')
        tutor, created = User.objects.get_or_create(
            username=tutor_data['username'],
            defaults={**tutor_data, 'role': 'TUTOR'}
        )
        if created:
            tutor.set_password('tutor123')
            tutor.save()
            print(f"   ✅ Tuteur {tutor.get_full_name()} ({specialty}) créé")
        else:
            print(f"   ℹ️  Tuteur {tutor.get_full_name()} ({specialty}) déjà existant")
        created_tutors.append(tutor)
    
    return admin, student, created_tutors


def create_services():
    """Créer les types de service"""
    print("\n⭐ Création des services...")
    
    # ATTENTION : Utiliser les VRAIS champs du modèle Service
    # Champs disponibles : name, description, price, correction_type, turnaround_hours, is_active
    
    services_data = [
        {
            'name': 'Standard',
            'description': 'Correction standard avec feedback détaillé (7 jours)',
            'price': Decimal('0.00'),
            'correction_type': 'standard',  # minuscule comme dans le modèle
            'turnaround_hours': 168,  # 7 jours = 168 heures
            'is_active': True
        },
        {
            'name': 'Premium',
            'description': 'Correction prioritaire avec feedback approfondi et recommandations personnalisées (48 heures)',
            'price': Decimal('29.99'),
            'correction_type': 'premium',  # minuscule comme dans le modèle
            'turnaround_hours': 48,  # 2 jours = 48 heures
            'is_active': True
        }
    ]
    
    created_services = []
    for service_data in services_data:
        service, created = Service.objects.get_or_create(
            name=service_data['name'],
            defaults=service_data
        )
        if created:
            hours = service.turnaround_hours
            days = hours // 24
            print(f"   ✅ Service {service.name} créé (${service.price}, {days} jours)")
        else:
            print(f"   ℹ️  Service {service.name} déjà existant")
        created_services.append(service)
    
    return created_services


def create_subjects_and_courses():
    """Créer les matières et cours"""
    print("\n📚 Création des matières et cours...")
    
    subjects_data = [
        {'name': 'Chemistry', 'icon': '🧪'},
        {'name': 'English Literature', 'icon': '📚'},
        {'name': 'Economics', 'icon': '📊'},
        {'name': 'History', 'icon': '🏛️'},
        {'name': 'Mathematics', 'icon': '🔢'},
    ]
    
    created_subjects = []
    for subject_data in subjects_data:
        subject, created = Subject.objects.get_or_create(
            name=subject_data['name'],
            defaults={'icon': subject_data['icon']}
        )
        if created:
            print(f"   ✅ Matière {subject.name} créée")
        else:
            print(f"   ℹ️  Matière {subject.name} déjà existante")
        created_subjects.append(subject)
    
    # Créer des cours pour chaque matière
    created_courses = []
    for subject in created_subjects:
        course, created = Course.objects.get_or_create(
            name=f"{subject.name} - Spring 2025",
            subject=subject,
            defaults={
                'description': f"Course in {subject.name}",
                'start_date': datetime(2025, 1, 15).date(),
                'end_date': datetime(2025, 5, 15).date(),
                'status': 'active'
            }
        )
        if created:
            print(f"   ✅ Cours {course.name} créé")
        else:
            print(f"   ℹ️  Cours {course.name} déjà existant")
        created_courses.append(course)
    
    return created_subjects, created_courses


def assign_tutors(courses, tutors):
    """Assigner les tuteurs aux cours"""
    print("\n👨‍🎓 Assignation des tuteurs...")
    
    # Mapping tuteurs -> matières
    assignments = [
        (courses[0], tutors[0]),  # Chemistry -> Williams
        (courses[1], tutors[1]),  # English Literature -> Morrison
        (courses[2], tutors[2]),  # Economics -> Greene
        (courses[3], tutors[1]),  # History -> Morrison
        (courses[4], tutors[3]),  # Mathematics -> Chen
    ]
    
    for course, tutor in assignments:
        assignment, created = TutorAssignment.objects.get_or_create(
            course=course,
            tutor=tutor,
            defaults={'start_date': course.start_date}
        )
        if created:
            print(f"   ✅ {tutor.get_full_name()} assigné à {course.name}")
        else:
            print(f"   ℹ️  {tutor.get_full_name()} déjà assigné à {course.name}")


def create_assignments(student, courses, services):
    """Créer des devoirs de test"""
    print("\n📋 Création des devoirs...")
    
    standard_service = services[0]
    premium_service = services[1]
    
    assignments_data = [
        {
            'course': courses[0],  # CHEM 421
            'service': premium_service,
            'status': 'CORRECTED',
            'submitted_at': datetime.now() - timedelta(days=15),
            'file': 'assignments/chem421_assignment3.pdf'
        },
        {
            'course': courses[1],  # ENG 301
            'service': standard_service,
            'status': 'IN_PROGRESS',
            'submitted_at': datetime.now() - timedelta(days=2),
            'file': 'assignments/eng301_essay.pdf'
        },
        {
            'course': courses[2],  # ECON 201
            'service': standard_service,
            'status': 'CORRECTED',
            'submitted_at': datetime.now() - timedelta(days=25),
            'file': 'assignments/econ201_analysis.pdf'
        },
        {
            'course': courses[3],  # HIST 201
            'service': premium_service,
            'status': 'PENDING',
            'submitted_at': datetime.now() - timedelta(days=30),
            'file': 'assignments/hist201_research.pdf'
        },
        {
            'course': courses[4],  # MATH 301
            'service': standard_service,
            'status': 'CORRECTED',
            'submitted_at': datetime.now() - timedelta(days=40),
            'file': 'assignments/math301_homework.pdf'
        },
    ]
    
    created_assignments = []
    for i, assignment_data in enumerate(assignments_data, 1):
        assignment, created = Assignment.objects.get_or_create(
            student=student,
            course=assignment_data['course'],
            submitted_at=assignment_data['submitted_at'],
            defaults={
                'service': assignment_data['service'],
                'status': assignment_data['status'],
                'file': assignment_data['file']
            }
        )
        if created:
            print(f"   ✅ Devoir {i}: {assignment.course.name} - {assignment.status}")
        else:
            print(f"   ℹ️  Devoir {i}: {assignment.course.name} déjà existant")
        created_assignments.append(assignment)
    
    return created_assignments


def create_corrections(assignments, tutors):
    """Créer des corrections pour les devoirs corrigés"""
    print("\n✏️ Création des corrections...")
    
    corrections_data = [
        {
            'assignment': assignments[0],  # CHEM 421
            'tutor': tutors[0],  # Williams
            'comment': "Excellent analytical work. The GC-MS methodology is well mastered and the results are clearly presented. A few areas to improve regarding metabolite interpretation.",
            'grade': 17.0,
            'status': 'COMPLETED',
            'corrected_at': datetime.now() - timedelta(days=13),
            'closed_at': datetime.now() - timedelta(days=13)
        },
        {
            'assignment': assignments[2],  # ECON 201
            'tutor': tutors[2],  # Greene
            'comment': "Good understanding of microeconomic concepts. However, the supply-demand analysis could be more detailed. The graphs are clear but lack proper citations.",
            'grade': 12.0,
            'status': 'COMPLETED',
            'corrected_at': datetime.now() - timedelta(days=20),
            'closed_at': datetime.now() - timedelta(days=20)
        },
        {
            'assignment': assignments[4],  # MATH 301
            'tutor': tutors[3],  # Chen
            'comment': "Very rigorous mathematical approach. Matrix operations are correctly executed. Minor calculation error in problem 5.",
            'grade': 16.0,
            'status': 'COMPLETED',
            'corrected_at': datetime.now() - timedelta(days=35),
            'closed_at': datetime.now() - timedelta(days=35)
        }
    ]
    
    for correction_data in corrections_data:
        correction, created = Correction.objects.get_or_create(
            assignment=correction_data['assignment'],
            defaults=correction_data
        )
        if created:
            print(f"   ✅ Correction pour {correction.assignment.course.name} - Note: {correction.grade}/20")
        else:
            print(f"   ℹ️  Correction pour {correction.assignment.course.name} déjà existante")


def main():
    print("=" * 60)
    print("🚀 PEUPLEMENT DE LA BASE DE DONNÉES COURSE CORRECT")
    print("=" * 60)
    
    # 1. Créer les utilisateurs
    admin, student, tutors = create_users()
    
    # 2. Créer les services
    services = create_services()
    
    # 3. Créer matières et cours
    subjects, courses = create_subjects_and_courses()
    
    # 4. Assigner les tuteurs
    assign_tutors(courses, tutors)
    
    # 5. Créer des devoirs
    assignments = create_assignments(student, courses, services)
    
    # 6. Créer des corrections
    create_corrections(assignments, tutors)
    
    print("\n" + "=" * 60)
    print("✅ BASE DE DONNÉES PEUPLÉE AVEC SUCCÈS !")
    print("=" * 60)
    print("\n📊 RÉCAPITULATIF:")
    print(f"   • Utilisateurs : {User.objects.count()}")
    print(f"   • Services : {Service.objects.count()}")
    print(f"   • Matières : {Subject.objects.count()}")
    print(f"   • Cours : {Course.objects.count()}")
    print(f"   • Devoirs : {Assignment.objects.count()}")
    print(f"   • Corrections : {Correction.objects.count()}")
    print("\n🔐 IDENTIFIANTS DE TEST:")
    print("   Admin      : admin / admin123")
    print("   Étudiant   : alex.morgan / student123")
    print("   Tuteur     : james.williams / tutor123")
    print("=" * 60)


if __name__ == '__main__':
    main()
