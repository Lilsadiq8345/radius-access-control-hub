import { useState, useEffect } from 'react';
import {
    Shield,
    Users,
    Server,
    Activity,
    Settings,
    Database,
    Network,
    BarChart3,
    AlertTriangle,
    Lock,
    Eye,
    UserPlus,
    Trash2,
    Edit,
    RefreshCw,
    Download,
    Upload,
    Key,
    Globe,
    HardDrive,
    Cpu,
    MemoryStick,
    Wifi,
    Clock,
    Calendar,
    FileText,
    Bell,
    Zap,
    Target,
    ShieldCheck,
    UserCheck,
    UserX,
    CheckCircle,
    XCircle,
    AlertCircle,
    Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserManagement from './UserManagement';
import RadiusServerManager from './RadiusServerManager';
import AuthenticationLogs from './AuthenticationLogs';
import NetworkPolicies from './NetworkPolicies';
import SystemMonitoring from './SystemMonitoring';
import SecurityAudit from './SecurityAudit';
import BackupManager from './BackupManager';
import AlertManager from './AlertManager';
import PerformanceAnalytics from './PerformanceAnalytics';
import AuditLogs from './AuditLogs';

interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    adminUsers: number;
    totalAuthRequests: number;
    successRate: number;
    activeServers: number;
    systemHealth: number;
    diskUsage: number;
    memoryUsage: number;
    cpuUsage: number;
    networkTraffic: number;
    securityScore: number;
    lastBackup: string;
    pendingAlerts: number;
    criticalAlerts: number;
}

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        adminUsers: 0,
        totalAuthRequests: 0,
        successRate: 0,
        activeServers: 0,
        systemHealth: 0,
        diskUsage: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkTraffic: 0,
        securityScore: 0,
        lastBackup: '',
        pendingAlerts: 0,
        criticalAlerts: 0
    });
    const [loading, setLoading] = useState(true);
    const { userProfile } = useAuth();
    const { toast } = useToast();

    const fetchSystemStats = async () => {
        try {
            setLoading(true);

            // Fetch user statistics
            const { count: totalUsers } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true });

            const { count: activeUsers } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            const { count: suspendedUsers } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'suspended');

            const { count: adminUsers } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'admin');

            // Fetch authentication statistics
            const { count: totalAuthRequests } = await supabase
                .from('auth_logs')
                .select('*', { count: 'exact', head: true });

            const { data: recentLogs } = await supabase
                .from('auth_logs')
                .select('success')
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            const successfulAuth = recentLogs?.filter(log => log.success).length || 0;
            const totalAuth = recentLogs?.length || 1;
            const successRate = Math.round((successfulAuth / totalAuth) * 100);

            // Fetch server statistics
            const { count: activeServers } = await supabase
                .from('radius_servers')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Simulated system metrics (in real implementation, these would come from monitoring)
            const systemHealth = Math.floor(Math.random() * 20) + 80; // 80-100%
            const diskUsage = Math.floor(Math.random() * 30) + 40; // 40-70%
            const memoryUsage = Math.floor(Math.random() * 40) + 30; // 30-70%
            const cpuUsage = Math.floor(Math.random() * 50) + 20; // 20-70%
            const networkTraffic = Math.floor(Math.random() * 1000) + 500; // 500-1500 MB/s
            const securityScore = Math.floor(Math.random() * 20) + 85; // 85-100%

            setStats({
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                suspendedUsers: suspendedUsers || 0,
                adminUsers: adminUsers || 0,
                totalAuthRequests: totalAuthRequests || 0,
                successRate,
                activeServers: activeServers || 0,
                systemHealth,
                diskUsage,
                memoryUsage,
                cpuUsage,
                networkTraffic,
                securityScore,
                lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
                pendingAlerts: Math.floor(Math.random() * 10) + 1,
                criticalAlerts: Math.floor(Math.random() * 5)
            });
        } catch (error) {
            console.error('Error fetching system stats:', error);
            toast({
                title: "Error",
                description: "Failed to fetch system statistics",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemStats();
        const interval = setInterval(fetchSystemStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const getHealthColor = (value: number) => {
        if (value >= 90) return 'text-green-500';
        if (value >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getHealthBadge = (value: number) => {
        if (value >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
        if (value >= 70) return <Badge className="bg-yellow-500">Good</Badge>;
        return <Badge className="bg-red-500">Critical</Badge>;
    };

    if (!userProfile || userProfile.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <Card className="w-96 bg-black/20 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-red-500" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You don't have permission to access the admin dashboard.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-red-200 text-sm">System Administration & Control Center</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                                onClick={fetchSystemStats}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Badge className="bg-red-500">Admin Mode</Badge>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-8 bg-black/20 border-white/10">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-red-500">Overview</TabsTrigger>
                        <TabsTrigger value="users" className="data-[state=active]:bg-red-500">Users</TabsTrigger>
                        <TabsTrigger value="servers" className="data-[state=active]:bg-red-500">Servers</TabsTrigger>
                        <TabsTrigger value="monitoring" className="data-[state=active]:bg-red-500">Monitoring</TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-red-500">Security</TabsTrigger>
                        <TabsTrigger value="policies" className="data-[state=active]:bg-red-500">Policies</TabsTrigger>
                        <TabsTrigger value="backup" className="data-[state=active]:bg-red-500">Backup</TabsTrigger>
                        <TabsTrigger value="logs" className="data-[state=active]:bg-red-500">Logs</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* System Health Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-black/20 border-white/10 text-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-500">{stats.systemHealth}%</div>
                                    <Progress value={stats.systemHealth} className="mt-2" />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Overall system performance
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/20 border-white/10 text-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-500">{stats.securityScore}%</div>
                                    <Progress value={stats.securityScore} className="mt-2" />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Security posture assessment
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/20 border-white/10 text-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-cyan-500">{stats.activeUsers}</div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Currently online users
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/20 border-white/10 text-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Auth Success Rate</CardTitle>
                                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-500">{stats.successRate}%</div>
                                    <Progress value={stats.successRate} className="mt-2" />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Last 24 hours
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Resources */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-black/20 border-white/10 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Cpu className="h-5 w-5" />
                                        CPU Usage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-500">{stats.cpuUsage}%</div>
                                    <Progress value={stats.cpuUsage} className="mt-4" />
                                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                        <span>0%</span>
                                        <span>100%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/20 border-white/10 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MemoryStick className="h-5 w-5" />
                                        Memory Usage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-500">{stats.memoryUsage}%</div>
                                    <Progress value={stats.memoryUsage} className="mt-4" />
                                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                        <span>0%</span>
                                        <span>100%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/20 border-white/10 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HardDrive className="h-5 w-5" />
                                        Disk Usage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-yellow-500">{stats.diskUsage}%</div>
                                    <Progress value={stats.diskUsage} className="mt-4" />
                                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                        <span>0%</span>
                                        <span>100%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Common administrative tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add User
                                    </Button>
                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                        <Server className="h-4 w-4 mr-2" />
                                        Manage Servers
                                    </Button>
                                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                                        <Download className="h-4 w-4 mr-2" />
                                        Backup System
                                    </Button>
                                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                        <Settings className="h-4 w-4 mr-2" />
                                        System Settings
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader>
                                <CardTitle>Recent System Activity</CardTitle>
                                <CardDescription>Latest system events and alerts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span>System backup completed successfully</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">2 minutes ago</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                                            <span>High CPU usage detected on server-01</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">5 minutes ago</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="h-5 w-5 text-blue-500" />
                                            <span>New user registration: john.smith@radiuscorp.com</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">10 minutes ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users">
                        <UserManagement />
                    </TabsContent>

                    {/* Servers Tab */}
                    <TabsContent value="servers">
                        <RadiusServerManager />
                    </TabsContent>

                    {/* Monitoring Tab */}
                    <TabsContent value="monitoring">
                        <SystemMonitoring />
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                        <SecurityAudit />
                    </TabsContent>

                    {/* Policies Tab */}
                    <TabsContent value="policies">
                        <NetworkPolicies />
                    </TabsContent>

                    {/* Backup Tab */}
                    <TabsContent value="backup">
                        <BackupManager />
                    </TabsContent>

                    {/* Logs Tab */}
                    <TabsContent value="logs">
                        <div className="space-y-6">
                            <AuthenticationLogs />
                            <AuditLogs />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
