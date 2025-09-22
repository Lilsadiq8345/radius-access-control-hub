
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, User, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user' as 'user' | 'admin'
  });
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in - using useEffect to avoid render-time navigation
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Don't render the login form if user is already logged in
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Password is required.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (!error) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">RADIUS Central</h1>
          <p className="text-blue-200">Centralized Authentication Management</p>
        </div>

        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-center">Welcome Back</CardTitle>
            <CardDescription className="text-white/60 text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={formData.userType} onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value as 'user' | 'admin' }))}>
              <TabsList className="grid w-full grid-cols-2 bg-black/20 backdrop-blur-md border border-white/10 mb-6">
                <TabsTrigger value="user" className="data-[state=active]:bg-white/20 text-white">
                  User Login
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-white/20 text-white">
                  Admin Login
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="user@radiuscorp.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your RADIUS password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as User"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-white">Admin Email</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        placeholder="admin@radiuscorp.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-white">Admin Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        id="admin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter admin RADIUS password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Admin"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 underline">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
