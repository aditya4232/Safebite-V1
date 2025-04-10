import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Info, RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { checkApiStatus, API_BASE_URL, BACKUP_API_URL } from '@/utils/apiUtils';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';

interface ApiStatusProps {
  onStatusChange?: (isAvailable: boolean, activeUrl: string) => void;
  className?: string;
}

const ApiStatus = ({ onStatusChange, className = '' }: ApiStatusProps) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>(API_BASE_URL);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const { isAvailable, activeUrl: url } = await checkApiStatus();
      setIsAvailable(isAvailable);
      setActiveUrl(url);
      setLastChecked(new Date());

      if (onStatusChange) {
        onStatusChange(isAvailable, url);
      }

      toast({
        title: isAvailable ? 'API is online' : 'API is offline',
        description: isAvailable
          ? `Connected to the SafeBite API (${url === API_BASE_URL ? 'Primary' : 'Backup'})`
          : 'Unable to connect to any API server',
        variant: isAvailable ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      setIsAvailable(false);
      if (onStatusChange) {
        onStatusChange(false, API_BASE_URL);
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
    <Card className={`sci-fi-card ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-safebite-text-secondary mr-2" />
            <span className="text-sm font-medium text-safebite-text">API Status</span>
          </div>

          <div className="flex items-center">
            {isAvailable === null ? (
              <span className="text-xs text-safebite-text-secondary">Checking...</span>
            ) : (
              <ApiStatusIndicator isAvailable={isAvailable} />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-safebite-text-secondary">
            {lastChecked && (
              <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={checkStatus}
              disabled={isChecking}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              asChild
            >
              <a
                href={`${activeUrl}/status`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatus;
