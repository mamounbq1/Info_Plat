// Utility script to create user profiles in Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// User profiles to create
const usersToCreate = [
  {
    uid: 'dbt1SnmRoHQJqWU8LpeWlvl4R0W2',
    email: 'teacher@example.com', // Update with actual email
    fullName: 'Teacher User',
    role: 'admin', // This makes them a teacher
    createdAt: new Date().toISOString(),
    progress: {},
    enrolledCourses: []
  },
  {
    uid: 'LWEXbr9LI8TadxhY9SwRbn2xqHA2',
    email: 'student@example.com', // Update with actual email
    fullName: 'Student User',
    role: 'student',
    createdAt: new Date().toISOString(),
    progress: {},
    enrolledCourses: []
  }
];

async function createUserProfiles() {
  console.log('Creating user profiles in Firestore...\n');
  
  for (const user of usersToCreate) {
    try {
      // Check if profile already exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log(`✅ Profile already exists for ${user.email}`);
      } else {
        // Create the profile
        await setDoc(docRef, user);
        console.log(`✅ Created profile for ${user.email} (role: ${user.role})`);
      }
    } catch (error) {
      console.error(`❌ Error creating profile for ${user.email}:`, error);
    }
  }
  
  console.log('\n✅ Done!');
  process.exit(0);
}

createUserProfiles();
