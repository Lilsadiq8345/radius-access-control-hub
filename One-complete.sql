-- =====================================================
-- RADIUS Central Management System - Complete Setup
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    department TEXT DEFAULT 'general',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RADIUS users table for authentication
CREATE TABLE IF NOT EXISTS public.radius_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    auth_methods TEXT[] DEFAULT ARRAY['password'],
    last_login TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authentication logs
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    auth_method TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    nas_ip_address INET,
    nas_port INTEGER,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RADIUS servers
CREATE TABLE IF NOT EXISTS public.radius_servers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    ip_address INET NOT NULL,
    port INTEGER DEFAULT 1812,
    shared_secret TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Network policies
CREATE TABLE IF NOT EXISTS public.network_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    source_networks TEXT[],
    destination_networks TEXT[],
    allowed_services TEXT[],
    time_restrictions JSONB,
    user_groups TEXT[],
    priority INTEGER DEFAULT 100,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RADIUS sessions
CREATE TABLE IF NOT EXISTS public.radius_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    nas_ip_address INET,
    nas_port INTEGER,
    framed_ip_address INET,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    session_duration INTEGER,
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'stopped', 'terminated'))
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_auth_logs_username ON public.auth_logs(username);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_logs_success ON public.auth_logs(success);
CREATE INDEX IF NOT EXISTS idx_radius_users_username ON public.radius_users(username);
CREATE INDEX IF NOT EXISTS idx_radius_sessions_username ON public.radius_sessions(username);
CREATE INDEX IF NOT EXISTS idx_radius_sessions_session_id ON public.radius_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- =====================================================
-- CREATE FUNCTIONS
-- =====================================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user profile already exists
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = NEW.id
  ) THEN
    INSERT INTO public.user_profiles (id, full_name, email, department, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'department', 'general'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  INSERT INTO public.user_profiles (id, full_name, email, department, role)
  VALUES (
    user_id,
    COALESCE(user_metadata->>'full_name', user_email),
    COALESCE(user_metadata->>'department', 'general'),
    COALESCE(user_metadata->>'role', 'user')
  );
  
  RETURN json_build_object('success', true, 'message', 'User profile created successfully');
END;
$$;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Drop and recreate the trigger to ensure it's properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radius_users_updated_at BEFORE UPDATE ON public.radius_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radius_servers_updated_at BEFORE UPDATE ON public.radius_servers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_network_policies_updated_at BEFORE UPDATE ON public.network_policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for radius_users
CREATE POLICY "Admins can manage radius users" ON public.radius_users
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for auth_logs
CREATE POLICY "Users can view own auth logs" ON public.auth_logs
    FOR SELECT USING (
        username IN (
            SELECT ru.username FROM public.radius_users ru
            JOIN public.user_profiles up ON ru.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all auth logs" ON public.auth_logs
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for radius_servers (admin only)
CREATE POLICY "Admins can manage radius servers" ON public.radius_servers
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for network_policies (admin only)
CREATE POLICY "Admins can manage network policies" ON public.network_policies
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for radius_sessions
CREATE POLICY "Users can view own sessions" ON public.radius_sessions
    FOR SELECT USING (
        username IN (
            SELECT ru.username FROM public.radius_users ru
            JOIN public.user_profiles up ON ru.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all sessions" ON public.radius_sessions
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample RADIUS servers
INSERT INTO radius_servers (name, ip_address, port, secret, status, created_at) VALUES
('Primary RADIUS Server', '192.168.1.100', 1812, 'radius_secret_2024', 'active', NOW()),
('Secondary RADIUS Server', '192.168.1.101', 1812, 'radius_secret_2024', 'active', NOW()),
('Load Balancer RADIUS', '192.168.1.102', 1812, 'radius_secret_2024', 'active', NOW());

-- Sample network policies
INSERT INTO network_policies (name, description, policy_type, rules, enabled, created_at) VALUES
('Default Access Policy', 'Standard network access for authenticated users', 'access', '{"bandwidth_limit": "10Mbps", "time_restriction": "24/7"}', true, NOW()),
('Guest Access Policy', 'Limited access for guest users', 'access', '{"bandwidth_limit": "2Mbps", "time_restriction": "8:00-18:00"}', true, NOW()),
('Admin Access Policy', 'Full access for administrative users', 'access', '{"bandwidth_limit": "100Mbps", "time_restriction": "24/7"}', true, NOW());

-- Sample radius users for testing
INSERT INTO radius_users (username, password, full_name, email, role, status, created_at) VALUES
('test_user_' || generate_series, crypt('radius123', gen_salt('bf')), 'Test User ' || generate_series, 'test' || generate_series || '@radiuscorp.com', 'user', 'active', NOW())
FROM generate_series(1, 5);

-- Sample auth logs
INSERT INTO auth_logs (username, ip_address, auth_method, success, failure_reason, created_at) VALUES
('test_user_1', '192.168.1.103', 'password', true, NULL),
('test_user_2', '192.168.1.104', 'password', false, 'Account locked')
ON CONFLICT DO NOTHING;

-- Sample sessions
INSERT INTO user_sessions (user_id, session_id, ip_address, port, start_time, end_time, status) VALUES
('test_user_1', 'sess_' || gen_random_uuid(), '192.168.1.10', 1812, NOW() - INTERVAL '30 minutes', 'stopped')
ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- SETUP COMPLETE MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'RADIUS Central Management System Setup Complete!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User"';
    RAISE NOTICE '3. Enter: admin@radiuscorp.com / admin';
    RAISE NOTICE '4. Run the admin promotion script below';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin Promotion Script:';
    RAISE NOTICE 'SELECT promote_to_admin(''admin@radiuscorp.com'');';
    RAISE NOTICE '=====================================================';
END $$;