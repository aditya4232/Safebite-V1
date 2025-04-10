import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, ExternalLink } from 'lucide-react';
import { checkApiStatus, API_BASE_URL } from '@/utils/apiUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompactApiStatusProps {
  className?: string;
  onStatusChange?: (isAvailable: boolean) => void;
}

const CompactApiStatus = ({ className = '', onStatusChange }: CompactApiStatusProps) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await checkApiStatus();
      setIsAvailable(status);
      setLastChecked(new Date());
      
      if (onStatusChange) {
        onStatusChange(status);
      }
      
      toast({
        title: status ? 'API is online' : 'API is offline',
        description: status 
          ? 'Connected to the SafeBite backend API' 
          : 'Using fallback data instead of live API',
        variant: status ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      setIsAvailable(false);
      if (onStatusChange) {
        onStatusChange(false);
      }
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    checkStatus();
    
    // Check status every 5 minutes
    const interval = setInterval(() => {
      checkStatus();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <div 
                className={`h-2 w-2 rounded-full ${
                  isAvailable === null 
                    ? 'bg-gray-400 animate-pulse' 
                    : isAvailable 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                }`}
              />
              <span className="ml-1 text-xs text-safebite-text-secondary">
                API {isAvailable === null ? '...' : isAvailable ? 'Live' : 'Offline'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs">
              <p className="font-medium">API Status: {isAvailable ? 'Online' : 'Offline'}</p>
              {lastChecked && (
                <p className="text-safebite-text-secondary">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={checkStatus}
        disabled={isChecking}
      >
        <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        asChild
      >
        <a 
          href={`${API_BASE_URL}/status`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  );
};

export default CompactApiStatus;
