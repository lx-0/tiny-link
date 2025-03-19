import { Url } from '@shared/schema';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  url: Url | null;
}

export default function DeleteConfirmModal({ open, onClose, onConfirm, url }: DeleteConfirmModalProps) {
  if (!url) return null;
  
  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/${url.shortCode}`;
  
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Link</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this link? This action cannot be undone and all analytics data will be lost. The shortened URL will no longer be accessible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700">Original URL:</p>
          <p className="text-sm text-gray-500 truncate">{url.originalUrl}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Shortened URL:</p>
          <p className="text-sm text-gray-500">{shortUrl}</p>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
