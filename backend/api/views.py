from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone

from users.models import User
from services.models import Service
from courses.models import Subject, Course
from assignments.models import Assignment
from corrections.models import Correction

from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    ServiceSerializer,
    SubjectSerializer,
    CourseSerializer,
    AssignmentSerializer,
    CorrectionSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les utilisateurs.
    - list : Liste tous les utilisateurs
    - create : Créer un nouvel utilisateur
    - retrieve : Obtenir les détails d'un utilisateur
    - update : Mettre à jour un utilisateur
    - destroy : Supprimer un utilisateur
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtenir les infos de l'utilisateur connecté"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def get_queryset(self):
        # Les utilisateurs ne peuvent voir que leur propre profil, sauf s'ils sont admin
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les services (lecture seule).
    - list : Liste tous les services
    - retrieve : Obtenir les détails d'un service
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les matières (lecture seule).
    - list : Liste toutes les matières
    - retrieve : Obtenir les détails d'une matière
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les cours (lecture seule).
    - list : Liste tous les cours
    - retrieve : Obtenir les détails d'un cours
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class AssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les devoirs.
    - list : Liste les devoirs (selon le rôle)
    - create : Créer un devoir
    - retrieve : Obtenir les détails d'un devoir
    - update : Mettre à jour un devoir
    - destroy : Supprimer un devoir
    - my_assignments : Mes devoirs (pour les étudiants)
    - to_correct : Devoirs à corriger (pour les tuteurs)
    - update_status : Changer le statut d'un devoir
    """
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Assignment.objects.filter(student=user)
        elif user.role == 'tutor':
            return Assignment.objects.filter(course__tutor_assignments__tutor=user)
        else:  # admin
            return Assignment.objects.all()

    def perform_create(self, serializer):
        """L'utilisateur connecté devient automatiquement l'étudiant"""
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        """Obtenir les devoirs de l'étudiant connecté"""
        if request.user.role != 'student':
            return Response(
                {'error': 'Seuls les étudiants peuvent accéder à leurs devoirs'},
                status=status.HTTP_403_FORBIDDEN
            )
        assignments = Assignment.objects.filter(student=request.user)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def to_correct(self, request):
        """Obtenir les devoirs à corriger (tuteur)"""
        if request.user.role != 'tutor':
            return Response(
                {'error': 'Seuls les tuteurs peuvent corriger les devoirs'},
                status=status.HTTP_403_FORBIDDEN
            )
        # Les devoirs assignés au tuteur via les cours
        assignments = Assignment.objects.filter(
            course__tutor_assignments__tutor=request.user,
            status=Assignment.SUBMITTED
        )
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Changer le statut d'un devoir"""
        assignment = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Assignment.STATUS_CHOICES):
            return Response(
                {'error': 'Statut invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment.status = new_status
        assignment.save()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)


class CorrectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les corrections.
    - list : Liste toutes les corrections
    - create : Créer une correction
    - retrieve : Obtenir les détails d'une correction
    - update : Mettre à jour une correction
    - destroy : Supprimer une correction
    - complete : Marquer une correction comme terminée
    """
    queryset = Correction.objects.all()
    serializer_class = CorrectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'tutor':
            return Correction.objects.filter(tutor=user)
        elif user.role == 'student':
            return Correction.objects.filter(assignment__student=user)
        else:  # admin
            return Correction.objects.all()

    def perform_create(self, serializer):
        """Le tuteur connecté devient automatiquement le correcteur"""
        serializer.save(tutor=self.request.user)

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        """Marquer une correction comme terminée"""
        correction = self.get_object()
        correction.close()
        serializer = self.get_serializer(correction)
        return Response(serializer.data)
