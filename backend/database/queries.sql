-- Invex Common Database Queries
-- This file contains the SQL equivalent of the Supabase API calls used in the backend.

-- ==========================================
-- 1. INVENTORY MANAGEMENT
-- ==========================================

-- Get all items for a specific user with their category names
-- Used in: item_routes.py -> get_items
SELECT 
  i.*, 
  ic.name as category_name
FROM item i
LEFT JOIN item_category ic ON i.item_category = ic.id
WHERE i.user_id = 'USER_UUID_HERE';

-- Get total units sold per item (for inventory calculations)
-- Used in: item_routes.py -> get_items
SELECT item_id, unit_sold 
FROM sale_report 
WHERE user_id = 'USER_UUID_HERE';

-- Get all available item categories
-- Used in: item_routes.py -> get_categories
SELECT * FROM item_category;

-- Update item price
-- Used in: item_routes.py -> update_item_price
UPDATE item 
SET 
  price = 150.00, 
  price_last_update = NOW()
WHERE id = 123 AND user_id = 'USER_UUID_HERE';

-- ==========================================
-- 2. USER PROFILE & BUSINESS INFO
-- ==========================================

-- Get logged-in user's profile
-- Used in: user_routes.py -> get_my_profile
SELECT * FROM public.user WHERE id = 'USER_UUID_HERE';

-- Update user profile
-- Used in: user_routes.py -> update_my_profile
UPDATE public.user
SET 
  first_name = 'John',
  last_name = 'Doe',
  home_address = '123 Main St',
  birthday = '1990-01-01'
WHERE id = 'USER_UUID_HERE';

-- Get user's business info
-- Used in: business_routes.py -> get_my_business_info
SELECT * FROM business_info WHERE user_id = 'USER_UUID_HERE';

-- Upsert (Insert or Update) Business Info
-- Used in: business_routes.py -> update_my_business_info
INSERT INTO business_info (business_name, business_address, year_founded, user_id)
VALUES ('My Business', '456 Biz Ave', '2020-01-01', 'USER_UUID_HERE')
ON CONFLICT (user_id) 
DO UPDATE SET 
  business_name = EXCLUDED.business_name,
  business_address = EXCLUDED.business_address,
  year_founded = EXCLUDED.year_founded;

-- ==========================================
-- 3. REPORTS & ANALYTICS
-- ==========================================

-- Get Sales Report with Item Details
-- Used in: report_routes.py -> get_sales_report
-- Note: Filters by date range (day, week, month)
SELECT 
  sr.*, 
  i.id as item_id, 
  i.item_name, 
  i.price, 
  ic.name as category_name
FROM sale_report sr
LEFT JOIN item i ON sr.item_id = i.id
LEFT JOIN item_category ic ON i.item_category = ic.id
WHERE 
  sr.user_id = 'USER_UUID_HERE' 
  AND sr.sale_date >= '2023-01-01'; -- Date filter varies

-- Add a new sale record
-- Used in: report_routes.py -> add_sale
INSERT INTO sale_report (user_id, item_id, unit_sold, sale_date)
VALUES ('USER_UUID_HERE', 123, 5, NOW());

-- Get Damaged Items Report
-- Used in: item_routes.py (implied logic in frontend filtering)
SELECT * FROM item 
WHERE user_id = 'USER_UUID_HERE' AND damaged_quantity > 0;

