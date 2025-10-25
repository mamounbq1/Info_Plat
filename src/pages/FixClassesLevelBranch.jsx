import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const FixClassesLevelBranch = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [classesToFix, setClassesToFix] = useState([]);
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState([]);

  useEffect(() => {
    scanClasses();
  }, []);

  const scanClasses = async () => {
    setLoading(true);
    setClassesToFix([]);
    setFixed([]);
    
    try {
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

      // Find classes that need fixing (missing either set of fields)
      const needsFix = classesData.filter(c => 
        !c.level || !c.branch || !c.levelCode || !c.branchCode
      );
      setClassesToFix(needsFix);

      if (needsFix.length === 0) {
        toast.success('✅ Toutes les classes ont déjà tous les champs requis!');
      } else {
        toast.info(`⚠️ ${needsFix.length} classe(s) à corriger`);
      }
    } catch (error) {
      console.error('Error scanning classes:', error);
      toast.error('Erreur lors du scan des classes');
    } finally {
      setLoading(false);
    }
  };

  const extractLevelAndBranch = (code) => {
    // Parse code like "2BAC-PC-1" or "TC-SF-1" or "1BAC-MATH-2"
    const parts = code.split('-');
    
    if (parts.length < 2) {
      return { level: null, branch: null };
    }

    const level = parts[0]; // "2BAC", "TC", "1BAC"
    const branch = parts[1]; // "PC", "SF", "MATH"
    
    return { level, branch };
  };

  const fixAllClasses = async () => {
    setFixing(true);
    const fixedClasses = [];

    try {
      for (const classItem of classesToFix) {
        const { level, branch } = extractLevelAndBranch(classItem.code);
        
        if (!level || !branch) {
          console.error(`Cannot extract level/branch from code: ${classItem.code}`);
          continue;
        }

        // Update the document with BOTH naming conventions
        const classDocRef = doc(db, 'classes', classItem.docId);
        await updateDoc(classDocRef, {
          level,        // For test and general use
          branch,       // For test and general use
          levelCode: level,   // For Signup.jsx compatibility
          branchCode: branch  // For Signup.jsx compatibility
        });

        fixedClasses.push({
          ...classItem,
          level,
          branch,
          levelCode: level,
          branchCode: branch
        });

        console.log(`✅ Fixed ${classItem.code}: level=${level}, branch=${branch}`);
      }

      setFixed(fixedClasses);
      toast.success(`✅ ${fixedClasses.length} classe(s) corrigée(s) avec succès!`);
      
      // Re-scan to update the view
      await scanClasses();
    } catch (error) {
      console.error('Error fixing classes:', error);
      toast.error('Erreur lors de la correction des classes');
    } finally {
      setFixing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Scan des classes en cours...</p>
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
            🔧 Correction des Classes : Champs level et branch
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page ajoute automatiquement les champs <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">level</code> et{' '}
            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">branch</code> manquants dans les documents de classe
          </p>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={scanClasses}
              disabled={fixing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              🔄 Re-scanner
            </button>
            
            {classesToFix.length > 0 && (
              <button
                onClick={fixAllClasses}
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
                    ✨ Corriger {classesToFix.length} Classe(s)
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Classes</div>
            <div className="text-3xl font-bold text-blue-600">{classes.length}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">À Corriger</div>
            <div className="text-3xl font-bold text-orange-600">{classesToFix.length}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Corrigées</div>
            <div className="text-3xl font-bold text-green-600">{fixed.length}</div>
          </div>
        </div>

        {/* Classes to Fix */}
        {classesToFix.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ⚠️ Classes à Corriger ({classesToFix.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Level Actuel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Branch Actuel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      → Level Extrait
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      → Branch Extrait
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {classesToFix.map((classItem) => {
                    const { level, branch } = extractLevelAndBranch(classItem.code);
                    return (
                      <tr key={classItem.docId}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                          {classItem.code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {classItem.nameFr}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-red-600 dark:text-red-400 italic">
                            {classItem.level || 'undefined'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-red-600 dark:text-red-400 italic">
                            {classItem.branch || 'undefined'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-mono">
                            {level || '?'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-mono">
                            {branch || '?'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fixed Classes */}
        {fixed.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ✅ Classes Corrigées ({fixed.length})
            </h2>
            
            <div className="space-y-2">
              {fixed.map((classItem) => (
                <div
                  key={classItem.docId}
                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {classItem.code} - {classItem.nameFr}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Ajouté : <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">level: "{classItem.level}"</code>,{' '}
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">branch: "{classItem.branch}"</code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All OK */}
        {classesToFix.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tout est OK !
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Toutes les classes ont déjà les champs <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">level</code> et{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">branch</code>
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
              Cette page analyse le <strong>code</strong> de chaque classe et en extrait automatiquement les champs <code>level</code> et <code>branch</code>.
            </p>
            <p><strong>Exemples :</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>2BAC-PC-1</code> → level: <code>"2BAC"</code>, branch: <code>"PC"</code></li>
              <li><code>TC-SF-3</code> → level: <code>"TC"</code>, branch: <code>"SF"</code></li>
              <li><code>1BAC-MATH-2</code> → level: <code>"1BAC"</code>, branch: <code>"MATH"</code></li>
            </ul>
            <p className="pt-2">
              ⚠️ <strong>Important :</strong> Cette opération modifie directement les documents dans Firestore. Assurez-vous d'avoir une sauvegarde !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixClassesLevelBranch;
