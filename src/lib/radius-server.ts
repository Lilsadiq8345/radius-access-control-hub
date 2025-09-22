import { Emitter } from '@/lib/utils/emitter';
import { supabase } from '@/integrations/supabase/client';

export interface RadiusServerStats {
    isRunning: boolean;
    port: number;
    activeConnections: number;
    totalRequests: number;
    successRate: number;
    uptime: number;
    lastRequest?: Date;
    errorCount: number;
}

export interface RadiusClient {
    ipAddress: string;
    secret: string;
    name?: string;
}

export interface RadiusRequest {
    username: string;
    password: string;
    clientIp: string;
    nasIp?: string;
    nasPort?: number;
}

export interface RadiusResponse {
    success: boolean;
    message: string;
    attributes?: Record<string, any>;
}

class RadiusServerSimulator extends Emitter {
    private stats: RadiusServerStats = {
        isRunning: false,
        port: 1812,
        activeConnections: 0,
        totalRequests: 0,
        successRate: 100,
        uptime: 0,
        errorCount: 0
    };

    private clients: Map<string, RadiusClient> = new Map();
    private startTime?: Date;
    private interval?: number;
    private monitoringInterval?: number;

    constructor() {
        super();
        this.initializeDefaultClients();
    }

    private initializeDefaultClients() {
        this.addClient('192.168.1.1', 'radius_secret_2024', 'Core Router');
        this.addClient('10.0.0.1', 'radius_secret_2024', 'Distribution Switch');
    }

    async start(port: number = 1812): Promise<void> {
        if (this.stats.isRunning) {
            throw new Error('Server is already running');
        }

        this.stats.port = port;
        this.stats.isRunning = true;
        this.startTime = new Date();
        this.stats.uptime = 0;

        this.interval = window.setInterval(() => {
            if (this.startTime) {
                this.stats.uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
            }
        }, 1000);

        // Start monitoring and generating live data
        this.startLiveMonitoring();

        console.log(`RADIUS server simulator started on port ${port}`);
        this.emit('started');
    }

    async stop(): Promise<void> {
        if (!this.stats.isRunning) {
            throw new Error('Server is not running');
        }

        this.stats.isRunning = false;
        this.startTime = undefined;

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }

        console.log('RADIUS server simulator stopped');
        this.emit('stopped');
    }

    private startLiveMonitoring() {
        // Generate live authentication requests every 5-15 seconds
        this.monitoringInterval = window.setInterval(() => {
            if (this.stats.isRunning) {
                this.generateLiveAuthRequest();
            }
        }, Math.random() * 10000 + 5000); // Random interval between 5-15 seconds
    }

    private generateLiveAuthRequest() {
        const users = ['admin', 'user1', 'user2', 'user3', 'user4', 'user5'];
        const ips = ['192.168.1.50', '192.168.1.51', '192.168.1.52', '10.0.0.100', '10.0.0.101'];

        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomIp = ips[Math.floor(Math.random() * ips.length)];
        const success = Math.random() > 0.2; // 80% success rate

        const request: RadiusRequest = {
            username: randomUser,
            password: success ? 'radius123' : 'wrongpassword',
            clientIp: randomIp,
            nasIp: '192.168.1.1',
            nasPort: 0
        };

        this.authenticate(request).catch(error => {
            console.error('Live auth request failed:', error);
        });
    }

    async authenticate(request: RadiusRequest): Promise<RadiusResponse> {
        if (!this.stats.isRunning) {
            throw new Error('Server is not running');
        }

        this.stats.totalRequests++;
        this.stats.lastRequest = new Date();

        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

        try {
            const client = this.clients.get(request.clientIp);
            if (!client) {
                this.stats.errorCount++;
                this.updateSuccessRate();

                // Log failed authentication to database
                await this.logAuthAttempt(request, false, 'Client not authorized');

                return {
                    success: false,
                    message: 'Client not authorized'
                };
            }

            const success = this.simulateAuthentication(request);
            const failureReason = success ? null : 'Invalid credentials';

            if (success) {
                this.stats.activeConnections++;
                this.emit('auth_success', request);
            } else {
                this.stats.errorCount++;
                this.emit('auth_failure', request);
            }

            this.updateSuccessRate();

            // Log authentication attempt to database
            await this.logAuthAttempt(request, success, failureReason);

            return {
                success,
                message: success ? 'Authentication successful' : 'Authentication failed',
                attributes: success ? {
                    'Session-Timeout': 3600,
                    'Idle-Timeout': 1800,
                    'WISPr-Bandwidth-Max-Down': 10000000,
                    'WISPr-Bandwidth-Max-Up': 5000000
                } : {}
            };
        } catch (error) {
            this.stats.errorCount++;
            this.updateSuccessRate();
            this.emit('error', error);

            // Log error to database
            await this.logAuthAttempt(request, false, 'System error');

            throw error;
        }
    }

    private async logAuthAttempt(request: RadiusRequest, success: boolean, failureReason?: string) {
        try {
            await supabase
                .from('auth_logs')
                .insert({
                    username: request.username,
                    ip_address: request.clientIp,
                    auth_method: 'password',
                    success: success,
                    failure_reason: failureReason,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Failed to log auth attempt:', error);
        }
    }

    private simulateAuthentication(request: RadiusRequest): boolean {
        const username = request.username.toLowerCase();

        if (username.includes('admin')) {
            return true;
        }

        if (request.password === 'radius123') {
            return true;
        }

        if (Math.random() < 0.1) {
            return false;
        }

        return true;
    }

    private updateSuccessRate(): void {
        const successCount = this.stats.totalRequests - this.stats.errorCount;
        this.stats.successRate = Math.round((successCount / this.stats.totalRequests) * 100);
    }

    addClient(ipAddress: string, secret: string, name?: string): void {
        this.clients.set(ipAddress, { ipAddress, secret, name });
        console.log(`Added RADIUS client: ${ipAddress}${name ? ` (${name})` : ''}`);
    }

    removeClient(ipAddress: string): void {
        this.clients.delete(ipAddress);
        console.log(`Removed RADIUS client: ${ipAddress}`);
    }

    getClients(): RadiusClient[] {
        return Array.from(this.clients.values());
    }

    getStats(): RadiusServerStats {
        return { ...this.stats };
    }

    simulateIncomingRequest(success: boolean = true): void {
        const mockRequest: RadiusRequest = {
            username: `user${Math.floor(Math.random() * 1000)}`,
            password: success ? 'radius123' : 'wrongpassword',
            clientIp: '192.168.1.100',
            nasIp: '192.168.1.1',
            nasPort: 0
        };

        this.authenticate(mockRequest).catch(error => {
            console.error('Simulated request failed:', error);
        });
    }

    getConfiguration() {
        return {
            port: this.stats.port,
            clients: this.getClients(),
            uptime: this.stats.uptime,
            isRunning: this.stats.isRunning
        };
    }

    updateConfiguration(config: Partial<RadiusServerStats>): void {
        this.stats = { ...this.stats, ...config };
        this.emit('configuration_updated', this.stats);
    }
}

export const radiusServer = new RadiusServerSimulator(); 