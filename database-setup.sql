-- RADIUS Central Management System Database Setup
-- Run this script in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  department TEXT DEFAULT 'general',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auth_logs table
CREATE TABLE IF NOT EXISTS auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  ip_address INET,
  auth_method TEXT DEFAULT 'password',
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create radius_servers table
CREATE TABLE IF NOT EXISTS radius_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip_address INET NOT NULL,
  port INTEGER DEFAULT 1812,
  secret TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  cpu_usage INTEGER,
  memory_usage INTEGER,
  disk_usage INTEGER,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create network_policies table
CREATE TABLE IF NOT EXISTS network_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('time_based', 'ip_based', 'user_based')),
  conditions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create radius_sessions table
CREATE TABLE IF NOT EXISTS radius_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  ip_address INET,
  nas_ip INET,
  nas_port INTEGER,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  bytes_in BIGINT DEFAULT 0,
  bytes_out BIGINT DEFAULT 0,
  packets_in INTEGER DEFAULT 0,
  packets_out INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE radius_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE radius_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for auth_logs
CREATE POLICY "Admins can view all auth logs" ON auth_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for radius_servers
CREATE POLICY "Admins can manage radius servers" ON radius_servers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for network_policies
CREATE POLICY "Admins can manage network policies" ON network_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for radius_sessions
CREATE POLICY "Admins can view all sessions" ON radius_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, department, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'department', 'general'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to create admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT DEFAULT 'Admin User'
)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', admin_name, 'department', 'IT', 'role', 'admin'),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Create the user profile
  INSERT INTO public.user_profiles (id, full_name, email, department, role)
  VALUES (user_id, admin_name, admin_email, 'IT', 'admin');

  RETURN 'Admin user created successfully with ID: ' || user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample RADIUS servers for testing
INSERT INTO radius_servers (name, ip_address, port, secret, status) VALUES
  ('Primary RADIUS Server', '192.168.1.100', 1812, 'testing123', 'active'),
  ('Secondary RADIUS Server', '192.168.1.101', 1812, 'backup123', 'active'),
  ('Test RADIUS Server', '10.0.0.100', 1812, 'test123', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample network policies
INSERT INTO network_policies (name, description, policy_type, conditions) VALUES
  ('Business Hours Access', 'Allow access only during business hours', 'time_based', '{"start_time": "09:00", "end_time": "17:00", "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]}'),
  ('Office Network Only', 'Allow access only from office IP range', 'ip_based', '{"allowed_ips": ["192.168.1.0/24", "10.0.0.0/8"]}'),
  ('Admin Access Only', 'Restrict access to admin users only', 'user_based', '{"allowed_roles": ["admin"]}')
ON CONFLICT DO NOTHING;

-- Insert sample authentication logs for testing
INSERT INTO auth_logs (username, ip_address, auth_method, success, failure_reason) VALUES
  ('admin', '192.168.1.50', 'password', true, NULL),
  ('user1', '192.168.1.51', 'password', true, NULL),
  ('user2', '192.168.1.52', 'password', false, 'Invalid credentials'),
  ('admin', '192.168.1.53', 'password', true, NULL),
  ('user3', '192.168.1.54', 'password', false, 'Account locked')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_auth_logs_username ON auth_logs(username);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_radius_sessions_username ON radius_sessions(username);
CREATE INDEX IF NOT EXISTS idx_radius_sessions_session_id ON radius_sessions(session_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create admin user with username 'admin' and password 'admin'
SELECT public.create_admin_user('admin@company.com', 'admin', 'Admin User');

-- Also create a direct admin user in user_profiles if needed
INSERT INTO user_profiles (id, full_name, email, department, role, status)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@company.com',
  'IT',
  'admin',
  'active'
) ON CONFLICT DO NOTHING; 