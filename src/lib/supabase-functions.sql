
-- Edge Functions for RADIUS Central
-- These functions will be created as Supabase Edge Functions

-- Function to authenticate RADIUS user
CREATE OR REPLACE FUNCTION authenticate_radius_user(
    p_username TEXT,
    p_password TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_nas_ip INET DEFAULT NULL,
    p_nas_port INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_record RECORD;
    v_auth_success BOOLEAN := FALSE;
    v_failure_reason TEXT := NULL;
    v_session_id TEXT;
BEGIN
    -- Get user record
    SELECT ru.*, up.status as profile_status
    INTO v_user_record
    FROM public.radius_users ru
    JOIN public.user_profiles up ON ru.user_profile_id = up.id
    WHERE ru.username = p_username;

    -- Check if user exists
    IF NOT FOUND THEN
        v_failure_reason := 'User not found';
    ELSIF v_user_record.profile_status != 'active' THEN
        v_failure_reason := 'User account is not active';
    ELSIF v_user_record.locked_until IS NOT NULL AND v_user_record.locked_until > NOW() THEN
        v_failure_reason := 'Account is locked';
    ELSIF NOT (crypt(p_password, v_user_record.password_hash) = v_user_record.password_hash) THEN
        v_failure_reason := 'Invalid password';
        
        -- Increment failed attempts
        UPDATE public.radius_users 
        SET failed_attempts = failed_attempts + 1,
            locked_until = CASE 
                WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
                ELSE NULL 
            END
        WHERE username = p_username;
    ELSE
        v_auth_success := TRUE;
        v_session_id := gen_random_uuid()::TEXT;
        
        -- Reset failed attempts and update last login
        UPDATE public.radius_users 
        SET failed_attempts = 0,
            locked_until = NULL,
            last_login = NOW()
        WHERE username = p_username;
        
        -- Create session record
        INSERT INTO public.radius_sessions (
            username, session_id, nas_ip_address, nas_port, start_time
        ) VALUES (
            p_username, v_session_id, p_nas_ip, p_nas_port, NOW()
        );
    END IF;

    -- Log authentication attempt
    INSERT INTO public.auth_logs (
        username, ip_address, user_agent, auth_method, success, 
        failure_reason, nas_ip_address, nas_port, session_id
    ) VALUES (
        p_username, p_ip_address, p_user_agent, 'password', v_auth_success,
        v_failure_reason, p_nas_ip, p_nas_port, v_session_id
    );

    -- Return result
    RETURN json_build_object(
        'success', v_auth_success,
        'session_id', v_session_id,
        'failure_reason', v_failure_reason,
        'user_groups', CASE 
            WHEN v_auth_success THEN ARRAY['authenticated']
            ELSE ARRAY[]::TEXT[]
        END
    );
END;
$$;

-- Function to terminate RADIUS session
CREATE OR REPLACE FUNCTION terminate_radius_session(
    p_session_id TEXT,
    p_bytes_sent BIGINT DEFAULT 0,
    p_bytes_received BIGINT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_record RECORD;
BEGIN
    -- Get session record
    SELECT * INTO v_session_record
    FROM public.radius_sessions
    WHERE session_id = p_session_id AND status = 'active';

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Session not found or already terminated');
    END IF;

    -- Update session record
    UPDATE public.radius_sessions
    SET end_time = NOW(),
        session_duration = EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER,
        bytes_sent = p_bytes_sent,
        bytes_received = p_bytes_received,
        status = 'stopped'
    WHERE session_id = p_session_id;

    RETURN json_build_object('success', true, 'message', 'Session terminated successfully');
END;
$$;

-- Function to get user authentication policies
CREATE OR REPLACE FUNCTION get_user_policies(p_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_record RECORD;
    v_policies JSON;
BEGIN
    -- Get user information
    SELECT ru.username, up.department, up.role
    INTO v_user_record
    FROM public.radius_users ru
    JOIN public.user_profiles up ON ru.user_profile_id = up.id
    WHERE ru.username = p_username;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;

    -- Get applicable network policies
    SELECT json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'description', description,
            'source_networks', source_networks,
            'destination_networks', destination_networks,
            'allowed_services', allowed_services,
            'time_restrictions', time_restrictions,
            'priority', priority
        ) ORDER BY priority
    ) INTO v_policies
    FROM public.network_policies
    WHERE enabled = true
    AND (
        user_groups IS NULL 
        OR v_user_record.role = ANY(user_groups)
        OR v_user_record.department = ANY(user_groups)
    );

    RETURN json_build_object(
        'success', true,
        'user', json_build_object(
            'username', v_user_record.username,
            'department', v_user_record.department,
            'role', v_user_record.role
        ),
        'policies', COALESCE(v_policies, '[]'::json)
    );
END;
$$;

-- Function to update server heartbeat
CREATE OR REPLACE FUNCTION update_server_heartbeat(
    p_server_ip INET,
    p_cpu_usage DECIMAL DEFAULT NULL,
    p_memory_usage DECIMAL DEFAULT NULL,
    p_disk_usage DECIMAL DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.radius_servers
    SET last_heartbeat = NOW(),
        cpu_usage = COALESCE(p_cpu_usage, cpu_usage),
        memory_usage = COALESCE(p_memory_usage, memory_usage),
        disk_usage = COALESCE(p_disk_usage, disk_usage)
    WHERE ip_address = p_server_ip;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Server not found');
    END IF;

    RETURN json_build_object('success', true, 'message', 'Heartbeat updated');
END;
$$;
