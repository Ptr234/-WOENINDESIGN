// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_dCu_BKeN_IoPet5OOkSMnqcMEdFkYWA",
  authDomain: "womenindesign-46746.firebaseapp.com",
  projectId: "womenindesign-46746",
  storageBucket: "womenindesign-46746.firebasestorage.app",
  messagingSenderId: "1038959669293",
  appId: "1:1038959669293:web:095d4b6928fcff81ae88a4",
  measurementId: "G-W7LDJYHKSF"
};

// Initialize Firebase (avoid multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only on client side)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;