import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SearchPage() {
  const { isArabic } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeftIcon className="w-5 h-5" />
          {isArabic ? 'العودة' : 'Retour'}
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <MagnifyingGlassIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'بحث' : 'Search'}
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              {isArabic ? 'المحتوى قيد الإنشاء' : 'Contenu en cours de création'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
