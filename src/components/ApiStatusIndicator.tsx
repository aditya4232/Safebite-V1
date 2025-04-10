import React from 'react';

interface ApiStatusIndicatorProps {
  isAvailable: boolean;
}

const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ isAvailable }) => {
  return (
    <div className="flex items-center">
      <div className={`h-2 w-2 rounded-full mr-2 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-xs text-safebite-text-secondary">
        API {isAvailable ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default ApiStatusIndicator;
