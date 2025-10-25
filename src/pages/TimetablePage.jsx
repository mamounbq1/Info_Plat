import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import { ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TimetablePage() {
  const { isArabic } = useLanguage();

  const days = [
    { fr: 'Lundi', ar: 'الإثنين' },
    { fr: 'Mardi', ar: 'الثلاثاء' },
    { fr: 'Mercredi', ar: 'الأربعاء' },
    { fr: 'Jeudi', ar: 'الخميس' },
    { fr: 'Vendredi', ar: 'الجمعة' },
    { fr: 'Samedi', ar: 'السبت' }
  ];

  const timeSlots = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeftIcon className="w-5 h-5" />
          {isArabic ? 'العودة' : 'Retour'}
        </Link>

        <div className="text-center mb-12">
          <ClockIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'جدول الحصص' : 'Emploi du Temps'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isArabic ? 'جدول الدروس الأسبوعي' : 'Horaire hebdomadaire des cours'}
          </p>
        </div>

        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                  {isArabic ? 'الوقت' : 'Horaire'}
                </th>
                {days.map((day, idx) => (
                  <th key={idx} className="p-4 text-center font-semibold text-gray-900 dark:text-white">
                    {isArabic ? day.ar : day.fr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-4 font-medium text-gray-700 dark:text-gray-300">{slot}</td>
                  {days.map((_, dayIdx) => (
                    <td key={dayIdx} className="p-4 text-center">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 min-h-[60px] flex items-center justify-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">-</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {isArabic 
              ? 'سيتم تحديث جدول الحصص قريباً'
              : 'L\'emploi du temps sera mis à jour prochainement'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
