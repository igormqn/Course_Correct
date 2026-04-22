from django.contrib import admin
from .models import Subject, Course, TutorAssignment

class TutorAssignmentInline(admin.TabularInline):
    model = TutorAssignment
    extra = 1

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'subject')
    inlines = [TutorAssignmentInline]