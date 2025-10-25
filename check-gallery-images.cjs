const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD3WJLpUPC8b77FXwJ7VFq9-vLOqD7ywm0",
  authDomain: "info-plat.firebaseapp.com",
  projectId: "info-plat",
  storageBucket: "info-plat.firebasestorage.app",
  messagingSenderId: "718337018423",
  appId: "1:718337018423:web:5ab9b7cc7c787c88f5c08c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkGallery() {
  try {
    console.log('🔍 Checking homepage-gallery collection...\n');
    
    const snapshot = await getDocs(collection(db, 'homepage-gallery'));
    
    console.log(`📊 Total documents: ${snapshot.size}\n`);
    
    if (snapshot.size === 0) {
      console.log('❌ No images found in homepage-gallery collection!');
      console.log('⚠️  This is why the gallery page is empty.');
      return;
    }
    
    let enabledCount = 0;
    let withCategory = 0;
    let withoutCategory = 0;
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📷 Image ${index + 1} (ID: ${doc.id})`);
      console.log(`   Title FR: ${data.titleFr || 'N/A'}`);
      console.log(`   Title AR: ${data.titleAr || 'N/A'}`);
      console.log(`   Image URL: ${data.imageUrl ? data.imageUrl.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   Category: ${data.category || '❌ MISSING'}`);
      console.log(`   Enabled: ${data.enabled !== undefined ? data.enabled : '❌ MISSING'}`);
      console.log(`   Order: ${data.order !== undefined ? data.order : 'N/A'}`);
      
      if (data.enabled) enabledCount++;
      if (data.category) withCategory++;
      else withoutCategory++;
    });
    
    console.log('\n\n📊 Summary:');
    console.log(`   Total images: ${snapshot.size}`);
    console.log(`   Enabled images: ${enabledCount}`);
    console.log(`   With category: ${withCategory}`);
    console.log(`   Without category: ${withoutCategory}`);
    
    if (enabledCount === 0) {
      console.log('\n❌ ISSUE: No enabled images!');
      console.log('   All images have enabled=false or missing enabled field.');
      console.log('   Solution: Set enabled=true in Firebase or admin panel.');
    }
    
    if (withoutCategory === snapshot.size) {
      console.log('\n⚠️  WARNING: No images have categories assigned.');
      console.log('   Filter will not work until categories are added.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkGallery();
