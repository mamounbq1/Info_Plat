import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhp2UOv8m9y0ZW1XFRw4nBt-n-l9guedc",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "960025808439",
  appId: "1:960025808439:web:5aad744488b9a855da79b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixLettresClass() {
  try {
    console.log('🔧 Fixing Lettres class with lowercase levelCode...\n');

    // Find the class with lowercase "2bac"
    const classesQuery = query(
      collection(db, 'classes'),
      where('levelCode', '==', '2bac'),
      where('branchCode', '==', 'LET')
    );
    
    const snapshot = await getDocs(classesQuery);
    
    if (snapshot.empty) {
      console.log('❌ No classes found with levelCode="2bac" and branchCode="LET"');
      console.log('💡 The class might already be fixed or doesn\'t exist');
      process.exit(0);
    }

    console.log(`✅ Found ${snapshot.size} class(es) to fix:\n`);
    
    for (const docSnapshot of snapshot.docs) {
      const classData = docSnapshot.data();
      console.log('📋 Current data:');
      console.log(`   ID: ${docSnapshot.id}`);
      console.log(`   Name FR: ${classData.nameFr}`);
      console.log(`   Level Code: ${classData.levelCode} (lowercase - WRONG)`);
      console.log(`   Branch Code: ${classData.branchCode}`);
      console.log('');

      // Update the levelCode to uppercase
      const classRef = doc(db, 'classes', docSnapshot.id);
      await updateDoc(classRef, {
        levelCode: '2BAC'  // Fix to uppercase
      });

      console.log('✅ Updated to:');
      console.log(`   Level Code: 2BAC (uppercase - CORRECT)`);
      console.log('');
    }

    console.log('🎉 Fix completed successfully!');
    console.log('💡 Now the class should appear in the signup form');
    console.log('');
    console.log('🔍 Verification: Testing query with uppercase "2BAC"...');
    
    // Verify the fix
    const verifyQuery = query(
      collection(db, 'classes'),
      where('levelCode', '==', '2BAC'),
      where('branchCode', '==', 'LET'),
      where('enabled', '==', true)
    );
    const verifySnapshot = await getDocs(verifyQuery);
    
    console.log(`✅ Verification: Found ${verifySnapshot.size} class(es) with levelCode="2BAC" and branchCode="LET"`);
    verifySnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.nameFr}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixLettresClass();
