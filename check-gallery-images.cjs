#!/usr/bin/env node

/**
 * CHECK GALLERY IMAGES - Diagnostic Script
 * 
 * This script checks the gallery images in Firestore
 * to diagnose why they're not appearing on the landing page and gallery page.
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkGalleryImages() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CHECKING GALLERY IMAGES IN FIRESTORE');
  console.log('='.repeat(80) + '\n');

  try {
    // Fetch all images from homepage-gallery collection
    const gallerySnapshot = await db.collection('homepage-gallery').get();
    
    console.log(`📊 Total images in collection: ${gallerySnapshot.size}\n`);
    
    if (gallerySnapshot.empty) {
      console.log('❌ No images found in homepage-gallery collection!');
      console.log('   Please add images via Admin Dashboard → Gallery Manager\n');
      return;
    }

    // Analyze each image
    let enabledCount = 0;
    let disabledCount = 0;
    let missingEnabledField = 0;

    console.log('📋 IMAGE DETAILS:\n');
    console.log('─'.repeat(80));
    
    gallerySnapshot.forEach((doc, index) => {
      const data = doc.data();
      const isEnabled = data.enabled === true;
      const hasEnabledField = 'enabled' in data;
      
      if (isEnabled) enabledCount++;
      else if (hasEnabledField) disabledCount++;
      else missingEnabledField++;

      // Display image info
      console.log(`\n${index + 1}. Image ID: ${doc.id}`);
      console.log(`   Title (FR): ${data.titleFr || '(empty)'}`);
      console.log(`   Title (AR): ${data.titleAr || '(empty)'}`);
      console.log(`   Image URL: ${data.imageUrl ? data.imageUrl.substring(0, 60) + '...' : '(missing)'}`);
      console.log(`   Category: ${data.category || '(not set)'}`);
      console.log(`   Order: ${data.order !== undefined ? data.order : '(not set)'}`);
      
      if (hasEnabledField) {
        console.log(`   ✅ Enabled: ${isEnabled ? '✅ YES' : '❌ NO'}`);
      } else {
        console.log(`   ⚠️  Enabled: ⚠️  MISSING (defaults to undefined)`);
      }
      
      console.log('─'.repeat(80));
    });

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Images with enabled=true: ${enabledCount}`);
    console.log(`❌ Images with enabled=false: ${disabledCount}`);
    console.log(`⚠️  Images with missing 'enabled' field: ${missingEnabledField}`);
    console.log('='.repeat(80) + '\n');

    // Diagnosis
    console.log('🔍 DIAGNOSIS:\n');
    
    if (enabledCount === 0) {
      console.log('❌ PROBLEM FOUND: No images have enabled=true!');
      console.log('\n💡 SOLUTION: You need to enable the images.');
      console.log('   Option 1: Edit each image in Gallery Manager and check "Activé" checkbox');
      console.log('   Option 2: Run the fix script (see below)\n');
    } else if (enabledCount > 0 && (disabledCount > 0 || missingEnabledField > 0)) {
      console.log('⚠️  PARTIAL ISSUE: Some images are disabled or missing enabled field.');
      console.log(`   ${enabledCount} image(s) should be visible on the site.`);
      console.log(`   ${disabledCount + missingEnabledField} image(s) are hidden.\n`);
    } else {
      console.log('✅ ALL IMAGES ARE ENABLED!');
      console.log('   If images are still not showing, check:');
      console.log('   1. Browser cache (Ctrl+Shift+R to hard refresh)');
      console.log('   2. Browser console for errors (F12)');
      console.log('   3. Firebase Storage CORS errors\n');
    }

    // Offer fix
    if (missingEnabledField > 0 || disabledCount > 0) {
      console.log('─'.repeat(80));
      console.log('🛠️  FIX SCRIPT AVAILABLE');
      console.log('─'.repeat(80));
      console.log('To automatically enable all images, run:');
      console.log('   node fix-gallery-enabled.cjs\n');
    }

  } catch (error) {
    console.error('❌ Error checking gallery images:', error);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkGalleryImages();
