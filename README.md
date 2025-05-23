
# 🥗 SafeBite – Comprehensive Health & Nutrition Platform

**One-stop platform for smart, healthy food decisions powered by AI.**

<img width="947" alt="image" src="https://github.com/user-attachments/assets/93724a47-c4b1-4c93-897c-f32b55a3f2a9" />
 <!-- Add your banner image if you have one -->

🌐 **Live Demo:** [SafeBite Platform](https://aditya4232.github.io/SafeBite-V1/)
📦 **Repository:** [github.com/aditya4232/SafeBite-V1](https://github.com/aditya4232/SafeBite-V1)

---

## 🌟 Overview

**SafeBite** empowers users to make informed dietary choices through AI-driven food analysis, smart product search, and health tracking tools. It combines real-time grocery and restaurant data, personalized dashboards, and Gemini-powered recommendations in a sleek, mobile-optimized platform.

---

## ✨ Features

### 🔹 Core Platform

* **Personalized Dashboard** – Health stats, food tracking, and insights
* **Smart Grocery Search** – Real-time data from Blinkit, Zepto, Instamart, BigBasket
* **Food Delivery Integration** – Health-based restaurant suggestions and menus
* **Nutrition Analysis** – Breakdowns + healthier alternatives via Gemini AI
* **Recipe Recommendations** – Based on dietary preferences & goals
* **AI Nutrition Assistant** – Gemini AI-powered chatbot for food & health tips
* **Weekly Health Check-ins** – Adaptive questionnaires for habit tracking
* **Food Safety Metrics** – OpenFoodFacts integration for clean label data
* **HealthBox Tools** – BMI, calorie, and macro calculators
* **Scanner & Search** – Barcode/label scan on mobile + name/image search on web
* **Community Forum** – Real-time discussions and product feedback
* **Admin Panel** – Admin-only analytics and user data insights

---

## 📱 Mobile Optimization

* Touch-friendly UI with tap targets ≥ 44px
* Native-feel interactions for Android
* Optimized animations for reduced motion preferences
* Works across screen sizes seamlessly

---

## 🔒 Authentication & Session Management

* Google Auth with Firebase
* 3-hour sessions for signed-in users
* 1-hour sessions for guest mode
* Protected routes with auto-logout on tab close

---

## 🛠️ Technology Stack

### Frontend

* React 18 + TypeScript
* TailwindCSS & `shadcn/ui`
* Vite (build & bundling)
* React Router / React Query / Recharts
* Three.js (3D elements & UI flare)

### Backend

* Flask (Python)
* Express.js microservices
* MongoDB Atlas + Atlas Search
* Firebase (Auth, Firestore, Storage)
* BeautifulSoup (Web scraping)

### APIs & Integrations

* **Gemini AI** – AI recommendations & food analysis
* **CalorieNinja API** – Food nutrition data
* **FatSecret API** – Scanning & food insights
* **OpenFoodFacts API** – Safety & product insights

---

## 📋 Project Structure

```
📁 client/                # React frontend
📁 server/                # Flask + Express backend
📁 data/                  # Static datasets, scraping outputs
📁 assets/                # Banners, logos, UI assets
.env.example              # API keys template
README.md                 # You're here!
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js v16+
* MongoDB Atlas account
* Firebase Project
* Python 3.9+

### Setup Instructions

```bash
# Clone repo
git clone https://github.com/aditya4232/SafeBite-V1.git
cd SafeBite-V1

# Frontend setup
cd client
npm install
npm run dev

# Backend setup
cd ../server
pip install -r requirements.txt
python app.py
```

Create a `.env` file from `.env.example` with:

* Firebase credentials
* MongoDB URI
* Gemini/CalorieNinja/FatSecret/OpenFoodFacts API keys

---

## 🧪 Changelog Highlights

### 🆕 Version 2.5 (May 2025)

* ✅ Gemini AI integration for advanced nutrition analysis
* ✅ Location-based grocery scraping (Blinkit, Zepto, etc.)
* ✅ New food delivery modules with filtering options
* ✅ Responsive design overhaul (mobile-first)
* ✅ Admin dashboard with analytics
* ✅ Community discussion threads + forum

📖 **[Full Update Log »](#)** (Optional: link to a changelog.md)

---

## 🙌 Contributing

We welcome contributors!

```bash
# Fork & Clone
git checkout -b feature/your-feature-name
git commit -m "Added feature"
git push origin feature/your-feature-name
```

Then open a PR with a clear description of your feature/fix.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🙏 Acknowledgements

* React | TypeScript | Vite | Tailwind | Flask | MongoDB
* Firebase | Gemini AI | OpenFoodFacts | CalorieNinja
* Special thanks to open-source contributors everywhere ❤️

---
