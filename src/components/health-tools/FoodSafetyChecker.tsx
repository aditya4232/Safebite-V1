import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Search, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Food storage guidelines
const storageGuidelines = {
  refrigerator: {
    'Raw meat (beef, pork, lamb)': '3-5 days',
    'Raw poultry': '1-2 days',
    'Raw fish': '1-2 days',
    'Ground meat': '1-2 days',
    'Cooked meat': '3-4 days',
    'Cooked poultry': '3-4 days',
    'Cooked fish': '3-4 days',
    'Deli meats (opened)': '3-5 days',
    'Eggs': '3-5 weeks',
    'Milk': '5-7 days',
    'Cheese (hard)': '3-4 weeks',
    'Cheese (soft)': '1 week',
    'Yogurt': '1-2 weeks',
    'Fresh fruits (most)': '5-7 days',
    'Fresh vegetables (most)': '3-5 days',
    'Leftovers': '3-4 days',
    'Soups and stews': '3-4 days',
    'Salads (prepared)': '3-5 days',
    'Bread': '5-7 days',
    'Cooked pasta': '3-5 days',
    'Cooked rice': '3-5 days'
  },
  freezer: {
    'Raw meat (beef, pork, lamb)': '4-12 months',
    'Raw poultry': '9-12 months',
    'Raw fish': '3-8 months',
    'Ground meat': '3-4 months',
    'Cooked meat': '2-3 months',
    'Cooked poultry': '2-6 months',
    'Cooked fish': '4-6 months',
    'Deli meats': '1-2 months',
    'Eggs (not in shell)': '12 months',
    'Milk': '3 months',
    'Cheese (hard)': '6-8 months',
    'Cheese (soft)': 'Not recommended',
    'Yogurt': '1-2 months',
    'Fresh fruits (most)': '8-12 months',
    'Fresh vegetables (most)': '8-12 months',
    'Leftovers': '2-3 months',
    'Soups and stews': '2-3 months',
    'Bread': '2-3 months',
    'Cooked pasta': '1-2 months',
    'Cooked rice': '1-2 months'
  },
  pantry: {
    'Canned goods (low acid)': '2-5 years',
    'Canned goods (high acid)': '12-18 months',
    'Dried pasta': '1-2 years',
    'Rice (white)': '4-5 years',
    'Rice (brown)': '6-8 months',
    'Flour (white)': '1 year',
    'Flour (whole wheat)': '3 months',
    'Sugar': '2 years',
    'Baking powder': '18 months',
    'Baking soda': '2 years',
    'Herbs and spices (ground)': '2-3 years',
    'Herbs and spices (whole)': '3-4 years',
    'Cereal (unopened)': '6-12 months',
    'Cereal (opened)': '3 months',
    'Nuts': '6-9 months',
    'Peanut butter (natural)': '2-3 months',
    'Peanut butter (commercial)': '6-9 months',
    'Oils (vegetable, olive)': '1-3 months (opened)',
    'Honey': 'Indefinitely',
    'Coffee (ground)': '3-5 months',
    'Tea bags': '1-2 years'
  }
};

// Recent food recalls (example data)
const foodRecalls = [
  {
    id: 'recall-001',
    product: 'Organic Spinach',
    brand: 'Green Farms',
    reason: 'Potential Salmonella contamination',
    date: '2023-11-15',
    severity: 'high',
    affected: 'All packages with use-by dates between Nov 10-25, 2023'
  },
  {
    id: 'recall-002',
    product: 'Chocolate Chip Cookies',
    brand: 'Sweet Delights',
    reason: 'Undeclared peanut allergen',
    date: '2023-11-10',
    severity: 'high',
    affected: 'Batch numbers 45672-45680'
  },
  {
    id: 'recall-003',
    product: 'Ground Beef',
    brand: 'Premium Meats',
    reason: 'Possible E. coli contamination',
    date: '2023-11-05',
    severity: 'high',
    affected: 'Products with sell-by dates between Nov 1-7, 2023'
  },
  {
    id: 'recall-004',
    product: 'Almond Milk',
    brand: 'Nature\'s Best',
    reason: 'Potential improper pasteurization',
    date: '2023-10-28',
    severity: 'medium',
    affected: 'Half-gallon containers with expiration dates before Dec 15, 2023'
  },
  {
    id: 'recall-005',
    product: 'Frozen Pizza',
    brand: 'Quick Meal',
    reason: 'Foreign material (plastic pieces)',
    date: '2023-10-20',
    severity: 'medium',
    affected: 'Pepperoni variety, all sizes, batch code P234-P240'
  }
];

// Common foodborne illnesses and symptoms
const foodborneIllnesses = [
  {
    name: 'Salmonella',
    symptoms: 'Diarrhea, fever, abdominal cramps, vomiting',
    onset: '6-72 hours',
    duration: '4-7 days',
    sources: 'Raw or undercooked eggs, poultry, meat, unpasteurized milk or juice, cheese, contaminated raw fruits and vegetables'
  },
  {
    name: 'E. coli',
    symptoms: 'Severe stomach cramps, diarrhea (often bloody), vomiting',
    onset: '3-4 days',
    duration: '5-10 days',
    sources: 'Undercooked ground beef, unpasteurized milk and juice, raw fruits and vegetables, contaminated water'
  },
  {
    name: 'Listeria',
    symptoms: 'Fever, muscle aches, nausea, diarrhea; can cause serious complications in pregnant women, older adults, and immunocompromised individuals',
    onset: '1-4 weeks',
    duration: 'Variable',
    sources: 'Unpasteurized dairy products, hot dogs, deli meats, smoked seafood, raw sprouts'
  },
  {
    name: 'Norovirus',
    symptoms: 'Nausea, vomiting, diarrhea, stomach pain, fever, headache, body aches',
    onset: '12-48 hours',
    duration: '1-3 days',
    sources: 'Contaminated food or water, touching surfaces with the virus and then touching your mouth'
  },
  {
    name: 'Campylobacter',
    symptoms: 'Diarrhea (often bloody), fever, abdominal cramps, nausea, vomiting',
    onset: '2-5 days',
    duration: '1 week',
    sources: 'Raw or undercooked poultry, unpasteurized milk, contaminated water'
  }
];

const FoodSafetyChecker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [storageType, setStorageType] = useState('refrigerator');
  const [searchResults, setSearchResults] = useState<{item: string, duration: string}[]>([]);
  const [activeTab, setActiveTab] = useState('storage');
  const [filteredRecalls, setFilteredRecalls] = useState(foodRecalls);

  const handleStorageSearch = () => {
    if (!searchQuery) return;
    
    const results = Object.entries(storageGuidelines[storageType as keyof typeof storageGuidelines])
      .filter(([item]) => item.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(([item, duration]) => ({ item, duration }));
    
    setSearchResults(results);
  };

  const handleRecallSearch = (query: string) => {
    if (!query) {
      setFilteredRecalls(foodRecalls);
      return;
    }
    
    const filtered = foodRecalls.filter(recall => 
      recall.product.toLowerCase().includes(query.toLowerCase()) ||
      recall.brand.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredRecalls(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-safebite-text';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="storage" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="storage">Storage Guidelines</TabsTrigger>
          <TabsTrigger value="recalls">Food Recalls</TabsTrigger>
          <TabsTrigger value="illnesses">Foodborne Illnesses</TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="storage-type" className="text-safebite-text">Storage Location</Label>
              <Select value={storageType} onValueChange={setStorageType}>
                <SelectTrigger className="bg-safebite-card-bg-alt border-safebite-card-bg-alt">
                  <SelectValue placeholder="Select storage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refrigerator">Refrigerator</SelectItem>
                  <SelectItem value="freezer">Freezer</SelectItem>
                  <SelectItem value="pantry">Pantry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="food-search" className="text-safebite-text">Search Food Item</Label>
                <Input
                  id="food-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., chicken, eggs, milk"
                  className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
                />
              </div>
              <Button 
                onClick={handleStorageSearch} 
                className="self-end bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-3 mt-4">
              <h4 className="text-md font-medium text-safebite-text">Storage Guidelines</h4>
              {searchResults.map((result, index) => (
                <Card key={index} className="bg-safebite-card-bg-alt border-safebite-card-bg-alt">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-safebite-text">{result.item}</h5>
                        <p className="text-sm text-safebite-text-secondary">
                          Safe storage time: <span className="font-medium text-safebite-teal">{result.duration}</span>
                        </p>
                      </div>
                      <div className="text-xs bg-safebite-card-bg px-2 py-1 rounded text-safebite-text-secondary capitalize">
                        {storageType}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-6 text-safebite-text-secondary">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No matching food items found.</p>
              <p className="text-sm">Try a different search term or storage location.</p>
            </div>
          ) : (
            <div className="text-center py-6 text-safebite-text-secondary">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Search for a food item to see storage guidelines.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recalls" className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="recall-search" className="text-safebite-text">Search Recalls</Label>
              <div className="flex space-x-2">
                <Input
                  id="recall-search"
                  placeholder="Search by product or brand"
                  className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
                  onChange={(e) => handleRecallSearch(e.target.value)}
                />
                <Button 
                  onClick={() => setFilteredRecalls(foodRecalls)} 
                  variant="outline"
                  className="border-safebite-card-bg-alt"
                  title="Reset search"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 mt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-safebite-text">Recent Food Recalls</h4>
                <div className="text-xs text-safebite-text-secondary">
                  Showing {filteredRecalls.length} of {foodRecalls.length}
                </div>
              </div>

              {filteredRecalls.length > 0 ? (
                <div className="space-y-3">
                  {filteredRecalls.map((recall) => (
                    <Card key={recall.id} className="bg-safebite-card-bg-alt border-safebite-card-bg-alt">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              {getSeverityIcon(recall.severity)}
                              <h5 className="font-medium text-safebite-text ml-1">{recall.product}</h5>
                            </div>
                            <p className="text-sm text-safebite-text-secondary">Brand: {recall.brand}</p>
                            <p className="text-sm text-safebite-text-secondary mt-1">{recall.reason}</p>
                            <p className="text-xs text-safebite-text-secondary mt-2">Affected: {recall.affected}</p>
                          </div>
                          <div className="text-xs text-right">
                            <div className={`font-medium ${getSeverityColor(recall.severity)}`}>
                              {recall.severity.toUpperCase()}
                            </div>
                            <div className="text-safebite-text-secondary mt-1">
                              {new Date(recall.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-safebite-text-secondary">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-70" />
                  <p>No matching recalls found.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="illnesses" className="space-y-4">
          <h4 className="text-md font-medium text-safebite-text">Common Foodborne Illnesses</h4>
          
          <div className="space-y-3">
            {foodborneIllnesses.map((illness, index) => (
              <Card key={index} className="bg-safebite-card-bg-alt border-safebite-card-bg-alt">
                <CardContent className="p-4">
                  <h5 className="font-medium text-safebite-text">{illness.name}</h5>
                  
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="text-xs text-safebite-text-secondary">Symptoms</div>
                      <p className="text-sm text-safebite-text">{illness.symptoms}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-safebite-text-secondary">Onset Time</div>
                        <p className="text-sm text-safebite-text">{illness.onset}</p>
                      </div>
                      <div>
                        <div className="text-xs text-safebite-text-secondary">Duration</div>
                        <p className="text-sm text-safebite-text">{illness.duration}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-safebite-text-secondary">Common Sources</div>
                      <p className="text-sm text-safebite-text">{illness.sources}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-xs text-safebite-text-secondary mt-2">
            <p>If you suspect you have a foodborne illness, seek medical attention, especially if symptoms are severe or persistent.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="text-xs text-safebite-text-secondary mt-4">
        <p>Note: This tool provides general food safety information. Always check product-specific guidelines and consult health authorities for the most current information.</p>
      </div>
    </div>
  );
};

export default FoodSafetyChecker;
