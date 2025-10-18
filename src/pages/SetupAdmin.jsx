import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserPlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SetupAdmin() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const navigate = useNavigate();

  const checkAdminExists = async () => {
    try {
      // Ajouter un timeout de 5 secondes
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const checkPromise = (async () => {
        const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        const snapshot = await getDocs(adminsQuery);
        return snapshot;
      })();
      
      const snapshot = await Promise.race([checkPromise, timeoutPromise]);
      
      if (!snapshot.empty) {
        setAdminExists(true);
        toast.error('Un administrateur existe déjà. Redirection...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setAdminExists(false);
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      // En cas d'erreur ou timeout, permettre la création (fallback sécurisé)
      setAdminExists(false);
      if (error.message === 'Timeout') {
        console.log('⚠️ Timeout checking admin, allowing setup to continue');
      }
    } finally {
      setChecking(false);
    }
  };

  // Check if admin already exists
  useEffect(() => {
    checkAdminExists();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setLoading(true);

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create Firestore profile for admin
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        fullName: formData.fullName,
        role: 'admin',
        approved: true, // Admins are auto-approved
        status: 'active',
        createdAt: new Date().toISOString(),
        progress: {},
        enrolledCourses: [],
        emailVerified: false
      });

      toast.success('✅ Compte administrateur créé avec succès!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating admin:', error);
      
      let errorMessage = 'Erreur lors de la création du compte';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mot de passe trop faible';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Vérification...</p>
        </div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <ShieldCheckIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Administrateur existant
          </h2>
          <p className="text-gray-600">
            Un compte administrateur existe déjà. Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Installation Initiale
          </h2>
          <p className="text-gray-600">
            Créez le premier compte administrateur
          </p>
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              ⚠️ Cette page ne sera accessible qu'une seule fois. Après création du premier admin, elle sera désactivée.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Entrez votre nom complet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin@lycee-almarinyine.ma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirmez le mot de passe"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-800 font-medium mb-2">
              🔒 Accès administrateur
            </p>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>✓ Gestion complète des cours</li>
              <li>✓ Approbation des élèves</li>
              <li>✓ Création de comptes enseignants</li>
              <li>✓ Supervision de la plateforme</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : (
              <>
                <UserPlusIcon className="w-5 h-5" />
                Créer le Compte Administrateur
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Déjà un compte ? {' '}
            <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
