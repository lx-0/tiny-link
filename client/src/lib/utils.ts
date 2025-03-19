import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely navigate to a path with proper URL formatting
 * @param path The path to navigate to
 * @param options Optional configuration
 */
export function safeNavigate(
  path: string, 
  options: { 
    useWindowLocation?: boolean; 
    forceReload?: boolean;
  } = {}
) {
  // Normalize the path to prevent double slashes
  const normalizedPath = '/' + path.replace(/^\/+/, '');
  
  // If force reload is requested or we are signing out, use window.location
  // This ensures a clean slate and avoids SPA navigation issues
  if (options.useWindowLocation || options.forceReload || path === '/login') {
    window.location.href = normalizedPath;
    return;
  }
  
  // For normal navigation within the app, we could use the setLocation function
  // from wouter, but this is typically handled by the NormalizedLink component
}
