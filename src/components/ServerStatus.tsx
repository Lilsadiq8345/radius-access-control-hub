
import { useState, useEffect } from 'react';
import { Plus, Server, Activity, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface RadiusServer {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  shared_secret: string;
  status: string;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  created_at: string;
  updated_at: string;
}

const ServerStatus = () => {
  const [servers, setServers] = useState<RadiusServer[]>([]);
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: '1812',
    shared_secret: '',
    status: 'active'
  });
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const fetchServers = async () => {
    try {
      const { data, error } = await supabase
        .from('radius_servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch servers",
          variant: "destructive",
        });
        return;
      }

      setServers(data || []);
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('radius_servers')
        .insert([{
          name: formData.name,
          ip_address: formData.ip_address,
          port: parseInt(formData.port),
          shared_secret: formData.shared_secret,
          status: formData.status,
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          disk_usage: Math.random() * 100
        }]);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Server added successfully",
      });

      setIsAddServerOpen(false);
      setFormData({
        name: '',
        ip_address: '',
        port: '1812',
        shared_secret: '',
        status: 'active'
      });
      fetchServers();
    } catch (error) {
      console.error('Error adding server:', error);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    try {
      const { error } = await supabase
        .from('radius_servers')
        .delete()
        .eq('id', serverId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Server deleted successfully",
      });

      fetchServers();
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading servers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">RADIUS Servers</h2>
          <p className="text-white/60">Monitor and manage RADIUS authentication servers</p>
        </div>
        {isAdmin && (
          <Dialog open={isAddServerOpen} onOpenChange={setIsAddServerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Server
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Add New RADIUS Server</DialogTitle>
                <DialogDescription className="text-white/60">
                  Configure a new RADIUS authentication server
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddServer} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Server Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-black/20 border-white/20 text-white"
                    placeholder="Primary RADIUS Server"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip_address">IP Address</Label>
                    <Input
                      id="ip_address"
                      value={formData.ip_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="192.168.1.10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="1812"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shared_secret">Shared Secret</Label>
                  <Input
                    id="shared_secret"
                    type="password"
                    value={formData.shared_secret}
                    onChange={(e) => setFormData(prev => ({ ...prev, shared_secret: e.target.value }))}
                    className="bg-black/20 border-white/20 text-white"
                    placeholder="Enter shared secret"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddServerOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Add Server
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Servers</CardTitle>
            <Server className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{servers.length}</div>
            <p className="text-xs text-white/60">Configured servers</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active Servers</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {servers.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-white/60">Currently online</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {servers.filter(s => s.status !== 'active').length}
            </div>
            <p className="text-xs text-white/60">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Server Directory</CardTitle>
          <CardDescription className="text-white/60">
            Showing {servers.length} RADIUS servers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {servers.map((server) => (
              <div key={server.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-medium">{server.name}</h3>
                      <Badge className={`${getStatusColor(server.status)} text-white text-xs`}>
                        {server.status}
                      </Badge>
                    </div>
                    <p className="text-white/60 text-sm">{server.ip_address}:{server.port}</p>
                    <div className="flex space-x-4 text-white/60 text-sm">
                      {server.cpu_usage && <span>CPU: {server.cpu_usage.toFixed(1)}%</span>}
                      {server.memory_usage && <span>RAM: {server.memory_usage.toFixed(1)}%</span>}
                      {server.disk_usage && <span>Disk: {server.disk_usage.toFixed(1)}%</span>}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteServer(server.id)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerStatus;
