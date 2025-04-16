import React, { useState, useEffect } from 'react';
import calorieNinjasApi from '@/utils/calorieNinjasApi';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const HealthCheck = () => {
  const [foodQuery, setFoodQuery] = useState('');
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [processedFoodFrequency, setProcessedFoodFrequency] = useState('');
  const [dietQuality, setDietQuality] = useState('');
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFoodQuery(event.target.value);
  };

  const handleProcessedFoodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProcessedFoodFrequency(event.target.value);
  };

  const handleDietQualityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDietQuality(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await calorieNinjasApi.getNutritionFromText(foodQuery);
      setNutritionData(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch nutrition data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue text-safebite-text p-8">
      <h1 className="text-3xl font-bold mb-4">Health Check</h1>
      <form onSubmit={handleSubmit} className="flex items-center mb-4">
        <input
          type="text"
          value={foodQuery}
          onChange={handleInputChange}
          placeholder="Enter a food to check"
          className="sci-fi-input mr-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="sci-fi-button"
        >
          {isLoading ? 'Loading...' : 'Get Nutrition'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {nutritionData && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Nutrition Data for: {foodQuery}</h2>
          <pre className="bg-safebite-card-bg p-4 rounded-md overflow-x-auto">
            {JSON.stringify(nutritionData, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Quick Questions</h2>
        <div className="mb-4">
          <label className="block text-safebite-text-secondary mb-1">
            How often do you eat processed foods?
          </label>
          <select
            className="sci-fi-input w-full"
            value={processedFoodFrequency}
            onChange={handleProcessedFoodChange}
          >
            <option value="">Select an option</option>
            <option value="Rarely">Rarely</option>
            <option value="Sometimes">Sometimes</option>
            <option value="Frequently">Frequently</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-safebite-text-secondary mb-1">
            How would you rate your overall diet quality?
          </label>
          <select
            className="sci-fi-input w-full"
            value={dietQuality}
            onChange={handleDietQualityChange}
          >
            <option value="">Select an option</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        <button
          type="button"
          onClick={async () => {
            setIsLoading(true);
            try {
              const user = auth.currentUser;
              if (user) {
                const userRef = doc(db, "users", user.uid);
                await setDoc(
                  userRef,
                  {
                    healthCheckData: {
                      foodQuery: foodQuery,
                      nutritionData: nutritionData,
                      processedFoodFrequency: processedFoodFrequency,
                      dietQuality: dietQuality,
                    },
                  },
                  { merge: true }
                );
                toast({
                  title: "Health check data saved!",
                  description: "Your health check data has been saved.",
                });
              }
            } catch (error: any) {
              toast({
                title: "Error saving health check data",
                description: error.message,
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          }}
          className="sci-fi-button"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Health Check Data"}
        </button>
        <button
          type="button"
          onClick={() => {
            const doc = new jsPDF();
            doc.text('Health Check Report', 10, 10);
            doc.text(`Food Query: ${foodQuery}`, 10, 20);
            doc.text(`Processed Food Frequency: ${processedFoodFrequency}`, 10, 30);
            doc.text(`Diet Quality: ${dietQuality}`, 10, 40);
            doc.text(`Nutrition Data: ${JSON.stringify(nutritionData, null, 2)}`, 10, 50);
            doc.save('health_check_report.pdf');
          }}
          className="sci-fi-button"
        >
          Generate PDF Report
        </button>
      </div>
    </div>
  );
};

export default HealthCheck;