import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import SharedLayout from '../components/SharedLayout';
import { 
  MegaphoneIcon, 
  CalendarIcon, 
  ArrowLeftIcon, 
  BellAlertIcon,
  ClockIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [announcement, setAnnouncement] = useState(null);
  const [relatedAnnouncements, setRelatedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
    fetchRelatedAnnouncements();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'homepage-announcements', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setAnnouncement({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate('/announcements');
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
      navigate('/announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedAnnouncements = async () => {
    try {
      const q = query(
        collection(db, 'homepage-announcements'),
        where('enabled', '==', true),
        limit(3)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(a => a.id !== id);
      setRelatedAnnouncements(data);
    } catch (error) {
      console.error('Error fetching related announcements:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isArabic
      ? date.toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </SharedLayout>
    );
  }

  if (!announcement) return null;

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/announcements')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {isArabic ? 'العودة للإعلانات' : 'Retour aux annonces'}
          </button>

          {/* Main Content */}
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className={`p-8 ${announcement.urgent ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-orange-500 to-pink-500'}`}>
              {announcement.urgent && (
                <div className="flex items-center gap-2 mb-4">
                  <BellAlertIcon className="w-6 h-6 text-white animate-pulse" />
                  <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {isArabic ? 'إعلان عاجل' : 'ANNONCE URGENTE'}
                  </span>
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {announcement[isArabic ? 'titleAr' : 'titleFr']}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{formatDate(announcement.createdAt)}</span>
                </div>
                {announcement.expiryDate && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>{isArabic ? 'صالح حتى' : 'Valide jusqu\'au'} {formatDate(announcement.expiryDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Image (if exists) */}
            {announcement.imageUrl && (
              <div className="px-8 pt-8">
                <img 
                  src={announcement.imageUrl} 
                  alt={announcement[isArabic ? 'titleAr' : 'titleFr']}
                  className="w-full h-96 object-cover rounded-xl shadow-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                style={{ direction: isArabic ? 'rtl' : 'ltr' }}
              >
                {announcement[isArabic ? 'contentAr' : 'contentFr']?.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Share Button */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert(isArabic ? 'تم نسخ الرابط' : 'Lien copié');
                  }}
                  className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                  {isArabic ? 'مشاركة الإعلان' : 'Partager l\'annonce'}
                </button>
              </div>
            </div>
          </article>

          {/* Related Announcements */}
          {relatedAnnouncements.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {isArabic ? 'إعلانات أخرى' : 'Autres annonces'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedAnnouncements.map((related) => (
                  <article
                    key={related.id}
                    onClick={() => navigate(`/announcements/${related.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
                  >
                    {related.urgent && (
                      <BellAlertIcon className="w-5 h-5 text-red-600 mb-2" />
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {related[isArabic ? 'titleAr' : 'titleFr']}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {related[isArabic ? 'contentAr' : 'contentFr']}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
