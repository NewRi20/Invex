import os
import sys
from dotenv import load_dotenv
from celery import Celery

# Add parent directory to path to import supabase_client
# This assumes this file is in backend/services/tasks/
current_dir = os.path.dirname(os.path.abspath(__file__))
services_dir = os.path.dirname(current_dir)
backend_dir = os.path.dirname(services_dir)

if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Explicitly load .env from backend directory to ensure updates are picked up
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path, override=True)

try:
    from supabase_client import supabase
except ImportError:
    # Fallback if running from root relative to module
    try:
        from backend.supabase_client import supabase
    except ImportError:
         print("Warning: Could not import supabase_client. Ensure it is in the python path.")
         supabase = None

# Initialize Celery
# Broker URL should ideally come from environment variables
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')
celery = Celery('tasks', broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)
