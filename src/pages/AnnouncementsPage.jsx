import { useState, useEffect } from 'react';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { MegaphoneIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AnnouncementsPage() {
  const { isArabic } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 10;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const announcementsRef = collection(db, 'homepage-announcements');
      let announcementsQuery;
      
      try {
        announcementsQuery = query(announcementsRef, where('enabled', '==', true), orderBy('order', 'asc'));
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const announcementsData = announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAnnouncements(announcementsData);
      } catch (error) {
        console.log('Index not available, using fallback query');
        announcementsQuery = query(announcementsRef, where('enabled', '==', true));
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const announcementsData = announcementsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setAnnouncements(announcementsData);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter announcements by search term
  const filteredAnnouncements = announcements.filter(announcement => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const titleFr = (announcement.titleFr || '').toLowerCase();
    const titleAr = (announcement.titleAr || '').toLowerCase();
    const dateFr = (announcement.dateFr || '').toLowerCase();
    const dateAr = (announcement.dateAr || '').toLowerCase();
    return titleFr.includes(searchLower) || titleAr.includes(searchLower) || 
           dateFr.includes(searchLower) || dateAr.includes(searchLower);
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAnnouncements.length / announcementsPerPage);
  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <MegaphoneIcon className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'الإعلانات' : 'Annonces'}
            </h1>
            <p className="text-xl text-blue-100">
              {isArabic 
                ? 'آخر الإعلانات والتحديثات المهمة'
                : 'Dernières annonces et mises à jour importantes'}
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isArabic ? 'ابحث في الإعلانات...' : 'Rechercher dans les annonces...'}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
              {filteredAnnouncements.length} {isArabic ? 'إعلان' : 'annonce(s)'}
              {totalPages > 1 && (
                <>
                  <span className="mx-2">•</span>
                  <span>
                    {isArabic ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} sur ${totalPages}`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Announcements List */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-20">
                <MegaphoneIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 
                    (isArabic ? 'لا توجد نتائج' : 'Aucun résultat') :
                    (isArabic ? 'لا توجد إعلانات' : 'Aucune annonce')
                  }
                </h3>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isArabic ? 'مسح البحث' : 'Effacer la recherche'}
                  </button>
                )}
              </div>
            ) : (
              currentAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${
                    announcement.urgent ? 'border-l-4 border-red-500' : ''
                  }`}
                >
                  {announcement.urgent && (
                    <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                      <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm font-medium animate-pulse">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                        {isArabic ? 'عاجل' : 'Urgent'}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {isArabic ? announcement.titleAr : announcement.titleFr}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📅 {isArabic ? announcement.dateAr : announcement.dateFr}
                  </p>
                </div>
              ))
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isArabic ? 'السابق' : 'Précédent'}
                </button>

                {/* Page Numbers */}
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const showPage = 
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                    
                    const showEllipsis = 
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return (
                        <span key={pageNumber} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isArabic ? 'التالي' : 'Suivant'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
