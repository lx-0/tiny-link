import { Url } from '@shared/schema';
import { Clipboard, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  // No prefix needed anymore - URL is directly at the root
  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/${url.shortCode}`;
  
  // Format created date
  const formattedDate = url.createdAt 
    ? formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })
    : '';
  
  const handleCopy = async () => {
    const success = await copy(shortUrl);
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
                  <Badge variant={url.isActive ? "default" : "secondary"} className={url.isActive ? "bg-green-100 text-green-800" : ""}>
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
                  <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="ml-1 font-medium text-primary hover:text-blue-600 truncate">
                    {shortUrl}
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
              <Button
                onClick={() => onEdit(url)}
                variant="outline"
                size="sm"
                className="ml-4"
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
