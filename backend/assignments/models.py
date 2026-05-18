from django.db import models
from django.conf import settings

class Assignment(models.Model):
    # Correction status
    PENDING     = 'PENDING'
    IN_PROGRESS = 'IN_PROGRESS'
    CORRECTED   = 'CORRECTED'
    STATUS_CHOICES = [
        (PENDING,     'Pending'),
        (IN_PROGRESS, 'In Progress'),
        (CORRECTED,   'Corrected'),
    ]

    # Payment method
    STRIPE = 'stripe'
    CASH   = 'cash'
    PAYMENT_METHOD_CHOICES = [
        (STRIPE, 'Card (Stripe)'),
        (CASH,   'Cash on Delivery'),
    ]

    # Payment status
    UNPAID       = 'UNPAID'
    PAID         = 'PAID'
    PENDING_CASH = 'PENDING_CASH'
    PAYMENT_STATUS_CHOICES = [
        (UNPAID,       'Unpaid'),
        (PAID,         'Paid'),
        (PENDING_CASH, 'Cash Pending'),
    ]

    student      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments')
    course       = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='assignments')
    service      = models.ForeignKey('services.Service', on_delete=models.SET_NULL, null=True, related_name='assignments')
    file         = models.FileField(upload_to='assignments/%Y/%m/')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    # Paiement
    payment_method           = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    payment_status           = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default=UNPAID)
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.student} — {self.course} ({self.status})"

    @property
    def can_be_edited(self):
        return self.status == self.PENDING
