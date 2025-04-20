import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create a performance measurement for initial load
performance.mark('app-start');

// Create root and render app
const root = createRoot(document.getElementById("root")!);

// Use a callback to measure when the app is rendered
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure performance after render
window.addEventListener('load', () => {
  performance.mark('app-loaded');
  performance.measure('app-render-time', 'app-start', 'app-loaded');

  // Log performance metrics
  const perfEntries = performance.getEntriesByType('measure');
  perfEntries.forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
  });
});
