#!/usr/bin/env node

/**
 * Add complete academic structure to Firestore
 * Adds Levels and Branches (Classes already exist)
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

// Academic Levels (Niveaux)
const academicLevels = [
  {
    code: 'TC',
    nameFr: 'Tronc Commun',
    nameAr: 'الجذع المشترك',
    enabled: true,
    order: 1
  },
  {
    code: '1BAC',
    nameFr: '1ère Baccalauréat',
    nameAr: 'الأولى باكالوريا',
    enabled: true,
    order: 2
  },
  {
    code: '2BAC',
    nameFr: '2ème Baccalauréat',
    nameAr: 'الثانية باكالوريا',
    enabled: true,
    order: 3
  }
];

// Branches (Types/Filières) - organized by level
const branches = [
  // Tronc Commun branches
  {
    code: 'SC',
    nameFr: 'Sciences',
    nameAr: 'علوم',
    levelCode: 'TC',
    enabled: true,
    order: 1
  },
  {
    code: 'LET',
    nameFr: 'Lettres',
    nameAr: 'آداب',
    levelCode: 'TC',
    enabled: true,
    order: 2
  },
  
  // 1BAC branches
  {
    code: 'SC',
    nameFr: 'Sciences Expérimentales',
    nameAr: 'علوم تجريبية',
    levelCode: '1BAC',
    enabled: true,
    order: 1
  },
  {
    code: 'MATH',
    nameFr: 'Sciences Mathématiques',
    nameAr: 'علوم رياضية',
    levelCode: '1BAC',
    enabled: true,
    order: 2
  },
  {
    code: 'ECO',
    nameFr: 'Sciences Économiques',
    nameAr: 'علوم اقتصادية',
    levelCode: '1BAC',
    enabled: true,
    order: 3
  },
  {
    code: 'LET',
    nameFr: 'Lettres',
    nameAr: 'آداب',
    levelCode: '1BAC',
    enabled: true,
    order: 4
  },
  
  // 2BAC branches
  {
    code: 'SC',
    nameFr: 'Sciences Expérimentales',
    nameAr: 'علوم تجريبية',
    levelCode: '2BAC',
    enabled: true,
    order: 1
  },
  {
    code: 'MATH',
    nameFr: 'Sciences Mathématiques',
    nameAr: 'علوم رياضية',
    levelCode: '2BAC',
    enabled: true,
    order: 2
  },
  {
    code: 'ECO',
    nameFr: 'Sciences Économiques',
    nameAr: 'علوم اقتصادية',
    levelCode: '2BAC',
    enabled: true,
    order: 3
  },
  {
    code: 'LET',
    nameFr: 'Lettres',
    nameAr: 'آداب',
    levelCode: '2BAC',
    enabled: true,
    order: 4
  }
];

async function checkIfLevelExists(code) {
  const q = query(
    collection(db, 'academicLevels'),
    where('code', '==', code)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function checkIfBranchExists(code, levelCode) {
  const q = query(
    collection(db, 'branches'),
    where('code', '==', code),
    where('levelCode', '==', levelCode)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function addCompleteStructure() {
  console.log('\n🔐 Authenticating as admin...');
  
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Admin authenticated\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }
  
  // Add Academic Levels
  console.log('📚 Adding Academic Levels...');
  console.log('═══════════════════════════════════════\n');
  
  let levelsAdded = 0;
  let levelsSkipped = 0;
  
  for (const level of academicLevels) {
    try {
      const exists = await checkIfLevelExists(level.code);
      
      if (exists) {
        console.log(`⏭️  Skipped: ${level.nameFr} (${level.code}) - already exists`);
        levelsSkipped++;
        continue;
      }
      
      const docRef = await addDoc(collection(db, 'academicLevels'), {
        ...level,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Added: ${level.nameFr} (${level.code})`);
      console.log(`   Doc ID: ${docRef.id}\n`);
      levelsAdded++;
    } catch (error) {
      console.error(`❌ Error adding ${level.code}:`, error.message);
    }
  }
  
  console.log('📊 Levels Summary:');
  console.log(`   ✅ Added: ${levelsAdded}`);
  console.log(`   ⏭️  Skipped: ${levelsSkipped}\n`);
  
  // Add Branches
  console.log('\n🌿 Adding Branches...');
  console.log('═══════════════════════════════════════\n');
  
  let branchesAdded = 0;
  let branchesSkipped = 0;
  
  // Group branches by level for better display
  const branchesByLevel = {};
  branches.forEach(branch => {
    if (!branchesByLevel[branch.levelCode]) {
      branchesByLevel[branch.levelCode] = [];
    }
    branchesByLevel[branch.levelCode].push(branch);
  });
  
  for (const levelCode of Object.keys(branchesByLevel).sort()) {
    console.log(`\n📌 Level: ${levelCode}`);
    console.log('───────────────────────────────────────');
    
    for (const branch of branchesByLevel[levelCode]) {
      try {
        const exists = await checkIfBranchExists(branch.code, branch.levelCode);
        
        if (exists) {
          console.log(`   ⏭️  ${branch.nameFr} (already exists)`);
          branchesSkipped++;
          continue;
        }
        
        const docRef = await addDoc(collection(db, 'branches'), {
          ...branch,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log(`   ✅ ${branch.nameFr} (${branch.code})`);
        branchesAdded++;
      } catch (error) {
        console.error(`   ❌ Error adding ${branch.code}:`, error.message);
      }
    }
  }
  
  console.log('\n\n📊 Branches Summary:');
  console.log(`   ✅ Added: ${branchesAdded}`);
  console.log(`   ⏭️  Skipped: ${branchesSkipped}\n`);
  
  // Verify complete structure
  console.log('\n🔍 Verifying Complete Structure...');
  console.log('═══════════════════════════════════════\n');
  
  const levelsSnapshot = await getDocs(collection(db, 'academicLevels'));
  const branchesSnapshot = await getDocs(collection(db, 'branches'));
  const classesSnapshot = await getDocs(collection(db, 'classes'));
  
  console.log(`📚 Academic Levels: ${levelsSnapshot.size}`);
  levelsSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.code}: ${data.nameFr}`);
  });
  
  console.log(`\n🌿 Branches: ${branchesSnapshot.size}`);
  const branchesGrouped = {};
  branchesSnapshot.forEach(doc => {
    const data = doc.data();
    if (!branchesGrouped[data.levelCode]) {
      branchesGrouped[data.levelCode] = [];
    }
    branchesGrouped[data.levelCode].push(data);
  });
  Object.keys(branchesGrouped).sort().forEach(levelCode => {
    console.log(`\n   Level ${levelCode}:`);
    branchesGrouped[levelCode].forEach(branch => {
      console.log(`      - ${branch.code}: ${branch.nameFr}`);
    });
  });
  
  console.log(`\n\n🎓 Classes: ${classesSnapshot.size}`);
  
  console.log('\n\n✨ Complete Academic Structure is Ready!');
  console.log('═══════════════════════════════════════\n');
  
  console.log('🎯 Next Steps:');
  console.log('   1. Test signup form: Select Level → Branch → Class');
  console.log('   2. Verify cascading selection works');
  console.log('   3. Complete a test signup\n');
  
  console.log('🔗 Signup URL:');
  console.log('   https://5175-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/signup\n');
  
  await auth.signOut();
}

addCompleteStructure()
  .then(() => {
    console.log('✅ Script completed successfully\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
