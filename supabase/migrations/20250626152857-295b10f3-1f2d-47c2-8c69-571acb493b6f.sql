
-- Create admin user profile manually (since we need specific credentials)
-- Note: You'll need to create the auth user through Supabase Auth first, then we'll update the profile

-- First, let's create a function to safely create an admin user
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
  -- Note: This function helps identify the admin user after manual creation
  -- The actual auth user must be created through Supabase Auth API
  
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

-- Create sample radius users for testing
INSERT INTO public.radius_users (user_profile_id, username, password_hash, auth_methods) 
SELECT 
  NULL, -- Will be linked to user profiles later
  'test_user_' || generate_series,
  crypt('password123', gen_salt('bf')),
  ARRAY['password']
FROM generate_series(1, 5);

-- Create some sample auth logs
INSERT INTO public.auth_logs (username, ip_address, auth_method, success, failure_reason) VALUES
('admin', '192.168.1.100', 'password', true, NULL),
('john.doe', '192.168.1.101', 'password', true, NULL),
('jane.smith', '192.168.1.102', 'password', false, 'Invalid password'),
('test_user_1', '192.168.1.103', 'password', true, NULL),
('test_user_2', '192.168.1.104', 'password', false, 'Account locked');

-- Create sample sessions
INSERT INTO public.radius_sessions (username, session_id, nas_ip_address, nas_port, start_time, status) VALUES
('admin', 'sess_' || gen_random_uuid(), '192.168.1.10', 1812, NOW() - INTERVAL '2 hours', 'active'),
('john.doe', 'sess_' || gen_random_uuid(), '192.168.1.11', 1812, NOW() - INTERVAL '1 hour', 'active'),
('test_user_1', 'sess_' || gen_random_uuid(), '192.168.1.10', 1812, NOW() - INTERVAL '30 minutes', 'stopped');

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
