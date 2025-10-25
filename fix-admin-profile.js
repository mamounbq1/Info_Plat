#!/usr/bin/env node

/**
 * Fix admin profile in Firestore
 * Creates the missing Firestore profile for the admin user
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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

async function fixAdminProfile() {
  console.log('\n🔐 Signing in as admin...');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = userCredential.user;
    
    console.log('✅ Signed in successfully');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);
    
    console.log('\n📝 Creating Firestore profile...');
    
    const adminProfile = {
      uid: user.uid,
      email: user.email,
      role: 'admin',
      fullName: 'Super Administrateur',
      nameFr: 'Super Administrateur',
      nameAr: 'المسؤول الرئيسي',
      permissions: ['*'], // All permissions
      isActive: true,
      isSuperAdmin: true,
      canManageUsers: true,
      canManageContent: true,
      canManageSettings: true,
      canViewAnalytics: true,
      canDeleteData: true,
      canModifyRoles: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), adminProfile);
    
    console.log('✅ Firestore profile created successfully!');
    console.log('\n📋 Profile Data:');
    console.log(JSON.stringify(adminProfile, null, 2));
    
    console.log('\n✨ Admin profile is now complete!');
    console.log('   You can now add classes using the admin account.\n');
    
    await auth.signOut();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAdminProfile()
  .then(() => {
    console.log('✅ Fix completed successfully\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
