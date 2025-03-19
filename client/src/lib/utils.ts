import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely navigate to a path with proper URL formatting to prevent double slashes
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
  // Create correctly formatted URL with no double slashes
  // First remove all leading slashes, then add a single one
  const cleanPath = path.replace(/^\/+/, '');
  const normalizedPath = '/' + cleanPath;
  
  // If force reload is requested or we are signing out, use window.location
  // This ensures a clean slate and avoids SPA navigation issues
  if (options.useWindowLocation || options.forceReload || path === '/login') {
    // For hard reloads, use the Location API to ensure a proper reload
    window.location.href = normalizedPath;
    return;
  }
  
  // For normal in-app navigation, directly use wouter's approach
  // Wouter listens to popstate events, so we need to trigger history changes
  try {
    // First update the browser URL (without causing a page reload)
    window.history.pushState(null, '', normalizedPath);
    
    // Then dispatch a popstate event for wouter to detect
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    
    // Log success for debugging
    console.log(`Navigation successful to: ${normalizedPath}`);
  } catch (error) {
    // Fallback to basic navigation if the History API fails
    console.error("Error during navigation:", error);
    window.location.href = normalizedPath;
  }
}
