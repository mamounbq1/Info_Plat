#!/usr/bin/env node

// Simple deletion script using Firebase Client SDK
// Works with open Firestore rules

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgu4dd6kZF-h8RLABbYOlYi_XNu7sNvlo",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "846430849952",
  appId: "1:846430849952:web:1af9d3c2654e3e0d0f2e19"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Starting data deletion...\n');

const collections = [
  'users', 'courses', 'quizzes', 'exercises', 'levels', 'branches', 
  'subjects', 'progress', 'userProgress', 'quizResults', 'exerciseResults',
  'notifications', 'settings', 'stats', 'courseStats', 'userStats',
  'systemStats', 'achievements', 'badges', 'leaderboard', 'announcements',
  'feedback', 'comments'
];

async function deleteCollection(collectionName) {
  try {
    console.log(`📂 Deleting ${collectionName}...`);
    const snapshot = await getDocs(collection(db, collectionName));
    
    if (snapshot.empty) {
      console.log(`   ✅ ${collectionName} is already empty`);
      return 0;
    }

    let count = 0;
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, collectionName, docSnapshot.id));
      count++;
      if (count % 10 === 0) {
        console.log(`   Deleted ${count}/${snapshot.size}...`);
      }
    }
    
    console.log(`   ✅ Deleted ${count} documents from ${collectionName}`);
    return count;
  } catch (error) {
    console.error(`   ❌ Error deleting ${collectionName}:`, error.message);
    return 0;
  }
}

async function main() {
  let totalDeleted = 0;
  
  for (const collectionName of collections) {
    const deleted = await deleteCollection(collectionName);
    totalDeleted += deleted;
  }
  
  console.log(`\n✅ COMPLETE! Deleted ${totalDeleted} total documents`);
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
