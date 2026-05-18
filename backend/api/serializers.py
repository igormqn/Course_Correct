from rest_framework import serializers
from django.contrib.auth import get_user_model
from courses.models import Subject, Course, TutorAssignment
from assignments.models import Assignment
from corrections.models import Correction
from services.models import Service

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active']
        read_only_fields = ['id']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone']

    def validate_role(self, value):
        return value.upper()

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', User.STUDENT),
            phone=validated_data.get('phone', '')
        )


class ServiceSerializer(serializers.ModelSerializer):
    is_premium = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price', 'correction_type',
                  'is_premium', 'turnaround_hours']

    def get_is_premium(self, obj):
        return obj.is_premium


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'code', 'name', 'icon']


class TutorAssignmentSerializer(serializers.ModelSerializer):
    tutor = UserSerializer(read_only=True)

    class Meta:
        model = TutorAssignment
        fields = ['id', 'tutor', 'start_date', 'end_date']


class CourseSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    tutor_assignments = TutorAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'subject', 'semester',
                  'start_date', 'end_date', 'status', 'tutor_assignments']


class AssignmentSerializer(serializers.ModelSerializer):
    course   = CourseSerializer(read_only=True)
    service  = ServiceSerializer(read_only=True)
    student  = UserSerializer(read_only=True)
    # Frontend posts course_id and service_id as integers
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), write_only=True, source='course'
    )
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), write_only=True, source='service',
        required=False, allow_null=True
    )

    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'course_id', 'service', 'service_id',
            'student', 'file', 'status', 'submitted_at', 'updated_at',
            'payment_method', 'payment_status', 'stripe_payment_intent_id',
        ]
        read_only_fields = ['student', 'submitted_at', 'updated_at', 'payment_status']


class CorrectionSerializer(serializers.ModelSerializer):
    assignment    = AssignmentSerializer(read_only=True)
    tutor         = UserSerializer(read_only=True)
    assignment_id = serializers.PrimaryKeyRelatedField(
        queryset=Assignment.objects.all(), write_only=True, source='assignment'
    )

    class Meta:
        model = Correction
        fields = ['id', 'assignment', 'assignment_id', 'tutor', 'comments',
                  'suggestions', 'grade', 'status', 'corrected_at', 'closed_at']
        read_only_fields = ['tutor', 'corrected_at', 'closed_at']
