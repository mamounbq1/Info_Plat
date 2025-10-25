import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { DocumentCheckIcon, ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function ResultsPortalPage() {
  const { isArabic } = useLanguage();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-20 mt-20 text-center">
          <LockClosedIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'يلزم تسجيل الدخول' : 'Connexion Requise'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {isArabic 
              ? 'يرجى تسجيل الدخول لعرض نتائجك'
              : 'Veuillez vous connecter pour consulter vos résultats'
            }
          </p>
          <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            {isArabic ? 'تسجيل الدخول' : 'Se Connecter'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeftIcon className="w-5 h-5" />
          {isArabic ? 'العودة' : 'Retour'}
        </Link>

        <div className="text-center mb-12">
          <DocumentCheckIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'بوابة النتائج' : 'Portail de Résultats'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isArabic ? 'عرض نتائج الامتحانات والتقييمات' : 'Consultez vos résultats d\'examens et évaluations'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <div className="text-center py-12">
            <DocumentCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isArabic ? 'لا توجد نتائج متاحة حالياً' : 'Aucun résultat disponible pour le moment'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {isArabic 
                ? 'سيتم نشر النتائج هنا بعد تصحيح الامتحانات'
                : 'Les résultats seront publiés ici après la correction des examens'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
