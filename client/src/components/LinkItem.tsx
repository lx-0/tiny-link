import { Url } from '@shared/schema';
import { Clipboard, Edit, Trash2, QrCode } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface LinkItemProps {
  url: Url;
  onEdit: (url: Url) => void;
  onDelete: (url: Url) => void;
}

export default function LinkItem({ url, onEdit, onDelete }: LinkItemProps) {
  const { copy } = useClipboard();
  const { toast } = useToast();
  const [location] = useLocation();
  const [qrCodeSrc, setQrCodeSrc] = useState<string | null>(null);
  const [isLoadingQrCode, setIsLoadingQrCode] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string | null>(null);
  
  // Calculate base URL for shortening (using current domain)
  const baseUrl = window.location.origin;
  // Use a format that works on Replit
  const fullShortUrl = `${baseUrl}/r/${url.shortCode}`;
  
  // Format created date
  const formattedDate = url.createdAt 
    ? formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })
    : '';
  
  // Function to fetch QR code with authentication
  const fetchQrCode = async (format: string = 'svg'): Promise<string> => {
    setIsLoadingQrCode(true);
    setQrCodeError(null);
    
    try {
      // Get the current user's ID
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        throw new Error('You must be logged in to view QR codes');
      }
      
      // Fetch the QR code with the user ID in the header
      const response = await fetch(`/api/urls/${url.id}/qrcode?format=${format}`, {
        headers: {
          'x-user-id': userId
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch QR code');
      }
      
      // Handle different response formats
      if (format === 'data-url') {
        const jsonData = await response.json();
        return jsonData.dataUrl;
      } else {
        // For SVG and PNG, convert to data URL
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setQrCodeError(errorMessage);
      throw error;
    } finally {
      setIsLoadingQrCode(false);
    }
  };
  
  const handleCopy = async () => {
    const success = await copy(fullShortUrl);
    if (success) {
      toast({
        title: 'URL copied to clipboard',
        description: 'The shortened URL has been copied to your clipboard.',
      });
    } else {
      toast({
        title: 'Failed to copy URL',
        description: 'Please try again or copy manually.',
        variant: 'destructive',
      });
    }
  };
  
  const downloadQrCode = async (format: string) => {
    try {
      // Fetch the QR code with authentication
      const dataUrl = await fetchQrCode(format);
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode-${url.shortCode}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'QR Code downloaded',
        description: `The QR code has been downloaded in ${format.toUpperCase()} format.`,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Failed to download QR code',
        variant: 'destructive',
      });
    }
  };
  
  // Load QR code when dialog opens
  const handleQrCodeDialogOpen = async () => {
    if (!qrCodeSrc && !isLoadingQrCode) {
      try {
        const dataUrl = await fetchQrCode('svg');
        setQrCodeSrc(dataUrl);
      } catch (error) {
        // Error is already handled in fetchQrCode
      }
    }
  };
  
  return (
    <li className="relative bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden hover:shadow-md transition-shadow">
      {/* Top section with original URL and stats */}
      <div className="p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
          <h3 className="text-md font-medium text-primary truncate max-w-full sm:max-w-[60%]">
            {url.originalUrl}
          </h3>
          <div className="flex items-center space-x-2 self-start sm:self-center">
            <Badge variant={url.isActive ? "default" : "outline"}>
              {url.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <div className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
              <svg className="-ml-0.5 mr-1 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {url.clicks} clicks
            </div>
          </div>
        </div>
        
        {/* Date created */}
        <div className="text-sm text-gray-500 mb-2">
          Created {formattedDate}
        </div>
        
        {/* Shortened URL with copy button */}
        <div className="bg-gray-50 p-2 rounded-md mb-3">
          <div className="text-sm text-gray-700 mb-1">
            Shortened URL:
          </div>
          <div className="flex items-center">
            <div className="flex-1 overflow-hidden">
              <a 
                href={fullShortUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm font-medium text-primary hover:text-blue-600 truncate block"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(fullShortUrl, '_blank');
                }}
              >
                {fullShortUrl}
              </a>
            </div>
            <button 
              onClick={handleCopy}
              className="ml-2 p-1 text-gray-500 hover:text-primary flex-shrink-0"
              aria-label="Copy to clipboard"
            >
              <Clipboard className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Action buttons row - fixed at bottom */}
      <div className="flex border-t border-gray-100 divide-x divide-gray-100">
        <Dialog onOpenChange={(open) => {
          if (open) handleQrCodeDialogOpen();
        }}>
          <DialogTrigger asChild>
            <button className="flex-1 p-2 flex items-center justify-center text-sm text-gray-700 hover:bg-gray-50">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code for {url.shortCode}</DialogTitle>
              <DialogDescription>
                Scan this QR code to access your shortened URL. You can also download it in different formats.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="border border-gray-200 rounded-lg p-2 bg-white">
                {isLoadingQrCode && (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}
                
                {qrCodeError && (
                  <div className="w-64 h-64 flex items-center justify-center text-center p-4">
                    <div className="text-red-500">
                      <p className="font-medium">Error loading QR code</p>
                      <p className="text-sm mt-2">{qrCodeError}</p>
                    </div>
                  </div>
                )}
                
                {qrCodeSrc && !isLoadingQrCode && !qrCodeError && (
                  <img 
                    src={qrCodeSrc} 
                    alt={`QR Code for ${url.shortCode}`} 
                    className="w-64 h-64"
                  />
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 mb-2">This QR code links to:</p>
                <p className="text-sm font-medium text-primary">{fullShortUrl}</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => downloadQrCode('svg')}
                disabled={isLoadingQrCode}
              >
                Download SVG
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => downloadQrCode('png')}
                disabled={isLoadingQrCode}
              >
                Download PNG
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <button 
          onClick={() => onEdit(url)}
          className="flex-1 p-2 flex items-center justify-center text-sm text-gray-700 hover:bg-gray-50"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </button>
        
        <button 
          onClick={() => onDelete(url)}
          className="flex-1 p-2 flex items-center justify-center text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </button>
      </div>
    </li>
  );
}
