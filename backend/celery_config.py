"""
Celery Beat Configuration for Automated Scheduled Tasks

This module configures the Celery Beat scheduler to run:
1. Low Stock Reminder - Daily at 8:00 AM
2. Dynamic Pricing Adjustments - Daily at 6:00 AM
3. Weekly Sales Report - Every Sunday at 9:00 PM
"""

import os
from celery.schedules import crontab
from datetime import timedelta

# Get admin email from environment
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@invex.local')

# Celery configuration for beat scheduler
class CeleryConfig:
    # Broker and backend configuration
    broker_url = 'redis://localhost:6379/0'  # or use environment variable
    result_backend = 'redis://localhost:6379/0'
    
    # Enable timezone support
    enable_utc = True
    timezone = 'UTC'
    
    # Celery Beat scheduler configuration
    beat_schedule = {
        'generate-low-stock-reminder': {
            'task': 'tasks.generate_restock_reminder',
            'schedule': crontab(hour=8, minute=0),  # Daily at 8:00 AM UTC
            'args': (),
            'kwargs': {},
            'options': {
                'expires': 3600,  # Task expires after 1 hour if not executed
            }
        },
        'adjust-prices-daily': {
            'task': 'tasks.adjust_prices_daily',
            'schedule': crontab(hour=6, minute=0),  # Daily at 6:00 AM UTC
            'args': (),
            'kwargs': {},
            'options': {
                'expires': 3600,
            }
        },
        'send-weekly-report': {
            'task': 'tasks.send_weekly_report',
            'schedule': crontab(day_of_week=6, hour=21, minute=0),  # Sunday at 9:00 PM UTC
            # day_of_week: 0=Monday, 6=Sunday
            'args': (),
            'kwargs': {
                'user_email': ADMIN_EMAIL,
                'user_id': None,  # None means fetch all users/all data
            },
            'options': {
                'expires': 86400,  # Task expires after 24 hours
            }
        },
    }
    
    # Task serialization settings
    task_serializer = 'json'
    accept_content = ['json']
    result_serializer = 'json'
    
    # Task execution settings
    task_acks_late = True  # Task is marked as processed after execution
    task_reject_on_worker_lost = True
    
    # Worker settings
    worker_prefetch_multiplier = 1
    worker_max_tasks_per_child = 1000
