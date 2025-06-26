
-- RADIUS Central Database Schema
-- Execute this in Supabase SQL Editor after connecting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    department TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RADIUS users table for authentication
CREATE TABLE public.radius_users (
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
CREATE TABLE public.auth_logs (
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
CREATE TABLE public.radius_servers (
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
CREATE TABLE public.network_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    source_networks INET[],
    destination_networks INET[],
    allowed_services TEXT[],
    time_restrictions JSONB,
    user_groups TEXT[],
    priority INTEGER DEFAULT 100,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RADIUS sessions
CREATE TABLE public.radius_sessions (
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

-- Create indexes for better performance
CREATE INDEX idx_auth_logs_username ON public.auth_logs(username);
CREATE INDEX idx_auth_logs_created_at ON public.auth_logs(created_at);
CREATE INDEX idx_auth_logs_success ON public.auth_logs(success);
CREATE INDEX idx_radius_users_username ON public.radius_users(username);
CREATE INDEX idx_radius_sessions_username ON public.radius_sessions(username);
CREATE INDEX idx_radius_sessions_session_id ON public.radius_sessions(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radius_users_updated_at BEFORE UPDATE ON public.radius_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radius_servers_updated_at BEFORE UPDATE ON public.radius_servers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_network_policies_updated_at BEFORE UPDATE ON public.network_policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for radius_users
CREATE POLICY "Admins can manage radius users" ON public.radius_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for auth_logs (read-only for users, full access for admins)
CREATE POLICY "Users can view own auth logs" ON public.auth_logs
    FOR SELECT USING (
        username IN (
            SELECT ru.username FROM public.radius_users ru
            JOIN public.user_profiles up ON ru.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all auth logs" ON public.auth_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for radius_servers (admin only)
CREATE POLICY "Admins can manage radius servers" ON public.radius_servers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for network_policies (admin only)
CREATE POLICY "Admins can manage network policies" ON public.network_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

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
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert sample data
INSERT INTO public.radius_servers (name, ip_address, port, shared_secret, status, cpu_usage, memory_usage, disk_usage) VALUES
('Primary RADIUS', '192.168.1.10', 1812, 'primary_secret_key', 'active', 67.5, 45.2, 23.8),
('Secondary RADIUS', '192.168.1.11', 1812, 'secondary_secret_key', 'active', 43.2, 38.7, 19.4),
('Backup RADIUS', '192.168.1.12', 1812, 'backup_secret_key', 'active', 12.1, 15.9, 8.2);

INSERT INTO public.network_policies (name, description, source_networks, destination_networks, allowed_services, priority, enabled) VALUES
('Admin Full Access', 'Complete network access for administrators', ARRAY['192.168.1.0/24'], ARRAY['0.0.0.0/0'], ARRAY['ALL'], 10, true),
('User Web Access', 'Basic web access for regular users', ARRAY['192.168.100.0/24'], ARRAY['0.0.0.0/0'], ARRAY['HTTP', 'HTTPS', 'DNS'], 50, true),
('Guest Limited', 'Restricted access for guest users', ARRAY['192.168.200.0/24'], ARRAY['8.8.8.8/32', '1.1.1.1/32'], ARRAY['HTTP', 'HTTPS'], 90, true);
