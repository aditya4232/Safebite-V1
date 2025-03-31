
import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loader = ({ size = 'md', text, className = '' }: LoaderProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-t-transparent border-safebite-teal ${sizeClasses[size]}`}
        aria-label="Loading"
      />
      {text && <p className="mt-3 text-safebite-text-secondary">{text}</p>}
    </div>
  );
};

export default Loader;
