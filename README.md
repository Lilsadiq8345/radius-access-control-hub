# 🛡️ RADIUS Central Management System

A comprehensive, enterprise-grade RADIUS (Remote Authentication Dial-In User Service) Central Management System built with modern web technologies. This system provides **real RADIUS protocol implementation**, centralized authentication management, real-time monitoring, advanced user management, and complete RADIUS server control.

## 🚀 **NEW: Real RADIUS Server Integration**

✅ **Complete RADIUS Protocol Implementation** - Full RFC 2865/2866 support with real UDP socket handling  
✅ **Real-time API Integration** - Frontend connects to actual RADIUS server via REST API and WebSocket  
✅ **Production-Ready Deployment** - Docker containerization with health checks and monitoring  
✅ **Network Device Integration** - Configuration templates for Cisco, Juniper, Mikrotik, and more  

## 🎯 **What's New in This Version**

### 🔗 **Real RADIUS Server Connection**
- **No More Simulator**: Frontend now connects to actual RADIUS server
- **WebSocket Real-time Updates**: Live server status and authentication events
- **REST API Integration**: Complete server control via HTTP API
- **Production Deployment**: Docker containers with health checks

### 🏗️ **Enhanced Architecture**
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

## 🚀 **Quick Start (Docker)**

```bash
# 1. Clone the repository
git clone <repository-url>
cd radius-access-control-hub

# 2. Copy environment template
cp env.example .env

# 3. Configure your environment variables
# Edit .env with your Supabase credentials and RADIUS settings

# 4. Deploy with Docker Compose
docker-compose up -d

# 5. Access the application
# Frontend: http://localhost:3000
# RADIUS API: http://localhost:3001/api/status
# RADIUS Protocol: localhost:1812 (auth), localhost:1813 (accounting)
```

## 🔐 **Core RADIUS Functionality**

### **Full RADIUS Protocol Implementation**
- **RFC 2865/2866 Compliance** - Complete RADIUS protocol support
- **UDP Socket Management** - Real network communication handling
- **Packet Parsing** - Proper RADIUS packet structure handling
- **Client Authentication** - IP-based client validation with shared secrets
- **Session Management** - Active session tracking and management

### **Real-time Authentication**
- **Live Authentication Events** - Real-time RADIUS authentication monitoring
- **WebSocket Integration** - Instant status updates and statistics
- **Authentication Logging** - Comprehensive audit trail of all attempts
- **Success/Failure Tracking** - Detailed authentication result monitoring

## 👥 **Advanced User Management**

### **Complete User Control**
- **Bulk Operations** - Multi-user selection, bulk edit, bulk delete
- **User Groups** - Group management and assignment
- **Role-based Access Control** - Admin and user permissions
- **Department Management** - Organizational structure support
- **Export/Import** - CSV/JSON data portability

### **Enhanced Authentication**
- **Multiple Auth Methods** - Password, certificate, token support
- **Account Lockout** - Configurable failed attempt limits
- **Password Policies** - Enforce strong password requirements
- **Session Management** - Active session monitoring and control

## 📊 **Real-time Monitoring & Analytics**

### **Live System Monitoring**
- **Real-time Dashboard** - Live system health and performance metrics
- **Server Status Tracking** - Active connections, uptime monitoring
- **Performance Metrics** - Success rates, response times, throughput
- **Resource Utilization** - CPU, memory, disk usage tracking

### **Advanced Analytics**
- **Interactive Charts** - Visual performance analytics
- **Trend Analysis** - Historical data analysis and reporting
- **Capacity Planning** - Resource usage forecasting
- **Performance Optimization** - Automated recommendations

## 🚨 **Intelligent Alert System**

### **Comprehensive Alerting**
- **Configurable Alert Rules** - Custom monitoring thresholds
- **Multi-level Severity** - Critical, High, Medium, Low alerts
- **Real-time Monitoring** - Authentication failures, suspicious activity
- **Alert Management** - Acknowledge, resolve, filter alerts
- **Notification System** - Email, webhook, SMS support

### **Security Monitoring**
- **Suspicious Activity Detection** - IP-based and user-based threat detection
- **Real-time Security Monitoring** - Live threat detection and response
- **Compliance Reporting** - Detailed audit trails and reports

## 🔧 **Server Management**

### **Complete RADIUS Control**
- **RADIUS Server Control** - Start, stop, restart, configure
- **Real-time Statistics** - Live performance monitoring
- **Configuration Management** - Server settings and policies
- **Health Monitoring** - System resource tracking
- **Client Management** - Add/remove RADIUS clients

### **Network Device Integration**
- **Configuration Templates** - Cisco, Juniper, Mikrotik, Ubiquiti
- **Device Management** - Network device status monitoring
- **Automated Configuration** - Bulk device configuration
- **Health Checks** - Device connectivity monitoring

## 💾 **Backup & Recovery**

### **Comprehensive Backup System**
- **Automated Backups** - Database, configuration, full backups
- **Scheduled Backups** - Daily, weekly, monthly schedules
- **Retention Policies** - Configurable backup retention
- **Restore Capabilities** - Point-in-time recovery
- **Backup Monitoring** - Job tracking and verification

## 🔌 **REST API & Integration**

### **Complete API Service**
- **RADIUS Server API** - Complete server control and monitoring
- **User Management API** - User CRUD operations
- **Authentication API** - Test authentication endpoints
- **Statistics API** - Comprehensive system stats
- **Webhook Support** - Real-time event notifications

### **External Integrations**
- **SIEM Integration** - Security information and event management
- **Ticketing Systems** - Incident management integration
- **Monitoring Tools** - Prometheus, Grafana, Nagios support
- **LDAP/Active Directory** - Enterprise directory integration

## 🛡️ **Security & Compliance**

### **Enterprise Security**
- **Row Level Security (RLS)** - Database-level security policies
- **Encrypted Communications** - TLS/SSL for all connections
- **Audit Logging** - Comprehensive authentication and system logs
- **Access Control** - Role-based permissions and authentication
- **Certificate Management** - SSL/TLS certificate handling

### **Compliance Features**
- **SOX Compliance** - Sarbanes-Oxley compliance reporting
- **HIPAA Compliance** - Healthcare data protection
- **GDPR Compliance** - Data protection and privacy
- **PCI DSS** - Payment card industry compliance

## 🏗️ **Architecture**

### **Frontend (Browser)**
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible components
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
  - **PostgreSQL** - Primary database
  - **Row Level Security (RLS)** - Data protection
  - **Real-time Subscriptions** - Live data updates
  - **Edge Functions** - Serverless compute
  - **Authentication** - Built-in auth system

### **RADIUS Server (Node.js Backend)**
- **Custom RADIUS Implementation** - Full RFC 2865/2866 protocol support
- **UDP Socket Management** - Network communication handling
- **Session Tracking** - User session management
- **Client Authentication** - IP-based client validation
- **Database Integration** - Authentication and logging
- **REST API** - HTTP API for frontend integration
- **WebSocket Server** - Real-time communication
- **Express.js** - HTTP server framework

## 📦 **Installation**

### **Prerequisites**
- Docker and Docker Compose
- Node.js 18+ (for development)
- Supabase account

### **Docker Deployment (Recommended)**
```bash
# 1. Clone and setup
git clone <repository-url>
cd radius-access-control-hub
cp env.example .env

# 2. Configure environment
# Edit .env with your settings

# 3. Deploy
docker-compose up -d

# 4. Access
# Frontend: http://localhost:3000
# API: http://localhost:3001/api/status
```

### **Manual Installation**
```bash
# 1. Install dependencies
npm install
cd server && npm install

# 2. Set up Supabase
# Create project and update credentials in .env

# 3. Start RADIUS server
cd server
npm start

# 4. Start frontend
npm run dev
```

## 🗄️ **Database Schema**

The system uses the following core tables:

### **Core Tables**
- **user_profiles** - User account information and roles
- **radius_users** - RADIUS authentication users
- **auth_logs** - Authentication attempt logs
- **radius_servers** - RADIUS server configurations
- **network_policies** - Network access policies
- **radius_sessions** - Active user sessions

### **Security Features**
- **Row Level Security (RLS)** - Database-level access control
- **Encrypted Storage** - Sensitive data encryption
- **Audit Trails** - Complete change tracking
- **Backup Automation** - Automated backup procedures

## 🔧 **Configuration**

### **Environment Variables**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# RADIUS Server Configuration
RADIUS_SECRET=your_secure_radius_secret
VITE_RADIUS_API_URL=http://localhost:3001

# Database Configuration
DB_USER=radius_user
DB_PASSWORD=secure_password
```

### **RADIUS Server Configuration**
- **Default Port**: 1812 (authentication), 1813 (accounting)
- **API Port**: 3001 (REST API and WebSocket)
- **Timeout**: Configurable per client
- **Secret Management**: Secure client secret storage
- **Logging**: Comprehensive audit trails

## 🚀 **Deployment**

### **Production Deployment**
```bash
# Production with all services
docker-compose --profile database,cache,proxy up -d

# Scale services
docker-compose up -d --scale radius-server=3
docker-compose up -d --scale radius-frontend=2
```

### **Cloud Deployment**
- **AWS** - ECS, EKS, or EC2 deployment
- **Google Cloud** - GKE or Compute Engine
- **Azure** - AKS or App Service
- **DigitalOcean** - Droplets or Kubernetes

### **Load Balancing**
```nginx
# Nginx load balancer configuration
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
```

## 📊 **System Components**

### **Dashboard**
- Real-time system overview
- Key performance indicators
- Quick access to all features
- Live authentication monitoring

### **User Management**
- Advanced user controls
- Bulk operations
- Group management
- Export capabilities

### **Authentication Logs**
- Comprehensive audit trails
- Real-time event monitoring
- Advanced filtering and search
- Export functionality

### **Server Status**
- RADIUS server monitoring
- System health tracking
- Performance metrics
- Real-time statistics

### **Network Policies**
- Access control policies
- Time-based restrictions
- IP range management
- Policy enforcement

### **RADIUS Server Manager**
- Server control interface
- Real-time statistics
- Configuration management
- Client management

### **Alert Management**
- System alerts and notifications
- Alert rules configuration
- Alert history and resolution
- Notification management

### **Performance Analytics**
- System performance tracking
- Trend analysis
- Resource utilization
- Capacity planning

### **System Status**
- Overall system health
- Component status monitoring
- Health score calculation
- Maintenance scheduling

## 🔒 **Security Features**

### **Authentication & Authorization**
- Supabase Auth integration
- Role-based access control
- Session management
- Secure password policies
- Multi-factor authentication

### **Data Protection**
- Row Level Security (RLS)
- Encrypted data transmission
- Secure API endpoints
- Audit logging
- Data backup and recovery

### **Network Security**
- RADIUS protocol security
- Client secret management
- IP-based access controls
- Suspicious activity detection
- Firewall integration

## 📈 **Monitoring & Analytics**

### **Real-time Monitoring**
- Live system health tracking
- Performance metrics
- Resource utilization
- Alert generation
- WebSocket real-time updates

### **Analytics Dashboard**
- Historical data analysis
- Trend identification
- Performance optimization
- Capacity planning
- Custom reporting

### **Reporting**
- Authentication reports
- System performance reports
- Security audit reports
- Compliance documentation
- Executive dashboards

## 🛠️ **Development**

### **Code Structure**
```
src/
├── components/          # React components
│   ├── ui/             # Shadcn/ui components
│   ├── UserManagement.tsx
│   ├── AuthenticationLogs.tsx
│   ├── ServerStatus.tsx
│   ├── NetworkPolicies.tsx
│   ├── RadiusServerManager.tsx
│   ├── AlertManager.tsx
│   ├── PerformanceAnalytics.tsx
│   └── SystemStatus.tsx
├── hooks/              # Custom React hooks
├── integrations/       # External integrations
│   └── supabase/       # Supabase client
├── lib/                # Core libraries
│   ├── api/            # API services
│   ├── alert-system.ts # Alert management
│   ├── backup-system.ts # Backup management
│   └── radius-server.ts # RADIUS implementation
├── pages/              # Page components
└── main.tsx           # Application entry

server/
├── radius-server.js    # RADIUS server implementation
├── package.json        # Server dependencies
└── Dockerfile         # Server containerization
```

### **Key Libraries**
- **@supabase/supabase-js** - Supabase client
- **@tanstack/react-query** - Data fetching
- **react-router-dom** - Routing
- **react-hook-form** - Form management
- **zod** - Schema validation
- **lucide-react** - Icons
- **express** - HTTP server
- **ws** - WebSocket server

## 🧪 **Testing**

### **RADIUS Authentication Testing**
```bash
# Using radtest
radtest admin password123 localhost:1812 0 testing123

# Using web interface
# Navigate to http://localhost:3000/test
```

### **API Testing**
```bash
# Test server status
curl http://localhost:3001/api/status

# Test authentication
curl -X POST http://localhost:3001/api/test-auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123","clientIp":"192.168.1.1"}'
```

### **Network Device Testing**
- **Cisco Configuration** - Router/switch RADIUS setup
- **Juniper Configuration** - Device authentication setup
- **Mikrotik Configuration** - RouterOS RADIUS integration
- **Ubiquiti Configuration** - UniFi device authentication

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples
- Use the `/test` page for diagnostics

## 🎯 **Roadmap**

### **Phase 1** ✅ Complete
- Core RADIUS server implementation
- Real-time API integration
- Docker containerization
- Basic user management
- Authentication system
- Database schema

### **Phase 2** ✅ Complete
- Advanced user management
- Real-time monitoring
- Alert system
- Performance analytics
- Network device integration
- Production deployment

### **Phase 3** 🚧 In Progress
- Backup and recovery system
- Advanced security features
- API integrations
- Mobile responsiveness
- Multi-tenant support

### **Phase 4** 📋 Planned
- Advanced reporting
- API rate limiting
- Performance optimization
- Machine learning integration
- Advanced compliance features

---

**Built with ❤️ using modern web technologies for enterprise-grade RADIUS management.**

**🎉 Now featuring real RADIUS protocol implementation with production-ready deployment!**
