# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    UserViewSet,
    ServiceViewSet,
    SubjectViewSet,
    CourseViewSet,
    AssignmentViewSet,
    CorrectionViewSet,
)

# Créer le router
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'corrections', CorrectionViewSet, basename='correction')

urlpatterns = [
    # Authentification JWT
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Routes du router
    path('', include(router.urls)),
]