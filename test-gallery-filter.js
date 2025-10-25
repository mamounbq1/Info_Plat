#!/usr/bin/env node

/**
 * Test script to check if Gallery filtering works
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

async function testGalleryFilter() {
  console.log('\n🔍 Testing Gallery Page Filter...\n');
  
  try {
    // Fetch all gallery images
    const galleryRef = collection(db, 'homepage-gallery');
    const galleryQuery = query(galleryRef, where('enabled', '==', true));
    const gallerySnapshot = await getDocs(galleryQuery);
    
    console.log(`📊 Total enabled gallery images: ${gallerySnapshot.size}\n`);
    
    if (gallerySnapshot.empty) {
      console.log('⚠️  No gallery images found in database');
      console.log('❌ FILTER TEST: FAILED - No data to test\n');
      return;
    }
    
    // Analyze data structure
    let imagesWithCategory = 0;
    let imagesWithoutCategory = 0;
    const categoriesFound = new Set();
    
    gallerySnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`\n🖼️  Image: ${doc.id}`);
      console.log(`   Caption (FR): ${data.captionFr || data.titleFr || 'N/A'}`);
      console.log(`   Caption (AR): ${data.captionAr || data.titleAr || 'N/A'}`);
      console.log(`   Category: ${data.category || '❌ MISSING'}`);
      console.log(`   URL: ${data.url || data.imageUrl || 'N/A'}`);
      console.log(`   Enabled: ${data.enabled}`);
      console.log(`   Order: ${data.order || 'N/A'}`);
      
      if (data.category) {
        imagesWithCategory++;
        categoriesFound.add(data.category);
      } else {
        imagesWithoutCategory++;
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Images WITH category field: ${imagesWithCategory}`);
    console.log(`❌ Images WITHOUT category field: ${imagesWithoutCategory}`);
    console.log(`📋 Categories found: ${Array.from(categoriesFound).join(', ') || 'None'}`);
    console.log('='.repeat(60));
    
    // Expected categories from GalleryPage.jsx
    const expectedCategories = ['events', 'campus', 'sports', 'activities', 'ceremonies'];
    console.log(`\n📝 Expected categories in code: ${expectedCategories.join(', ')}`);
    
    // Compare
    const foundCategoriesArray = Array.from(categoriesFound);
    const unmatchedFirebase = foundCategoriesArray.filter(cat => !expectedCategories.includes(cat));
    const missingInFirebase = expectedCategories.filter(cat => !foundCategoriesArray.includes(cat));
    
    console.log('\n🧪 FILTER TEST RESULTS:\n');
    
    if (imagesWithoutCategory > 0) {
      console.log('❌ FILTER WILL NOT WORK PROPERLY');
      console.log(`   Reason: ${imagesWithoutCategory} image(s) missing "category" field`);
      console.log('   Solution: Either add category field to all images OR remove filter\n');
      return false;
    }
    
    if (unmatchedFirebase.length > 0) {
      console.log('⚠️  WARNING: Category mismatch detected');
      console.log(`   Categories in Firebase NOT in code: ${unmatchedFirebase.join(', ')}`);
      console.log('   Solution: Update GalleryPage.jsx categories to match Firebase data\n');
      return false;
    }
    
    if (missingInFirebase.length > 0) {
      console.log('⚠️  INFO: Some categories in code have no images');
      console.log(`   Categories in code with NO images: ${missingInFirebase.join(', ')}`);
      console.log('   This is OK - just means no images in those categories yet\n');
    }
    
    console.log('✅ FILTER SHOULD WORK');
    console.log('   All images have "category" field');
    console.log(`   Categories match: ${foundCategoriesArray.join(', ')}\n`);
    return true;
    
  } catch (error) {
    console.error('\n❌ Error testing gallery filter:', error);
    return false;
  }
}

testGalleryFilter().then(success => {
  process.exit(success ? 0 : 1);
});
