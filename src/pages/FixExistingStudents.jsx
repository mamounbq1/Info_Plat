import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const FixExistingStudents = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentsToFix, setStudentsToFix] = useState([]);
  const [classes, setClasses] = useState([]);
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState([]);

  useEffect(() => {
    scanStudents();
  }, []);

  const scanStudents = async () => {
    setLoading(true);
    setStudentsToFix([]);
    setFixed([]);
    
    try {
      // Fetch all classes for reference
      const classesQuery = query(
        collection(db, 'classes'),
        where('enabled', '==', true)
      );
      const classesSnapshot = await getDocs(classesQuery);
      const classesData = classesSnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setClasses(classesData);

      // Fetch all students
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);

      // Find students that need fixing (have 'level' but missing 'class')
      const needsFix = studentsData.filter(s => s.level && !s.class);
      setStudentsToFix(needsFix);

      if (needsFix.length === 0) {
        toast.success('✅ Tous les étudiants ont déjà le champ class!');
      } else {
        toast.info(`⚠️ ${needsFix.length} étudiant(s) à corriger`);
      }
    } catch (error) {
      console.error('Error scanning students:', error);
      toast.error('Erreur lors du scan');
    } finally {
      setLoading(false);
    }
  };

  const extractClassFromLevel = (level) => {
    // level format: "TC-SF" ou "1BAC-MATH" ou "2BAC-PC"
    // We need to find a matching class in the classes collection
    
    const parts = level.split('-');
    if (parts.length !== 2) {
      return null;
    }

    const levelCode = parts[0]; // "TC", "1BAC", "2BAC"
    const branchCode = parts[1]; // "SF", "MATH", "PC"

    // Find classes matching this level and branch
    const matchingClasses = classes.filter(c => 
      c.levelCode === levelCode && c.branchCode === branchCode
    );

    if (matchingClasses.length === 0) {
      return null;
    }

    // Return the first matching class (or we could let user choose)
    return matchingClasses[0];
  };

  const fixAllStudents = async () => {
    setFixing(true);
    const fixedStudents = [];

    try {
      for (const student of studentsToFix) {
        const matchingClass = extractClassFromLevel(student.level);
        
        if (!matchingClass) {
          console.error(`No class found for level: ${student.level} (${student.email})`);
          continue;
        }

        // Update the student document
        const studentDocRef = doc(db, 'users', student.id);
        await updateDoc(studentDocRef, {
          class: matchingClass.code,
          classNameFr: matchingClass.nameFr,
          classNameAr: matchingClass.nameAr,
          levelCode: matchingClass.levelCode || matchingClass.level,
          branchCode: matchingClass.branchCode || matchingClass.branch
        });

        fixedStudents.push({
          ...student,
          class: matchingClass.code,
          classNameFr: matchingClass.nameFr
        });

        console.log(`✅ Fixed ${student.email}: class=${matchingClass.code}`);
      }

      setFixed(fixedStudents);
      toast.success(`✅ ${fixedStudents.length} étudiant(s) corrigé(s)!`);
      
      // Re-scan to update the view
      await scanStudents();
    } catch (error) {
      console.error('Error fixing students:', error);
      toast.error('Erreur lors de la correction');
    } finally {
      setFixing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Scan des étudiants en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔧 Correction des Étudiants Existants
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page corrige automatiquement les étudiants créés avec le bug (ayant <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">level</code> mais pas <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">class</code>)
          </p>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={scanStudents}
              disabled={fixing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              🔄 Re-scanner
            </button>
            
            {studentsToFix.length > 0 && (
              <button
                onClick={fixAllStudents}
                disabled={fixing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold"
              >
                {fixing ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⚙️</span>
                    Correction en cours...
                  </>
                ) : (
                  <>
                    ✨ Corriger {studentsToFix.length} Étudiant(s)
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Étudiants</div>
            <div className="text-3xl font-bold text-blue-600">{students.length}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">À Corriger</div>
            <div className="text-3xl font-bold text-orange-600">{studentsToFix.length}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Corrigés</div>
            <div className="text-3xl font-bold text-green-600">{fixed.length}</div>
          </div>
        </div>

        {/* Students to Fix */}
        {studentsToFix.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ⚠️ Étudiants à Corriger ({studentsToFix.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Level Actuel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      → Classe à Assigner
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {studentsToFix.map((student) => {
                    const matchingClass = extractClassFromLevel(student.level);
                    return (
                      <tr key={student.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {student.fullName}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded font-mono">
                            {student.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {matchingClass ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-mono">
                              {matchingClass.code} - {matchingClass.nameFr}
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              ❌ Aucune classe correspondante
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fixed Students */}
        {fixed.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ✅ Étudiants Corrigés ({fixed.length})
            </h2>
            
            <div className="space-y-2">
              {fixed.map((student) => (
                <div
                  key={student.id}
                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {student.email} - {student.fullName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Classe ajoutée : <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{student.class}</code> - {student.classNameFr}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All OK */}
        {studentsToFix.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tout est OK !
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tous les étudiants ont déjà le champ <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">class</code>
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            ℹ️ Comment ça marche ?
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <p>
              <strong>Problème :</strong> Le bug dans AuthContext ignorait les champs <code>class</code>, <code>classNameFr</code>, etc.
            </p>
            <p>
              <strong>Solution :</strong> Cette page extrait le niveau et la filière depuis le champ <code>level</code> (ex: "TC-SF") et trouve la classe correspondante dans la collection <code>classes</code>.
            </p>
            <p><strong>Exemple :</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>level: "TC-SF"</code> → trouve classe <code>TC-SF-1</code> (première classe Tronc Commun Sciences)</li>
              <li><code>level: "2BAC-PC"</code> → trouve classe <code>2BAC-PC-1</code> (première classe 2BAC Physique-Chimie)</li>
            </ul>
            <p className="pt-2">
              ⚠️ <strong>Note :</strong> Si plusieurs classes correspondent (ex: TC-SF-1, TC-SF-2), la première sera choisie automatiquement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixExistingStudents;
