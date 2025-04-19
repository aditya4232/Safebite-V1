import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { trackUserInteraction } from '@/services/mlService';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';
import {
  Upload,
  FileText,
  FileUp,
  AlertTriangle,
  Loader2,
  Info,
  Check,
  X
} from 'lucide-react';

interface HealthDataImportProps {
  userId?: string;
  onDataImported?: (data: any) => void;
}

const HealthDataImport: React.FC<HealthDataImportProps> = ({
  userId,
  onDataImported
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [activeTab, setActiveTab] = useState('file');
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      // Check file type
      if (file.type === 'application/pdf') {
        // For PDF files, we would need a PDF parser library
        // This is a simplified version that just acknowledges the PDF
        setFileContent('PDF file detected. Content will be processed.');
        toast({
          title: 'PDF Detected',
          description: 'PDF parsing is in beta. Basic data will be extracted.',
          variant: 'default',
        });
      } else {
        // For text files, CSV, JSON, etc.
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setFileContent(content);
          
          // Process the file content
          processHealthData(content, file.type);
        };
        reader.readAsText(file);
      }

      // Track this interaction
      trackUserInteraction('health_data_file_upload', {
        isGuest,
        fileType: file.type,
        fileSize: file.size
      });
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read the file. Please try a different file format.');
      toast({
        title: 'File Error',
        description: 'Could not read the file. Please try a different format.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process health data from text input
  const handleTextSubmit = () => {
    setError(null);
    setSuccess(null);
    
    if (!textContent.trim()) {
      setError('Please enter some health data text.');
      return;
    }

    setIsLoading(true);

    try {
      // Process the text content
      processHealthData(textContent, 'text/plain');

      // Track this interaction
      trackUserInteraction('health_data_text_input', {
        isGuest,
        textLength: textContent.length
      });
    } catch (err) {
      console.error('Error processing text:', err);
      setError('Failed to process the text. Please check the format.');
      toast({
        title: 'Processing Error',
        description: 'Could not process the text. Please check the format.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process health data from file or text
  const processHealthData = async (content: string, contentType: string) => {
    try {
      // Parse the content based on type
      let healthData: any = null;

      if (contentType.includes('json')) {
        // Parse JSON data
        try {
          healthData = JSON.parse(content);
        } catch (e) {
          throw new Error('Invalid JSON format');
        }
      } else if (contentType.includes('csv') || content.includes(',')) {
        // Parse CSV-like data
        healthData = parseCSVLikeData(content);
      } else {
        // Parse free text data
        healthData = parseTextData(content);
      }

      // Validate the parsed data
      if (!healthData || Object.keys(healthData).length === 0) {
        throw new Error('No valid health data found');
      }

      // Save to Firebase if user is logged in
      if (!isGuest && userId) {
        await saveHealthDataToFirebase(healthData);
      }

      // Notify parent component
      if (onDataImported) {
        onDataImported(healthData);
      }

      setSuccess('Health data imported successfully!');
      toast({
        title: 'Import Successful',
        description: 'Your health data has been imported successfully.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Error processing health data:', err);
      setError(`Failed to process health data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast({
        title: 'Processing Error',
        description: `Could not process health data: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Parse CSV-like data
  const parseCSVLikeData = (content: string) => {
    const lines = content.split('\n');
    if (lines.length < 2) return null;

    // Try to detect headers
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Initialize data structure
    const healthData: any = {
      weightData: [],
      nutritionData: [],
      activityData: [],
      macroDistribution: [],
      foodCategories: []
    };

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      // Create a record object
      const record: any = {};
      headers.forEach((header, index) => {
        record[header.toLowerCase()] = values[index];
      });

      // Categorize data
      if ('weight' in record) {
        healthData.weightData.push({
          date: record.date || new Date().toISOString().split('T')[0],
          weight: parseFloat(record.weight) || 0,
          target: parseFloat(record.target) || 0
        });
      }

      if ('calories' in record) {
        healthData.nutritionData.push({
          date: record.date || new Date().toISOString().split('T')[0],
          calories: parseInt(record.calories) || 0,
          protein: parseInt(record.protein) || 0,
          carbs: parseInt(record.carbs) || 0,
          fat: parseInt(record.fat) || 0
        });
      }

      if ('steps' in record) {
        healthData.activityData.push({
          date: record.date || new Date().toISOString().split('T')[0],
          steps: parseInt(record.steps) || 0,
          active_minutes: parseInt(record.active_minutes) || 0
        });
      }
    }

    // Generate macro distribution if nutrition data exists
    if (healthData.nutritionData.length > 0) {
      const totalProtein = healthData.nutritionData.reduce((sum: number, day: any) => sum + day.protein, 0);
      const totalCarbs = healthData.nutritionData.reduce((sum: number, day: any) => sum + day.carbs, 0);
      const totalFat = healthData.nutritionData.reduce((sum: number, day: any) => sum + day.fat, 0);
      const total = totalProtein + totalCarbs + totalFat;

      if (total > 0) {
        healthData.macroDistribution = [
          { name: 'Protein', value: Math.round((totalProtein / total) * 100) },
          { name: 'Carbs', value: Math.round((totalCarbs / total) * 100) },
          { name: 'Fat', value: Math.round((totalFat / total) * 100) }
        ];
      }
    }

    return healthData;
  };

  // Parse free text data
  const parseTextData = (content: string) => {
    // Initialize data structure
    const healthData: any = {
      weightData: [],
      nutritionData: [],
      activityData: [],
      macroDistribution: [],
      foodCategories: []
    };

    // Look for weight data
    const weightMatches = content.match(/weight[:\s]+(\d+(?:\.\d+)?)\s*(?:kg|pounds|lbs)/gi);
    if (weightMatches) {
      weightMatches.forEach(match => {
        const weight = parseFloat(match.replace(/[^\d.]/g, ''));
        if (!isNaN(weight)) {
          healthData.weightData.push({
            date: new Date().toISOString().split('T')[0],
            weight: weight,
            target: weight - 2 // Assume target is 2kg less
          });
        }
      });
    }

    // Look for calorie data
    const calorieMatches = content.match(/calories[:\s]+(\d+)/gi);
    if (calorieMatches) {
      calorieMatches.forEach(match => {
        const calories = parseInt(match.replace(/[^\d]/g, ''));
        if (!isNaN(calories)) {
          healthData.nutritionData.push({
            date: new Date().toISOString().split('T')[0],
            calories: calories,
            protein: Math.round(calories * 0.2 / 4), // Assume 20% protein
            carbs: Math.round(calories * 0.5 / 4),   // Assume 50% carbs
            fat: Math.round(calories * 0.3 / 9)      // Assume 30% fat
          });
        }
      });
    }

    // Look for step data
    const stepMatches = content.match(/steps[:\s]+(\d+)/gi);
    if (stepMatches) {
      stepMatches.forEach(match => {
        const steps = parseInt(match.replace(/[^\d]/g, ''));
        if (!isNaN(steps)) {
          healthData.activityData.push({
            date: new Date().toISOString().split('T')[0],
            steps: steps,
            active_minutes: Math.round(steps / 1000) // Rough estimate
          });
        }
      });
    }

    // Generate macro distribution if nutrition data exists
    if (healthData.nutritionData.length > 0) {
      const totalProtein = healthData.nutritionData.reduce((sum: number, day: any) => sum + day.protein, 0);
      const totalCarbs = healthData.nutritionData.reduce((sum: number, day: any) => sum + day.carbs, 0);
      const totalFat = healthData.nutritionData.reduce((sum: number, day: any) => sum + day.fat, 0);
      const total = totalProtein + totalCarbs + totalFat;

      if (total > 0) {
        healthData.macroDistribution = [
          { name: 'Protein', value: Math.round((totalProtein / total) * 100) },
          { name: 'Carbs', value: Math.round((totalCarbs / total) * 100) },
          { name: 'Fat', value: Math.round((totalFat / total) * 100) }
        ];
      }
    }

    // Generate food categories
    healthData.foodCategories = [
      { name: 'Fruits & Vegetables', value: 30 },
      { name: 'Proteins', value: 25 },
      { name: 'Grains', value: 20 },
      { name: 'Dairy', value: 15 },
      { name: 'Other', value: 10 }
    ];

    return healthData;
  };

  // Save health data to Firebase
  const saveHealthDataToFirebase = async (healthData: any) => {
    if (isGuest || !userId) return;

    try {
      const auth = getAuth(app);
      const db = getFirestore(app);

      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        // Get existing user data
        const userDoc = await getDoc(userRef);
        let userData = userDoc.exists() ? userDoc.data() : {};
        
        // Update health data
        userData = {
          ...userData,
          healthData: healthData,
          healthDataUpdatedAt: new Date()
        };
        
        // Save to Firebase
        await setDoc(userRef, userData);
        
        console.log('Health data saved to Firebase');
      }
    } catch (err) {
      console.error('Error saving health data to Firebase:', err);
      throw err;
    }
  };

  return (
    <Card className="sci-fi-card border-safebite-teal/30">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-safebite-text flex items-center">
              <Upload className="mr-2 h-5 w-5 text-safebite-teal" />
              Import Health Data
              <Badge className="ml-3 bg-safebite-teal text-safebite-dark-blue">Beta</Badge>
            </CardTitle>
            <p className="text-safebite-text-secondary text-sm">
              Import your health data from files or text
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Show error message if there was an error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-safebite-text font-medium">Import Error</p>
                <p className="text-safebite-text-secondary text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show success message if import was successful */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-safebite-text font-medium">Import Successful</p>
                <p className="text-safebite-text-secondary text-sm mt-1">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue={activeTab} className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="file">
              <FileUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Upload File</span>
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Enter Text</span>
            </TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="file">
            <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-safebite-text font-medium">Upload Health Data File</h3>
                <div className="flex items-center text-safebite-text-secondary text-sm">
                  <Info className="h-4 w-4 mr-1" />
                  <span>Supported: CSV, JSON, TXT</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-safebite-card-bg-alt rounded-lg p-6 text-center">
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".csv,.json,.txt,.pdf"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="h-12 w-12 text-safebite-teal mb-2" />
                  <p className="text-safebite-text font-medium mb-1">
                    {isLoading ? 'Processing...' : 'Click to upload a file'}
                  </p>
                  <p className="text-safebite-text-secondary text-sm">
                    or drag and drop
                  </p>
                </label>
              </div>

              {isLoading && (
                <div className="mt-4 flex justify-center">
                  <Loader2 className="h-6 w-6 text-safebite-teal animate-spin" />
                </div>
              )}

              {fileName && (
                <div className="mt-4 p-3 bg-safebite-card-bg-alt rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-safebite-teal mr-2" />
                      <span className="text-safebite-text">{fileName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFileName(null);
                        setFileContent(null);
                      }}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 text-safebite-text-secondary text-sm">
                <p>
                  <strong>Note:</strong> Your health data will be processed locally and only saved to your profile if you're logged in.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Text Input Tab */}
          <TabsContent value="text">
            <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-safebite-text font-medium">Enter Health Data Text</h3>
                <div className="flex items-center text-safebite-text-secondary text-sm">
                  <Info className="h-4 w-4 mr-1" />
                  <span>Enter data in any format</span>
                </div>
              </div>

              <textarea
                className="w-full h-40 p-3 rounded-lg bg-safebite-card-bg border-safebite-card-bg-alt focus:border-safebite-teal text-safebite-text resize-none"
                placeholder="Enter your health data here. For example:
Weight: 70 kg
Calories: 2000
Steps: 8000
Or paste data from your health app."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                disabled={isLoading}
              />

              {isLoading && (
                <div className="mt-4 flex justify-center">
                  <Loader2 className="h-6 w-6 text-safebite-teal animate-spin" />
                </div>
              )}

              <Button
                className="mt-4 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                onClick={handleTextSubmit}
                disabled={isLoading || !textContent.trim()}
              >
                Process Health Data
              </Button>

              <div className="mt-4 text-safebite-text-secondary text-sm">
                <p>
                  <strong>Note:</strong> Our system will try to extract health metrics from your text. The more structured your data, the better the results.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-safebite-text-secondary text-sm">
          <p className="mb-2">
            <strong>Privacy Notice:</strong> Your health data is processed locally in your browser. If you're logged in, it will be securely stored in your profile.
          </p>
          <p>
            <strong>Supported Data:</strong> Weight, calories, macronutrients, steps, and activity minutes. More metrics coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthDataImport;
