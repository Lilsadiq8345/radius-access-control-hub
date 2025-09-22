-- Migration to fix existing schema and add missing functions
-- This migration assumes tables already exist and only adds missing functions

-- Fix the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user profile already exists
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = NEW.id
  ) THEN
    INSERT INTO public.user_profiles (id, full_name, department, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE(NEW.raw_user_meta_data->>'department', 'general'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it's properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT DEFAULT 'System Administrator'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if admin already exists
  IF EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE role = 'admin' 
    AND id IN (
      SELECT id FROM auth.users WHERE email = admin_email
    )
  ) THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Admin user already exists'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Admin setup function ready. Create user through Auth API first.'
  );
END;
$$;

-- Function to promote user to admin by email
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Update user profile to admin
  UPDATE public.user_profiles
  SET role = 'admin', 
      updated_at = NOW()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'User profile not found');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'User promoted to admin successfully');
END;
$$;

-- Function to manually create user profile if it doesn't exist
CREATE OR REPLACE FUNCTION ensure_user_profile(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_metadata JSONB;
BEGIN
  -- Get user email and metadata
  SELECT email, raw_user_meta_data INTO user_email, user_metadata
  FROM auth.users
  WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found in auth.users');
  END IF;
  
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id) THEN
    RETURN json_build_object('success', true, 'message', 'User profile already exists');
  END IF;
  
  -- Create profile
  INSERT INTO public.user_profiles (id, full_name, department, role)
  VALUES (
    user_id,
    COALESCE(user_metadata->>'full_name', user_email),
    COALESCE(user_metadata->>'department', 'general'),
    COALESCE(user_metadata->>'role', 'user')
  );
  
  RETURN json_build_object('success', true, 'message', 'User profile created successfully');
END;
$$;

-- Add sample data only if tables are empty
DO $$
BEGIN
  -- Add sample radius servers if none exist
  IF NOT EXISTS (SELECT 1 FROM public.radius_servers LIMIT 1) THEN
    INSERT INTO public.radius_servers (name, ip_address, port, shared_secret, status, cpu_usage, memory_usage, disk_usage) VALUES
    ('Primary RADIUS', '192.168.1.10', 1812, 'primary_secret_key', 'active', 67.5, 45.2, 23.8),
    ('Secondary RADIUS', '192.168.1.11', 1812, 'secondary_secret_key', 'active', 43.2, 38.7, 19.4),
    ('Backup RADIUS', '192.168.1.12', 1812, 'backup_secret_key', 'active', 12.1, 15.9, 8.2);
  END IF;

  -- Add sample network policies if none exist
  IF NOT EXISTS (SELECT 1 FROM public.network_policies LIMIT 1) THEN
    INSERT INTO public.network_policies (name, description, source_networks, destination_networks, allowed_services, priority, enabled) VALUES
    ('Admin Full Access', 'Complete network access for administrators', ARRAY['192.168.1.0/24'], ARRAY['0.0.0.0/0'], ARRAY['ALL'], 10, true),
    ('User Web Access', 'Basic web access for regular users', ARRAY['192.168.100.0/24'], ARRAY['0.0.0.0/0'], ARRAY['HTTP', 'HTTPS', 'DNS'], 50, true),
    ('Guest Limited', 'Restricted access for guest users', ARRAY['192.168.200.0/24'], ARRAY['8.8.8.8/32', '1.1.1.1/32'], ARRAY['HTTP', 'HTTPS'], 90, true);
  END IF;
END $$; 