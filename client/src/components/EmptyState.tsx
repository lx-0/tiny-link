import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

interface EmptyStateProps {
  onAddNew: () => void;
}

export default function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="text-center py-10 px-6 bg-white shadow rounded-lg">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
        <Link className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">No links yet</h3>
      <p className="mt-2 text-sm text-gray-500">
        Get started by creating your first shortened URL.
      </p>
      <div className="mt-6">
        <Button 
          onClick={onAddNew}
          className="inline-flex items-center px-4 py-2 text-sm font-medium"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Link
        </Button>
      </div>
    </div>
  );
}
