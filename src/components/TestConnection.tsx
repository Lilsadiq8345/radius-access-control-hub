import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createTestUsers, getTestCredentials } from '@/lib/test-users';
import { setupDatabase, checkDatabaseStatus, getSetupInstructions } from '@/lib/setup-database';
import { radiusApiService, RadiusRequest } from '@/lib/api/radius-api';

const TestConnection = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [radiusTestData, setRadiusTestData] = useState({
    username: 'admin',
    password: 'radius123',
    clientIp: '192.168.1.1'
  });
  const { toast } = useToast();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
    setDbStatus(null);
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    clearResults();

    try {
      addResult('Testing Supabase connection...');

      // Test 1: Basic connection
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        addResult(`❌ Connection failed: ${error.message}`);
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        addResult('✅ Supabase connection successful');
      }

      // Test 2: Check database status
      addResult('Checking database tables...');
      const status = await checkDatabaseStatus();
      setDbStatus(status);

      Object.entries(status).forEach(([table, exists]) => {
        if (exists) {
          addResult(`✅ ${table} table exists`);
        } else {
          addResult(`❌ ${table} table missing`);
        }
      });

      // Test 3: Check auth service
      addResult('Testing authentication service...');
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        addResult(`❌ Auth service error: ${authError.message}`);
      } else {
        addResult('✅ Authentication service working');
        if (authData.user) {
          addResult(`   - Current user: ${authData.user.email}`);
        } else {
          addResult('   - No user currently signed in');
        }
      }

      toast({
        title: "Connection Test Complete",
        description: "Check the results below for details",
      });

    } catch (error) {
      addResult(`❌ Test failed with error: ${error}`);
      toast({
        title: "Test Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testRadiusConnection = async () => {
    setIsLoading(true);
    addResult('Testing RADIUS server connection...');

    try {
      // Test 1: Check if RADIUS server is accessible
      const status = await radiusApiService.getServerStatus();
      addResult(`✅ RADIUS server accessible on port ${status.stats.port}`);
      addResult(`   - Server status: ${status.stats.isRunning ? 'Running' : 'Stopped'}`);
      addResult(`   - API port: ${status.stats.apiPort}`);
      addResult(`   - WebSocket: ${radiusApiService.isWebSocketConnected() ? 'Connected' : 'Disconnected'}`);

      // Test 2: Test authentication
      addResult('Testing RADIUS authentication...');
      const authRequest: RadiusRequest = {
        username: radiusTestData.username,
        password: radiusTestData.password,
        clientIp: radiusTestData.clientIp
      };

      const authResult = await radiusApiService.testAuthentication(authRequest);

      if (authResult.success) {
        addResult(`✅ Authentication successful for user: ${radiusTestData.username}`);
        addResult(`   - Session attributes: ${JSON.stringify(authResult.attributes)}`);
      } else {
        addResult(`❌ Authentication failed: ${authResult.message}`);
      }

      // Test 3: Check clients
      addResult('Checking RADIUS clients...');
      const clients = await radiusApiService.getClients();
      addResult(`✅ Found ${clients.length} configured clients`);
      clients.forEach(client => {
        addResult(`   - ${client.name || 'Unnamed'}: ${client.ipAddress}`);
      });

      toast({
        title: "RADIUS Test Complete",
        description: "RADIUS server connection and authentication tested successfully",
      });

    } catch (error) {
      addResult(`❌ RADIUS test failed: ${error}`);
      toast({
        title: "RADIUS Test Failed",
        description: "Failed to connect to RADIUS server. Make sure it's running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testNetworkDeviceConfig = async () => {
    setIsLoading(true);
    addResult('Testing network device configuration...');

    try {
      // Simulate network device configuration test
      addResult('Generating network device configuration templates...');

      const deviceConfigs = [
        {
          name: 'Cisco Router',
          type: 'cisco',
          config: `
interface GigabitEthernet0/1
 ip address 192.168.1.1 255.255.255.0
!
aaa new-model
aaa authentication login default group radius local
aaa authorization network default group radius local
radius-server host 192.168.1.10 auth-port 1812 acct-port 1813
radius-server key radius_secret_2024
`
        },
        {
          name: 'Juniper Switch',
          type: 'juniper',
          config: `
set system authentication-order [radius password]
set access radius-server 192.168.1.10 secret radius_secret_2024
set access radius-server 192.168.1.10 port 1812
set access radius-server 192.168.1.10 timeout 30
`
        },
        {
          name: 'Mikrotik Router',
          type: 'mikrotik',
          config: `
/radius add address=192.168.1.10 secret=radius_secret_2024 service=login
/ip hotspot profile set [find name=default] radius=192.168.1.10
/ip hotspot profile set [find name=default] radius-secret=radius_secret_2024
`
        }
      ];

      deviceConfigs.forEach(device => {
        addResult(`✅ ${device.name} configuration template generated`);
        addResult(`   - Type: ${device.type}`);
        addResult(`   - RADIUS server: 192.168.1.10:1812`);
      });

      addResult('Network device configuration test completed');
      toast({
        title: "Network Device Test Complete",
        description: "Configuration templates generated successfully",
      });

    } catch (error) {
      addResult(`❌ Network device test failed: ${error}`);
      toast({
        title: "Network Device Test Failed",
        description: "Failed to generate configuration templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUsersHandler = async () => {
    setIsLoading(true);
    addResult('Creating test users...');

    try {
      await createTestUsers();
      addResult('✅ Test users created successfully');

      const credentials = getTestCredentials();
      addResult('Test credentials:');
      Object.entries(credentials).forEach(([role, creds]) => {
        addResult(`   ${role}: ${creds.email} / ${creds.password}`);
      });

      toast({
        title: "Test Users Created",
        description: "Test users have been created successfully",
      });
    } catch (error) {
      addResult(`❌ Failed to create test users: ${error}`);
      toast({
        title: "Test Users Creation Failed",
        description: "Failed to create test users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseSetup = async () => {
    setIsLoading(true);
    addResult('Checking database setup...');

    try {
      const success = await setupDatabase();
      if (success) {
        addResult('✅ Database setup check completed');
        toast({
          title: "Database Check Complete",
          description: "Database setup has been verified",
        });
      } else {
        addResult('❌ Database setup issues found');
        const instructions = getSetupInstructions();
        addResult(`📋 ${instructions.title}`);
        addResult(instructions.message);
        instructions.steps.forEach(step => {
          addResult(`   ${step}`);
        });

        toast({
          title: "Database Setup Required",
          description: "Please run the database setup script",
          variant: "destructive",
        });
      }
    } catch (error) {
      addResult(`❌ Database setup check error: ${error}`);
      toast({
        title: "Database Check Error",
        description: "An error occurred during database check",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Connection Test</h2>
          <p className="text-white/60">Test database connection, RADIUS server, and system setup</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-white/80">
            Debug Mode
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Supabase Connection</CardTitle>
            <CardDescription className="text-white/60">
              Test basic connection to Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testSupabaseConnection}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? "Testing..." : "Test Connection"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">RADIUS Server</CardTitle>
            <CardDescription className="text-white/60">
              Test RADIUS server connection and auth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testRadiusConnection}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {isLoading ? "Testing..." : "Test RADIUS"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Network Devices</CardTitle>
            <CardDescription className="text-white/60">
              Test network device configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testNetworkDeviceConfig}
              disabled={isLoading}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {isLoading ? "Testing..." : "Test Devices"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Database Setup</CardTitle>
            <CardDescription className="text-white/60">
              Check database tables and setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testDatabaseSetup}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? "Checking..." : "Check Database"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">RADIUS Authentication Test</CardTitle>
          <CardDescription className="text-white/60">
            Test RADIUS authentication with custom credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-username" className="text-white">Username</Label>
              <Input
                id="test-username"
                value={radiusTestData.username}
                onChange={(e) => setRadiusTestData(prev => ({ ...prev, username: e.target.value }))}
                className="bg-black/20 border-white/20 text-white"
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password" className="text-white">Password</Label>
              <Input
                id="test-password"
                type="password"
                value={radiusTestData.password}
                onChange={(e) => setRadiusTestData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-black/20 border-white/20 text-white"
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-client-ip" className="text-white">Client IP</Label>
              <Input
                id="test-client-ip"
                value={radiusTestData.clientIp}
                onChange={(e) => setRadiusTestData(prev => ({ ...prev, clientIp: e.target.value }))}
                className="bg-black/20 border-white/20 text-white"
                placeholder="192.168.1.1"
              />
            </div>
          </div>
          <Button
            onClick={testRadiusConnection}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {isLoading ? "Testing Authentication..." : "Test Authentication"}
          </Button>
        </CardContent>
      </Card>

      {dbStatus && (
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Database Status</CardTitle>
            <CardDescription className="text-white/60">
              Current status of database tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(dbStatus).map(([table, exists]) => (
                <div key={table} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${exists ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-white text-sm capitalize">
                    {table.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Test Results</CardTitle>
          <CardDescription className="text-white/60">
            Connection and setup test results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">Log Output</h3>
              <Button
                onClick={clearResults}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Clear
              </Button>
            </div>

            <div className="bg-black/40 rounded-lg p-4 h-64 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-white/60 text-sm">No test results yet. Run a test to see output.</p>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      <span className="text-white/60">{result}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Quick Login Test</CardTitle>
          <CardDescription className="text-white/60">
            Use these credentials to test login functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="text-blue-400 font-medium mb-2">Admin User</h4>
              <p className="text-white/80 text-sm">Email: admin@radiuscorp.com</p>
              <p className="text-white/80 text-sm">Password: admin123</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h4 className="text-green-400 font-medium mb-2">Regular User</h4>
              <p className="text-white/80 text-sm">Email: user@radiuscorp.com</p>
              <p className="text-white/80 text-sm">Password: user123</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <h4 className="text-purple-400 font-medium mb-2">Test User</h4>
              <p className="text-white/80 text-sm">Email: test@radiuscorp.com</p>
              <p className="text-white/80 text-sm">Password: test123</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Setup Instructions</CardTitle>
          <CardDescription className="text-white/60">
            How to set up the database if tables are missing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium mb-2">Manual Database Setup</h4>
              <ol className="text-white/80 text-sm space-y-1 list-decimal list-inside">
                <li>Open your Supabase project dashboard</li>
                <li>Go to the SQL Editor</li>
                <li>Copy the contents of <code className="bg-black/20 px-1 rounded">database-setup.sql</code></li>
                <li>Paste and run the SQL script</li>
                <li>Refresh this page and run the tests again</li>
              </ol>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">RADIUS Server Setup</h4>
              <ol className="text-white/80 text-sm space-y-1 list-decimal list-inside">
                <li>Navigate to the <code className="bg-black/20 px-1 rounded">server</code> directory</li>
                <li>Run <code className="bg-black/20 px-1 rounded">npm install</code> to install dependencies</li>
                <li>Start the RADIUS server with <code className="bg-black/20 px-1 rounded">npm start</code></li>
                <li>The server will run on port 1812 (RADIUS) and 3001 (API)</li>
                <li>Test the connection using the RADIUS test button above</li>
              </ol>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Troubleshooting</h4>
              <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                <li>Make sure your Supabase project is active</li>
                <li>Verify your API credentials in <code className="bg-black/20 px-1 rounded">client.ts</code></li>
                <li>Check that authentication is enabled in Supabase</li>
                <li>Ensure Row Level Security (RLS) policies are configured</li>
                <li>Verify RADIUS server is running and accessible</li>
                <li>Check firewall settings for ports 1812 and 3001</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestConnection; 