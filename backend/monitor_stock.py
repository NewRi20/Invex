import os
import sys

# Setup paths to ensure imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Import the task configuration
from services.tasks import monitor_low_stock

if __name__ == "__main__":
    print("--- Running Low Stock Monitor ---")
    try:
        # Execute the task logic immediately in this process
        # .apply() runs the task locally instead of via Celery worker
        task_result = monitor_low_stock.apply()
        
        print(f"Status: {task_result.status}")
        print(f"Output: {task_result.result}")
        print("--- Monitor Complete ---")
    except Exception as e:
        print(f"Error executing monitor: {e}")
