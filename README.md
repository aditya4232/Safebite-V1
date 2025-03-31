# SafeBite-V1

SafeBite is a **one-stop health and food safety platform** designed to provide nutritional insights, food safety metrics, and personalized recommendations. It integrates **multiple APIs, AI-driven suggestions, and real-time data tracking** to help users make healthier food choices.

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
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Bundler**: Vite
- **APIs Used**:
  - OpenFoodFacts (Food insights)
  - Edamam (Nutrition analysis)
  - FatSecret (Food tracking)
  - Gemini AI (Smart recommendations)

## 📂 Folder Structure
```
SafeBite-V1/
│── public/            # Static assets
│── src/               # Source code
│   │── components/    # Reusable UI components
│   │── pages/         # Individual pages (Dashboard, Profile, etc.)
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

### 4️⃣ Run Development Server
```sh
npm run dev
```

## 🌐 Deployment
### 🚀 Deploy on GitHub Pages
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

### 🚀 Deploy on Firebase Hosting
```sh
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## 🛠️ Troubleshooting
- **Blank Page on GitHub Pages?**
  - Ensure `base: '/SafeBite-V1/'` is set in `vite.config.js`.
  - Clear cache & hard reload (`Ctrl + Shift + R`).
- **Firebase Login Not Working?**
  - Add `aditya4232.github.io` to Firebase **Authorized Domains**.

## 📌 Future Enhancements
- **More Health Calculators** (Cholesterol, Sugar Intake, etc.)
- **Improved AI Recommendations** using Gemini
- **Personalized Meal Plans**
- **Real-time Nutrition Tracking** with wearable integrations

---

🔹 **Created by:** Aditya Shenvi  
🔹 **GitHub:** [@aditya4232] ( https://github.com/aditya4232 )  
🔹 **Version:** Beta (Under De
