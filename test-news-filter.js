#!/usr/bin/env node

/**
 * Test script to check if News filtering works
 * Checks the Firebase data structure for category field
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testNewsFilter() {
  console.log('\n🔍 Testing News Page Filter...\n');
  
  try {
    // Fetch all news articles
    const newsRef = collection(db, 'homepage-news');
    const newsQuery = query(newsRef, where('enabled', '==', true));
    const newsSnapshot = await getDocs(newsQuery);
    
    console.log(`📊 Total enabled news articles: ${newsSnapshot.size}\n`);
    
    if (newsSnapshot.empty) {
      console.log('⚠️  No news articles found in database');
      console.log('❌ FILTER TEST: FAILED - No data to test\n');
      return;
    }
    
    // Analyze data structure
    let articlesWithCategory = 0;
    let articlesWithoutCategory = 0;
    const categoriesFound = new Set();
    
    newsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`\n📰 Article: ${doc.id}`);
      console.log(`   Title (FR): ${data.titleFr || 'N/A'}`);
      console.log(`   Title (AR): ${data.titleAr || 'N/A'}`);
      console.log(`   Category: ${data.category || '❌ MISSING'}`);
      console.log(`   Date: ${data.date || 'N/A'}`);
      console.log(`   Enabled: ${data.enabled}`);
      
      if (data.category) {
        articlesWithCategory++;
        categoriesFound.add(data.category);
      } else {
        articlesWithoutCategory++;
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Articles WITH category field: ${articlesWithCategory}`);
    console.log(`❌ Articles WITHOUT category field: ${articlesWithoutCategory}`);
    console.log(`📋 Categories found: ${Array.from(categoriesFound).join(', ') || 'None'}`);
    console.log('='.repeat(60));
    
    // Test conclusion
    console.log('\n🧪 FILTER TEST RESULTS:\n');
    
    if (articlesWithoutCategory > 0) {
      console.log('❌ FILTER WILL NOT WORK PROPERLY');
      console.log(`   Reason: ${articlesWithoutCategory} article(s) missing "category" field`);
      console.log('   Solution: Either add category field to all articles OR remove filter\n');
      return false;
    } else {
      console.log('✅ FILTER SHOULD WORK');
      console.log('   All articles have "category" field');
      console.log(`   Categories available: ${Array.from(categoriesFound).join(', ')}\n`);
      return true;
    }
    
  } catch (error) {
    console.error('\n❌ Error testing news filter:', error);
    return false;
  }
}

testNewsFilter().then(success => {
  process.exit(success ? 0 : 1);
});
