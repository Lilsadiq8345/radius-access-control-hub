import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Users, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LiveEvent {
    id: string;
    type: 'auth_success' | 'auth_failure' | 'server_status' | 'user_activity';
    message: string;
    timestamp: Date;
    details?: any;
}

const RealTimeMonitor = () => {
    const [events, setEvents] = useState<LiveEvent[]>([]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [stats, setStats] = useState({
        totalEvents: 0,
        successCount: 0,
        failureCount: 0,
        activeUsers: 0
    });
    const { toast } = useToast();

    useEffect(() => {
        if (isMonitoring) {
            startMonitoring();
        }
        return () => {
            // Cleanup monitoring
        };
    }, [isMonitoring]);

    const startMonitoring = () => {
        // Simulate real-time events
        const interval = setInterval(() => {
            const newEvent: LiveEvent = {
                id: Date.now().toString(),
                type: Math.random() > 0.3 ? 'auth_success' : 'auth_failure',
                message: generateEventMessage(),
                timestamp: new Date(),
                details: {
                    username: `user${Math.floor(Math.random() * 100)}@radiuscorp.com`,
                    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    nas: `switch-${Math.floor(Math.random() * 10)}`
                }
            };

            setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
            updateStats(newEvent);
        }, 2000);

        return () => clearInterval(interval);
    };

    const generateEventMessage = () => {
        const messages = [
            'User authentication successful',
            'Invalid credentials provided',
            'Account locked due to failed attempts',
            'User session started',
            'User session terminated',
            'Network policy applied',
            'Server health check passed'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    const updateStats = (event: LiveEvent) => {
        setStats(prev => ({
            totalEvents: prev.totalEvents + 1,
            successCount: event.type === 'auth_success' ? prev.successCount + 1 : prev.successCount,
            failureCount: event.type === 'auth_failure' ? prev.failureCount + 1 : prev.failureCount,
            activeUsers: Math.floor(Math.random() * 50) + 10
        }));
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'auth_success':
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'auth_failure':
                return <AlertCircle className="h-4 w-4 text-red-400" />;
            case 'server_status':
                return <Server className="h-4 w-4 text-blue-400" />;
            default:
                return <Activity className="h-4 w-4 text-yellow-400" />;
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'auth_success':
                return 'border-green-500/20 bg-green-500/10';
            case 'auth_failure':
                return 'border-red-500/20 bg-red-500/10';
            case 'server_status':
                return 'border-blue-500/20 bg-blue-500/10';
            default:
                return 'border-yellow-500/20 bg-yellow-500/10';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Real-Time Monitor</h2>
                    <p className="text-white/60">Live RADIUS authentication events and system status</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge variant={isMonitoring ? "default" : "secondary"}>
                        {isMonitoring ? "Monitoring" : "Stopped"}
                    </Badge>
                    <Button
                        onClick={() => setIsMonitoring(!isMonitoring)}
                        variant={isMonitoring ? "destructive" : "default"}
                        className={isMonitoring ? "" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"}
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
                    </Button>
                </div>
            </div>

            {/* Live Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Total Events
                        </CardTitle>
                        <Activity className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
                        <p className="text-xs text-white/60">
                            Since monitoring started
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Success Rate
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {stats.totalEvents > 0 ? Math.round((stats.successCount / stats.totalEvents) * 100) : 0}%
                        </div>
                        <p className="text-xs text-green-400">
                            {stats.successCount} successful
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Failures
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.failureCount}</div>
                        <p className="text-xs text-red-400">
                            Authentication failures
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Active Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
                        <p className="text-xs text-white/60">
                            Currently connected
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Live Events Feed */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Live Events Feed</CardTitle>
                    <CardDescription className="text-white/60">
                        Real-time RADIUS authentication events
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {events.length === 0 ? (
                            <div className="text-center py-8 text-white/60">
                                {isMonitoring ? "Waiting for events..." : "Monitoring is stopped"}
                            </div>
                        ) : (
                            events.map((event) => (
                                <div
                                    key={event.id}
                                    className={`flex items-center space-x-3 p-3 rounded-lg border ${getEventColor(event.type)}`}
                                >
                                    {getEventIcon(event.type)}
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{event.message}</p>
                                        {event.details && (
                                            <div className="text-xs text-white/60 mt-1">
                                                <span className="mr-3">User: {event.details.username}</span>
                                                <span className="mr-3">IP: {event.details.ip}</span>
                                                <span>NAS: {event.details.nas}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-white/60 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {event.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">System Health</CardTitle>
                        <CardDescription className="text-white/60">
                            Current system status and performance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white">RADIUS Server</span>
                            <Badge className="bg-green-500 text-white">Online</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white">Database</span>
                            <Badge className="bg-green-500 text-white">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white">Network</span>
                            <Badge className="bg-green-500 text-white">Stable</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white">Memory Usage</span>
                            <span className="text-white">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white">CPU Usage</span>
                            <span className="text-white">23%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Alerts</CardTitle>
                        <CardDescription className="text-white/60">
                            System alerts and notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                            <div>
                                <p className="text-white text-sm">High authentication failure rate</p>
                                <p className="text-white/60 text-xs">2 minutes ago</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                            <Server className="h-4 w-4 text-blue-400" />
                            <div>
                                <p className="text-white text-sm">Backup server activated</p>
                                <p className="text-white/60 text-xs">5 minutes ago</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-2 rounded bg-green-500/10 border border-green-500/20">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <div>
                                <p className="text-white text-sm">System backup completed</p>
                                <p className="text-white/60 text-xs">1 hour ago</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RealTimeMonitor; 