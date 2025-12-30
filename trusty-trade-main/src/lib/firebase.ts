import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration - these keys are public and safe to expose
const firebaseConfig = {
  apiKey: "AIzaSyBWCvbdg-nbRD8oLisFE2PF7M3Gksqr9o8",
  authDomain: "hackos-ac6b7.firebaseapp.com",
  projectId: "hackos-ac6b7",
  storageBucket: "hackos-ac6b7.firebasestorage.app",
  messagingSenderId: "187540749100",
  appId: "1:187540749100:web:69c204bd8facab52a4ca89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Export app for any additional configuration
export default app;