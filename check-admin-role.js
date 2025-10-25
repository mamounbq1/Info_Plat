#!/usr/bin/env node

/**
 * Check if admin user has correct role in Firestore
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function checkAdminRole() {
  console.log('\n🔐 Signing in as admin...');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = userCredential.user;
    
    console.log('✅ Signed in successfully');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);
    
    console.log('\n📊 Checking Firestore user profile...');
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log('❌ User profile does NOT exist in Firestore!');
      console.log('\n💡 Solution: The super admin needs a profile in Firestore.');
      console.log('   Run: node create-super-admin.js (if not already run)\n');
      return;
    }
    
    const userData = userDoc.data();
    console.log('✅ User profile exists in Firestore');
    console.log('\n📋 Profile Data:');
    console.log(JSON.stringify(userData, null, 2));
    
    if (userData.role !== 'admin') {
      console.log('\n❌ PROBLEM FOUND: role is NOT "admin"');
      console.log(`   Current role: "${userData.role}"`);
      console.log('\n💡 Solution: Update the role to "admin" in Firestore');
    } else {
      console.log('\n✅ Role is correct: "admin"');
      console.log('   The admin user should be able to create classes');
    }
    
    await auth.signOut();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminRole()
  .then(() => {
    console.log('\n✅ Check completed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
