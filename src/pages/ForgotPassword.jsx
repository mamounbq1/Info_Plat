import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { isArabic } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(isArabic ? 'يرجى إدخال البريد الإلكتروني' : 'Veuillez entrer votre email');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setEmailSent(true);
      toast.success(isArabic ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' : 'Lien de réinitialisation envoyé à votre email');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(isArabic ? 'خطأ في إرسال البريد الإلكتروني' : 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Back to Login Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          {isArabic ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isArabic ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié?'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isArabic 
              ? 'لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور'
              : 'Pas de problème! Entrez votre email et nous vous enverrons un lien de réinitialisation'
            }
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'البريد الإلكتروني' : 'Adresse email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Entrez votre email'}
              />
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
                  {isArabic ? 'جاري الإرسال...' : 'Envoi...'}
                </span>
              ) : (
                isArabic ? 'إرسال رابط إعادة التعيين' : 'Envoyer le lien'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                {isArabic 
                  ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.'
                  : 'Un lien de réinitialisation a été envoyé à votre email. Veuillez vérifier votre boîte de réception.'
                }
              </p>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                {isArabic 
                  ? 'لم تتلق البريد الإلكتروني؟ تحقق من مجلد الرسائل غير المرغوب فيها أو '
                  : 'Vous n\'avez pas reçu l\'email? Vérifiez votre dossier spam ou '
                }
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isArabic ? 'حاول مرة أخرى' : 'réessayez'}
                </button>
              </p>
            </div>

            <Link
              to="/login"
              className="inline-block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              {isArabic ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isArabic ? 'تذكرت كلمة المرور؟ ' : 'Vous vous souvenez de votre mot de passe? '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              {isArabic ? 'تسجيل الدخول' : 'Se connecter'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
