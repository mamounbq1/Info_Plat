#!/usr/bin/env node

// Create Super Admin User Script
// Creates a super admin user with full permissions

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║              🔐 SUPER ADMIN USER CREATION                    ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');

const superAdminData = {
  email: 'superadmin@eduplatform.ma',
  password: 'SuperAdmin@2025!Secure',
  profile: {
    role: 'admin',
    permissions: ['*'], // All permissions
    nameFr: 'Super Administrateur',
    nameAr: 'المسؤول الرئيسي',
    email: 'superadmin@eduplatform.ma',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    isSuperAdmin: true,
    canManageUsers: true,
    canManageContent: true,
    canManageSettings: true,
    canViewAnalytics: true,
    canDeleteData: true,
    canModifyRoles: true
  }
};

async function createSuperAdmin() {
  try {
    console.log('📝 Creating super admin account...');
    console.log('   Email: ' + superAdminData.email);
    console.log('   Password: ' + superAdminData.password);
    console.log('');
    
    // Create authentication user
    console.log('🔐 Step 1: Creating Firebase Auth user...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      superAdminData.email,
      superAdminData.password
    );
    
    const user = userCredential.user;
    console.log('   ✅ Auth user created with UID: ' + user.uid);
    
    // Create Firestore profile
    console.log('');
    console.log('📊 Step 2: Creating Firestore user profile...');
    await setDoc(doc(db, 'users', user.uid), {
      ...superAdminData.profile,
      uid: user.uid
    });
    
    console.log('   ✅ Firestore profile created');
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ SUCCESS! Super Admin Created');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('   Email:    ' + superAdminData.email);
    console.log('   Password: ' + superAdminData.password);
    console.log('   UID:      ' + user.uid);
    console.log('───────────────────────────────────────────────────────────────');
    console.log('');
    console.log('🔒 Permissions:');
    console.log('   ✅ Super Admin (ALL PERMISSIONS)');
    console.log('   ✅ Manage Users');
    console.log('   ✅ Manage Content');
    console.log('   ✅ Manage Settings');
    console.log('   ✅ View Analytics');
    console.log('   ✅ Delete Data');
    console.log('   ✅ Modify Roles');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Go to: http://localhost:5173/login');
    console.log('   2. Login with the credentials above');
    console.log('   3. You should see the Admin Dashboard');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error creating super admin:', error.message);
    console.error('');
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  This email is already registered.');
      console.log('   You can login with:');
      console.log('   Email: ' + superAdminData.email);
      console.log('   Password: ' + superAdminData.password);
      console.log('');
      console.log('   Or delete the existing user first in Firebase Console:');
      console.log('   https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users');
    } else if (error.code === 'auth/weak-password') {
      console.log('ℹ️  Password is too weak. Use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('ℹ️  Email format is invalid.');
    }
    
    console.log('');
    process.exit(1);
  }
}

console.log('🚀 Starting super admin creation...');
console.log('');

createSuperAdmin();
