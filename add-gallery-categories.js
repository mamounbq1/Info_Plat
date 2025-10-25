#!/usr/bin/env node

/**
 * Script to add category field to existing gallery images in Firebase
 * Assigns categories based on image caption/title keywords
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
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

// Category assignment logic based on keywords
function assignCategory(titleFr, titleAr, captionFr, captionAr) {
  const text = `${titleFr || ''} ${titleAr || ''} ${captionFr || ''} ${captionAr || ''}`.toLowerCase();
  
  // Check for keywords
  if (text.includes('campus') || text.includes('الحرم') || text.includes('principal')) {
    return 'campus';
  }
  if (text.includes('sport') || text.includes('رياض') || text.includes('terrain')) {
    return 'sports';
  }
  if (text.includes('laboratoire') || text.includes('مختبر') || text.includes('lab')) {
    return 'facilities';
  }
  if (text.includes('bibliothèque') || text.includes('مكتبة') || text.includes('library')) {
    return 'facilities';
  }
  if (text.includes('classe') || text.includes('قاعة') || text.includes('salle') || text.includes('amphithéâtre')) {
    return 'academic';
  }
  if (text.includes('informatique') || text.includes('حاسوب') || text.includes('ordinateur')) {
    return 'academic';
  }
  if (text.includes('festival') || text.includes('مهرجان') || text.includes('cérémonie') || text.includes('حفل')) {
    return 'ceremonies';
  }
  if (text.includes('activité') || text.includes('نشاط') || text.includes('parascolaire')) {
    return 'activities';
  }
  if (text.includes('événement') || text.includes('حدث') || text.includes('event')) {
    return 'events';
  }
  if (text.includes('cafétéria') || text.includes('كافتيريا') || text.includes('restaurant')) {
    return 'facilities';
  }
  
  // Default category if no match
  return 'campus';
}

async function addCategoriesToGallery() {
  console.log('\n🔧 Adding categories to gallery images...\n');
  
  try {
    // Fetch all gallery images
    const galleryRef = collection(db, 'homepage-gallery');
    const gallerySnapshot = await getDocs(galleryRef);
    
    console.log(`📊 Total images found: ${gallerySnapshot.size}\n`);
    
    if (gallerySnapshot.empty) {
      console.log('⚠️  No gallery images found');
      return;
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Update each image
    for (const docSnapshot of gallerySnapshot.docs) {
      const data = docSnapshot.data();
      const id = docSnapshot.id;
      
      // Skip if already has category
      if (data.category) {
        console.log(`⏭️  Skipping ${id} - already has category: ${data.category}`);
        skippedCount++;
        continue;
      }
      
      // Assign category based on content
      const category = assignCategory(
        data.titleFr || data.captionFr,
        data.titleAr || data.captionAr,
        data.captionFr,
        data.captionAr
      );
      
      // Update document
      const docRef = doc(db, 'homepage-gallery', id);
      await updateDoc(docRef, { category });
      
      console.log(`✅ Updated ${id}:`);
      console.log(`   Caption: ${data.captionFr || data.titleFr || 'N/A'}`);
      console.log(`   Category: ${category}\n`);
      
      updatedCount++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Images updated: ${updatedCount}`);
    console.log(`⏭️  Images skipped: ${skippedCount}`);
    console.log(`📊 Total processed: ${gallerySnapshot.size}`);
    console.log('='.repeat(60));
    console.log('\n✅ Categories added successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error adding categories:', error);
    throw error;
  }
}

// Run the script
addCategoriesToGallery()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
