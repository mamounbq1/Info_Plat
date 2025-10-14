import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    courses: 'Cours',
    quizzes: 'Quizzes',
    dashboard: 'Tableau de bord',
    login: 'Connexion',
    signup: 'Inscription',
    logout: 'Déconnexion',
    profile: 'Profil',
    
    // Auth
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    fullName: 'Nom complet',
    forgotPassword: 'Mot de passe oublié?',
    dontHaveAccount: "Vous n'avez pas de compte?",
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    signupHere: 'Inscrivez-vous ici',
    loginHere: 'Connectez-vous ici',
    
    // Dashboard
    welcome: 'Bienvenue',
    myCourses: 'Mes cours',
    myProgress: 'Ma progression',
    uploadContent: 'Télécharger du contenu',
    manageStudents: 'Gérer les étudiants',
    createQuiz: 'Créer un quiz',
    
    // Courses
    viewCourse: 'Voir le cours',
    downloadPdf: 'Télécharger PDF',
    watchVideo: 'Regarder la vidéo',
    courseDescription: 'Description du cours',
    resources: 'Ressources',
    assignments: 'Devoirs',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    submit: 'Soumettre',
    close: 'Fermer',
    search: 'Rechercher',
    filter: 'Filtrer',
    loading: 'Chargement...',
    noData: 'Aucune donnée disponible',
    
    // Messages
    success: 'Succès',
    error: 'Erreur',
    warning: 'Attention',
    info: 'Information',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    courses: 'الدروس',
    quizzes: 'الاختبارات',
    dashboard: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    
    // Auth
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    fullName: 'الاسم الكامل',
    forgotPassword: 'نسيت كلمة المرور؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signupHere: 'سجل هنا',
    loginHere: 'سجل دخولك هنا',
    
    // Dashboard
    welcome: 'مرحبا',
    myCourses: 'دروسي',
    myProgress: 'تقدمي',
    uploadContent: 'رفع محتوى',
    manageStudents: 'إدارة الطلاب',
    createQuiz: 'إنشاء اختبار',
    
    // Courses
    viewCourse: 'عرض الدرس',
    downloadPdf: 'تحميل PDF',
    watchVideo: 'مشاهدة الفيديو',
    courseDescription: 'وصف الدرس',
    resources: 'الموارد',
    assignments: 'الواجبات',
    
    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    submit: 'إرسال',
    close: 'إغلاق',
    search: 'بحث',
    filter: 'تصفية',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات متاحة',
    
    // Messages
    success: 'نجح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('fr');
  const [direction, setDirection] = useState('ltr');

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('language') || 'fr';
    setLanguage(savedLang);
    updateDirection(savedLang);
  }, []);

  const updateDirection = (lang) => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    setDirection(dir);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'ar' : 'fr';
    setLanguage(newLang);
    updateDirection(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    direction,
    toggleLanguage,
    t,
    isArabic: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
