import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const DiagnoseClassesStructure = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    diagnoseClasses();
  }, []);

  const diagnoseClasses = async () => {
    setLoading(true);
    
    try {
      // Fetch first 5 classes to check their structure
      const classesQuery = query(
        collection(db, 'classes'),
        where('enabled', '==', true),
        limit(5)
      );
      const snapshot = await getDocs(classesQuery);
      const classesData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setClasses(classesData);
      
      console.log('📊 Sample classes structure:', classesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🔍 Diagnostic: Structure des Classes
          </h1>
          
          <div className="space-y-6">
            {classes.map((classItem, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                  Classe #{index + 1}: {classItem.code}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      📋 Champs Détectés:
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      {Object.keys(classItem).map(key => (
                        <div key={key} className="flex gap-2">
                          <span className="text-blue-600 dark:text-blue-400">{key}:</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {typeof classItem[key]} = {JSON.stringify(classItem[key])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ✅ Vérifications:
                    </div>
                    <div className="space-y-2">
                      <div className={`p-2 rounded ${classItem.level ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {classItem.level ? '✅' : '❌'} Champ <code>level</code>: {classItem.level || 'MANQUANT'}
                      </div>
                      <div className={`p-2 rounded ${classItem.branch ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {classItem.branch ? '✅' : '❌'} Champ <code>branch</code>: {classItem.branch || 'MANQUANT'}
                      </div>
                      <div className={`p-2 rounded ${classItem.levelCode ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                        {classItem.levelCode ? '✅' : '⚠️'} Champ <code>levelCode</code>: {classItem.levelCode || 'ABSENT'}
                      </div>
                      <div className={`p-2 rounded ${classItem.branchCode ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                        {classItem.branchCode ? '✅' : '⚠️'} Champ <code>branchCode</code>: {classItem.branchCode || 'ABSENT'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    💡 Analyse:
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    {!classItem.levelCode && !classItem.branchCode ? (
                      <span>⚠️ <strong>Problème:</strong> Les champs <code>levelCode</code> et <code>branchCode</code> sont manquants. 
                      La page Signup ne pourra PAS trouver cette classe car elle cherche ces champs spécifiques!</span>
                    ) : (
                      <span>✅ Cette classe a les bons champs pour être trouvée par Signup</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
              🎯 Conclusion et Recommandations:
            </h3>
            <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-2">
              <p>
                <strong>Signup.jsx cherche les classes avec:</strong>
              </p>
              <pre className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded font-mono text-xs">
where('levelCode', '==', levelCode),
where('branchCode', '==', branchCode)
              </pre>
              
              <p className="pt-2">
                <strong>Si vos classes n'ont pas ces champs, deux solutions:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Ajouter les champs <code>levelCode</code> et <code>branchCode</code> à toutes les classes (avec la page /fix-classes-level-branch modifiée)</li>
                <li>Modifier Signup.jsx pour chercher avec <code>level</code> et <code>branch</code> au lieu de <code>levelCode</code> et <code>branchCode</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnoseClassesStructure;
