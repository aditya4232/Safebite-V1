import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Activity, Sparkles } from 'lucide-react';

// Define the nutrition data type
interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  date?: string;
}

// Floating sphere component
const FloatingSphere = ({ position, size, color, label, value, onClick }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Animation
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    
    // Pulse effect when hovered
    if (hovered) {
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, size * 1.1, 0.1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, size * 1.1, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, size * 1.1, 0.1);
    } else {
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, size, 0.1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, size, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, size, 0.1);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          setClicked(!clicked);
          if (onClick) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? new THREE.Color(color).multiplyScalar(1.2) : color} 
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Label */}
      <Text
        position={[position[0], position[1] + size + 0.2, position[2]]}
        color="white"
        fontSize={0.15}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      {/* Value */}
      <Text
        position={[position[0], position[1] - size - 0.1, position[2]]}
        color="white"
        fontSize={0.12}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
};

// Nutrition visualization scene
const NutritionScene = ({ data }: { data: NutritionData }) => {
  // Calculate sizes based on nutrition values
  const maxValue = Math.max(data.protein, data.carbs, data.fat, data.fiber || 0, data.sugar || 0);
  const getSize = (value: number) => 0.2 + (value / maxValue) * 0.4;
  
  // Handle sphere click
  const handleSphereClick = (nutrient: string) => {
    console.log(`Clicked on ${nutrient}`);
  };
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />
      
      {/* Nutrition spheres */}
      <FloatingSphere 
        position={[-1.5, 0, 0]} 
        size={getSize(data.protein)} 
        color="#10b981" 
        label="Protein" 
        value={`${data.protein}g`}
        onClick={() => handleSphereClick('protein')}
      />
      <FloatingSphere 
        position={[0, 0, 0]} 
        size={getSize(data.carbs)} 
        color="#6366f1" 
        label="Carbs" 
        value={`${data.carbs}g`}
        onClick={() => handleSphereClick('carbs')}
      />
      <FloatingSphere 
        position={[1.5, 0, 0]} 
        size={getSize(data.fat)} 
        color="#f97316" 
        label="Fat" 
        value={`${data.fat}g`}
        onClick={() => handleSphereClick('fat')}
      />
      
      {/* Optional nutrients */}
      {data.fiber !== undefined && (
        <FloatingSphere 
          position={[-0.75, -1, 0]} 
          size={getSize(data.fiber)} 
          color="#84cc16" 
          label="Fiber" 
          value={`${data.fiber}g`}
          onClick={() => handleSphereClick('fiber')}
        />
      )}
      
      {data.sugar !== undefined && (
        <FloatingSphere 
          position={[0.75, -1, 0]} 
          size={getSize(data.sugar)} 
          color="#ec4899" 
          label="Sugar" 
          value={`${data.sugar}g`}
          onClick={() => handleSphereClick('sugar')}
        />
      )}
      
      {/* Calories indicator */}
      <Text
        position={[0, 1.5, 0]}
        color="white"
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
      >
        {`${data.calories} kcal`}
      </Text>
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={3}
        maxDistance={6}
      />
    </>
  );
};

// Main component
interface NutritionVisualizationProps {
  data?: NutritionData;
  isLoading?: boolean;
  title?: string;
  className?: string;
}

const NutritionVisualization: React.FC<NutritionVisualizationProps> = ({
  data,
  isLoading = false,
  title = "Nutrition Visualization",
  className = ""
}) => {
  // Default data if none provided
  const defaultData: NutritionData = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 70,
    fiber: 25,
    sugar: 50
  };
  
  const nutritionData = data || defaultData;
  
  // Visualization modes
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  
  return (
    <Card className={`sci-fi-card border-safebite-teal/30 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-safebite-text flex items-center">
            <Activity className="mr-2 h-5 w-5 text-safebite-teal" />
            {title}
            <Badge className="ml-3 bg-safebite-teal text-safebite-dark-blue">Interactive</Badge>
          </CardTitle>
          
          <Tabs value={mode} onValueChange={(value) => setMode(value as '3d' | '2d')} className="w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="3d" className="text-xs px-3 py-1 h-6">3D View</TabsTrigger>
              <TabsTrigger value="2d" className="text-xs px-3 py-1 h-6">2D View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-safebite-teal animate-spin mb-4" />
            <p className="text-safebite-text-secondary">Loading nutrition data...</p>
          </div>
        ) : (
          <Tabs value={mode} className="w-full">
            <TabsContent value="3d" className="mt-0">
              <div className="h-64 w-full bg-safebite-dark-blue rounded-lg overflow-hidden">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <NutritionScene data={nutritionData} />
                </Canvas>
              </div>
              <div className="mt-2 text-xs text-safebite-text-secondary text-center">
                <Sparkles className="inline-block h-3 w-3 mr-1" />
                Drag to rotate, scroll to zoom
              </div>
            </TabsContent>
            
            <TabsContent value="2d" className="mt-0">
              <div className="h-64 w-full bg-safebite-card-bg-alt/30 rounded-lg p-4 flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-safebite-text-secondary">Calories</span>
                      <span className="text-xs font-medium text-safebite-text">{nutritionData.calories} kcal</span>
                    </div>
                    <div className="h-2 bg-safebite-card-bg-alt rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-safebite-teal" 
                        style={{ width: `${Math.min(100, (nutritionData.calories / 2500) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-safebite-text-secondary">Protein</span>
                      <span className="text-xs font-medium text-safebite-text">{nutritionData.protein}g</span>
                    </div>
                    <div className="h-2 bg-safebite-card-bg-alt rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${Math.min(100, (nutritionData.protein / 100) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-safebite-text-secondary">Carbs</span>
                      <span className="text-xs font-medium text-safebite-text">{nutritionData.carbs}g</span>
                    </div>
                    <div className="h-2 bg-safebite-card-bg-alt rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${Math.min(100, (nutritionData.carbs / 300) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-safebite-text-secondary">Fat</span>
                      <span className="text-xs font-medium text-safebite-text">{nutritionData.fat}g</span>
                    </div>
                    <div className="h-2 bg-safebite-card-bg-alt rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500" 
                        style={{ width: `${Math.min(100, (nutritionData.fat / 100) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {nutritionData.fiber !== undefined && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-safebite-text-secondary">Fiber</span>
                        <span className="text-xs font-medium text-safebite-text">{nutritionData.fiber}g</span>
                      </div>
                      <div className="h-2 bg-safebite-card-bg-alt rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-lime-500" 
                          style={{ width: `${Math.min(100, (nutritionData.fiber / 30) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {nutritionData.sugar !== undefined && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-safebite-text-secondary">Sugar</span>
                        <span className="text-xs font-medium text-safebite-text">{nutritionData.sugar}g</span>
                      </div>
                      <div className="h-2 bg-safebite-card-bg-alt rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-500" 
                          style={{ width: `${Math.min(100, (nutritionData.sugar / 50) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionVisualization;
