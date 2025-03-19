import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Simple navigation helper that works with wouter
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
  // Just use the browser's History API directly if not forced reload
  if (!options.useWindowLocation && !options.forceReload) {
    try {
      // This is how wouter detects navigation
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    } catch (error) {
      console.error("Error during navigation:", error);
    }
  }
  
  // Fallback to direct navigation
  window.location.href = path;
}
