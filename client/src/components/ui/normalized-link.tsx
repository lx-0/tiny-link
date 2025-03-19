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
  ...props 
}: { 
  href?: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'to' | 'className'>) {
  // Ensure href starts with a single slash and doesn't have double slashes
  const normalizedHref = '/' + href.replace(/^\/+/, '');
  
  return (
    <Link href={normalizedHref} className={className} {...props}>
      {children}
    </Link>
  );
}

export default NormalizedLink;