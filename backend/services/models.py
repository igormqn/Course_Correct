from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Service(models.Model):
    """
    Model representing an assignment correction service.
    
    Two types of services:
    - Standard: Free, 7-day turnaround
    - Premium: Paid, 48h turnaround with priority correction
    """
    
    # Constants for correction types
    PREMIUM = 'premium'
    STANDARD = 'standard'
    
    TYPE_CHOICES = [
        (STANDARD, 'Standard'),
        (PREMIUM, 'Premium'),
    ]
    
    # Fields
    name = models.CharField(
        max_length=100,
        verbose_name="Service Name",
        help_text="Name of the correction service"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Description",
        help_text="Detailed description of the service"
    )
    
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Price",
        help_text="Price of the service in dollars ($)"
    )
    
    correction_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=STANDARD,
        verbose_name="Correction Type",
        help_text="Type of service: Standard (free) or Premium (paid)"
    )
    
    turnaround_hours = models.IntegerField(
        default=72,
        validators=[MinValueValidator(1)],
        verbose_name="Turnaround (hours)",
        help_text="Correction turnaround time in hours"
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active",
        help_text="Is the service available?"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Creation Date"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Last Updated"
    )
    
    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"
        ordering = ['price']  # Sort by price (Standard first)
    
    def __str__(self):
        return f"{self.name} — ${self.price}"
    
    @property
    def is_premium(self):
        """Returns True if the service is Premium"""
        return self.correction_type == self.PREMIUM
    
    @property
    def turnaround_days(self):
        """Returns the turnaround time in days (rounded)"""
        return self.turnaround_hours // 24
    
    def get_turnaround_display(self):
        """Returns a formatted display of the turnaround time"""
        days = self.turnaround_days
        if days == 0:
            return f"{self.turnaround_hours}h"
        elif days == 1:
            return "24h"
        else:
            return f"{days} days"