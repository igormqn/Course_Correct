from rest_framework import serializers
from django.contrib.auth import get_user_model
from courses.models import Subject, Course, TutorAssignment
from assignments.models import Assignment
from corrections.models import Correction
from services.models import Service

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']
        read_only_fields = ['id']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'utilisateurs (avec mot de passe)"""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'student'),
            phone=validated_data.get('phone', '')
        )
        return user


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer pour les services"""
    
    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price', 'correction_type']


class SubjectSerializer(serializers.ModelSerializer):
    """Serializer pour les matières"""
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'icon']


class TutorAssignmentSerializer(serializers.ModelSerializer):
    """Serializer pour les assignations de tuteurs"""
    tutor = UserSerializer(read_only=True)
    
    class Meta:
        model = TutorAssignment
        fields = ['id', 'tutor', 'start_date', 'end_date']


class CourseSerializer(serializers.ModelSerializer):
    """Serializer pour les cours"""
    subject = SubjectSerializer(read_only=True)
    tutor_assignments = TutorAssignmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'subject', 'start_date', 'end_date', 'status', 'tutor_assignments']


class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer pour les devoirs"""
    course = CourseSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        write_only=True,
        source='course'
    )
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        write_only=True,
        source='service',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Assignment
        fields = ['id', 'course', 'course_id', 'service', 'service_id', 'student', 'file', 
                  'status', 'submitted_at', 'updated_at']
        read_only_fields = ['student', 'submitted_at', 'updated_at']


class CorrectionSerializer(serializers.ModelSerializer):
    """Serializer pour les corrections"""
    assignment = AssignmentSerializer(read_only=True)
    tutor = UserSerializer(read_only=True)
    assignment_id = serializers.PrimaryKeyRelatedField(
        queryset=Assignment.objects.all(),
        write_only=True,
        source='assignment'
    )
    
    class Meta:
        model = Correction
        fields = ['id', 'assignment', 'assignment_id', 'tutor', 'comment', 'grade', 
                  'status', 'corrected_at', 'closed_at']
        read_only_fields = ['tutor', 'corrected_at', 'closed_at']