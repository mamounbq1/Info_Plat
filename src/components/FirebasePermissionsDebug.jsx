/**
 * FirebasePermissionsDebug.jsx - COMPOSANT DE DIAGNOSTIC
 * 
 * Ce composant aide à diagnostiquer les problèmes de permissions Firebase Storage.
 * À utiliser temporairement pour débugger.
 */

import { useState } from 'react';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function FirebasePermissionsDebug() {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Vérifier l'authentification
      const user = auth.currentUser;
      results.tests.push({
        name: 'Authentication',
        status: user ? 'success' : 'error',
        details: user ? {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        } : 'User not authenticated'
      });

      if (user) {
        // Test 2: Vérifier le document Firestore user
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          results.tests.push({
            name: 'Firestore User Document',
            status: userDoc.exists() ? 'success' : 'error',
            details: userDoc.exists() ? {
              exists: true,
              role: userDoc.data().role || 'NOT SET',
              fullData: userDoc.data()
            } : 'User document does not exist in Firestore'
          });
        } catch (error) {
          results.tests.push({
            name: 'Firestore User Document',
            status: 'error',
            details: `Error: ${error.message}`
          });
        }

        // Test 3: Test d'upload Storage
        try {
          const testContent = new Blob(['test-' + Date.now()], { type: 'text/plain' });
          const testFilename = `hero-images/test-${Date.now()}.txt`;
          const storageRef = ref(storage, testFilename);
          
          await uploadBytes(storageRef, testContent);
          
          results.tests.push({
            name: 'Storage Upload Test',
            status: 'success',
            details: `Successfully uploaded to: ${testFilename}`
          });

          // Nettoyage
          try {
            await deleteObject(storageRef);
            results.tests.push({
              name: 'Storage Cleanup',
              status: 'success',
              details: 'Test file deleted successfully'
            });
          } catch (cleanupError) {
            results.tests.push({
              name: 'Storage Cleanup',
              status: 'warning',
              details: `Could not delete test file: ${cleanupError.message}`
            });
          }
        } catch (error) {
          results.tests.push({
            name: 'Storage Upload Test',
            status: 'error',
            details: {
              code: error.code,
              message: error.message,
              fullError: error.toString()
            }
          });
        }
      }
    } catch (error) {
      results.tests.push({
        name: 'General Error',
        status: 'error',
        details: error.toString()
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Firebase Permissions Diagnostic
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test des permissions Storage et vérification de la configuration
            </p>
          </div>
        </div>
        
        <button
          onClick={runDiagnostics}
          disabled={testing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {testing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Test en cours...
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-5 h-5" />
              Lancer le diagnostic
            </>
          )}
        </button>
      </div>

      {testResults && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Test effectué le:</span>
            <span className="font-mono">{new Date(testResults.timestamp).toLocaleString()}</span>
          </div>

          <div className="space-y-3">
            {testResults.tests.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  test.status === 'success'
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : test.status === 'warning'
                    ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getStatusIcon(test.status)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {test.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                        {test.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {typeof test.details === 'object' ? (
                        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      ) : (
                        <p>{test.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommandations */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Recommandations
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✓ Si "Storage Upload Test" échoue, vérifiez les règles Storage dans Firebase Console</li>
                  <li>✓ Si "role" n'est pas "admin", mettez à jour le document dans Firestore</li>
                  <li>✓ Si le document utilisateur n'existe pas, créez-le manuellement dans Firestore</li>
                  <li>✓ Assurez-vous que les règles Storage sont publiées (bouton "Publish")</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
