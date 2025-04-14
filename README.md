# SafeBite-V1

SafeBite is a **one-stop health and food safety platform** designed to provide nutritional insights, food safety metrics, and personalized recommendations. It integrates **multiple APIs, AI-driven suggestions, and real-time data tracking** to help users make healthier food choices.
Try now - https://aditya4232.github.io/SafeBite-V1/

## 🚀 Features

### 🔹 **Core Features**
- **Landing Page**: Minimalistic and aesthetic dark/light mode UI.
- **User Authentication**: Google Sign-in with Firebase.
- **Dashboard**: Personalized health tracking, analytics, and food insights.
- **AI/ML Integration**: Uses Gemini API for smart recommendations.
- **HealthBox**: All-in-one health calculators (BMI, calorie intake, macros, etc.).
- **Food Safety Metrics**: OpenFoodFacts API integration for food analysis.
- **Weekly Questions**: Interactive Q&A system to refine user preferences.
- **Community Forum**: Realtime chat and product discussions.
- **Scanner & Search**:
  - Mobile: Scan barcodes (OCR-based).
  - Web: Search by name or upload images.
- **Report & Analytics**: User and product insights with modern data visualizations.
- **Admin Panel**: (For Admin Only) Track user data and insights.

## 🛠️ Tech Stack
- **Frontend**: HTML, Tailwind CSS, JavaScript, ShadCN
- **Backend**:
  - Firebase (Auth, Firestore, Storage)
  - Flask (Python backend for MongoDB integration)
  - MongoDB Atlas (Product database)
- **Bundler**: Vite
- **APIs Used**:
  - MongoDB Atlas (Product database)
  - OpenFoodFacts (Food insights)
  - Edamam (Nutrition analysis)
  - FatSecret (Food tracking)
  - Gemini AI (Smart recommendations)

## 📂 Folder Structure
```
SafeBite-V1/
│── backend/           # Backend code
│   │── app.py         # Flask application
│   │── requirements.txt # Python dependencies
│   │── server.js      # Node.js server
│   │── routes/        # API routes
│   │── models/        # Database models
│── public/            # Static assets
│── src/               # Source code
│   │── components/    # Reusable UI components
│   │── pages/         # Individual pages (Dashboard, Profile, etc.)
│   │── services/      # API services and data fetching
│   │── utils/         # Helper functions
│   │── firebase.js    # Firebase configuration
│── .gitignore         # Ignore sensitive files
│── index.html         # Main entry point
│── package.json       # Dependencies & scripts
│── vite.config.js     # Vite configuration
```

## 📥 Installation & Setup

### 1️⃣ Clone Repository
```sh
git clone https://github.com/aditya4232/SafeBite-V1.git
cd SafeBite-V1
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Firebase
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google Sign-in) and **Firestore**.
3. Copy Firebase config to `src/firebase.js`.
4. Add GitHub Pages domain in Firebase Auth settings.

### 4️⃣ Set Up MongoDB Atlas
1. Create a MongoDB Atlas account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster and database named `safebite`.
3. Create a collection named `Grocery Products`.
4. Import your product data into the collection.
5. Create a database user with read/write access.
6. Update the connection string in `backend/app.py`.

### 5️⃣ Run Backend Server
```sh
cd backend
pip install -r requirements.txt
python app.py
```

### 6️⃣ Run Frontend Development Server
```sh
npm run dev
```

## 🌐 Deployment

### 🚀 Deploy Frontend on GitHub Pages
1. Update `vite.config.js`:
```js
export default defineConfig({
  base: '/SafeBite-V1/',
  plugins: [react()]
});
```
2. Commit changes & push:
```sh
git add .
git commit -m "Deploy fix"
git push origin main
```
3. Enable **GitHub Pages** under Repository Settings > Pages > Deploy from Branch.

### 🚀 Deploy Backend on Render
1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: safebite-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
   - **Environment Variables**:
     - `MONGODB_URI`: `mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite`
4. Click "Create Web Service".
5. Update the API base URL in `src/services/mongoDbService.ts` with your Render URL.

### 🚀 Deploy on Firebase Hosting
```sh
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## 🛠️ Troubleshooting

### Frontend Issues
- **Blank Page on GitHub Pages?**
  - Ensure `base: '/SafeBite-V1/'` is set in `vite.config.js`.
  - Clear cache & hard reload (`Ctrl + Shift + R`).
- **Firebase Login Not Working?**
  - Add `aditya4232.github.io` to Firebase **Authorized Domains**.

### Backend Issues
- **MongoDB Connection Failed?**
  - Check if your IP address is whitelisted in MongoDB Atlas.
  - Verify the connection string in `backend/app.py`.
  - Ensure the database user has the correct permissions.
- **Render Deployment Failed?**
  - Check the build logs for errors.
  - Ensure the Python version is compatible with your dependencies.
  - Verify that the `gunicorn` package is installed.
- **API Returning 404?**
  - Check if the collection name is correct (`Grocery Products`).
  - Ensure the database has data in the collection.
  - Verify the API endpoint URL in the frontend service.

## 📌 Future Enhancements
- **More Health Calculators** (Cholesterol, Sugar Intake, etc.)
- **Improved AI Recommendations** using Gemini
- **Personalized Meal Plans**
- **Real-time Nutrition Tracking** with wearable integrations
- **Enhanced MongoDB Integration**:
  - Full-text search with MongoDB Atlas Search
  - Advanced filtering and sorting options
  - Product recommendations based on user preferences
- **Expanded Product Database**:
  - More grocery products with detailed nutritional information
  - User-contributed product data
  - Regional food products and local specialties

---

🔹 **Created by:** Aditya Shenvi
🔹 **GitHub:** [@aditya4232](https://github.com/aditya4232)
🔹 **Version:** v2.5 (Production Ready)
