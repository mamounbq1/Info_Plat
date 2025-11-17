import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import SharedLayout from '../components/SharedLayout';
import { 
  CalendarIcon, 
  ArrowLeftIcon, 
  ClockIcon,
  MapPinIcon,
  ShareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
    fetchRelatedEvents();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'homepage-events', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedEvents = async () => {
    try {
      const q = query(
        collection(db, 'homepage-events'),
        where('enabled', '==', true),
        limit(4)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(e => e.id !== id);
      setRelatedEvents(data);
    } catch (error) {
      console.error('Error fetching related events:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString;
  };

  if (loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SharedLayout>
    );
  }

  if (!event) return null;

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {isArabic ? 'العودة للأحداث' : 'Retour aux événements'}
          </button>

          {/* Main Content */}
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className={`p-8 ${event.featured ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
              {event.featured && (
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                  <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {isArabic ? 'حدث مميز' : 'ÉVÉNEMENT À LA UNE'}
                  </span>
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {event[isArabic ? 'titleAr' : 'titleFr']}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{isArabic ? event.dateAr : event.dateFr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>{isArabic ? event.timeAr : event.timeFr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  <span>{isArabic ? event.locationAr : event.locationFr}</span>
                </div>
              </div>
            </div>

            {/* Image (if exists) */}
            {event.imageUrl && (
              <div className="px-8 pt-8">
                <img 
                  src={event.imageUrl} 
                  alt={event[isArabic ? 'titleAr' : 'titleFr']}
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
                {event[isArabic ? 'descriptionAr' : 'descriptionFr']?.split('\n').map((paragraph, idx) => (
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
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                  {isArabic ? 'مشاركة الحدث' : 'Partager l\'événement'}
                </button>
              </div>
            </div>
          </article>

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {isArabic ? 'أحداث أخرى' : 'Autres événements'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedEvents.map((related) => (
                  <article
                    key={related.id}
                    onClick={() => navigate(`/events/${related.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
                  >
                    {related.featured && (
                      <SparklesIcon className="w-5 h-5 text-blue-600 mb-2" />
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {related[isArabic ? 'titleAr' : 'titleFr']}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {related[isArabic ? 'descriptionAr' : 'descriptionFr']}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{isArabic ? related.dateAr : related.dateFr}</span>
                    </div>
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
