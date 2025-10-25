#!/usr/bin/env node

/**
 * Fix User Profile Script
 * 
 * This script creates/updates a user profile in Firestore
 * for users who are authenticated but missing their profile.
 * 
 * Usage: node fix-user-profile.js <uid> <email> <fullName> <role>
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get command line arguments
const [, , uid, email, fullName, role] = process.argv;

async function fixUserProfile() {
  // Validate arguments
  if (!uid) {
    console.error('❌ Error: UID is required');
    console.log('\nUsage: node fix-user-profile.js <uid> <email> <fullName> <role>');
    console.log('Example: node fix-user-profile.js 8CTIocjk7BasE6afkpkPcYCMn1H2 user@example.com "John Doe" student');
    process.exit(1);
  }

  console.log('\n🔧 Fixing user profile...\n');
  console.log('UID:', uid);
  console.log('Email:', email || 'Will use existing or prompt');
  console.log('Name:', fullName || 'Will use existing or default');
  console.log('Role:', role || 'student (default)');
  console.log();

  try {
    // Check if profile exists
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('📄 Existing profile found:');
      console.log(JSON.stringify(docSnap.data(), null, 2));
      console.log();
      
      const shouldUpdate = true; // You can add prompt here if needed
      
      if (shouldUpdate) {
        // Update existing profile
        const updates = {
          email: email || docSnap.data().email,
          fullName: fullName || docSnap.data().fullName,
          role: role || docSnap.data().role || 'student',
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(docRef, updates, { merge: true });
        console.log('✅ Profile updated successfully!');
        console.log('Updated fields:', updates);
      }
    } else {
      console.log('📝 No existing profile found. Creating new profile...');
      
      // Create new profile
      const newProfile = {
        email: email || 'user@example.com',
        fullName: fullName || 'User',
        role: role || 'student',
        approved: role === 'admin' || role === 'teacher' ? true : false,
        status: role === 'admin' || role === 'teacher' ? 'active' : 'pending',
        createdAt: new Date().toISOString(),
        progress: {},
        enrolledCourses: [],
        emailVerified: false
      };

      await setDoc(docRef, newProfile);
      console.log('✅ Profile created successfully!');
      console.log('Profile data:', JSON.stringify(newProfile, null, 2));
    }

    console.log('\n🎉 Done! User can now access the dashboard.');
    console.log('The redirect loop should be fixed.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixUserProfile();
