const net = require('net');
const crypto = require('crypto');
const EventEmitter = require('events');
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

// RADIUS packet types
const RADIUS_PACKET_TYPES = {
    ACCESS_REQUEST: 1,
    ACCESS_ACCEPT: 2,
    ACCESS_REJECT: 3,
    ACCOUNTING_REQUEST: 4,
    ACCOUNTING_RESPONSE: 5
};

// RADIUS attribute types
const RADIUS_ATTRIBUTE_TYPES = {
    USER_NAME: 1,
    USER_PASSWORD: 2,
    NAS_IP_ADDRESS: 4,
    NAS_PORT: 5,
    ACCT_SESSION_ID: 44,
    REPLY_MESSAGE: 18
};

class RadiusServer extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            port: config.port || 1812,
            apiPort: config.apiPort || 3001,
            secret: config.secret || 'default_secret',
            timeout: config.timeout || 30000,
            ...config
        };

        this.clients = new Map();
        this.server = null;
        this.isRunning = false;
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            activeConnections: 0,
            startTime: null,
            lastRequest: null
        };

        // Initialize default clients
        this.addClient('192.168.1.1', 'radius_secret_2024', 'Core Router');
        this.addClient('10.0.0.1', 'radius_secret_2024', 'Distribution Switch');

        // Initialize Express app and WebSocket server
        this.app = express();
        this.setupExpressApp();
        this.apiServer = null;
        this.wss = null;
    }

    setupExpressApp() {
        // Middleware
        this.app.use(cors());
        this.app.use(express.json());

        // API Routes
        this.app.get('/api/status', (req, res) => {
            res.json({
                isRunning: this.isRunning,
                port: this.config.port,
                uptime: this.stats.startTime ? Math.floor((Date.now() - this.stats.startTime) / 1000) : 0,
                stats: this.stats,
                clients: this.getClients()
            });
        });

        this.app.post('/api/start', async (req, res) => {
            try {
                if (this.isRunning) {
                    return res.status(400).json({ success: false, message: 'Server is already running' });
                }
                await this.start();
                res.json({ success: true, message: 'RADIUS server started successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });

        this.app.post('/api/stop', async (req, res) => {
            try {
                if (!this.isRunning) {
                    return res.status(400).json({ success: false, message: 'Server is not running' });
                }
                await this.stop();
                res.json({ success: true, message: 'RADIUS server stopped successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });

        this.app.post('/api/restart', async (req, res) => {
            try {
                await this.stop();
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.start();
                res.json({ success: true, message: 'RADIUS server restarted successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });

        this.app.get('/api/clients', (req, res) => {
            res.json(this.getClients());
        });

        this.app.post('/api/clients', (req, res) => {
            const { ipAddress, secret, name } = req.body;
            if (!ipAddress || !secret) {
                return res.status(400).json({ success: false, message: 'IP address and secret are required' });
            }
            this.addClient(ipAddress, secret, name);
            res.json({ success: true, message: 'Client added successfully' });
        });

        this.app.delete('/api/clients/:ipAddress', (req, res) => {
            const { ipAddress } = req.params;
            this.removeClient(ipAddress);
            res.json({ success: true, message: 'Client removed successfully' });
        });

        this.app.post('/api/test-auth', async (req, res) => {
            const { username, password, clientIp } = req.body;
            if (!username || !password || !clientIp) {
                return res.status(400).json({ success: false, message: 'Username, password, and client IP are required' });
            }

            try {
                const result = await this.authenticateUser(username, password, clientIp);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });

        // WebSocket endpoint for real-time updates
        this.app.get('/api/ws', (req, res) => {
            res.json({ message: 'WebSocket endpoint available at /ws' });
        });
    }

    async start() {
        return new Promise((resolve, reject) => {
            // Start RADIUS server
            this.server = net.createServer((socket) => {
                this.handleConnection(socket);
            });

            this.server.listen(this.config.port, () => {
                this.isRunning = true;
                this.stats.startTime = Date.now();
                console.log(`RADIUS server listening on port ${this.config.port}`);
                this.emit('started');
            });

            this.server.on('error', (error) => {
                console.error('RADIUS server error:', error);
                this.emit('error', error);
                reject(error);
            });

            // Start API server
            this.apiServer = http.createServer(this.app);
            this.apiServer.listen(this.config.apiPort, () => {
                console.log(`RADIUS API server listening on port ${this.config.apiPort}`);
            });

            // Start WebSocket server
            this.wss = new WebSocket.Server({ server: this.apiServer });
            this.wss.on('connection', (ws) => {
                console.log('WebSocket client connected');

                // Send initial status
                ws.send(JSON.stringify({
                    type: 'status',
                    data: {
                        isRunning: this.isRunning,
                        stats: this.stats
                    }
                }));

                ws.on('close', () => {
                    console.log('WebSocket client disconnected');
                });
            });

            resolve();
        });
    }

    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    this.isRunning = false;
                    this.stats.startTime = null;
                    console.log('RADIUS server stopped');
                    this.emit('stopped');
                });
            }

            if (this.apiServer) {
                this.apiServer.close(() => {
                    console.log('RADIUS API server stopped');
                });
            }

            if (this.wss) {
                this.wss.close();
            }

            resolve();
        });
    }

    // Broadcast to all WebSocket clients
    broadcast(data) {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    }

    handleConnection(socket) {
        console.log(`New connection from ${socket.remoteAddress}:${socket.remotePort}`);
        this.stats.activeConnections++;

        socket.on('data', async (data) => {
            try {
                const packet = this.parsePacket(data);
                const response = await this.processPacket(packet, socket.remoteAddress);

                if (response) {
                    socket.write(response);
                }
            } catch (error) {
                console.error('Error processing RADIUS packet:', error);
                this.emit('error', error);
            }
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.emit('error', error);
        });

        socket.on('close', () => {
            console.log(`Connection closed from ${socket.remoteAddress}:${socket.remotePort}`);
            this.stats.activeConnections = Math.max(0, this.stats.activeConnections - 1);
        });
    }

    parsePacket(data) {
        if (data.length < 20) {
            throw new Error('Invalid RADIUS packet: too short');
        }

        const code = data.readUInt8(0);
        const identifier = data.readUInt8(1);
        const length = data.readUInt16BE(2);
        const authenticator = data.slice(4, 20);

        if (data.length !== length) {
            throw new Error('Invalid RADIUS packet: length mismatch');
        }

        const attributes = [];
        let offset = 20;

        while (offset < data.length) {
            if (offset + 2 > data.length) {
                throw new Error('Invalid RADIUS packet: truncated attribute');
            }

            const type = data.readUInt8(offset);
            const attrLength = data.readUInt8(offset + 1);
            const value = data.slice(offset + 2, offset + attrLength);

            attributes.push({
                type,
                length: attrLength,
                value
            });

            offset += attrLength;
        }

        return {
            code,
            identifier,
            length,
            authenticator,
            attributes
        };
    }

    async processPacket(packet, clientIP) {
        console.log(`Processing RADIUS packet: ${RADIUS_PACKET_TYPES[packet.code]} from ${clientIP}`);

        this.stats.totalRequests++;
        this.stats.lastRequest = new Date();

        switch (packet.code) {
            case RADIUS_PACKET_TYPES.ACCESS_REQUEST:
                const result = await this.handleAccessRequest(packet, clientIP);
                if (result && result.success) {
                    this.stats.successfulRequests++;
                } else {
                    this.stats.failedRequests++;
                }

                // Broadcast stats update
                this.broadcast({
                    type: 'stats_update',
                    data: this.stats
                });

                return result;
            case RADIUS_PACKET_TYPES.ACCOUNTING_REQUEST:
                return await this.handleAccountingRequest(packet, clientIP);
            default:
                console.warn(`Unsupported RADIUS packet type: ${packet.code}`);
                return null;
        }
    }

    async handleAccessRequest(packet, clientIP) {
        const username = this.getAttributeValue(packet, RADIUS_ATTRIBUTE_TYPES.USER_NAME);
        const password = this.getAttributeValue(packet, RADIUS_ATTRIBUTE_TYPES.USER_PASSWORD);

        if (!username || !password) {
            return this.createAccessReject(packet.identifier, 'Missing username or password');
        }

        try {
            const authResult = await this.authenticateUser(
                username.toString(),
                password.toString(),
                clientIP
            );

            if (authResult.success) {
                return this.createAccessAccept(packet.identifier, authResult.sessionId);
            } else {
                return this.createAccessReject(packet.identifier, authResult.failureReason || 'Authentication failed');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return this.createAccessReject(packet.identifier, 'Internal server error');
        }
    }

    async handleAccountingRequest(packet, clientIP) {
        console.log('Accounting request received');
        return this.createAccountingResponse(packet.identifier);
    }

    async authenticateUser(username, password, clientIP) {
        // Check if client is authorized
        const client = this.clients.get(clientIP);
        if (!client) {
            return { success: false, failureReason: 'Client not authorized' };
        }

        // Simple authentication logic - in production, this would check against a database
        const usernameLower = username.toLowerCase();

        // Always allow admin users
        if (usernameLower.includes('admin')) {
            return { success: true, sessionId: crypto.randomBytes(16).toString('hex') };
        }

        // Check password
        if (password === 'radius123') {
            return { success: true, sessionId: crypto.randomBytes(16).toString('hex') };
        }

        // Simulate some random failures for testing
        if (Math.random() < 0.1) {
            return { success: false, failureReason: 'Random authentication failure' };
        }

        return { success: false, failureReason: 'Invalid credentials' };
    }

    getAttributeValue(packet, type) {
        const attribute = packet.attributes.find(attr => attr.type === type);
        return attribute ? attribute.value : null;
    }

    createAccessAccept(identifier, sessionId) {
        const attributes = [];

        if (sessionId) {
            attributes.push(this.createAttribute(RADIUS_ATTRIBUTE_TYPES.ACCT_SESSION_ID, Buffer.from(sessionId)));
        }

        return this.createResponse(RADIUS_PACKET_TYPES.ACCESS_ACCEPT, identifier, attributes);
    }

    createAccessReject(identifier, message) {
        const attributes = [
            this.createAttribute(RADIUS_ATTRIBUTE_TYPES.REPLY_MESSAGE, Buffer.from(message))
        ];

        return this.createResponse(RADIUS_PACKET_TYPES.ACCESS_REJECT, identifier, attributes);
    }

    createAccountingResponse(identifier) {
        return this.createResponse(RADIUS_PACKET_TYPES.ACCOUNTING_RESPONSE, identifier, []);
    }

    createAttribute(type, value) {
        const buffer = Buffer.alloc(2 + value.length);
        buffer.writeUInt8(type, 0);
        buffer.writeUInt8(2 + value.length, 1);
        value.copy(buffer, 2);
        return buffer;
    }

    createResponse(code, identifier, attributes) {
        const headerLength = 20;
        const attributesLength = attributes.reduce((sum, attr) => sum + attr.length, 0);
        const totalLength = headerLength + attributesLength;

        const buffer = Buffer.alloc(totalLength);

        buffer.writeUInt8(code, 0);
        buffer.writeUInt8(identifier, 1);
        buffer.writeUInt16BE(totalLength, 2);

        // Generate authenticator
        const authenticator = crypto.randomBytes(16);
        authenticator.copy(buffer, 4);

        let offset = headerLength;
        for (const attribute of attributes) {
            attribute.copy(buffer, offset);
            offset += attribute.length;
        }

        return buffer;
    }

    addClient(ipAddress, secret, name) {
        this.clients.set(ipAddress, { ipAddress, secret, name });
        console.log(`Added RADIUS client: ${ipAddress}${name ? ` (${name})` : ''}`);

        // Broadcast client update
        this.broadcast({
            type: 'clients_update',
            data: this.getClients()
        });
    }

    removeClient(ipAddress) {
        this.clients.delete(ipAddress);
        console.log(`Removed RADIUS client: ${ipAddress}`);

        // Broadcast client update
        this.broadcast({
            type: 'clients_update',
            data: this.getClients()
        });
    }

    getClients() {
        return Array.from(this.clients.values());
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            port: this.config.port,
            apiPort: this.config.apiPort,
            clients: this.getClients(),
            stats: this.stats
        };
    }
}

// Export for use as a module
module.exports = RadiusServer;

// If running directly, start the server
if (require.main === module) {
    const server = new RadiusServer({
        port: process.env.RADIUS_PORT || 1812,
        apiPort: process.env.API_PORT || 3001,
        secret: process.env.RADIUS_SECRET || 'default_secret'
    });

    server.start().then(() => {
        console.log('RADIUS server started successfully');
        console.log(`RADIUS protocol: port ${server.config.port}`);
        console.log(`API server: http://localhost:${server.config.apiPort}`);
        console.log(`WebSocket: ws://localhost:${server.config.apiPort}/ws`);
    }).catch((error) => {
        console.error('Failed to start RADIUS server:', error);
        process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down RADIUS server...');
        await server.stop();
        process.exit(0);
    });
} 