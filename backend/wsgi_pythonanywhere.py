import sys
import os

# Remplace TON_USERNAME par ton nom d'utilisateur PythonAnywhere
username = os.environ.get('USER', 'TON_USERNAME')
path = f'/home/{username}/Course_Correct/backend'

if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
