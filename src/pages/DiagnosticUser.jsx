import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { forceRefreshToken, getCustomClaims } from '../utils/refreshToken';
import toast from 'react-hot-toast';

export default function DiagnosticUser() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch Firestore document
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setError('Document utilisateur introuvable dans Firestore');
        }

        // Fetch Firebase Auth token claims
        const idTokenResult = await currentUser.getIdTokenResult();
        setTokenData({
          claims: idTokenResult.claims,
          authTime: idTokenResult.authTime,
          issuedAtTime: idTokenResult.issuedAtTime,
          expirationTime: idTokenResult.expirationTime
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Force refresh token and reload data
  const handleRefreshToken = async () => {
    setRefreshing(true);
    try {
      await forceRefreshToken();
      
      // Reload token data
      const idTokenResult = await currentUser.getIdTokenResult(true);
      setTokenData({
        claims: idTokenResult.claims,
        authTime: idTokenResult.authTime,
        issuedAtTime: idTokenResult.issuedAtTime,
        expirationTime: idTokenResult.expirationTime
      });
      
      toast.success('Token actualisé avec succès!');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation du token');
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔍 Diagnostic Utilisateur
        </h1>

        {/* Authentication Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            1. Statut d'authentification
          </h2>
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center text-green-600 dark:text-green-400">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">✅ Authentifié</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>UID:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{currentUser.uid}</code>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  <strong>Email:</strong> {currentUser.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">❌ Non authentifié</span>
            </div>
          )}
        </div>

        {/* Firestore Document */}
        {currentUser && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Document Firestore (/users/{currentUser.uid})
            </h2>
            
            {loading ? (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-300">Erreur</h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : userData ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 dark:text-green-400 mb-4">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">✅ Document trouvé</span>
                </div>
                
                {/* Role Check */}
                <div className={`p-4 rounded-lg border-2 ${
                  userData.role === 'admin' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                }`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    🔑 Rôle de l'utilisateur
                  </h3>
                  {userData.role === 'admin' ? (
                    <p className="text-green-700 dark:text-green-300">
                      <strong>Role:</strong> <span className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded font-mono">{userData.role}</span> ✅ Admin confirmé
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-yellow-700 dark:text-yellow-300">
                        <strong>Role:</strong> <span className="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded font-mono">{userData.role || 'undefined'}</span>
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ Le rôle n'est pas "admin". Les uploads Storage seront refusés.
                      </p>
                    </div>
                  )}
                </div>

                {/* Full Document Data */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    📄 Données complètes du document
                  </h3>
                  <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto text-gray-800 dark:text-gray-200">
{JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Firebase Token Info */}
        {currentUser && tokenData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Token Firebase (ID Token)
            </h2>
            
            <div className="space-y-4">
              {/* Token expiration */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ⏰ Validité du token
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Créé le:</strong> {new Date(tokenData.authTime).toLocaleString('fr-FR')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Émis le:</strong> {new Date(tokenData.issuedAtTime).toLocaleString('fr-FR')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Expire le:</strong> {new Date(tokenData.expirationTime).toLocaleString('fr-FR')}
                </p>
              </div>

              {/* Custom claims */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🔐 Custom Claims (rôle dans le token)
                </h3>
                {tokenData.claims.role ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>✅ Rôle présent dans le token: <strong>{tokenData.claims.role}</strong></span>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 p-3 rounded">
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      ⚠️ <strong>PROBLÈME TROUVÉ!</strong> Le token ne contient pas de custom claim "role".
                    </p>
                    <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
                      Les règles Storage vérifient le rôle dans Firestore avec <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">get()</code>, 
                      mais Firebase peut avoir mis en cache un vieux token. Essayez de vous déconnecter/reconnecter.
                    </p>
                  </div>
                )}
                
                {/* Full claims object */}
                <div className="mt-3">
                  <details className="cursor-pointer">
                    <summary className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                      Voir tous les claims du token
                    </summary>
                    <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto text-gray-800 dark:text-gray-200 mt-2">
{JSON.stringify(tokenData.claims, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Storage Rules Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            4. Règle Storage actuelle
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
{`match /gallery/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && 
              get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}`}
            </pre>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
            Cette règle vérifie que <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">role == 'admin'</code> dans le document Firestore.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📋 Solutions au problème 403
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>Déconnexion/Reconnexion (RECOMMANDÉ)</strong>
              <p className="ml-6 mt-1 text-xs text-gray-600 dark:text-gray-400">
                Déconnectez-vous puis reconnectez-vous pour forcer Firebase à générer un nouveau token avec les permissions à jour.
              </p>
            </li>
            <li>
              <strong>Vérifier que le rôle Firestore est bien "admin"</strong>
              <p className="ml-6 mt-1 text-xs text-gray-600 dark:text-gray-400">
                Confirmé ci-dessus ✅
              </p>
            </li>
            <li>
              <strong>Attendre 1 heure (cache Firebase)</strong>
              <p className="ml-6 mt-1 text-xs text-gray-600 dark:text-gray-400">
                Les tokens Firebase expirent après 1h. Le prochain token aura les bonnes permissions.
              </p>
            </li>
            <li>
              <strong>Simplifier temporairement la règle Storage</strong>
              <p className="ml-6 mt-1 text-xs text-gray-600 dark:text-gray-400">
                Remplacer <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">allow write: if request.auth != null && get(...).role == 'admin'</code>
                <br />par <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">allow write: if request.auth != null</code> (tous les users authentifiés)
              </p>
            </li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Refresh Token Button */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">🔄 Actualiser le token</h3>
            <p className="mb-4 text-sm">Force Firebase à régénérer votre token pour obtenir les custom claims à jour (sans déconnexion).</p>
            <button
              onClick={handleRefreshToken}
              disabled={refreshing || !currentUser}
              className="bg-white text-green-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualisation...
                </>
              ) : (
                'Actualiser maintenant'
              )}
            </button>
          </div>

          {/* Logout/Login Button */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">🚀 Déconnexion/Reconnexion</h3>
            <p className="mb-4 text-sm">Méthode garantie pour obtenir un nouveau token avec les custom claims à jour.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Aller à la page de connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
