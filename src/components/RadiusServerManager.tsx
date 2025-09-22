import { useState, useEffect } from 'react';
import { Server, Play, Square, Activity, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { radiusApiService, RadiusServerStats, RadiusClient } from '@/lib/api/radius-api';

const RadiusServerManager = () => {
  const [serverStatus, setServerStatus] = useState<RadiusServerStats>({
    isRunning: false,
    port: 1812,
    apiPort: 3001,
    activeConnections: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    successRate: 0,
    uptime: 0,
    errorCount: 0
  });
  const [clients, setClients] = useState<RadiusClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const { toast } = useToast();

  // Initialize and set up event listeners
  useEffect(() => {
    const initializeServer = async () => {
      try {
        setIsConnecting(true);
        const status = await radiusApiService.getServerStatus();
        setServerStatus(status.stats);
        setClients(status.clients);
      } catch (error) {
        console.error('Failed to get initial server status:', error);
        toast({
          title: "Connection Error",
          description: "Unable to connect to RADIUS server. Make sure the server is running.",
          variant: "destructive",
        });
      } finally {
        setIsConnecting(false);
      }
    };

    // Set up WebSocket event listeners
    const handleWsConnected = () => {
      setWsConnected(true);
      console.log('WebSocket connected');
    };

    const handleWsDisconnected = () => {
      setWsConnected(false);
      console.log('WebSocket disconnected');
    };

    const handleStatsUpdate = (stats: RadiusServerStats) => {
      setServerStatus(stats);
    };

    const handleClientsUpdate = (clients: RadiusClient[]) => {
      setClients(clients);
    };

    const handleServerStarted = () => {
      toast({
        title: "RADIUS Server Started",
        description: "The RADIUS server is now running and accepting connections.",
      });
    };

    const handleServerStopped = () => {
      toast({
        title: "RADIUS Server Stopped",
        description: "The RADIUS server has been stopped.",
      });
    };

    // Add event listeners
    radiusApiService.on('ws_connected', handleWsConnected);
    radiusApiService.on('ws_disconnected', handleWsDisconnected);
    radiusApiService.on('stats_update', handleStatsUpdate);
    radiusApiService.on('clients_update', handleClientsUpdate);
    radiusApiService.on('server_started', handleServerStarted);
    radiusApiService.on('server_stopped', handleServerStopped);

    // Initialize
    initializeServer();

    // Cleanup
    return () => {
      radiusApiService.off('ws_connected', handleWsConnected);
      radiusApiService.off('ws_disconnected', handleWsDisconnected);
      radiusApiService.off('stats_update', handleStatsUpdate);
      radiusApiService.off('clients_update', handleClientsUpdate);
      radiusApiService.off('server_started', handleServerStarted);
      radiusApiService.off('server_stopped', handleServerStopped);
    };
  }, [toast]);

  // Update stats every second when server is running
  useEffect(() => {
    const interval = setInterval(async () => {
      if (serverStatus.isRunning && wsConnected) {
        try {
          const status = await radiusApiService.getServerStatus();
          setServerStatus(status.stats);
        } catch (error) {
          console.error('Failed to update stats:', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [serverStatus.isRunning, wsConnected]);

  const startServer = async () => {
    setIsLoading(true);
    try {
      const result = await radiusApiService.startServer(serverStatus.port);

      if (result.success) {
        setServerStatus(prev => ({ ...prev, isRunning: true }));
        toast({
          title: "RADIUS Server Started",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start RADIUS server. Check if the server is accessible.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopServer = async () => {
    setIsLoading(true);
    try {
      const result = await radiusApiService.stopServer();

      if (result.success) {
        setServerStatus(prev => ({ ...prev, isRunning: false }));
        toast({
          title: "RADIUS Server Stopped",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop RADIUS server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const restartServer = async () => {
    setIsLoading(true);
    try {
      const result = await radiusApiService.restartServer(serverStatus.port);

      if (result.success) {
        setServerStatus(prev => ({ ...prev, isRunning: true }));
        toast({
          title: "RADIUS Server Restarted",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restart RADIUS server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateRequest = () => {
    if (!serverStatus.isRunning) {
      toast({
        title: "Server Not Running",
        description: "Cannot simulate request when server is stopped.",
        variant: "destructive",
      });
      return;
    }

    radiusApiService.simulateRequest(Math.random() > 0.2); // 80% success rate
    setServerStatus(radiusApiService.getServerStats());
  };

  const reconnectWebSocket = () => {
    radiusApiService.reconnectWebSocket();
    toast({
      title: "Reconnecting",
      description: "Attempting to reconnect to RADIUS server...",
    });
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Connecting to RADIUS server...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">RADIUS Server Manager</h2>
          <p className="text-white/60">Control and monitor the RADIUS authentication server</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={serverStatus.isRunning ? "default" : "secondary"}>
            {serverStatus.isRunning ? "Running" : "Stopped"}
          </Badge>
          <Badge variant={wsConnected ? "default" : "destructive"}>
            {wsConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
          <Button
            onClick={reconnectWebSocket}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Server Status
            </CardTitle>
            <Server className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {serverStatus.isRunning ? "Online" : "Offline"}
            </div>
            <p className="text-xs text-white/60">
              Port {serverStatus.port}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatUptime(serverStatus.uptime)}
            </div>
            <p className="text-xs text-white/60">
              Server runtime
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Total Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {serverStatus.totalRequests.toLocaleString()}
            </div>
            <p className="text-xs text-white/60">
              Since startup
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Success Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {serverStatus.successRate}%
            </div>
            <p className="text-xs text-white/60">
              Authentication success
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Server Controls</CardTitle>
          <CardDescription className="text-white/60">
            Start, stop, or restart the RADIUS server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={startServer}
              disabled={isLoading || serverStatus.isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Server
            </Button>

            <Button
              onClick={stopServer}
              disabled={isLoading || !serverStatus.isRunning}
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Server
            </Button>

            <Button
              onClick={restartServer}
              disabled={isLoading}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Restart Server
            </Button>

            <Button
              onClick={simulateRequest}
              disabled={!serverStatus.isRunning}
              variant="outline"
              className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
            >
              <Activity className="h-4 w-4 mr-2" />
              Simulate Request
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-start"
              checked={false}
              onCheckedChange={() => { }}
            />
            <Label htmlFor="auto-start" className="text-white">
              Auto-start server on boot
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">RADIUS Clients</CardTitle>
          <CardDescription className="text-white/60">
            Configured RADIUS clients and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.length === 0 ? (
              <p className="text-white/60 text-center py-4">No RADIUS clients configured</p>
            ) : (
              clients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h3 className="text-white font-medium">{client.name || 'Unnamed Client'}</h3>
                    <p className="text-white/60 text-sm">{client.ipAddress}</p>
                  </div>
                  <Badge variant="outline" className="border-green-500/20 text-green-400">
                    Active
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Server Configuration</CardTitle>
          <CardDescription className="text-white/60">
            Configure RADIUS server settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="port" className="text-white">RADIUS Port</Label>
              <Input
                id="port"
                type="number"
                value={serverStatus.port}
                onChange={(e) => setServerStatus(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                className="bg-black/20 border-white/20 text-white"
                disabled={serverStatus.isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-port" className="text-white">API Port</Label>
              <Input
                id="api-port"
                type="number"
                value={serverStatus.apiPort}
                onChange={(e) => setServerStatus(prev => ({ ...prev, apiPort: parseInt(e.target.value) }))}
                className="bg-black/20 border-white/20 text-white"
                disabled={serverStatus.isRunning}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadiusServerManager; 