from django.db import models

class Subject(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    ACTIVE   = 'active'
    UPCOMING = 'upcoming'
    PAST     = 'past'
    STATUS_CHOICES = [
        (ACTIVE,   'Active'),
        (UPCOMING, 'Upcoming'),
        (PAST,     'Past'),
    ]

    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject     = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='courses')
    start_date  = models.DateField()
    end_date    = models.DateField()
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default=UPCOMING)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TutorAssignment(models.Model):
    tutor      = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='tutor_courses')
    course     = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tutor_assignments')
    start_date = models.DateField()
    end_date   = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.tutor} → {self.course}"