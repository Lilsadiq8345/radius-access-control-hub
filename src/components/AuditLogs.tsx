import { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    Calendar,
    User,
    Activity,
    Clock,
    Eye,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';

interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    resource: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failure' | 'warning' | 'info';
    severity: 'low' | 'medium' | 'high' | 'critical';
}

const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [userFilter, setUserFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    // Generate sample audit logs
    const generateSampleLogs = (): AuditLog[] => {
        const actions = [
            'User Login', 'User Logout', 'User Created', 'User Updated', 'User Deleted',
            'Role Changed', 'Permission Granted', 'Permission Revoked', 'Backup Started',
            'Backup Completed', 'System Configuration Changed', 'Security Policy Updated',
            'Network Access Granted', 'Network Access Denied', 'Data Exported', 'Data Imported'
        ];

        const resources = [
            'User Management', 'Authentication System', 'Backup System', 'Network Policies',
            'Security Settings', 'System Configuration', 'Database', 'File System'
        ];

        const statuses = ['success', 'failure', 'warning', 'info'];
        const severities = ['low', 'medium', 'high', 'critical'];
        const users = ['admin', 'user1', 'user2', 'system', 'backup-service'];

        const logs: AuditLog[] = [];

        for (let i = 0; i < 100; i++) {
            const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            const status = statuses[Math.floor(Math.random() * statuses.length)] as AuditLog['status'];
            const severity = severities[Math.floor(Math.random() * severities.length)] as AuditLog['severity'];

            logs.push({
                id: `log-${i + 1}`,
                timestamp: timestamp.toISOString(),
                user: users[Math.floor(Math.random() * users.length)],
                action: actions[Math.floor(Math.random() * actions.length)],
                resource: resources[Math.floor(Math.random() * resources.length)],
                details: `Audit log entry ${i + 1} - ${status} action performed`,
                ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                status,
                severity
            });
        }

        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    useEffect(() => {
        const fetchData = () => {
            setLogs(generateSampleLogs());
            setLoading(false);
        };

        fetchData();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
        const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
        const matchesUser = userFilter === 'all' || log.user === userFilter;

        return matchesSearch && matchesStatus && matchesSeverity && matchesUser;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-500';
            case 'failure': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            case 'info': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success': return <Badge className="bg-green-500">Success</Badge>;
            case 'failure': return <Badge className="bg-red-500">Failure</Badge>;
            case 'warning': return <Badge className="bg-yellow-500">Warning</Badge>;
            case 'info': return <Badge className="bg-blue-500">Info</Badge>;
            default: return <Badge className="bg-gray-500">Unknown</Badge>;
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical': return <Badge className="bg-red-600">Critical</Badge>;
            case 'high': return <Badge className="bg-orange-500">High</Badge>;
            case 'medium': return <Badge className="bg-yellow-500">Medium</Badge>;
            case 'low': return <Badge className="bg-green-500">Low</Badge>;
            default: return <Badge className="bg-gray-500">Unknown</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failure': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'info': return <Info className="h-4 w-4 text-blue-500" />;
            default: return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    const uniqueUsers = Array.from(new Set(logs.map(log => log.user)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
                    <p className="text-gray-300">Comprehensive system activity and user action logging</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Export Logs
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

            {/* Filters */}
            <Card className="bg-black/20 border-white/10 text-white">
                <CardHeader>
                    <CardTitle>Filter Logs</CardTitle>
                    <CardDescription>Search and filter audit log entries</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black/20 border-white/10 text-white placeholder:text-gray-400 mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white mt-1">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="failure">Failure</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="severity">Severity</Label>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white mt-1">
                                    <SelectValue placeholder="All Severities" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="all">All Severities</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="user">User</Label>
                            <Select value={userFilter} onValueChange={setUserFilter}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white mt-1">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="all">All Users</SelectItem>
                                    {uniqueUsers.map(user => (
                                        <SelectItem key={user} value={user}>{user}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card className="bg-black/20 border-white/10 text-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Audit Log Entries</CardTitle>
                            <CardDescription>
                                Showing {filteredLogs.length} of {logs.length} total entries
                            </CardDescription>
                        </div>
                        <div className="text-sm text-gray-400">
                            Last updated: {new Date().toLocaleString()}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-white/10">
                                        {getStatusIcon(log.status)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{log.action}</div>
                                        <div className="text-sm text-gray-400">
                                            {log.resource} • {log.user} • {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            IP: {log.ipAddress} • {log.details}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(log.status)}
                                    {getSeverityBadge(log.severity)}
                                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuditLogs;
