import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Set default timezone and locale for the application
if (typeof global !== 'undefined') {
  // Node.js environment
  process.env.TZ = 'Asia/Kolkata';
} else {
  // Browser environment - Set default timezone preference
  try {
    // Try to set timezone preference for Intl API
    if (Intl && Intl.DateTimeFormat) {
      // Override default timezone for all date operations
      const originalToLocaleString = Date.prototype.toLocaleString;
      const originalToLocaleDateString = Date.prototype.toLocaleDateString;
      const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
      
      Date.prototype.toLocaleString = function(locale = 'en-IN', options = {}) {
        if (!options.timeZone) {
          options.timeZone = 'Asia/Kolkata';
        }
        return originalToLocaleString.call(this, locale, options);
      };
      
      Date.prototype.toLocaleDateString = function(locale = 'en-IN', options = {}) {
        if (!options.timeZone) {
          options.timeZone = 'Asia/Kolkata';
        }
        return originalToLocaleDateString.call(this, locale, options);
      };
      
      Date.prototype.toLocaleTimeString = function(locale = 'en-IN', options = {}) {
        if (!options.timeZone) {
          options.timeZone = 'Asia/Kolkata';
        }
        return originalToLocaleTimeString.call(this, locale, options);
      };
    }
  } catch (error) {
    console.warn('Could not set default timezone:', error);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
