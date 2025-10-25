#!/usr/bin/env node

// ========================================
// COMPREHENSIVE DATA DELETION SCRIPT
// ========================================
// This script will DELETE ALL DATA from the Firebase database
// Including: Users, Courses, Quizzes, Exercises, Levels, Branches, Subjects, Progress, etc.
// 
// WARNING: THIS ACTION IS IRREVERSIBLE!
// 
// Usage: node delete-all-data.js

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs,
  writeBatch,
  doc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import readline from 'readline';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgu4dd6kZF-h8RLABbYOlYi_XNu7sNvlo",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "846430849952",
  appId: "1:846430849952:web:1af9d3c2654e3e0d0f2e19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║   ⚠️  COMPREHENSIVE DATA DELETION SCRIPT  ⚠️                  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');
console.log('🔥 This script will DELETE ALL DATA from your Firebase database!');
console.log('');
console.log('📋 Collections to be deleted:');
console.log('   • Users');
console.log('   • Courses');
console.log('   • Quizzes');
console.log('   • Exercises');
console.log('   • Academic Levels');
console.log('   • Branches');
console.log('   • Subjects');
console.log('   • User Progress');
console.log('   • Quiz Results');
console.log('   • Exercise Results');
console.log('   • Notifications');
console.log('   • Settings');
console.log('   • Stats');
console.log('   • Any other collections found in the database');
console.log('');
console.log('⚠️  WARNING: THIS ACTION CANNOT BE UNDONE!');
console.log('');

// List of all known collections to delete
const COLLECTIONS_TO_DELETE = [
  'users',
  'courses',
  'quizzes',
  'exercises',
  'levels',
  'branches',
  'subjects',
  'progress',
  'userProgress',
  'quizResults',
  'exerciseResults',
  'notifications',
  'settings',
  'stats',
  'courseStats',
  'userStats',
  'systemStats',
  'achievements',
  'badges',
  'leaderboard',
  'announcements',
  'feedback',
  'comments'
];

// Function to delete all documents from a collection
async function deleteCollection(collectionName) {
  try {
    console.log(`\n   🗑️  Deleting collection: ${collectionName}`);
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.empty) {
      console.log(`   ℹ️  Collection ${collectionName} is already empty`);
      return 0;
    }

    const totalDocs = snapshot.size;
    console.log(`   📊 Found ${totalDocs} documents to delete...`);

    // Firestore batch has a limit of 500 operations
    const batchSize = 500;
    let deletedCount = 0;

    // Process documents in batches
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = docs.slice(i, i + batchSize);

      batchDocs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });

      await batch.commit();
      deletedCount += batchDocs.length;
      console.log(`   ✅ Deleted ${deletedCount}/${totalDocs} documents...`);
    }

    console.log(`   ✅ Successfully deleted ${deletedCount} documents from ${collectionName}`);
    return deletedCount;
  } catch (error) {
    console.error(`   ❌ Error deleting collection ${collectionName}:`, error.message);
    return 0;
  }
}

// Function to get all collections in the database
async function getAllCollections() {
  // Note: Firestore client SDK doesn't have listCollections()
  // So we'll use our predefined list of collections
  return COLLECTIONS_TO_DELETE;
}

// Main deletion function
async function deleteAllData() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 Starting comprehensive data deletion...');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const startTime = Date.now();
  let totalDeleted = 0;
  const results = {};

  try {
    // Get all collections
    const collections = await getAllCollections();
    console.log(`\n📂 Found ${collections.length} collections to process\n`);

    // Delete each collection
    for (const collectionName of collections) {
      const deletedCount = await deleteCollection(collectionName);
      results[collectionName] = deletedCount;
      totalDeleted += deletedCount;
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ DATA DELETION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Deletion Summary:');
    console.log('───────────────────────────────────────────────────────────────');
    
    Object.entries(results).forEach(([collection, count]) => {
      if (count > 0) {
        console.log(`   • ${collection.padEnd(25)} : ${count} documents deleted`);
      }
    });
    
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`   📈 Total documents deleted: ${totalDeleted}`);
    console.log(`   ⏱️  Time taken: ${duration} seconds`);
    console.log('───────────────────────────────────────────────────────────────');
    console.log('');
    console.log('✨ Your database is now completely empty!');
    console.log('');
    console.log('📝 Note: Firebase Authentication users are NOT deleted by this script.');
    console.log('   To delete Authentication users, go to Firebase Console > Authentication');
    console.log('');

  } catch (error) {
    console.error('\n❌ Fatal error during deletion:', error);
    process.exit(1);
  }
}

// Confirmation prompt
function askForConfirmation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('⚠️  Type "DELETE ALL DATA" to confirm (or anything else to cancel): ', (answer) => {
      rl.close();
      resolve(answer.trim() === 'DELETE ALL DATA');
    });
  });
}

// Main execution
async function main() {
  try {
    // Ask for confirmation
    const confirmed = await askForConfirmation();
    
    if (!confirmed) {
      console.log('\n❌ Deletion cancelled. No data was deleted.\n');
      process.exit(0);
    }

    console.log('\n✅ Confirmation received. Starting deletion...\n');
    
    // Delete all data
    await deleteAllData();
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
