import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

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

async function diagnoseClasses() {
  try {
    console.log('🔍 Diagnosing class data (using public read access)...\n');

    // 1. Get ALL classes without filters
    console.log('📋 Step 1: Fetching ALL classes from Firestore...');
    const allClassesSnapshot = await getDocs(collection(db, 'classes'));
    const allClasses = allClassesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`   Found ${allClasses.length} total classes\n`);

    // 2. Show all classes with their key fields
    console.log('📊 Step 2: Analyzing all classes:');
    console.log('='.repeat(100));
    allClasses.forEach((cls, index) => {
      console.log(`\n${index + 1}. Class: ${cls.nameFr || cls.nameAr || 'NO NAME'}`);
      console.log(`   📁 Document ID: ${cls.id}`);
      console.log(`   🔑 Code: ${cls.code || 'MISSING'}`);
      console.log(`   🎓 Level Code: ${cls.levelCode || 'MISSING'}`);
      console.log(`   🌿 Branch Code: ${cls.branchCode || 'MISSING'}`);
      console.log(`   ✅ Enabled: ${cls.enabled !== undefined ? cls.enabled : 'MISSING'}`);
      console.log(`   🔢 Order: ${cls.order !== undefined ? cls.order : 'MISSING'}`);
      console.log(`   🇫🇷 Name FR: ${cls.nameFr || 'MISSING'}`);
      console.log(`   🇸🇦 Name AR: ${cls.nameAr || 'MISSING'}`);
    });
    console.log('\n' + '='.repeat(100) + '\n');

    // 3. Find classes for 2BAC level
    console.log('📋 Step 3: Classes for 2BAC level:');
    const bac2Classes = allClasses.filter(c => c.levelCode === '2BAC');
    console.log(`   Found ${bac2Classes.length} classes with levelCode='2BAC':`);
    bac2Classes.forEach(cls => {
      console.log(`   - ${cls.nameFr}: branch=${cls.branchCode}, enabled=${cls.enabled}`);
    });
    console.log('');

    // 4. Find classes for Lettres branch in 2BAC
    console.log('📋 Step 4: Classes for 2BAC + Lettres branch:');
    const lettresClasses = allClasses.filter(c => 
      c.levelCode === '2BAC' && c.branchCode === 'LET'
    );
    console.log(`   Found ${lettresClasses.length} classes with levelCode='2BAC' AND branchCode='LET':`);
    lettresClasses.forEach(cls => {
      console.log(`   - ${cls.nameFr}: enabled=${cls.enabled}, order=${cls.order}`);
    });
    console.log('');

    // 5. Test the EXACT query used in Signup.jsx
    console.log('📋 Step 5: Testing EXACT Signup.jsx query for 2BAC + LET:');
    try {
      const classesQuery = query(
        collection(db, 'classes'),
        where('levelCode', '==', '2BAC'),
        where('branchCode', '==', 'LET'),
        where('enabled', '==', true),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(classesQuery);
      const queryResults = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`   ✅ Query returned ${queryResults.length} classes:`);
      queryResults.forEach(cls => {
        console.log(`   - ${cls.nameFr} (${cls.nameAr})`);
      });
    } catch (error) {
      console.log(`   ❌ Query FAILED: ${error.message}`);
      console.log(`   💡 This might require a Firestore composite index`);
    }
    console.log('');

    // 6. Check for data quality issues
    console.log('🔍 Step 6: Checking for data quality issues:');
    const issues = [];
    
    allClasses.forEach(cls => {
      const classIssues = [];
      if (!cls.code) classIssues.push('Missing code');
      if (!cls.levelCode) classIssues.push('Missing levelCode');
      if (!cls.branchCode) classIssues.push('Missing branchCode');
      if (cls.enabled === undefined) classIssues.push('Missing enabled field');
      if (cls.order === undefined) classIssues.push('Missing order field');
      if (!cls.nameFr) classIssues.push('Missing nameFr');
      if (!cls.nameAr) classIssues.push('Missing nameAr');
      
      if (classIssues.length > 0) {
        issues.push({
          class: cls.nameFr || cls.nameAr || cls.id,
          issues: classIssues
        });
      }
    });

    if (issues.length > 0) {
      console.log(`   ⚠️  Found ${issues.length} classes with issues:`);
      issues.forEach(item => {
        console.log(`   - ${item.class}: ${item.issues.join(', ')}`);
      });
    } else {
      console.log('   ✅ All classes have complete data structure');
    }
    console.log('');

    // 7. Summary and recommendations
    console.log('📝 SUMMARY & RECOMMENDATIONS:');
    console.log('='.repeat(100));
    
    const recentlyAdded = allClasses.filter(c => 
      c.levelCode === '2BAC' && c.branchCode === 'LET'
    );
    
    if (recentlyAdded.length === 0) {
      console.log('❌ PROBLEM: No classes found for 2BAC + Lettres combination');
      console.log('💡 SOLUTION: The class might not have been saved correctly');
    } else if (recentlyAdded.some(c => c.enabled !== true)) {
      console.log('❌ PROBLEM: Classes exist but enabled=false or missing');
      console.log('💡 SOLUTION: Set enabled=true for these classes');
    } else {
      console.log('✅ Classes exist with correct data');
      console.log('💡 Check if Firestore composite index is created');
      console.log('💡 Try refreshing the signup page (clear cache)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

diagnoseClasses();
