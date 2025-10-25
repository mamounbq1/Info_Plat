#!/usr/bin/env node

// ========================================
// COMPREHENSIVE DATA DELETION SCRIPT (Admin SDK)
// ========================================
// This script uses Firebase Admin SDK to DELETE ALL DATA from the database
// Including: Users, Courses, Quizzes, Exercises, Levels, Branches, Subjects, Progress, etc.
// 
// WARNING: THIS ACTION IS IRREVERSIBLE!
// 
// Usage: node delete-all-data-admin.js

import admin from 'firebase-admin';
import readline from 'readline';
import { readFileSync } from 'fs';

console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║   ⚠️  COMPREHENSIVE DATA DELETION SCRIPT (Admin SDK)  ⚠️     ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');

// Initialize Firebase Admin - Option 1: Service Account Key
let db;
let auth;

try {
  // Try to read service account key if available
  try {
    const serviceAccount = JSON.parse(
      readFileSync('./serviceAccountKey.json', 'utf8')
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'eduinfor-fff3d'
    });
    console.log('✅ Firebase Admin initialized with service account key');
  } catch (keyError) {
    // If no service account key, try using application default credentials
    console.log('ℹ️  No service account key found, using direct config...');
    
    // Use direct Firebase config (requires firestore.rules to be open)
    admin.initializeApp({
      projectId: 'eduinfor-fff3d',
      credential: admin.credential.applicationDefault()
    });
    console.log('✅ Firebase Admin initialized with default credentials');
  }
  
  db = admin.firestore();
  auth = admin.auth();
  console.log('✅ Connected to Firestore and Auth');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('');
  console.log('📝 To use this script, you need one of the following:');
  console.log('   1. Service Account Key (serviceAccountKey.json)');
  console.log('   2. GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.log('   3. Use the alternative deletion method below');
  console.log('');
  console.log('🔧 Alternative: Delete via Firebase Console:');
  console.log('   Go to: https://console.firebase.google.com/project/eduinfor-fff3d/firestore');
  console.log('   Manually delete each collection');
  console.log('');
  process.exit(1);
}

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
console.log('   • ALL other collections');
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
async function deleteCollection(collectionPath) {
  try {
    console.log(`\n   🗑️  Deleting collection: ${collectionPath}`);
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();
    
    if (snapshot.empty) {
      console.log(`   ℹ️  Collection ${collectionPath} is already empty`);
      return 0;
    }

    const totalDocs = snapshot.size;
    console.log(`   📊 Found ${totalDocs} documents to delete...`);

    // Use batched deletes for efficiency
    const batchSize = 500;
    let deletedCount = 0;

    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);

      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += batchDocs.length;
      console.log(`   ✅ Deleted ${deletedCount}/${totalDocs} documents...`);
    }

    console.log(`   ✅ Successfully deleted ${deletedCount} documents from ${collectionPath}`);
    return deletedCount;
  } catch (error) {
    console.error(`   ❌ Error deleting collection ${collectionPath}:`, error.message);
    return 0;
  }
}

// Function to recursively delete subcollections
async function deleteCollectionRecursive(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    return 0;
  }

  let deletedCount = 0;

  for (const doc of snapshot.docs) {
    // Check for subcollections
    const subcollections = await doc.ref.listCollections();
    
    for (const subcollection of subcollections) {
      console.log(`   📂 Found subcollection: ${subcollection.path}`);
      const subCount = await deleteCollectionRecursive(subcollection.path);
      deletedCount += subCount;
    }
  }

  // Delete the main collection
  const count = await deleteCollection(collectionPath);
  return deletedCount + count;
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
    // First, list all collections
    console.log('\n📂 Discovering all collections...');
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    
    console.log(`\n📂 Found ${collectionNames.length} root collections:`);
    collectionNames.forEach(name => console.log(`   - ${name}`));
    
    // Also include known collections that might not exist yet
    const allCollections = [...new Set([...collectionNames, ...COLLECTIONS_TO_DELETE])];
    console.log(`\n📂 Total collections to process: ${allCollections.length}`);

    // Delete each collection (including subcollections)
    for (const collectionName of allCollections) {
      const deletedCount = await deleteCollectionRecursive(collectionName);
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
    console.log('✨ Your Firestore database is now completely empty!');
    console.log('');
    console.log('📝 Note: Firebase Authentication users are NOT deleted by this script.');
    console.log('   To delete Authentication users, use the companion script or Firebase Console.');
    console.log('');

  } catch (error) {
    console.error('\n❌ Fatal error during deletion:', error);
    throw error;
  }
}

// Delete Authentication users
async function deleteAuthUsers() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔐 Deleting Firebase Authentication Users...');
  console.log('═══════════════════════════════════════════════════════════════');
  
  try {
    let deletedCount = 0;
    let pageToken;
    
    do {
      const listUsersResult = await auth.listUsers(1000, pageToken);
      
      if (listUsersResult.users.length === 0) {
        console.log('   ℹ️  No authentication users found');
        break;
      }
      
      console.log(`\n   📊 Found ${listUsersResult.users.length} users to delete...`);
      
      // Delete users in batches
      for (const user of listUsersResult.users) {
        try {
          await auth.deleteUser(user.uid);
          deletedCount++;
          console.log(`   ✅ Deleted user: ${user.email || user.uid} (${deletedCount})`);
        } catch (error) {
          console.error(`   ❌ Failed to delete user ${user.uid}:`, error.message);
        }
      }
      
      pageToken = listUsersResult.pageToken;
    } while (pageToken);
    
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log(`   🔐 Total auth users deleted: ${deletedCount}`);
    console.log('───────────────────────────────────────────────────────────────');
    
  } catch (error) {
    console.error('\n❌ Error deleting auth users:', error.message);
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

// Ask if user wants to delete auth users too
function askDeleteAuthUsers() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n🔐 Do you also want to delete ALL Firebase Authentication users? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
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
    
    // Delete all Firestore data
    await deleteAllData();
    
    // Ask if user wants to delete auth users
    const deleteAuth = await askDeleteAuthUsers();
    
    if (deleteAuth) {
      await deleteAuthUsers();
    } else {
      console.log('\n⏭️  Skipping authentication users deletion.');
    }
    
    console.log('\n✅ All requested deletions complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
