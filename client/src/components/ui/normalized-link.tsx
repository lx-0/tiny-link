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
  // Ensure href starts with a single slash and doesn't have double slashes
  const normalizedHref = '/' + href.replace(/^\/+/, '');
  
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