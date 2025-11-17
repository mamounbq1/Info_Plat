import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { CalendarIcon, MapPinIcon, ClockIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function EventsPage() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'homepage-events'),
        where('enabled', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Try without where clause if index doesn't exist
      try {
        const fallbackQuery = query(collection(db, 'homepage-events'), orderBy('order', 'asc'));
        const snapshot = await getDocs(fallbackQuery);
        const eventsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(event => event.enabled !== false);
        setEvents(eventsData);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const titleFr = (event.titleFr || '').toLowerCase();
    const titleAr = (event.titleAr || '').toLowerCase();
    const descriptionFr = (event.descriptionFr || '').toLowerCase();
    const descriptionAr = (event.descriptionAr || '').toLowerCase();
    const dateFr = (event.dateFr || '').toLowerCase();
    const dateAr = (event.dateAr || '').toLowerCase();
    const locationFr = (event.locationFr || '').toLowerCase();
    const locationAr = (event.locationAr || '').toLowerCase();
    
    return titleFr.includes(searchLower) || titleAr.includes(searchLower) ||
           descriptionFr.includes(searchLower) || descriptionAr.includes(searchLower) ||
           dateFr.includes(searchLower) || dateAr.includes(searchLower) ||
           locationFr.includes(searchLower) || locationAr.includes(searchLower);
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <CalendarIcon className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'الأحداث القادمة' : 'Événements à Venir'}
            </h1>
            <p className="text-xl text-blue-100">
              {isArabic 
                ? 'لا تفوت أحداثنا وأنشطتنا القادمة'
                : 'Ne manquez pas nos événements et activités à venir'}
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isArabic ? 'ابحث في الأحداث...' : 'Rechercher dans les événements...'}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
              {filteredEvents.length} {isArabic ? 'حدث' : 'événement(s)'}
              {totalPages > 1 && (
                <>
                  <span className="mx-2">•</span>
                  <span>{isArabic ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} sur ${totalPages}`}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Timeline */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {isArabic ? 'جاري التحميل...' : 'Chargement...'}
                </p>
              </div>
            ) : currentEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? (isArabic ? 'لم يتم العثور على أحداث' : 'Aucun événement trouvé')
                    : (isArabic ? 'لا توجد أحداث متاحة' : 'Aucun événement disponible')
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isArabic ? 'مسح البحث' : 'Effacer la recherche'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {currentEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  >
                    <div className="md:flex">
                      {/* Image or Date Badge */}
                      {event.imageUrl ? (
                        <div className="md:w-64 h-48 md:h-auto">
                          <img 
                            src={event.imageUrl}
                            alt={isArabic ? event.titleAr : event.titleFr}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="md:w-32 bg-gradient-to-br from-blue-600 to-violet-600 flex flex-col items-center justify-center p-6 text-white">
                          <CalendarIcon className="w-12 h-12 mb-2" />
                          <div className="text-sm text-center">
                            {isArabic ? event.dateAr : event.dateFr}
                          </div>
                        </div>
                      )}

                      {/* Event Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {isArabic ? event.titleAr : event.titleFr}
                          </h3>
                          {event.featured && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                              <SparklesIcon className="w-4 h-4" />
                              {isArabic ? 'مميز' : 'À la une'}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {isArabic ? event.descriptionAr : event.descriptionFr}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
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

                        <button
                          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {isArabic ? 'التفاصيل' : 'Voir les détails'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredEvents.length > eventsPerPage && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {isArabic ? 'السابق' : 'Précédent'}
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-medium transition ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {isArabic ? 'التالي' : 'Suivant'}
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic 
                    ? `عرض ${indexOfFirstEvent + 1} - ${Math.min(indexOfLastEvent, filteredEvents.length)} من ${filteredEvents.length}`
                    : `Affichage de ${indexOfFirstEvent + 1} - ${Math.min(indexOfLastEvent, filteredEvents.length)} sur ${filteredEvents.length}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
