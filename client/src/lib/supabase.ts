import { createClient } from '@supabase/supabase-js';
import { apiRequest } from './queryClient';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, username: string) {
  // Sign up with Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) throw authError;
  
  // Register user in our backend
  if (authData.user) {
    try {
      await apiRequest('POST', '/api/users', {
        email,
        username,
        password: 'supabase-managed', // We don't store the actual password
        userId: authData.user.id,
      });
    } catch (error) {
      // If our backend registration fails, we should clean up the Supabase user
      console.error('Failed to register user in backend', error);
      // Ideally would delete the Supabase user here
      throw new Error('Failed to complete registration');
    }
  }
  
  return authData;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export function getAuthHeader() {
  const session = supabase.auth.getSession();
  return {
    'x-user-id': session ? session.data?.session?.user?.id : '',
  };
}
