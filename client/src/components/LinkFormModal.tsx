import { useState, useEffect } from 'react';
import { Url } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Schema for the form with validation
const formSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL').min(1, 'URL is required'),
  shortCode: z.string().min(3, 'Short code must be at least 3 characters').optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface LinkFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  initialData?: Url | null;
  isEditing: boolean;
}

export default function LinkFormModal({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  isEditing = false
}: LinkFormModalProps) {
  const baseUrl = window.location.origin;

  // Set up form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalUrl: initialData?.originalUrl || '',
      shortCode: initialData?.shortCode || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (open) {
      form.reset({
        originalUrl: initialData?.originalUrl || '',
        shortCode: initialData?.shortCode || '',
        isActive: initialData?.isActive ?? true,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Link' : 'Add New Link'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your link details. You can change the destination URL or adjust other settings.'
              : 'Enter the URL you want to shorten. You can also customize the short URL if you\'d like.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="originalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/your-long-url" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="shortCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Path (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        {baseUrl}/
                      </span>
                      <Input 
                        className="rounded-l-none"
                        placeholder="custom-path" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Leave blank to generate a random code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      This link will be immediately available for use.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {isEditing && initialData && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-500">
                      This link has been clicked <span className="font-medium text-gray-900">{initialData.clicks}</span> times since it was created.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Add Link'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
