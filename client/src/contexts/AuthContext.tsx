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
export const AuthContext = createContext<AuthContextType>({
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
  
  // Simple helper to navigate using wouter
  const navigate = (path: string, options = {}) => {
    import('@/lib/utils').then(({ safeNavigate }) => {
      safeNavigate(path, options);
    });
  };

  // Function to check authentication status
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      
      if (userData) {
        // Verify user exists in our database
        try {
          // First attempt to fetch the user profile from our backend API
          const userResponse = await fetch('/api/users/me', {
            headers: {
              'x-user-id': userData.id
            }
          });
          
          // If user not found in database, attempt recovery
          if (userResponse.status === 404) {
            console.log('User found in Supabase but not in database. Attempting recovery...');
            
            // Generate a default username from email
            const defaultUsername = userData.email?.split('@')[0] || `user_${Date.now()}`;
            
            // Try to create a new user record in our database
            const createResponse = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': userData.id
              },
              body: JSON.stringify({
                email: userData.email,
                username: defaultUsername,
                password: 'supabase-managed', 
                userId: userData.id
              })
            });
            
            if (createResponse.ok) {
              console.log('User record recovery successful');
              toast({
                title: 'Account recovered',
                description: 'We\'ve restored your account information.',
              });
            } else {
              console.error('Failed to recover user record');
            }
          }
        } catch (apiError) {
          console.error('Error verifying user in database:', apiError);
        }
      }
      
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
        // Use refreshUser which includes recovery logic
        const userData = await refreshUser();
        
        if (mounted) {
          // User is already set by refreshUser
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
      
      // After successful login, check and recover user if needed
      if (userData) {
        try {
          // Check if user exists in our database
          const userResponse = await fetch('/api/users/me', {
            headers: {
              'x-user-id': userData.id
            }
          });
          
          // If user not found in database, attempt recovery
          if (userResponse.status === 404) {
            console.log('User found in Supabase but not in database during login. Attempting recovery...');
            
            // Generate a default username from email
            const defaultUsername = userData.email?.split('@')[0] || `user_${Date.now()}`;
            
            // Try to create a new user record in our database
            const createResponse = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': userData.id
              },
              body: JSON.stringify({
                email: userData.email,
                username: defaultUsername,
                password: 'supabase-managed', 
                userId: userData.id
              })
            });
            
            if (createResponse.ok) {
              console.log('User record recovery successful during login');
              toast({
                title: 'Account recovered',
                description: 'We\'ve restored your account information.',
              });
            } else {
              console.error('Failed to recover user record during login');
            }
          }
        } catch (apiError) {
          console.error('Error verifying user in database during login:', apiError);
        }
      }
      
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
      
      // Direct navigation to login page
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

// Hook moved to separate file in hooks/useAuth.ts
// to avoid React hot refresh issues