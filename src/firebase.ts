import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase configuration with fallback values
// This ensures the app works even without environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBuaEOWCEYeV2AknrXhqzuTdIp0rApYPw0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "safebite-a5a03.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "safebite-a5a03",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "safebite-a5a03.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "203093821661",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:203093821661:web:127b2d80f7e08e6c23b334",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-P4KG3JTM4N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Auth

export { app, auth, analytics }; // Export auth
