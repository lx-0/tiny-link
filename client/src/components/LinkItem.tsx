import { Url } from '@shared/schema';
import { Clipboard, Edit, Trash2, QrCode } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
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
  
  // Calculate base URL for shortening (using current domain)
  const baseUrl = window.location.origin;
  // Use a format that works on Replit
  const fullShortUrl = `${baseUrl}/r/${url.shortCode}`;
  
  // QR code URL
  const qrCodeUrl = `/api/urls/${url.id}/qrcode?format=svg`;
  const qrCodeUrlPng = `/api/urls/${url.id}/qrcode?format=png`;
  const qrCodeUrlDataUrl = `/api/urls/${url.id}/qrcode?format=data-url`;
  
  // Format created date
  const formattedDate = url.createdAt 
    ? formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })
    : '';
  
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
  
  const downloadQrCode = (format: string) => {
    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = format === 'png' ? qrCodeUrlPng : qrCodeUrl;
    link.download = `qrcode-${url.shortCode}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'QR Code downloaded',
      description: `The QR code has been downloaded in ${format.toUpperCase()} format.`,
    });
  };
  
  return (
    <li>
      <div className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="ml-1 flex flex-col">
                <div className="text-md font-medium text-primary truncate">
                  {url.originalUrl}
                </div>
                <div className="mt-1 flex items-center space-x-2">
                  <Badge variant={url.isActive ? "default" : "outline"}>
                    {url.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {formattedDate}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                <svg className="-ml-0.5 mr-1.5 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {url.clicks} clicks
              </div>
            </div>
          </div>
          <div className="mt-3 sm:flex sm:justify-between">
            <div className="flex items-center">
              <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <div className="text-gray-900 truncate">
                  Shortened URL: 
                  <a 
                    href={fullShortUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-1 font-medium text-primary hover:text-blue-600 truncate"
                    onClick={(e) => {
                      // Prevent default to avoid navigation issues
                      e.preventDefault();
                      window.open(fullShortUrl, '_blank');
                    }}
                  >
                    {fullShortUrl}
                  </a>
                </div>
                <button 
                  onClick={handleCopy}
                  className="ml-2 p-1 text-gray-500 hover:text-primary"
                  aria-label="Copy to clipboard"
                >
                  <Clipboard className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm sm:mt-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Code
                  </Button>
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
                      <img 
                        src={qrCodeUrl} 
                        alt={`QR Code for ${url.shortCode}`} 
                        className="w-64 h-64"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500 mb-2">This QR code links to:</p>
                      <p className="text-sm font-medium text-primary">{fullShortUrl}</p>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadQrCode('svg')}
                    >
                      Download SVG
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadQrCode('png')}
                    >
                      Download PNG
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={() => onEdit(url)}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              
              <Button
                onClick={() => onDelete(url)}
                variant="outline"
                size="sm"
                className="ml-2 text-red-700 hover:bg-red-50 hover:text-red-800 focus:ring-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
