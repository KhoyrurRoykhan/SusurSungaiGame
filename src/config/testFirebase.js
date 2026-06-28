// src/utils/testFirebase.js
import { auth, db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    // Test Firestore
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('Firestore connected successfully!');
    return true;
  } catch (error) {
    console.error('Firestore connection error:', error);
    return false;
  }
};