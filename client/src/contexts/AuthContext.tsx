import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Define the shape of our auth context
type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
});

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

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

  // Function to handle logout
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account.',
      });
      navigate('/login');
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
    logout,
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