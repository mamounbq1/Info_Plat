import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon,
  StarIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  TrophyIcon,
  VideoCameraIcon,
  BeakerIcon,
  CalculatorIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { t, isArabic } = useLanguage();
  const [heroContent, setHeroContent] = useState(null);
  const [features, setFeatures] = useState([]);
  const [news, setNews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      setLoading(true);
      console.log('🏠 [Home] Starting to fetch homepage content...');
      
      // Fetch hero content
      const heroDoc = await getDoc(doc(db, 'homepage', 'hero'));
      console.log('🎯 [Hero] Document exists:', heroDoc.exists(), 'Data:', heroDoc.data());
      if (heroDoc.exists() && heroDoc.data().enabled) {
        setHeroContent(heroDoc.data());
        console.log('✅ [Hero] Content loaded and enabled');
      } else {
        console.log('⚠️ [Hero] No hero content or disabled, using defaults');
      }

      // Fetch features with fallback for missing index
      try {
        const featuresQuery = query(
          collection(db, 'homepage-features'),
          where('enabled', '==', true),
          orderBy('order', 'asc')
        );
        const featuresSnapshot = await getDocs(featuresQuery);
        const featuresData = featuresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeatures(featuresData);
        console.log(`✅ [Features] Loaded ${featuresData.length} features with index`);
      } catch (error) {
        console.log('⚠️ [Features] Index not found, using fallback query');
        // Fallback: fetch all and filter/sort locally
        const allFeaturesSnapshot = await getDocs(collection(db, 'homepage-features'));
        const featuresData = allFeaturesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(f => f.enabled)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setFeatures(featuresData);
        console.log(`✅ [Features] Loaded ${featuresData.length} features with fallback`);
      }

      // Fetch news with fallback for missing index
      try {
        const newsQuery = query(
          collection(db, 'homepage-news'),
          where('enabled', '==', true),
          orderBy('publishDate', 'desc'),
          limit(3)
        );
        const newsSnapshot = await getDocs(newsQuery);
        const newsData = newsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNews(newsData);
        console.log(`✅ [News] Loaded ${newsData.length} news items with index`);
      } catch (error) {
        console.log('⚠️ [News] Index not found, using fallback query');
        // Fallback: fetch all and filter/sort locally
        const allNewsSnapshot = await getDocs(collection(db, 'homepage-news'));
        const newsData = allNewsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(n => n.enabled)
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
          .slice(0, 3);
        setNews(newsData);
        console.log(`✅ [News] Loaded ${newsData.length} news items with fallback`);
      }

      // Fetch testimonials with fallback
      try {
        const testimonialsQuery = query(
          collection(db, 'homepage-testimonials'),
          where('enabled', '==', true),
          limit(3)
        );
        const testimonialsSnapshot = await getDocs(testimonialsQuery);
        const testimonialsData = testimonialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTestimonials(testimonialsData);
        console.log(`✅ [Testimonials] Loaded ${testimonialsData.length} testimonials with index`);
      } catch (error) {
        console.log('⚠️ [Testimonials] Index not found, using fallback query');
        // Fallback: fetch all and filter locally
        const allTestimonialsSnapshot = await getDocs(collection(db, 'homepage-testimonials'));
        const testimonialsData = allTestimonialsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(t => t.enabled)
          .slice(0, 3);
        setTestimonials(testimonialsData);
        console.log(`✅ [Testimonials] Loaded ${testimonialsData.length} testimonials with fallback`);
      }

      // Fetch stats
      const statsDoc = await getDoc(doc(db, 'homepage', 'stats'));
      console.log('📊 [Stats] Document exists:', statsDoc.exists(), 'Data:', statsDoc.data());
      if (statsDoc.exists()) {
        setStats(statsDoc.data());
        console.log('✅ [Stats] Stats loaded');
      } else {
        console.log('⚠️ [Stats] No stats document found');
      }
      
      console.log('🏁 [Home] Finished loading all homepage content');
    } catch (error) {
      console.error('❌ [Home] Error fetching home content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping for features - complete list
  const iconMap = {
    BookOpenIcon,
    ClipboardDocumentCheckIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ChartBarIcon,
    CogIcon,
    DocumentTextIcon,
    GlobeAltIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    TrophyIcon,
    VideoCameraIcon,
    BeakerIcon,
    CalculatorIcon,
    CpuChipIcon,
    StarIcon,
    CalendarIcon
  };

  // Default features if none from database
  const defaultFeatures = [
    {
      icon: 'BookOpenIcon',
      titleFr: 'Cours Complets',
      titleAr: 'دروس كاملة',
      descriptionFr: 'Accédez à des cours détaillés pour Tronc Commun avec PDFs, vidéos et ressources',
      descriptionAr: 'الوصول إلى دروس مفصلة للجذع المشترك مع ملفات PDF ومقاطع فيديو وموارد'
    },
    {
      icon: 'ClipboardDocumentCheckIcon',
      titleFr: 'Quiz Interactifs',
      titleAr: 'اختبارات تفاعلية',
      descriptionFr: 'Testez vos connaissances avec des quiz et des devoirs interactifs',
      descriptionAr: 'اختبر معرفتك بالاختبارات والواجبات التفاعلية'
    },
    {
      icon: 'AcademicCapIcon',
      titleFr: 'Suivi de Progression',
      titleAr: 'تتبع التقدم',
      descriptionFr: 'Suivez votre progression et vos résultats en temps réel',
      descriptionAr: 'تتبع تقدمك ونتائجك في الوقت الفعلي'
    },
    {
      icon: 'UserGroupIcon',
      titleFr: 'Communauté Active',
      titleAr: 'مجتمع نشط',
      descriptionFr: 'Interagissez avec vos professeurs et camarades de classe',
      descriptionAr: 'تفاعل مع معلميك وزملائك في الفصل'
    }
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {heroContent 
              ? (isArabic ? heroContent.titleAr : heroContent.titleFr)
              : (isArabic ? 'منصة التعليم المغربية' : 'Plateforme Éducative Marocaine')
            }
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {heroContent
              ? (isArabic ? heroContent.subtitleAr : heroContent.subtitleFr)
              : (isArabic 
                ? 'منصة تعليمية شاملة لطلاب الجذع المشترك في المغرب. الوصول إلى الدروس والاختبارات والموارد في مكان واحد'
                : 'Plateforme éducative complète pour les élèves de Tronc Commun au Maroc. Accédez aux cours, quiz et ressources en un seul endroit'
              )
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              {heroContent?.buttonText1Fr 
                ? (isArabic ? heroContent.buttonText1Ar : heroContent.buttonText1Fr)
                : (isArabic ? 'ابدأ الآن' : 'Commencer Maintenant')
              }
            </Link>
            <Link 
              to="/login" 
              className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-lg border-2 border-blue-600"
            >
              {t('login')}
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {displayFeatures.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || BookOpenIcon;
            return (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <IconComponent className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {isArabic ? feature.titleAr : feature.titleFr}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isArabic ? feature.descriptionAr : feature.descriptionFr}
                </p>
              </div>
            );
          })}
        </div>

        {/* Statistics Section */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {isArabic ? value.valueAr : value.valueFr}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {isArabic ? value.labelAr : value.labelFr}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News/Announcements Section */}
        {news.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {isArabic ? 'الأخبار والإعلانات' : 'Actualités et Annonces'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(item.publishDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {isArabic ? item.titleAr : item.titleFr}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                      {isArabic ? item.contentAr : item.contentFr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {isArabic ? 'آراء الطلاب' : 'Témoignages'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    {testimonial.avatarUrl && (
                      <img 
                        src={testimonial.avatarUrl} 
                        alt="" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {isArabic ? testimonial.nameAr : testimonial.nameFr}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isArabic ? testimonial.roleAr : testimonial.roleFr}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "{isArabic ? testimonial.contentAr : testimonial.contentFr}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white mt-20 shadow-xl">
          <h2 className="text-3xl font-bold mb-4">
            {isArabic ? 'هل أنت مدرس؟' : 'Vous êtes professeur?'}
          </h2>
          <p className="text-xl mb-6">
            {isArabic 
              ? 'انضم كمسؤول وابدأ في مشاركة المحتوى مع طلابك'
              : 'Rejoignez en tant qu\'administrateur et commencez à partager du contenu avec vos élèves'
            }
          </p>
          <Link 
            to="/signup" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            {isArabic ? 'إنشاء حساب مدرس' : 'Créer un Compte Enseignant'}
          </Link>
        </div>
      </div>
    </div>
  );
}
