import os
import sys

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Add services directory to path so we can import tasks
services_dir = os.path.join(current_dir, 'services')
if services_dir not in sys.path:
    sys.path.append(services_dir)

try:
    from services.tasks import send_weekly_report
    print("Successfully imported send_weekly_report from services.tasks")
except ImportError:
    try:
        from tasks import send_weekly_report
        print("Successfully imported send_weekly_report from tasks")
    except ImportError as e:
        print(f"Failed to import from services.tasks: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Testing weekly report generation...")
    try:
        # Use a dummy email to test report generation logic.
        print("Calling send_weekly_report with 'test@example.com'...")
        result = send_weekly_report("test@example.com")
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error during execution: {e}")
        import traceback
        traceback.print_exc()
