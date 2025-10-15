import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
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
  const { signup, loginWithGoogle } = useAuth();
  const { t, isArabic } = useLanguage();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs');
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
      await signup(formData.email, formData.password, {
        fullName: formData.fullName,
        role: formData.role
      });
      toast.success(isArabic ? 'تم إنشاء الحساب بنجاح!' : 'Compte créé avec succès!');
      navigate('/dashboard');
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
      navigate('/dashboard');
    } catch (error) {
      console.error('Google signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('signup')}
          </h2>
          <p className="text-gray-600 mt-2">
            {isArabic 
              ? 'إنشاء حساب جديد للبدء'
              : 'Créez un nouveau compte pour commencer'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fullName')}
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Entrez votre nom complet'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Entrez votre email'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isArabic ? 'نوع الحساب' : 'Type de compte'}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="student">{isArabic ? 'طالب' : 'Étudiant'}</option>
              <option value="admin">{isArabic ? 'مدرس / مسؤول' : 'Enseignant / Admin'}</option>
            </select>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
              {isArabic ? (
                <>أوافق على <Link to="/terms" className="text-blue-600 hover:text-blue-700">الشروط والأحكام</Link> و <Link to="/privacy" className="text-blue-600 hover:text-blue-700">سياسة الخصوصية</Link></>
              ) : (
                <>J'accepte les <Link to="/terms" className="text-blue-600 hover:text-blue-700">termes et conditions</Link> et la <Link to="/privacy" className="text-blue-600 hover:text-blue-700">politique de confidentialité</Link></>
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
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {isArabic ? 'أو التسجيل بواسطة' : 'Ou inscrivez-vous avec'}
              </span>
            </div>
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">
              {isArabic ? 'التسجيل عبر Google' : 'Continuer avec Google'}
            </span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t('loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
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
