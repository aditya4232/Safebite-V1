import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Watch, Smartphone, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useGuestMode } from '@/hooks/useGuestMode';
import LoginPrompt from './LoginPrompt';

// List of supported fitness platforms
const supportedPlatforms = [
  { 
    id: 'fitbit', 
    name: 'Fitbit', 
    icon: <Watch className="h-5 w-5" />,
    description: 'Import your activity, sleep, and heart rate data',
    apiKey: 'DEMO_KEY_FITBIT',
    color: 'bg-blue-500'
  },
  { 
    id: 'googlefit', 
    name: 'Google Fit', 
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Import your steps, workouts, and health metrics',
    apiKey: 'DEMO_KEY_GOOGLEFIT',
    color: 'bg-green-500'
  },
  { 
    id: 'applehealth', 
    name: 'Apple Health', 
    icon: <Watch className="h-5 w-5" />,
    description: 'Import your activity, nutrition, and vitals',
    apiKey: 'DEMO_KEY_APPLEHEALTH',
    color: 'bg-red-500'
  },
  { 
    id: 'samsung', 
    name: 'Samsung Health', 
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Import your exercise, sleep, and nutrition data',
    apiKey: 'DEMO_KEY_SAMSUNG',
    color: 'bg-purple-500'
  }
];

const FitnessImport = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [mergeData, setMergeData] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  
  const handleImport = () => {
    // If user is in guest mode, show login prompt
    if (isGuest) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Start import process
    setIsImporting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsImporting(false);
      setImportSuccess(true);
      
      toast({
        title: "Import Successful",
        description: `Data from ${supportedPlatforms.find(p => p.id === selectedPlatform)?.name} has been imported successfully.`,
        variant: "default",
      });
      
      // Reset success state after a delay
      setTimeout(() => {
        setImportSuccess(false);
      }, 3000);
    }, 2000);
  };
  
  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    // Set demo API key
    const platform = supportedPlatforms.find(p => p.id === platformId);
    if (platform) {
      setApiKey(platform.apiKey);
    }
  };
  
  return (
    <>
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-safebite-text flex items-center">
            <RefreshCw className="mr-2 h-5 w-5 text-safebite-teal" />
            Import Fitness Data
          </CardTitle>
          <CardDescription>
            Connect your fitness wearables and apps to import your health data
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="connect" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="connect">Connect Device</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connect" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportedPlatforms.map((platform) => (
                  <div 
                    key={platform.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPlatform === platform.id 
                        ? 'border-safebite-teal bg-safebite-teal/10' 
                        : 'border-safebite-card-bg-alt hover:border-safebite-teal/50'
                    }`}
                    onClick={() => handlePlatformSelect(platform.id)}
                  >
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full ${platform.color} flex items-center justify-center mr-3`}>
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-safebite-text">{platform.name}</h3>
                        <p className="text-xs text-safebite-text-secondary">{platform.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedPlatform && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input 
                      id="apiKey" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)} 
                      placeholder="Enter your API key" 
                      className="sci-fi-input"
                    />
                    <p className="text-xs text-safebite-text-secondary">
                      For demo purposes, we've pre-filled a demo API key. In a real app, you would need to obtain this from the platform.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="merge-data" 
                      checked={mergeData} 
                      onCheckedChange={setMergeData} 
                    />
                    <Label htmlFor="merge-data">Merge with existing data</Label>
                  </div>
                  
                  <div className="bg-safebite-card-bg-alt p-3 rounded-md">
                    <p className="text-sm text-safebite-text-secondary">
                      {mergeData 
                        ? "Your imported data will be combined with your existing SafeBite data." 
                        : "Your imported data will replace your existing SafeBite data."}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="border-2 border-dashed border-safebite-card-bg-alt rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-safebite-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-safebite-text mb-2">Upload Fitness Data File</h3>
                <p className="text-safebite-text-secondary mb-4">
                  Drag and drop your fitness data export file here, or click to browse
                </p>
                <Button variant="outline" className="sci-fi-button">
                  Browse Files
                </Button>
                <p className="text-xs text-safebite-text-secondary mt-4">
                  Supported formats: .csv, .json, .xml, .fit
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={!selectedPlatform || isImporting || importSuccess}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : importSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Imported
              </>
            ) : (
              'Import Data'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Login prompt modal */}
      <LoginPrompt 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
        feature="import fitness data"
      />
    </>
  );
};

export default FitnessImport;
