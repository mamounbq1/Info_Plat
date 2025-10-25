import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import { 
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AcademicCalendarPage() {
  const { isArabic } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Try to fetch from Firestore
      const eventsRef = collection(db, 'academicEvents');
      const q = query(eventsRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);
      } else {
        // Use default events if none in database
        setEvents(getDefaultEvents());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Use default events on error
      setEvents(getDefaultEvents());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultEvents = () => [
    {
      id: 1,
      titleFr: 'Rentrée Scolaire',
      titleAr: 'الدخول المدرسي',
      date: '2024-09-02',
      type: 'important',
      descriptionFr: 'Début de l\'année scolaire 2024-2025',
      descriptionAr: 'بداية السنة الدراسية 2024-2025'
    },
    {
      id: 2,
      titleFr: 'Examens du Premier Semestre',
      titleAr: 'امتحانات الدورة الأولى',
      date: '2025-01-15',
      type: 'exam',
      descriptionFr: 'Examens de fin du premier semestre',
      descriptionAr: 'امتحانات نهاية الدورة الأولى'
    },
    {
      id: 3,
      titleFr: 'Vacances de Printemps',
      titleAr: 'عطلة الربيع',
      date: '2025-03-20',
      type: 'holiday',
      descriptionFr: 'Deux semaines de vacances',
      descriptionAr: 'أسبوعان من العطلة'
    },
    {
      id: 4,
      titleFr: 'Examens du Baccalauréat',
      titleAr: 'امتحانات البكالوريا',
      date: '2025-06-10',
      type: 'exam',
      descriptionFr: 'Début des examens nationaux du Baccalauréat',
      descriptionAr: 'بداية الامتحانات الوطنية للبكالوريا'
    },
    {
      id: 5,
      titleFr: 'Fin de l\'Année Scolaire',
      titleAr: 'نهاية السنة الدراسية',
      date: '2025-06-30',
      type: 'important',
      descriptionFr: 'Dernier jour de l\'année scolaire',
      descriptionAr: 'آخر يوم من السنة الدراسية'
    }
  ];

  const getEventTypeColor = (type) => {
    const colors = {
      important: 'bg-blue-100 text-blue-800 border-blue-300',
      exam: 'bg-red-100 text-red-800 border-red-300',
      holiday: 'bg-green-100 text-green-800 border-green-300',
      event: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[type] || colors.event;
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      important: { fr: 'Important', ar: 'مهم' },
      exam: { fr: 'Examen', ar: 'امتحان' },
      holiday: { fr: 'Vacances', ar: 'عطلة' },
      event: { fr: 'Événement', ar: 'حدث' }
    };
    return isArabic ? labels[type]?.ar : labels[type]?.fr;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return isArabic 
      ? date.toLocaleDateString('ar-MA', options)
      : date.toLocaleDateString('fr-FR', options);
  };

  const getMonthFromDate = (dateString) => {
    const date = new Date(dateString);
    return date.getMonth();
  };

  const filteredEvents = selectedMonth === 'all' 
    ? events 
    : events.filter(event => getMonthFromDate(event.date) === parseInt(selectedMonth));

  const months = [
    { value: 'all', labelFr: 'Tous les mois', labelAr: 'كل الأشهر' },
    { value: '8', labelFr: 'Septembre', labelAr: 'سبتمبر' },
    { value: '9', labelFr: 'Octobre', labelAr: 'أكتوبر' },
    { value: '10', labelFr: 'Novembre', labelAr: 'نونبر' },
    { value: '11', labelFr: 'Décembre', labelAr: 'دجنبر' },
    { value: '0', labelFr: 'Janvier', labelAr: 'يناير' },
    { value: '1', labelFr: 'Février', labelAr: 'فبراير' },
    { value: '2', labelFr: 'Mars', labelAr: 'مارس' },
    { value: '3', labelFr: 'Avril', labelAr: 'أبريل' },
    { value: '4', labelFr: 'Mai', labelAr: 'ماي' },
    { value: '5', labelFr: 'Juin', labelAr: 'يونيو' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>{isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Retour à l\'accueil'}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <CalendarIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'التقويم الأكاديمي' : 'Calendrier Académique'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {isArabic 
              ? 'جميع التواريخ والأحداث المهمة للسنة الدراسية'
              : 'Toutes les dates et événements importants de l\'année scolaire'
            }
          </p>
        </div>

        {/* Filter */}
        <div className="max-w-md mx-auto mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isArabic ? 'تصفية حسب الشهر' : 'Filtrer par mois'}
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {isArabic ? month.labelAr : month.labelFr}
              </option>
            ))}
          </select>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'لا توجد أحداث لهذا الشهر' : 'Aucun événement pour ce mois'}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-blue-500"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {isArabic ? event.titleAr : event.titleFr}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isArabic ? event.descriptionAr : event.descriptionFr}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex flex-col items-center justify-center text-white">
                      <div className="text-2xl font-bold">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-xs uppercase">
                        {isArabic 
                          ? new Date(event.date).toLocaleDateString('ar-MA', { month: 'short' })
                          : new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <AcademicCapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'ملاحظة مهمة' : 'Note Importante'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {isArabic 
                  ? 'يتم تحديث التقويم بانتظام. يرجى التحقق بشكل متكرر للحصول على آخر التحديثات والتغييرات المحتملة.'
                  : 'Le calendrier est mis à jour régulièrement. Veuillez vérifier fréquemment pour les dernières mises à jour et changements éventuels.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
