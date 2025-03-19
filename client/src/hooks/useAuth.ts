import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/supabase';

// Custom hook to handle authentication queries consistently
export function useAuth() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}