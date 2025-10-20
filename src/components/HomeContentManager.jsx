import { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, addDoc, getDocs, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  PhotoIcon,
  NewspaperIcon,
  MegaphoneIcon,
  StarIcon,
  ChartBarIcon,
  UserGroupIcon,
  LinkIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ✨ NOUVEAU: Import des 5 nouveaux composants CMS modulaires
import AnnouncementsManager from './cms/AnnouncementsManager';
import ClubsManager from './cms/ClubsManager';
import GalleryManager from './cms/GalleryManager';
import QuickLinksManager from './cms/QuickLinksManager';
import ContactManager from './cms/ContactManager';

export default function HomeContentManager() {
  const { isArabic } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('hero'); // hero, features, news, testimonials, stats
  
  // Hero Section State
  const [heroContent, setHeroContent] = useState({
    titleFr: '',
    titleAr: '',
    subtitleFr: '',
    subtitleAr: '',
    buttonText1Fr: '',
    buttonText1Ar: '',
    buttonText2Fr: '',
    buttonText2Ar: '',
    backgroundImage: '',
    enabled: true
  });

  // Features State
  const [features, setFeatures] = useState([]);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    titleFr: '',
    titleAr: '',
    descriptionFr: '',
    descriptionAr: '',
    icon: 'BookOpenIcon',
    order: 0,
    enabled: true
  });

  // News/Announcements State
  const [news, setNews] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsForm, setNewsForm] = useState({
    titleFr: '',
    titleAr: '',
    contentFr: '',
    contentAr: '',
    imageUrl: '',
    category: 'announcement',
    enabled: true,
    publishDate: new Date().toISOString().split('T')[0]
  });

  // Testimonials State
  const [testimonials, setTestimonials] = useState([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    nameFr: '',
    nameAr: '',
    roleFr: '',
    roleAr: '',
    contentFr: '',
    contentAr: '',
    avatarUrl: '',
    rating: 5,
    enabled: true
  });

  // Statistics State
  const [stats, setStats] = useState({
    students: { valueFr: '1000+', valueAr: '1000+', labelFr: 'Étudiants', labelAr: 'طلاب' },
    courses: { valueFr: '50+', valueAr: '50+', labelFr: 'Cours', labelAr: 'دروس' },
    teachers: { valueFr: '20+', valueAr: '20+', labelFr: 'Enseignants', labelAr: 'معلمين' },
    satisfaction: { valueFr: '95%', valueAr: '95%', labelFr: 'Satisfaction', labelAr: 'رضا' }
  });

  const iconOptions = [
    'BookOpenIcon',
    'AcademicCapIcon',
    'ClipboardDocumentCheckIcon',
    'UserGroupIcon',
    'ChartBarIcon',
    'CpuChipIcon',
    'GlobeAltIcon',
    'LightBulbIcon',
    'RocketLaunchIcon',
    'SparklesIcon'
  ];

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchHeroContent(),
        fetchFeatures(),
        fetchNews(),
        fetchTestimonials(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error(isArabic ? 'خطأ في تحميل المحتوى' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroContent = async () => {
    try {
      const docRef = doc(db, 'homepage', 'hero');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHeroContent(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching hero:', error);
    }
  };

  const fetchFeatures = async () => {
    try {
      const q = query(collection(db, 'homepage-features'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const featuresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeatures(featuresData);
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const q = query(collection(db, 'homepage-news'), orderBy('publishDate', 'desc'));
      const snapshot = await getDocs(q);
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const q = query(collection(db, 'homepage-testimonials'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const testimonialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const docRef = doc(db, 'homepage', 'stats');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStats(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Save Hero Content
  const handleSaveHero = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await setDoc(doc(db, 'homepage', 'hero'), {
        ...heroContent,
        updatedAt: new Date().toISOString()
      });
      toast.success(isArabic ? 'تم حفظ القسم الرئيسي' : 'Section Hero sauvegardée');
    } catch (error) {
      console.error('Error saving hero:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Feature Operations
  const handleSaveFeature = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingFeature) {
        await updateDoc(doc(db, 'homepage-features', editingFeature.id), {
          ...featureForm,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم تحديث الميزة' : 'Fonctionnalité mise à jour');
      } else {
        await addDoc(collection(db, 'homepage-features'), {
          ...featureForm,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم إضافة الميزة' : 'Fonctionnalité ajoutée');
      }
      setShowFeatureModal(false);
      setEditingFeature(null);
      setFeatureForm({
        titleFr: '',
        titleAr: '',
        descriptionFr: '',
        descriptionAr: '',
        icon: 'BookOpenIcon',
        order: 0,
        enabled: true
      });
      fetchFeatures();
    } catch (error) {
      console.error('Error saving feature:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeature = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد؟' : 'Êtes-vous sûr?')) {
      try {
        await deleteDoc(doc(db, 'homepage-features', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchFeatures();
      } catch (error) {
        console.error('Error deleting feature:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  };

  // News Operations
  const handleSaveNews = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingNews) {
        await updateDoc(doc(db, 'homepage-news', editingNews.id), {
          ...newsForm,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم تحديث الخبر' : 'Actualité mise à jour');
      } else {
        await addDoc(collection(db, 'homepage-news'), {
          ...newsForm,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم إضافة الخبر' : 'Actualité ajoutée');
      }
      setShowNewsModal(false);
      setEditingNews(null);
      setNewsForm({
        titleFr: '',
        titleAr: '',
        contentFr: '',
        contentAr: '',
        imageUrl: '',
        category: 'announcement',
        enabled: true,
        publishDate: new Date().toISOString().split('T')[0]
      });
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد؟' : 'Êtes-vous sûr?')) {
      try {
        await deleteDoc(doc(db, 'homepage-news', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  };

  // Testimonial Operations
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingTestimonial) {
        await updateDoc(doc(db, 'homepage-testimonials', editingTestimonial.id), {
          ...testimonialForm,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم تحديث الشهادة' : 'Témoignage mis à jour');
      } else {
        await addDoc(collection(db, 'homepage-testimonials'), {
          ...testimonialForm,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم إضافة الشهادة' : 'Témoignage ajouté');
      }
      setShowTestimonialModal(false);
      setEditingTestimonial(null);
      setTestimonialForm({
        nameFr: '',
        nameAr: '',
        roleFr: '',
        roleAr: '',
        contentFr: '',
        contentAr: '',
        avatarUrl: '',
        rating: 5,
        enabled: true
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد؟' : 'Êtes-vous sûr?')) {
      try {
        await deleteDoc(doc(db, 'homepage-testimonials', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  };

  // Save Statistics
  const handleSaveStats = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await setDoc(doc(db, 'homepage', 'stats'), {
        ...stats,
        updatedAt: new Date().toISOString()
      });
      toast.success(isArabic ? 'تم حفظ الإحصائيات' : 'Statistiques sauvegardées');
    } catch (error) {
      console.error('Error saving stats:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveSection('hero')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'hero'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <PhotoIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'القسم الرئيسي' : 'Hero Section'}
          </button>
          <button
            onClick={() => setActiveSection('features')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'features'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <StarIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'الميزات' : 'Fonctionnalités'}
          </button>
          <button
            onClick={() => setActiveSection('news')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'news'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <NewspaperIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'الأخبار' : 'Actualités'}
          </button>
          <button
            onClick={() => setActiveSection('testimonials')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'testimonials'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <MegaphoneIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'الشهادات' : 'Témoignages'}
          </button>
          <button
            onClick={() => setActiveSection('stats')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'stats'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <ChartBarIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'الإحصائيات' : 'Statistiques'}
          </button>
          {/* ✨ NOUVEAU: 5 nouveaux onglets */}
          <button
            onClick={() => setActiveSection('announcements')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'announcements'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <MegaphoneIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'الإعلانات' : 'Annonces'}
          </button>
          <button
            onClick={() => setActiveSection('clubs')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'clubs'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <UserGroupIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'النوادي' : 'Clubs'}
          </button>
          <button
            onClick={() => setActiveSection('gallery')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'gallery'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <PhotoIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'المعرض' : 'Galerie'}
          </button>
          <button
            onClick={() => setActiveSection('quicklinks')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'quicklinks'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <LinkIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'روابط سريعة' : 'Liens'}
          </button>
          <button
            onClick={() => setActiveSection('contact')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
              activeSection === 'contact'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <PhoneIcon className="w-5 h-5 inline mr-2" />
            {isArabic ? 'اتصال' : 'Contact'}
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeSection === 'hero' && (
        <HeroSection 
          heroContent={heroContent}
          setHeroContent={setHeroContent}
          handleSaveHero={handleSaveHero}
          loading={loading}
          isArabic={isArabic}
        />
      )}

      {activeSection === 'features' && (
        <FeaturesSection
          features={features}
          setShowFeatureModal={setShowFeatureModal}
          setEditingFeature={setEditingFeature}
          setFeatureForm={setFeatureForm}
          handleDeleteFeature={handleDeleteFeature}
          isArabic={isArabic}
        />
      )}

      {activeSection === 'news' && (
        <NewsSection
          news={news}
          setShowNewsModal={setShowNewsModal}
          setEditingNews={setEditingNews}
          setNewsForm={setNewsForm}
          handleDeleteNews={handleDeleteNews}
          isArabic={isArabic}
        />
      )}

      {activeSection === 'testimonials' && (
        <TestimonialsSection
          testimonials={testimonials}
          setShowTestimonialModal={setShowTestimonialModal}
          setEditingTestimonial={setEditingTestimonial}
          setTestimonialForm={setTestimonialForm}
          handleDeleteTestimonial={handleDeleteTestimonial}
          isArabic={isArabic}
        />
      )}

      {activeSection === 'stats' && (
        <StatsSection
          stats={stats}
          setStats={setStats}
          handleSaveStats={handleSaveStats}
          loading={loading}
          isArabic={isArabic}
        />
      )}

      {/* ✨ NOUVEAU: Sections pour les nouveaux contenus CMS */}
      {activeSection === 'announcements' && (
        <AnnouncementsManager isArabic={isArabic} />
      )}

      {activeSection === 'clubs' && (
        <ClubsManager isArabic={isArabic} />
      )}

      {activeSection === 'gallery' && (
        <GalleryManager isArabic={isArabic} />
      )}

      {activeSection === 'quicklinks' && (
        <QuickLinksManager isArabic={isArabic} />
      )}

      {activeSection === 'contact' && (
        <ContactManager isArabic={isArabic} />
      )}

      {/* Modals */}
      {showFeatureModal && (
        <FeatureModal
          featureForm={featureForm}
          setFeatureForm={setFeatureForm}
          handleSaveFeature={handleSaveFeature}
          setShowFeatureModal={setShowFeatureModal}
          editingFeature={editingFeature}
          loading={loading}
          iconOptions={iconOptions}
          isArabic={isArabic}
        />
      )}

      {showNewsModal && (
        <NewsModal
          newsForm={newsForm}
          setNewsForm={setNewsForm}
          handleSaveNews={handleSaveNews}
          setShowNewsModal={setShowNewsModal}
          editingNews={editingNews}
          loading={loading}
          isArabic={isArabic}
        />
      )}

      {showTestimonialModal && (
        <TestimonialModal
          testimonialForm={testimonialForm}
          setTestimonialForm={setTestimonialForm}
          handleSaveTestimonial={handleSaveTestimonial}
          setShowTestimonialModal={setShowTestimonialModal}
          editingTestimonial={editingTestimonial}
          loading={loading}
          isArabic={isArabic}
        />
      )}
    </div>
  );
}

// Hero Section Component
function HeroSection({ heroContent, setHeroContent, handleSaveHero, loading, isArabic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isArabic ? 'تحرير القسم الرئيسي' : 'Éditer le Hero Section'}
      </h2>
      
      <form onSubmit={handleSaveHero} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
            </label>
            <input
              type="text"
              value={heroContent.titleFr}
              onChange={(e) => setHeroContent({ ...heroContent, titleFr: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
            </label>
            <input
              type="text"
              value={heroContent.titleAr}
              onChange={(e) => setHeroContent({ ...heroContent, titleAr: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              dir="rtl"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان الفرعي (فرنسي)' : 'Sous-titre (Français)'}
            </label>
            <textarea
              value={heroContent.subtitleFr}
              onChange={(e) => setHeroContent({ ...heroContent, subtitleFr: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان الفرعي (عربي)' : 'Sous-titre (Arabe)'}
            </label>
            <textarea
              value={heroContent.subtitleAr}
              onChange={(e) => setHeroContent({ ...heroContent, subtitleAr: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              dir="rtl"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'نص الزر 1 (فرنسي)' : 'Bouton 1 (Français)'}
            </label>
            <input
              type="text"
              value={heroContent.buttonText1Fr}
              onChange={(e) => setHeroContent({ ...heroContent, buttonText1Fr: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'نص الزر 1 (عربي)' : 'Bouton 1 (Arabe)'}
            </label>
            <input
              type="text"
              value={heroContent.buttonText1Ar}
              onChange={(e) => setHeroContent({ ...heroContent, buttonText1Ar: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              dir="rtl"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="heroEnabled"
            checked={heroContent.enabled}
            onChange={(e) => setHeroContent({ ...heroContent, enabled: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <label htmlFor="heroEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isArabic ? 'تفعيل القسم' : 'Activer cette section'}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ التغييرات' : 'Sauvegarder les modifications')}
        </button>
      </form>
    </div>
  );
}

// Features Section Component
function FeaturesSection({ features, setShowFeatureModal, setEditingFeature, setFeatureForm, handleDeleteFeature, isArabic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'إدارة الميزات' : 'Gérer les Fonctionnalités'}
        </h2>
        <button
          onClick={() => {
            setEditingFeature(null);
            setFeatureForm({
              titleFr: '',
              titleAr: '',
              descriptionFr: '',
              descriptionAr: '',
              icon: 'BookOpenIcon',
              order: features.length,
              enabled: true
            });
            setShowFeatureModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة ميزة' : 'Ajouter Fonctionnalité'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div key={feature.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {isArabic ? feature.titleAr : feature.titleFr}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                feature.enabled 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              }`}>
                {feature.enabled ? (isArabic ? 'مفعل' : 'Actif') : (isArabic ? 'معطل' : 'Désactivé')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isArabic ? feature.descriptionAr : feature.descriptionFr}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingFeature(feature);
                  setFeatureForm(feature);
                  setShowFeatureModal(true);
                }}
                className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <PencilIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'تعديل' : 'Modifier'}
              </button>
              <button
                onClick={() => handleDeleteFeature(feature.id)}
                className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <TrashIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'حذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// News Section Component  
function NewsSection({ news, setShowNewsModal, setEditingNews, setNewsForm, handleDeleteNews, isArabic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'إدارة الأخبار والإعلانات' : 'Gérer Actualités et Annonces'}
        </h2>
        <button
          onClick={() => {
            setEditingNews(null);
            setNewsForm({
              titleFr: '',
              titleAr: '',
              contentFr: '',
              contentAr: '',
              imageUrl: '',
              category: 'announcement',
              enabled: true,
              publishDate: new Date().toISOString().split('T')[0]
            });
            setShowNewsModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة خبر' : 'Ajouter Actualité'}
        </button>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {isArabic ? item.titleAr : item.titleFr}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {isArabic ? item.contentAr : item.contentFr}
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.publishDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingNews(item);
                    setNewsForm(item);
                    setShowNewsModal(true);
                  }}
                  className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNews(item.id)}
                  className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Testimonials Section Component
function TestimonialsSection({ testimonials, setShowTestimonialModal, setEditingTestimonial, setTestimonialForm, handleDeleteTestimonial, isArabic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'إدارة الشهادات' : 'Gérer les Témoignages'}
        </h2>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setTestimonialForm({
              nameFr: '',
              nameAr: '',
              roleFr: '',
              roleAr: '',
              contentFr: '',
              contentAr: '',
              avatarUrl: '',
              rating: 5,
              enabled: true
            });
            setShowTestimonialModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة شهادة' : 'Ajouter Témoignage'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              {testimonial.avatarUrl && (
                <img src={testimonial.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {isArabic ? testimonial.nameAr : testimonial.nameFr}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? testimonial.roleAr : testimonial.roleFr}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isArabic ? testimonial.contentAr : testimonial.contentFr}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingTestimonial(testimonial);
                  setTestimonialForm(testimonial);
                  setShowTestimonialModal(true);
                }}
                className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <PencilIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'تعديل' : 'Modifier'}
              </button>
              <button
                onClick={() => handleDeleteTestimonial(testimonial.id)}
                className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <TrashIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'حذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Section Component
function StatsSection({ stats, setStats, handleSaveStats, loading, isArabic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isArabic ? 'تحرير الإحصائيات' : 'Éditer les Statistiques'}
      </h2>
      
      <form onSubmit={handleSaveStats} className="space-y-6">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 capitalize">
              {key}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'القيمة (فرنسي)' : 'Valeur (Français)'}
                </label>
                <input
                  type="text"
                  value={value.valueFr}
                  onChange={(e) => setStats({
                    ...stats,
                    [key]: { ...value, valueFr: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'القيمة (عربي)' : 'Valeur (Arabe)'}
                </label>
                <input
                  type="text"
                  value={value.valueAr}
                  onChange={(e) => setStats({
                    ...stats,
                    [key]: { ...value, valueAr: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التسمية (فرنسي)' : 'Label (Français)'}
                </label>
                <input
                  type="text"
                  value={value.labelFr}
                  onChange={(e) => setStats({
                    ...stats,
                    [key]: { ...value, labelFr: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التسمية (عربي)' : 'Label (Arabe)'}
                </label>
                <input
                  type="text"
                  value={value.labelAr}
                  onChange={(e) => setStats({
                    ...stats,
                    [key]: { ...value, labelAr: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ التغييرات' : 'Sauvegarder les modifications')}
        </button>
      </form>
    </div>
  );
}

// Feature Modal Component
function FeatureModal({ featureForm, setFeatureForm, handleSaveFeature, setShowFeatureModal, editingFeature, loading, iconOptions, isArabic }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {editingFeature 
            ? (isArabic ? 'تعديل الميزة' : 'Modifier la Fonctionnalité')
            : (isArabic ? 'إضافة ميزة جديدة' : 'Nouvelle Fonctionnalité')
          }
        </h2>

        <form onSubmit={handleSaveFeature} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
              </label>
              <input
                type="text"
                value={featureForm.titleFr}
                onChange={(e) => setFeatureForm({ ...featureForm, titleFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
              </label>
              <input
                type="text"
                value={featureForm.titleAr}
                onChange={(e) => setFeatureForm({ ...featureForm, titleAr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
              </label>
              <textarea
                value={featureForm.descriptionFr}
                onChange={(e) => setFeatureForm({ ...featureForm, descriptionFr: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
              </label>
              <textarea
                value={featureForm.descriptionAr}
                onChange={(e) => setFeatureForm({ ...featureForm, descriptionAr: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الأيقونة' : 'Icône'}
              </label>
              <select
                value={featureForm.icon}
                onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الترتيب' : 'Ordre'}
              </label>
              <input
                type="number"
                value={featureForm.order}
                onChange={(e) => setFeatureForm({ ...featureForm, order: parseInt(e.target.value) })}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featureEnabled"
              checked={featureForm.enabled}
              onChange={(e) => setFeatureForm({ ...featureForm, enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="featureEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'تفعيل هذه الميزة' : 'Activer cette fonctionnalité'}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ' : 'Sauvegarder')}
            </button>
            <button
              type="button"
              onClick={() => setShowFeatureModal(false)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// News Modal Component
function NewsModal({ newsForm, setNewsForm, handleSaveNews, setShowNewsModal, editingNews, loading, isArabic }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {editingNews 
            ? (isArabic ? 'تعديل الخبر' : 'Modifier l\'Actualité')
            : (isArabic ? 'إضافة خبر جديد' : 'Nouvelle Actualité')
          }
        </h2>

        <form onSubmit={handleSaveNews} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
              </label>
              <input
                type="text"
                value={newsForm.titleFr}
                onChange={(e) => setNewsForm({ ...newsForm, titleFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
              </label>
              <input
                type="text"
                value={newsForm.titleAr}
                onChange={(e) => setNewsForm({ ...newsForm, titleAr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المحتوى (فرنسي)' : 'Contenu (Français)'}
              </label>
              <textarea
                value={newsForm.contentFr}
                onChange={(e) => setNewsForm({ ...newsForm, contentFr: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المحتوى (عربي)' : 'Contenu (Arabe)'}
              </label>
              <textarea
                value={newsForm.contentAr}
                onChange={(e) => setNewsForm({ ...newsForm, contentAr: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الفئة' : 'Catégorie'}
              </label>
              <select
                value={newsForm.category}
                onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="announcement">{isArabic ? 'إعلان' : 'Annonce'}</option>
                <option value="news">{isArabic ? 'أخبار' : 'Actualités'}</option>
                <option value="event">{isArabic ? 'حدث' : 'Événement'}</option>
                <option value="update">{isArabic ? 'تحديث' : 'Mise à jour'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'تاريخ النشر' : 'Date de Publication'}
              </label>
              <input
                type="date"
                value={newsForm.publishDate}
                onChange={(e) => setNewsForm({ ...newsForm, publishDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'رابط الصورة (اختياري)' : 'URL de l\'image (optionnel)'}
            </label>
            <input
              type="url"
              value={newsForm.imageUrl}
              onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="newsEnabled"
              checked={newsForm.enabled}
              onChange={(e) => setNewsForm({ ...newsForm, enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="newsEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'نشر هذا الخبر' : 'Publier cette actualité'}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ' : 'Sauvegarder')}
            </button>
            <button
              type="button"
              onClick={() => setShowNewsModal(false)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Testimonial Modal Component
function TestimonialModal({ testimonialForm, setTestimonialForm, handleSaveTestimonial, setShowTestimonialModal, editingTestimonial, loading, isArabic }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {editingTestimonial 
            ? (isArabic ? 'تعديل الشهادة' : 'Modifier le Témoignage')
            : (isArabic ? 'إضافة شهادة جديدة' : 'Nouveau Témoignage')
          }
        </h2>

        <form onSubmit={handleSaveTestimonial} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الاسم (فرنسي)' : 'Nom (Français)'}
              </label>
              <input
                type="text"
                value={testimonialForm.nameFr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, nameFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الاسم (عربي)' : 'Nom (Arabe)'}
              </label>
              <input
                type="text"
                value={testimonialForm.nameAr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, nameAr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الدور (فرنسي)' : 'Rôle (Français)'}
              </label>
              <input
                type="text"
                value={testimonialForm.roleFr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, roleFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الدور (عربي)' : 'Rôle (Arabe)'}
              </label>
              <input
                type="text"
                value={testimonialForm.roleAr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, roleAr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المحتوى (فرنسي)' : 'Contenu (Français)'}
              </label>
              <textarea
                value={testimonialForm.contentFr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, contentFr: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المحتوى (عربي)' : 'Contenu (Arabe)'}
              </label>
              <textarea
                value={testimonialForm.contentAr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, contentAr: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'رابط الصورة الشخصية' : 'URL Avatar'}
              </label>
              <input
                type="url"
                value={testimonialForm.avatarUrl}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, avatarUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'التقييم' : 'Note'}
              </label>
              <input
                type="number"
                value={testimonialForm.rating}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                min="1"
                max="5"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="testimonialEnabled"
              checked={testimonialForm.enabled}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="testimonialEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'نشر هذه الشهادة' : 'Publier ce témoignage'}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ' : 'Sauvegarder')}
            </button>
            <button
              type="button"
              onClick={() => setShowTestimonialModal(false)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
