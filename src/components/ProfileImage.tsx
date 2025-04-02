import React from 'react';

interface ProfileImageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  size = 'md',
  className = ''
}) => {
  // Define size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className} aspect-square`}>
      {/* Animated glowing background effect */}
      <div className="absolute inset-0 rounded-full bg-safebite-teal/30 blur-md animate-pulse"></div>

      {/* Outer tech ring */}
      <div className="absolute inset-0 rounded-full border-2 border-safebite-teal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-safebite-teal/20 to-transparent animate-spin-slow"></div>
      </div>

      {/* Middle tech ring with circuit pattern */}
      <div className="absolute inset-0 rounded-full z-20 pointer-events-none">
        <svg
          className="w-full h-full animate-spin-very-slow"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="48" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="0.5" strokeDasharray="8 4" />
          <path
            d="M50 2 L50 10 M2 50 L10 50 M50 90 L50 98 M90 50 L98 50"
            stroke="rgba(20, 184, 166, 0.6)"
            strokeWidth="0.5"
          />
          <circle cx="50" cy="10" r="1" fill="rgba(20, 184, 166, 0.8)" />
          <circle cx="10" cy="50" r="1" fill="rgba(20, 184, 166, 0.8)" />
          <circle cx="50" cy="90" r="1" fill="rgba(20, 184, 166, 0.8)" />
          <circle cx="90" cy="50" r="1" fill="rgba(20, 184, 166, 0.8)" />
        </svg>
      </div>

      {/* Inner tech ring with circuit pattern */}
      <div className="absolute inset-0 rounded-full z-20 pointer-events-none">
        <svg
          className="w-full h-full animate-spin-slow-reverse"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="40" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="0.5" strokeDasharray="6 2" />
          <path
            d="M50 15 L50 20 M15 50 L20 50 M50 80 L50 85 M80 50 L85 50"
            stroke="rgba(20, 184, 166, 0.4)"
            strokeWidth="0.5"
          />
          <circle cx="50" cy="20" r="0.5" fill="rgba(20, 184, 166, 0.6)" />
          <circle cx="20" cy="50" r="0.5" fill="rgba(20, 184, 166, 0.6)" />
          <circle cx="50" cy="80" r="0.5" fill="rgba(20, 184, 166, 0.6)" />
          <circle cx="80" cy="50" r="0.5" fill="rgba(20, 184, 166, 0.6)" />
        </svg>
      </div>

      {/* Circular cutout with image */}
      <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-safebite-teal/50 z-10 shadow-[0_0_10px_rgba(20,184,166,0.5)]">
        <div className="relative w-full h-full">
          {/* This div maintains aspect ratio and centers the image */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <img
              src="/SafeBite-V1/ProfilePic-AdityaShenvi.jpg"
              alt="Aditya Shenvi"
              className="w-[150%] h-[150%] object-cover"
              style={{ objectPosition: 'center 25%' }} /* Adjust vertical position to focus on face */
            />
          </div>
          {/* Overlay glow effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-safebite-teal/10 to-transparent"></div>
        </div>
      </div>

      {/* Tech dots at cardinal points */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-safebite-teal rounded-full z-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-safebite-teal rounded-full z-30 animate-pulse"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-safebite-teal rounded-full z-30 animate-pulse"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-safebite-teal rounded-full z-30 animate-pulse"></div>
    </div>
  );
};

export default ProfileImage;
