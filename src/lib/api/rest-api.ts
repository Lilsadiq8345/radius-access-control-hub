import { supabase } from '@/integrations/supabase/client';
import { radiusApiService } from './radius-api';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface UserApiData {
    id: string;
    email: string;
    full_name: string;
    department?: string;
    role: string;
    status: string;
    created_at: string;
    last_login?: string;
}

export interface AuthLogApiData {
    id: string;
    username: string;
    ip_address?: string;
    auth_method?: string;
    success: boolean;
    failure_reason?: string;
    created_at: string;
}

export interface ServerApiData {
    id: string;
    name: string;
    ip_address: string;
    port: number;
    status: string;
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    last_heartbeat?: string;
}

class RestApiService {
    // User Management API
    async getUsers(filters?: {
        role?: string;
        status?: string;
        department?: string;
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse<UserApiData[]>> {
        try {
            let query = supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.role) {
                query = query.eq('role', filters.role);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.department) {
                query = query.eq('department', filters.department);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }
            if (filters?.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
            }

            const { data, error } = await query;

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data: data || [] };
        } catch (error) {
            return { success: false, error: 'Failed to fetch users' };
        }
    }

    async getUserById(userId: string): Promise<ApiResponse<UserApiData>> {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: 'Failed to fetch user' };
        }
    }

    async updateUser(userId: string, updates: Partial<UserApiData>): Promise<ApiResponse> {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', userId);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, message: 'User updated successfully' };
        } catch (error) {
            return { success: false, error: 'Failed to update user' };
        }
    }

    async deleteUser(userId: string): Promise<ApiResponse> {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', userId);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            return { success: false, error: 'Failed to delete user' };
        }
    }

    // Authentication Logs API
    async getAuthLogs(filters?: {
        username?: string;
        success?: boolean;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse<AuthLogApiData[]>> {
        try {
            let query = supabase
                .from('auth_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.username) {
                query = query.eq('username', filters.username);
            }
            if (filters?.success !== undefined) {
                query = query.eq('success', filters.success);
            }
            if (filters?.startDate) {
                query = query.gte('created_at', filters.startDate);
            }
            if (filters?.endDate) {
                query = query.lte('created_at', filters.endDate);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }
            if (filters?.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
            }

            const { data, error } = await query;

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data: data || [] };
        } catch (error) {
            return { success: false, error: 'Failed to fetch auth logs' };
        }
    }

    // Server Management API
    async getServers(): Promise<ApiResponse<ServerApiData[]>> {
        try {
            const { data, error } = await supabase
                .from('radius_servers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data: data || [] };
        } catch (error) {
            return { success: false, error: 'Failed to fetch servers' };
        }
    }

    async addServer(serverData: Omit<ServerApiData, 'id' | 'created_at'>): Promise<ApiResponse> {
        try {
            const { error } = await supabase
                .from('radius_servers')
                .insert([serverData]);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, message: 'Server added successfully' };
        } catch (error) {
            return { success: false, error: 'Failed to add server' };
        }
    }

    async updateServer(serverId: string, updates: Partial<ServerApiData>): Promise<ApiResponse> {
        try {
            const { error } = await supabase
                .from('radius_servers')
                .update(updates)
                .eq('id', serverId);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, message: 'Server updated successfully' };
        } catch (error) {
            return { success: false, error: 'Failed to update server' };
        }
    }

    async deleteServer(serverId: string): Promise<ApiResponse> {
        try {
            const { error } = await supabase
                .from('radius_servers')
                .delete()
                .eq('id', serverId);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, message: 'Server deleted successfully' };
        } catch (error) {
            return { success: false, error: 'Failed to delete server' };
        }
    }

    // RADIUS Server Control API
    async getRadiusServerStatus(): Promise<ApiResponse> {
        try {
            const stats = radiusApiService.getServerStats();
            return { success: true, data: stats };
        } catch (error) {
            return { success: false, error: 'Failed to get server status' };
        }
    }

    async startRadiusServer(port?: number): Promise<ApiResponse> {
        try {
            const result = await radiusApiService.startServer(port);
            return result;
        } catch (error) {
            return { success: false, error: 'Failed to start RADIUS server' };
        }
    }

    async stopRadiusServer(): Promise<ApiResponse> {
        try {
            const result = await radiusApiService.stopServer();
            return result;
        } catch (error) {
            return { success: false, error: 'Failed to stop RADIUS server' };
        }
    }

    async restartRadiusServer(port?: number): Promise<ApiResponse> {
        try {
            const result = await radiusApiService.restartServer(port);
            return result;
        } catch (error) {
            return { success: false, error: 'Failed to restart RADIUS server' };
        }
    }

    // Statistics API
    async getSystemStats(): Promise<ApiResponse> {
        try {
            const [usersResult, logsResult, serversResult] = await Promise.all([
                this.getUsers({ limit: 1 }),
                this.getAuthLogs({ limit: 1 }),
                this.getServers()
            ]);

            const totalUsers = usersResult.success ? usersResult.data?.length || 0 : 0;
            const totalLogs = logsResult.success ? logsResult.data?.length || 0 : 0;
            const totalServers = serversResult.success ? serversResult.data?.length || 0 : 0;

            // Get recent auth logs for success rate calculation
            const recentLogs = await this.getAuthLogs({ limit: 100 });
            const successCount = recentLogs.success ?
                recentLogs.data?.filter(log => log.success).length || 0 : 0;
            const totalRecentLogs = recentLogs.success ? recentLogs.data?.length || 0 : 0;
            const successRate = totalRecentLogs > 0 ? Math.round((successCount / totalRecentLogs) * 100) : 0;

            const stats = {
                totalUsers,
                totalLogs,
                totalServers,
                successRate,
                radiusServerStatus: radiusApiService.getServerStats()
            };

            return { success: true, data: stats };
        } catch (error) {
            return { success: false, error: 'Failed to get system statistics' };
        }
    }

    // Bulk Operations API
    async bulkUpdateUsers(userIds: string[], updates: Partial<UserApiData>): Promise<ApiResponse> {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update(updates)
                .in('id', userIds);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, message: `${userIds.length} users updated successfully` };
        } catch (error) {
            return { success: false, error: 'Failed to bulk update users' };
        }
    }

    async bulkDeleteUsers(userIds: string[]): Promise<ApiResponse> {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .delete()
                .in('id', userIds);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, message: `${userIds.length} users deleted successfully` };
        } catch (error) {
            return { success: false, error: 'Failed to bulk delete users' };
        }
    }

    // Export API
    async exportUsers(format: 'csv' | 'json' = 'csv'): Promise<ApiResponse<string>> {
        try {
            const usersResult = await this.getUsers({ limit: 1000 });

            if (!usersResult.success) {
                return { success: false, error: 'Failed to fetch users for export' };
            }

            if (format === 'csv') {
                const csvContent = [
                    ['ID', 'Email', 'Full Name', 'Department', 'Role', 'Status', 'Created At'],
                    ...(usersResult.data || []).map(user => [
                        user.id,
                        user.email,
                        user.full_name,
                        user.department || '',
                        user.role,
                        user.status,
                        new Date(user.created_at).toISOString()
                    ])
                ].map(row => row.join(',')).join('\n');

                return { success: true, data: csvContent };
            } else {
                return { success: true, data: JSON.stringify(usersResult.data, null, 2) };
            }
        } catch (error) {
            return { success: false, error: 'Failed to export users' };
        }
    }

    // Health Check API
    async healthCheck(): Promise<ApiResponse> {
        try {
            const checks = {
                database: false,
                radiusServer: false,
                auth: false
            };

            // Check database connection
            try {
                const { error } = await supabase.from('user_profiles').select('count').limit(1);
                checks.database = !error;
            } catch (e) {
                checks.database = false;
            }

            // Check RADIUS server status
            try {
                const stats = radiusApiService.getServerStats();
                checks.radiusServer = true;
            } catch (e) {
                checks.radiusServer = false;
            }

            // Check auth service
            try {
                const { error } = await supabase.auth.getSession();
                checks.auth = !error;
            } catch (e) {
                checks.auth = false;
            }

            const allHealthy = Object.values(checks).every(check => check);

            return {
                success: true,
                data: {
                    healthy: allHealthy,
                    checks,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return { success: false, error: 'Health check failed' };
        }
    }
}

export const restApiService = new RestApiService(); 