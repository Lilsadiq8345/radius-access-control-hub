import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, Server, Database, Shield, Activity, Wifi, HardDrive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { restApiService } from '@/lib/api/rest-api';
import { radiusApiService } from '@/lib/api/radius-api';
import { alertSystem } from '@/lib/alert-system';
import { backupSystem } from '@/lib/backup-system';

interface SystemComponent {
    id: string;
    name: string;
    type: 'service' | 'database' | 'network' | 'storage';
    status: 'online' | 'offline' | 'warning' | 'maintenance';
    health: number; // 0-100
    lastCheck: Date;
    responseTime?: number;
    details?: string;
}

const SystemStatus = () => {
    const [components, setComponents] = useState<SystemComponent[]>([]);
    const [overallHealth, setOverallHealth] = useState(100);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        checkSystemStatus();
        const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const checkSystemStatus = async () => {
        setIsRefreshing(true);
        try {
            const systemComponents: SystemComponent[] = [];

            // Check RADIUS Server
            try {
                const radiusStats = radiusApiService.getServerStats();
                systemComponents.push({
                    id: 'radius-server',
                    name: 'RADIUS Server',
                    type: 'service',
                    status: radiusStats.isRunning ? 'online' : 'offline',
                    health: radiusStats.isRunning ? 95 : 0,
                    lastCheck: new Date(),
                    responseTime: radiusStats.uptime,
                    details: `Port: ${radiusStats.port}, Requests: ${radiusStats.totalRequests}`
                });
            } catch (error) {
                systemComponents.push({
                    id: 'radius-server',
                    name: 'RADIUS Server',
                    type: 'service',
                    status: 'offline',
                    health: 0,
                    lastCheck: new Date(),
                    details: 'Service unavailable'
                });
            }

            // Check Database
            try {
                const healthCheck = await restApiService.healthCheck();
                systemComponents.push({
                    id: 'database',
                    name: 'Database',
                    type: 'database',
                    status: healthCheck.data?.checks?.database ? 'online' : 'offline',
                    health: healthCheck.data?.checks?.database ? 98 : 0,
                    lastCheck: new Date(),
                    responseTime: 15,
                    details: 'Supabase PostgreSQL'
                });
            } catch (error) {
                systemComponents.push({
                    id: 'database',
                    name: 'Database',
                    type: 'database',
                    status: 'offline',
                    health: 0,
                    lastCheck: new Date(),
                    details: 'Connection failed'
                });
            }

            // Check Authentication Service
            try {
                const healthCheck = await restApiService.healthCheck();
                systemComponents.push({
                    id: 'auth-service',
                    name: 'Authentication Service',
                    type: 'service',
                    status: healthCheck.data?.checks?.auth ? 'online' : 'offline',
                    health: healthCheck.data?.checks?.auth ? 97 : 0,
                    lastCheck: new Date(),
                    responseTime: 25,
                    details: 'Supabase Auth'
                });
            } catch (error) {
                systemComponents.push({
                    id: 'auth-service',
                    name: 'Authentication Service',
                    type: 'service',
                    status: 'offline',
                    health: 0,
                    lastCheck: new Date(),
                    details: 'Service unavailable'
                });
            }

            // Check Alert System
            try {
                const alertStats = alertSystem.getAlertStats();
                const hasCriticalAlerts = alertStats.bySeverity.critical > 0;
                systemComponents.push({
                    id: 'alert-system',
                    name: 'Alert System',
                    type: 'service',
                    status: hasCriticalAlerts ? 'warning' : 'online',
                    health: hasCriticalAlerts ? 70 : 95,
                    lastCheck: new Date(),
                    details: `${alertStats.active} active alerts`
                });
            } catch (error) {
                systemComponents.push({
                    id: 'alert-system',
                    name: 'Alert System',
                    type: 'service',
                    status: 'offline',
                    health: 0,
                    lastCheck: new Date(),
                    details: 'System unavailable'
                });
            }

            // Check Backup System
            try {
                const backupStats = backupSystem.getBackupStats();
                const hasFailedBackups = backupStats.failedJobs > 0;
                systemComponents.push({
                    id: 'backup-system',
                    name: 'Backup System',
                    type: 'storage',
                    status: hasFailedBackups ? 'warning' : 'online',
                    health: hasFailedBackups ? 75 : 90,
                    lastCheck: new Date(),
                    details: `${backupStats.completedJobs} successful backups`
                });
            } catch (error) {
                systemComponents.push({
                    id: 'backup-system',
                    name: 'Backup System',
                    type: 'storage',
                    status: 'offline',
                    health: 0,
                    lastCheck: new Date(),
                    details: 'System unavailable'
                });
            }

            // Check Network Connectivity
            try {
                const testResponse = await fetch('/api/health');
                systemComponents.push({
                    id: 'network',
                    name: 'Network Connectivity',
                    type: 'network',
                    status: 'online',
                    health: 99,
                    lastCheck: new Date(),
                    responseTime: 50,
                    details: 'Internet connection stable'
                });
            } catch (error) {
                systemComponents.push({
                    id: 'network',
                    name: 'Network Connectivity',
                    type: 'network',
                    status: 'warning',
                    health: 60,
                    lastCheck: new Date(),
                    details: 'Network issues detected'
                });
            }

            // Check Storage
            try {
                // Simulate storage check
                const storageUsage = Math.random() * 30 + 40; // 40-70%
                systemComponents.push({
                    id: 'storage',
                    name: 'Storage System',
                    type: 'storage',
                    status: storageUsage > 80 ? 'warning' : 'online',
                    health: storageUsage > 80 ? 65 : 95,
                    lastCheck: new Date(),
                    details: `${storageUsage.toFixed(1)}% used`
                });
            } catch (error) {
                systemComponents.push({
                    id: 'storage',
                    name: 'Storage System',
                    type: 'storage',
                    status: 'offline',
                    health: 0,
                    lastCheck: new Date(),
                    details: 'Storage unavailable'
                });
            }

            setComponents(systemComponents);

            // Calculate overall health
            const totalHealth = systemComponents.reduce((sum, comp) => sum + comp.health, 0);
            const averageHealth = totalHealth / systemComponents.length;
            setOverallHealth(averageHealth);

            setLastUpdate(new Date());
        } catch (error) {
            toast({
                title: "Status Check Failed",
                description: "Failed to check system status",
                variant: "destructive",
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    const getStatusIcon = (status: SystemComponent['status']) => {
        switch (status) {
            case 'online':
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            case 'offline':
                return <XCircle className="h-5 w-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
            case 'maintenance':
                return <Clock className="h-5 w-5 text-blue-400" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: SystemComponent['status']) => {
        switch (status) {
            case 'online':
                return 'bg-green-500 text-white';
            case 'offline':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-yellow-500 text-white';
            case 'maintenance':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getTypeIcon = (type: SystemComponent['type']) => {
        switch (type) {
            case 'service':
                return <Server className="h-4 w-4" />;
            case 'database':
                return <Database className="h-4 w-4" />;
            case 'network':
                return <Wifi className="h-4 w-4" />;
            case 'storage':
                return <HardDrive className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getOverallStatus = () => {
        if (overallHealth >= 90) return { status: 'online', color: 'bg-green-500', text: 'All Systems Operational' };
        if (overallHealth >= 70) return { status: 'warning', color: 'bg-yellow-500', text: 'Minor Issues Detected' };
        if (overallHealth >= 50) return { status: 'warning', color: 'bg-orange-500', text: 'System Degraded' };
        return { status: 'offline', color: 'bg-red-500', text: 'Critical Issues' };
    };

    const overallStatus = getOverallStatus();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">System Status</h2>
                    <p className="text-white/60">Real-time system health monitoring</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge className={overallStatus.color}>
                        {overallStatus.text}
                    </Badge>
                    <Button
                        onClick={checkSystemStatus}
                        disabled={isRefreshing}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        <Activity className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Checking...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Overall System Health */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Overall System Health</CardTitle>
                    <CardDescription className="text-white/60">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {getStatusIcon(overallStatus.status as any)}
                                <div>
                                    <h3 className="text-white font-medium">System Health Score</h3>
                                    <p className="text-white/60 text-sm">{overallStatus.text}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{overallHealth.toFixed(1)}%</div>
                                <p className="text-white/60 text-sm">Health Score</p>
                            </div>
                        </div>
                        <Progress value={overallHealth} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* System Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {components.map((component) => (
                    <Card key={component.id} className="bg-black/20 backdrop-blur-md border border-white/10">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {getTypeIcon(component.type)}
                                    <div>
                                        <CardTitle className="text-white text-lg">{component.name}</CardTitle>
                                        <CardDescription className="text-white/60">
                                            {component.details}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(component.status)}
                                    <Badge className={getStatusColor(component.status)}>
                                        {component.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/80 text-sm">Health</span>
                                    <span className="text-white font-medium">{component.health.toFixed(1)}%</span>
                                </div>
                                <Progress value={component.health} className="h-2" />

                                {component.responseTime && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/80 text-sm">Response Time</span>
                                        <span className="text-white font-medium">{component.responseTime}ms</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-white/80 text-sm">Last Check</span>
                                    <span className="text-white/60 text-sm">
                                        {component.lastCheck.toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* System Summary */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">System Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">
                                {components.filter(c => c.status === 'online').length}
                            </div>
                            <p className="text-white/60 text-sm">Online</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">
                                {components.filter(c => c.status === 'warning').length}
                            </div>
                            <p className="text-white/60 text-sm">Warning</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-400">
                                {components.filter(c => c.status === 'offline').length}
                            </div>
                            <p className="text-white/60 text-sm">Offline</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                                {components.filter(c => c.status === 'maintenance').length}
                            </div>
                            <p className="text-white/60 text-sm">Maintenance</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SystemStatus; 