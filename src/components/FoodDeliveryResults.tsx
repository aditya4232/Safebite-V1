import React, { useEffect, useState } from "react";
import { fetchNearbyRestaurants } from "../services/foodDeliveryService";

// Define the expected shape of a result item
interface RestaurantResult {
  restaurant: string;
  redirect: string;
  // Add other potential fields if the API returns them (e.g., price, eta)
}

// Define the props for the component
interface FoodDeliveryResultsProps {
  query: string;
  city: string;
}

const FoodDeliveryResults: React.FC<FoodDeliveryResultsProps> = ({ query, city }) => {
  const [results, setResults] = useState<RestaurantResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if both query and city are provided
    if (query && city) {
      setLoading(true);
      setError(null); // Reset error state on new fetch
      fetchNearbyRestaurants(query, city)
        .then((data) => {
          if (Array.isArray(data)) {
            setResults(data);
          } else {
            // Handle cases where the API might not return an array on error
            console.error("API did not return an array:", data);
            setResults([]);
            setError("Could not fetch results. Please try again later.");
          }
        })
        .catch((err) => {
          console.error("Error fetching restaurant data:", err);
          setError("An error occurred while fetching results.");
          setResults([]); // Clear results on error
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Clear results if query or city is missing
      setResults([]);
    }
  }, [query, city]); // Re-run effect when query or city changes

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading nearby restaurants...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!query || !city) {
    return <div className="p-4 text-center text-gray-500">Please enter a food item and city to search.</div>;
  }
  
  if (results.length === 0) {
      return <div className="p-4 text-center text-gray-500">No restaurants found for "{query}" in "{city}". Try a different search?</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {results.map((r, i) => (
        <div key={i} className="bg-zinc-800 p-4 rounded-xl border border-teal-500/50 shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-teal-300 mb-2 truncate" title={r.restaurant}>
            {r.restaurant || "Restaurant Name Unavailable"} 
          </h3>
          {r.redirect ? (
            <a
              href={r.redirect}
              className="text-sm mt-2 inline-block bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded text-white transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer" // Security best practice for target="_blank"
            >
              Order Now →
            </a>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Link not available</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FoodDeliveryResults; // Export as default
