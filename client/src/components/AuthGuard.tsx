import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

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
  
  // Helper to navigate without causing location format issues
  const navigate = (path: string) => {
    // Import and use our safe navigation utility with domain stripping
    import('@/lib/utils').then(({ safeNavigate }) => {
      // Strip off any domain/protocol if present
      let cleanPath = path;
      
      // Handle URLs with domain/protocol
      if (path.includes('://') || path.includes('.replit.dev/')) {
        try {
          // Parse as URL and extract just the pathname
          const url = new URL(path.includes('://') ? path : `https://${path}`);
          cleanPath = url.pathname;
        } catch (e) {
          // If URL parsing fails, try regex extraction
          const pathMatch = path.match(/\.replit\.dev(\/[^?#]*)/);
          if (pathMatch && pathMatch[1]) {
            cleanPath = pathMatch[1];
          }
        }
      }
      
      // Normalize path and navigate
      safeNavigate(cleanPath);
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