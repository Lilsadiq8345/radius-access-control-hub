import { Emitter } from '@/lib/utils/emitter';
import { supabase } from '@/integrations/supabase/client';

export enum AlertSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum AlertType {
    AUTH_FAILURE = 'auth_failure',
    SERVER_DOWN = 'server_down',
    HIGH_FAILURE_RATE = 'high_failure_rate',
    SUSPICIOUS_ACTIVITY = 'suspicious_activity',
    SYSTEM_RESOURCE = 'system_resource',
    SECURITY_BREACH = 'security_breach',
    BACKUP_FAILED = 'backup_failed',
    CONFIGURATION_CHANGE = 'configuration_change'
}

export interface Alert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    details?: any;
    timestamp: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolved: boolean;
    resolvedAt?: Date;
}

export interface AlertRule {
    id: string;
    name: string;
    type: AlertType;
    severity: AlertSeverity;
    conditions: AlertCondition[];
    enabled: boolean;
    cooldown: number; // seconds
    lastTriggered?: Date;
}

export interface AlertCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
    value: any;
    timeWindow?: number; // seconds
}

export interface AlertNotification {
    id: string;
    alertId: string;
    method: 'email' | 'webhook' | 'sms' | 'slack';
    recipient: string;
    sent: boolean;
    sentAt?: Date;
    error?: string;
}

class AlertSystem extends Emitter {
    private alerts: Alert[] = [];
    private rules: AlertRule[] = [];
    private notifications: AlertNotification[] = [];
    private isMonitoring: boolean = false;
    private monitoringInterval?: number;

    constructor() {
        super();
        this.initializeDefaultRules();
    }

    private initializeDefaultRules() {
        this.rules = [
            {
                id: '1',
                name: 'High Authentication Failure Rate',
                type: AlertType.HIGH_FAILURE_RATE,
                severity: AlertSeverity.HIGH,
                conditions: [
                    {
                        field: 'failure_rate',
                        operator: 'greater_than',
                        value: 20, // 20% failure rate
                        timeWindow: 300 // 5 minutes
                    }
                ],
                enabled: true,
                cooldown: 300 // 5 minutes
            },
            {
                id: '2',
                name: 'Multiple Failed Login Attempts',
                type: AlertType.SUSPICIOUS_ACTIVITY,
                severity: AlertSeverity.MEDIUM,
                conditions: [
                    {
                        field: 'failed_attempts',
                        operator: 'greater_than',
                        value: 5,
                        timeWindow: 60 // 1 minute
                    }
                ],
                enabled: true,
                cooldown: 60 // 1 minute
            },
            {
                id: '3',
                name: 'Server Resource Usage High',
                type: AlertType.SYSTEM_RESOURCE,
                severity: AlertSeverity.MEDIUM,
                conditions: [
                    {
                        field: 'cpu_usage',
                        operator: 'greater_than',
                        value: 80, // 80% CPU usage
                        timeWindow: 60
                    }
                ],
                enabled: true,
                cooldown: 300
            },
            {
                id: '4',
                name: 'RADIUS Server Down',
                type: AlertType.SERVER_DOWN,
                severity: AlertSeverity.CRITICAL,
                conditions: [
                    {
                        field: 'server_status',
                        operator: 'equals',
                        value: 'down',
                        timeWindow: 30
                    }
                ],
                enabled: true,
                cooldown: 60
            }
        ];
    }

    async startMonitoring(): Promise<void> {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.checkAlerts();
        }, 10000); // Check every 10 seconds

        console.log('Alert system monitoring started');
        this.emit('monitoring_started');
    }

    async stopMonitoring(): Promise<void> {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        console.log('Alert system monitoring stopped');
        this.emit('monitoring_stopped');
    }

    private async checkAlerts(): Promise<void> {
        try {
            // Check authentication failure rate
            await this.checkAuthFailureRate();

            // Check server status
            await this.checkServerStatus();

            // Check system resources
            await this.checkSystemResources();

            // Check for suspicious activity
            await this.checkSuspiciousActivity();
        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    }

    private async checkAuthFailureRate(): Promise<void> {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            const { data: recentLogs, error } = await supabase
                .from('auth_logs')
                .select('success')
                .gte('created_at', fiveMinutesAgo.toISOString());

            if (error) {
                console.error('Error fetching auth logs:', error);
                return;
            }

            if (recentLogs && recentLogs.length > 0) {
                const totalAttempts = recentLogs.length;
                const failedAttempts = recentLogs.filter(log => !log.success).length;
                const failureRate = (failedAttempts / totalAttempts) * 100;

                if (failureRate > 20) {
                    await this.createAlert({
                        type: AlertType.HIGH_FAILURE_RATE,
                        severity: AlertSeverity.HIGH,
                        title: 'High Authentication Failure Rate',
                        message: `Authentication failure rate is ${failureRate.toFixed(1)}% in the last 5 minutes`,
                        details: {
                            failureRate,
                            totalAttempts,
                            failedAttempts,
                            timeWindow: '5 minutes'
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error checking auth failure rate:', error);
        }
    }

    private async checkServerStatus(): Promise<void> {
        try {
            const { data: servers, error } = await supabase
                .from('radius_servers')
                .select('name, status, last_heartbeat')
                .eq('status', 'active');

            if (error) {
                console.error('Error fetching server status:', error);
                return;
            }

            if (servers) {
                for (const server of servers) {
                    const lastHeartbeat = server.last_heartbeat ? new Date(server.last_heartbeat) : null;
                    const now = new Date();

                    if (lastHeartbeat && (now.getTime() - lastHeartbeat.getTime()) > 5 * 60 * 1000) {
                        await this.createAlert({
                            type: AlertType.SERVER_DOWN,
                            severity: AlertSeverity.CRITICAL,
                            title: 'RADIUS Server Unresponsive',
                            message: `Server ${server.name} has not responded for more than 5 minutes`,
                            details: {
                                serverName: server.name,
                                lastHeartbeat,
                                timeSinceLastHeartbeat: now.getTime() - lastHeartbeat.getTime()
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error checking server status:', error);
        }
    }

    private async checkSystemResources(): Promise<void> {
        try {
            const { data: servers, error } = await supabase
                .from('radius_servers')
                .select('name, cpu_usage, memory_usage, disk_usage')
                .eq('status', 'active');

            if (error) {
                console.error('Error fetching system resources:', error);
                return;
            }

            if (servers) {
                for (const server of servers) {
                    if (server.cpu_usage && server.cpu_usage > 80) {
                        await this.createAlert({
                            type: AlertType.SYSTEM_RESOURCE,
                            severity: AlertSeverity.MEDIUM,
                            title: 'High CPU Usage',
                            message: `Server ${server.name} CPU usage is ${server.cpu_usage}%`,
                            details: {
                                serverName: server.name,
                                cpuUsage: server.cpu_usage,
                                memoryUsage: server.memory_usage,
                                diskUsage: server.disk_usage
                            }
                        });
                    }

                    if (server.memory_usage && server.memory_usage > 85) {
                        await this.createAlert({
                            type: AlertType.SYSTEM_RESOURCE,
                            severity: AlertSeverity.MEDIUM,
                            title: 'High Memory Usage',
                            message: `Server ${server.name} memory usage is ${server.memory_usage}%`,
                            details: {
                                serverName: server.name,
                                cpuUsage: server.cpu_usage,
                                memoryUsage: server.memory_usage,
                                diskUsage: server.disk_usage
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error checking system resources:', error);
        }
    }

    private async checkSuspiciousActivity(): Promise<void> {
        try {
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

            const { data: recentLogs, error } = await supabase
                .from('auth_logs')
                .select('username, ip_address, success')
                .gte('created_at', oneMinuteAgo.toISOString())
                .eq('success', false);

            if (error) {
                console.error('Error fetching recent failed logs:', error);
                return;
            }

            if (recentLogs) {
                // Group by IP address to detect multiple failed attempts
                const ipAttempts = new Map<string, number>();
                const userAttempts = new Map<string, number>();

                for (const log of recentLogs) {
                    // Count attempts by IP
                    const ipAddress = log.ip_address as string || 'unknown';
                    const ipCount = ipAttempts.get(ipAddress) || 0;
                    ipAttempts.set(ipAddress, ipCount + 1);

                    // Count attempts by username
                    const username = log.username as string;
                    const userCount = userAttempts.get(username) || 0;
                    userAttempts.set(username, userCount + 1);
                }

                // Check for suspicious IP addresses
                for (const [ip, count] of ipAttempts) {
                    if (count > 10) {
                        await this.createAlert({
                            type: AlertType.SUSPICIOUS_ACTIVITY,
                            severity: AlertSeverity.HIGH,
                            title: 'Suspicious IP Activity',
                            message: `IP address ${ip} has ${count} failed authentication attempts in the last minute`,
                            details: {
                                ipAddress: ip,
                                failedAttempts: count,
                                timeWindow: '1 minute'
                            }
                        });
                    }
                }

                // Check for suspicious usernames
                for (const [username, count] of userAttempts) {
                    if (count > 5) {
                        await this.createAlert({
                            type: AlertType.SUSPICIOUS_ACTIVITY,
                            severity: AlertSeverity.MEDIUM,
                            title: 'Multiple Failed Login Attempts',
                            message: `User ${username} has ${count} failed login attempts in the last minute`,
                            details: {
                                username,
                                failedAttempts: count,
                                timeWindow: '1 minute'
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error checking suspicious activity:', error);
        }
    }

    async createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>): Promise<Alert> {
        const alert: Alert = {
            id: Date.now().toString(),
            ...alertData,
            timestamp: new Date(),
            acknowledged: false,
            resolved: false
        };

        this.alerts.unshift(alert); // Add to beginning of array
        this.alerts = this.alerts.slice(0, 1000); // Keep only last 1000 alerts

        // Emit alert event
        this.emit('alert_created', alert);

        // Send notifications
        await this.sendNotifications(alert);

        // Store in database
        await this.storeAlert(alert);

        return alert;
    }

    private async storeAlert(alert: Alert): Promise<void> {
        try {
            // This would store the alert in the database
            // For now, we'll just log it
            console.log('Alert stored:', alert);
        } catch (error) {
            console.error('Error storing alert:', error);
        }
    }

    private async sendNotifications(alert: Alert): Promise<void> {
        try {
            // This would send notifications via email, webhook, etc.
            // For now, we'll just emit an event
            this.emit('notification_sent', {
                alertId: alert.id,
                method: 'email',
                recipient: 'admin@radiuscorp.com',
                sent: true,
                sentAt: new Date()
            });
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    }

    async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedBy = acknowledgedBy;
            alert.acknowledgedAt = new Date();

            this.emit('alert_acknowledged', alert);
        }
    }

    async resolveAlert(alertId: string): Promise<void> {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = new Date();

            this.emit('alert_resolved', alert);
        }
    }

    getAlerts(filters?: {
        type?: AlertType;
        severity?: AlertSeverity;
        acknowledged?: boolean;
        resolved?: boolean;
        limit?: number;
    }): Alert[] {
        let filteredAlerts = [...this.alerts];

        if (filters?.type) {
            filteredAlerts = filteredAlerts.filter(alert => alert.type === filters.type);
        }
        if (filters?.severity) {
            filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity);
        }
        if (filters?.acknowledged !== undefined) {
            filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === filters.acknowledged);
        }
        if (filters?.resolved !== undefined) {
            filteredAlerts = filteredAlerts.filter(alert => alert.resolved === filters.resolved);
        }
        if (filters?.limit) {
            filteredAlerts = filteredAlerts.slice(0, filters.limit);
        }

        return filteredAlerts;
    }

    getActiveAlerts(): Alert[] {
        return this.getAlerts({ resolved: false });
    }

    getUnacknowledgedAlerts(): Alert[] {
        return this.getAlerts({ acknowledged: false, resolved: false });
    }

    getAlertStats(): {
        total: number;
        active: number;
        unacknowledged: number;
        bySeverity: Record<AlertSeverity, number>;
        byType: Record<AlertType, number>;
    } {
        const activeAlerts = this.getActiveAlerts();
        const unacknowledgedAlerts = this.getUnacknowledgedAlerts();

        const bySeverity: Record<AlertSeverity, number> = {
            [AlertSeverity.LOW]: 0,
            [AlertSeverity.MEDIUM]: 0,
            [AlertSeverity.HIGH]: 0,
            [AlertSeverity.CRITICAL]: 0
        };

        const byType: Record<AlertType, number> = {
            [AlertType.AUTH_FAILURE]: 0,
            [AlertType.SERVER_DOWN]: 0,
            [AlertType.HIGH_FAILURE_RATE]: 0,
            [AlertType.SUSPICIOUS_ACTIVITY]: 0,
            [AlertType.SYSTEM_RESOURCE]: 0,
            [AlertType.SECURITY_BREACH]: 0,
            [AlertType.BACKUP_FAILED]: 0,
            [AlertType.CONFIGURATION_CHANGE]: 0
        };

        for (const alert of activeAlerts) {
            bySeverity[alert.severity]++;
            byType[alert.type]++;
        }

        return {
            total: this.alerts.length,
            active: activeAlerts.length,
            unacknowledged: unacknowledgedAlerts.length,
            bySeverity,
            byType
        };
    }

    addRule(rule: AlertRule): void {
        this.rules.push(rule);
        this.emit('rule_added', rule);
    }

    updateRule(ruleId: string, updates: Partial<AlertRule>): void {
        const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
        if (ruleIndex !== -1) {
            this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
            this.emit('rule_updated', this.rules[ruleIndex]);
        }
    }

    deleteRule(ruleId: string): void {
        const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
        if (ruleIndex !== -1) {
            const rule = this.rules[ruleIndex];
            this.rules.splice(ruleIndex, 1);
            this.emit('rule_deleted', rule);
        }
    }

    getRules(): AlertRule[] {
        return [...this.rules];
    }

    clearAlerts(): void {
        this.alerts = [];
        this.emit('alerts_cleared');
    }
}

export const alertSystem = new AlertSystem(); 