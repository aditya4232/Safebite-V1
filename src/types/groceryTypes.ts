export interface GroceryProduct {
  _id: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  price?: number;
  sale_price?: number;
  market_price?: number;
  image_url?: string;
  source: string;
  platform?: string;
  redirect?: string;
  is_favorite?: boolean;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    [key: string]: any;
  };
  offers?: string[];
  rating?: number;
  reviews_count?: number;
  in_stock?: boolean;
  delivery_time?: string;
  _collection?: string;
  [key: string]: any; // Allow for additional properties
}
