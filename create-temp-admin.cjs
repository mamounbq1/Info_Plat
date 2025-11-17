const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function createTempAdmin() {
  const email = 'temp-admin@test.com';
  const password = 'TempAdmin123!';
  
  try {
    // Create auth user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true
    });
    
    console.log('✅ User created in Auth:', userRecord.uid);
    
    // Create Firestore document
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      fullName: 'Admin Temporaire',
      role: 'admin',
      approved: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'script'
    });
    
    console.log('✅ Firestore document created');
    
    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      approved: true,
      status: 'active'
    });
    
    console.log('✅ Custom claims set');
    
    console.log('\n🎉 ADMIN TEMPORAIRE CRÉÉ!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTempAdmin();
