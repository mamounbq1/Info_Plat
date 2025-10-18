import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

export default function CreateProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { isArabic } = useLanguage();

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Profile exists, redirect to dashboard
        toast.success(isArabic ? 'الملف الشخصي موجود بالفعل' : 'Profil déjà existant');
        navigate('/dashboard');
      } else {
        // Profile doesn't exist, show form
        setChecking(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error(isArabic ? 'يرجى إدخال الاسم الكامل' : 'Veuillez entrer votre nom complet');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Veuillez vous connecter d\'abord');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        fullName: formData.fullName,
        role: formData.role,
        createdAt: new Date().toISOString(),
        progress: {},
        enrolledCourses: [],
        emailVerified: user.emailVerified
      });
      
      toast.success(isArabic ? 'تم إنشاء الملف الشخصي بنجاح!' : 'Profil créé avec succès!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload(); // Force reload to update auth context
      }, 1000);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error(isArabic ? 'خطأ في إنشاء الملف الشخصي' : 'Erreur lors de la création du profil');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {isArabic ? 'جاري التحقق من الملف الشخصي...' : 'Vérification du profil...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isArabic ? 'إكمال ملفك الشخصي' : 'Complétez votre profil'}
          </h2>
          <p className="text-gray-600">
            {isArabic 
              ? 'نحتاج بعض المعلومات لإعداد حسابك'
              : 'Nous avons besoin de quelques informations pour configurer votre compte'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isArabic ? 'الاسم الكامل' : 'Nom complet'}
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Entrez votre nom complet'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isArabic ? 'نوع الحساب' : 'Type de compte'}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="student">{isArabic ? 'طالب' : 'Élève'}</option>
              <option value="teacher">{isArabic ? 'معلم' : 'Professeur'}</option>
              <option value="admin">{isArabic ? 'مسؤول' : 'Administrateur'}</option>
            </select>
            <div className="mt-2 text-sm text-gray-600">
              {formData.role === 'student' && (
                <p>
                  {isArabic 
                    ? '📚 الوصول إلى الدروس والمواد التعليمية'
                    : '📚 Accès aux cours et matériels pédagogiques'
                  }
                </p>
              )}
              {formData.role === 'teacher' && (
                <p>
                  {isArabic 
                    ? '👨‍🏫 إنشاء وإدارة الدروس، متابعة تقدم الطلاب'
                    : '👨‍🏫 Créer et gérer des cours, suivre la progression des élèves'
                  }
                </p>
              )}
              {formData.role === 'admin' && (
                <p>
                  {isArabic 
                    ? '⚙️ إدارة كاملة للموقع، المستخدمين والمحتوى'
                    : '⚙️ Gestion complète du site, utilisateurs et contenu'
                  }
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {isArabic 
                ? 'ℹ️ يمكنك تغيير هذه المعلومات لاحقاً من إعدادات الحساب'
                : 'ℹ️ Vous pourrez modifier ces informations plus tard dans les paramètres'
              }
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isArabic ? 'جاري الحفظ...' : 'Enregistrement...'}
              </span>
            ) : (
              isArabic ? 'حفظ ومتابعة' : 'Enregistrer et continuer'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
