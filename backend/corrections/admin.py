from django.contrib import admin
from .models import Correction

@admin.register(Correction)
class CorrectionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'tutor', 'grade', 'status', 'corrected_at')
    list_filter = ('status', 'tutor')
    search_fields = ('assignment__student__username', 'tutor__username')