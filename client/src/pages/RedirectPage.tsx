import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

export default function RedirectPage() {
  const [location, navigate] = useLocation();
  const [, params] = useRoute('/:shortCode');
  const [, rParams] = useRoute('/r/:shortCode');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shortCode, setShortCode] = useState<string>('');
  
  useEffect(() => {
    // Function to handle redirect
    const handleRedirect = async (code: string) => {
      if (!code) {
        setError(true);
        setIsLoading(false);
        return;
      }
      
      setShortCode(code);
      
      try {
        // Call API to get the original URL
        const response = await fetch(`/api/urls/redirect/${code}`);
        
        if (response.ok) {
          const data = await response.json();
          // Redirect to the original URL
          window.location.href = data.originalUrl;
        } else {
          setError(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error redirecting:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    // Get shortcode from various sources
    // 1. Check URL params from direct root shortcode
    if (params && params.shortCode) {
      handleRedirect(params.shortCode);
    } 
    // 2. Check legacy /r/ prefix path
    else if (rParams && rParams.shortCode) {
      handleRedirect(rParams.shortCode);
    } 
    // 3. Check query params (for backward compatibility)
    else {
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      if (code) {
        handleRedirect(code);
      } else {
        setError(true);
        setIsLoading(false);
      }
    }
    
    // Clean up
    return () => {
      setIsLoading(false);
    };
  }, [params, rParams]);
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-gray-600">Redirecting...</p>
          </div>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
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
                <Button onClick={() => navigate('/app')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  
  return null; // This won't render as we'll redirect before this point
}
