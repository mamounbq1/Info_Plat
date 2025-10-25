/**
 * Test Script: Student Class Registration & Display
 * 
 * This script tests the complete flow:
 * 1. Creates a test student with a specific class
 * 2. Verifies the class exists in the database
 * 3. Checks if the student's class appears in teacher dashboard
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  deleteDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signOut,
  deleteUser 
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDW5yoMH96vQF_3kJM4Y2qzm2TxfPKm-_g",
  authDomain: "info-plat.firebaseapp.com",
  projectId: "info-plat",
  storageBucket: "info-plat.firebasestorage.app",
  messagingSenderId: "481978565699",
  appId: "1:481978565699:web:c9dff23f7ed0b4bac15aaa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Test data
const TEST_STUDENT = {
  email: 'test_eleve_' + Date.now() + '@test.com',
  password: 'TestPassword123!',
  fullName: 'Test Élève ' + Date.now(),
  classCode: '2BAC-SC-1',
  levelCode: '2BAC',
  branchCode: 'SC'
};

console.log('\n🧪 ================================');
console.log('   TEST: Student Class Registration');
console.log('   ================================\n');

async function testStudentClassFlow() {
  let createdUserId = null;
  let authUser = null;

  try {
    // ========================================
    // STEP 1: Check if class exists in database
    // ========================================
    console.log('📋 STEP 1: Checking if class exists in database...');
    console.log(`   Looking for class: ${TEST_STUDENT.classCode}`);
    
    const classesQuery = query(
      collection(db, 'classes'),
      where('code', '==', TEST_STUDENT.classCode),
      where('enabled', '==', true)
    );
    const classesSnapshot = await getDocs(classesQuery);
    
    if (classesSnapshot.empty) {
      console.log('   ❌ Class NOT found in database!');
      console.log('   📝 Available classes:');
      
      const allClassesQuery = query(
        collection(db, 'classes'),
        where('enabled', '==', true)
      );
      const allClassesSnapshot = await getDocs(allClassesQuery);
      
      allClassesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.code}: ${data.nameFr} (${data.nameAr})`);
      });
      
      console.log('\n   ⚠️  Test cannot continue without the class in database.');
      console.log('   💡 Recommendation: Add the class to Firestore or choose an existing class.');
      return;
    }
    
    const classData = classesSnapshot.docs[0].data();
    console.log(`   ✅ Class found: ${classData.nameFr} (${classData.nameAr})`);
    console.log(`      - Code: ${classData.code}`);
    console.log(`      - Level: ${classData.level}`);
    console.log(`      - Branch: ${classData.branch}\n`);

    // ========================================
    // STEP 2: Create test student (simulate signup)
    // ========================================
    console.log('📝 STEP 2: Creating test student...');
    console.log(`   Email: ${TEST_STUDENT.email}`);
    console.log(`   Name: ${TEST_STUDENT.fullName}`);
    console.log(`   Class: ${TEST_STUDENT.classCode}\n`);

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      TEST_STUDENT.email,
      TEST_STUDENT.password
    );
    authUser = userCredential.user;
    console.log(`   ✅ Auth user created: ${authUser.uid}`);

    // Create Firestore user document (simulating signup.jsx logic)
    const userDoc = await addDoc(collection(db, 'users'), {
      uid: authUser.uid,
      email: TEST_STUDENT.email,
      fullName: TEST_STUDENT.fullName,
      role: 'student',
      // NEW: Complete class information (as saved in Signup.jsx line 225-229)
      class: TEST_STUDENT.classCode,
      classNameFr: classData.nameFr,
      classNameAr: classData.nameAr,
      levelCode: TEST_STUDENT.levelCode,
      branchCode: TEST_STUDENT.branchCode,
      // OLD: for backward compatibility
      level: `${TEST_STUDENT.levelCode}-${TEST_STUDENT.branchCode}`,
      // Additional fields
      createdAt: new Date().toISOString(),
      points: 0,
      approved: true // Auto-approve for testing
    });
    
    createdUserId = userDoc.id;
    console.log(`   ✅ User document created: ${createdUserId}\n`);

    // ========================================
    // STEP 3: Verify student data in Firestore
    // ========================================
    console.log('🔍 STEP 3: Verifying student data in Firestore...');
    
    const studentDoc = await getDoc(doc(db, 'users', createdUserId));
    const studentData = studentDoc.data();
    
    console.log('   📊 Student document data:');
    console.log(`      - ID: ${createdUserId}`);
    console.log(`      - Email: ${studentData.email}`);
    console.log(`      - Full Name: ${studentData.fullName}`);
    console.log(`      - Role: ${studentData.role}`);
    console.log(`      - Class Code: ${studentData.class}`);
    console.log(`      - Class Name FR: ${studentData.classNameFr}`);
    console.log(`      - Class Name AR: ${studentData.classNameAr}`);
    console.log(`      - Level Code: ${studentData.levelCode}`);
    console.log(`      - Branch Code: ${studentData.branchCode}`);
    
    // Verify class field is set correctly
    if (!studentData.class) {
      console.log('\n   ❌ ERROR: class field is missing!');
      return;
    }
    
    if (studentData.class !== TEST_STUDENT.classCode) {
      console.log(`\n   ❌ ERROR: class mismatch!`);
      console.log(`      Expected: ${TEST_STUDENT.classCode}`);
      console.log(`      Got: ${studentData.class}`);
      return;
    }
    
    console.log('\n   ✅ Student data verified correctly!\n');

    // ========================================
    // STEP 4: Simulate Teacher Dashboard fetch
    // ========================================
    console.log('👨‍🏫 STEP 4: Simulating Teacher Dashboard student fetch...');
    
    // Fetch all students (as done in TeacherDashboard.jsx line 222-226)
    const studentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    const studentsData = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`   📚 Total students found: ${studentsData.length}`);
    
    // Find our test student
    const testStudent = studentsData.find(s => s.id === createdUserId);
    
    if (!testStudent) {
      console.log('\n   ❌ ERROR: Test student not found in query results!');
      return;
    }
    
    console.log('\n   ✅ Test student found in results!');
    console.log('   📊 Student as seen by teacher dashboard:');
    console.log(`      - Email: ${testStudent.email}`);
    console.log(`      - Full Name: ${testStudent.fullName}`);
    console.log(`      - Class: ${testStudent.class || '(undefined)'}`);
    console.log(`      - Class Name: ${testStudent.classNameFr || '(undefined)'}`);

    // ========================================
    // STEP 5: Test filtering by class
    // ========================================
    console.log('\n🔍 STEP 5: Testing class-based filtering...');
    
    // Simulate filter (as done in TeacherDashboard.jsx line 541-550)
    const filterStudentClass = TEST_STUDENT.classCode;
    const filteredStudents = studentsData.filter(student => {
      const matchesClass = filterStudentClass === 'all' || 
        student.class === filterStudentClass;
      
      // Debug log for our test student
      if (student.id === createdUserId) {
        console.log('\n   🔍 Filter debug for test student:');
        console.log(`      - student.class: "${student.class}"`);
        console.log(`      - filterValue: "${filterStudentClass}"`);
        console.log(`      - matchesClass: ${matchesClass}`);
        console.log(`      - Comparison: "${student.class}" === "${filterStudentClass}" => ${student.class === filterStudentClass}`);
      }
      
      return matchesClass;
    });
    
    const testStudentInFiltered = filteredStudents.find(s => s.id === createdUserId);
    
    if (!testStudentInFiltered) {
      console.log('\n   ❌ ERROR: Test student NOT found after filtering!');
      console.log('   🐛 Possible issues:');
      console.log('      - Class field mismatch');
      console.log('      - Encoding/whitespace issues');
      console.log('      - Data type mismatch');
      return;
    }
    
    console.log('\n   ✅ Test student correctly filtered by class!');
    console.log(`   📊 ${filteredStudents.length} student(s) with class "${filterStudentClass}"`);

    // ========================================
    // STEP 6: Fetch classes for dropdown
    // ========================================
    console.log('\n🏫 STEP 6: Checking classes dropdown data...');
    
    const dropdownClassesQuery = query(
      collection(db, 'classes'),
      where('enabled', '==', true)
    );
    const dropdownClassesSnapshot = await getDocs(dropdownClassesQuery);
    const dropdownClasses = dropdownClassesSnapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));
    
    console.log(`   📋 Available classes in dropdown: ${dropdownClasses.length}`);
    
    const classInDropdown = dropdownClasses.find(c => c.code === TEST_STUDENT.classCode);
    
    if (!classInDropdown) {
      console.log(`\n   ❌ ERROR: Class "${TEST_STUDENT.classCode}" not in dropdown options!`);
      console.log('   📝 Available classes:');
      dropdownClasses.forEach(c => {
        console.log(`      - ${c.code}: ${c.nameFr}`);
      });
      return;
    }
    
    console.log(`\n   ✅ Class found in dropdown: ${classInDropdown.nameFr}`);

    // ========================================
    // FINAL RESULT
    // ========================================
    console.log('\n✅ ================================');
    console.log('   TEST PASSED! ✨');
    console.log('   ================================');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Class exists in database: ${classData.nameFr}`);
    console.log(`   ✅ Student created with class: ${TEST_STUDENT.classCode}`);
    console.log(`   ✅ Student data verified in Firestore`);
    console.log(`   ✅ Student appears in teacher dashboard query`);
    console.log(`   ✅ Student correctly filtered by class`);
    console.log(`   ✅ Class appears in dropdown options`);
    console.log('\n💡 Result: The system is working correctly!');
    console.log('   If the UI still doesn\'t show the class, check:');
    console.log('   - Browser console for debug logs');
    console.log('   - React component state updates');
    console.log('   - UI rendering logic\n');

  } catch (error) {
    console.error('\n❌ ================================');
    console.error('   TEST FAILED!');
    console.error('   ================================');
    console.error('\n🐛 Error details:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Full error:', error);
    console.error('\n');
  } finally {
    // ========================================
    // CLEANUP: Delete test student
    // ========================================
    console.log('🧹 Cleanup: Removing test student...');
    
    try {
      // Delete Firestore document
      if (createdUserId) {
        await deleteDoc(doc(db, 'users', createdUserId));
        console.log(`   ✅ Deleted user document: ${createdUserId}`);
      }
      
      // Delete Auth user
      if (authUser) {
        await deleteUser(authUser);
        console.log(`   ✅ Deleted auth user: ${authUser.uid}`);
      }
      
      console.log('\n✨ Cleanup completed!\n');
    } catch (cleanupError) {
      console.error('   ⚠️  Cleanup error (non-critical):', cleanupError.message);
    }
    
    // Sign out
    await signOut(auth);
    
    console.log('🏁 Test script finished.\n');
    process.exit(0);
  }
}

// Run the test
testStudentClassFlow();
