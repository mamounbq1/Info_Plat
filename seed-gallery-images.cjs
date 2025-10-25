const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

const galleryImages = [
  {
    titleFr: "Campus principal",
    titleAr: "الحرم الرئيسي",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    category: "campus",
    enabled: true,
    order: 0
  },
  {
    titleFr: "Compétition sportive",
    titleAr: "مسابقة رياضية",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
    category: "sports",
    enabled: true,
    order: 1
  },
  {
    titleFr: "Laboratoire de sciences",
    titleAr: "مختبر العلوم",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    category: "facilities",
    enabled: true,
    order: 2
  },
  {
    titleFr: "Festival culturel",
    titleAr: "مهرجان ثقافي",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    category: "events",
    enabled: true,
    order: 3
  },
  {
    titleFr: "Cérémonie de remise des diplômes",
    titleAr: "حفل تخرج",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
    category: "ceremonies",
    enabled: true,
    order: 4
  },
  {
    titleFr: "Atelier d'arts",
    titleAr: "ورشة الفنون",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
    category: "activities",
    enabled: true,
    order: 5
  },
  {
    titleFr: "Salle de classe moderne",
    titleAr: "فصل دراسي حديث",
    imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800",
    category: "academic",
    enabled: true,
    order: 6
  },
  {
    titleFr: "Équipe de football",
    titleAr: "فريق كرة القدم",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
    category: "sports",
    enabled: true,
    order: 7
  },
  {
    titleFr: "Bibliothèque",
    titleAr: "المكتبة",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800",
    category: "facilities",
    enabled: true,
    order: 8
  },
  {
    titleFr: "Spectacle de fin d'année",
    titleAr: "عرض نهاية العام",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    category: "events",
    enabled: true,
    order: 9
  },
  {
    titleFr: "Club de robotique",
    titleAr: "نادي الروبوتات",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    category: "activities",
    enabled: true,
    order: 10
  },
  {
    titleFr: "Cours de sciences",
    titleAr: "درس العلوم",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    category: "academic",
    enabled: true,
    order: 11
  }
];

async function seedGallery() {
  try {
    console.log('🎨 Seeding Gallery Images with Categories...\n');
    
    // Check existing images
    const snapshot = await getDocs(collection(db, 'homepage-gallery'));
    console.log(`📊 Current images in database: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('\n⚠️  Warning: Gallery already has images.');
      console.log('   Do you want to DELETE all existing images and re-seed? (This script will proceed anyway)\n');
      
      // Delete existing images
      console.log('🗑️  Deleting existing images...');
      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, 'homepage-gallery', docSnapshot.id));
      }
      console.log('✅ Deleted all existing images\n');
    }
    
    // Add new images
    console.log('📸 Adding new gallery images with categories...\n');
    
    for (let i = 0; i < galleryImages.length; i++) {
      const image = galleryImages[i];
      await addDoc(collection(db, 'homepage-gallery'), {
        ...image,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Added: ${image.titleFr} (Category: ${image.category})`);
    }
    
    console.log(`\n✅ Successfully seeded ${galleryImages.length} gallery images!`);
    console.log('\n📊 Category distribution:');
    const categoryCount = {};
    galleryImages.forEach(img => {
      categoryCount[img.category] = (categoryCount[img.category] || 0) + 1;
    });
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} image(s)`);
    });
    
    console.log('\n🎉 Gallery page should now display images with working filters!');
    
  } catch (error) {
    console.error('❌ Error seeding gallery:', error);
  }
}

seedGallery();
