# Celery & Profit Calculation Implementation Summary

## Changes Implemented

### 1. ✅ Celery Beat Configuration (`backend/celery_config.py`)
**Status**: Complete

Created a comprehensive Celery Beat configuration that schedules three automated tasks:

- **Low Stock Reminder**: Daily at 8:00 AM UTC
  - Function: `tasks.generate_restock_reminder`
  - Action: Checks inventory for items below threshold, sends email alerts
  
- **Dynamic Pricing Adjustment**: Daily at 6:00 AM UTC
  - Function: `tasks.adjust_prices_daily`
  - Logic: Applies discounts for stale inventory, price surges for high-demand/low-stock items
  
- **Weekly Sales Report**: Every Sunday at 9:00 PM UTC
  - Function: `tasks.send_weekly_report`
  - Enhancement: Now includes profit calculations

**Configuration Features**:
- Redis broker support (localhost:6379 by default)
- Configurable timezone (UTC)
- Task expiration settings
- JSON serialization for cross-language support
- Production-ready settings

### 2. ✅ Database Schema Update (`backend/database/schema.sql`)
**Status**: Complete

Added `cost` column to the `item` table:
```sql
cost double precision DEFAULT 0
```

This allows tracking the procurement cost of items for profit calculations.

**Migration Steps**:
1. Run `python migrate_add_cost_column.py` to apply the schema change
2. For existing items, cost is set to price initially (users should update based on actual costs)
3. New items can have cost set during creation via API

### 3. ✅ Sales Report Profit Calculation (`backend/services/tasks/sales_report.py`)
**Status**: Complete

**Updated Functions**:

#### `fetch_weekly_sales()`
- Now includes `cost` column in query from Supabase
- Fetches both price and cost for profit calculation

#### `process_sales_data()`
- Calculates revenue: `Quantity × Price`
- Calculates total cost: `Quantity × Cost`
- Calculates profit: `Revenue - Total Cost`
- Returns DataFrame with columns: Date, Item, Category, Quantity, Price, Cost, Revenue, Total Cost, Profit

#### `generate_pdf_report()`
- Enhanced summary section showing:
  - Total Revenue
  - Total Cost  
  - Total Profit
  - Profit Margin (%)
  - Total Items Sold
- Updated table with new columns: Price, Cost, Revenue, Profit
- Professional formatting with improved layout

### 4. ✅ Celery Integration (`backend/services/tasks/core.py`)
**Status**: Complete

**Changes**:
- Updated Celery initialization to load `CeleryConfig`
- Added fallback configuration if config file not found
- Proper error handling for imports
- Environment variable support with sensible defaults

### 5. ✅ Flask App Initialization (`backend/app.py`)
**Status**: Complete

**Changes**:
- Imports Celery and task modules for automatic registration
- Initializes Celery with Flask app context
- Ensures all tasks are available when app starts
- Proper error handling with informative warnings

### 6. ✅ Database Migration Script (`backend/migrate_add_cost_column.py`)
**Status**: Complete

Standalone Python script to safely add the `cost` column to existing databases:
- Checks if column already exists
- Provides SQL instructions if column is missing
- Option to populate default cost values
- User-friendly prompts and error handling

### 7. ✅ Setup & Deployment Guide (`CELERY_SETUP_GUIDE.md`)
**Status**: Complete

Comprehensive guide covering:
- System architecture and prerequisites
- Environment variable configuration
- Local development setup (Redis, Celery, Flower)
- Startup scripts for Linux/Mac and Windows
- Task reference and manual testing
- Troubleshooting common issues
- Production deployment with Docker
- Systemd service configuration

## File Structure

```
backend/
├── app.py                          (✅ Updated with Celery init)
├── celery_config.py                (✅ New: Beat schedule config)
├── migrate_add_cost_column.py       (✅ New: Schema migration)
├── services/
│   └── tasks/
│       ├── core.py                 (✅ Updated with config loading)
│       ├── inventory.py            (Already has task logic)
│       ├── pricing.py              (Already has task logic)
│       └── sales_report.py          (✅ Updated with profit calc)
└── database/
    └── schema.sql                  (✅ Updated with cost column)

CELERY_SETUP_GUIDE.md               (✅ New: Complete setup guide)
```

## Key Features

### Automation Infrastructure
✅ **Celery Beat Scheduler**: Automatically triggers tasks on schedule  
✅ **Task Queue**: Redis-backed message broker  
✅ **Error Handling**: Automatic retries, task expiration  
✅ **Monitoring**: Flower UI integration available  

### Business Logic
✅ **Low Stock Alerts**: Daily automated email reminders  
✅ **Dynamic Pricing**: Automatic discounts and surge pricing  
✅ **Profit Reporting**: Weekly PDF with detailed profit breakdown  

### Data Accuracy
✅ **Cost Tracking**: New `cost` column in item table  
✅ **Profit Calculation**: Revenue - Cost formula  
✅ **Historical Data**: Retains all sales with cost information  

## Next Steps: Implementation

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

Add if missing:
```bash
pip install celery==5.6.2 redis==5.0.0
```

### Step 2: Configure Environment
Update `.env`:
```env
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourbusiness.com
```

### Step 3: Start Redis
```bash
redis-server
# Or: docker run -d -p 6379:6379 redis
```

### Step 4: Run Migration
```bash
python migrate_add_cost_column.py
```

### Step 5: Start Services
**Terminal 1** - Flask API:
```bash
python app.py
```

**Terminal 2** - Celery Worker:
```bash
celery -A services.tasks.core worker --loglevel=info
```

**Terminal 3** - Celery Beat:
```bash
celery -A services.tasks.core beat --loglevel=info
```

**Terminal 4 (Optional)** - Monitor:
```bash
flower -A services.tasks.core --port=5555
```

## Testing the Implementation

### 1. Verify Tasks Are Registered
In Python REPL:
```python
from services.tasks.core import celery
print(celery.tasks)
# Should show: tasks.generate_restock_reminder, tasks.adjust_prices_daily, tasks.send_weekly_report
```

### 2. Manual Task Trigger
```python
from services.tasks.inventory import generate_restock_reminder
result = generate_restock_reminder.delay(user_email='test@example.com')
result.get()  # Wait for completion
```

### 3. Check Beat Schedule
Flower UI: http://localhost:5555
- Look for scheduled tasks in the "Scheduled" section
- Verify execution times match configuration

### 4. Verify Report Profit Calculation
Check the next generated report:
- Should have Total Revenue, Total Cost, Total Profit, and Profit Margin
- Item rows should show Price, Cost, Revenue, and Profit

## Configuration Customization

### Change Schedule Times
Edit `backend/celery_config.py`:
```python
beat_schedule = {
    'generate-low-stock-reminder': {
        'schedule': crontab(hour=8, minute=0),  # Change this
    },
    # ... other tasks
}
```

### Adjust Pricing Strategy
Edit `backend/services/tasks/pricing.py`:
```python
STALE_THRESHOLD_DAYS = 60  # Change inactivity threshold
DISCOUNT_RATE = 0.10       # Change discount percentage
HIGH_DEMAND_MIN_SALES = 10 # Change sales threshold
PRICE_SURGE_RATE = 0.05    # Change surge percentage
```

### Set Low Stock Threshold
In `.env`:
```env
LOW_STOCK_THRESHOLD=10  # Items below this trigger alert
```

## Troubleshooting

### Connection Issues
```bash
# Test Redis
redis-cli ping
# Should return: PONG

# Test Celery
celery -A services.tasks.core inspect active
# Should return active tasks
```

### Import Errors
```bash
# Ensure you're in the right directory
cd backend

# Check Python path
python -c "import sys; print(sys.path)"

# Verify imports work
python -c "from services.tasks.core import celery; print('OK')"
```

### Task Not Executing
1. Check Celery Beat terminal for schedule messages
2. Check Celery Worker terminal for task execution
3. Verify timezone settings (should be UTC)
4. Check task expiration times in config

## Performance & Scalability

### Development
- Single Redis instance on localhost
- Single Celery worker
- Flower monitoring (optional)
- Suitable for testing and small deployments

### Production
- Dedicated Redis cluster or managed service
- Multiple Celery workers for parallelization
- Celery Beat on dedicated instance or supervisor
- Comprehensive monitoring and alerting
- See CELERY_SETUP_GUIDE.md for Docker deployment

## Success Criteria

✅ **Celery Beat runs on schedule**  
✅ **Tasks execute without errors**  
✅ **Low stock reminders send daily**  
✅ **Prices adjust automatically**  
✅ **Weekly reports include profit data**  
✅ **Profit = Revenue - Cost calculated correctly**  
✅ **All tasks logged and monitorable**  

## Documentation References

- [CELERY_SETUP_GUIDE.md](CELERY_SETUP_GUIDE.md) - Complete setup and deployment guide
- [backend/celery_config.py](backend/celery_config.py) - Schedule configuration
- [backend/migrate_add_cost_column.py](backend/migrate_add_cost_column.py) - Migration tool
- [backend/database/schema.sql](backend/database/schema.sql) - Updated schema

---

**Implementation Date**: May 12, 2026  
**Status**: ✅ Complete and Ready for Testing
