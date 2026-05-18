from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model

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
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.role == User.ADMIN:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.STUDENT:
            return Assignment.objects.filter(student=user)
        elif user.role == User.TUTOR:
            return Assignment.objects.filter(
                course__tutor_assignments__tutor=user
            )
        return Assignment.objects.all()

    def perform_create(self, serializer):
        method = self.request.data.get('payment_method')
        if method == Assignment.STRIPE:
            pay_status = Assignment.PAID
        elif method == Assignment.CASH:
            pay_status = Assignment.PENDING_CASH
        else:
            pay_status = Assignment.UNPAID
        serializer.save(student=self.request.user, payment_status=pay_status)

    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        if request.user.role != User.STUDENT:
            return Response(
                {'error': 'Only students can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        assignments = Assignment.objects.filter(student=request.user)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def to_correct(self, request):
        if request.user.role != User.TUTOR:
            return Response(
                {'error': 'Only tutors can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        assignments = Assignment.objects.filter(
            course__tutor_assignments__tutor=request.user,
            status__in=[Assignment.PENDING, Assignment.IN_PROGRESS]
        )
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        assignment = self.get_object()
        new_status = request.data.get('status')
        valid = dict(Assignment.STATUS_CHOICES).keys()
        if new_status not in valid:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        assignment.status = new_status
        assignment.save()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)


class CorrectionViewSet(viewsets.ModelViewSet):
    serializer_class = CorrectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.TUTOR:
            return Correction.objects.filter(tutor=user)
        elif user.role == User.STUDENT:
            return Correction.objects.filter(assignment__student=user)
        return Correction.objects.all()

    def perform_create(self, serializer):
        serializer.save(tutor=self.request.user)

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        correction = self.get_object()
        correction.close()
        serializer = self.get_serializer(correction)
        return Response(serializer.data)


