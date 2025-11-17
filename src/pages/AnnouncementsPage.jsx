import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import SharedLayout from '../components/SharedLayout';
import { MegaphoneIcon, CalendarIcon, ClockIcon, BellAlertIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function AnnouncementsPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, urgent, normal

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'homepage-announcements'),
        where('enabled', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      const allSnapshot = await getDocs(collection(db, 'homepage-announcements'));
      const data = allSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(a => a.enabled)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === 'urgent') return a.urgent;
    if (filter === 'normal') return !a.urgent;
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isArabic
      ? date.toLocaleDateString('ar-MA')
      : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MegaphoneIcon className="w-5 h-5" />
              {isArabic ? 'الإعلانات' : 'Annonces'}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'جميع الإعلانات' : 'Toutes les Annonces'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isArabic ? 'ابق على اطلاع بآخر الأخبار والإعلانات المهمة' : 'Restez informé des dernières nouvelles et annonces importantes'}
            </p>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === 'all'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {isArabic ? 'الكل' : 'Toutes'} ({announcements.length})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === 'urgent'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {isArabic ? 'عاجل' : 'Urgent'} ({announcements.filter(a => a.urgent).length})
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === 'normal'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {isArabic ? 'عادي' : 'Normal'} ({announcements.filter(a => !a.urgent).length})
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          )}

          {/* Announcements Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnnouncements.map((announcement) => (
                <article
                  key={announcement.id}
                  onClick={() => navigate(`/announcements/${announcement.id}`)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2"
                >
                  {/* Image (if exists) */}
                  {announcement.imageUrl && (
                    <div className="mb-4 -mx-6 -mt-6">
                      <img 
                        src={announcement.imageUrl} 
                        alt={announcement[isArabic ? 'titleAr' : 'titleFr']}
                        className="w-full h-48 object-cover rounded-t-2xl"
                      />
                    </div>
                  )}

                  {/* Urgent Badge */}
                  {announcement.urgent && (
                    <div className="flex items-center gap-2 mb-4">
                      <BellAlertIcon className="w-5 h-5 text-red-600 animate-pulse" />
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold">
                        {isArabic ? 'عاجل' : 'URGENT'}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {announcement[isArabic ? 'titleAr' : 'titleFr']}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {announcement[isArabic ? 'contentAr' : 'contentFr']}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAnnouncements.length === 0 && (
            <div className="text-center py-12">
              <MegaphoneIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-500 dark:text-gray-400">
                {isArabic ? 'لا توجد إعلانات' : 'Aucune annonce trouvée'}
              </p>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
