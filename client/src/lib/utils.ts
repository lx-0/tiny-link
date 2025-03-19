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
  
  // For normal in-app navigation, we need to use history API
  // as wouter's useLocation hook can only be used inside components
  try {
    // Use the History API to update the URL without a full page reload
    window.history.pushState({}, '', normalizedPath);
    
    // Dispatch a custom event that components can listen for to update their state
    window.dispatchEvent(new CustomEvent('locationchange', { 
      detail: { path: normalizedPath }
    }));
  } catch (error) {
    // Fallback to basic navigation if the History API fails
    console.error("Error during navigation:", error);
    window.location.href = normalizedPath;
  }
}
