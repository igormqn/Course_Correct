#!/usr/bin/env python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from api.serializers import CourseSerializer
from courses.models import Course
import json

try:
    courses = Course.objects.all()
    print(f'Nombre de cours: {courses.count()}')
    
    serializer = CourseSerializer(courses, many=True)
    
    # Afficher les données sérialisées
    data = serializer.data
    print(json.dumps(data, indent=2, default=str))
    
except Exception as e:
    import traceback
    print(f"Erreur: {e}")
    traceback.print_exc()
