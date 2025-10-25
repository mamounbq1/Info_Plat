#!/usr/bin/env node

/**
 * Fix TC level - add missing nameFr and nameAr
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhp2UOv8m9y0ZW1XFRw4nBt-n-l9guedc",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "960025808439",
  appId: "1:960025808439:web:5aad744488b9a855da79b2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'superadmin@eduplatform.ma';
const ADMIN_PASSWORD = 'SuperAdmin@2025!Secure';

async function fixTCLevel() {
  console.log('\n🔐 Authenticating as admin...');
  
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }
  
  console.log('🔧 Fixing TC level...\n');
  
  // Find TC level
  const q = query(
    collection(db, 'academicLevels'),
    where('code', '==', 'TC')
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('❌ TC level not found!');
    return;
  }
  
  const tcDoc = snapshot.docs[0];
  console.log(`Found TC level with ID: ${tcDoc.id}`);
  
  // Update with proper names
  await updateDoc(doc(db, 'academicLevels', tcDoc.id), {
    nameFr: 'Tronc Commun',
    nameAr: 'الجذع المشترك'
  });
  
  console.log('✅ Updated TC level with proper names\n');
  
  // Verify
  const updatedDoc = await getDocs(q);
  const data = updatedDoc.docs[0].data();
  console.log('📋 Verified data:');
  console.log(`   Code: ${data.code}`);
  console.log(`   Name FR: ${data.nameFr}`);
  console.log(`   Name AR: ${data.nameAr}`);
  console.log(`   Enabled: ${data.enabled}\n`);
  
  await auth.signOut();
}

fixTCLevel()
  .then(() => {
    console.log('✅ Fix completed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
