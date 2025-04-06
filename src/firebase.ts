import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuaEOWCEYeV2AknrXhqzuTdIp0rApYPw0",
  authDomain: "safebite-a5a03.firebaseapp.com",
  projectId: "safebite-a5a03",
  storageBucket: "safebite-a5a03.firebasestorage.app",
  messagingSenderId: "203093821661",
  appId: "1:203093821661:web:127b2d80f7e08e6c23b334",
  measurementId: "G-P4KG3JTM4N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };
