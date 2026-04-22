from django.contrib import admin
from .models import Service

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'correction_type', 'turnaround_hours', 'is_active')
    list_filter = ('correction_type', 'is_active')
    search_fields = ('name',)