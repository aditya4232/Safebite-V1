/**
 * AI Product Insights Service
 *
 * This service provides AI-powered insights for grocery products and food delivery items
 * It uses a simulated AI response for development, but could be connected to Gemini or another AI service
 */

import { GroceryProduct } from '@/types/groceryTypes';
import { RestaurantResult } from './foodDeliveryService';
import { trackUserInteraction } from './mlService';

// Interface for AI insights
export interface AIProductInsights {
  nutritionalAnalysis: string;
  healthBenefits: string[];
  potentialConcerns: string[];
  healthyAlternatives: string[];
  dietaryConsiderations: string;
  sustainabilityInfo?: string;
  preparationTips?: string[];
  pairingSuggestions?: string[];
}

// Interface for restaurant insights
export interface AIRestaurantInsights {
  healthRating: number; // 1-10 scale
  popularDishes: string[];
  dietaryOptions: string[];
  healthyChoices: string[];
  nutritionTips: string;
  averageCaloriesPerMeal: number;
  bestFor: string[];
}

/**
 * Generate AI insights for a grocery product
 * @param product The grocery product to analyze
 * @returns Promise with AI insights
 */
export const getGroceryProductInsights = async (product: GroceryProduct): Promise<AIProductInsights> => {
  // Track this interaction
  trackUserInteraction('ai_grocery_insights', {
    productName: product.name,
    productCategory: product.category,
    productBrand: product.brand
  });

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Extract product details for analysis
  const productName = product.name || 'Unknown Product';
  const productCategory = product.category || '';
  const productBrand = product.brand || '';

  // Generate insights based on product category
  let insights: AIProductInsights = {
    nutritionalAnalysis: '',
    healthBenefits: [],
    potentialConcerns: [],
    healthyAlternatives: [],
    dietaryConsiderations: '',
    sustainabilityInfo: '',
    preparationTips: [],
    pairingSuggestions: []
  };

  // Analyze based on product category
  if (productCategory.toLowerCase().includes('fruit') || productName.toLowerCase().includes('fruit')) {
    insights = generateFruitInsights(productName);
  } else if (productCategory.toLowerCase().includes('vegetable') || productName.toLowerCase().includes('vegetable')) {
    insights = generateVegetableInsights(productName);
  } else if (productCategory.toLowerCase().includes('dairy') || productName.toLowerCase().includes('milk') || productName.toLowerCase().includes('cheese') || productName.toLowerCase().includes('yogurt')) {
    insights = generateDairyInsights(productName);
  } else if (productCategory.toLowerCase().includes('bakery') || productName.toLowerCase().includes('bread') || productName.toLowerCase().includes('cake')) {
    insights = generateBakeryInsights(productName);
  } else if (productCategory.toLowerCase().includes('snack') || productName.toLowerCase().includes('chips') || productName.toLowerCase().includes('cookie')) {
    insights = generateSnackInsights(productName);
  } else if (productCategory.toLowerCase().includes('meat') || productName.toLowerCase().includes('chicken') || productName.toLowerCase().includes('beef') || productName.toLowerCase().includes('pork')) {
    insights = generateMeatInsights(productName);
  } else if (productCategory.toLowerCase().includes('beverage') || productName.toLowerCase().includes('drink') || productName.toLowerCase().includes('juice') || productName.toLowerCase().includes('water')) {
    insights = generateBeverageInsights(productName);
  } else {
    insights = generateGenericInsights(productName);
  }

  return insights;
};

/**
 * Generate AI insights for a restaurant
 * @param restaurant The restaurant to analyze
 * @returns Promise with AI insights
 */
export const getRestaurantInsights = async (restaurant: RestaurantResult): Promise<AIRestaurantInsights> => {
  // Track this interaction
  trackUserInteraction('ai_restaurant_insights', {
    restaurantName: restaurant.restaurant,
    cuisine: restaurant.cuisine
  });

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Extract restaurant details for analysis
  const restaurantName = restaurant.restaurant || 'Unknown Restaurant';
  const cuisine = restaurant.cuisine || '';

  // Generate insights based on cuisine
  let insights: AIRestaurantInsights = {
    healthRating: 0,
    popularDishes: [],
    dietaryOptions: [],
    healthyChoices: [],
    nutritionTips: '',
    averageCaloriesPerMeal: 0,
    bestFor: []
  };

  // Analyze based on cuisine
  if (cuisine.toLowerCase().includes('italian') || restaurantName.toLowerCase().includes('italian') || restaurantName.toLowerCase().includes('pizza')) {
    insights = generateItalianRestaurantInsights(restaurantName);
  } else if (cuisine.toLowerCase().includes('indian') || restaurantName.toLowerCase().includes('indian') || restaurantName.toLowerCase().includes('curry')) {
    insights = generateIndianRestaurantInsights(restaurantName);
  } else if (cuisine.toLowerCase().includes('chinese') || restaurantName.toLowerCase().includes('chinese')) {
    insights = generateChineseRestaurantInsights(restaurantName);
  } else if (cuisine.toLowerCase().includes('mexican') || restaurantName.toLowerCase().includes('mexican')) {
    insights = generateMexicanRestaurantInsights(restaurantName);
  } else if (cuisine.toLowerCase().includes('japanese') || restaurantName.toLowerCase().includes('sushi')) {
    insights = generateJapaneseRestaurantInsights(restaurantName);
  } else if (cuisine.toLowerCase().includes('thai') || restaurantName.toLowerCase().includes('thai')) {
    insights = generateThaiRestaurantInsights(restaurantName);
  } else if (cuisine.toLowerCase().includes('american') || restaurantName.toLowerCase().includes('burger')) {
    insights = generateAmericanRestaurantInsights(restaurantName);
  } else {
    insights = generateGenericRestaurantInsights(restaurantName);
  }

  return insights;
};

// Helper functions to generate insights based on product type
const generateFruitInsights = (productName: string): AIProductInsights => ({
  nutritionalAnalysis: `${productName} is an excellent source of vitamins, antioxidants, and dietary fiber. It is naturally low in calories and fat, making it a healthy choice for most diets.`,
  healthBenefits: [
    'Rich in essential vitamins and minerals',
    'Contains natural antioxidants that help fight free radicals',
    'Good source of dietary fiber for digestive health',
    'Supports immune system function',
    'Provides natural energy without added sugars'
  ],
  potentialConcerns: [
    'May contain natural sugars, monitor intake if you have diabetes',
    'Some individuals may have specific fruit allergies',
    'Pesticide residue may be present if not organic'
  ],
  healthyAlternatives: [
    'Try different varieties of the same fruit for nutrient diversity',
    'Frozen versions retain most nutrients and have longer shelf life',
    'Dried versions (without added sugar) for on-the-go snacking'
  ],
  dietaryConsiderations: 'Suitable for most diets including vegan, vegetarian, paleo, and whole food diets. Generally gluten-free and dairy-free.',
  sustainabilityInfo: 'Look for locally grown and seasonal options to reduce carbon footprint. Organic varieties avoid pesticides that can harm beneficial insects.',
  preparationTips: [
    'Wash thoroughly before consuming',
    'Enjoy fresh for maximum nutrient retention',
    'Add to smoothies for a nutritional boost',
    'Freeze ripe pieces for later use in smoothies or desserts'
  ],
  pairingSuggestions: [
    'Pairs well with yogurt for a balanced breakfast',
    'Add to salads for extra flavor and nutrition',
    'Combine with nuts for a satisfying snack with protein and healthy fats'
  ]
});

const generateVegetableInsights = (productName: string): AIProductInsights => ({
  nutritionalAnalysis: `${productName} is a nutrient-dense food low in calories but high in vitamins, minerals, and fiber. It is an excellent addition to a balanced diet.`,
  healthBenefits: [
    'Excellent source of essential vitamins and minerals',
    'High in dietary fiber for digestive health',
    'Contains phytonutrients with anti-inflammatory properties',
    'Supports healthy immune function',
    'Low calorie density helps with weight management'
  ],
  potentialConcerns: [
    'Some vegetables may interact with certain medications',
    'Raw varieties may be difficult to digest for some people',
    'Pesticide residue may be present if not organic'
  ],
  healthyAlternatives: [
    'Different colored vegetables offer varied nutrient profiles',
    'Frozen vegetables retain nutrients and are convenient',
    'Fermented versions for probiotic benefits'
  ],
  dietaryConsiderations: 'Suitable for most diets including vegan, vegetarian, paleo, keto, and whole food diets. Generally gluten-free and dairy-free.',
  sustainabilityInfo: 'Locally grown, seasonal vegetables have a lower carbon footprint. Organic farming practices support soil health and biodiversity.',
  preparationTips: [
    'Light steaming preserves more nutrients than boiling',
    'Roasting brings out natural sweetness',
    'Add healthy fats like olive oil to increase absorption of fat-soluble vitamins',
    'Use the entire vegetable including stems and leaves when possible to reduce waste'
  ],
  pairingSuggestions: [
    'Pair with whole grains for a complete meal',
    'Combine with lean proteins for balanced nutrition',
    'Add herbs and spices instead of salt for flavor'
  ]
});

const generateDairyInsights = (productName: string): AIProductInsights => ({
  nutritionalAnalysis: `${productName} is a good source of calcium, protein, and vitamin D. It provides essential nutrients for bone health and muscle function.`,
  healthBenefits: [
    'Excellent source of calcium for bone health',
    'Contains complete proteins with all essential amino acids',
    'Provides vitamin D (if fortified) for calcium absorption',
    'Contains probiotics (in fermented dairy) for gut health',
    'Good source of B vitamins, especially B12'
  ],
  potentialConcerns: [
    'Contains lactose which may cause digestive issues for some people',
    'Full-fat versions are higher in saturated fat',
    'May contain added sugars in flavored varieties',
    'Potential allergen for those with milk allergies'
  ],
  healthyAlternatives: [
    'Lactose-free versions for those with lactose intolerance',
    'Plant-based alternatives like almond, soy, or oat milk products',
    'Greek yogurt for higher protein content',
    'Reduced-fat options for lower calorie intake'
  ],
  dietaryConsiderations: 'Not suitable for vegan diets. May be included in vegetarian, pescatarian, and omnivorous diets. Not suitable for dairy-free or paleo diets.',
  sustainabilityInfo: 'Dairy production has a significant environmental footprint. Look for products from farms with sustainable practices and animal welfare certifications.',
  preparationTips: [
    'Store properly in refrigerator to maintain freshness',
    'Use as a base for smoothies or overnight oats',
    'Make homemade yogurt or cheese for fewer additives',
    'Freeze yogurt for a refreshing frozen treat'
  ],
  pairingSuggestions: [
    'Pair with fresh fruit for a balanced snack',
    'Use as a protein-rich addition to whole grain cereals',
    'Combine with herbs for savory dips and spreads'
  ]
});

const generateBakeryInsights = (productName: string): AIProductInsights => ({
  nutritionalAnalysis: `${productName} provides carbohydrates for energy but varies widely in nutritional value depending on ingredients. Whole grain versions offer more fiber and nutrients.`,
  healthBenefits: [
    'Provides carbohydrates for energy',
    'Whole grain versions contain fiber for digestive health',
    'Can be fortified with vitamins and minerals',
    'May contain seeds or nuts that provide healthy fats',
    'Sourdough varieties may be easier to digest'
  ],
  potentialConcerns: [
    'Often high in refined carbohydrates',
    'May contain added sugars',
    'Can be high in sodium',
    'Contains gluten (except gluten-free varieties)',
    'Some commercial products contain preservatives and additives'
  ],
  healthyAlternatives: [
    'Whole grain versions for more fiber and nutrients',
    'Sprouted grain products for increased nutrient availability',
    'Gluten-free options for those with celiac disease or gluten sensitivity',
    'Sourdough for potential probiotic benefits'
  ],
  dietaryConsiderations: 'Traditional bakery products contain gluten and are not suitable for gluten-free diets. May contain eggs or dairy. Look for specialized products for specific dietary needs.',
  sustainabilityInfo: 'Local bakeries may have a lower carbon footprint than mass-produced products. Consider packaging waste when purchasing.',
  preparationTips: [
    'Toast to enhance flavor and texture',
    'Freeze fresh bakery items to extend shelf life',
    'Make open-faced sandwiches to reduce carbohydrate intake',
    'Use as a base for healthy toppings like avocado or hummus'
  ],
  pairingSuggestions: [
    'Pair with protein sources like eggs or nut butters for balanced nutrition',
    'Top with vegetables for added nutrients',
    'Serve with healthy fats like avocado or olive oil'
  ]
});

const generateSnackInsights = (productName: string): AIProductInsights => ({
  nutritionalAnalysis: `${productName} is a convenient snack option but nutritional value varies widely. Look for versions with minimal processing, lower sodium, and no artificial additives.`,
  healthBenefits: [
    'Convenient source of energy between meals',
    'Some varieties contain whole grains or nuts for added nutrition',
    'Can help maintain blood sugar levels between meals',
    'Portion-controlled packages can aid in portion management',
    'Some contain beneficial ingredients like seeds or dried fruit'
  ],
  potentialConcerns: [
    'Often high in sodium and added sugars',
    'May contain unhealthy fats like trans fats',
    'Usually energy-dense but nutrient-poor',
    'Many contain artificial flavors, colors, and preservatives',
    'Easy to overconsume due to high palatability'
  ],
  healthyAlternatives: [
    'Fresh fruit or vegetables with hummus or nut butter',
    'Plain nuts or seeds without added salt or sugar',
    'Air-popped popcorn without butter',
    'Greek yogurt with berries',
    'Homemade versions with controlled ingredients'
  ],
  dietaryConsiderations: 'Check ingredients carefully for allergens like nuts, dairy, or gluten. Many processed snacks contain multiple allergens and are not suitable for specialized diets.',
  sustainabilityInfo: 'Packaged snacks often create significant packaging waste. Look for products with minimal or recyclable packaging.',
  preparationTips: [
    'Portion out into smaller containers to avoid overeating',
    'Combine with protein or healthy fats to increase satiety',
    'Make your own trail mix with nuts, seeds, and dried fruit',
    'Read labels carefully to avoid unhealthy additives'
  ],
  pairingSuggestions: [
    'Pair with protein sources like cheese or nuts for better blood sugar control',
    'Balance salty snacks with fresh fruit or vegetables',
    'Serve with water instead of sugary beverages'
  ]
});

const generateMeatInsights = (productName: string): AIProductInsights => ({
  nutritionalAnalysis: `${productName} is a complete protein source containing all essential amino acids. It also provides important nutrients like iron, zinc, and B vitamins.`,
  healthBenefits: [
    'Excellent source of complete protein',
    'Rich in heme iron, which is more easily absorbed than plant iron',
    'Good source of zinc for immune function',
    'Contains vitamin B12, which is not found in plant foods',
    'Provides essential amino acids for muscle maintenance and growth'
  ],
  potentialConcerns: [
    'Can be high in saturated fat depending on the cut',
    'Processed varieties may contain sodium, nitrates, and preservatives',
    'High consumption linked to increased risk of certain health conditions',
    'May contain antibiotics or hormones if not organic',
    'Environmental and ethical considerations with production'
  ],
  healthyAlternatives: [
    'Leaner cuts for lower fat content',
    'Organic or grass-fed options to avoid additives',
    'Plant-based meat alternatives',
    'Fish and seafood for omega-3 fatty acids',
    'Legumes and tofu for plant-based protein'
  ],
  dietaryConsiderations: 'Not suitable for vegetarian or vegan diets. Fits into omnivorous, paleo, and keto diets. Generally gluten-free and dairy-free unless processed with additives.',
  sustainabilityInfo: 'Meat production has a significant environmental impact. Consider reducing consumption and choosing sustainably raised options when possible.',
  preparationTips: [
    'Trim visible fat before cooking',
    'Use cooking methods like grilling, baking, or steaming instead of frying',
    'Marinate with herbs and spices instead of high-sodium marinades',
    'Control portion sizes (recommended serving is about 3-4 oz)'
  ],
  pairingSuggestions: [
    'Serve with plenty of vegetables for a balanced meal',
    'Pair with whole grains for complete nutrition',
    'Add herbs and spices for flavor without excess sodium'
  ]
});

const generateBeverageInsights = (productName: string): AIProductInsights => ({
  nutritionalAnalysis: `The nutritional value of ${productName} varies widely depending on ingredients. Water, unsweetened tea, and black coffee are healthiest, while sugary drinks should be limited.`,
  healthBenefits: [
    'Contributes to daily hydration needs',
    'Some beverages contain beneficial antioxidants',
    'Can provide vitamins and minerals depending on ingredients',
    'Certain herbal teas may have specific health benefits',
    'Some provide electrolytes for hydration balance'
  ],
  potentialConcerns: [
    'Many beverages contain added sugars',
    'Some contain caffeine which may affect sleep or cause jitters',
    'Acidic drinks may affect dental health',
    'Some contain artificial sweeteners, colors, or flavors',
    'Calories from beverages do not provide the same satiety as food'
  ],
  healthyAlternatives: [
    'Water is the healthiest beverage choice',
    'Unsweetened tea or coffee',
    'Infused water with fruit or herbs',
    'Sparkling water without added sweeteners',
    'Homemade smoothies with whole fruits and vegetables'
  ],
  dietaryConsiderations: 'Check ingredients for allergens, added sugars, and artificial additives. Many beverages contain hidden ingredients that may not align with specific dietary needs.',
  sustainabilityInfo: 'Consider packaging waste and transportation impact. Tap water in a reusable bottle has the lowest environmental footprint.',
  preparationTips: [
    'Make your own infused water with fresh fruits and herbs',
    'Brew tea or coffee at home to control additives',
    'Dilute fruit juices with water to reduce sugar content',
    'Use frozen fruit instead of ice for naturally flavored cold drinks'
  ],
  pairingSuggestions: [
    'Pair water with meals to aid digestion',
    'Serve herbal teas with evening meals for better sleep',
    'Balance caffeinated beverages with adequate water intake'
  ]
});

const generateGenericInsights = (productName: string): AIProductInsights => ({
  nutritionalAnalysis: `The nutritional profile of ${productName} depends on its ingredients and processing methods. Check the nutrition facts panel for specific information.`,
  healthBenefits: [
    'May provide essential nutrients depending on ingredients',
    'Can be part of a balanced diet when consumed appropriately',
    'Convenience may help maintain regular eating patterns',
    'Fortified products may provide additional vitamins and minerals',
    'Can help meet specific dietary needs when chosen carefully'
  ],
  potentialConcerns: [
    'Processed foods often contain added sodium, sugars, and preservatives',
    'May be high in calories but low in essential nutrients',
    'Some contain artificial ingredients or allergens',
    'Packaging may contain BPA or other chemicals of concern',
    'Ultra-processed foods linked to various health concerns'
  ],
  healthyAlternatives: [
    'Look for versions with shorter ingredient lists',
    'Choose products with minimal processing',
    'Consider whole food alternatives when possible',
    'Make homemade versions to control ingredients',
    'Select organic options to avoid certain pesticides and additives'
  ],
  dietaryConsiderations: 'Check ingredient lists carefully for allergens and additives that may not align with specific dietary needs or restrictions.',
  sustainabilityInfo: 'Consider packaging waste and the environmental impact of ingredients. Look for sustainably sourced and locally produced options when possible.',
  preparationTips: [
    'Read labels carefully before purchasing',
    'Store according to package instructions for maximum freshness',
    'Consider portion sizes to avoid overconsumption',
    'Combine with fresh, whole foods for a more balanced meal'
  ],
  pairingSuggestions: [
    'Pair with fresh fruits or vegetables to increase nutrient density',
    'Balance processed foods with whole food options',
    'Add herbs and spices to enhance flavor without additional sodium'
  ]
});

// Helper functions to generate restaurant insights based on cuisine
const generateItalianRestaurantInsights = (restaurantName: string): AIRestaurantInsights => ({
  healthRating: 6,
  popularDishes: ['Pizza', 'Pasta', 'Risotto', 'Lasagna', 'Tiramisu'],
  dietaryOptions: ['Vegetarian options available', 'Ask for whole grain pasta', 'Gluten-free options may be available'],
  healthyChoices: [
    'Minestrone soup',
    'Grilled fish with vegetables',
    'Caprese salad',
    'Pasta primavera (ask for light oil)',
    'Chicken piccata'
  ],
  nutritionTips: 'Italian cuisine can be healthy when focusing on tomato-based sauces, vegetables, and olive oil. Limit cream-based sauces, excessive cheese, and bread. Ask for dressing on the side for salads.',
  averageCaloriesPerMeal: 800,
  bestFor: ['Date night', 'Family dining', 'Vegetarian options']
});

const generateIndianRestaurantInsights = (restaurantName: string): AIRestaurantInsights => ({
  healthRating: 7,
  popularDishes: ['Butter Chicken', 'Biryani', 'Naan', 'Samosas', 'Tikka Masala'],
  dietaryOptions: ['Many vegetarian and vegan options', 'Dairy-free options available', 'Gluten-free options (avoid naan and samosas)'],
  healthyChoices: [
    'Tandoori chicken or fish',
    'Dal (lentil soup)',
    'Chana masala (chickpea curry)',
    'Vegetable curry',
    'Raita (yogurt side dish)'
  ],
  nutritionTips: 'Indian cuisine offers many vegetable and legume-based dishes rich in protein and fiber. Choose tomato-based curries over cream-based ones, limit fried items like samosas, and opt for plain rice instead of biryani for fewer calories.',
  averageCaloriesPerMeal: 850,
  bestFor: ['Vegetarians and vegans', 'Spice lovers', 'Group dining']
});

const generateChineseRestaurantInsights = (restaurantName: string): AIRestaurantInsights => ({
  healthRating: 5,
  popularDishes: ['Kung Pao Chicken', 'Sweet and Sour Pork', 'Fried Rice', 'Dumplings', 'Chow Mein'],
  dietaryOptions: ['Vegetarian options available', 'Ask for steamed instead of fried', 'Request sauce on the side'],
  healthyChoices: [
    'Steamed vegetables',
    'Buddha delight (vegetable dish)',
    'Steamed fish with ginger',
    'Hot and sour soup',
    'Moo goo gai pan (chicken and vegetables)'
  ],
  nutritionTips: 'Chinese restaurant food can be high in sodium and oil. Choose steamed dishes over fried, request brown rice instead of white, and ask for sauces on the side. Limit deep-fried appetizers and sweet sauces.',
  averageCaloriesPerMeal: 900,
  bestFor: ['Quick meals', 'Family-style dining', 'Takeout options']
});

const generateMexicanRestaurantInsights = (restaurantName: string): AIRestaurantInsights => ({
  healthRating: 6,
  popularDishes: ['Tacos', 'Burritos', 'Enchiladas', 'Quesadillas', 'Nachos'],
  dietaryOptions: ['Vegetarian options with beans', 'Corn tortillas for gluten-free', 'Ask for grilled instead of fried'],
  healthyChoices: [
    'Grilled fish tacos',
    'Fajitas with extra vegetables',
    'Black bean soup',
    'Ceviche',
    'Soft corn tortillas instead of fried shells'
  ],
  nutritionTips: 'Mexican cuisine can be nutritious with beans, vegetables, and lean proteins. Limit cheese, sour cream, and fried items. Choose soft corn tortillas over fried shells, and be mindful of portion sizes with rice and beans.',
  averageCaloriesPerMeal: 950,
  bestFor: ['Casual dining', 'Groups', 'Customizable meals']
});

const generateJapaneseRestaurantInsights = (restaurantName: string): AIRestaurantInsights => ({
  healthRating: 8,
  popularDishes: ['Sushi', 'Sashimi', 'Ramen', 'Tempura', 'Teriyaki'],
  dietaryOptions: ['Many gluten-free options', 'Vegetarian options available', 'High-protein options with fish'],
  healthyChoices: [
    'Sashimi (raw fish without rice)',
    'Miso soup',
    'Edamame',
    'Seaweed salad',
    'Grilled fish or chicken teriyaki (sauce on side)'
  ],
  nutritionTips: 'Japanese cuisine is often healthy with fish, vegetables, and fermented foods. Choose sashimi over rolls for fewer carbs, limit tempura and other fried items, and be mindful of sodium in soy sauce and miso.',
  averageCaloriesPerMeal: 650,
  bestFor: ['Health-conscious diners', 'Seafood lovers', 'Light meals']
});

const generateThaiRestaurantInsights = (restaurantName: string): AIRestaurantInsights => ({
  healthRating: 7,
  popularDishes: ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice', 'Papaya Salad'],
  dietaryOptions: ['Many dishes can be made vegetarian', 'Gluten-free options available', 'Specify spice level'],
  healthyChoices: [
    'Tom yum soup',
    'Papaya salad (som tam)',
    'Stir-fried vegetables with tofu',
    'Larb (meat salad)',
    'Steamed fish with lime and chili'
  ],
  nutritionTips: 'Thai cuisine features many herbs, spices, and vegetables with health benefits. Be mindful of coconut milk in curries, added sugar in sauces, and fried appetizers. Ask for less oil and sugar in stir-fries.',
  averageCaloriesPerMeal: 750,
  bestFor: ['Spice enthusiasts', 'Flavor-forward dining', 'Aromatic dishes']
});

const generateAmericanRestaurantInsights = (restaurantName: string): AIRestaurantInsights => ({
  healthRating: 4,
  popularDishes: ['Burgers', 'Steaks', 'Fried Chicken', 'Mac and Cheese', 'Apple Pie'],
  dietaryOptions: ['Ask for grilled instead of fried', 'Substitute side dishes', 'Request dressings and sauces on the side'],
  healthyChoices: [
    'Grilled chicken sandwich (no mayo)',
    'Garden salad with dressing on the side',
    'Grilled fish',
    'Turkey burger',
    'Vegetable soup'
  ],
  nutritionTips: 'American restaurant food is often high in calories, sodium, and portion sizes. Choose grilled over fried, ask for vegetables instead of fries, and consider splitting entrees. Request whole grain buns when available.',
  averageCaloriesPerMeal: 1100,
  bestFor: ['Comfort food', 'Familiar options', 'Large portions']
});

const generateGenericRestaurantInsights = (restaurantName: string): AIRestaurantInsights => ({
  healthRating: 6,
  popularDishes: ['Signature dishes vary by restaurant', 'Ask server for recommendations', 'Check specials menu'],
  dietaryOptions: ['Ask about allergen information', 'Inquire about modification options', 'Check if nutrition information is available'],
  healthyChoices: [
    'Grilled protein options',
    'Vegetable-forward dishes',
    'Broth-based soups',
    'Side salads with dressing on the side',
    'Steamed or roasted vegetables'
  ],
  nutritionTips: 'Restaurant meals are typically higher in calories, sodium, and fat than home-cooked meals. Control portions by sharing dishes or taking half home, choose grilled over fried, and ask how dishes are prepared.',
  averageCaloriesPerMeal: 850,
  bestFor: ['Varies by restaurant specialty', 'Check reviews for recommendations', 'Ask staff about popular choices']
});

export default {
  getGroceryProductInsights,
  getRestaurantInsights
};
