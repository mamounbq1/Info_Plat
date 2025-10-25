// Create Admin Authentication Users with Passwords
// This script uses Firebase Admin SDK to create admin users in Firebase Authentication
// Usage: node create-admin-auth-users.js

// NOTE: You need to set up Firebase Admin SDK service account first
// Download service account key from Firebase Console → Project Settings → Service Accounts

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// IMPORTANT: Replace this with your service account key file path
// Download from: https://console.firebase.google.com/project/eduinfor-fff3d/settings/serviceaccounts/adminsdk
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'eduinfor-fff3d'
});

const auth = admin.auth();
const db = admin.firestore();

// Admin users to create
const adminUsers = [
  {
    uid: 'admin001',
    email: 'admin@eduplatform.ma',
    password: 'Admin@2025!Secure',
    displayName: 'Administrateur Principal',
    displayNameAr: 'المدير الرئيسي',
    role: 'admin',
    phoneNumber: '+212600000001',
    permissions: ['manage_users', 'manage_content', 'manage_settings', 'view_analytics']
  },
  {
    uid: 'admin002',
    email: 'superadmin@eduplatform.ma',
    password: 'SuperAdmin@2025!Secure',
    displayName: 'Super Admin',
    displayNameAr: 'المشرف العام',
    role: 'admin',
    phoneNumber: '+212600000002',
    permissions: ['*']
  }
];

async function createAdminAuthUsers() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         🔐 CREATING ADMIN AUTHENTICATION USERS               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  try {
    for (const user of adminUsers) {
      console.log(`\n📝 Creating admin user: ${user.email}`);
      
      try {
        // Step 1: Create Authentication user
        const userRecord = await auth.createUser({
          uid: user.uid,
          email: user.email,
          password: user.password,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          emailVerified: true
        });

        console.log('   ✅ Firebase Auth user created:', userRecord.uid);

        // Step 2: Set custom claims for role
        await auth.setCustomUserClaims(userRecord.uid, {
          role: user.role,
          permissions: user.permissions
        });

        console.log('   ✅ Custom claims set (role: admin)');

        // Step 3: Create Firestore document
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: user.email,
          displayName: user.displayName,
          displayNameAr: user.displayNameAr,
          role: user.role,
          phoneNumber: user.phoneNumber,
          active: true,
          permissions: user.permissions,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('   ✅ Firestore document created');
        console.log(`   🔑 Login Credentials:`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Password: ${user.password}`);

      } catch (error) {
        if (error.code === 'auth/uid-already-exists') {
          console.log('   ⚠️  User already exists, updating...');
          
          // Update password
          await auth.updateUser(user.uid, {
            password: user.password
          });
          
          console.log('   ✅ Password updated');
          console.log(`   🔑 New Password: ${user.password}`);
          
        } else {
          throw error;
        }
      }
    }

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ ADMIN USERS CREATED SUCCESSFULLY!             ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log('📊 ADMIN LOGIN CREDENTIALS:\n');
    adminUsers.forEach(user => {
      console.log(`👤 ${user.displayName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log('');
    });

    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Change these passwords immediately after first login');
    console.log('   2. Never commit passwords to version control');
    console.log('   3. Use strong, unique passwords for production');
    console.log('   4. Enable 2FA for admin accounts\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

// Execute
createAdminAuthUsers();
