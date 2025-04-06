import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Activity, Heart, Droplets, Scale, Utensils, Brain, Lungs, 
  Dna, Microscope, Thermometer, Pill, Stethoscope, Syringe, Virus, Zap } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';
import BMICalculator from '@/components/health-tools/BMICalculator';
import CalorieCalculator from '@/components/health-tools/CalorieCalculator';
import WaterIntakeCalculator from '@/components/health-tools/WaterIntakeCalculator';
import MacroCalculator from '@/components/health-tools/MacroCalculator';
import NutritionScoreCalculator from '@/components/health-tools/NutritionScoreCalculator';
import IdealWeightCalculator from '@/components/health-tools/IdealWeightCalculator';
import BodyFatCalculator from '@/components/health-tools/BodyFatCalculator';
import HeartRateCalculator from '@/components/health-tools/HeartRateCalculator';
import BloodPressureAnalyzer from '@/components/health-tools/BloodPressureAnalyzer';
import SleepCalculator from '@/components/health-tools/SleepCalculator';
import StressAnalyzer from '@/components/health-tools/StressAnalyzer';
import ExerciseCalorieCalculator from '@/components/health-tools/ExerciseCalorieCalculator';
import DiseaseRiskAssessment from '@/components/health-tools/DiseaseRiskAssessment';
import SymptomChecker from '@/components/health-tools/SymptomChecker';
import MedicationReminder from '@/components/health-tools/MedicationReminder';
import FoodSafetyChecker from '@/components/health-tools/FoodSafetyChecker';

const HealthTools = () => {
  const [activeTab, setActiveTab] = useState('fitness');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    trackHealthBoxInteraction('tab', value);
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
        Under Development
      </div>
      
      <DashboardSidebar />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Health Tools</h1>
            <p className="text-safebite-text-secondary">
              Comprehensive health and wellness calculators and tools to help you achieve your health goals
            </p>
          </div>
          
          <Tabs defaultValue="fitness" className="space-y-6" onValueChange={handleTabChange}>
            <div className="sci-fi-card p-4 overflow-x-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <TabsTrigger value="fitness" className="flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  Fitness
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center">
                  <Utensils className="mr-2 h-4 w-4" />
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="medical" className="flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Medical
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Fitness Tools */}
            <TabsContent value="fitness" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BMICalculator />
                <IdealWeightCalculator />
                <BodyFatCalculator />
                <HeartRateCalculator />
                <ExerciseCalorieCalculator />
                <SleepCalculator />
              </div>
            </TabsContent>
            
            {/* Nutrition Tools */}
            <TabsContent value="nutrition" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CalorieCalculator />
                <WaterIntakeCalculator />
                <MacroCalculator />
                <NutritionScoreCalculator />
                <FoodSafetyChecker />
              </div>
            </TabsContent>
            
            {/* Health Tools */}
            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BloodPressureAnalyzer />
                <StressAnalyzer />
                <DiseaseRiskAssessment />
              </div>
            </TabsContent>
            
            {/* Medical Tools */}
            <TabsContent value="medical" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SymptomChecker />
                <MedicationReminder />
                <Card className="sci-fi-card">
                  <CardHeader>
                    <CardTitle className="flex items-center text-safebite-text">
                      <Virus className="mr-2 h-5 w-5 text-safebite-teal" />
                      COVID-19 Tracker
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-safebite-text-secondary mb-4">
                      Track COVID-19 statistics and vaccination data worldwide using Disease.sh API.
                    </p>
                    <div className="text-center p-4 bg-safebite-card-bg-alt rounded-md">
                      <p className="text-safebite-teal">Coming Soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 p-4 sci-fi-card">
            <h2 className="text-xl font-semibold text-safebite-text mb-4">Health Data Integration</h2>
            <p className="text-safebite-text-secondary mb-4">
              Connect your health devices and apps to get personalized recommendations and insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-safebite-card-bg-alt rounded-md flex items-center">
                <Activity className="h-5 w-5 text-safebite-teal mr-2" />
                <span className="text-safebite-text-secondary">Fitness Trackers</span>
              </div>
              <div className="p-4 bg-safebite-card-bg-alt rounded-md flex items-center">
                <Heart className="h-5 w-5 text-safebite-teal mr-2" />
                <span className="text-safebite-text-secondary">Heart Rate Monitors</span>
              </div>
              <div className="p-4 bg-safebite-card-bg-alt rounded-md flex items-center">
                <Scale className="h-5 w-5 text-safebite-teal mr-2" />
                <span className="text-safebite-text-secondary">Smart Scales</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-safebite-text-secondary mt-6 text-right">
            Created by Aditya Shenvi
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthTools;
