import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Filter, Bell, X, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { alertSystem, Alert, AlertSeverity, AlertType } from '@/lib/alert-system';

const AlertManager = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filterType, setFilterType] = useState<AlertType | 'all'>('all');
    const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [showResolved, setShowResolved] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Start monitoring
        alertSystem.startMonitoring();
        setIsMonitoring(true);

        // Set up event listeners
        const handleAlertCreated = (alert: Alert) => {
            setAlerts(prev => [alert, ...prev]);
            toast({
                title: alert.title,
                description: alert.message,
                variant: getSeverityVariant(alert.severity),
            });
        };

        const handleAlertAcknowledged = (alert: Alert) => {
            setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a));
        };

        const handleAlertResolved = (alert: Alert) => {
            setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a));
        };

        alertSystem.on('alert_created', handleAlertCreated);
        alertSystem.on('alert_acknowledged', handleAlertAcknowledged);
        alertSystem.on('alert_resolved', handleAlertResolved);

        // Load initial alerts
        loadAlerts();

        return () => {
            alertSystem.off('alert_created', handleAlertCreated);
            alertSystem.off('alert_acknowledged', handleAlertAcknowledged);
            alertSystem.off('alert_resolved', handleAlertResolved);
            alertSystem.stopMonitoring();
        };
    }, []);

    const loadAlerts = () => {
        const allAlerts = alertSystem.getAlerts();
        setAlerts(allAlerts);
    };

    const getSeverityVariant = (severity: AlertSeverity) => {
        switch (severity) {
            case AlertSeverity.CRITICAL:
                return 'destructive';
            case AlertSeverity.HIGH:
                return 'destructive';
            case AlertSeverity.MEDIUM:
                return 'default';
            case AlertSeverity.LOW:
                return 'secondary';
            default:
                return 'default';
        }
    };

    const getSeverityColor = (severity: AlertSeverity) => {
        switch (severity) {
            case AlertSeverity.CRITICAL:
                return 'bg-red-500 text-white';
            case AlertSeverity.HIGH:
                return 'bg-orange-500 text-white';
            case AlertSeverity.MEDIUM:
                return 'bg-yellow-500 text-white';
            case AlertSeverity.LOW:
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getTypeIcon = (type: AlertType) => {
        switch (type) {
            case AlertType.AUTH_FAILURE:
            case AlertType.HIGH_FAILURE_RATE:
                return <AlertTriangle className="h-4 w-4" />;
            case AlertType.SERVER_DOWN:
                return <X className="h-4 w-4" />;
            case AlertType.SUSPICIOUS_ACTIVITY:
                return <AlertTriangle className="h-4 w-4" />;
            case AlertType.SYSTEM_RESOURCE:
                return <Clock className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const handleAcknowledgeAlert = async (alertId: string) => {
        await alertSystem.acknowledgeAlert(alertId, 'current_user');
        toast({
            title: "Alert Acknowledged",
            description: "The alert has been marked as acknowledged",
        });
    };

    const handleResolveAlert = async (alertId: string) => {
        await alertSystem.resolveAlert(alertId);
        toast({
            title: "Alert Resolved",
            description: "The alert has been marked as resolved",
        });
    };

    const handleClearAlerts = () => {
        alertSystem.clearAlerts();
        setAlerts([]);
        toast({
            title: "Alerts Cleared",
            description: "All alerts have been cleared",
        });
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filterType !== 'all' && alert.type !== filterType) return false;
        if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
        if (filterStatus === 'active' && (alert.acknowledged || alert.resolved)) return false;
        if (filterStatus === 'acknowledged' && !alert.acknowledged) return false;
        if (filterStatus === 'resolved' && !alert.resolved) return false;
        if (!showResolved && alert.resolved) return false;
        return true;
    });

    const alertStats = alertSystem.getAlertStats();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Alert Management</h2>
                    <p className="text-white/60">Monitor and manage system alerts and notifications</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge variant={isMonitoring ? "default" : "secondary"}>
                        {isMonitoring ? "Monitoring" : "Stopped"}
                    </Badge>
                    <Button
                        onClick={handleClearAlerts}
                        variant="outline"
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                </div>
            </div>

            {/* Alert Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Total Alerts
                        </CardTitle>
                        <Bell className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{alertStats.total}</div>
                        <p className="text-xs text-white/60">
                            All time
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Active Alerts
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{alertStats.active}</div>
                        <p className="text-xs text-orange-400">
                            Need attention
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Unacknowledged
                        </CardTitle>
                        <Eye className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{alertStats.unacknowledged}</div>
                        <p className="text-xs text-yellow-400">
                            Pending review
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Critical
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{alertStats.bySeverity[AlertSeverity.CRITICAL]}</div>
                        <p className="text-xs text-red-400">
                            Immediate action required
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white">Type</Label>
                            <Select value={filterType} onValueChange={(value) => setFilterType(value as AlertType | 'all')}>
                                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/20">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value={AlertType.AUTH_FAILURE}>Auth Failure</SelectItem>
                                    <SelectItem value={AlertType.SERVER_DOWN}>Server Down</SelectItem>
                                    <SelectItem value={AlertType.HIGH_FAILURE_RATE}>High Failure Rate</SelectItem>
                                    <SelectItem value={AlertType.SUSPICIOUS_ACTIVITY}>Suspicious Activity</SelectItem>
                                    <SelectItem value={AlertType.SYSTEM_RESOURCE}>System Resource</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white">Severity</Label>
                            <Select value={filterSeverity} onValueChange={(value) => setFilterSeverity(value as AlertSeverity | 'all')}>
                                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/20">
                                    <SelectItem value="all">All Severities</SelectItem>
                                    <SelectItem value={AlertSeverity.CRITICAL}>Critical</SelectItem>
                                    <SelectItem value={AlertSeverity.HIGH}>High</SelectItem>
                                    <SelectItem value={AlertSeverity.MEDIUM}>Medium</SelectItem>
                                    <SelectItem value={AlertSeverity.LOW}>Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white">Status</Label>
                            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/20">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="show-resolved"
                                checked={showResolved}
                                onCheckedChange={setShowResolved}
                            />
                            <Label htmlFor="show-resolved" className="text-white">
                                Show Resolved
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts List */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Alerts ({filteredAlerts.length})</CardTitle>
                    <CardDescription className="text-white/60">
                        System alerts and notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredAlerts.length === 0 ? (
                            <div className="text-center py-8 text-white/60">
                                No alerts match the current filters
                            </div>
                        ) : (
                            filteredAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border ${alert.resolved
                                            ? 'border-green-500/20 bg-green-500/10'
                                            : alert.acknowledged
                                                ? 'border-yellow-500/20 bg-yellow-500/10'
                                                : 'border-red-500/20 bg-red-500/10'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div className="mt-1">
                                                {getTypeIcon(alert.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="text-white font-medium">{alert.title}</h4>
                                                    <Badge className={getSeverityColor(alert.severity)}>
                                                        {alert.severity}
                                                    </Badge>
                                                    {alert.acknowledged && (
                                                        <Badge className="bg-yellow-500 text-white">
                                                            Acknowledged
                                                        </Badge>
                                                    )}
                                                    {alert.resolved && (
                                                        <Badge className="bg-green-500 text-white">
                                                            Resolved
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-white/80 text-sm mb-2">{alert.message}</p>
                                                {alert.details && (
                                                    <div className="text-white/60 text-xs mb-2">
                                                        <pre className="whitespace-pre-wrap">
                                                            {JSON.stringify(alert.details, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-4 text-white/60 text-xs">
                                                    <span>{alert.timestamp.toLocaleString()}</span>
                                                    {alert.acknowledgedBy && (
                                                        <span>Acknowledged by: {alert.acknowledgedBy}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {!alert.acknowledged && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAcknowledgeAlert(alert.id)}
                                                    className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Acknowledge
                                                </Button>
                                            )}
                                            {!alert.resolved && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleResolveAlert(alert.id)}
                                                    className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AlertManager; 