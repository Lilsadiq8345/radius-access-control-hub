-- =====================================================
-- RADIUS Central Management System - Admin User Setup
-- =====================================================

-- This script creates an admin user profile for the RADIUS system
-- Run this AFTER creating the user in Supabase Authentication

-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Enter: admin@radiuscorp.com / admin
-- 4. Run this script to promote to admin

-- =====================================================
-- STEP 1: Get the user ID from auth.users
-- =====================================================
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'admin@radiuscorp.com';
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User admin@radiuscorp.com not found in auth.users. Please create the user first.';
    END IF;
    
    -- =====================================================
    -- STEP 2: Create user profile
    -- =====================================================
    INSERT INTO user_profiles (
        id,
        full_name,
        email,
        role,
        department,
        status,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'Admin User',
        'admin@radiuscorp.com',
        'admin',
        'IT Administration',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        updated_at = NOW();
    
    RAISE NOTICE 'Admin user profile created/updated successfully!';
    
    -- =====================================================
    -- STEP 3: Grant admin privileges
    -- =====================================================
    -- Update the user's role to admin
    UPDATE user_profiles 
    SET role = 'admin' 
    WHERE id = user_id;
    
    RAISE NOTICE 'User promoted to admin successfully!';
    
    -- =====================================================
    -- STEP 4: Verify admin status
    -- =====================================================
    -- Check if the user is now an admin
    IF EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id AND role = 'admin'
    ) THEN
        RAISE NOTICE '=====================================================';
        RAISE NOTICE 'ADMIN USER SETUP COMPLETE!';
        RAISE NOTICE '=====================================================';
        RAISE NOTICE 'User: admin@radiuscorp.com';
        RAISE NOTICE 'Role: admin';
        RAISE NOTICE 'Status: active';
        RAISE NOTICE '=====================================================';
    ELSE
        RAISE EXCEPTION 'Failed to promote user to admin role.';
    END IF;
    
END $$;
