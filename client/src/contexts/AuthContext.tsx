import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, signOut, signIn as supabaseSignIn } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Define the types for auth functions
type User = any;
type AuthResponse = { user: User };

// Define the shape of our auth context
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => null,
  logout: async () => {},
  refreshUser: async () => null,
});

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Helper to navigate without causing location format issues
  const navigate = (path: string) => {
    // Import and use our safe navigation utility
    import('@/lib/utils').then(({ safeNavigate }) => {
      safeNavigate(path);
    });
  };

  // Function to check authentication status
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // On mount, check if user is already authenticated
  useEffect(() => {
    let mounted = true;
    
    async function checkAuth() {
      try {
        setIsLoading(true);
        const userData = await getCurrentUser();
        
        if (mounted) {
          setUser(userData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    }
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Function to handle login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await supabaseSignIn(email, password);
      const userData = data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      // Sign out from Supabase, which also clears localStorage
      await signOut();
      setUser(null);
      
      // Show success toast
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account.',
      });
      
      // After a small delay to let the logout complete fully
      setTimeout(() => {
        // Use our safe navigation utility to ensure proper URL format
        import('@/lib/utils').then(({ safeNavigate }) => {
          safeNavigate('/login', { forceReload: true });
        });
      }, 100);
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}