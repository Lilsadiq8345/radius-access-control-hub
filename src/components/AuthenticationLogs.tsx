
import { useState } from 'react';
import { Search, Filter, Download, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AuthenticationLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');

  // Mock authentication log data
  const authLogs = [
    {
      id: 1,
      timestamp: '2024-06-26 14:32:45',
      username: 'john.doe',
      clientIP: '192.168.1.101',
      nasIP: '10.0.1.50',
      nasPort: '2950',
      authMethod: 'PAP',
      status: 'Success',
      responseTime: '125ms',
      reason: 'Authentication successful',
      sessionId: 'SES-001-2024-06-26-143245'
    },
    {
      id: 2,
      timestamp: '2024-06-26 14:31:22',
      username: 'jane.smith',
      clientIP: '192.168.1.102',
      nasIP: '10.0.1.51',
      nasPort: '2951',
      authMethod: 'CHAP',
      status: 'Failed',
      responseTime: '89ms',
      reason: 'Invalid password',
      sessionId: 'SES-002-2024-06-26-143122'
    },
    {
      id: 3,
      timestamp: '2024-06-26 14:30:15',
      username: 'bob.wilson',
      clientIP: '192.168.1.103',
      nasIP: '10.0.1.50',
      nasPort: '2952',
      authMethod: 'EAP-TLS',
      status: 'Success',
      responseTime: '234ms',
      reason: 'Certificate authentication successful',
      sessionId: 'SES-003-2024-06-26-143015'
    },
    {
      id: 4,
      timestamp: '2024-06-26 14:29:08',
      username: 'alice.brown',
      clientIP: '192.168.1.104',
      nasIP: '10.0.1.52',
      nasPort: '2953',
      authMethod: 'PAP',
      status: 'Success',
      responseTime: '167ms',
      reason: 'Authentication successful',
      sessionId: 'SES-004-2024-06-26-142908'
    },
    {
      id: 5,
      timestamp: '2024-06-26 14:28:33',
      username: 'guest.user',
      clientIP: '192.168.1.105',
      nasIP: '10.0.1.50',
      nasPort: '2954',
      authMethod: 'PAP',
      status: 'Rejected',
      responseTime: '45ms',
      reason: 'Account disabled',
      sessionId: 'SES-005-2024-06-26-142833'
    },
    {
      id: 6,
      timestamp: '2024-06-26 14:27:45',
      username: 'test.user',
      clientIP: '192.168.1.106',
      nasIP: '10.0.1.51',
      nasPort: '2955',
      authMethod: 'MSCHAP',
      status: 'Failed',
      responseTime: '112ms',
      reason: 'User not found',
      sessionId: 'SES-006-2024-06-26-142745'
    }
  ];

  const filteredLogs = authLogs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.clientIP.includes(searchTerm) ||
                         log.sessionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'Rejected': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-500';
      case 'Failed': return 'bg-red-500';
      case 'Rejected': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'PAP': return 'bg-blue-500';
      case 'CHAP': return 'bg-purple-500';
      case 'MSCHAP': return 'bg-indigo-500';
      case 'EAP-TLS': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate statistics
  const totalLogs = authLogs.length;
  const successfulAuths = authLogs.filter(log => log.status === 'Success').length;
  const failedAuths = authLogs.filter(log => log.status === 'Failed').length;
  const successRate = ((successfulAuths / totalLogs) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Authentication Logs</h2>
          <p className="text-white/60">Real-time RADIUS authentication monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Requests</CardTitle>
            <Filter className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalLogs}</div>
            <p className="text-xs text-white/60">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{successfulAuths}</div>
            <p className="text-xs text-green-400">{successRate}% success rate</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{failedAuths}</div>
            <p className="text-xs text-red-400">Authentication failures</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Avg Response</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">145ms</div>
            <p className="text-xs text-white/60">Response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                placeholder="Search by username, IP, or session ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-black/20 border-white/20 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-black/20 border-white/20 text-white">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Authentication Events</CardTitle>
          <CardDescription className="text-white/60">
            Showing {filteredLogs.length} of {authLogs.length} authentication attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">{log.username}</h4>
                        <Badge className={`${getStatusColor(log.status)} text-white text-xs`}>
                          {log.status}
                        </Badge>
                        <Badge className={`${getMethodColor(log.authMethod)} text-white text-xs`}>
                          {log.authMethod}
                        </Badge>
                      </div>
                      <div className="text-white/60 text-sm space-y-1">
                        <p><span className="text-white/40">Client:</span> {log.clientIP} → <span className="text-white/40">NAS:</span> {log.nasIP}:{log.nasPort}</p>
                        <p><span className="text-white/40">Reason:</span> {log.reason}</p>
                        <p><span className="text-white/40">Session:</span> {log.sessionId}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-white/60 text-sm">
                    <p className="text-white">{log.timestamp}</p>
                    <p className="text-purple-400">{log.responseTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationLogs;
