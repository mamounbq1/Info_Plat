#!/usr/bin/env node

/**
 * Check academic structure data in Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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

async function checkStructure() {
  console.log('\n🔍 Checking Academic Structure in Firestore...\n');
  
  // Check Levels
  console.log('📚 Academic Levels (academicLevels collection):');
  console.log('─────────────────────────────────────────────');
  try {
    const levelsSnapshot = await getDocs(collection(db, 'academicLevels'));
    console.log(`   Total documents: ${levelsSnapshot.size}`);
    
    if (levelsSnapshot.empty) {
      console.log('   ❌ NO LEVELS FOUND!');
    } else {
      levelsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.code}: ${data.nameFr} (enabled: ${data.enabled})`);
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // Check Branches
  console.log('\n🌿 Branches (branches collection):');
  console.log('─────────────────────────────────────────────');
  try {
    const branchesSnapshot = await getDocs(collection(db, 'branches'));
    console.log(`   Total documents: ${branchesSnapshot.size}`);
    
    if (branchesSnapshot.empty) {
      console.log('   ❌ NO BRANCHES FOUND!');
    } else {
      const branchesByLevel = {};
      branchesSnapshot.forEach(doc => {
        const data = doc.data();
        if (!branchesByLevel[data.levelCode]) {
          branchesByLevel[data.levelCode] = [];
        }
        branchesByLevel[data.levelCode].push(data);
      });
      
      Object.keys(branchesByLevel).sort().forEach(levelCode => {
        console.log(`\n   Level ${levelCode}:`);
        branchesByLevel[levelCode].forEach(branch => {
          console.log(`      - ${branch.code}: ${branch.nameFr} (enabled: ${branch.enabled})`);
        });
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // Check Classes
  console.log('\n🎓 Classes (classes collection):');
  console.log('─────────────────────────────────────────────');
  try {
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    console.log(`   Total documents: ${classesSnapshot.size}`);
    
    if (classesSnapshot.empty) {
      console.log('   ❌ NO CLASSES FOUND!');
    } else {
      const classesByLevelBranch = {};
      classesSnapshot.forEach(doc => {
        const data = doc.data();
        const key = `${data.levelCode}-${data.branchCode}`;
        if (!classesByLevelBranch[key]) {
          classesByLevelBranch[key] = [];
        }
        classesByLevelBranch[key].push(data);
      });
      
      Object.keys(classesByLevelBranch).sort().forEach(key => {
        console.log(`\n   ${key}:`);
        classesByLevelBranch[key]
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .forEach(cls => {
            console.log(`      - ${cls.code}: ${cls.nameFr} (enabled: ${cls.enabled})`);
          });
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // Check Subjects
  console.log('\n📖 Subjects (subjects collection):');
  console.log('─────────────────────────────────────────────');
  try {
    const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
    console.log(`   Total documents: ${subjectsSnapshot.size}`);
    
    if (subjectsSnapshot.empty) {
      console.log('   ⚠️  No subjects found');
    } else {
      subjectsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.code}: ${data.nameFr} (enabled: ${data.enabled})`);
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 DIAGNOSIS:\n');
  
  const levelsCount = (await getDocs(collection(db, 'academicLevels'))).size;
  const branchesCount = (await getDocs(collection(db, 'branches'))).size;
  const classesCount = (await getDocs(collection(db, 'classes'))).size;
  
  if (levelsCount === 0) {
    console.log('❌ PROBLEM: No academic levels found!');
    console.log('   The signup form needs levels in the "academicLevels" collection.\n');
    console.log('💊 SOLUTION: Run the script to add levels:');
    console.log('   node add-academic-levels.js\n');
  } else {
    console.log(`✅ Academic levels exist: ${levelsCount} levels`);
  }
  
  if (branchesCount === 0) {
    console.log('❌ PROBLEM: No branches found!');
    console.log('   Students need branches to select after choosing a level.\n');
    console.log('💊 SOLUTION: Run the script to add branches:');
    console.log('   node add-academic-branches.js\n');
  } else {
    console.log(`✅ Branches exist: ${branchesCount} branches`);
  }
  
  if (classesCount === 0) {
    console.log('❌ WARNING: No classes found!');
    console.log('   Classes were added earlier, but they might have been deleted.\n');
  } else {
    console.log(`✅ Classes exist: ${classesCount} classes`);
  }
  
  console.log('\n');
}

checkStructure()
  .then(() => {
    console.log('✅ Check complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
