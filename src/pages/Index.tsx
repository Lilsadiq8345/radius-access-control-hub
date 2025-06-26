
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Activity, Server, Eye, Plus, LogOut, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import UserManagement from '@/components/UserManagement';
import AuthenticationLogs from '@/components/AuthenticationLogs';
import ServerStatus from '@/components/ServerStatus';
import NetworkPolicies from '@/components/NetworkPolicies';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // TODO: Replace with actual Supabase authentication
  const userType = localStorage.getItem('userType') || 'user';
  const isAdmin = userType === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  // Mock data for statistics
  const stats = [
    {
      title: "Active Users",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Auth Requests/Hour",
      value: "3,842",
      change: "+5%",
      icon: Shield,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Success Rate",
      value: "98.7%",
      change: "+0.3%",
      icon: Activity,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Active Servers",
      value: "12",
      change: "0%",
      icon: Server,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">RADIUS Central</h1>
                <p className="text-blue-200 text-sm">Centralized Authentication Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-white/80">
                <User className="h-4 w-4" />
                <span className="text-sm capitalize">{userType}</span>
              </div>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Eye className="h-4 w-4 mr-2" />
                Live Monitor
              </Button>
              {isAdmin && (
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-3'} bg-black/20 backdrop-blur-md border border-white/10`}>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20 text-white">
              Dashboard
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="data-[state=active]:bg-white/20 text-white">
                Users
              </TabsTrigger>
            )}
            <TabsTrigger value="logs" className="data-[state=active]:bg-white/20 text-white">
              Auth Logs
            </TabsTrigger>
            <TabsTrigger value="servers" className="data-[state=active]:bg-white/20 text-white">
              Servers
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="policies" className="data-[state=active]:bg-white/20 text-white">
                Policies
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/80">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-xs text-green-400">
                      {stat.change} from last hour
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Authentication Attempts</CardTitle>
                  <CardDescription className="text-white/60">
                    Last 10 authentication requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div>
                          <p className="text-white font-medium">user{i}@company.com</p>
                          <p className="text-white/60 text-sm">192.168.1.{100 + i}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm">Success</p>
                        <p className="text-white/60 text-xs">{i} min ago</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Server Health</CardTitle>
                  <CardDescription className="text-white/60">
                    RADIUS server status overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Primary RADIUS", status: "Online", load: "67%", color: "green" },
                    { name: "Secondary RADIUS", status: "Online", load: "43%", color: "green" },
                    { name: "Backup RADIUS", status: "Standby", load: "12%", color: "yellow" },
                  ].map((server, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-${server.color}-400`}></div>
                        <div>
                          <p className="text-white font-medium">{server.name}</p>
                          <p className="text-white/60 text-sm">{server.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">Load: {server.load}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          <TabsContent value="logs">
            <AuthenticationLogs />
          </TabsContent>

          <TabsContent value="servers">
            <ServerStatus />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="policies">
              <NetworkPolicies />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
