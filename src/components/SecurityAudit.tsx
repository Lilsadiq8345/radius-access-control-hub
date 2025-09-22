import { useState, useEffect } from 'react';
import {
    Shield,
    Lock,
    Eye,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Network,
    Key,
    FileText,
    Download,
    RefreshCw,
    Search,
    Filter,
    Calendar,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SecurityEvent {
    id: string;
    timestamp: string;
    type: 'authentication' | 'authorization' | 'network' | 'system' | 'data';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    source: string;
    user?: string;
    ipAddress?: string;
    status: 'resolved' | 'investigating' | 'open';
    riskScore: number;
}

interface SecurityMetrics {
    totalEvents: number;
    criticalEvents: number;
    highRiskEvents: number;
    resolvedEvents: number;
    averageRiskScore: number;
    securityScore: number;
    lastScan: string;
    vulnerabilitiesFound: number;
    patchesApplied: number;
}

const SecurityAudit = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [metrics, setMetrics] = useState<SecurityMetrics>({
        totalEvents: 0,
        criticalEvents: 0,
        highRiskEvents: 0,
        resolvedEvents: 0,
        averageRiskScore: 0,
        securityScore: 0,
        lastScan: '',
        vulnerabilitiesFound: 0,
        patchesApplied: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    // Generate sample security events
    const generateSampleEvents = (): SecurityEvent[] => {
        const eventTypes = ['authentication', 'authorization', 'network', 'system', 'data'];
        const severities = ['low', 'medium', 'high', 'critical'];
        const statuses = ['resolved', 'investigating', 'open'];
        const sources = ['RADIUS Server', 'Web Interface', 'API Gateway', 'Database', 'Network Device'];

        const events: SecurityEvent[] = [];

        for (let i = 0; i < 50; i++) {
            const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            const severity = severities[Math.floor(Math.random() * severities.length)] as SecurityEvent['severity'];
            const riskScore = severity === 'critical' ? Math.floor(Math.random() * 20) + 80 :
                severity === 'high' ? Math.floor(Math.random() * 20) + 60 :
                    severity === 'medium' ? Math.floor(Math.random() * 20) + 40 :
                        Math.floor(Math.random() * 20) + 20;

            events.push({
                id: `event-${i + 1}`,
                timestamp: timestamp.toISOString(),
                type: eventTypes[Math.floor(Math.random() * eventTypes.length)] as SecurityEvent['type'],
                severity,
                description: `Security event ${i + 1} - ${severity} priority issue detected`,
                source: sources[Math.floor(Math.random() * sources.length)],
                user: Math.random() > 0.5 ? `user${Math.floor(Math.random() * 100)}@radiuscorp.com` : undefined,
                ipAddress: Math.random() > 0.3 ? `192.168.1.${Math.floor(Math.random() * 255)}` : undefined,
                status: statuses[Math.floor(Math.random() * statuses.length)] as SecurityEvent['status'],
                riskScore
            });
        }

        return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    useEffect(() => {
        const fetchData = () => {
            const sampleEvents = generateSampleEvents();
            setEvents(sampleEvents);

            const totalEvents = sampleEvents.length;
            const criticalEvents = sampleEvents.filter(e => e.severity === 'critical').length;
            const highRiskEvents = sampleEvents.filter(e => e.severity === 'high').length;
            const resolvedEvents = sampleEvents.filter(e => e.status === 'resolved').length;
            const averageRiskScore = Math.round(sampleEvents.reduce((sum, e) => sum + e.riskScore, 0) / totalEvents);
            const securityScore = Math.max(0, 100 - (criticalEvents * 10) - (highRiskEvents * 5));

            setMetrics({
                totalEvents,
                criticalEvents,
                highRiskEvents,
                resolvedEvents,
                averageRiskScore,
                securityScore,
                lastScan: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString(),
                vulnerabilitiesFound: Math.floor(Math.random() * 20) + 5,
                patchesApplied: Math.floor(Math.random() * 15) + 10
            });

            setLoading(false);
        };

        fetchData();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.user && event.user.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical': return <Badge className="bg-red-500">Critical</Badge>;
            case 'high': return <Badge className="bg-orange-500">High</Badge>;
            case 'medium': return <Badge className="bg-yellow-500">Medium</Badge>;
            case 'low': return <Badge className="bg-green-500">Low</Badge>;
            default: return <Badge className="bg-gray-500">Unknown</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'resolved': return <Badge className="bg-green-500">Resolved</Badge>;
            case 'investigating': return <Badge className="bg-blue-500">Investigating</Badge>;
            case 'open': return <Badge className="bg-red-500">Open</Badge>;
            default: return <Badge className="bg-gray-500">Unknown</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'authentication': return <Key className="h-4 w-4" />;
            case 'authorization': return <Lock className="h-4 w-4" />;
            case 'network': return <Network className="h-4 w-4" />;
            case 'system': return <Activity className="h-4 w-4" />;
            case 'data': return <FileText className="h-4 w-4" />;
            default: return <Shield className="h-4 w-4" />;
        }
    };

    const generateChartData = () => {
        const now = new Date();
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                events: Math.floor(Math.random() * 20) + 5,
                riskScore: Math.floor(Math.random() * 30) + 40
            });
        }

        return data;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Security Audit & Compliance</h2>
                    <p className="text-gray-300">Comprehensive security monitoring and threat detection</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-black/20 border-white/10">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-red-500">Overview</TabsTrigger>
                    <TabsTrigger value="events" className="data-[state=active]:bg-red-500">Events</TabsTrigger>
                    <TabsTrigger value="threats" className="data-[state=active]:bg-red-500">Threats</TabsTrigger>
                    <TabsTrigger value="compliance" className="data-[state=active]:bg-red-500">Compliance</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Security Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{metrics.securityScore}%</div>
                                <Progress value={metrics.securityScore} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Overall security posture
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-500">{metrics.criticalEvents}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Requires immediate attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
                                <XCircle className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-500">{metrics.vulnerabilitiesFound}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Security vulnerabilities found
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Patches Applied</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{metrics.patchesApplied}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Security patches installed
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security Trends Chart */}
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Security Events & Risk Score Trends (Last 7 Days)</CardTitle>
                            <CardDescription>Daily security event count and average risk score</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={generateChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#F9FAFB'
                                        }}
                                    />
                                    <Bar dataKey="events" fill="#EF4444" />
                                    <Line type="monotone" dataKey="riskScore" stroke="#3B82F6" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Quick Security Actions */}
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Quick Security Actions</CardTitle>
                            <CardDescription>Common security tasks and responses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button className="bg-red-500 hover:bg-red-600 text-white">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Run Security Scan
                                </Button>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                    <Lock className="h-4 w-4 mr-2" />
                                    Update Policies
                                </Button>
                                <Button className="bg-green-500 hover:bg-green-600 text-white">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Review Access
                                </Button>
                                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Schedule Audit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events" className="space-y-6">
                    {/* Filters */}
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Security Events</CardTitle>
                            <CardDescription>Filter and search through security events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search events..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-400"
                                    />
                                </div>
                                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                    <SelectTrigger className="w-48 bg-black/20 border-white/10 text-white">
                                        <SelectValue placeholder="Filter by severity" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                        <SelectItem value="all">All Severities</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48 bg-black/20 border-white/10 text-white">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="investigating">Investigating</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Events List */}
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                                                {getTypeIcon(event.type)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{event.description}</div>
                                                <div className="text-sm text-gray-400">
                                                    {event.source} • {new Date(event.timestamp).toLocaleString()}
                                                    {event.user && ` • User: ${event.user}`}
                                                    {event.ipAddress && ` • IP: ${event.ipAddress}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getSeverityBadge(event.severity)}
                                            {getStatusBadge(event.status)}
                                            <div className="text-sm text-gray-400">
                                                Risk: {event.riskScore}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Threats Tab */}
                <TabsContent value="threats" className="space-y-6">
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Active Threats & Vulnerabilities</CardTitle>
                            <CardDescription>Current security threats and mitigation status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-red-400">SQL Injection Attempt</h4>
                                        <Badge className="bg-red-500">Active</Badge>
                                    </div>
                                    <p className="text-sm text-red-300 mb-2">
                                        Multiple SQL injection attempts detected from IP 192.168.1.100
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-red-300">
                                        <span>Source: Web Interface</span>
                                        <span>Risk Score: 95</span>
                                        <span>Detected: 2 hours ago</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-yellow-400">Brute Force Attack</h4>
                                        <Badge className="bg-yellow-500">Investigating</Badge>
                                    </div>
                                    <p className="text-sm text-yellow-300 mb-2">
                                        Multiple failed login attempts detected for user admin
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-yellow-300">
                                        <span>Source: RADIUS Server</span>
                                        <span>Risk Score: 78</span>
                                        <span>Detected: 1 hour ago</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-blue-400">Suspicious Network Activity</h4>
                                        <Badge className="bg-blue-500">Monitoring</Badge>
                                    </div>
                                    <p className="text-sm text-blue-300 mb-2">
                                        Unusual network traffic pattern detected from internal subnet
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-blue-300">
                                        <span>Source: Network Monitor</span>
                                        <span>Risk Score: 45</span>
                                        <span>Detected: 30 minutes ago</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Compliance Tab */}
                <TabsContent value="compliance" className="space-y-6">
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Compliance & Audit Status</CardTitle>
                            <CardDescription>Security compliance metrics and audit results</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium mb-4">Compliance Standards</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span>ISO 27001</span>
                                            <Badge className="bg-green-500">Compliant</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span>GDPR</span>
                                            <Badge className="bg-green-500">Compliant</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span>PCI DSS</span>
                                            <Badge className="bg-yellow-500">Partial</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span>HIPAA</span>
                                            <Badge className="bg-green-500">Compliant</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-4">Audit Results</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span>Last Security Audit</span>
                                            <span className="text-sm text-gray-400">2 weeks ago</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span>Next Scheduled Audit</span>
                                            <span className="text-sm text-gray-400">3 months</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span>Compliance Score</span>
                                            <span className="text-green-500 font-medium">87%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span>Open Findings</span>
                                            <span className="text-yellow-500 font-medium">3</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SecurityAudit;
