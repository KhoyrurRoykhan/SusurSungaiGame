// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCU4qCMjW0pHxHyPRwwKwl6kdDRbXb4YdA",
  authDomain: "susursungai-a87c3.firebaseapp.com",
  projectId: "susursungai-a87c3",
  storageBucket: "susursungai-a87c3.firebasestorage.app",
  messagingSenderId: "278653768291",
  appId: "1:278653768291:web:05c7c7990c9e559cccde56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;