// Comprehensive Database Seeding Script - Clears and Refills ALL Collections
// Usage: node comprehensive-seed.js

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDocs,
  deleteDoc,
  writeBatch 
} from 'firebase/firestore';

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

// Clear collection utility
async function clearCollection(collectionName) {
  console.log(`   🗑️  Clearing ${collectionName}...`);
  const snapshot = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  let count = 0;
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
  }
  console.log(`   ✅ Deleted ${count} documents from ${collectionName}`);
}

// Data definitions (truncated for brevity - see full script)
const data = {
  homepage: {
    hero: {
      titleFr: "Bienvenue au Lycée d'Excellence",
      titleAr: "مرحبا بكم في الثانوية المتميزة",
      subtitleFr: "Former les leaders de demain avec excellence académique et valeurs humaines",
      subtitleAr: "تكوين قادة الغد بالتميز الأكاديمي والقيم الإنسانية",
      buttonText1Fr: "Inscription en ligne",
      buttonText1Ar: "التسجيل عبر الإنترنت",
      buttonText2Fr: "Découvrir nos programmes",
      buttonText2Ar: "اكتشف برامجنا",
      backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920",
      enabled: true,
      updatedAt: new Date().toISOString()
    },
    stats: {
      students: 1250,
      teachers: 85,
      successRate: 98,
      years: 45,
      updatedAt: new Date().toISOString()
    }
  }
};

async function comprehensiveSeed() {
  console.log("\\n🚀 COMPREHENSIVE DATABASE SEEDING STARTED\\n");
  
  try {
    // Clear collections
    const collections = [
      'homepage-features', 'homepage-news', 'homepage-testimonials',
      'homepage-announcements', 'homepage-clubs', 'homepage-gallery',
      'homepage-quicklinks', 'academicLevels', 'branches', 'subjects',
      'courses', 'exercises', 'quizzes', 'notifications'
    ];
    
    console.log("📦 Clearing collections...\\n");
    for (const coll of collections) {
      await clearCollection(coll);
    }
    
    console.log("\\n✅ Database cleared and ready for seeding!\\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

comprehensiveSeed();
