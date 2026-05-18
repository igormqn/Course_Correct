from django.db import models
from django.conf import settings

class Correction(models.Model):
    PENDING   = 'PENDING'
    COMPLETED = 'COMPLETED'
    STATUS_CHOICES = [
        (PENDING,   'Pending'),
        (COMPLETED, 'Completed'),
    ]

    assignment   = models.OneToOneField('assignments.Assignment', on_delete=models.CASCADE, related_name='correction')
    tutor        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='corrections')
    comments     = models.TextField(blank=True)
    suggestions  = models.TextField(blank=True)
    grade        = models.FloatField(null=True, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    corrected_at = models.DateTimeField(auto_now_add=True)
    closed_at    = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Correction #{self.pk} — {self.assignment}"

    def close(self):
        from django.utils import timezone
        from assignments.models import Assignment
        self.status    = self.COMPLETED
        self.closed_at = timezone.now()
        self.assignment.status = Assignment.CORRECTED
        self.assignment.save()
        self.save()
