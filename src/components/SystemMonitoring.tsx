import { useState, useEffect } from 'react';
import {
    Activity,
    Server,
    Cpu,
    Memory,
    HardDrive,
    Network,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ServerMetrics {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'maintenance';
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    uptime: number;
    lastHeartbeat: string;
    connections: number;
    responseTime: number;
}

interface SystemMetrics {
    timestamp: string;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    activeConnections: number;
    authRequests: number;
    successRate: number;
}

const SystemMonitoring = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [servers, setServers] = useState<ServerMetrics[]>([]);
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Generate sample data for demonstration
    const generateSampleData = () => {
        const now = new Date();
        const data: SystemMetrics[] = [];

        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            data.push({
                timestamp: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                cpu: Math.floor(Math.random() * 60) + 20,
                memory: Math.floor(Math.random() * 50) + 30,
                disk: Math.floor(Math.random() * 30) + 40,
                network: Math.floor(Math.random() * 800) + 200,
                activeConnections: Math.floor(Math.random() * 100) + 50,
                authRequests: Math.floor(Math.random() * 1000) + 500,
                successRate: Math.floor(Math.random() * 20) + 80
            });
        }

        return data;
    };

    const generateServerData = () => {
        return [
            {
                id: '1',
                name: 'Primary RADIUS Server',
                status: 'online' as const,
                cpu: Math.floor(Math.random() * 40) + 30,
                memory: Math.floor(Math.random() * 30) + 40,
                disk: Math.floor(Math.random() * 20) + 50,
                network: Math.floor(Math.random() * 500) + 300,
                uptime: Math.floor(Math.random() * 100) + 50,
                lastHeartbeat: new Date().toLocaleTimeString(),
                connections: Math.floor(Math.random() * 200) + 100,
                responseTime: Math.floor(Math.random() * 50) + 10
            },
            {
                id: '2',
                name: 'Secondary RADIUS Server',
                status: 'online' as const,
                cpu: Math.floor(Math.random() * 35) + 25,
                memory: Math.floor(Math.random() * 25) + 35,
                disk: Math.floor(Math.random() * 15) + 45,
                network: Math.floor(Math.random() * 400) + 200,
                uptime: Math.floor(Math.random() * 80) + 40,
                lastHeartbeat: new Date().toLocaleTimeString(),
                connections: Math.floor(Math.random() * 150) + 80,
                responseTime: Math.floor(Math.random() * 40) + 15
            },
            {
                id: '3',
                name: 'Load Balancer',
                status: 'online' as const,
                cpu: Math.floor(Math.random() * 20) + 15,
                memory: Math.floor(Math.random() * 15) + 20,
                disk: Math.floor(Math.random() * 10) + 30,
                network: Math.floor(Math.random() * 1000) + 500,
                uptime: Math.floor(Math.random() * 120) + 60,
                lastHeartbeat: new Date().toLocaleTimeString(),
                connections: Math.floor(Math.random() * 300) + 200,
                responseTime: Math.floor(Math.random() * 20) + 5
            }
        ];
    };

    useEffect(() => {
        const fetchData = () => {
            setServers(generateServerData());
            setSystemMetrics(generateSampleData());
            setLoading(false);
        };

        fetchData();

        if (autoRefresh) {
            const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-500';
            case 'offline': return 'text-red-500';
            case 'maintenance': return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'online': return <Badge className="bg-green-500">Online</Badge>;
            case 'offline': return <Badge className="bg-red-500">Offline</Badge>;
            case 'maintenance': return <Badge className="bg-yellow-500">Maintenance</Badge>;
            default: return <Badge className="bg-gray-500">Unknown</Badge>;
        }
    };

    const getMetricColor = (value: number, threshold: number) => {
        if (value >= threshold) return 'text-red-500';
        if (value >= threshold * 0.8) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">System Monitoring</h2>
                    <p className="text-gray-300">Real-time system performance and health monitoring</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                    </Button>
                    <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => {
                                setServers(generateServerData());
                                setSystemMetrics(generateSampleData());
                                setLoading(false);
                            }, 1000);
                        }}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Now
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-black/20 border-white/10">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500">Overview</TabsTrigger>
                    <TabsTrigger value="servers" className="data-[state=active]:bg-blue-500">Servers</TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500">Performance</TabsTrigger>
                    <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-500">Alerts</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* System Health Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">92%</div>
                                <Progress value={92} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Overall system performance
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Servers</CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-500">{servers.filter(s => s.status === 'online').length}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Online servers
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
                                <Network className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-cyan-500">
                                    {servers.reduce((sum, server) => sum + server.connections, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Active connections
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">
                                    {Math.round(servers.reduce((sum, server) => sum + server.responseTime, 0) / servers.length)}ms
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Average response time
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Real-time Performance Chart */}
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Real-time System Performance (Last 24 Hours)</CardTitle>
                            <CardDescription>CPU, Memory, and Disk usage over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={systemMetrics}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#F9FAFB'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="memory" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="disk" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Servers Tab */}
                <TabsContent value="servers" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {servers.map((server) => (
                            <Card key={server.id} className="bg-black/20 border-white/10 text-white">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{server.name}</CardTitle>
                                        {getStatusBadge(server.status)}
                                    </div>
                                    <CardDescription className="text-gray-300">
                                        Last heartbeat: {server.lastHeartbeat}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* CPU Usage */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm">CPU Usage</span>
                                            <span className={`text-sm font-medium ${getMetricColor(server.cpu, 80)}`}>
                                                {server.cpu}%
                                            </span>
                                        </div>
                                        <Progress value={server.cpu} className="h-2" />
                                    </div>

                                    {/* Memory Usage */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm">Memory Usage</span>
                                            <span className={`text-sm font-medium ${getMetricColor(server.memory, 85)}`}>
                                                {server.memory}%
                                            </span>
                                        </div>
                                        <Progress value={server.memory} className="h-2" />
                                    </div>

                                    {/* Disk Usage */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm">Disk Usage</span>
                                            <span className={`text-sm font-medium ${getMetricColor(server.disk, 90)}`}>
                                                {server.disk}%
                                            </span>
                                        </div>
                                        <Progress value={server.disk} className="h-2" />
                                    </div>

                                    {/* Server Stats */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-500">{server.uptime}h</div>
                                            <div className="text-xs text-gray-400">Uptime</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-500">{server.connections}</div>
                                            <div className="text-xs text-gray-400">Connections</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    {/* Network Performance Chart */}
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Network Traffic & Authentication Requests</CardTitle>
                            <CardDescription>Real-time network performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={systemMetrics}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#F9FAFB'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="network" stroke="#8B5CF6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="authRequests" stroke="#EF4444" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    Peak Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Peak CPU:</span>
                                        <span className="text-green-500">78%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Peak Memory:</span>
                                        <span className="text-green-500">82%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Peak Network:</span>
                                        <span className="text-green-500">1.2 GB/s</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                    Bottlenecks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Disk I/O:</span>
                                        <span className="text-yellow-500">High</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Memory:</span>
                                        <span className="text-green-500">Normal</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Network:</span>
                                        <span className="text-green-500">Normal</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Minus className="h-5 w-5 text-blue-500" />
                                    Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <p>• Consider SSD upgrade for better I/O</p>
                                    <p>• Monitor memory usage trends</p>
                                    <p>• Network performance is optimal</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-6">
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>System Alerts & Notifications</CardTitle>
                            <CardDescription>Active system alerts and performance warnings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        <div>
                                            <div className="font-medium text-red-400">High CPU Usage Alert</div>
                                            <div className="text-sm text-red-300">Server-02 CPU usage is at 95%</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-red-500">Critical</Badge>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                        <div>
                                            <div className="font-medium text-yellow-400">Memory Usage Warning</div>
                                            <div className="text-sm text-yellow-300">Server-01 memory usage is at 87%</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-yellow-500">Warning</Badge>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <div className="font-medium text-green-400">System Health Restored</div>
                                            <div className="text-sm text-green-300">All systems are operating normally</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-500">Resolved</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SystemMonitoring;
