import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Camera, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import { getNutritionFromImage } from '@/utils/calorieNinjasApi';
import { trackUserInteraction } from '@/services/mlService';

interface ImageNutritionAnalysisProps {
  isGuest?: boolean;
}

interface NutritionItem {
  name: string;
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  fat_saturated_g: number;
  protein_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  carbohydrates_total_g: number;
  fiber_g: number;
  sugar_g: number;
}

const ImageNutritionAnalysis = ({ isGuest = false }: ImageNutritionAnalysisProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, etc.).',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setNutritionData(null);
    setError(null);
  };
  
  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: 'No image selected',
        description: 'Please select an image to analyze.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Track this interaction
      trackUserInteraction('image_nutrition_analysis', { 
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        isGuest 
      });
      
      const result = await getNutritionFromImage(selectedFile);
      
      if (result && result.items && Array.isArray(result.items)) {
        setNutritionData(result.items);
        
        if (result.items.length === 0) {
          toast({
            title: 'No nutrition data found',
            description: 'No food items were detected in the image. Try a clearer image of food or food packaging.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Analysis complete',
            description: `Found nutrition data for ${result.items.length} food items.`,
            variant: 'default',
          });
        }
      } else {
        setNutritionData(null);
        setError('Invalid response from nutrition API');
        toast({
          title: 'Analysis error',
          description: 'Received invalid data from the nutrition API.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Image analysis error:', error);
      setNutritionData(null);
      setError(error.message || 'Failed to analyze image');
      toast({
        title: 'Analysis failed',
        description: error.message || 'An error occurred while analyzing the image.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setNutritionData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="mr-2 h-5 w-5 text-safebite-teal" />
          Image Nutrition Analysis
        </CardTitle>
        <CardDescription>
          Upload an image of food or packaging to get nutrition information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* File Upload Area */}
        {!previewUrl ? (
          <div 
            className="border-2 border-dashed border-safebite-card-bg-alt rounded-lg p-8 text-center cursor-pointer hover:border-safebite-teal/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-safebite-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-safebite-text mb-2">Upload Food Image</h3>
            <p className="text-safebite-text-secondary mb-4">
              Drag and drop an image here, or click to browse
            </p>
            <Button variant="outline" className="sci-fi-button">
              <ImageIcon className="mr-2 h-4 w-4" />
              Browse Images
            </Button>
            <p className="text-xs text-safebite-text-secondary mt-4">
              Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={previewUrl}
                alt="Food preview"
                className="w-full h-auto max-h-64 object-contain rounded-lg"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-safebite-dark-blue/80 hover:bg-safebite-dark-blue"
                onClick={handleReset}
              >
                Change Image
              </Button>
            </div>
            
            {/* Analysis Button */}
            <div className="flex justify-center">
              <Button
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Nutrition
                  </>
                )}
              </Button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            )}
            
            {/* Nutrition Results */}
            {nutritionData && nutritionData.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-safebite-text">Nutrition Information</h3>
                
                <div className="space-y-3">
                  {nutritionData.map((item, index) => (
                    <div 
                      key={index}
                      className="p-3 border border-safebite-card-bg-alt rounded-md hover:border-safebite-teal/50 transition-colors"
                    >
                      <h4 className="font-medium text-safebite-text mb-2">{item.name}</h4>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Calories</p>
                          <p className="text-sm font-medium text-safebite-text">{item.calories}</p>
                        </div>
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Protein</p>
                          <p className="text-sm font-medium text-safebite-text">{item.protein_g}g</p>
                        </div>
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Carbs</p>
                          <p className="text-sm font-medium text-safebite-text">{item.carbohydrates_total_g}g</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Fat</p>
                          <p className="text-sm font-medium text-safebite-text">{item.fat_total_g}g</p>
                        </div>
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Sugar</p>
                          <p className="text-sm font-medium text-safebite-text">{item.sugar_g}g</p>
                        </div>
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Fiber</p>
                          <p className="text-sm font-medium text-safebite-text">{item.fiber_g}g</p>
                        </div>
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Sodium</p>
                          <p className="text-sm font-medium text-safebite-text">{item.sodium_mg}mg</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-safebite-text-secondary mt-2">
                        Serving size: {item.serving_size_g}g
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-safebite-text-secondary">
          Powered by CalorieNinjas API
        </div>
      </CardFooter>
    </Card>
  );
};

export default ImageNutritionAnalysis;
