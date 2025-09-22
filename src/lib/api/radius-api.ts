import { Emitter } from '@/lib/utils/emitter';

export interface RadiusServerStats {
    isRunning: boolean;
    port: number;
    apiPort: number;
    activeConnections: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
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

export interface RadiusServerStatus {
    isRunning: boolean;
    port: number;
    uptime: number;
    stats: RadiusServerStats;
    clients: RadiusClient[];
}

class RadiusApiService extends Emitter {
    private baseUrl: string;
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 5000;
    private stats: RadiusServerStats = {
        isRunning: false,
        port: 1812,
        apiPort: 3001,
        activeConnections: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 100,
        uptime: 0,
        errorCount: 0
    };

    constructor() {
        super();
        // Use environment variable or default to localhost
        this.baseUrl = import.meta.env.VITE_RADIUS_API_URL || 'http://localhost:3001';
        this.connectWebSocket();
    }

    private connectWebSocket() {
        try {
            const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected to RADIUS server');
                this.reconnectAttempts = 0;
                this.emit('ws_connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected from RADIUS server');
                this.emit('ws_disconnected');
                this.scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('ws_error', error);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => {
                this.connectWebSocket();
            }, this.reconnectInterval);
        } else {
            console.error('Max WebSocket reconnect attempts reached');
            this.emit('ws_max_reconnect_attempts');
        }
    }

    private handleWebSocketMessage(data: any) {
        switch (data.type) {
            case 'status':
                this.updateStats(data.data);
                this.emit('status_update', data.data);
                break;
            case 'stats_update':
                this.updateStats(data.data);
                this.emit('stats_update', data.data);
                break;
            case 'clients_update':
                this.emit('clients_update', data.data);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }

    private updateStats(newStats: Partial<RadiusServerStats>) {
        this.stats = { ...this.stats, ...newStats };

        // Calculate success rate
        if (this.stats.totalRequests > 0) {
            this.stats.successRate = Math.round((this.stats.successfulRequests / this.stats.totalRequests) * 100);
        }
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async getServerStatus(): Promise<RadiusServerStatus> {
        try {
            const status = await this.makeRequest('/status');
            this.updateStats(status.stats);
            return status;
        } catch (error) {
            console.error('Failed to get server status:', error);
            throw error;
        }
    }

    async startServer(port: number = 1812): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.makeRequest('/start', {
                method: 'POST',
                body: JSON.stringify({ port })
            });

            if (result.success) {
                this.stats.isRunning = true;
                this.stats.port = port;
                this.emit('server_started');
            }

            return result;
        } catch (error) {
            console.error('Failed to start RADIUS server:', error);
            return {
                success: false,
                message: `Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async stopServer(): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.makeRequest('/stop', {
                method: 'POST'
            });

            if (result.success) {
                this.stats.isRunning = false;
                this.emit('server_stopped');
            }

            return result;
        } catch (error) {
            console.error('Failed to stop RADIUS server:', error);
            return {
                success: false,
                message: `Failed to stop server: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async restartServer(port: number = 1812): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.makeRequest('/restart', {
                method: 'POST',
                body: JSON.stringify({ port })
            });

            if (result.success) {
                this.stats.isRunning = true;
                this.stats.port = port;
                this.emit('server_restarted');
            }

            return result;
        } catch (error) {
            console.error('Failed to restart RADIUS server:', error);
            return {
                success: false,
                message: `Failed to restart server: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async getClients(): Promise<RadiusClient[]> {
        try {
            return await this.makeRequest('/clients');
        } catch (error) {
            console.error('Failed to get clients:', error);
            return [];
        }
    }

    async addClient(ipAddress: string, secret: string, name?: string): Promise<{ success: boolean; message: string }> {
        try {
            return await this.makeRequest('/clients', {
                method: 'POST',
                body: JSON.stringify({ ipAddress, secret, name })
            });
        } catch (error) {
            console.error('Failed to add client:', error);
            return {
                success: false,
                message: `Failed to add client: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async removeClient(ipAddress: string): Promise<{ success: boolean; message: string }> {
        try {
            return await this.makeRequest(`/clients/${encodeURIComponent(ipAddress)}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Failed to remove client:', error);
            return {
                success: false,
                message: `Failed to remove client: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async testAuthentication(request: RadiusRequest): Promise<RadiusResponse> {
        try {
            const result = await this.makeRequest('/test-auth', {
                method: 'POST',
                body: JSON.stringify(request)
            });

            return {
                success: result.success,
                message: result.failureReason || 'Authentication successful',
                attributes: result.success ? {
                    'Session-Timeout': 3600,
                    'Idle-Timeout': 1800,
                    'WISPr-Bandwidth-Max-Down': 10000000,
                    'WISPr-Bandwidth-Max-Up': 5000000
                } : {}
            };
        } catch (error) {
            console.error('Failed to test authentication:', error);
            return {
                success: false,
                message: `Authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    getServerStats(): RadiusServerStats {
        return { ...this.stats };
    }

    // Simulate incoming requests for testing (only if server is running)
    simulateRequest(success: boolean = true): void {
        if (!this.stats.isRunning) {
            console.warn('Cannot simulate request: server is not running');
            return;
        }

        this.stats.totalRequests++;
        this.stats.lastRequest = new Date();

        if (success) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
        }

        // Update success rate
        this.stats.successRate = Math.round((this.stats.successfulRequests / this.stats.totalRequests) * 100);
    }

    // Check if WebSocket is connected
    isWebSocketConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    // Manually reconnect WebSocket
    reconnectWebSocket(): void {
        if (this.ws) {
            this.ws.close();
        }
        this.reconnectAttempts = 0;
        this.connectWebSocket();
    }

    // Cleanup
    destroy(): void {
        if (this.ws) {
            this.ws.close();
        }
        this.removeAllListeners();
    }
}

export const radiusApiService = new RadiusApiService(); 