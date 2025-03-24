import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

// Custom error for short code duplication
export class ShortCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShortCodeError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        
        // Special handling for shortcode error
        if (res.status === 400 && errorData.message === "Short code already in use") {
          throw new ShortCodeError("This custom path is already taken. Please choose another one.");
        }
        
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      } else {
        // Fallback to text
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (error) {
      // If it's already our custom error, rethrow it
      if (error instanceof ShortCodeError) {
        throw error;
      }
      
      // If parsing fails, use status text
      throw new Error(`${res.status}: ${res.statusText || 'Unknown error'}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get auth header if available
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  try {
    // Get user ID from Supabase if possible
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      headers['x-user-id'] = sessionData.session.user.id;
      console.log('Added auth header:', sessionData.session.user.id);
    } else {
      console.log('No auth session found for request');
    }
  } catch (error) {
    console.error('Failed to get auth header:', error);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Create headers with auth information
    const headers: Record<string, string> = {};
    
    try {
      // Get user ID from Supabase if possible
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        headers['x-user-id'] = sessionData.session.user.id;
        console.log('Added auth header for query:', sessionData.session.user.id);
      } else {
        console.log('No auth session found for query request');
      }
    } catch (error) {
      console.error('Failed to get auth header:', error);
    }

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
