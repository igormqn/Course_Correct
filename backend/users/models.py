from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    STUDENT = 'student'
    TUTOR   = 'tutor'
    ADMIN   = 'admin'
    ROLE_CHOICES = [
        (STUDENT, 'Student'),
        (TUTOR,   'Tutor'),
        (ADMIN,   'Administrator'),
    ]
    role  = models.CharField(max_length=20, choices=ROLE_CHOICES, default=STUDENT)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        # On affiche l'email en premier pour qu'il soit bien visible partout
        return f"{self.email} ({self.first_name} {self.last_name})"