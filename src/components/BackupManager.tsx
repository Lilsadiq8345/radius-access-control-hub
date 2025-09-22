import { useState, useEffect } from 'react';
import {
    Download,
    Upload,
    HardDrive,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Play,
    Pause,
    Settings,
    FileText,
    Database,
    Server,
    Cloud,
    Trash2,
    Eye,
    Calendar,
    BarChart3,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface BackupJob {
    id: string;
    name: string;
    type: 'full' | 'incremental' | 'differential';
    status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused';
    progress: number;
    size: string;
    startTime: string;
    endTime?: string;
    duration?: string;
    destination: 'local' | 'cloud' | 'network';
    retention: number;
    lastBackup: string;
    nextBackup: string;
}

interface BackupSchedule {
    id: string;
    name: string;
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time: string;
    days?: string[];
    retention: number;
    compression: boolean;
    encryption: boolean;
}

const BackupManager = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
    const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Generate sample backup data
    const generateSampleBackups = (): BackupJob[] => {
        const types = ['full', 'incremental', 'differential'];
        const statuses = ['running', 'completed', 'failed', 'scheduled', 'paused'];
        const destinations = ['local', 'cloud', 'network'];

        const jobs: BackupJob[] = [];

        for (let i = 0; i < 10; i++) {
            const type = types[Math.floor(Math.random() * types.length)] as BackupJob['type'];
            const status = statuses[Math.floor(Math.random() * statuses.length)] as BackupJob['status'];
            const destination = destinations[Math.floor(Math.random() * destinations.length)] as BackupJob['destination'];

            const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            const endTime = status === 'completed' ? new Date(startTime.getTime() + Math.random() * 2 * 60 * 60 * 1000) : undefined;
            const duration = endTime ? `${Math.floor((endTime.getTime() - startTime.getTime()) / 60000)}m` : undefined;

            jobs.push({
                id: `backup-${i + 1}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Backup ${i + 1}`,
                type,
                status,
                progress: status === 'running' ? Math.floor(Math.random() * 100) : status === 'completed' ? 100 : 0,
                size: `${(Math.random() * 100 + 50).toFixed(1)} GB`,
                startTime: startTime.toISOString(),
                endTime: endTime?.toISOString(),
                duration,
                destination,
                retention: Math.floor(Math.random() * 30) + 7,
                lastBackup: startTime.toLocaleDateString(),
                nextBackup: new Date(startTime.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()
            });
        }

        return jobs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    };

    const generateSampleSchedules = (): BackupSchedule[] => {
        const frequencies = ['hourly', 'daily', 'weekly', 'monthly'];

        return [
            {
                id: 'schedule-1',
                name: 'Daily Database Backup',
                enabled: true,
                frequency: 'daily',
                time: '02:00',
                retention: 30,
                compression: true,
                encryption: true
            },
            {
                id: 'schedule-2',
                name: 'Weekly Full System Backup',
                enabled: true,
                frequency: 'weekly',
                time: '03:00',
                days: ['sunday'],
                retention: 12,
                compression: true,
                encryption: true
            },
            {
                id: 'schedule-3',
                name: 'Monthly Archive Backup',
                enabled: false,
                frequency: 'monthly',
                time: '04:00',
                retention: 60,
                compression: true,
                encryption: false
            }
        ];
    };

    useEffect(() => {
        const fetchData = () => {
            setBackupJobs(generateSampleBackups());
            setSchedules(generateSampleSchedules());
            setLoading(false);
        };

        fetchData();

        if (autoRefresh) {
            const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-blue-500';
            case 'completed': return 'text-green-500';
            case 'failed': return 'text-red-500';
            case 'scheduled': return 'text-yellow-500';
            case 'paused': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'running': return <Badge className="bg-blue-500">Running</Badge>;
            case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
            case 'failed': return <Badge className="bg-red-500">Failed</Badge>;
            case 'scheduled': return <Badge className="bg-yellow-500">Scheduled</Badge>;
            case 'paused': return <Badge className="bg-gray-500">Paused</Badge>;
            default: return <Badge className="bg-gray-500">Unknown</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'full': return <Badge className="bg-purple-500">Full</Badge>;
            case 'incremental': return <Badge className="bg-blue-500">Incremental</Badge>;
            case 'differential': return <Badge className="bg-green-500">Differential</Badge>;
            default: return <Badge className="bg-gray-500">Unknown</Badge>;
        }
    };

    const getDestinationIcon = (destination: string) => {
        switch (destination) {
            case 'local': return <HardDrive className="h-4 w-4" />;
            case 'cloud': return <Cloud className="h-4 w-4" />;
            case 'network': return <Server className="h-4 w-4" />;
            default: return <HardDrive className="h-4 w-4" />;
        }
    };

    const runningJobs = backupJobs.filter(job => job.status === 'running');
    const completedJobs = backupJobs.filter(job => job.status === 'completed');
    const failedJobs = backupJobs.filter(job => job.status === 'failed');
    const totalSize = backupJobs.reduce((sum, job) => sum + parseFloat(job.size), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Backup & Recovery Manager</h2>
                    <p className="text-gray-300">Comprehensive backup management and disaster recovery</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                        <Play className="h-4 w-4 mr-2" />
                        Start Backup
                    </Button>
                    <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 bg-black/20 border-white/10">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-green-500">Overview</TabsTrigger>
                    <TabsTrigger value="jobs" className="data-[state=active]:bg-green-500">Backup Jobs</TabsTrigger>
                    <TabsTrigger value="schedules" className="data-[state=active]:bg-green-500">Schedules</TabsTrigger>
                    <TabsTrigger value="storage" className="data-[state=active]:bg-green-500">Storage</TabsTrigger>
                    <TabsTrigger value="recovery" className="data-[state=active]:bg-green-500">Recovery</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Backup Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-500">{backupJobs.length}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    All backup jobs
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-500">{runningJobs.length}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Currently active
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">
                                    {backupJobs.length > 0 ? Math.round((completedJobs.length / backupJobs.length) * 100) : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Successful backups
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                                <HardDrive className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-500">{totalSize.toFixed(1)} GB</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Backup storage used
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Backup Activity */}
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Recent Backup Activity</CardTitle>
                            <CardDescription>Latest backup jobs and their status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {backupJobs.slice(0, 5).map((job) => (
                                    <div key={job.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${getStatusColor(job.status)}`}>
                                                {getDestinationIcon(job.destination)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{job.name}</div>
                                                <div className="text-sm text-gray-400">
                                                    {job.type} • {job.size} • {new Date(job.startTime).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getTypeBadge(job.type)}
                                            {getStatusBadge(job.status)}
                                            {job.status === 'running' && (
                                                <div className="text-sm text-blue-400">
                                                    {job.progress}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Quick Backup Actions</CardTitle>
                            <CardDescription>Common backup operations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button className="bg-green-500 hover:bg-green-600 text-white">
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Backup
                                </Button>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Restore Data
                                </Button>
                                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Configure
                                </Button>
                                <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Reports
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Backup Jobs Tab */}
                <TabsContent value="jobs" className="space-y-6">
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Backup Jobs</CardTitle>
                            <CardDescription>Manage and monitor all backup operations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {backupJobs.map((job) => (
                                    <div key={job.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-medium text-white">{job.name}</h4>
                                                {getTypeBadge(job.type)}
                                                {getStatusBadge(job.status)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {job.status === 'running' && (
                                                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                        <Pause className="h-4 w-4 mr-1" />
                                                        Pause
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                            <div>
                                                <span className="text-gray-400">Size:</span>
                                                <span className="ml-2 text-white">{job.size}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Destination:</span>
                                                <span className="ml-2 text-white capitalize">{job.destination}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Retention:</span>
                                                <span className="ml-2 text-white">{job.retention} days</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Last Run:</span>
                                                <span className="ml-2 text-white">{job.lastBackup}</span>
                                            </div>
                                        </div>

                                        {job.status === 'running' && (
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Progress</span>
                                                    <span>{job.progress}%</span>
                                                </div>
                                                <Progress value={job.progress} className="h-2" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            <span>Started: {new Date(job.startTime).toLocaleString()}</span>
                                            {job.endTime && <span>Completed: {new Date(job.endTime).toLocaleString()}</span>}
                                            {job.duration && <span>Duration: {job.duration}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Schedules Tab */}
                <TabsContent value="schedules" className="space-y-6">
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Backup Schedules</CardTitle>
                                    <CardDescription>Configure automated backup schedules</CardDescription>
                                </div>
                                <Button className="bg-green-500 hover:bg-green-600 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Schedule
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {schedules.map((schedule) => (
                                    <div key={schedule.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-medium text-white">{schedule.name}</h4>
                                                <Badge className={schedule.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                                                    {schedule.enabled ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge className="bg-blue-500 capitalize">{schedule.frequency}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                    <Settings className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Run Now
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-400">Time:</span>
                                                <span className="ml-2 text-white">{schedule.time}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Retention:</span>
                                                <span className="ml-2 text-white">{schedule.retention} days</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Compression:</span>
                                                <span className="ml-2 text-white">{schedule.compression ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Encryption:</span>
                                                <span className="ml-2 text-white">{schedule.encryption ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Storage Tab */}
                <TabsContent value="storage" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader>
                                <CardTitle>Storage Overview</CardTitle>
                                <CardDescription>Backup storage utilization and management</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Local Storage</span>
                                            <span>75% used</span>
                                        </div>
                                        <Progress value={75} className="h-2" />
                                        <p className="text-xs text-gray-400 mt-1">750 GB / 1 TB</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Cloud Storage</span>
                                            <span>45% used</span>
                                        </div>
                                        <Progress value={45} className="h-2" />
                                        <p className="text-xs text-gray-400 mt-1">450 GB / 1 TB</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Network Storage</span>
                                            <span>30% used</span>
                                        </div>
                                        <Progress value={30} className="h-2" />
                                        <p className="text-xs text-gray-400 mt-1">300 GB / 1 TB</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10 text-white">
                            <CardHeader>
                                <CardTitle>Storage Actions</CardTitle>
                                <CardDescription>Manage backup storage</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                        <HardDrive className="h-4 w-4 mr-2" />
                                        Add Storage Location
                                    </Button>
                                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Cleanup Old Backups
                                    </Button>
                                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Migrate Data
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Recovery Tab */}
                <TabsContent value="recovery" className="space-y-6">
                    <Card className="bg-black/20 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Disaster Recovery</CardTitle>
                            <CardDescription>Recovery procedures and testing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium mb-4">Recovery Procedures</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <h5 className="font-medium text-green-400">Full System Recovery</h5>
                                            <p className="text-sm text-gray-400">Complete system restoration from backup</p>
                                            <Button size="sm" className="mt-2 bg-green-500 hover:bg-green-600 text-white">
                                                <Play className="h-4 w-4 mr-1" />
                                                Start Recovery
                                            </Button>
                                        </div>

                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <h5 className="font-medium text-blue-400">Database Recovery</h5>
                                            <p className="text-sm text-gray-400">Restore specific database from backup</p>
                                            <Button size="sm" className="mt-2 bg-blue-500 hover:bg-blue-600 text-white">
                                                <Database className="h-4 w-4 mr-1" />
                                                Select Database
                                            </Button>
                                        </div>

                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <h5 className="font-medium text-yellow-400">File Recovery</h5>
                                            <p className="text-sm text-gray-400">Restore individual files or directories</p>
                                            <Button size="sm" className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white">
                                                <FileText className="h-4 w-4 mr-1" />
                                                Browse Files
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-4">Recovery Testing</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <h5 className="font-medium text-purple-400">Test Recovery</h5>
                                            <p className="text-sm text-gray-400">Test recovery procedures in safe environment</p>
                                            <Button size="sm" className="mt-2 bg-purple-500 hover:bg-purple-600 text-white">
                                                <Play className="h-4 w-4 mr-1" />
                                                Run Test
                                            </Button>
                                        </div>

                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <h5 className="font-medium text-cyan-400">Recovery Drill</h5>
                                            <p className="text-sm text-gray-400">Simulate disaster recovery scenario</p>
                                            <Button size="sm" className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-white">
                                                <AlertTriangle className="h-4 w-4 mr-1" />
                                                Start Drill
                                            </Button>
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

export default BackupManager; 