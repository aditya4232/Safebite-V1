# Food Delivery API for SafeBite

This backend API provides food delivery search functionality for the SafeBite application, allowing users to search for restaurants on Swiggy and Zomato based on food items and city.

## Features

- Search for restaurants on Swiggy and Zomato
- Filter by food item and city
- Get restaurant details including ratings, delivery time, and price range
- Direct links to restaurant pages on Swiggy and Zomato

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- Flask
- Flask-CORS

### Installation

1. Install the required packages:

```bash
pip install flask flask-cors requests beautifulsoup4
```

2. Run the API server:

```bash
python food_delivery_api.py
```

The server will start on port 10000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### GET /api/food-delivery

Search for restaurants on Swiggy and Zomato.

**Parameters:**

- `food` (required): The food item to search for (e.g., "pizza", "biryani")
- `city` (required): The city to search in (e.g., "mumbai", "bangalore")

**Example Request:**

```
GET /api/food-delivery?food=pizza&city=mumbai
```

**Example Response:**

```json
[
  {
    "restaurant": "Swiggy: Mumbai Pizza House",
    "redirect": "https://www.swiggy.com/restaurants/pizza-house-mumbai",
    "rating": 4.2,
    "delivery_time": "30-35 min",
    "price_range": "₹₹",
    "source": "Swiggy"
  },
  {
    "restaurant": "Zomato: Royal Pizza",
    "redirect": "https://www.zomato.com/mumbai/royal-pizza",
    "rating": 4.3,
    "delivery_time": "35-40 min",
    "price_range": "₹₹₹",
    "source": "Zomato"
  }
]
```

## Integration with Frontend

The frontend should call the API endpoint with the food and city parameters. The API will return an array of restaurant objects that can be displayed in the UI.

Example frontend code:

```typescript
const fetchRestaurants = async (food: string, city: string) => {
  const response = await fetch(`/api/food-delivery?food=${encodeURIComponent(food)}&city=${encodeURIComponent(city)}`);
  const data = await response.json();
  return data;
};
```

## Notes

- This API currently returns mock data based on the search parameters. In a production environment, it would scrape real data from Swiggy and Zomato or use their official APIs if available.
- The API includes CORS headers to allow cross-origin requests from any origin.
- Error handling is implemented to return appropriate error messages if required parameters are missing.
- The redirect URLs use search queries on Swiggy and Zomato to ensure they work correctly, rather than trying to link to specific restaurant pages which may not exist.
- Additional information like cuisine type, popular dishes, and restaurant address is included to enhance the user experience.

## Future Improvements

- Implement actual web scraping for Swiggy and Zomato
- Add caching to improve performance
- Add more filtering options (e.g., price range, ratings)
- Add pagination for large result sets
