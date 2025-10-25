import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../config/firebase';
import { 
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
  createUserWithEmailAndPassword,
  deleteUser
} from 'firebase/auth';
import toast from 'react-hot-toast';

const TestStudentClass = () => {
  const { currentUser } = useAuth();
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [testStudent, setTestStudent] = useState(null);

  const addLog = (message, type = 'info') => {
    const log = {
      message,
      type, // 'info', 'success', 'error', 'warning'
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, log]);
    console.log(`[${log.timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  const runTest = async () => {
    setTestRunning(true);
    setTestResults([]);
    
    // Test data - Using a class that exists in the database
    const TEST_CLASS_CODE = '2BAC-PC-1'; // 2ème Bac Physique-Chimie - Classe 1
    const TEST_EMAIL = `test_eleve_${Date.now()}@test.com`;
    const TEST_PASSWORD = 'TestPassword123!';
    const TEST_NAME = `Test Élève ${Date.now()}`;

    let createdUserId = null;
    let createdAuthUid = null;

    try {
      addLog('🧪 Démarrage du test...', 'info');
      addLog(`📧 Email de test: ${TEST_EMAIL}`, 'info');
      
      // ========================================
      // STEP 1: Check if class exists
      // ========================================
      addLog(`📋 ÉTAPE 1: Vérification de la classe "${TEST_CLASS_CODE}"`, 'info');
      
      const classesQuery = query(
        collection(db, 'classes'),
        where('code', '==', TEST_CLASS_CODE),
        where('enabled', '==', true)
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      if (classesSnapshot.empty) {
        addLog(`❌ Classe "${TEST_CLASS_CODE}" NON trouvée dans la base de données!`, 'error');
        
        // List all available classes
        const allClassesQuery = query(
          collection(db, 'classes'),
          where('enabled', '==', true)
        );
        const allClassesSnapshot = await getDocs(allClassesQuery);
        
        addLog(`📝 Classes disponibles: ${allClassesSnapshot.size}`, 'warning');
        allClassesSnapshot.forEach(doc => {
          const data = doc.data();
          addLog(`   - ${data.code}: ${data.nameFr}`, 'info');
        });
        
        addLog('⚠️  Le test ne peut pas continuer sans la classe dans la base.', 'error');
        setTestRunning(false);
        return;
      }
      
      const classData = classesSnapshot.docs[0].data();
      addLog(`✅ Classe trouvée: ${classData.nameFr} (${classData.nameAr})`, 'success');
      addLog(`   Code: ${classData.code}, Niveau: ${classData.level}, Branche: ${classData.branch}`, 'info');

      // ========================================
      // STEP 2: Create test student
      // ========================================
      addLog('📝 ÉTAPE 2: Création de l\'élève test...', 'info');
      
      // Create Auth user (using imported auth instance)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        TEST_EMAIL,
        TEST_PASSWORD
      );
      createdAuthUid = userCredential.user.uid;
      addLog(`✅ Utilisateur Auth créé: ${createdAuthUid}`, 'success');

      // Extract level and branch from class code (e.g., "2BAC-PC-1" -> "2BAC", "PC")
      const codeParts = TEST_CLASS_CODE.split('-');
      const extractedLevel = codeParts[0]; // "2BAC"
      const extractedBranch = codeParts[1]; // "PC"
      
      // Use class data if available, otherwise use extracted values
      const finalLevel = classData.level || extractedLevel;
      const finalBranch = classData.branch || extractedBranch;
      
      addLog(`   📝 Level: ${finalLevel}, Branch: ${finalBranch}`, 'info');
      
      // Create Firestore document
      const userDoc = await addDoc(collection(db, 'users'), {
        uid: createdAuthUid,
        email: TEST_EMAIL,
        fullName: TEST_NAME,
        role: 'student',
        // Complete class information (as in Signup.jsx)
        class: TEST_CLASS_CODE,
        classNameFr: classData.nameFr,
        classNameAr: classData.nameAr,
        levelCode: finalLevel,
        branchCode: finalBranch,
        // For backward compatibility
        level: `${finalLevel}-${finalBranch}`,
        createdAt: new Date().toISOString(),
        points: 0,
        approved: true
      });
      
      createdUserId = userDoc.id;
      addLog(`✅ Document Firestore créé: ${createdUserId}`, 'success');
      
      setTestStudent({
        id: createdUserId,
        authUid: createdAuthUid,
        email: TEST_EMAIL
      });

      // ========================================
      // STEP 3: Verify student data
      // ========================================
      addLog('🔍 ÉTAPE 3: Vérification des données de l\'élève...', 'info');
      
      const studentDoc = await getDoc(doc(db, 'users', createdUserId));
      const studentData = studentDoc.data();
      
      addLog('📊 Données de l\'élève:', 'info');
      addLog(`   Email: ${studentData.email}`, 'info');
      addLog(`   Nom: ${studentData.fullName}`, 'info');
      addLog(`   Classe Code: ${studentData.class}`, 'info');
      addLog(`   Classe Nom FR: ${studentData.classNameFr}`, 'info');
      addLog(`   Classe Nom AR: ${studentData.classNameAr}`, 'info');
      
      if (!studentData.class) {
        addLog('❌ ERREUR: Le champ "class" est manquant!', 'error');
        return;
      }
      
      if (studentData.class !== TEST_CLASS_CODE) {
        addLog(`❌ ERREUR: Incohérence de classe!`, 'error');
        addLog(`   Attendu: ${TEST_CLASS_CODE}, Reçu: ${studentData.class}`, 'error');
        return;
      }
      
      addLog('✅ Données de l\'élève vérifiées avec succès!', 'success');

      // ========================================
      // STEP 4: Simulate teacher dashboard fetch
      // ========================================
      addLog('👨‍🏫 ÉTAPE 4: Simulation de la récupération du tableau de bord prof...', 'info');
      
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      addLog(`📚 Total d'élèves trouvés: ${studentsData.length}`, 'info');
      
      const testStudent = studentsData.find(s => s.id === createdUserId);
      
      if (!testStudent) {
        addLog('❌ ERREUR: Élève test non trouvé dans les résultats!', 'error');
        return;
      }
      
      addLog('✅ Élève test trouvé dans les résultats!', 'success');
      addLog(`   Classe visible: ${testStudent.class || '(undefined)'}`, 'info');
      addLog(`   Nom de classe: ${testStudent.classNameFr || '(undefined)'}`, 'info');

      // ========================================
      // STEP 5: Test filtering
      // ========================================
      addLog('🔍 ÉTAPE 5: Test du filtrage par classe...', 'info');
      
      const filterValue = TEST_CLASS_CODE;
      const filteredStudents = studentsData.filter(student => {
        const matchesClass = filterValue === 'all' || student.class === filterValue;
        
        if (student.id === createdUserId) {
          addLog(`🔍 Debug du filtrage:`, 'info');
          addLog(`   student.class: "${student.class}"`, 'info');
          addLog(`   filterValue: "${filterValue}"`, 'info');
          addLog(`   matchesClass: ${matchesClass}`, 'info');
          addLog(`   Comparaison: ${student.class === filterValue}`, 'info');
        }
        
        return matchesClass;
      });
      
      const testStudentFiltered = filteredStudents.find(s => s.id === createdUserId);
      
      if (!testStudentFiltered) {
        addLog('❌ ERREUR: Élève test NON trouvé après filtrage!', 'error');
        return;
      }
      
      addLog(`✅ Élève correctement filtré par classe!`, 'success');
      addLog(`📊 ${filteredStudents.length} élève(s) avec la classe "${filterValue}"`, 'info');

      // ========================================
      // STEP 6: Check dropdown classes
      // ========================================
      addLog('🏫 ÉTAPE 6: Vérification des classes du dropdown...', 'info');
      
      const dropdownClassesQuery = query(
        collection(db, 'classes'),
        where('enabled', '==', true)
      );
      const dropdownClassesSnapshot = await getDocs(dropdownClassesQuery);
      const dropdownClasses = dropdownClassesSnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      
      addLog(`📋 Classes disponibles dans le dropdown: ${dropdownClasses.length}`, 'info');
      
      const classInDropdown = dropdownClasses.find(c => c.code === TEST_CLASS_CODE);
      
      if (!classInDropdown) {
        addLog(`❌ ERREUR: Classe "${TEST_CLASS_CODE}" absente du dropdown!`, 'error');
        return;
      }
      
      addLog(`✅ Classe trouvée dans le dropdown: ${classInDropdown.nameFr}`, 'success');

      // ========================================
      // SUCCESS
      // ========================================
      addLog('', 'info');
      addLog('✅ ================================', 'success');
      addLog('   TEST RÉUSSI! ✨', 'success');
      addLog('   ================================', 'success');
      addLog('', 'info');
      addLog('📊 Résumé:', 'success');
      addLog(`   ✅ Classe existe dans la base: ${classData.nameFr}`, 'success');
      addLog(`   ✅ Élève créé avec la classe: ${TEST_CLASS_CODE}`, 'success');
      addLog(`   ✅ Données vérifiées dans Firestore`, 'success');
      addLog(`   ✅ Élève apparaît dans la requête du dashboard`, 'success');
      addLog(`   ✅ Élève correctement filtré par classe`, 'success');
      addLog(`   ✅ Classe apparaît dans les options du dropdown`, 'success');
      addLog('', 'info');
      addLog('💡 Conclusion: Le système fonctionne correctement!', 'success');
      
      toast.success('Test réussi! Vérifiez les résultats ci-dessous.');

    } catch (error) {
      addLog('', 'info');
      addLog('❌ ================================', 'error');
      addLog('   TEST ÉCHOUÉ!', 'error');
      addLog('   ================================', 'error');
      addLog('', 'info');
      addLog(`🐛 Erreur: ${error.message}`, 'error');
      addLog(`Code: ${error.code || 'N/A'}`, 'error');
      console.error('Full error:', error);
      
      toast.error('Test échoué! Consultez les logs.');
    } finally {
      setTestRunning(false);
    }
  };

  const cleanupTestStudent = async () => {
    if (!testStudent) {
      toast.error('Aucun élève test à nettoyer');
      return;
    }

    try {
      addLog('🧹 Nettoyage: Suppression de l\'élève test...', 'info');
      
      // Delete Firestore document
      if (testStudent.id) {
        await deleteDoc(doc(db, 'users', testStudent.id));
        addLog(`✅ Document supprimé: ${testStudent.id}`, 'success');
      }
      
      // Note: Cannot delete auth user from client-side without being signed in as that user
      addLog(`⚠️  Pour supprimer l'utilisateur Auth (${testStudent.authUid}), utilisez Firebase Console`, 'warning');
      
      addLog('✨ Nettoyage du document Firestore terminé!', 'success');
      toast.success('Élève test supprimé de Firestore');
      setTestStudent(null);
    } catch (error) {
      addLog(`❌ Erreur de nettoyage: ${error.message}`, 'error');
      toast.error('Erreur lors du nettoyage');
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧪 Test: Inscription Élève & Classe
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ce test vérifie que :
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
            <li>La classe existe dans la collection Firestore</li>
            <li>L'élève est créé avec le bon champ "class"</li>
            <li>La classe apparaît correctement dans le Teacher Dashboard</li>
            <li>Le filtrage par classe fonctionne</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={runTest}
              disabled={testRunning}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {testRunning ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Test en cours...
                </>
              ) : (
                <>
                  ▶️ Lancer le Test
                </>
              )}
            </button>

            {testStudent && (
              <button
                onClick={cleanupTestStudent}
                disabled={testRunning}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                🧹 Nettoyer l'Élève Test
              </button>
            )}
          </div>

          {testStudent && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                ⚠️ Élève test créé: {testStudent.email}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Document ID: {testStudent.id}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Auth UID: {testStudent.authUid}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {testResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📊 Résultats du Test
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto font-mono text-sm">
              {testResults.map((log, index) => (
                <div
                  key={index}
                  className={`py-1 ${getLogColor(log.type)}`}
                >
                  <span className="text-gray-400 text-xs mr-2">[{log.timestamp}]</span>
                  <span className="mr-1">{getLogIcon(log.type)}</span>
                  <span className="whitespace-pre-wrap">{log.message}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setTestResults([])}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                🗑️ Effacer les Logs
              </button>
              <button
                onClick={() => {
                  const logsText = testResults.map(log => 
                    `[${log.timestamp}] ${log.message}`
                  ).join('\n');
                  navigator.clipboard.writeText(logsText);
                  toast.success('Logs copiés dans le presse-papier!');
                }}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
              >
                📋 Copier les Logs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestStudentClass;
