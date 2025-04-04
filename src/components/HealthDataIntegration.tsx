import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Activity, 
  Heart, 
  Watch, 
  Smartphone, 
  Footprints, 
  Dumbbell, 
  Moon, 
  Zap,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HealthDataIntegrationProps {
  onIntegrationToggle: (integration: string, enabled: boolean) => Promise<void>;
  integrations: {
    [key: string]: boolean;
  };
}

const HealthDataIntegration: React.FC<HealthDataIntegrationProps> = ({ 
  onIntegrationToggle,
  integrations = {}
}) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  
  const handleConnect = async (integration: string) => {
    setIsConnecting(integration);
    
    try {
      // This would normally connect to the actual API
      // For now, we'll just simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      await onIntegrationToggle(integration, true);
      
      // Show success message
      console.log(`Successfully connected to ${integration}`);
    } catch (error) {
      console.error(`Error connecting to ${integration}:`, error);
    } finally {
      setIsConnecting(null);
    }
  };
  
  const handleDisconnect = async (integration: string) => {
    try {
      await onIntegrationToggle(integration, false);
      console.log(`Disconnected from ${integration}`);
    } catch (error) {
      console.error(`Error disconnecting from ${integration}:`, error);
    }
  };
  
  const integrationOptions = [
    {
      id: 'google_fit',
      name: 'Google Fit',
      icon: <Activity className="h-5 w-5 text-green-500" />,
      description: 'Import steps, activity, and workout data from Google Fit',
      dataPoints: ['Steps', 'Activity', 'Workouts', 'Heart Rate'],
      apiUrl: 'https://developers.google.com/fit/rest/v1/get-started',
      free: true
    },
    {
      id: 'apple_health',
      name: 'Apple Health',
      icon: <Heart className="h-5 w-5 text-red-500" />,
      description: 'Import health data from Apple Health',
      dataPoints: ['Steps', 'Activity', 'Workouts', 'Heart Rate', 'Sleep'],
      apiUrl: 'https://developer.apple.com/documentation/healthkit',
      free: true
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: <Watch className="h-5 w-5 text-blue-500" />,
      description: 'Import activity and sleep data from Fitbit',
      dataPoints: ['Steps', 'Activity', 'Sleep', 'Heart Rate'],
      apiUrl: 'https://dev.fitbit.com/build/reference/web-api/',
      free: true
    },
    {
      id: 'samsung_health',
      name: 'Samsung Health',
      icon: <Smartphone className="h-5 w-5 text-blue-400" />,
      description: 'Import health data from Samsung Health',
      dataPoints: ['Steps', 'Activity', 'Sleep', 'Heart Rate'],
      apiUrl: 'https://developer.samsung.com/health/android/overview.html',
      free: true
    },
    {
      id: 'strava',
      name: 'Strava',
      icon: <Footprints className="h-5 w-5 text-orange-500" />,
      description: 'Import running and cycling data from Strava',
      dataPoints: ['Runs', 'Rides', 'Workouts'],
      apiUrl: 'https://developers.strava.com/',
      free: true
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      icon: <Watch className="h-5 w-5 text-purple-500" />,
      description: 'Import activity data from Garmin devices',
      dataPoints: ['Steps', 'Activity', 'Sleep', 'Heart Rate'],
      apiUrl: 'https://developer.garmin.com/gc-developer-program/overview/',
      free: true
    },
    {
      id: 'myfitnesspal',
      name: 'MyFitnessPal',
      icon: <Dumbbell className="h-5 w-5 text-blue-600" />,
      description: 'Import nutrition and exercise data from MyFitnessPal',
      dataPoints: ['Nutrition', 'Calories', 'Exercise'],
      apiUrl: 'https://www.myfitnesspal.com/api',
      free: true
    },
    {
      id: 'oura',
      name: 'Oura Ring',
      icon: <Moon className="h-5 w-5 text-gray-400" />,
      description: 'Import sleep and recovery data from Oura Ring',
      dataPoints: ['Sleep', 'Readiness', 'Activity'],
      apiUrl: 'https://cloud.ouraring.com/docs/',
      free: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-safebite-text">Health Data Integrations</h3>
        <Badge variant="outline" className="bg-safebite-teal/10 text-safebite-teal">
          Beta Feature
        </Badge>
      </div>
      
      <p className="text-safebite-text-secondary">
        Connect SafeBite with your favorite health apps and wearables to import your health data and get more personalized recommendations.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrationOptions.map((integration) => (
          <div 
            key={integration.id} 
            className="sci-fi-card relative overflow-hidden"
          >
            {integrations[integration.id] && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  <Check className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              </div>
            )}
            
            <div className="flex items-start">
              <div className="mr-4 p-2 bg-safebite-card-bg-alt rounded-md">
                {integration.icon}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center">
                  <h4 className="text-lg font-medium text-safebite-text">{integration.name}</h4>
                  {integration.free && (
                    <Badge variant="outline" className="ml-2 text-xs bg-safebite-card-bg-alt text-safebite-text-secondary">
                      Free API
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-safebite-text-secondary mb-2">
                  {integration.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {integration.dataPoints.map((dataPoint) => (
                    <Badge 
                      key={dataPoint} 
                      variant="outline" 
                      className="text-xs bg-safebite-card-bg-alt text-safebite-text-secondary"
                    >
                      {dataPoint}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Switch
                      checked={!!integrations[integration.id]}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleConnect(integration.id);
                        } else {
                          handleDisconnect(integration.id);
                        }
                      }}
                      disabled={isConnecting === integration.id}
                      className="mr-2"
                    />
                    <span className="text-sm text-safebite-text-secondary">
                      {integrations[integration.id] ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => window.open(integration.apiUrl, '_blank')}
                        >
                          API Docs
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View API documentation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            
            {isConnecting === integration.id && (
              <div className="absolute inset-0 bg-safebite-dark-blue/80 flex items-center justify-center">
                <div className="text-center">
                  <Zap className="h-8 w-8 text-safebite-teal animate-pulse mx-auto mb-2" />
                  <p className="text-safebite-text">Connecting to {integration.name}...</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-safebite-card-bg-alt p-4 rounded-lg border border-safebite-card-bg flex items-start">
        <AlertCircle className="h-5 w-5 text-safebite-teal mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-safebite-text-secondary">
            <span className="font-medium text-safebite-text">Note:</span> These integrations are currently in beta. 
            To use them, you'll need to set up API keys for each service. The data will be integrated into your dashboard 
            to provide more personalized nutrition recommendations based on your activity levels, sleep patterns, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthDataIntegration;
