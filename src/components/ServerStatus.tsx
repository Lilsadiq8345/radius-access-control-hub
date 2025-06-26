
import { useState } from 'react';
import { Server, Activity, Zap, HardDrive, Cpu, Wifi, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const ServerStatus = () => {
  // Mock server data
  const servers = [
    {
      id: 1,
      name: 'Primary RADIUS',
      hostname: 'radius-primary.company.com',
      ip: '10.0.1.50',
      port: 1812,
      status: 'Online',
      uptime: '45d 12h 34m',
      version: 'FreeRADIUS 3.2.1',
      load: 67,
      cpu: 45,
      memory: 72,
      disk: 34,
      requestsPerSecond: 234,
      totalRequests: 1247892,
      successRate: 98.7,
      avgResponseTime: 125,
      clients: 23
    },
    {
      id: 2,
      name: 'Secondary RADIUS',
      hostname: 'radius-secondary.company.com',
      ip: '10.0.1.51',
      port: 1812,
      status: 'Online',
      uptime: '45d 12h 30m',
      version: 'FreeRADIUS 3.2.1',
      load: 43,
      cpu: 32,
      memory: 58,
      disk: 41,
      requestsPerSecond: 167,
      totalRequests: 892341,
      successRate: 98.9,
      avgResponseTime: 118,
      clients: 18
    },
    {
      id: 3,
      name: 'Backup RADIUS',
      hostname: 'radius-backup.company.com',
      ip: '10.0.1.52',
      port: 1812,
      status: 'Standby',
      uptime: '45d 12h 28m',
      version: 'FreeRADIUS 3.2.1',
      load: 12,
      cpu: 8,
      memory: 23,
      disk: 28,
      requestsPerSecond: 0,
      totalRequests: 45623,
      successRate: 99.1,
      avgResponseTime: 95,
      clients: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-500';
      case 'Standby': return 'bg-yellow-500';
      case 'Offline': return 'bg-red-500';
      case 'Maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getLoadColor = (load: number) => {
    if (load < 50) return 'text-green-400';
    if (load < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Server Status</h2>
          <p className="text-white/60">RADIUS server monitoring and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            <Server className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active Servers</CardTitle>
            <Server className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{servers.filter(s => s.status === 'Online').length}</div>
            <p className="text-xs text-green-400">All systems operational</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Load</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">55%</div>
            <p className="text-xs text-white/60">Average across all servers</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Requests/sec</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">401</div>
            <p className="text-xs text-white/60">Combined throughput</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <p className="text-xs text-white/60">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Server Details */}
      <div className="space-y-6">
        {servers.map((server) => (
          <Card key={server.id} className="bg-black/20 backdrop-blur-md border border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{server.name}</CardTitle>
                    <CardDescription className="text-white/60">
                      {server.hostname} • {server.ip}:{server.port}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={`${getStatusColor(server.status)} text-white`}>
                    {server.status}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Metrics */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Cpu className="h-4 w-4 mr-2" />
                    System Metrics
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/80">CPU Usage</span>
                        <span className={getLoadColor(server.cpu)}>{server.cpu}%</span>
                      </div>
                      <Progress value={server.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/80">Memory</span>
                        <span className={getLoadColor(server.memory)}>{server.memory}%</span>
                      </div>
                      <Progress value={server.memory} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/80">Disk Usage</span>
                        <span className={getLoadColor(server.disk)}>{server.disk}%</span>
                      </div>
                      <Progress value={server.disk} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/80">Load Average</span>
                        <span className={getLoadColor(server.load)}>{server.load}%</span>
                      </div>
                      <Progress value={server.load} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Performance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/80">Requests/sec</span>
                      <span className="text-cyan-400 font-medium">{server.requestsPerSecond}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Total Requests</span>
                      <span className="text-white">{server.totalRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Success Rate</span>
                      <span className="text-green-400 font-medium">{server.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Avg Response</span>
                      <span className="text-purple-400 font-medium">{server.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Active Clients</span>
                      <span className="text-blue-400 font-medium">{server.clients}</span>
                    </div>
                  </div>
                </div>

                {/* Server Info */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Server Info
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/80">Version</span>
                      <span className="text-white">{server.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Uptime</span>
                      <span className="text-green-400">{server.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Port</span>
                      <span className="text-white">{server.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Protocol</span>
                      <span className="text-white">UDP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Auth Method</span>
                      <span className="text-white">PAP/CHAP/EAP</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServerStatus;
