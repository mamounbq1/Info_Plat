#!/usr/bin/env node

/**
 * FIX GALLERY ENABLED - Auto-fix Script
 * 
 * This script automatically sets enabled=true for all gallery images
 * that are missing the enabled field or have it set to false.
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixGalleryImages() {
  console.log('\n' + '='.repeat(80));
  console.log('🛠️  FIX GALLERY IMAGES - AUTO ENABLE');
  console.log('='.repeat(80) + '\n');

  try {
    // Fetch all images
    const gallerySnapshot = await db.collection('homepage-gallery').get();
    
    if (gallerySnapshot.empty) {
      console.log('❌ No images found in homepage-gallery collection!');
      return;
    }

    console.log(`📊 Found ${gallerySnapshot.size} images\n`);
    console.log('🔧 Processing images...\n');

    let enabledCount = 0;
    let alreadyEnabledCount = 0;
    let errors = 0;

    // Process each image
    for (const doc of gallerySnapshot.docs) {
      const data = doc.data();
      const isEnabled = data.enabled === true;

      if (isEnabled) {
        console.log(`✅ ${doc.id}: Already enabled, skipping`);
        alreadyEnabledCount++;
      } else {
        try {
          await db.collection('homepage-gallery').doc(doc.id).update({
            enabled: true,
            updatedAt: new Date().toISOString()
          });
          console.log(`✅ ${doc.id}: Enabled successfully!`);
          enabledCount++;
        } catch (error) {
          console.error(`❌ ${doc.id}: Failed to enable - ${error.message}`);
          errors++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Images enabled: ${enabledCount}`);
    console.log(`⏭️  Already enabled: ${alreadyEnabledCount}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(80) + '\n');

    if (enabledCount > 0) {
      console.log('🎉 SUCCESS! Your gallery images should now be visible!');
      console.log('\n📝 Next steps:');
      console.log('   1. Open your site in browser');
      console.log('   2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');
      console.log('   3. Check landing page gallery section');
      console.log('   4. Check /gallery page\n');
    } else if (alreadyEnabledCount > 0) {
      console.log('ℹ️  All images were already enabled.');
      console.log('\n🔍 If images still not showing, check:');
      console.log('   1. Browser cache (hard refresh)');
      console.log('   2. Browser console (F12) for errors');
      console.log('   3. Firebase Storage CORS settings\n');
    }

  } catch (error) {
    console.error('❌ Error fixing gallery images:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixGalleryImages();
