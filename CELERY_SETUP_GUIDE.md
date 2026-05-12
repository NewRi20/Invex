# Celery Beat Automation Setup Guide

## Overview

This guide explains the Celery Beat configuration for automating three critical business tasks:

1. **Low Stock Reminder** - Daily at 8:00 AM UTC
2. **Dynamic Pricing Adjustments** - Daily at 6:00 AM UTC  
3. **Weekly Sales Report with Profit Calculation** - Every Sunday at 9:00 PM UTC

## Prerequisites

### Required Packages
Ensure these are in your `requirements.txt`:
```
celery==5.6.2
redis==5.0.0  # or your preferred message broker
flower==2.0.1  # Optional: for monitoring Celery tasks
```

### Message Broker
You need a message broker for Celery. The configuration defaults to **Redis**:

**Option 1: Local Redis (Development)**
```bash
# Install Redis on Windows using WSL or Docker
# Or use the pre-built Windows binary from https://github.com/microsoftarchive/redis/releases

# Start Redis server
redis-server
# Server runs on localhost:6379
```

**Option 2: Docker Compose**
```bash
# Create docker-compose.yml with Redis
docker-compose up -d redis
```

**Option 3: Cloud Redis (Production)**
- Use Redis Cloud, AWS ElastiCache, or Heroku Redis
- Update `CELERY_BROKER_URL` in `.env`

## Environment Variables Setup

Add these to your `.env` file:

```env
# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email Configuration (for notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use Google App Password, not regular password

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Admin email for reports
ADMIN_EMAIL=admin@yourbusiness.com

# Low Stock Settings
LOW_STOCK_THRESHOLD=10

# Discord (Optional)
DISCORD_WEBHOOK_URL=your-discord-webhook-url  # Optional
```

## Running the System

### 1. Start Flask Backend
```bash
cd backend
python app.py
```

### 2. Start Celery Worker (Terminal 1)
```bash
cd backend
celery -A services.tasks.core worker --loglevel=info --pool=solo
```

### 3. Start Celery Beat Scheduler (Terminal 2)
```bash
cd backend
celery -A services.tasks.core beat --loglevel=info
```

### 4. Monitor Tasks (Optional - Terminal 3)
```bash
cd backend
flower -A services.tasks.core --port=5555
# Access Flower UI at http://localhost:5555
```

## Complete Startup Script

Create `start_celery.sh` (Linux/Mac) or `start_celery.bat` (Windows):

### Linux/Mac: `start_celery.sh`
```bash
#!/bin/bash

# Start Redis (if using local)
redis-server &
sleep 2

# Start Celery Worker
celery -A services.tasks.core worker --loglevel=info &
WORKER_PID=$!

# Start Celery Beat
celery -A services.tasks.core beat --loglevel=info &
BEAT_PID=$!

# Start Flower (optional)
flower -A services.tasks.core --port=5555 &
FLOWER_PID=$!

echo "Celery Worker PID: $WORKER_PID"
echo "Celery Beat PID: $BEAT_PID"
echo "Flower UI PID: $FLOWER_PID"

# Trap to kill all processes on exit
trap "kill $WORKER_PID $BEAT_PID $FLOWER_PID" EXIT

wait
```

### Windows: `start_celery.bat`
```batch
@echo off
cd backend

echo Starting Celery Worker...
start cmd /k "celery -A services.tasks.core worker --loglevel=info"

echo Starting Celery Beat...
start cmd /k "celery -A services.tasks.core beat --loglevel=info"

echo Starting Flower (optional)...
start cmd /k "flower -A services.tasks.core --port=5555"

echo.
echo All services started!
echo - Worker: Running
echo - Beat Scheduler: Running
echo - Flower UI: http://localhost:5555
```

## Scheduled Tasks Reference

### Low Stock Reminder
- **Schedule**: Daily at 8:00 AM UTC
- **Task**: `tasks.generate_restock_reminder`
- **Function**: Checks inventory for items below threshold, sends email alerts
- **Configuration**: Edit `LOW_STOCK_THRESHOLD` in `.env` (default: 10)

### Dynamic Pricing Adjustments
- **Schedule**: Daily at 6:00 AM UTC
- **Task**: `tasks.adjust_prices_daily`
- **Logic**:
  - Items inactive for 60+ days: 10% discount
  - Low stock (≤5 units) with high demand (≥10 sales/week): 5% price increase
  - Cooldown: Won't adjust same item more than once per 7 days

### Weekly Sales Report
- **Schedule**: Every Sunday at 9:00 PM UTC
- **Task**: `tasks.send_weekly_report`
- **Report Includes**:
  - Total Revenue
  - Total Cost
  - Total Profit
  - Profit Margin %
  - Item-by-item breakdown
  - PDF attachment via email

## Database Migration

The `cost` column was added to the `item` table for profit calculations. To apply this migration:

```bash
cd backend
python migrate_add_cost_column.py
```

This script will:
1. Check if the `cost` column exists
2. If missing, provide SQL instructions
3. Optionally set default cost values for existing items

## Verifying Tasks Are Working

### Manual Task Trigger (for testing)
```python
from services.tasks.core import celery
from services.tasks.inventory import generate_restock_reminder
from services.tasks.pricing import adjust_prices_daily
from services.tasks.sales_report import send_weekly_report

# Test low stock reminder
result = generate_restock_reminder.delay(user_email='test@example.com')
print(result.get())  # Wait for result

# Test pricing adjustment
result = adjust_prices_daily.delay()
print(result.get())

# Test report generation
result = send_weekly_report.delay(user_email='admin@example.com')
print(result.get())
```

### Check Celery Beat Schedule
In the Beat terminal, you should see:
```
[2026-05-12 08:00:00,000: INFO/MainProcess] Scheduler: Sending due task generate-low-stock-reminder
[2026-05-12 06:00:00,000: INFO/MainProcess] Scheduler: Sending due task adjust-prices-daily
[2026-05-13 21:00:00,000: INFO/MainProcess] Scheduler: Sending due task send-weekly-report
```

### Monitor via Flower UI
Access `http://localhost:5555` to see:
- Active tasks
- Task history
- Success/failure rates
- Worker status
- Celery Beat schedule

## Customizing Schedule Times

Edit the `beat_schedule` in `backend/celery_config.py`:

```python
from celery.schedules import crontab

beat_schedule = {
    'generate-low-stock-reminder': {
        'task': 'tasks.generate_restock_reminder',
        'schedule': crontab(hour=8, minute=0),  # 8:00 AM daily
    },
    'adjust-prices-daily': {
        'task': 'tasks.adjust_prices_daily',
        'schedule': crontab(hour=6, minute=0),  # 6:00 AM daily
    },
    'send-weekly-report': {
        'task': 'tasks.send_weekly_report',
        'schedule': crontab(day_of_week=6, hour=21, minute=0),  # Sunday 9:00 PM
        # day_of_week: 0=Monday, 6=Sunday
    },
}
```

### Crontab Examples
```python
# Every hour
crontab(minute=0)

# Every 15 minutes
crontab(minute='*/15')

# 2:30 AM daily
crontab(hour=2, minute=30)

# Every Monday at 9 AM
crontab(day_of_week=0, hour=9, minute=0)

# Every Sunday at 6 PM
crontab(day_of_week=6, hour=18, minute=0)

# Twice daily (6 AM and 6 PM)
crontab(hour='6,18', minute=0)
```

## Troubleshooting

### Issue: "Connection refused" for Redis
```
Error: Error connecting to the server
```
**Solution**: 
- Ensure Redis is running: `redis-cli ping` (should return "PONG")
- Or use Docker: `docker run -d -p 6379:6379 redis`

### Issue: Tasks not running
**Check**:
1. Is Celery Beat running? (check terminal for schedule messages)
2. Is Celery Worker running? (check for task acceptance logs)
3. Is Redis running? (test with `redis-cli`)
4. Check logs in Worker terminal for errors

### Issue: "ModuleNotFoundError: No module named 'tasks'"
**Solution**: Ensure you're running from the `backend` directory:
```bash
cd backend
celery -A services.tasks.core beat --loglevel=info
```

### Issue: Tasks execute but emails don't send
**Check**:
1. `SMTP_EMAIL` and `SMTP_PASSWORD` are set in `.env`
2. For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
3. Check Worker logs for SMTP errors
4. Test email manually:
```python
from services.tasks.inventory import send_restock_email
send_restock_email('test@example.com', 'Test body', 5)
```

## Production Deployment

### Docker Setup
```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
ENV PYTHONUNBUFFERED=1

# Run Celery Worker
CMD ["celery", "-A", "services.tasks.core", "worker", "--loglevel=info"]
```

Run with Docker Compose:
```yaml
version: '3.8'
services:
  redis:
    image: redis:latest
    ports:
      - "6379:6379"
  
  celery-worker:
    build: ./backend
    command: celery -A services.tasks.core worker --loglevel=info
    depends_on:
      - redis
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
  
  celery-beat:
    build: ./backend
    command: celery -A services.tasks.core beat --loglevel=info
    depends_on:
      - redis
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
```

### Systemd Service (Linux Production)

Create `/etc/systemd/system/celery-worker.service`:
```ini
[Unit]
Description=Celery Worker
After=network.target

[Service]
Type=forking
User=celery
Group=celery
WorkingDirectory=/app/backend
ExecStart=/app/backend/venv/bin/celery -A services.tasks.core worker \
  --loglevel=info --logfile=/var/log/celery/worker.log --pidfile=/var/run/celery/worker.pid

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable celery-worker
sudo systemctl start celery-worker
sudo systemctl status celery-worker
```

## Summary

✓ Celery Beat is now configured to automate your three critical tasks  
✓ Database schema updated with `cost` column for profit tracking  
✓ Sales reports now include profit calculations  
✓ All tasks are schedulable and can be monitored

Your automation infrastructure is ready to keep your inventory, pricing, and reporting in sync without manual intervention!
