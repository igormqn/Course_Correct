from django.db import models
from django.conf import settings

class Correction(models.Model):
    OPEN   = 'open'
    CLOSED = 'closed'
    STATUS_CHOICES = [
        (OPEN,   'Open'),
        (CLOSED, 'Closed'),
    ]

    assignment   = models.OneToOneField('assignments.Assignment', on_delete=models.CASCADE, related_name='correction')
    tutor        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='corrections')
    comment      = models.TextField(blank=True)
    grade        = models.FloatField(null=True, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default=OPEN)
    corrected_at = models.DateTimeField(auto_now_add=True)
    closed_at    = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Correction #{self.pk} — {self.assignment}"

    def close(self):
        from django.utils import timezone
        self.status    = self.CLOSED
        self.closed_at = timezone.now()
        self.assignment.status = 'graded'
        self.assignment.save()
        self.save()