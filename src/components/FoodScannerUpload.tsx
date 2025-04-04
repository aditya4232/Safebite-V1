import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Smartphone, Laptop } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FoodScannerUploadProps {
  onScan: (imageData: string) => void;
  onUpload: (file: File) => void;
  onClose: () => void;
}

const FoodScannerUpload: React.FC<FoodScannerUploadProps> = ({
  onScan,
  onUpload,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'upload'>('scanner');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Start camera for barcode scanning
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Could not access camera. Please check permissions.');
      setIsCameraActive(false);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };
  
  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg');
        stopCamera();
        onScan(imageData);
      }
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-safebite-card-bg rounded-lg max-w-md w-full border border-safebite-card-bg-alt overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-safebite-card-bg-alt">
          <h3 className="text-xl font-semibold text-safebite-text">
            {activeTab === 'scanner' ? 'Scan Food Barcode' : 'Upload Food Image'}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-safebite-text-secondary hover:text-safebite-text"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'scanner' ? 'default' : 'outline'}
              className={activeTab === 'scanner' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
              onClick={() => {
                setActiveTab('scanner');
                stopCamera();
              }}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Scanner
            </Button>
            <Button
              variant={activeTab === 'upload' ? 'default' : 'outline'}
              className={activeTab === 'upload' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
            >
              <Laptop className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
          
          {activeTab === 'scanner' && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {!isCameraActive ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {cameraError ? (
                      <div className="text-center p-4">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 mb-2">Error</Badge>
                        <p className="text-safebite-text-secondary">{cameraError}</p>
                      </div>
                    ) : (
                      <Button 
                        onClick={startCamera}
                        className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-safebite-teal/50 pointer-events-none">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-safebite-teal/50"></div>
                    </div>
                  </>
                )}
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              {isCameraActive && (
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={stopCamera}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                    onClick={captureImage}
                  >
                    Scan Barcode
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-safebite-text-secondary text-center">
                Position the barcode within the frame and hold steady
              </p>
            </div>
          )}
          
          {activeTab === 'upload' && (
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-safebite-teal bg-safebite-teal/5' : 'border-safebite-card-bg-alt'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-safebite-text-secondary mx-auto mb-4" />
              <p className="text-safebite-text mb-2">Drag and drop a food image here</p>
              <p className="text-safebite-text-secondary text-sm mb-4">
                or click to select a file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Image
              </Button>
              <p className="text-xs text-safebite-text-secondary mt-4">
                Supported formats: JPG, PNG, WEBP
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodScannerUpload;
