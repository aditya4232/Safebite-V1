# SafeBite Developer Notes

## Project Overview

SafeBite is a health-focused application that helps users make better food choices by providing nutritional information, health tools, and personalized recommendations. The application integrates with various food databases and delivery services to offer a comprehensive solution for health-conscious users.

## Tech Stack

- **Frontend**: React with TypeScript, Vite, shadcn/ui, three.js
- **Backend**: Flask (Python), MongoDB Atlas
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore, MongoDB Atlas
- **Deployment**: Render (backend), GitHub Pages (frontend)
- **APIs**: Edamam, CalorieNinjas, FatSecret, Google Gemini AI

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys and configuration
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

## Key Features

### Authentication
- Email/password login
- Google authentication
- Guest mode with 1-hour session
- Secure session management

### Dashboard
- Health data visualization with charts
- Activity tracking
- Personalized recommendations
- Achievement badges and XP points

### Food Search (Nutrition)
- Comprehensive nutritional information
- AI-powered analysis using Gemini
- Healthy alternatives suggestions
- Recipe recommendations

### Grocery Products
- MongoDB Atlas search integration
- Web scraping from multiple sources (Blinkit, Zepto, Instamart, BigBasket)
- Healthy alternatives using Gemini AI
- Detailed product information with offers

### Food Delivery
- Integration with Swiggy and Zomato
- Restaurant search with health preferences
- Menu recommendations based on nutritional goals

### Health Tools
- BMI Calculator
- Calorie Calculator
- Macro Calculator
- Water Intake Calculator
- Body Fat Calculator
- Heart Rate Calculator
- And more...

### Health Check
- Comprehensive health assessment
- PDF report generation
- Data visualization with charts
- Personalized recommendations

## Code Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components for each route
- `src/services`: API and service integrations
- `src/hooks`: Custom React hooks
- `src/utils`: Utility functions
- `src/styles`: Global styles and theme configuration
- `src/types`: TypeScript type definitions
- `src/assets`: Static assets (images, icons, etc.)

## Best Practices

1. **Environment Variables**: Never hardcode API keys or sensitive information. Use the environment variables system.
2. **Type Safety**: Use TypeScript types for all components and functions.
3. **Error Handling**: Implement proper error handling for all API calls and user interactions.
4. **Performance**: Optimize components with memoization, lazy loading, and code splitting.
5. **Accessibility**: Ensure all components are accessible (keyboard navigation, screen readers, etc.).
6. **Testing**: Write tests for critical functionality.
7. **Documentation**: Document complex functions and components.

## Common Issues and Solutions

### Firebase Authentication
- Issue: Session not persisting across page refreshes
- Solution: Use the new sessionService for proper session management

### API Rate Limits
- Issue: Hitting rate limits for external APIs
- Solution: Implement caching and throttling in the backend

### Mobile Responsiveness
- Issue: UI elements not displaying correctly on mobile
- Solution: Use responsive design patterns and test on multiple device sizes

## Deployment

### Frontend (GitHub Pages)
1. Update the version in `package.json`
2. Run `npm run build`
3. Commit and push changes to the main branch
4. GitHub Actions will automatically deploy to GitHub Pages

### Backend (Render)
1. Push changes to the backend repository
2. Render will automatically deploy the new version

## Future Roadmap

1. **Machine Learning**: Enhance personalization with ML-based recommendations
2. **Wearable Integration**: Connect with fitness trackers and health devices
3. **Social Features**: Add community and sharing capabilities
4. **Meal Planning**: Implement comprehensive meal planning functionality
5. **Mobile App**: Develop native mobile applications
