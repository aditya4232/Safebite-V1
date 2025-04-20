import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  placeholderClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  placeholderClassName = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      } else {
        // Create a fallback image with the first letter of the alt text
        const firstLetter = alt.charAt(0).toUpperCase();
        setImageSrc(`https://via.placeholder.com/400x300?text=${encodeURIComponent(firstLetter)}`);
      }
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc, alt]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-safebite-card-bg-alt/50 ${placeholderClassName || className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-safebite-teal/50" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc || ''}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

export default LazyImage;
