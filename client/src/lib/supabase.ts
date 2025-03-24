import { createClient } from '@supabase/supabase-js';
import { apiRequest } from './queryClient';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Get current app URL for redirects
const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

// Create client with app-specific settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
  }
});

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
  // Sign up with Supabase - with redirect URL for this specific app
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`
    }
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
  // First, clear any local storage items that might interfere with navigation
  try {
    localStorage.removeItem('redirectUrl');
    localStorage.removeItem('supabase.auth.token');
    
    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // For a clean state, we will clear session cookies and storage
    // This helps avoid stale auth state causing URL formatting issues
    sessionStorage.clear();
  } catch (error) {
    console.error("Error during sign out:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      // Log the auth state to help with debugging
      console.log('Auth state: User authenticated', { id: data.user.id });
      return data.user;
    } else {
      console.log('Auth state: No authenticated user');
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// This function is no longer needed as we handle auth headers directly in API requests
