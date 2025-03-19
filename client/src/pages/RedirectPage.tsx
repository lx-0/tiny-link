import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

export default function RedirectPage() {
  const [location, setLocation] = useLocation();
  const [shortCode, setShortCode] = useState<string>('');
  const params = useParams();
  
  // Helper to navigate without causing location format issues
  const navigate = (path: string) => {
    // Import and use our safeNavigate utility
    import('@/lib/utils').then(({ safeNavigate }) => {
      safeNavigate(path);
    });
  };
  
  useEffect(() => {
    // First try to get shortcode from route params (for /r/:shortCode routes)
    if (params && params.shortCode) {
      setShortCode(params.shortCode);
      return;
    }
    
    // Fallback to query params (for /not-found?code=xyz routes)
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    if (code) {
      setShortCode(code);
    }
  }, [params]);
  
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
              <Button onClick={() => navigate('/')}>
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
