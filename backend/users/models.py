from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    STUDENT = 'STUDENT'
    TUTOR   = 'TUTOR'
    ADMIN   = 'ADMIN'
    ROLE_CHOICES = [
        (STUDENT, 'Student'),
        (TUTOR,   'Tutor'),
        (ADMIN,   'Administrator'),
    ]
    role  = models.CharField(max_length=20, choices=ROLE_CHOICES, default=STUDENT)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.email} ({self.first_name} {self.last_name})"
