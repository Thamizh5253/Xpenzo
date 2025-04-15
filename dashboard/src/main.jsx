import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css'; // Ensure this line exists
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
  position="top-center"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#fff',
      color: '#333',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      padding: '16px 24px',
      animation: 'fadeInOut 0.3s ease',
    },
  }}
/>
  </React.StrictMode>
);