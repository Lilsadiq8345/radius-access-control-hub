import { supabase } from '@/integrations/supabase/client';

export const setupDatabase = async () => {
    console.log('Setting up database...');

    try {
        // Check if user_profiles table exists by trying to query it
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('count')
            .limit(1);

        if (profilesError) {
            console.log('user_profiles table does not exist or is not accessible');
            console.log('Please run the database-setup.sql script in your Supabase SQL Editor');
            console.log('You can find this script in the database-setup.sql file');
            return false;
        } else {
            console.log('user_profiles table exists and is accessible');
        }

        // Check other tables individually
        try {
            const { error: logsError } = await supabase
                .from('auth_logs')
                .select('count')
                .limit(1);

            if (logsError) {
                console.log('auth_logs table does not exist or is not accessible');
            } else {
                console.log('auth_logs table exists and is accessible');
            }
        } catch (error) {
            console.log('auth_logs table check failed');
        }

        try {
            const { error: serversError } = await supabase
                .from('radius_servers')
                .select('count')
                .limit(1);

            if (serversError) {
                console.log('radius_servers table does not exist or is not accessible');
            } else {
                console.log('radius_servers table exists and is accessible');
            }
        } catch (error) {
            console.log('radius_servers table check failed');
        }

        try {
            const { error: policiesError } = await supabase
                .from('network_policies')
                .select('count')
                .limit(1);

            if (policiesError) {
                console.log('network_policies table does not exist or is not accessible');
            } else {
                console.log('network_policies table exists and is accessible');
            }
        } catch (error) {
            console.log('network_policies table check failed');
        }

        try {
            const { error: sessionsError } = await supabase
                .from('radius_sessions')
                .select('count')
                .limit(1);

            if (sessionsError) {
                console.log('radius_sessions table does not exist or is not accessible');
            } else {
                console.log('radius_sessions table exists and is accessible');
            }
        } catch (error) {
            console.log('radius_sessions table check failed');
        }

        console.log('Database setup check completed');
        console.log('If tables are missing, please run database-setup.sql in Supabase SQL Editor');
        return true;
    } catch (error) {
        console.error('Database setup check failed:', error);
        return false;
    }
};

// Function to check database status
export const checkDatabaseStatus = async () => {
    console.log('Checking database status...');

    const status = {
        user_profiles: false,
        auth_logs: false,
        radius_servers: false,
        network_policies: false,
        radius_sessions: false
    };

    try {
        // Check each table individually
        const { error: profilesError } = await supabase
            .from('user_profiles')
            .select('count')
            .limit(1);
        status.user_profiles = !profilesError;

        const { error: logsError } = await supabase
            .from('auth_logs')
            .select('count')
            .limit(1);
        status.auth_logs = !logsError;

        const { error: serversError } = await supabase
            .from('radius_servers')
            .select('count')
            .limit(1);
        status.radius_servers = !serversError;

        const { error: policiesError } = await supabase
            .from('network_policies')
            .select('count')
            .limit(1);
        status.network_policies = !policiesError;

        const { error: sessionsError } = await supabase
            .from('radius_sessions')
            .select('count')
            .limit(1);
        status.radius_sessions = !sessionsError;

        console.log('Database status:', status);
        return status;
    } catch (error) {
        console.error('Database status check failed:', error);
        return status;
    }
};

// Function to get setup instructions
export const getSetupInstructions = () => {
    return {
        title: 'Database Setup Required',
        message: 'The required database tables are not set up. Please follow these steps:',
        steps: [
            '1. Open your Supabase project dashboard',
            '2. Go to the SQL Editor',
            '3. Copy the contents of database-setup.sql',
            '4. Paste and run the SQL script',
            '5. Refresh this page and try again'
        ],
        sqlFile: 'database-setup.sql'
    };
}; 