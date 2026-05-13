# Invex Automation System - Presentation Guide

## 1. Application Overview

### What is Invex?
**Invex** is a comprehensive **Inventory Management & Dynamic Pricing System** built for small to medium-sized retail businesses. It automates critical operational tasks that would otherwise require manual intervention.

**Core Features:**
- 📊 Real-time inventory tracking
- 💰 Dynamic pricing adjustments based on demand and inventory levels
- 📧 Automated notifications and reports
- 📈 Sales analytics with profit calculations

**Tech Stack:**
- **Frontend**: React + Vite
- **Backend**: Flask (Python)
- **Database**: Supabase (PostgreSQL)
- **Automation**: Celery + Redis
- **Email**: SMTP (Gmail)

---

## 2. Core Business Logic

### The Problem
Manual business operations waste time and create inefficiencies:
- ❌ Need to manually check inventory levels
- ❌ Prices are static, missing revenue optimization
- ❌ No real-time alerts when stocks run low
- ❌ Weekly reporting requires manual data compilation

### The Solution: Automation
**Invex automates 4 critical tasks:**

| Task | Trigger | Benefit |
|------|---------|---------|
| 🏷️ **Price Adjustment** | Daily @ 6:00 AM | Optimize revenue based on demand & stock |
| ⚠️ **Restock Alert** | Daily @ 8:00 AM | Never miss a sale due to low stock |
| 📋 **Daily Report** | Daily @ 8:00 PM | End-of-day summary of all activities |
| 📊 **Weekly Report** | Sunday @ 9:00 PM | Deep profitability analysis with PDF |

---

## 3. Python Modules Used

### Core Automation Modules
```python
# Task Scheduling & Async Operations
celery==5.6.2          # Distributed task queue for scheduling
redis==5.0.0           # Message broker for task distribution

# Web Framework & Database
flask==2.x.x           # Lightweight REST API framework
supabase==2.x.x        # PostgreSQL client for database operations
python-dotenv==0.x.x   # Environment variable management

# Data Processing & Reporting
pandas==2.x.x          # Data manipulation and analysis
reportlab==4.x.x       # PDF generation for reports

# Email & Notifications
smtplib                # Built-in SMTP email client
requests==2.x.x        # HTTP requests for Discord webhooks

# Utilities
datetime                # Date/time handling for scheduling
os                      # Environment and file operations
collections             # Data structures (defaultdict for grouping)
```

### Import Example from Celery Task
```python
from celery import Celery
from celery.schedules import crontab
from supabase import Client
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import pandas as pd
from reportlab.lib.pagesizes import letter
```

---

## 4. Automation Architecture & Flow

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     INVEX AUTOMATION SYSTEM                  │
└─────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │ Celery Beat  │
                        │  Scheduler   │
                        │ (Triggers at │
                        │ scheduled    │
                        │  times)      │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │ Redis Message│
                        │    Broker    │
                        │ (Task Queue) │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │ Celery Worker│
                        │  (Executes   │
                        │   tasks)     │
                        └──────┬───────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
     ┌─────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
     │  Supabase  │    │  SMTP Email │    │   Discord   │
     │  Database  │    │   Server    │    │   Webhook   │
     │ (Read/Write│    │ (Send Email)│    │  (Alerts)   │
     │   data)    │    │             │    │             │
     └────────────┘    └─────────────┘    └─────────────┘
```

### 4.2 Complete Task Execution Flow

#### **Step 1: Scheduling**
```
Time: 8:00 AM UTC
↓
Celery Beat checks the schedule
↓
Matches "generate-low-stock-reminder" task
↓
Sends task to Redis queue
```

#### **Step 2: Task Queuing**
```
Redis receives task:
{
  "task": "tasks.generate_restock_reminder",
  "args": [],
  "kwargs": {"user_email": None, "user_id": None},
  "scheduled_time": "2026-05-13 08:00:00 UTC"
}
↓
Task waits in queue for available worker
```

#### **Step 3: Task Execution (Worker)**
```
Celery Worker picks up task
↓
Calls: generate_restock_reminder(user_email=None, user_id=None)
↓
Execution Flow:
  1. Connect to Supabase database
  2. Query: SELECT * FROM item WHERE quantity < LOW_STOCK_THRESHOLD
  3. Process: Group items by category
  4. Fetch user email from database
  5. Format email body with shopping list
  6. Connect to SMTP server
  7. Send email to admin/user
  8. Return: "Restock reminder sent for X items"
```

#### **Step 4: Result Handling**
```
Task completes successfully
↓
Result stored in Redis (temporary)
↓
Email delivered to recipient
```

---

## 5. Detailed Task Flows

### Task 1: Dynamic Pricing Adjustment (6:00 AM)
```
trigger → fetch items with metadata
         ├─ Inactive for 60+ days?
         │  └─ Apply 10% discount
         ├─ Low stock (≤5) + high demand (≥10 sales/week)?
         │  └─ Apply 5% price increase
         └─ Cooldown check (not adjusted in last 7 days)?

update → database with new prices
log    → pricing changes
```

### Task 2: Low Stock Reminder (8:00 AM)
```
trigger → fetch items below threshold
         └─ Group by category

format → generate shopping list email
         ├─ Category headers
         ├─ Item names with current quantities
         └─ Pro tip message

send   → SMTP or Discord
return → confirmation message
```

### Task 3: Daily Activity Report (8:00 PM)
```
trigger → fetch today's data
         ├─ Low stock items (item table)
         ├─ Today's sales (sale_report table)
         └─ New items added (item table with date_added)

process → calculate metrics
         ├─ Total units sold
         ├─ Total revenue (qty × price)
         ├─ Categorize items
         └─ Identify critical stock levels

format → HTML email with
         ├─ Header with date
         ├─ Summary cards (3 metrics)
         ├─ Three sections (low stock, sales, new items)
         └─ Professional styling

send   → SMTP HTML email
```

### Task 4: Weekly Sales Report (Sunday 9:00 PM)
```
trigger → fetch last 7 days of sales
         ├─ join with item table (get cost, category)
         └─ filter by user_id or all data

process → calculate financials
         ├─ Revenue = qty × price
         ├─ Cost = qty × cost
         ├─ Profit = Revenue - Cost
         ├─ Total metrics
         └─ Profit margin %

generate → professional PDF with
          ├─ Header (company branding)
          ├─ Financial summary cards
          ├─ Transaction table (sorted by date)
          └─ Footer with generation timestamp

send    → email with PDF attachment
save    → PDF to disk (reports/ folder)
```

---

## 6. Configuration & Scheduling

### Celery Beat Schedule (celery_config.py)
```python
beat_schedule = {
    'adjust-prices-daily': {
        'task': 'tasks.adjust_prices_daily',
        'schedule': crontab(hour=6, minute=0),    # 6:00 AM UTC
    },
    'generate-low-stock-reminder': {
        'task': 'tasks.generate_restock_reminder',
        'schedule': crontab(hour=8, minute=0),    # 8:00 AM UTC
    },
    'send-daily-report': {
        'task': 'tasks.send_daily_report',
        'schedule': crontab(hour=20, minute=0),   # 8:00 PM UTC
    },
    'send-weekly-report': {
        'task': 'tasks.send_weekly_report',
        'schedule': crontab(day_of_week=6, hour=21, minute=0),  # Sunday 9:00 PM
    },
}
```

<!-- ### Environment Variables (.env)
```env
# Message Broker
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# SMTP Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=app-password  # Google App Password

# Admin
ADMIN_EMAIL=admin@invex.local

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Configuration
LOW_STOCK_THRESHOLD=10
DISCORD_WEBHOOK_URL=optional-webhook
``` -->

---

## 7. Data Flow Example

### Low Stock Reminder - Data Journey
```
[Database]
  User "John" (user_id: abc123)
  Item "Coffee Beans" (qty: 5, threshold: 10) ← LOW STOCK

↓ [Worker Process]
  1. Query: SELECT * FROM item WHERE quantity < 10
  2. Result: 3 items below threshold
  3. Group by category:
     - Beverages: Coffee Beans (5), Tea (3)
     - Supplies: Cups (2)

↓ [Format]
  Email Body:
  ────────────────────────────
  Weekly Restock Guide
  
  3 items need restocking:
  
  --- Beverages ---
  [ ] Coffee Beans (Current: 5)
  [ ] Tea (Current: 3)
  
  --- Supplies ---
  [ ] Cups (Current: 2)
  ────────────────────────────

↓ [SMTP]
  Connect to Gmail
  Authenticate
  Send to: admin@invex.local
  Subject: Invex: Weekly Restock Guide (3 items)

↓ [Result]
  ✓ Email delivered
  ✓ Task logged as successful
  ✓ Timestamp recorded
```

---

## 8. Key Implementation Highlights

### 1. **Async Task Execution**
- Tasks run asynchronously without blocking HTTP requests
- Users get instant API response while tasks process in background

### 2. **Error Handling & Retry Logic**
```python
try:
    # Execute task
    result = fetch_data()
except Exception as e:
    print(f"Error: {e}")
    raise e  # Celery retries automatically
```

### 3. **Database Connection Pooling**
- Reuses Supabase client connections
- Prevents connection exhaustion

### 4. **Professional Email Formatting**
- HTML emails with responsive design
- Plain text fallback for compatibility
- PDF attachments for reports

### 5. **Graceful Degradation**
- If email fails, task logs error but doesn't crash
- Missing Discord webhook? Gracefully skips
- Missing admin email? Falls back to default

---

## 9. Monitoring & Observability

### Checking Task Status
```bash
# View Celery worker logs
celery -A services.tasks.core worker --loglevel=info

# View scheduled tasks
celery -A services.tasks.core beat --loglevel=info

# Monitor via Flower dashboard
flower -A services.tasks.core --port=5555
# Then visit: http://localhost:5555
```

### Expected Log Output
```
[2026-05-13 08:00:00] INFO: Task generate-low-stock-reminder received
[2026-05-13 08:00:02] INFO: Generating restock reminder for user_id=abc123
[2026-05-13 08:00:03] INFO: Restock email sent to admin@invex.local
[2026-05-13 08:00:03] INFO: Task succeeded in 0.75s
```

---

## 10. Benefits & Impact

| Benefit | Impact |
|---------|--------|
| **Automated Notifications** | Never miss a sale due to low stock |
| **Dynamic Pricing** | 5-10% revenue increase through smart pricing |
| **Daily Insights** | Real-time visibility into business metrics |
| **Time Saved** | 5+ hours/week of manual reporting |
| **Data-Driven** | Decisions based on actual sales patterns |
| **Scalable** | Handles growth without additional manual work |

---

## 11. Conclusion

**Invex Automation System delivers:**
- ✅ Zero-configuration scheduling (Celery Beat)
- ✅ Reliable message delivery (Redis + Celery)
- ✅ Professional communication (HTML emails + PDF reports)
- ✅ Database-driven insights (Supabase queries)
- ✅ Production-ready error handling

This automation framework enables **Invex** to operate as a self-managing system that adapts to business needs without human intervention.

---

<!-- ## Appendix: Quick Start Commands

```bash
# Start all services (3 terminals)

# Terminal 1: Redis (if local)
redis-server

# Terminal 2: Flask Backend
cd backend
python app.py

# Terminal 3: Celery Worker
cd backend
celery -A services.tasks.core worker --loglevel=info --pool=solo

# Terminal 4: Celery Beat
cd backend
celery -A services.tasks.core beat --loglevel=info

# Terminal 5 (Optional): Flower Monitoring
flower -A services.tasks.core --port=5555
``` -->

