
import { useState, useEffect } from 'react';
import { Shield, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthLog {
  id: string;
  username: string;
  ip_address?: string;
  user_agent?: string;
  auth_method?: string;
  success: boolean;
  failure_reason?: string;
  nas_ip_address?: string;
  nas_port?: number;
  session_id?: string;
  created_at: string;
}

const AuthenticationLogs = () => {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('auth_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterStatus !== 'all') {
        query = query.eq('success', filterStatus === 'success');
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch authentication logs",
          variant: "destructive",
        });
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterStatus]);

  const filteredLogs = logs.filter(log =>
    log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip_address?.includes(searchTerm) ||
    log.auth_method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading authentication logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Authentication Logs</h2>
          <p className="text-white/60">Monitor RADIUS authentication attempts and sessions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-black/20 border-white/20 text-white w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Attempts</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{logs.length}</div>
            <p className="text-xs text-white/60">Last 100 attempts</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {logs.filter(log => log.success).length}
            </div>
            <p className="text-xs text-green-400">
              {logs.length > 0 ? Math.round((logs.filter(log => log.success).length / logs.length) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {logs.filter(log => !log.success).length}
            </div>
            <p className="text-xs text-red-400">Security alerts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Authentication Log</CardTitle>
          <CardDescription className="text-white/60">
            Showing {filteredLogs.length} of {logs.length} authentication attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    log.success ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {log.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-medium">{log.username}</h3>
                      <Badge className={`${log.success ? 'bg-green-500' : 'bg-red-500'} text-white text-xs`}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                      {log.auth_method && (
                        <Badge variant="outline" className="border-white/20 text-white/80 text-xs">
                          {log.auth_method}
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">
                      {log.ip_address} • {formatDate(log.created_at)}
                    </p>
                    {!log.success && log.failure_reason && (
                      <p className="text-red-400 text-sm">Reason: {log.failure_reason}</p>
                    )}
                    {log.nas_ip_address && (
                      <p className="text-white/60 text-sm">
                        NAS: {log.nas_ip_address}:{log.nas_port}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right text-white/60 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(log.created_at).toLocaleTimeString()}
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
