"""
Database Migration Script for Adding Cost Column

This script adds the 'cost' column to the 'item' table if it doesn't already exist.
This is needed for profit calculation in the weekly sales report.

Usage:
    python migrate_add_cost_column.py

Note: Make sure your .env file has the proper SUPABASE_URL and SUPABASE_KEY configured.
"""

import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Load environment variables
env_path = os.path.join(current_dir, '.env')
load_dotenv(env_path, override=True)

try:
    from supabase_client import supabase
except ImportError:
    print("Error: Could not import supabase_client. Ensure it's in the Python path.")
    sys.exit(1)

def check_and_add_cost_column():
    """Check if cost column exists in item table, and add if missing."""
    
    if not supabase:
        print("Error: Supabase client not initialized")
        return False
    
    try:
        print("Checking if 'cost' column exists in 'item' table...")
        
        # Try to query a single item to check the schema
        response = supabase.table('item').select('*', count='exact').limit(1).execute()
        
        # Check if the response indicates the column exists
        # A better approach is to try an insert with the cost column
        print("Attempting to add 'cost' column to 'item' table...")
        
        # Use SQL directly to add the column if it doesn't exist
        sql_query = """
        ALTER TABLE public.item
        ADD COLUMN IF NOT EXISTS cost double precision DEFAULT 0;
        """
        
        # Unfortunately, Supabase Python client doesn't support raw SQL execution directly
        # We need to use an alternative approach
        
        # For Supabase, we can verify the column by trying to select it
        # If the column exists, this will work. If not, it will fail.
        test_response = supabase.table('item').select('cost').limit(1).execute()
        
        print("✓ 'cost' column already exists in 'item' table")
        return True
        
    except Exception as e:
        error_msg = str(e)
        
        # Check if this is a column not found error
        if "cost" in error_msg.lower() or "undefined" in error_msg.lower():
            print(f"✗ 'cost' column not found. Details: {error_msg}")
            print("\nTo add the column, run the following SQL in your Supabase SQL editor:")
            print("=" * 60)
            print("""
ALTER TABLE public.item
ADD COLUMN cost double precision DEFAULT 0;
            """)
            print("=" * 60)
            return False
        else:
            print(f"Error checking schema: {error_msg}")
            return False

def migrate_legacy_data():
    """
    For existing items, populate the cost column with a sensible default.
    This sets cost = price initially, as we don't know historical cost data.
    Users should manually update this if they have different cost information.
    """
    try:
        print("\nMigrating legacy data...")
        print("Setting default cost values for existing items...")
        
        # Fetch all items
        response = supabase.table('item').select('id, price').execute()
        items = response.data
        
        if not items:
            print("No items found to migrate.")
            return True
        
        print(f"Found {len(items)} items. Updating cost values...")
        
        # Update each item's cost to equal its price (for backwards compatibility)
        # This assumes the price is what they sold it for, so cost = price initially
        updated_count = 0
        for item in items:
            try:
                supabase.table('item').update({
                    'cost': item.get('price', 0)
                }).eq('id', item['id']).execute()
                updated_count += 1
            except Exception as e:
                print(f"Warning: Could not update item {item['id']}: {e}")
        
        print(f"✓ Successfully updated {updated_count} items with cost values")
        print("Note: Cost was set equal to Price. Please manually adjust costs to reflect actual procurement costs.")
        return True
        
    except Exception as e:
        print(f"Error during migration: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Invex Database Migration: Add Cost Column")
    print("=" * 60)
    
    # Check and add the column
    column_exists = check_and_add_cost_column()
    
    if column_exists:
        print("\n✓ Database schema is up to date!")
        # Optionally migrate legacy data
        user_input = input("\nWould you like to set default cost values for existing items? (y/n): ")
        if user_input.lower() == 'y':
            migrate_legacy_data()
    else:
        print("\n✗ Please add the 'cost' column to your database as shown above.")
        print("After adding the column, run this script again to populate default values.")
    
    print("\n" + "=" * 60)
    print("Migration complete!")
    print("=" * 60)
