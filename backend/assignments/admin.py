from django.contrib import admin
from .models import Assignment

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'service', 'status', 'submitted_at')
    list_filter = ('status', 'course', 'service')
    search_fields = ('student__username', 'course__name')