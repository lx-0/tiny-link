import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getCurrentUser } from '@/lib/supabase';

// Authentication wrapper component
export default function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}: { 
  children: React.ReactNode,
  requireAuth?: boolean,
  redirectTo?: string
}) {
  const [_, navigate] = useLocation();
  
  // Get current user with React Query
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes 
    refetchOnWindowFocus: false
  });
  
  // Handle authentication logic
  useEffect(() => {
    // Wait for loading to complete
    if (!isLoading) {
      const authenticated = !!user;
      
      // Unauthenticated user trying to access protected route
      if (requireAuth && !authenticated) {
        navigate(redirectTo);
      }
      
      // Authenticated user trying to access auth-only route (login/register)
      if (!requireAuth && authenticated) {
        navigate('/');
      }
    }
  }, [user, isLoading, requireAuth, redirectTo, navigate]);
  
  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-blue-400 rounded-full"></div>
        </div>
      </div>
    );
  }
  
  // User is authenticated and route requires auth, or
  // User is not authenticated and route doesn't require auth
  if ((requireAuth && !!user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }
  
  // Don't render anything while redirecting
  return null;
}