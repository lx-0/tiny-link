import React from 'react';
import { Link } from 'wouter';

/**
 * A simple wrapper around wouter's Link component that also scrolls to top on navigation
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
  // Handle scroll to top for internal navigation
  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  // Just a standard anchor tag if asChild is true
  if (asChild) {
    return (
      <a 
        href={href} 
        className={className}
        onClick={handleClick} 
        {...props}
      >
        {children}
      </a>
    );
  }
  
  // Standard wouter Link component for navigation with scroll-to-top
  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

export default NormalizedLink;