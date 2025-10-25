import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // If Firebase is not configured, immediately set loading to false
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
  }, []);

  // Register new user
  async function signup(email, password, userData) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      try {
        await sendEmailVerification(result.user);
        toast.success('Email de vérification envoyé!');
      } catch (verifyError) {
        console.error('Email verification error:', verifyError);
      }
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        fullName: userData.fullName,
        role: userData.role || 'student',
        level: userData.level || '', // Student's academic level (backward compatibility)
        // Spread all additional userData fields (class, classNameFr, classNameAr, levelCode, branchCode, etc.)
        ...userData,
        // Override with system fields to prevent manipulation
        approved: userData.role === 'admin' ? true : false, // Only students need approval
        status: userData.role === 'admin' ? 'active' : 'pending', // pending, active, rejected
        createdAt: new Date().toISOString(),
        progress: {},
        enrolledCourses: [],
        emailVerified: false
      });
      
      toast.success('Compte créé avec succès!');
      return result;
    } catch (error) {
      let errorMessage = 'Erreur lors de la création du compte';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mot de passe trop faible (min. 6 caractères)';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }

  // Send email verification
  async function verifyEmail() {
    try {
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        toast.success('Email de vérification envoyé!');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email de vérification');
      throw error;
    }
  }

  // Login user
  async function login(email, password, rememberMe = false) {
    try {
      // Set persistence based on remember me
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Connexion réussie!');
      return result;
    } catch (error) {
      let errorMessage = 'Email ou mot de passe incorrect';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun utilisateur trouvé avec cet email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Réessayez plus tard';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }

  // Login with Google
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create user profile for new Google users
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          fullName: result.user.displayName || 'User',
          role: 'student',
          level: '', // Will be set when user completes profile
          approved: false, // Students need approval
          status: 'pending',
          createdAt: new Date().toISOString(),
          progress: {},
          enrolledCourses: [],
          photoURL: result.user.photoURL
        });
      }
      
      toast.success('Connexion Google réussie!');
      return result;
    } catch (error) {
      let errorMessage = 'Erreur lors de la connexion Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Connexion annulée';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup bloquée par le navigateur';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }

  // Logout user
  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de réinitialisation envoyé');
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
      throw error;
    }
  }

  // Fetch user profile
  async function fetchUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        console.log('✅ User profile loaded:', { uid, role: profile.role, fullName: profile.fullName });
        setUserProfile(profile);
        return profile;
      } else {
        console.warn('⚠️ User profile not found in Firestore for uid:', uid);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    // Don't try to listen if Firebase is not configured
    if (!isFirebaseConfigured || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    verifyEmail,
    isAdmin: userProfile?.role === 'admin',
    isStudent: userProfile?.role === 'student',
    isTeacher: userProfile?.role === 'teacher',
    userRole: userProfile?.role, // Direct access to user role
    isApproved: userProfile?.approved === true, // Check if user is approved
    userStatus: userProfile?.status // pending, active, rejected
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
