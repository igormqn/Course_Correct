from django.db import models
from django.conf import settings

class Assignment(models.Model):
    SUBMITTED   = 'submitted'
    IN_PROGRESS = 'in_progress'
    GRADED      = 'graded'
    STATUS_CHOICES = [
        (SUBMITTED,   'Submitted'),
        (IN_PROGRESS, 'In Progress'),
        (GRADED,      'Graded'),
    ]

    student      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments')
    course       = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='assignments')
    service      = models.ForeignKey('services.Service', on_delete=models.SET_NULL, null=True, related_name='assignments')
    file         = models.FileField(upload_to='assignments/%Y/%m/')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default=SUBMITTED)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} — {self.course} ({self.status})"

    @property
    def can_be_edited(self):
        return self.status == self.SUBMITTED