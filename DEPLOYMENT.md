# 🚀 RADIUS Central Management System - Deployment Guide

This guide covers the complete deployment of the RADIUS Central Management System, including the enhanced RADIUS server with real-time API integration.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for development)
- Supabase account (or PostgreSQL database)
- Network access to ports 1812, 1813, 3000, 3001

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   RADIUS        │    │   Database      │
│   (React)       │◄──►│   Server        │◄──►│   (Supabase/    │
│   Port: 3000    │    │   Port: 1812/   │    │   PostgreSQL)   │
│                 │    │   1813/3001     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   WebSocket     │    │   Redis         │
│   (Optional)    │    │   Real-time     │    │   (Optional)    │
│   Port: 80/443  │    │   Updates       │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start (Docker)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd radius-access-control-hub

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# RADIUS Server Configuration
RADIUS_SECRET=your_secure_radius_secret
VITE_RADIUS_API_URL=http://localhost:3001

# Database Configuration (if using local PostgreSQL)
DB_USER=radius_user
DB_PASSWORD=secure_password

# Optional: Redis Configuration
REDIS_URL=redis://localhost:6379
```

### 3. Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d

# Start with optional services
docker-compose --profile database,cache,proxy up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f radius-server
docker-compose logs -f radius-frontend
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **RADIUS API**: http://localhost:3001/api/status
- **RADIUS Protocol**: localhost:1812 (authentication), localhost:1813 (accounting)

## 🔧 Manual Deployment

### 1. RADIUS Server Setup

```bash
cd server

# Install dependencies
npm install

# Set environment variables
export RADIUS_PORT=1812
export API_PORT=3001
export RADIUS_SECRET=your_secure_secret

# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Set environment variables
export VITE_SUPABASE_URL=your_supabase_url
export VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
export VITE_RADIUS_API_URL=http://localhost:3001

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔐 Security Configuration

### 1. RADIUS Server Security

```javascript
// In server/radius-server.js
const server = new RadiusServer({
    port: 1812,
    apiPort: 3001,
    secret: process.env.RADIUS_SECRET || 'your_secure_secret',
    // Add additional security options
    maxConnections: 1000,
    timeout: 30000,
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
});
```

### 2. Network Security

```bash
# Firewall configuration (Ubuntu/Debian)
sudo ufw allow 1812/udp  # RADIUS authentication
sudo ufw allow 1813/udp  # RADIUS accounting
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 3001/tcp  # API
sudo ufw enable
```

### 3. SSL/TLS Configuration

```nginx
# In nginx.conf for HTTPS
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}
```

## 📊 Monitoring and Logging

### 1. Health Checks

```bash
# Check RADIUS server health
curl http://localhost:3001/api/status

# Check frontend health
curl http://localhost:3000/health

# Docker health checks
docker-compose ps
```

### 2. Log Monitoring

```bash
# View RADIUS server logs
docker-compose logs -f radius-server

# View frontend logs
docker-compose logs -f radius-frontend

# View nginx logs
docker-compose logs -f nginx
```

### 3. Performance Monitoring

```bash
# Monitor resource usage
docker stats

# Check network connections
netstat -tulpn | grep :1812
netstat -tulpn | grep :3001
```

## 🔄 Production Deployment

### 1. Production Environment Variables

```env
# Production .env
NODE_ENV=production
RADIUS_SECRET=your_production_secret
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_RADIUS_API_URL=https://your-domain.com/api

# Database
DB_USER=radius_prod_user
DB_PASSWORD=secure_production_password

# Redis
REDIS_URL=redis://your-redis-host:6379
```

### 2. Production Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With all optional services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile database,cache,proxy up -d
```

### 3. Load Balancer Configuration

```nginx
# Load balancer configuration
upstream radius_frontend {
    server frontend1:3000;
    server frontend2:3000;
    server frontend3:3000;
}

upstream radius_api {
    server api1:3001;
    server api2:3001;
    server api3:3001;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://radius_frontend;
    }
    
    location /api/ {
        proxy_pass http://radius_api;
    }
}
```

## 🧪 Testing

### 1. RADIUS Authentication Test

```bash
# Using radtest (install freeradius-utils)
radtest admin password123 localhost:1812 0 testing123

# Using the web interface
# Navigate to http://localhost:3000/test
# Use the RADIUS Authentication Test section
```

### 2. API Testing

```bash
# Test server status
curl http://localhost:3001/api/status

# Test authentication
curl -X POST http://localhost:3001/api/test-auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123","clientIp":"192.168.1.1"}'

# Test WebSocket connection
wscat -c ws://localhost:3001/ws
```

### 3. Network Device Configuration

The system provides configuration templates for:

- **Cisco Routers/Switches**
- **Juniper Devices**
- **Mikrotik Routers**
- **Ubiquiti Devices**

Access these templates via the web interface at `/test` → "Network Devices" section.

## 🔧 Troubleshooting

### Common Issues

1. **RADIUS Server Not Starting**
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :1812
   
   # Check logs
   docker-compose logs radius-server
   ```

2. **Frontend Can't Connect to RADIUS**
   ```bash
   # Verify API URL
   echo $VITE_RADIUS_API_URL
   
   # Test API connectivity
   curl http://localhost:3001/api/status
   ```

3. **WebSocket Connection Issues**
   ```bash
   # Check WebSocket endpoint
   curl http://localhost:3001/api/ws
   
   # Test WebSocket connection
   wscat -c ws://localhost:3001/ws
   ```

4. **Database Connection Issues**
   ```bash
   # Test Supabase connection
   curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
        "$VITE_SUPABASE_URL/rest/v1/user_profiles?select=count"
   ```

### Performance Optimization

1. **Enable Caching**
   ```bash
   # Start Redis
   docker-compose --profile cache up -d redis
   ```

2. **Database Optimization**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX CONCURRENTLY idx_auth_logs_created_at_username 
   ON auth_logs(created_at, username);
   
   CREATE INDEX CONCURRENTLY idx_radius_sessions_active 
   ON radius_sessions(status, start_time);
   ```

3. **Load Balancing**
   ```bash
   # Scale services
   docker-compose up -d --scale radius-server=3
   docker-compose up -d --scale radius-frontend=2
   ```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale RADIUS servers
docker-compose up -d --scale radius-server=3

# Scale frontend instances
docker-compose up -d --scale radius-frontend=2

# Use load balancer
docker-compose --profile proxy up -d
```

### Database Scaling

```bash
# Use Supabase (recommended for production)
# Configure connection pooling and read replicas

# Or use local PostgreSQL with replication
docker-compose --profile database up -d
```

## 🔄 Backup and Recovery

### 1. Database Backup

```bash
# Supabase backup (automatic)
# Or manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### 2. Configuration Backup

```bash
# Backup configuration files
tar -czf radius-config-backup.tar.gz \
  server/radius-server.js \
  .env \
  nginx.conf \
  docker-compose.yml
```

### 3. Disaster Recovery

```bash
# Restore from backup
tar -xzf radius-config-backup.tar.gz

# Restart services
docker-compose down
docker-compose up -d
```

## 📞 Support

For issues and support:

1. Check the troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Test connectivity: Use the `/test` page in the web interface
4. Check system status: `docker-compose ps`

## 🎯 Next Steps

After successful deployment:

1. **Configure Network Devices**: Use the provided templates to configure your routers/switches
2. **Set Up Monitoring**: Implement monitoring and alerting
3. **Security Hardening**: Review and implement additional security measures
4. **Performance Tuning**: Optimize based on your usage patterns
5. **Backup Strategy**: Implement automated backup procedures

---

**🎉 Congratulations! Your RADIUS Central Management System is now fully deployed and operational.**
