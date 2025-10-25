import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  NewspaperIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { NEWS_CATEGORIES, getCategoryColor, getCategoryLabel } from '../constants/newsCategories';

export default function NewsPage() {
  const { isArabic } = useLanguage();
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 9;

  // Use categories from shared constants
  const categories = NEWS_CATEGORIES;

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, searchTerm, selectedCategory]);

  const fetchNews = async () => {
    try {
      const newsRef = collection(db, 'homepage-news');
      let newsQuery;
      
      try {
        // Try with orderBy first (requires index)
        newsQuery = query(newsRef, where('enabled', '==', true), orderBy('order', 'asc'));
        const newsSnapshot = await getDocs(newsQuery);
        const newsData = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNews(newsData);
      } catch (error) {
        console.log('Index not available, using fallback query');
        // Fallback: just filter by enabled
        newsQuery = query(newsRef, where('enabled', '==', true));
        const newsSnapshot = await getDocs(newsQuery);
        const newsData = newsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setNews(newsData);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = [...news];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(article => {
        const title = isArabic ? article.titleAr : article.titleFr;
        const excerpt = isArabic ? article.excerptAr : article.excerptFr;
        return title?.toLowerCase().includes(search) || excerpt?.toLowerCase().includes(search);
      });
    }

    setFilteredNews(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Use functions from shared constants
  const getCategoryBadgeColor = getCategoryColor;
  const getCategoryLabelText = (category) => getCategoryLabel(category, isArabic);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isArabic 
      ? date.toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Pagination
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <NewspaperIcon className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'الأخبار والإعلانات' : 'Actualités et Annonces'}
            </h1>
            <p className="text-xl text-blue-100">
              {isArabic 
                ? 'ابق على اطلاع بآخر الأخبار والأحداث من مدرستنا'
                : 'Restez informé des dernières nouvelles et événements de notre école'}
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <MagnifyingGlassIcon className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={isArabic ? 'البحث في الأخبار...' : 'Rechercher dans les actualités...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
              <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isArabic ? category.label.ar : category.label.fr}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredNews.length} {isArabic ? 'نتيجة' : 'résultat(s)'}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {currentNews.length === 0 ? (
            <div className="text-center py-20">
              <NewspaperIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'لا توجد أخبار' : 'Aucune actualité'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isArabic ? 'لم يتم العثور على نتائج للبحث الخاص بك' : 'Aucun résultat trouvé pour votre recherche'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentNews.map((article) => (
                  <Link
                    key={article.id}
                    to={`/news/${article.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-violet-600 overflow-hidden">
                      {article.image ? (
                        <img
                          src={article.image}
                          alt={isArabic ? article.titleAr : article.titleFr}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <NewspaperIcon className="w-20 h-20 text-white opacity-50" />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {article.category && (
                        <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(article.category)}`}>
                            <TagIcon className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                            {getCategoryLabelText(article.category)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Date */}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <CalendarIcon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {formatDate(article.date)}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {isArabic ? article.titleAr : article.titleFr}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {isArabic ? article.excerptAr : article.excerptFr}
                      </p>

                      {/* Read More */}
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                        <span>{isArabic ? 'اقرأ المزيد' : 'Lire la suite'}</span>
                        <ArrowRightIcon className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isArabic ? 'السابق' : 'Précédent'}
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === index + 1
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isArabic ? 'التالي' : 'Suivant'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </SharedLayout>
  );
}
