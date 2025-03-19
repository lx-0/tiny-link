import React from 'react';
import { Link } from 'wouter';

/**
 * A wrapper around wouter's Link component that normalizes URLs
 * to prevent issues with double slashes and invalid hrefs
 */
function NormalizedLink({ 
  href = '/', 
  children, 
  className, 
  // We don't use asChild but accept it to avoid prop warnings
  asChild, 
  ...props 
}: { 
  href?: string;
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  // Strip off any domain/protocol if present to handle cases where the full URL is passed
  let pathToNormalize = href;
  
  // Check if the href contains a protocol (http:// or https://) or domain
  if (href.includes('://') || href.includes('.replit.dev/')) {
    try {
      // Try to parse as URL and extract just the pathname
      const url = new URL(href.includes('://') ? href : `https://${href}`);
      pathToNormalize = url.pathname;
    } catch (e) {
      // If URL parsing fails, try to extract pathname using regex
      const pathMatch = href.match(/\.replit\.dev(\/[^?#]*)/);
      if (pathMatch && pathMatch[1]) {
        pathToNormalize = pathMatch[1];
      }
    }
  }
  
  // Properly normalize href to prevent invalid URL errors:
  // 1. Remove all leading slashes
  // 2. Add a single leading slash
  const cleanPath = pathToNormalize.replace(/^\/+/, '');
  const normalizedHref = '/' + cleanPath;
  
  // Create a simple <a> tag instead of using Link if asChild is true
  // This works around some of the Link component limitations
  if (asChild) {
    return (
      <a href={normalizedHref} className={className} {...props}>
        {children}
      </a>
    );
  }
  
  // Otherwise use Link for SPA navigation
  return (
    <Link href={normalizedHref} className={className}>
      {children}
    </Link>
  );
}

export default NormalizedLink;