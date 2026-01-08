-- ============================================================================
-- OPTIONAL SEED: Example Bucket List Hierarchy Data
-- ============================================================================
-- This file contains example bucket list items with parent-child relationships
-- Run this ONLY if you want sample data for testing
-- ============================================================================

-- First, ensure we have an admin user to own these items
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'No admin user found. Please create an admin user first.';
    END IF;

    -- Example parent item: Visit all 50 States
    INSERT INTO bucket_list_items 
        ("userId", title, description, category, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Visit all 50 U.S. States', 'Travel to every state in America', 'Travel Goals', false, 1)
    ON CONFLICT DO NOTHING;

    -- Example parent item: Read classic books
    INSERT INTO bucket_list_items 
        ("userId", title, description, category, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Read 100 Classic Books', 'Complete the classics reading challenge', 'Reading Goals', false, 2)
    ON CONFLICT DO NOTHING;

END $$;
