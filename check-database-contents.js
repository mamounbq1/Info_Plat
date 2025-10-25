#!/usr/bin/env node

// Script to check what data exists in the Firebase database

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║              DATABASE CONTENTS CHECKER                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');
console.log('📊 Checking Firebase database contents...\n');

const collections = [
  'users', 'courses', 'quizzes', 'exercises', 'levels', 'branches', 
  'subjects', 'progress', 'userProgress', 'quizResults', 'exerciseResults',
  'notifications', 'settings', 'stats', 'courseStats', 'userStats',
  'systemStats', 'achievements', 'badges', 'leaderboard', 'announcements',
  'feedback', 'comments'
];

async function checkCollection(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const count = snapshot.size;
    
    if (count > 0) {
      console.log(`✅ ${collectionName.padEnd(20)} : ${count} documents`);
      
      // Show first few document IDs as sample
      if (count <= 3) {
        snapshot.docs.forEach(doc => {
          console.log(`   └─ ${doc.id}`);
        });
      } else {
        snapshot.docs.slice(0, 3).forEach(doc => {
          console.log(`   └─ ${doc.id}`);
        });
        console.log(`   └─ ... and ${count - 3} more`);
      }
    } else {
      console.log(`⚪ ${collectionName.padEnd(20)} : empty`);
    }
    
    return count;
  } catch (error) {
    console.log(`❌ ${collectionName.padEnd(20)} : Error - ${error.message}`);
    return 0;
  }
}

async function main() {
  let totalDocs = 0;
  let collectionsWithData = 0;
  
  for (const collectionName of collections) {
    const count = await checkCollection(collectionName);
    totalDocs += count;
    if (count > 0) collectionsWithData++;
  }
  
  console.log('\n───────────────────────────────────────────────────────────────');
  console.log(`📊 Summary:`);
  console.log(`   • Total collections checked: ${collections.length}`);
  console.log(`   • Collections with data: ${collectionsWithData}`);
  console.log(`   • Total documents: ${totalDocs}`);
  console.log('───────────────────────────────────────────────────────────────\n');
  
  if (totalDocs === 0) {
    console.log('✨ Database is empty!\n');
  } else {
    console.log(`⚠️  Database contains ${totalDocs} documents`);
    console.log('   Use delete-all-data scripts or Firebase Console to delete them.\n');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
