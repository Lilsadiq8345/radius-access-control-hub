
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-red-200">Insufficient Privileges</p>
        </div>

        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-center">Unauthorized Access</CardTitle>
            <CardDescription className="text-white/60 text-center">
              You don't have permission to access this resource
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-white/80">
              This area requires administrator privileges. Please contact your system administrator for access.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Link to="/login">
                  Sign in with different account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Unauthorized;
