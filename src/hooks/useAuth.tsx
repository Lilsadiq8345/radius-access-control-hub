
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, department: string, role?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userProfile: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  // Function to create user profile if it doesn't exist
  const createUserProfile = async (user: User) => {
    try {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
          department: user.user_metadata?.department || 'general',
          role: user.user_metadata?.role || 'user',
          email: user.email,
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        // If table doesn't exist, create a mock profile
        if (createError.code === '42P01') { // Table doesn't exist
          console.log('User profiles table not found, using mock profile');
          setUserProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
            department: user.user_metadata?.department || 'general',
            role: user.user_metadata?.role || 'user',
            email: user.email,
            status: 'active'
          });
        }
      } else {
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Create mock profile as fallback
      setUserProfile({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
        department: user.user_metadata?.department || 'general',
        role: user.user_metadata?.role || 'user',
        email: user.email,
        status: 'active'
      });
    }
  };

  // Function to fetch user profile with timeout
  const fetchUserProfile = async (user: User) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout')), 5000); // 5 second timeout
      });

      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: profile, error: profileError } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          await createUserProfile(user);
        } else if (profileError.code === '42P01') { // Table doesn't exist
          console.log('User profiles table not found, using mock profile');
          setUserProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
            department: user.user_metadata?.department || 'general',
            role: user.user_metadata?.role || 'user',
            email: user.email,
            status: 'active'
          });
        } else {
          // Any other error, create mock profile
          console.log('Using mock profile due to database error');
          setUserProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
            department: user.user_metadata?.department || 'general',
            role: user.user_metadata?.role || 'user',
            email: user.email,
            status: 'active'
          });
        }
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create mock profile as fallback for any error
      setUserProfile({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
        department: user.user_metadata?.department || 'general',
        role: user.user_metadata?.role || 'user',
        email: user.email,
        status: 'active'
      });
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Starting authentication setup');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('User found, setting loading to false immediately');
          setLoading(false);
          // Then fetch profile asynchronously
          fetchUserProfile(session.user).catch(error => {
            console.error('Profile fetch failed:', error);
          });
        } else {
          console.log('No user found, setting loading to false');
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check result:', session ? 'found' : 'not found');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('Existing user found, setting loading to false immediately');
          setLoading(false);
          // Then fetch profile asynchronously
          fetchUserProfile(session.user).catch(error => {
            console.error('Profile fetch failed:', error);
          });
        } else {
          console.log('No existing user, setting loading to false');
          setUserProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, department: string, role: string = 'user') => {
    try {
      console.log('Attempting signup for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            department: department,
            role: role
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Registration Successful",
          description: "Please check your email to confirm your account before signing in.",
        });
      } else if (data.session) {
        // Auto-confirmed user
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred during registration.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting signin for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred during login.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Clear local state
        setUser(null);
        setSession(null);
        setUserProfile(null);

        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign Out Failed",
        description: "An unexpected error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
