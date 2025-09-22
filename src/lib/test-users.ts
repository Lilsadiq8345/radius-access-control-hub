import { supabase } from '@/integrations/supabase/client';

export const createTestUsers = async () => {
    console.log('Creating test users...');

    const testUsers = [
        {
            email: 'admin@radiuscorp.com',
            password: 'admin123',
            fullName: 'Admin User',
            department: 'IT',
            role: 'admin'
        },
        {
            email: 'user@radiuscorp.com',
            password: 'user123',
            fullName: 'Regular User',
            department: 'Sales',
            role: 'user'
        },
        {
            email: 'test@radiuscorp.com',
            password: 'test123',
            fullName: 'Test User',
            department: 'Marketing',
            role: 'user'
        }
    ];

    for (const user of testUsers) {
        try {
            console.log(`Creating user: ${user.email}`);

            const { data, error } = await supabase.auth.signUp({
                email: user.email,
                password: user.password,
                options: {
                    data: {
                        full_name: user.fullName,
                        department: user.department,
                        role: user.role
                    }
                }
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    console.log(`User ${user.email} already exists`);
                } else {
                    console.error(`Error creating user ${user.email}:`, error);
                }
            } else {
                console.log(`Successfully created user: ${user.email}`);
            }
        } catch (error) {
            console.error(`Error creating user ${user.email}:`, error);
        }
    }

    console.log('Test users creation completed');
};

export const getTestCredentials = () => {
    return {
        admin: {
            email: 'admin@radiuscorp.com',
            password: 'admin123'
        },
        user: {
            email: 'user@radiuscorp.com',
            password: 'user123'
        },
        test: {
            email: 'test@radiuscorp.com',
            password: 'test123'
        }
    };
}; 