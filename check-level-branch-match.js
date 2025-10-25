#!/usr/bin/env node

/**
 * Check if level IDs match branch levelCodes
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

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

async function checkMatch() {
  console.log('\n🔍 Checking Level-Branch Matching...\n');
  
  // Fetch levels
  const levelsQuery = query(collection(db, 'academicLevels'), orderBy('order', 'asc'));
  const levelsSnapshot = await getDocs(levelsQuery);
  const levels = levelsSnapshot.docs.map(doc => ({
    docId: doc.id,
    ...doc.data()
  }));
  
  // Fetch branches
  const branchesQuery = query(collection(db, 'branches'), orderBy('order', 'asc'));
  const branchesSnapshot = await getDocs(branchesQuery);
  const branches = branchesSnapshot.docs.map(doc => ({
    docId: doc.id,
    ...doc.data()
  }));
  
  console.log('📚 LEVELS (academicLevels collection):\n');
  levels.forEach(level => {
    console.log(`Level Document ID: ${level.docId}`);
    console.log(`  - id field: ${level.id || '❌ NOT SET'}`);
    console.log(`  - code field: ${level.code || '❌ NOT SET'}`);
    console.log(`  - nameFr: ${level.nameFr || level.fr}`);
    console.log(`  - nameAr: ${level.nameAr || level.ar}`);
    console.log('');
  });
  
  console.log('\n🌿 BRANCHES (branches collection):\n');
  branches.forEach(branch => {
    console.log(`Branch: ${branch.nameFr}`);
    console.log(`  - levelCode field: ${branch.levelCode}`);
    
    // Check if levelCode matches any level
    const matchingLevel = levels.find(l => 
      l.id === branch.levelCode || 
      l.code === branch.levelCode ||
      l.docId === branch.levelCode
    );
    
    if (matchingLevel) {
      console.log(`  ✅ Matches level: ${matchingLevel.nameFr || matchingLevel.fr}`);
    } else {
      console.log(`  ❌ NO MATCHING LEVEL FOUND!`);
    }
    console.log('');
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 ANALYSIS:\n');
  
  // Check if all branches have matching levels
  const unmatchedBranches = branches.filter(branch => {
    return !levels.find(l => 
      l.id === branch.levelCode || 
      l.code === branch.levelCode ||
      l.docId === branch.levelCode
    );
  });
  
  if (unmatchedBranches.length > 0) {
    console.log(`❌ PROBLEM: ${unmatchedBranches.length} branches don't match any level!`);
    console.log('\nUnmatched branches:');
    unmatchedBranches.forEach(b => {
      console.log(`  - ${b.nameFr} (levelCode: "${b.levelCode}")`);
    });
    console.log('\n💊 SOLUTION: The component uses level.id for comparison.');
    console.log('   Branches use levelCode field.');
    console.log('   These must match!\n');
  } else {
    console.log('✅ All branches match their levels correctly!\n');
  }
  
  // Group branches by levelCode
  console.log('\n📋 Branches grouped by levelCode:\n');
  const branchesByLevel = {};
  branches.forEach(branch => {
    if (!branchesByLevel[branch.levelCode]) {
      branchesByLevel[branch.levelCode] = [];
    }
    branchesByLevel[branch.levelCode].push(branch);
  });
  
  Object.keys(branchesByLevel).sort().forEach(levelCode => {
    const matchingLevel = levels.find(l => l.id === levelCode || l.code === levelCode);
    console.log(`Level: ${levelCode} ${matchingLevel ? '✅' : '❌'}`);
    branchesByLevel[levelCode].forEach(b => {
      console.log(`  - ${b.nameFr} (${b.code})`);
    });
    console.log('');
  });
}

checkMatch()
  .then(() => {
    console.log('✅ Check complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
