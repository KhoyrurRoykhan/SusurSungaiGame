// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { preloadSounds } from './utils/SoundManager';

// Preload sounds saat aplikasi dimulai
console.log('🔊 Preloading sounds...');
preloadSounds().then(() => {
  console.log('✅ All sounds preloaded successfully!');
}).catch(err => {
  console.error('❌ Error preloading sounds:', err);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);