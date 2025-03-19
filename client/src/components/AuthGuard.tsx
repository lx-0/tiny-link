import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

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
  const [location, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Simple navigation helper using safeNavigate
  const navigate = (path: string) => {
    import('@/lib/utils').then(({ safeNavigate }) => {
      safeNavigate(path);
    });
  };
  
  // Handle authentication logic
  useEffect(() => {
    // Wait for loading to complete
    if (!isLoading) {      
      // Unauthenticated user trying to access protected route
      if (requireAuth && !isAuthenticated) {
        // Use only the path portion for navigation
        navigate(redirectTo);
      }
      
      // Authenticated user trying to access auth-only route (login/register)
      if (!requireAuth && isAuthenticated) {
        // Use only the path portion for navigation
        navigate('/dashboard');
      }
    }
  }, [user, isLoading, isAuthenticated, requireAuth, redirectTo, navigate]);
  
  // Show loading state while checking authentication
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
  if ((requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated)) {
    return <>{children}</>;
  }
  
  // Don't render anything while redirecting
  return null;
}