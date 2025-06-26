
import { useState } from 'react';
import { Shield, Plus, Edit, Trash2, Clock, Users, Network, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const NetworkPolicies = () => {
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);

  // Mock policy data
  const policies = [
    {
      id: 1,
      name: 'Employee WiFi Access',
      description: 'Standard WiFi access for employees during business hours',
      priority: 1,
      status: 'Active',
      conditions: {
        userGroups: ['Employees'],
        timeRestrictions: '08:00-18:00, Mon-Fri',
        networkTypes: ['WiFi'],
        locations: ['Main Building', 'Branch Office']
      },
      actions: {
        allowAccess: true,
        vlanId: 100,
        bandwidthLimit: '50 Mbps',
        sessionTimeout: '8 hours'
      },
      statistics: {
        appliedUsers: 1247,
        successfulAuth: 98.7,
        lastModified: '2024-06-20'
      }
    },
    {
      id: 2,
      name: 'Guest Network Access',
      description: 'Limited access for guest users with time restrictions',
      priority: 5,
      status: 'Active',
      conditions: {
        userGroups: ['Guests'],
        timeRestrictions: '24/7',
        networkTypes: ['Guest WiFi'],
        locations: ['All']
      },
      actions: {
        allowAccess: true,
        vlanId: 200,
        bandwidthLimit: '10 Mbps',
        sessionTimeout: '4 hours'
      },
      statistics: {
        appliedUsers: 89,
        successfulAuth: 95.2,
        lastModified: '2024-06-18'
      }
    },
    {
      id: 3,
      name: 'Admin VPN Access',
      description: 'Full network access for administrators via VPN',
      priority: 1,
      status: 'Active',
      conditions: {
        userGroups: ['Administrators'],
        timeRestrictions: '24/7',
        networkTypes: ['VPN'],
        locations: ['Remote']
      },
      actions: {
        allowAccess: true,
        vlanId: 1,
        bandwidthLimit: 'Unlimited',
        sessionTimeout: '12 hours'
      },
      statistics: {
        appliedUsers: 12,
        successfulAuth: 99.1,
        lastModified: '2024-06-25'
      }
    },
    {
      id: 4,
      name: 'IoT Device Access',
      description: 'Restricted access for IoT devices and sensors',
      priority: 10,
      status: 'Active',
      conditions: {
        userGroups: ['IoT Devices'],
        timeRestrictions: '24/7',
        networkTypes: ['WiFi'],
        locations: ['All']
      },
      actions: {
        allowAccess: true,
        vlanId: 300,
        bandwidthLimit: '1 Mbps',
        sessionTimeout: 'No limit'
      },
      statistics: {
        appliedUsers: 234,
        successfulAuth: 99.8,
        lastModified: '2024-06-15'
      }
    },
    {
      id: 5,
      name: 'After Hours Block',
      description: 'Block non-essential access outside business hours',
      priority: 1,
      status: 'Active',
      conditions: {
        userGroups: ['Employees'],
        timeRestrictions: '18:00-08:00, Weekends',
        networkTypes: ['All'],
        locations: ['All']
      },
      actions: {
        allowAccess: false,
        vlanId: null,
        bandwidthLimit: null,
        sessionTimeout: null
      },
      statistics: {
        appliedUsers: 1247,
        successfulAuth: 0,
        lastModified: '2024-06-22'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Inactive': return 'bg-gray-500';
      case 'Pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'bg-red-500';
    if (priority <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Network Access Policies</h2>
          <p className="text-white/60">Manage RADIUS authentication and authorization rules</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isAddPolicyOpen} onOpenChange={setIsAddPolicyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Network Access Policy</DialogTitle>
                <DialogDescription className="text-white/60">
                  Define conditions and actions for network access control
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="policyName">Policy Name</Label>
                      <Input id="policyName" className="bg-black/20 border-white/20 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select>
                        <SelectTrigger className="bg-black/20 border-white/20 text-white">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="1">1 (Highest)</SelectItem>
                          <SelectItem value="5">5 (Medium)</SelectItem>
                          <SelectItem value="10">10 (Lowest)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" className="bg-black/20 border-white/20 text-white" />
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Access Conditions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userGroups">User Groups</Label>
                      <Select>
                        <SelectTrigger className="bg-black/20 border-white/20 text-white">
                          <SelectValue placeholder="Select user groups" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="employees">Employees</SelectItem>
                          <SelectItem value="guests">Guests</SelectItem>
                          <SelectItem value="admins">Administrators</SelectItem>
                          <SelectItem value="iot">IoT Devices</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="networkType">Network Type</Label>
                      <Select>
                        <SelectTrigger className="bg-black/20 border-white/20 text-white">
                          <SelectValue placeholder="Select network type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="wifi">WiFi</SelectItem>
                          <SelectItem value="ethernet">Ethernet</SelectItem>
                          <SelectItem value="vpn">VPN</SelectItem>
                          <SelectItem value="guest">Guest WiFi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeRestrictions">Time Restrictions</Label>
                    <Input id="timeRestrictions" placeholder="e.g., 08:00-18:00, Mon-Fri" className="bg-black/20 border-white/20 text-white" />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Access Actions</h4>
                  <div className="flex items-center space-x-2">
                    <Switch id="allowAccess" />
                    <Label htmlFor="allowAccess">Allow Access</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vlanId">VLAN ID</Label>
                      <Input id="vlanId" type="number" className="bg-black/20 border-white/20 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bandwidthLimit">Bandwidth Limit</Label>
                      <Input id="bandwidthLimit" placeholder="e.g., 50 Mbps" className="bg-black/20 border-white/20 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout</Label>
                    <Input id="sessionTimeout" placeholder="e.g., 8 hours" className="bg-black/20 border-white/20 text-white" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddPolicyOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    Create Policy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{policies.length}</div>
            <p className="text-xs text-white/60">Active rules</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active Policies</CardTitle>
            <Network className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{policies.filter(p => p.status === 'Active').length}</div>
            <p className="text-xs text-green-400">Currently enforced</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Covered Users</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,582</div>
            <p className="text-xs text-white/60">Under policy control</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Compliance Rate</CardTitle>
            <Lock className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">98.4%</div>
            <p className="text-xs text-cyan-400">Policy adherence</p>
          </CardContent>
        </Card>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <Card key={policy.id} className="bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Policy Header */}
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-white">{policy.name}</h3>
                    <Badge className={`${getStatusColor(policy.status)} text-white`}>
                      {policy.status}
                    </Badge>
                    <Badge className={`${getPriorityColor(policy.priority)} text-white`}>
                      Priority {policy.priority}
                    </Badge>
                  </div>
                  <p className="text-white/60">{policy.description}</p>

                  {/* Policy Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Conditions */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Conditions
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-white/60">User Groups:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {policy.conditions.userGroups.map((group, i) => (
                              <Badge key={i} variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-white/60">Time:</span>
                          <p className="text-white text-xs">{policy.conditions.timeRestrictions}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Network:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {policy.conditions.networkTypes.map((type, i) => (
                              <Badge key={i} variant="outline" className="border-green-500/50 text-green-400 text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium flex items-center">
                        <Network className="h-4 w-4 mr-2" />
                        Actions
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Access:</span>
                          <span className={policy.actions.allowAccess ? 'text-green-400' : 'text-red-400'}>
                            {policy.actions.allowAccess ? 'Allow' : 'Deny'}
                          </span>
                        </div>
                        {policy.actions.vlanId && (
                          <div className="flex justify-between">
                            <span className="text-white/60">VLAN:</span>
                            <span className="text-white">{policy.actions.vlanId}</span>
                          </div>
                        )}
                        {policy.actions.bandwidthLimit && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Bandwidth:</span>
                            <span className="text-white">{policy.actions.bandwidthLimit}</span>
                          </div>
                        )}
                        {policy.actions.sessionTimeout && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Timeout:</span>
                            <span className="text-white">{policy.actions.sessionTimeout}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Statistics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Applied Users:</span>
                          <span className="text-cyan-400">{policy.statistics.appliedUsers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Success Rate:</span>
                          <span className="text-green-400">{policy.statistics.successfulAuth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Last Modified:</span>
                          <span className="text-white/60">{policy.statistics.lastModified}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NetworkPolicies;
