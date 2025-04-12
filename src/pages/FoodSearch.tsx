import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGuestMode } from '@/hooks/useGuestMode';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, CheckCircle, XCircle,
  Leaf, Flame, Heart, Zap, Database,
  History, Tag, Star, Upload, Scan,
  Bot, AlertCircle, Camera, Search, Filter,
  Utensils, Info, ArrowRight, Sparkles, ShoppingBag
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import FoodSearchBar from '@/components/FoodSearchBar';
import ImprovedFoodSearch from '@/components/ImprovedFoodSearch';
import FoodItemCard from '@/components/FoodItemCard';
import FoodDetailView from '@/components/FoodDetailView';
import FoodSearchHistory from '@/components/FoodSearchHistory';
import FoodScannerUpload from '@/components/FoodScannerUpload';
import ImageNutritionAnalysis from '@/components/ImageNutritionAnalysis';
import ApiSourceSelector from '@/components/ApiSourceSelector';
import FoodChatBot from '@/components/FoodChatBot';
import FoodDeliveryCard from '@/components/FoodDeliveryCard';
import {
  FoodItem, searchFoods, searchByBarcode, searchByImage,
  saveSearchHistory, getSearchHistory, toggleFavorite,
  addTagToSearch, removeTagFromSearch, removeSearchHistoryItem,
  getApiStatus, trackUserInteraction
} from '@/services/foodApiService';
import {
  searchNutrition, analyzeImage, scanBarcode,
  getNutritionApiStatus, FoodItem as NutritionFoodItem
} from '@/services/nutritionApiService';
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase";
import { addFoodToTracker, getRecentFoods } from '@/services/foodTrackerService';
import { getFoodRecommendations, analyzeFoodItem } from '@/services/geminiService';

interface HealthProfile {
  health_goals?: string;
  health_conditions?: string;
  dietary_preferences?: string;
  food_allergies?: string;
}

const FoodSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);
  // User profile for personalized recommendations
  const [userProfile, setUserProfile] = useState<HealthProfile | null>(null);
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showAddToTrackerModal, setShowAddToTrackerModal] = useState(false);
  const [selectedFoodForTracker, setSelectedFoodForTracker] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  // API status tracking
  const [apiStatuses, setApiStatuses] = useState(getApiStatus());
  const [nutritionApiStatuses, setNutritionApiStatuses] = useState(getNutritionApiStatus());
  const [preferredApi, setPreferredApi] = useState<string | undefined>(undefined);
  const [activeNutritionApi, setActiveNutritionApi] = useState<'calorieNinjas' | 'fatSecret' | 'both'>('both');
  const [nutritionResults, setNutritionResults] = useState<NutritionFoodItem[]>([]);
  // AI analysis
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  // Show API status panel
  const [showApiStatus, setShowApiStatus] = useState(false);
  const [notes, setNotes] = useState('');

  // New state for enhanced features
  const [showScannerUpload, setShowScannerUpload] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showApiSelector, setShowApiSelector] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [activeApiSource, setActiveApiSource] = useState('Edamam');
  const [favoriteItems, setFavoriteItems] = useState<{[key: string]: boolean}>({});
  const [foodTags, setFoodTags] = useState<{[key: string]: string[]}>({});
  const [currentHistoryId, setCurrentHistoryId] = useState<string>('');
  const location = useLocation();
  // Navigation for redirects
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();

  // Effect to read query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query); // Perform search automatically
    }

    // Check if scan parameter is present
    const scan = params.get('scan');
    if (scan === 'true') {
      handleScan();
    }

    // Fetch user profile for personalized recommendations
    fetchUserProfile();

    // Fetch recent foods
    fetchRecentFoods();

    // Load search history
    loadSearchHistory();
  }, [location.search]); // Rerun effect if search params change

  // Load search history from localStorage
  const loadSearchHistory = () => {
    const history = getSearchHistory();
    setSearchHistory(history);

    // Extract favorites and tags
    const favorites: {[key: string]: boolean} = {};
    const tags: {[key: string]: string[]} = {};

    history.forEach((item: any) => {
      if (item.isFavorite) {
        favorites[item.id] = true;
      }
      if (item.tags && item.tags.length > 0) {
        tags[item.id] = item.tags;
      }
    });

    setFavoriteItems(favorites);
    setFoodTags(tags);
  };

  // Fetch user's recent foods
  const fetchRecentFoods = async () => {
    try {
      const foods = await getRecentFoods(4);
      setRecentFoods(foods);
    } catch (error) {
      console.error('Error fetching recent foods:', error);
    }
  };

  // Fetch user profile from Firebase
  const fetchUserProfile = async () => {
    // If in guest mode, use default profile
    if (isGuest) {
      const guestProfile: HealthProfile = {
        health_goals: 'General Health',
        dietary_preferences: 'Balanced',
        health_conditions: '',
        food_allergies: ''
      };
      setUserProfile(guestProfile);
      await generateRecommendations(guestProfile);
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserProfile(userData.profile);

        // Generate food recommendations based on profile
        await generateRecommendations(userData.profile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Generate food recommendations based on user profile and ML model
  const generateRecommendations = async (profile: HealthProfile) => {
    if (!profile) return;

    try {
      // First try to get ML-based recommendations
      const mlRecommendations = await getFoodRecommendations();

      if (mlRecommendations && mlRecommendations.length > 0) {
        // Use ML recommendations to search for foods
        const query = mlRecommendations.slice(0, 3).join(' ');
        fetchRecommendations(query);
        return;
      }

      // Fallback to profile-based recommendations
      let recommendationQueries: string[] = [];

      // Based on health goals
      if (profile.health_goals === 'Weight Loss') {
        recommendationQueries.push('low calorie');
        recommendationQueries.push('high protein');
      } else if (profile.health_goals === 'Muscle Gain') {
        recommendationQueries.push('high protein');
        recommendationQueries.push('protein rich');
      } else if (profile.health_goals === 'General Health') {
        recommendationQueries.push('balanced meal');
        recommendationQueries.push('nutrient rich');
      }

      // Based on health conditions
      if (profile.health_conditions === 'Diabetes') {
        recommendationQueries.push('low glycemic');
        recommendationQueries.push('sugar free');
      } else if (profile.health_conditions === 'Hypertension') {
        recommendationQueries.push('low sodium');
        recommendationQueries.push('heart healthy');
      } else if (profile.health_conditions === 'Heart Issues') {
        recommendationQueries.push('heart healthy');
        recommendationQueries.push('omega 3');
      }

      // Based on dietary preferences
      if (profile.dietary_preferences === 'Veg') {
        recommendationQueries.push('vegetarian');
      } else if (profile.dietary_preferences === 'Vegan') {
        recommendationQueries.push('vegan');
      } else if (profile.dietary_preferences === 'Keto') {
        recommendationQueries.push('keto');
      } else if (profile.dietary_preferences === 'Gluten-Free') {
        recommendationQueries.push('gluten free');
      }

      // Get a random recommendation query
      if (recommendationQueries.length > 0) {
        const randomIndex = Math.floor(Math.random() * recommendationQueries.length);
        const query = recommendationQueries[randomIndex];

        // Fetch recommendations
        fetchRecommendations(query);
      }
    } catch (error) {
      console.error('Error generating ML recommendations:', error);
      // Fallback to a simple healthy food search
      fetchRecommendations('healthy food');
    }
  };

  // Fetch food recommendations using Gemini AI
  const fetchRecommendations = async (query: string) => {
    try {
      // First try to get AI-based recommendations
      const aiRecommendationsText = await getFoodRecommendations(query);
      console.log('AI Recommendations:', aiRecommendationsText);

      // Extract food names from AI recommendations
      const foodNames = extractFoodNamesFromAIResponse(aiRecommendationsText);

      if (foodNames.length > 0) {
        // Search for each recommended food
        const recommendationPromises = foodNames.map(food => searchFoods(food));
        const recommendationResults = await Promise.all(recommendationPromises);

        // Flatten results and take the first item from each search
        const topRecommendations = recommendationResults
          .map(results => results.length > 0 ? results[0] : null)
          .filter(item => item !== null) as FoodItem[];

        if (topRecommendations.length > 0) {
          setRecommendations(topRecommendations);
          return;
        }
      }

      // Fallback to regular search if AI recommendations fail
      const results = await searchFoods(query);
      // Filter to only include healthy options
      const healthyOptions = results.filter(food => food.nutritionScore === 'green');
      setRecommendations(healthyOptions.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Final fallback
      try {
        const results = await searchFoods('healthy ' + query);
        setRecommendations(results.slice(0, 3));
      } catch (fallbackError) {
        console.error('Fallback recommendation error:', fallbackError);
      }
    }
  };

  // Helper function to extract food names from AI response
  const extractFoodNamesFromAIResponse = (text: string): string[] => {
    // Simple extraction - look for food names at the beginning of lines or after numbers
    const lines = text.split('\n');
    const foodNames: string[] = [];

    for (const line of lines) {
      // Look for lines that start with numbers or have food names after colons
      if (/^\d+\.\s+([A-Za-z\s]+)/.test(line)) {
        const match = line.match(/^\d+\.\s+([A-Za-z\s]+)/);
        if (match && match[1]) {
          foodNames.push(match[1].trim());
        }
      } else if (line.includes(':')) {
        const parts = line.split(':');
        if (parts.length > 1 && parts[0].trim().length < 20) { // Avoid long descriptions
          foodNames.push(parts[0].trim());
        }
      }
    }

    // If no structured format found, just take the first few words of each line
    if (foodNames.length === 0) {
      for (const line of lines) {
        if (line.trim().length > 0) {
          const words = line.trim().split(' ').slice(0, 3).join(' ');
          if (words.length > 3 && !foodNames.includes(words)) {
            foodNames.push(words);
          }
        }
      }
    }

    return foodNames.slice(0, 3); // Return up to 3 food names
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a food item to search",
        variant: "destructive"
      });
      return;
    }

    setSearchQuery(query);
    setIsLoading(true);
    setSelectedFood(null);
    setShowNoResults(false);
    setShowHistory(false);
    setAiAnalysis(''); // Clear any previous AI analysis

    try {
      // Save to search history
      const historyId = saveSearchHistory(query);
      setCurrentHistoryId(historyId);
      loadSearchHistory();

      // Track this interaction
      trackUserInteraction('search', { query });

      // Use only CalorieNinjas API for simplicity and reliability
      const results = await searchCalorieNinjas(query);

      if (results && results.length > 0) {
        // Process the results to calculate nutrition scores
        const processedResults = results.map(item => {
          // Calculate nutrition score based on nutrient values
          let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

          // Determine score based on protein, fiber, sugar content
          const protein = item.nutrients.protein || 0;
          const fiber = item.nutrients.fiber || 0;
          const sugar = item.nutrients.sugar || 0;
          const fat = item.nutrients.fat || 0;

          if (protein > 15 && fiber > 3 && sugar < 10) {
            nutritionScore = 'green';
          } else if (fat > 20 || sugar > 15) {
            nutritionScore = 'red';
          }

          return {
            id: item.id,
            name: item.name,
            calories: item.calories,
            nutritionScore,
            nutrients: item.nutrients,
            source: 'CalorieNinjas',
            apiSource: 'CalorieNinjas',
            image: '', // CalorieNinjas doesn't provide images
            details: {
              protein: item.nutrients.protein || 0,
              carbs: item.nutrients.carbs || 0,
              fat: item.nutrients.fat || 0,
              sodium: item.nutrients.sodium || 0,
              sugar: item.nutrients.sugar || 0,
              calories: item.calories,
              ingredients: [],
              allergens: [],
              additives: []
            }
          };
        });

        // Update both result sets for consistency
        setSearchResults(processedResults);
        setNutritionResults(results);
        setShowNoResults(false);

        toast({
          title: "Search Complete",
          description: `Found ${results.length} results for "${query}"`,
        });
      } else {
        setSearchResults([]);
        setNutritionResults([]);
        setShowNoResults(true);

        toast({
          title: "No Results",
          description: `No results found for "${query}". Try a different search term.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setNutritionResults([]);
      setShowNoResults(true);

      toast({
        title: "Search Error",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the scanner/upload modal
  const handleOpenScannerUpload = () => {
    setShowScannerUpload(true);
  };

  // Handle barcode scanning
  const handleScan = async (imageData: string) => {
    setIsLoading(true);
    setSelectedFood(null);
    setShowScannerUpload(false);

    toast({
      title: "Processing Barcode",
      description: "Analyzing the scanned barcode...",
    });

    try {
      // Simulate a barcode from the image
      const simulatedBarcode = Math.floor(Math.random() * 1000000000000).toString();

      // Call the barcode search API
      const results = await searchByBarcode(simulatedBarcode);

      if (results.length > 0) {
        // Save to search history
        const historyId = saveSearchHistory(`Barcode: ${simulatedBarcode}`);
        setCurrentHistoryId(historyId);
        loadSearchHistory();

        // Display results
        setSearchResults(results);
        setShowNoResults(false);

        toast({
          title: "Product Found",
          description: `Scanned product identified as ${results[0].name}`,
        });
      } else {
        setShowNoResults(true);
        toast({
          title: "Product Not Found",
          description: "Could not identify the scanned product",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      setShowNoResults(true);
      toast({
        title: "Scan Error",
        description: "There was a problem scanning the product",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setSelectedFood(null);
    setShowScannerUpload(false);

    toast({
      title: "Processing Image",
      description: "Analyzing the uploaded food image...",
    });

    try {
      // Call the image search API
      const results = await searchByImage(file);

      if (results.length > 0) {
        // Save to search history
        const historyId = saveSearchHistory(`Image: ${file.name}`);
        setCurrentHistoryId(historyId);
        loadSearchHistory();

        // Display results
        setSearchResults(results);
        setShowNoResults(false);

        toast({
          title: "Food Identified",
          description: `Image identified as ${results[0].name}`,
        });
      } else {
        setShowNoResults(true);
        toast({
          title: "Food Not Identified",
          description: "Could not identify food in the image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setShowNoResults(true);
      toast({
        title: "Processing Error",
        description: "There was a problem analyzing the image",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodSelect = async (food: FoodItem) => {
    setSelectedFood(food);
    setShowHistory(false);

    // Get AI analysis of the food item
    if (food) {
      setIsAnalysisLoading(true);
      try {
        // Get AI analysis
        const analysis = await analyzeFoodItem(food);
        setAiAnalysis(analysis);

        // Save this food selection to user's history
        saveUserFoodSelection(food, analysis);

        // Show toast notification about AI analysis
        toast({
          title: "AI Analysis Ready",
          description: "Check the AI Analysis tab for personalized insights",
          variant: "default"
        });
      } catch (error) {
        console.error('Error getting AI analysis:', error);
        setAiAnalysis('Unable to analyze this food item at the moment.');
      } finally {
        setIsAnalysisLoading(false);
      }
    }
  };

  // Save user's food selection to Firebase for ML learning
  const saveUserFoodSelection = async (food: FoodItem, analysis: string) => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        console.log('User not logged in, skipping food selection tracking');
        return;
      }

      const db = getFirestore(app);
      const userRef = doc(db, 'users', user.uid);
      const foodSelectionsRef = doc(db, 'users', user.uid, 'foodSelections', `${Date.now()}`);

      // Save the food selection with analysis
      await setDoc(foodSelectionsRef, {
        foodId: food.id,
        foodName: food.name,
        nutritionScore: food.nutritionScore,
        calories: food.calories,
        nutrients: food.nutrients,
        aiAnalysis: analysis,
        timestamp: new Date().toISOString(),
        source: food.apiSource || food.source
      });

      console.log('Food selection saved to user profile');
    } catch (error) {
      console.error('Error saving food selection:', error);
    }
  };

  // Handle showing search history
  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };

  // Handle API source selection
  const handleShowApiSelector = () => {
    setShowApiSelector(!showApiSelector);
  };

  // Handle toggling API source
  const handleToggleApiSource = (apiId: string) => {
    // In a real implementation, this would enable/disable specific API sources
    setActiveApiSource(apiId);
  };

  // Handle history item click
  const handleHistoryItemClick = (query: string) => {
    handleSearch(query);
  };

  // Handle toggling favorite status
  const handleToggleFavorite = (id: string) => {
    const newStatus = toggleFavorite(id);
    setFavoriteItems(prev => ({
      ...prev,
      [id]: newStatus
    }));
  };

  // Handle adding a tag
  const handleAddTag = (id: string, tag: string) => {
    if (addTagToSearch(id, tag)) {
      setFoodTags(prev => {
        const currentTags = prev[id] || [];
        return {
          ...prev,
          [id]: [...currentTags, tag]
        };
      });
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (id: string, tag: string) => {
    if (removeTagFromSearch(id, tag)) {
      setFoodTags(prev => {
        const currentTags = prev[id] || [];
        return {
          ...prev,
          [id]: currentTags.filter(t => t !== tag)
        };
      });
    }
  };

  // Handle removing a history item
  const handleRemoveHistoryItem = (id: string) => {
    if (removeSearchHistoryItem(id)) {
      setSearchHistory(prev => prev.filter(item => item.id !== id));
      setFavoriteItems(prev => {
        const newFavorites = { ...prev };
        delete newFavorites[id];
        return newFavorites;
      });
      setFoodTags(prev => {
        const newTags = { ...prev };
        delete newTags[id];
        return newTags;
      });
    }
  };

  // Open the Add to Tracker modal
  const handleAddToTracker = (food: FoodItem) => {
    setSelectedFoodForTracker(food);
    setShowAddToTrackerModal(true);
    setQuantity(1);
    setNotes('');
  };

  // Add the selected food to the tracker
  const handleTrackerSubmit = async () => {
    if (!selectedFoodForTracker) return;

    setIsLoading(true);

    try {
      const success = await addFoodToTracker(
        selectedFoodForTracker,
        selectedMealType,
        quantity,
        notes,
        aiAnalysis // Include AI analysis when adding to tracker
      );

      if (success) {
        toast({
          title: "Added to Tracker",
          description: `${selectedFoodForTracker.name} added to your ${selectedMealType} tracker.`,
        });

        // Update recent foods
        fetchRecentFoods();
      } else {
        toast({
          title: "Error",
          description: "Could not add food to tracker. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding food to tracker:', error);
      toast({
        title: "Error",
        description: "Could not add food to tracker. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowAddToTrackerModal(false);
      setSelectedFoodForTracker(null);
    }
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-safebite-teal border-t-transparent rounded-full mb-4"></div>
          <p className="text-safebite-text-secondary">Searching for food data...</p>
        </div>
      );
    }

    if (showNoResults) {
      return (
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-safebite-text mb-2">No Results Found</h3>
          <p className="text-safebite-text-secondary mb-4">
            We couldn't find any food matching "{searchQuery}"
          </p>
          <Button
            variant="outline"
            className="sci-fi-button"
            onClick={() => setShowNoResults(false)}
          >
            Try a Different Search
          </Button>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {searchResults.map(food => (
            <FoodItemCard
              key={food.id}
              name={food.name}
              calories={food.calories}
              nutritionScore={food.nutritionScore}
              onClick={() => handleFoodSelect(food)}
            />
          ))}
        </div>
      );
    }

    return null;
  };



  // Add to Tracker Modal
  const renderAddToTrackerModal = () => {
    if (!showAddToTrackerModal || !selectedFoodForTracker) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-safebite-card-bg rounded-lg max-w-md w-full p-6 border border-safebite-card-bg-alt">
          <h3 className="text-xl font-semibold text-safebite-text mb-4">Add to Food Tracker</h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-safebite-text-secondary">Food:</span>
              <span className="text-safebite-text font-medium">{selectedFoodForTracker.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-safebite-text-secondary">Calories:</span>
              <span className="text-safebite-text font-medium">{selectedFoodForTracker.calories} kcal</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-safebite-text-secondary mb-2">Meal Type</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedMealType === 'breakfast' ? 'default' : 'outline'}
                className={selectedMealType === 'breakfast' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
                onClick={() => setSelectedMealType('breakfast')}
              >
                Breakfast
              </Button>
              <Button
                variant={selectedMealType === 'lunch' ? 'default' : 'outline'}
                className={selectedMealType === 'lunch' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
                onClick={() => setSelectedMealType('lunch')}
              >
                Lunch
              </Button>
              <Button
                variant={selectedMealType === 'dinner' ? 'default' : 'outline'}
                className={selectedMealType === 'dinner' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
                onClick={() => setSelectedMealType('dinner')}
              >
                Dinner
              </Button>
              <Button
                variant={selectedMealType === 'snack' ? 'default' : 'outline'}
                className={selectedMealType === 'snack' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
                onClick={() => setSelectedMealType('snack')}
              >
                Snack
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-safebite-text-secondary mb-2">Quantity</label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="mx-4 text-safebite-text font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-safebite-text-secondary mb-2">Notes (optional)</label>
            <input
              type="text"
              className="w-full p-2 bg-safebite-card-bg-alt border border-safebite-card-bg rounded-md text-safebite-text"
              placeholder="E.g., Before workout, With salad"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddToTrackerModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              onClick={handleTrackerSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add to Tracker'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      {renderAddToTrackerModal()}
      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Food Search</h1>
            <p className="text-safebite-text-secondary">Search for foods, scan barcodes, and get detailed nutrition information</p>
          </div>

          {/* Improved Food Search Component */}
          <ImprovedFoodSearch
            onSelectFood={(food) => {
              setSelectedFood(food as any);
              setShowNoResults(false);
              setShowScannerUpload(false);
              setShowHistory(false);
              setShowApiSelector(false);
              setShowChatBot(false);

              // Track this interaction
              trackUserInteraction('food_selected', { foodId: food._id, foodName: food.name || food.product || food.food_name || food.recipe_name });
            }}
            className="mb-6"
          />

          {/* Legacy Food Search Bar */}
          <div className="sci-fi-card mb-6 hidden">
            <FoodSearchBar
              onSearch={handleSearch}
              onScan={handleOpenScannerUpload}
              onUpload={handleOpenScannerUpload}
              onShowHistory={handleShowHistory}
              onApiSelect={handleShowApiSelector}
              activeApi={activeApiSource}
            />
          </div>

          {/* API Selection Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all" onClick={() => setActiveNutritionApi('both')}>
                  <Database className="mr-2 h-4 w-4" />
                  All Sources
                </TabsTrigger>
                <TabsTrigger value="calorieNinjas" onClick={() => setActiveNutritionApi('calorieNinjas')}>
                  <Flame className="mr-2 h-4 w-4" />
                  CalorieNinjas
                </TabsTrigger>
                <TabsTrigger value="fatSecret" onClick={() => setActiveNutritionApi('fatSecret')}>
                  <Utensils className="mr-2 h-4 w-4" />
                  FatSecret
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Food Delivery Card */}
          <div className="mb-6">
            <FoodDeliveryCard />
          </div>

          {/* CalorieNinjas Image Analysis */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-safebite-text mb-4 flex items-center">
              <Camera className="mr-2 h-5 w-5 text-safebite-teal" />
              New! Image Nutrition Analysis
            </h2>
            <ImageNutritionAnalysis isGuest={!auth.currentUser} />
          </div>

          {selectedFood ? (
            <FoodDetailView
              food={selectedFood}
              onBack={() => setSelectedFood(null)}
              onAddToTracker={handleAddToTracker}
              onAddTag={(foodId, tag) => handleAddTag(foodId, tag)}
              onToggleFavorite={(foodId) => handleToggleFavorite(foodId)}
              isFavorite={favoriteItems[selectedFood.id] || false}
              tags={foodTags[selectedFood.id] || []}
              aiAnalysis={aiAnalysis}
              isAnalysisLoading={isAnalysisLoading}
            />
          ) : showHistory ? (
            <div className="sci-fi-card">
              <FoodSearchHistory
                historyItems={searchHistory}
                recentFoods={recentFoods}
                onHistoryItemClick={handleHistoryItemClick}
                onFoodItemClick={handleFoodSelect}
                onToggleFavorite={handleToggleFavorite}
                onRemoveHistoryItem={handleRemoveHistoryItem}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </div>
          ) : (
            <div className="sci-fi-card">
              <h2 className="text-xl font-semibold text-safebite-text mb-4">
                {searchResults.length > 0 || nutritionResults.length > 0 ? 'Search Results' : 'Popular Searches'}
              </h2>

              {/* Tabs for different result sources */}
              {(searchResults.length > 0 || nutritionResults.length > 0) && (
                <Tabs defaultValue="all" className="w-full mb-6">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="all">
                      <Database className="mr-2 h-4 w-4" />
                      All Results
                    </TabsTrigger>
                    <TabsTrigger value="edamam">
                      <Utensils className="mr-2 h-4 w-4" />
                      Edamam
                    </TabsTrigger>
                    <TabsTrigger value="nutrition">
                      <Flame className="mr-2 h-4 w-4" />
                      Nutrition APIs
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    {/* Combined Results */}
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      {searchResults.map((food) => (
                        <FoodItemCard
                          key={food.id}
                          name={food.name || food.product || food.food_name || food.recipe_name || 'Unknown Food'}
                          calories={food.calories || food.nutritionalInfo?.calories || 0}
                          nutritionScore={food.nutritionScore || 0}
                          onClick={() => handleFoodSelect(food)}
                          source="Edamam"
                        />
                      ))}

                      {nutritionResults.map((food) => (
                        <FoodItemCard
                          key={food.id}
                          name={food.name}
                          calories={food.calories}
                          nutritionScore={0}
                          onClick={() => {
                            // Convert NutritionFoodItem to FoodItem format
                            const convertedFood: FoodItem = {
                              id: food.id,
                              name: food.name,
                              calories: food.calories,
                              nutritionalInfo: {
                                calories: food.calories,
                                protein: food.nutrients.protein,
                                carbs: food.nutrients.carbs,
                                fat: food.nutrients.fat,
                                fiber: food.nutrients.fiber,
                                sugar: food.nutrients.sugar
                              },
                              source: food.source
                            };
                            handleFoodSelect(convertedFood);
                          }}
                          source={food.source}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="edamam">
                    {/* Edamam Results */}
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      {searchResults.length > 0 ? (
                        searchResults.map((food) => (
                          <FoodItemCard
                            key={food.id}
                            name={food.name || food.product || food.food_name || food.recipe_name || 'Unknown Food'}
                            calories={food.calories || food.nutritionalInfo?.calories || 0}
                            nutritionScore={food.nutritionScore || 0}
                            onClick={() => handleFoodSelect(food)}
                            source="Edamam"
                          />
                        ))
                      ) : (
                        <div className="text-center p-6">
                          <AlertCircle className="mx-auto h-12 w-12 text-safebite-text-secondary mb-4" />
                          <p className="text-safebite-text-secondary">No results found from Edamam API</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="nutrition">
                    {/* Nutrition API Results */}
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      {nutritionResults.length > 0 ? (
                        nutritionResults.map((food) => (
                          <FoodItemCard
                            key={food.id}
                            name={food.name}
                            calories={food.calories}
                            nutritionScore={0}
                            onClick={() => {
                              // Convert NutritionFoodItem to FoodItem format
                              const convertedFood: FoodItem = {
                                id: food.id,
                                name: food.name,
                                calories: food.calories,
                                nutritionalInfo: {
                                  calories: food.calories,
                                  protein: food.nutrients.protein,
                                  carbs: food.nutrients.carbs,
                                  fat: food.nutrients.fat,
                                  fiber: food.nutrients.fiber,
                                  sugar: food.nutrients.sugar
                                },
                                source: food.source
                              };
                              handleFoodSelect(convertedFood);
                            }}
                            source={food.source}
                          />
                        ))
                      ) : (
                        <div className="text-center p-6">
                          <AlertCircle className="mx-auto h-12 w-12 text-safebite-text-secondary mb-4" />
                          <p className="text-safebite-text-secondary">No results found from Nutrition APIs</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {searchResults.length === 0 && nutritionResults.length === 0 && (
                <>
                  {renderSearchResults()}

                  {(!searchResults.length && !showNoResults && !isLoading) && (
                    <>
                      {/* Personalized Recommendations */}
                      {recommendations.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-xl font-semibold text-safebite-text mb-4">
                            Recommended for You
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            {recommendations.map((food) => (
                              <FoodItemCard
                                key={food.id}
                                name={food.name}
                                calories={food.calories}
                                nutritionScore={food.nutritionScore}
                                onClick={() => handleFoodSelect(food)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Popular Categories */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-safebite-text mb-4">
                          Popular Categories
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Card
                            className="p-4 cursor-pointer hover:bg-safebite-card-bg-alt transition-colors"
                            onClick={() => handleSearch("healthy breakfast")}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                                <Leaf className="h-6 w-6 text-green-500" />
                              </div>
                              <h4 className="font-medium text-safebite-text">Healthy Breakfast</h4>
                            </div>
                          </Card>

                          <Card
                            className="p-4 cursor-pointer hover:bg-safebite-card-bg-alt transition-colors"
                            onClick={() => handleSearch("protein rich")}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                                <Flame className="h-6 w-6 text-red-500" />
                              </div>
                              <h4 className="font-medium text-safebite-text">Protein Rich</h4>
                            </div>
                          </Card>

                          <Card
                            className="p-4 cursor-pointer hover:bg-safebite-card-bg-alt transition-colors"
                            onClick={() => handleSearch("heart healthy")}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                                <Heart className="h-6 w-6 text-purple-500" />
                              </div>
                              <h4 className="font-medium text-safebite-text">Heart Healthy</h4>
                            </div>
                          </Card>
                        </div>
                      </div>

                      {/* Recent Foods */}
                      <div>
                        <h3 className="text-xl font-semibold text-safebite-text mb-4">
                          Recent Foods
                        </h3>
                        {recentFoods.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {recentFoods.map((food) => (
                              <FoodItemCard
                                key={food.id}
                                name={food.name}
                                calories={food.calories}
                                nutritionScore={food.nutritionScore}
                                onClick={() => handleFoodSelect(food)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            <FoodItemCard
                              name="Breakfast Cereal"
                              calories={120}
                              nutritionScore="yellow"
                              onClick={() => handleSearch("cereal")}
                            />
                            <FoodItemCard
                              name="Protein Bars"
                              calories={200}
                              nutritionScore="yellow"
                              onClick={() => handleSearch("protein bar")}
                            />
                            <FoodItemCard
                              name="Greek Yogurt"
                              calories={100}
                              nutritionScore="green"
                              onClick={() => handleSearch("greek yogurt")}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Scanner/Upload Modal */}
      {showScannerUpload && (
        <FoodScannerUpload
          onScan={handleScan}
          onUpload={handleImageUpload}
          onClose={() => setShowScannerUpload(false)}
        />
      )}

      {/* AI Chatbot */}
      {showChatBot && (
        <FoodChatBot initialMessage="Hi! I'm your SafeBite AI assistant. Ask me anything about food, nutrition, or the foods you're searching for!" />
      )}

      {/* API Source Selector Modal */}
      {showApiSelector && (
        <ApiSourceSelector
          apiSources={[
            {
              id: 'mongodb',
              name: 'SafeBite Database',
              description: 'Our curated database of food products and recipes',
              isActive: preferredApi === 'mongodb'
            },
            {
              id: 'calorieninjas',
              name: 'CalorieNinjas API',
              description: 'Detailed nutrition data with image recognition capabilities',
              isActive: preferredApi === 'calorieninjas'
            },
            {
              id: 'openfoodfacts',
              name: 'Open Food Facts',
              description: 'Global community-driven food product database',
              isActive: preferredApi === 'openfoodfacts'
            },
            {
              id: 'edamam',
              name: 'Edamam Food Database',
              description: 'Comprehensive nutrition data for packaged and whole foods',
              isActive: preferredApi === 'edamam'
            }
          ]}
          onToggleApi={(apiId) => {
            setPreferredApi(apiId);
            setShowApiSelector(false);
            // Refresh API status
            setApiStatuses(getApiStatus());
          }}
          onClose={() => setShowApiSelector(false)}
        />
      )}
    </div>
  );
};

export default FoodSearch;
