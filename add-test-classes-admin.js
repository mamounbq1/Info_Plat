#!/usr/bin/env node

/**
 * Script to add test classes to Firestore (Admin Authenticated)
 * Tests if classes created by admin appear in signup form
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhp2UOv8m9y0ZW1XFRw4nBt-n-l9guedc",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "960025808439",
  appId: "1:960025808439:web:5aad744488b9a855da79b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin credentials
const ADMIN_EMAIL = 'superadmin@eduplatform.ma';
const ADMIN_PASSWORD = 'SuperAdmin@2025!Secure';

// Test classes data - Moroccan Lycée structure
const testClasses = [
  // 2BAC Sciences (2ème Bac Sciences)
  {
    code: '2BAC-SC-1',
    nameFr: '2ème Bac Sciences - Classe 1',
    nameAr: 'الثانية باكالوريا علوم - القسم 1',
    levelCode: '2BAC',
    branchCode: 'SC',
    enabled: true,
    order: 1
  },
  {
    code: '2BAC-SC-2',
    nameFr: '2ème Bac Sciences - Classe 2',
    nameAr: 'الثانية باكالوريا علوم - القسم 2',
    levelCode: '2BAC',
    branchCode: 'SC',
    enabled: true,
    order: 2
  },
  
  // 2BAC Maths (2ème Bac Mathématiques)
  {
    code: '2BAC-MATH-1',
    nameFr: '2ème Bac Mathématiques - Classe 1',
    nameAr: 'الثانية باكالوريا رياضيات - القسم 1',
    levelCode: '2BAC',
    branchCode: 'MATH',
    enabled: true,
    order: 1
  },
  {
    code: '2BAC-MATH-2',
    nameFr: '2ème Bac Mathématiques - Classe 2',
    nameAr: 'الثانية باكالوريا رياضيات - القسم 2',
    levelCode: '2BAC',
    branchCode: 'MATH',
    enabled: true,
    order: 2
  },
  
  // 1BAC Sciences (1ère Bac Sciences)
  {
    code: '1BAC-SC-1',
    nameFr: '1ère Bac Sciences - Classe 1',
    nameAr: 'الأولى باكالوريا علوم - القسم 1',
    levelCode: '1BAC',
    branchCode: 'SC',
    enabled: true,
    order: 1
  },
  {
    code: '1BAC-SC-2',
    nameFr: '1ère Bac Sciences - Classe 2',
    nameAr: 'الأولى باكالوريا علوم - القسم 2',
    levelCode: '1BAC',
    branchCode: 'SC',
    enabled: true,
    order: 2
  },
  
  // 1BAC Maths (1ère Bac Mathématiques)
  {
    code: '1BAC-MATH-1',
    nameFr: '1ère Bac Mathématiques - Classe 1',
    nameAr: 'الأولى باكالوريا رياضيات - القسم 1',
    levelCode: '1BAC',
    branchCode: 'MATH',
    enabled: true,
    order: 1
  },
  {
    code: '1BAC-MATH-2',
    nameFr: '1ère Bac Mathématiques - Classe 2',
    nameAr: 'الأولى باكالوريا رياضيات - القسم 2',
    levelCode: '1BAC',
    branchCode: 'MATH',
    enabled: true,
    order: 2
  },
  
  // TC (Tronc Commun Sciences)
  {
    code: 'TC-SC-1',
    nameFr: 'Tronc Commun Sciences - Classe 1',
    nameAr: 'الجذع المشترك علوم - القسم 1',
    levelCode: 'TC',
    branchCode: 'SC',
    enabled: true,
    order: 1
  },
  {
    code: 'TC-SC-2',
    nameFr: 'Tronc Commun Sciences - Classe 2',
    nameAr: 'الجذع المشترك علوم - القسم 2',
    levelCode: 'TC',
    branchCode: 'SC',
    enabled: true,
    order: 2
  }
];

async function checkIfClassExists(code) {
  const classQuery = query(
    collection(db, 'classes'),
    where('code', '==', code)
  );
  const snapshot = await getDocs(classQuery);
  return !snapshot.empty;
}

async function addTestClasses() {
  console.log('\n🔐 Authenticating as admin...');
  
  try {
    // Sign in as admin
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Admin authenticated successfully\n');
  } catch (error) {
    console.error('❌ Admin authentication failed:', error.message);
    console.log('\n💡 Tip: Make sure you have run create-super-admin.js first\n');
    process.exit(1);
  }
  
  console.log('🚀 Starting to add test classes to Firestore...\n');
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const classData of testClasses) {
    try {
      // Check if class already exists
      const exists = await checkIfClassExists(classData.code);
      
      if (exists) {
        console.log(`⏭️  Skipped: ${classData.nameFr} (already exists)`);
        skippedCount++;
        continue;
      }
      
      // Add class to Firestore
      const docRef = await addDoc(collection(db, 'classes'), {
        ...classData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Added: ${classData.nameFr}`);
      console.log(`   Code: ${classData.code}`);
      console.log(`   Level: ${classData.levelCode} | Branch: ${classData.branchCode}`);
      console.log(`   Doc ID: ${docRef.id}\n`);
      
      addedCount++;
    } catch (error) {
      console.error(`❌ Error adding ${classData.code}:`, error.message);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Added: ${addedCount} classes`);
  console.log(`   ⏭️  Skipped: ${skippedCount} classes (already exist)`);
  console.log(`   📝 Total: ${testClasses.length} classes in test data\n`);
  
  // Verify classes in database
  console.log('🔍 Verifying classes in database...\n');
  
  const allClassesSnapshot = await getDocs(collection(db, 'classes'));
  console.log(`📚 Total classes in database: ${allClassesSnapshot.size}\n`);
  
  // Group by level and branch
  const groupedClasses = {};
  allClassesSnapshot.forEach(doc => {
    const data = doc.data();
    const key = `${data.levelCode}-${data.branchCode}`;
    if (!groupedClasses[key]) {
      groupedClasses[key] = [];
    }
    groupedClasses[key].push(data);
  });
  
  console.log('📋 Classes by Level and Branch:');
  Object.keys(groupedClasses).sort().forEach(key => {
    console.log(`\n   ${key}:`);
    groupedClasses[key]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach(cls => {
        console.log(`      - ${cls.nameFr} (${cls.code})`);
      });
  });
  
  console.log('\n\n✨ Test classes added successfully!');
  console.log('👉 You can now test the signup form at:');
  console.log('   https://5175-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/signup');
  console.log('\n📝 Test flow:');
  console.log('   1. Select a Level (e.g., "2ème Baccalauréat")');
  console.log('   2. Select a Branch (e.g., "Sciences")');
  console.log('   3. Verify that classes appear (e.g., "2ème Bac Sciences - Classe 1")');
  console.log('   4. Complete signup and verify class info in user profile\n');
  
  // Sign out
  await auth.signOut();
}

// Run the script
addTestClasses()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
