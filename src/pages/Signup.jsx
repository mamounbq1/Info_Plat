import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ACADEMIC_LEVELS, LEVELS_BY_CATEGORY, CATEGORY_LABELS } from '../constants/academicLevels';
import SharedLayout from '../components/SharedLayout';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Always student - only role allowed for public signup
    levelCode: '', // Student's level code (e.g., '2BAC')
    branchCode: '', // Student's branch code (e.g., 'SC')
    classCode: '', // Student's specific class code (e.g., '2BAC-SC-1')
    level: '', // OLD: kept for backward compatibility
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [levels, setLevels] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { t, isArabic } = useLanguage();
  const navigate = useNavigate();

  // Fetch levels from Firestore, fallback to constants
  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLevelsLoading(true);
      const levelsQuery = query(
        collection(db, 'academicLevels'),
        where('enabled', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(levelsQuery);
      
      if (snapshot.size > 0) {
        const levelsData = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));
        setLevels(levelsData);
        console.log('✅ Loaded', levelsData.length, 'academic levels');
      } else {
        console.warn('⚠️ No academic levels found in Firestore');
        setLevels([]);
      }
    } catch (error) {
      console.error('❌ Error fetching levels:', error);
      setLevels([]);
    } finally {
      setLevelsLoading(false);
    }
  };

  const fetchBranches = async (levelCode) => {
    try {
      setBranchesLoading(true);
      setBranches([]);
      setClasses([]);
      setFormData(prev => ({ ...prev, branchCode: '', classCode: '' }));
      
      const branchesQuery = query(
        collection(db, 'branches'),
        where('levelCode', '==', levelCode),
        where('enabled', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(branchesQuery);
      const branchesData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setBranches(branchesData);
      console.log('✅ Loaded', branchesData.length, 'branches for level', levelCode);
    } catch (error) {
      console.error('❌ Error fetching branches:', error);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  const fetchClasses = async (levelCode, branchCode) => {
    try {
      setClassesLoading(true);
      setClasses([]);
      setFormData(prev => ({ ...prev, classCode: '' }));
      
      const classesQuery = query(
        collection(db, 'classes'),
        where('levelCode', '==', levelCode),
        where('branchCode', '==', branchCode),
        where('enabled', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(classesQuery);
      const classesData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setClasses(classesData);
      console.log('✅ Loaded', classesData.length, 'classes for', levelCode, branchCode);
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  };

  const validatePassword = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleLevelChange = (e) => {
    const levelCode = e.target.value;
    setFormData(prev => ({ ...prev, levelCode, branchCode: '', classCode: '' }));
    
    if (levelCode) {
      fetchBranches(levelCode);
    } else {
      setBranches([]);
      setClasses([]);
    }
  };

  const handleBranchChange = (e) => {
    const branchCode = e.target.value;
    setFormData(prev => ({ ...prev, branchCode, classCode: '' }));
    
    if (branchCode && formData.levelCode) {
      fetchClasses(formData.levelCode, branchCode);
    } else {
      setClasses([]);
    }
  };

  const handleClassChange = (e) => {
    const classCode = e.target.value;
    setFormData(prev => ({ ...prev, classCode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.classCode) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول بما في ذلك اختيار الفصل' : 'Veuillez remplir tous les champs incluant la sélection de classe');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(isArabic ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      toast.error(isArabic ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error(isArabic ? 'يجب الموافقة على الشروط والأحكام' : 'Vous devez accepter les termes et conditions');
      return;
    }

    try {
      setLoading(true);
      
      // Get selected class details
      const selectedClass = classes.find(c => c.code === formData.classCode);
      
      if (!selectedClass) {
        toast.error(isArabic ? 'الفصل المحدد غير صالح' : 'Classe sélectionnée invalide');
        return;
      }
      
      await signup(formData.email, formData.password, {
        fullName: formData.fullName,
        role: 'student',
        // NEW: Complete class information
        class: formData.classCode,
        classNameFr: selectedClass.nameFr,
        classNameAr: selectedClass.nameAr,
        levelCode: formData.levelCode,
        branchCode: formData.branchCode,
        // OLD: for backward compatibility
        level: `${formData.levelCode}-${formData.branchCode}`
      });
      toast.success(
        isArabic 
          ? 'تم إنشاء الحساب بنجاح! في انتظار موافقة الإدارة.'
          : 'Compte créé avec succès! En attente d\'approbation de l\'administration.'
      );
      // Students are redirected to pending approval page
      navigate('/pending-approval');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      // Google signups create student accounts, redirect to pending approval
      navigate('/pending-approval');
    } catch (error) {
      console.error('Google signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('signup')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {isArabic 
                ? 'إنشاء حساب جديد للبدء'
                : 'Créez un nouveau compte pour commencer'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('fullName')}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Entrez votre nom complet'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Entrez votre email'}
              />
            </div>

            {/* Hierarchical Class Selection: Level → Branch → Class */}
            
            {/* Step 1: Academic Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AcademicCapIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'المستوى الدراسي' : 'Niveau Scolaire'} <span className="text-red-500">*</span>
              </label>
              <select
                name="levelCode"
                value={formData.levelCode}
                onChange={handleLevelChange}
                required
                disabled={levelsLoading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <option value="">
                {levelsLoading 
                  ? (isArabic ? 'جاري التحميل...' : 'Chargement...')
                  : (isArabic ? 'اختر المستوى' : 'Sélectionnez le niveau')
                }
              </option>
              {levels.map(level => (
                <option key={level.code} value={level.code}>
                  {isArabic ? level.nameAr : level.nameFr}
                </option>
              ))}
            </select>
            {levels.length === 0 && !levelsLoading && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {isArabic 
                  ? 'لا توجد مستويات متاحة. يرجى الاتصال بالإدارة.'
                  : 'Aucun niveau disponible. Veuillez contacter l\'administration.'}
              </p>
            )}
          </div>

          {/* Step 2: Branch/Type Selection (Conditional) */}
          {formData.levelCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الشعبة / التخصص' : 'Type / Filière'} <span className="text-red-500">*</span>
              </label>
              <select
                name="branchCode"
                value={formData.branchCode}
                onChange={handleBranchChange}
                required
                disabled={branchesLoading || branches.length === 0}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {branchesLoading
                    ? (isArabic ? 'جاري التحميل...' : 'Chargement...')
                    : branches.length === 0
                    ? (isArabic ? 'لا توجد شعب متاحة' : 'Aucune filière disponible')
                    : (isArabic ? 'اختر الشعبة' : 'Sélectionnez la filière')
                  }
                </option>
                {branches.map(branch => (
                  <option key={branch.code} value={branch.code}>
                    {isArabic ? branch.nameAr : branch.nameFr}
                  </option>
                ))}
              </select>
              {branches.length === 0 && !branchesLoading && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  {isArabic 
                    ? 'لا توجد شعب لهذا المستوى. يرجى الاتصال بالإدارة.'
                    : 'Aucune filière pour ce niveau. Veuillez contacter l\'administration.'}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Class Selection (Conditional) */}
          {formData.branchCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الفصل' : 'Classe'} <span className="text-red-500">*</span>
              </label>
              <select
                name="classCode"
                value={formData.classCode}
                onChange={handleClassChange}
                required
                disabled={classesLoading || classes.length === 0}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {classesLoading
                    ? (isArabic ? 'جاري التحميل...' : 'Chargement...')
                    : classes.length === 0
                    ? (isArabic ? 'لا توجد فصول متاحة' : 'Aucune classe disponible')
                    : (isArabic ? 'اختر الفصل' : 'Sélectionnez votre classe')
                  }
                </option>
                {classes.map(classItem => (
                  <option key={classItem.code} value={classItem.code}>
                    {isArabic ? classItem.nameAr : classItem.nameFr}
                  </option>
                ))}
              </select>
              {classes.length > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isArabic 
                    ? 'اختر الفصل الذي تدرس فيه'
                    : 'Choisissez la classe dans laquelle vous étudiez'}
                </p>
              )}
              {classes.length === 0 && !classesLoading && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {isArabic 
                    ? 'لا توجد فصول لهذه الشعبة. يرجى الاتصال بالإدارة.'
                    : 'Aucune classe pour cette filière. Veuillez contacter l\'administration.'}
                </p>
              )}
            </div>
          )}

          {/* Role removed - only students can register publicly */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                  {isArabic ? 'تسجيل حساب طالب' : 'Inscription Élève'}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  {isArabic 
                    ? 'هذا النموذج مخصص للطلاب فقط. بعد التسجيل، سيتم مراجعة حسابك من قبل الإدارة قبل الوصول إلى لوحة التحكم.'
                    : 'Ce formulaire est réservé aux élèves. Après inscription, votre compte sera vérifié par l\'administration avant d\'accéder au tableau de bord.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder={isArabic ? 'أدخل كلمة المرور' : 'Entrez votre mot de passe'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <PasswordRequirement 
                  met={passwordStrength.length} 
                  text={isArabic ? '8 أحرف على الأقل' : 'Au moins 8 caractères'} 
                />
                <PasswordRequirement 
                  met={passwordStrength.uppercase} 
                  text={isArabic ? 'حرف كبير واحد' : 'Une lettre majuscule'} 
                />
                <PasswordRequirement 
                  met={passwordStrength.lowercase} 
                  text={isArabic ? 'حرف صغير واحد' : 'Une lettre minuscule'} 
                />
                <PasswordRequirement 
                  met={passwordStrength.number} 
                  text={isArabic ? 'رقم واحد' : 'Un chiffre'} 
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder={isArabic ? 'تأكيد كلمة المرور' : 'Confirmez le mot de passe'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {isArabic ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas'}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {isArabic ? (
                <>أوافق على <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">الشروط والأحكام</Link> و <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">سياسة الخصوصية</Link></>
              ) : (
                <>J'accepte les <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">termes et conditions</Link> et la <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">politique de confidentialité</Link></>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.agreeToTerms}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isArabic ? 'جاري إنشاء الحساب...' : 'Création du compte...'}
              </span>
            ) : t('signup')}
          </button>
        </form>

        {/* Social Signup Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {isArabic ? 'أو التسجيل بواسطة' : 'Ou inscrivez-vous avec'}
              </span>
            </div>
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {isArabic ? 'التسجيل عبر Google' : 'Continuer avec Google'}
            </span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t('loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  </SharedLayout>
);
}

// Password Requirement Component
function PasswordRequirement({ met, text }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircleIcon className="h-4 w-4 text-green-500" />
      ) : (
        <XCircleIcon className="h-4 w-4 text-gray-300" />
      )}
      <span className={met ? 'text-green-600' : 'text-gray-500'}>{text}</span>
    </div>
  );
}
