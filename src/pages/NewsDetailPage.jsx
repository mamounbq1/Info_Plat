import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  CalendarIcon, 
  ClockIcon, 
  TagIcon,
  ShareIcon,
  ArrowLeftIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = {
    academic: { fr: 'Académique', ar: 'أكاديمي' },
    sports: { fr: 'Sports', ar: 'رياضة' },
    culture: { fr: 'Culture', ar: 'ثقافة' },
    events: { fr: 'Événements', ar: 'أحداث' },
    achievements: { fr: 'Réalisations', ar: 'إنجازات' }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      // Fetch main article
      const articleRef = doc(db, 'homepage-news', id);
      const articleSnap = await getDoc(articleRef);

      if (articleSnap.exists()) {
        const articleData = { id: articleSnap.id, ...articleSnap.data() };
        setArticle(articleData);
        
        // Fetch related articles (same category, excluding current)
        await fetchRelatedArticles(articleData.category);
      } else {
        console.error('Article not found');
        navigate('/news');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (category) => {
    if (!category) return;

    try {
      const newsRef = collection(db, 'homepage-news');
      const relatedQuery = query(
        newsRef, 
        where('category', '==', category),
        where('enabled', '==', true),
        limit(4)
      );
      
      const relatedSnapshot = await getDocs(relatedQuery);
      const related = relatedSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(article => article.id !== id)
        .slice(0, 3); // Only 3 related articles
      
      setRelatedArticles(related);
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      sports: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      culture: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      events: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      achievements: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isArabic 
      ? date.toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isArabic ? article.titleAr : article.titleFr,
          text: isArabic ? article.excerptAr : article.excerptFr,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(isArabic ? 'تم نسخ الرابط' : 'Lien copié');
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

  if (!article) {
    return (
      <SharedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <NewspaperIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'المقالة غير موجودة' : 'Article introuvable'}
            </h2>
            <Link to="/news" className="text-blue-600 hover:text-blue-700">
              {isArabic ? 'العودة إلى الأخبار' : 'Retour aux actualités'}
            </Link>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeftIcon className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
            <span>{isArabic ? 'العودة إلى الأخبار' : 'Retour aux actualités'}</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <article className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {article.category && (
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getCategoryBadgeColor(article.category)}`}>
                  <TagIcon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {isArabic ? categories[article.category]?.ar : categories[article.category]?.fr}
                </span>
              )}
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                <span>{formatDate(article.date)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {isArabic ? article.titleAr : article.titleFr}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {isArabic ? article.excerptAr : article.excerptFr}
            </p>

            {/* Share Button */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>{isArabic ? 'مشاركة' : 'Partager'}</span>
              </button>
            </div>

            {/* Featured Image */}
            {article.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-12 h-96">
                <img
                  src={article.imageUrl}
                  alt={isArabic ? article.titleAr : article.titleFr}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.parentElement.className = 'relative rounded-2xl overflow-hidden shadow-2xl mb-12 h-96 bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center';
                    e.target.style.display = 'none';
                    const icon = document.createElement('div');
                    icon.innerHTML = '<svg class="w-32 h-32 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>';
                    e.target.parentElement.appendChild(icon.firstChild);
                  }}
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
                {(isArabic ? article.contentAr : article.contentFr)?.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="text-lg leading-relaxed">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {isArabic ? 'مقالات ذات صلة' : 'Articles Connexes'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/news/${relatedArticle.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-violet-600">
                    {relatedArticle.imageUrl ? (
                      <img
                        src={relatedArticle.imageUrl}
                        alt={isArabic ? relatedArticle.titleAr : relatedArticle.titleFr}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <NewspaperIcon className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <CalendarIcon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {formatDate(relatedArticle.date)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {isArabic ? relatedArticle.titleAr : relatedArticle.titleFr}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {isArabic ? relatedArticle.excerptAr : relatedArticle.excerptFr}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SharedLayout>
  );
}
