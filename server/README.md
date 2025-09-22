# 🛡️ RADIUS Server Backend

This is the backend RADIUS server component of the RADIUS Central Management System. It provides the actual RADIUS protocol implementation that runs on the server-side.

## 🚀 Features

- **Full RADIUS Protocol Support** - RFC 2865/2866 implementation
- **UDP Socket Management** - Network communication handling
- **Client Authentication** - User credential validation
- **Session Management** - Active session tracking
- **Configurable** - Port, secret, and timeout settings

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Create a `.env` file:
```env
RADIUS_PORT=1812
RADIUS_SECRET=your_secret_here
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 🔧 Configuration

### Environment Variables
- `RADIUS_PORT` - Port to listen on (default: 1812)
- `RADIUS_SECRET` - Shared secret for client authentication

### Default Clients
The server comes with default clients for testing:
- `192.168.1.1` - Secret: `testing123` - Name: "Default Router"
- `10.0.0.1` - Secret: `secret123` - Name: "Core Switch"

## 📡 RADIUS Protocol

### Supported Packet Types
- **Access-Request** - User authentication requests
- **Access-Accept** - Successful authentication responses
- **Access-Reject** - Failed authentication responses
- **Accounting-Request** - Session accounting
- **Accounting-Response** - Accounting acknowledgments

### Authentication Flow
1. Client sends Access-Request packet
2. Server validates client IP and secret
3. Server authenticates user credentials
4. Server responds with Access-Accept or Access-Reject

## 🔌 API Integration

The server can be integrated with the frontend management system through:

1. **Status Monitoring** - Check server status and statistics
2. **Client Management** - Add/remove RADIUS clients
3. **Configuration** - Update server settings
4. **Logging** - Authentication and error logs

## 🛡️ Security

### Client Authentication
- IP-based client validation
- Shared secret verification
- Unauthorized client rejection

### User Authentication
- Username/password validation
- Session ID generation
- Secure response handling

## 📊 Monitoring

### Server Status
- Running state
- Active connections
- Port configuration
- Client list

### Performance Metrics
- Request processing time
- Success/failure rates
- Error tracking
- Connection statistics

## 🚀 Deployment

### Production Deployment
```bash
# Install dependencies
npm install --production

# Start server
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 1812/udp
CMD ["npm", "start"]
```

### Systemd Service
Create `/etc/systemd/system/radius-server.service`:
```ini
[Unit]
Description=RADIUS Server
After=network.target

[Service]
Type=simple
User=radius
WorkingDirectory=/opt/radius-server
ExecStart=/usr/bin/node radius-server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## 🔍 Testing

### Test Authentication
Use a RADIUS client to test authentication:

```bash
# Using radtest (if available)
radtest username password server:port secret

# Example
radtest admin password123 localhost:1812 testing123
```

### Test Credentials
- Username: `admin` - Always accepted
- Username: `user` - Password: `password123`
- Other users - Random 10% failure rate for testing

## 📝 Logging

The server logs:
- Connection events
- Authentication attempts
- Error messages
- Server status changes

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :1812
   
   # Kill the process or change port
   ```

2. **Permission Denied**
   ```bash
   # Run with sudo for privileged ports
   sudo npm start
   ```

3. **Client Not Authorized**
   - Check client IP is in the allowed list
   - Verify shared secret matches
   - Check firewall settings

## 📚 API Reference

### Server Methods
- `start()` - Start the RADIUS server
- `stop()` - Stop the RADIUS server
- `addClient(ip, secret, name)` - Add a RADIUS client
- `removeClient(ip)` - Remove a RADIUS client
- `getStatus()` - Get server status

### Events
- `started` - Server started successfully
- `stopped` - Server stopped
- `error` - Server error occurred
- `auth_success` - Successful authentication
- `auth_failure` - Failed authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Part of the RADIUS Central Management System - Enterprise-grade RADIUS server implementation.** 