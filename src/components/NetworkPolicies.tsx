
import { useState, useEffect } from 'react';
import { Plus, Shield, Search, Edit, Trash2, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NetworkPolicy {
  id: string;
  name: string;
  description?: string;
  source_networks?: string[];
  destination_networks?: string[];
  allowed_services?: string[];
  time_restrictions?: any;
  user_groups?: string[];
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

const NetworkPolicies = () => {
  const [policies, setPolicies] = useState<NetworkPolicy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source_networks: '',
    destination_networks: '',
    allowed_services: '',
    user_groups: '',
    priority: '100',
    enabled: true
  });
  const { toast } = useToast();

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('network_policies')
        .select('*')
        .order('priority', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch network policies",
          variant: "destructive",
        });
        return;
      }

      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('network_policies')
        .insert([{
          name: formData.name,
          description: formData.description || null,
          source_networks: formData.source_networks.split(',').map(s => s.trim()).filter(Boolean),
          destination_networks: formData.destination_networks.split(',').map(s => s.trim()).filter(Boolean),
          allowed_services: formData.allowed_services.split(',').map(s => s.trim()).filter(Boolean),
          user_groups: formData.user_groups.split(',').map(s => s.trim()).filter(Boolean),
          priority: parseInt(formData.priority),
          enabled: formData.enabled
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
        description: "Network policy added successfully",
      });

      setIsAddPolicyOpen(false);
      setFormData({
        name: '',
        description: '',
        source_networks: '',
        destination_networks: '',
        allowed_services: '',
        user_groups: '',
        priority: '100',
        enabled: true
      });
      fetchPolicies();
    } catch (error) {
      console.error('Error adding policy:', error);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    try {
      const { error } = await supabase
        .from('network_policies')
        .delete()
        .eq('id', policyId);

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
        description: "Network policy deleted successfully",
      });

      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const filteredPolicies = policies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading network policies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Network Policies</h2>
          <p className="text-white/60">Configure access control and network security policies</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <Dialog open={isAddPolicyOpen} onOpenChange={setIsAddPolicyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Network Policy</DialogTitle>
                <DialogDescription className="text-white/60">
                  Create a new network access control policy
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPolicy} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Policy Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="Admin Access Policy"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="100"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-black/20 border-white/20 text-white"
                    placeholder="Policy description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source_networks">Source Networks</Label>
                    <Input
                      id="source_networks"
                      value={formData.source_networks}
                      onChange={(e) => setFormData(prev => ({ ...prev, source_networks: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="192.168.1.0/24, 10.0.0.0/8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination_networks">Destination Networks</Label>
                    <Input
                      id="destination_networks"
                      value={formData.destination_networks}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination_networks: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="0.0.0.0/0, 172.16.0.0/12"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allowed_services">Allowed Services</Label>
                    <Input
                      id="allowed_services"
                      value={formData.allowed_services}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowed_services: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="HTTP, HTTPS, SSH, DNS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_groups">User Groups</Label>
                    <Input
                      id="user_groups"
                      value={formData.user_groups}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_groups: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="admin, user, guest"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label htmlFor="enabled">Enable Policy</Label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddPolicyOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Create Policy
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{policies.length}</div>
            <p className="text-xs text-white/60">Network policies</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active</CardTitle>
            <Settings className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {policies.filter(p => p.enabled).length}
            </div>
            <p className="text-xs text-white/60">Currently enforced</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">High Priority</CardTitle>
            <Shield className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {policies.filter(p => p.priority <= 50).length}
            </div>
            <p className="text-xs text-white/60">Critical policies</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Policy Directory</CardTitle>
          <CardDescription className="text-white/60">
            Showing {filteredPolicies.length} of {policies.length} network policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPolicies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-medium">{policy.name}</h3>
                      <Badge className={`${policy.enabled ? 'bg-green-500' : 'bg-gray-500'} text-white text-xs`}>
                        {policy.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white/80 text-xs">
                        Priority: {policy.priority}
                      </Badge>
                    </div>
                    {policy.description && (
                      <p className="text-white/60 text-sm">{policy.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {policy.allowed_services?.slice(0, 3).map((service, i) => (
                        <Badge key={i} variant="outline" className="border-blue-500/20 text-blue-400 text-xs">
                          {service}
                        </Badge>
                      ))}
                      {policy.allowed_services && policy.allowed_services.length > 3 && (
                        <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                          +{policy.allowed_services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkPolicies;
