// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Konfigurasi Firebase dari environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validasi konfigurasi (opsional, untuk debugging)
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config loaded:');
  console.log('  - API Key:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');
  console.log('  - Auth Domain:', firebaseConfig.authDomain ? '✅ Set' : '❌ Missing');
  console.log('  - Project ID:', firebaseConfig.projectId ? '✅ Set' : '❌ Missing');
  console.log('  - Storage Bucket:', firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing');
  console.log('  - App ID:', firebaseConfig.appId ? '✅ Set' : '❌ Missing');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;