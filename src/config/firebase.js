import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check if Firebase is properly configured
export const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
                                     import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key" &&
                                     import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_API_KEY";

// Firebase configuration using environment variables
// Configure these in your .env file (see .env.example)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if configured
let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured!');
  console.warn('📝 Create a .env file with your Firebase credentials');
  console.warn('📖 See QUICKSTART.md or the setup screen for instructions');
}

export { auth, db, storage };
export default app;
