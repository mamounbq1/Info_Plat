// Quick script to check existing users in Firebase Auth and Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsers() {
  try {
    console.log('🔍 Checking users in Firestore...\n');
    console.log('📊 Firebase Project:', envVars.VITE_FIREBASE_PROJECT_ID);
    console.log('━'.repeat(60));
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    if (usersSnapshot.empty) {
      console.log('\n⚠️  No users found in Firestore!');
      console.log('\n💡 To create demo accounts, run:');
      console.log('   node create-user-profiles.js');
      console.log('\n📝 Or signup via the app at:');
      console.log('   https://5174-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/signup');
      return;
    }
    
    console.log(`\n✅ Found ${usersSnapshot.size} user(s) in Firestore:\n`);
    
    const students = [];
    const admins = [];
    const pending = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const user = {
        uid: doc.id,
        email: userData.email || 'No email',
        fullName: userData.fullName || 'No name',
        role: userData.role || 'No role',
        status: userData.status || 'No status',
        createdAt: userData.createdAt || 'Unknown'
      };
      
      if (userData.role === 'student') {
        students.push(user);
      } else if (userData.role === 'admin' || userData.role === 'teacher') {
        admins.push(user);
      }
      
      if (userData.status === 'pending') {
        pending.push(user);
      }
    });
    
    // Display Admin/Teacher accounts
    if (admins.length > 0) {
      console.log('👨‍🏫 ADMIN/TEACHER ACCOUNTS:');
      console.log('━'.repeat(60));
      admins.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.fullName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 UID: ${user.uid}`);
        console.log(`   👤 Role: ${user.role}`);
        console.log(`   ⏰ Created: ${user.createdAt}`);
      });
      console.log();
    }
    
    // Display Student accounts
    if (students.length > 0) {
      console.log('━'.repeat(60));
      console.log('🎓 STUDENT ACCOUNTS:');
      console.log('━'.repeat(60));
      students.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.fullName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 UID: ${user.uid}`);
        console.log(`   👤 Role: ${user.role}`);
        console.log(`   📊 Status: ${user.status}`);
        console.log(`   ⏰ Created: ${user.createdAt}`);
      });
      console.log();
    }
    
    // Display pending approvals
    if (pending.length > 0) {
      console.log('━'.repeat(60));
      console.log('⏳ PENDING APPROVAL:');
      console.log('━'.repeat(60));
      pending.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.fullName} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
      });
      console.log('\n💡 Login as admin to approve these accounts');
      console.log();
    }
    
    // Summary
    console.log('━'.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('━'.repeat(60));
    console.log(`Total Users: ${usersSnapshot.size}`);
    console.log(`Admins/Teachers: ${admins.length}`);
    console.log(`Students: ${students.length}`);
    console.log(`Pending Approval: ${pending.length}`);
    console.log();
    
    // Login instructions
    console.log('━'.repeat(60));
    console.log('🌐 ACCESS YOUR DASHBOARD:');
    console.log('━'.repeat(60));
    console.log('\n📱 App URL:');
    console.log('   https://5174-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai');
    console.log('\n🔑 Login Page:');
    console.log('   https://5174-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/login');
    
    if (students.length > 0) {
      console.log('\n🎓 Student Login:');
      console.log(`   Email: ${students[0].email}`);
      console.log('   Password: (your password)');
      console.log('   Dashboard: /dashboard');
    }
    
    if (admins.length > 0) {
      console.log('\n👨‍🏫 Admin Login:');
      console.log(`   Email: ${admins[0].email}`);
      console.log('   Password: (your password)');
      console.log('   Dashboard: /admin');
    }
    
    console.log('\n━'.repeat(60));
    console.log('✅ User check complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error checking users:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Firebase is configured (.env file)');
    console.error('   2. Firestore is initialized');
    console.error('   3. You have internet connection');
  }
  
  process.exit(0);
}

checkUsers();
