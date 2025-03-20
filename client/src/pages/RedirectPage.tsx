import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RedirectPage() {
  const [, setLocation] = useLocation();
  const [shortCode, setShortCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const params = useParams();
  
  // Helper to navigate without causing location format issues
  const navigate = (path: string) => {
    // Import and use our safeNavigate utility
    import('@/lib/utils').then(({ safeNavigate }) => {
      safeNavigate(path);
    });
  };
  
  useEffect(() => {
    const fetchAndRedirect = async () => {
      let code = '';
      
      // First try to get shortcode from route params (for /:shortCode routes)
      if (params && params.shortCode) {
        code = params.shortCode;
      } else {
        // Fallback to query params (for /not-found?code=xyz routes)
        const queryParams = new URLSearchParams(window.location.search);
        const queryCode = queryParams.get('code');
        if (queryCode) {
          code = queryCode;
        }
      }
      
      setShortCode(code);
      
      if (!code) {
        setError(true);
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch the original URL - GET /api/urls/by-code/:shortCode
        const response = await fetch(`/api/urls/by-code/${code}`);
        
        if (!response.ok) {
          throw new Error('URL not found');
        }
        
        const data = await response.json();
        
        if (data && data.originalUrl) {
          // Successful redirect
          window.location.href = data.originalUrl;
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error redirecting:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndRedirect();
  }, [params]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-gray-300 mb-4"></div>
              <div className="h-4 w-32 bg-gray-300 mb-2 rounded"></div>
              <div className="h-4 w-48 bg-gray-300 rounded"></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Link Not Found</h1>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              Sorry, the URL with code <span className="font-bold">{shortCode}</span> doesn't exist or has been deactivated.
            </p>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate('/')}>
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return null;
}
