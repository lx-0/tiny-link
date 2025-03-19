import React from 'react';
import { Link } from 'wouter';

/**
 * A simple wrapper around wouter's Link component
 */
function NormalizedLink({ 
  href = '/', 
  children, 
  className, 
  asChild = false, 
  ...props 
}: { 
  href?: string;
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  // Just a standard anchor tag if asChild is true
  if (asChild) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  }
  
  // Standard wouter Link component for navigation
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default NormalizedLink;