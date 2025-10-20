/**
 * LandingPage.jsx - PAGE D'ACCUEIL OFFICIELLE DU SITE
 * 
 * ⚠️ IMPORTANT: C'est la SEULE page d'accueil utilisée (route: "/")
 * 
 * Cette page charge dynamiquement le contenu depuis Firestore grâce au hook useHomeContent:
 * - Hero Section (titre, sous-titre, boutons)
 * - Statistics (4 statistiques personnalisables)
 * - News/Actualités (3 dernières actualités)
 * - Features (fonctionnalités du lycée)
 * - Testimonials (témoignages d'étudiants)
 * 
 * Le contenu est géré depuis: Admin Dashboard → Onglet Homepage
 * 
 * Système de fallback: Si aucune donnée Firestore, affiche du contenu par défaut
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';
import { useHomeContent } from '../hooks/useHomeContent';
import {
  AcademicCapIcon,
  NewspaperIcon,
  MegaphoneIcon,
  PhotoIcon,
  UserGroupIcon,
  TrophyIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CogIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  BeakerIcon,
  CalculatorIcon,
  CpuChipIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

// Contact Form Component
function ContactForm({ isArabic }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setSending(true);
      
      const messageData = {
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        timestamp: Date.now() // For real-time sorting
      };
      
      console.log('📧 Sending contact message:', messageData);
      
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      
      console.log('✅ Message sent successfully with ID:', docRef.id);
      
      toast.success(isArabic ? 'تم إرسال رسالتك بنجاح!' : 'Message envoyé avec succès!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.message, error.code);
      toast.error(isArabic ? 'خطأ في إرسال الرسالة' : 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {isArabic ? 'أرسل رسالة' : 'Envoyez-nous un message'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={isArabic ? 'الاسم الكامل' : 'Nom complet'}
            required
            className="input"
          />
        </div>
        <div>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={isArabic ? 'البريد الإلكتروني' : 'Email'}
            required
            className="input"
          />
        </div>
        <div>
          <input
            name="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder={isArabic ? 'الموضوع (اختياري)' : 'Sujet (optionnel)'}
            className="input"
          />
        </div>
        <div>
          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder={isArabic ? 'رسالتك' : 'Votre message'}
            required
            className="input"
          ></textarea>
        </div>
        <button 
          type="submit" 
          disabled={sending}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {isArabic ? 'جاري الإرسال...' : 'Envoi...'}
            </span>
          ) : (
            <>
              {isArabic ? 'إرسال' : 'Envoyer'}
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LandingPage() {
  const { isArabic, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Load dynamic content from Firestore (managed in Admin Dashboard)
  const { 
    heroContent, 
    features, 
    news: dynamicNews, 
    testimonials, 
    stats: dynamicStats,
    // ✨ NOUVEAU: Charger les 5 nouvelles sections dynamiques
    announcements: dynamicAnnouncements,
    clubs: dynamicClubs,
    gallery: dynamicGallery,
    quickLinks: dynamicQuickLinks,
    contactInfo: dynamicContactInfo,
    loading: contentLoading 
  } = useHomeContent();
  
  // Normalize dynamic news to match expected format
  const normalizedNews = (dynamicNews && dynamicNews.length > 0) ? dynamicNews.map(news => ({
    id: news.id,
    titleFr: news.titleFr,
    titleAr: news.titleAr,
    dateFr: new Date(news.publishDate).toLocaleDateString('fr-FR'),
    dateAr: new Date(news.publishDate).toLocaleDateString('ar-MA'),
    descFr: news.contentFr,
    descAr: news.contentAr,
    image: news.imageUrl || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop',
    category: news.category || 'Actualités'
  })) : null;
  
  // Icon mapping for features
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
    CalendarDaysIcon,
    NewspaperIcon,
    MegaphoneIcon,
    PhotoIcon
  };

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Latest News
  const latestNews = [
    {
      id: 1,
      titleFr: 'Rentrée Scolaire 2024-2025',
      titleAr: 'الدخول المدرسي 2024-2025',
      dateFr: '1 Septembre 2024',
      dateAr: '1 سبتمبر 2024',
      descFr: 'Nous souhaitons la bienvenue à tous nos élèves pour cette nouvelle année scolaire...',
      descAr: 'نرحب بجميع طلابنا لهذا العام الدراسي الجديد...',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop',
      category: 'Actualités',
    },
    {
      id: 2,
      titleFr: 'Journée Portes Ouvertes',
      titleAr: 'يوم الأبواب المفتوحة',
      dateFr: '15 Septembre 2024',
      dateAr: '15 سبتمبر 2024',
      descFr: 'Venez découvrir notre établissement et rencontrer nos enseignants...',
      descAr: 'تعال لاكتشاف مؤسستنا والتعرف على معلمينا...',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop',
      category: 'Événements',
    },
    {
      id: 3,
      titleFr: 'Résultats Excellents au Bac',
      titleAr: 'نتائج ممتازة في الباكالوريا',
      dateFr: '25 Juin 2024',
      dateAr: '25 يونيو 2024',
      descFr: 'Taux de réussite de 92% au baccalauréat. Félicitations à tous!',
      descAr: 'معدل نجاح 92٪ في الباكالوريا. تهانينا للجميع!',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop',
      category: 'Résultats',
    },
  ];

  // Announcements
  const announcements = [
    {
      id: 1,
      titleFr: 'Inscription aux clubs sportifs',
      titleAr: 'التسجيل في النوادي الرياضية',
      dateFr: '10 Sept',
      dateAr: '10 شتنبر',
      urgent: true,
    },
    {
      id: 2,
      titleFr: 'Réunion parents-professeurs',
      titleAr: 'اجتماع أولياء الأمور والمعلمين',
      dateFr: '20 Sept',
      dateAr: '20 شتنبر',
      urgent: false,
    },
    {
      id: 3,
      titleFr: 'Concours de mathématiques',
      titleAr: 'مسابقة الرياضيات',
      dateFr: '5 Oct',
      dateAr: '5 أكتوبر',
      urgent: false,
    },
  ];

  // Clubs
  const clubs = [
    {
      nameFr: 'Club Théâtre',
      nameAr: 'نادي المسرح',
      icon: '🎭',
      color: 'from-purple-600 to-pink-600',
    },
    {
      nameFr: 'Club Sciences',
      nameAr: 'نادي العلوم',
      icon: '🔬',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      nameFr: 'Club Sports',
      nameAr: 'النادي الرياضي',
      icon: '⚽',
      color: 'from-green-600 to-teal-600',
    },
    {
      nameFr: 'Club Arts',
      nameAr: 'نادي الفنون',
      icon: '🎨',
      color: 'from-orange-600 to-red-600',
    },
    {
      nameFr: 'Club Musique',
      nameAr: 'نادي الموسيقى',
      icon: '🎵',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      nameFr: 'Club Informatique',
      nameAr: 'نادي المعلوميات',
      icon: '💻',
      color: 'from-cyan-600 to-blue-600',
    },
  ];

  // Gallery images
  const galleryImages = [
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&h=300&fit=crop',
  ];

  // Show loading screen while content is being fetched
  if (contentLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 font-semibold">
              {isArabic ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        
        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' 
            : 'bg-white dark:bg-gray-900 shadow-md'
        }`}>
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-2">
            <div className="container mx-auto px-4 flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <span className="hidden md:inline">
                  {isArabic ? 'مرحبا بكم في ثانوية المارينيين' : 'Bienvenue au Lycée Almarinyine'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 hover:text-primary-100 transition"
                  aria-label="Toggle language"
                >
                  <LanguageIcon className="w-4 h-4" />
                  <span>{isArabic ? 'FR' : 'AR'}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1 hover:text-primary-100 transition"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-between py-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                  <AcademicCapIcon className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                    {isArabic ? 'ثانوية المارينيين' : 'Lycée Almarinyine'}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isArabic ? 'التميز والإبداع' : 'Excellence et Innovation'}
                  </p>
                </div>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                <a href="#news" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'الأخبار' : 'Actualités'}
                </a>
                <a href="#announcements" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'الإعلانات' : 'Annonces'}
                </a>
                <a href="#clubs" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'النوادي' : 'Clubs'}
                </a>
                <a href="#gallery" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'معرض الصور' : 'Galerie'}
                </a>
                <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'اتصل بنا' : 'Contact'}
                </a>
                <Link 
                  to="/login" 
                  className="btn btn-primary"
                >
                  {isArabic ? 'دخول الإدارة' : 'Espace Admin'}
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </nav>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="container mx-auto px-4 py-4 space-y-4">
                <a href="#news" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'الأخبار' : 'Actualités'}
                </a>
                <a href="#announcements" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'الإعلانات' : 'Annonces'}
                </a>
                <a href="#clubs" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'النوادي' : 'Clubs'}
                </a>
                <a href="#gallery" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'معرض الصور' : 'Galerie'}
                </a>
                <a href="#contact" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
                  {isArabic ? 'اتصل بنا' : 'Contact'}
                </a>
                <Link to="/login" className="btn btn-primary w-full">
                  {isArabic ? 'دخول الإدارة' : 'Espace Admin'}
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section with Slider */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
          {/* Hero Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=800&fit=crop"
              alt="Lycée"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/60"></div>
          </div>

          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-display leading-tight animate-fade-in">
                {heroContent ? (
                  isArabic ? heroContent.titleAr : heroContent.titleFr
                ) : (
                  isArabic ? (
                    <>
                      ثانوية المارينيين
                      <br />
                      <span className="text-primary-400">مستقبل مشرق لأبنائنا</span>
                    </>
                  ) : (
                    <>
                      Lycée Almarinyine
                      <br />
                      <span className="text-primary-400">Un avenir brillant pour nos élèves</span>
                    </>
                  )
                )}
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                {heroContent ? (
                  isArabic ? heroContent.subtitleAr : heroContent.subtitleFr
                ) : (
                  isArabic 
                    ? 'مؤسسة تعليمية تتميز بالجودة والتميز، نعمل على تطوير قدرات طلابنا وإعدادهم لمستقبل واعد'
                    : 'Un établissement d\'excellence engagé dans la réussite de nos élèves et leur préparation à un avenir prometteur'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#news" className="btn btn-primary btn-lg">
                  {isArabic ? 'اكتشف المزيد' : 'Découvrir'}
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
                <Link to="/signup" className="btn btn-secondary btn-lg">
                  {isArabic ? 'التسجيل' : 'Inscription'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-white dark:bg-gray-800 shadow-lg -mt-8 relative z-10">
          <div className="container mx-auto px-4">
            {dynamicStats && Object.keys(dynamicStats).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Object.entries(dynamicStats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <UserGroupIcon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {isArabic ? value.valueAr : value.valueFr}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? value.labelAr : value.labelFr}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <UserGroupIcon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">850+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isArabic ? 'طالب' : 'Élèves'}
                  </div>
                </div>
                <div className="text-center">
                  <AcademicCapIcon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">60+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isArabic ? 'أستاذ' : 'Professeurs'}
                  </div>
                </div>
                <div className="text-center">
                  <TrophyIcon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">92%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isArabic ? 'نسبة النجاح' : 'Taux de réussite'}
                  </div>
                </div>
                <div className="text-center">
                  <CalendarDaysIcon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">25+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isArabic ? 'سنة من التميز' : 'Ans d\'excellence'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Latest News */}
        <section id="news" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-display flex items-center justify-center gap-3">
                <NewspaperIcon className="w-10 h-10 text-primary-600" />
                {isArabic ? 'آخر الأخبار' : 'Dernières Actualités'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {isArabic ? 'تابع آخر أخبار وفعاليات الثانوية' : 'Suivez les dernières nouvelles de notre lycée'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {(normalizedNews || latestNews).map((news, index) => (
                <div 
                  key={news.id} 
                  className="card card-hover overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={news.image}
                      alt={isArabic ? news.titleAr : news.titleFr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                        {news.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <CalendarDaysIcon className="w-4 h-4" />
                      {isArabic ? news.dateAr : news.dateFr}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {isArabic ? news.titleAr : news.titleFr}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {isArabic ? news.descAr : news.descFr}
                    </p>
                    <button className="text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                      {isArabic ? 'اقرأ المزيد' : 'Lire la suite'}
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="btn btn-primary">
                {isArabic ? 'عرض جميع الأخبار' : 'Voir toutes les actualités'}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section - Dynamic from Firestore */}
        {features && features.length > 0 && (
          <section className="py-20 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-display">
                  {isArabic ? 'مميزاتنا' : 'Nos Atouts'}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {isArabic ? 'ما يميز ثانويتنا' : 'Ce qui distingue notre lycée'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || BookOpenIcon;
                  return (
                    <div 
                      key={feature.id}
                      className="card p-6 text-center card-hover animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {isArabic ? feature.titleAr : feature.titleFr}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {isArabic ? feature.descriptionAr : feature.descriptionFr}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section - Dynamic from Firestore */}
        {testimonials && testimonials.length > 0 && (
          <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-display">
                  {isArabic ? 'آراء طلابنا' : 'Témoignages de nos Élèves'}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {isArabic ? 'ماذا يقول طلابنا عنا' : 'Ce que nos élèves disent de nous'}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id}
                    className="card p-8 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {testimonial.avatarUrl ? (
                        <img 
                          src={testimonial.avatarUrl} 
                          alt={isArabic ? testimonial.nameAr : testimonial.nameFr}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                          {(isArabic ? testimonial.nameAr : testimonial.nameFr).charAt(0)}
                        </div>
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
                    
                    <div className="flex gap-1 mb-4">
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
          </section>
        )}

        {/* Announcements */}
        <section id="announcements" className="py-20 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Announcements */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 font-display flex items-center gap-3">
                  <MegaphoneIcon className="w-8 h-8 text-primary-600" />
                  {isArabic ? 'الإعلانات' : 'Annonces'}
                </h2>
                <div className="space-y-4">
                  {/* ✨ DYNAMIQUE: Utiliser dynamicAnnouncements si disponible, sinon fallback */}
                  {(dynamicAnnouncements && dynamicAnnouncements.length > 0 ? dynamicAnnouncements : announcements).map((announcement) => (
                    <div 
                      key={announcement.id} 
                      className={`card p-6 flex items-start gap-4 ${announcement.urgent ? 'border-l-4 border-red-500' : ''}`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        announcement.urgent 
                          ? 'bg-red-100 dark:bg-red-900/30' 
                          : 'bg-primary-100 dark:bg-primary-900/30'
                      }`}>
                        <CalendarDaysIcon className={`w-8 h-8 ${
                          announcement.urgent ? 'text-red-600' : 'text-primary-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {isArabic ? announcement.titleAr : announcement.titleFr}
                          </h3>
                          {announcement.urgent && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                              {isArabic ? 'عاجل' : 'Urgent'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isArabic ? announcement.dateAr : announcement.dateFr}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links Sidebar */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-display">
                  {isArabic ? 'روابط سريعة' : 'Liens Rapides'}
                </h3>
                <div className="space-y-3">
                  {/* ✨ DYNAMIQUE: Si quickLinks dynamiques disponibles, les utiliser */}
                  {(dynamicQuickLinks && dynamicQuickLinks.length > 0) ? (
                    dynamicQuickLinks.map((link) => {
                      // Map icon name to actual component
                      const IconComponent = iconMap[link.icon] || DocumentTextIcon;
                      return (
                        <a key={link.id} href={link.url} className="card p-4 flex items-center gap-3 hover:shadow-lg transition-all">
                          <IconComponent className="w-6 h-6 text-primary-600" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {isArabic ? link.titleAr : link.titleFr}
                          </span>
                        </a>
                      );
                    })
                  ) : (
                    <>
                      <a href="#" className="card p-4 flex items-center gap-3 hover:shadow-lg transition-all">
                        <DocumentTextIcon className="w-6 h-6 text-primary-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {isArabic ? 'التسجيل' : 'Inscription'}
                        </span>
                      </a>
                      <a href="#" className="card p-4 flex items-center gap-3 hover:shadow-lg transition-all">
                        <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {isArabic ? 'التقويم الدراسي' : 'Calendrier Scolaire'}
                        </span>
                      </a>
                      <a href="#" className="card p-4 flex items-center gap-3 hover:shadow-lg transition-all">
                        <AcademicCapIcon className="w-6 h-6 text-primary-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {isArabic ? 'البرامج الدراسية' : 'Programmes'}
                        </span>
                      </a>
                      <a href="#" className="card p-4 flex items-center gap-3 hover:shadow-lg transition-all">
                        <TrophyIcon className="w-6 h-6 text-primary-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {isArabic ? 'الإنجازات' : 'Nos Réussites'}
                        </span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clubs Section */}
        <section id="clubs" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-display flex items-center justify-center gap-3">
                <UserGroupIcon className="w-10 h-10 text-primary-600" />
                {isArabic ? 'نوادي الثانوية' : 'Clubs du Lycée'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {isArabic ? 'انضم إلى نوادينا وطور مواهبك' : 'Rejoignez nos clubs et développez vos talents'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* ✨ DYNAMIQUE: Utiliser dynamicClubs si disponible, sinon fallback */}
              {(dynamicClubs && dynamicClubs.length > 0 ? dynamicClubs : clubs).map((club, index) => (
                <div 
                  key={club.id || index} 
                  className="card card-hover p-8 text-center animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${club.colorGradient || club.color} flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform duration-300`}>
                    {club.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {isArabic ? club.nameAr : club.nameFr}
                  </h3>
                  {/* Afficher la description si disponible */}
                  {club.descriptionFr && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {isArabic ? club.descriptionAr : club.descriptionFr}
                    </p>
                  )}
                  <button className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                    {isArabic ? 'معرفة المزيد' : 'En savoir plus'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-20 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-display flex items-center justify-center gap-3">
                <PhotoIcon className="w-10 h-10 text-primary-600" />
                {isArabic ? 'معرض الصور' : 'Galerie Photos'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {isArabic ? 'لحظات لا تنسى من حياة ثانويتنا' : 'Des moments inoubliables de notre lycée'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* ✨ DYNAMIQUE: Utiliser dynamicGallery si disponible, sinon fallback vers galleryImages */}
              {(dynamicGallery && dynamicGallery.length > 0 
                ? dynamicGallery 
                : galleryImages.map((img, i) => ({ id: i, imageUrl: img, titleFr: `Image ${i+1}`, titleAr: `صورة ${i+1}` }))
              ).map((image, index) => (
                <div 
                  key={image.id || index} 
                  className="relative group overflow-hidden rounded-2xl cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={image.imageUrl || image}
                    alt={isArabic ? (image.titleAr || `صورة ${index + 1}`) : (image.titleFr || `Image ${index + 1}`)}
                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="text-white font-semibold">
                      {isArabic ? (image.titleAr || 'عرض') : (image.titleFr || 'Voir')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="btn btn-primary">
                {isArabic ? 'المزيد من الصور' : 'Voir toute la galerie'}
                <PhotoIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  {isArabic ? 'اتصل بنا' : 'Contactez-nous'}
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  {isArabic 
                    ? 'نحن هنا للإجابة على جميع أسئلتكم'
                    : 'Nous sommes là pour répondre à toutes vos questions'
                  }
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPinIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">{isArabic ? 'العنوان' : 'Adresse'}</h3>
                      <p className="opacity-90">
                        {/* ✨ DYNAMIQUE: Utiliser dynamicContactInfo si disponible */}
                        {dynamicContactInfo 
                          ? (isArabic ? dynamicContactInfo.addressAr : dynamicContactInfo.addressFr)
                          : (isArabic ? 'شارع الحسن الثاني، وجدة، المغرب' : 'Avenue Hassan II, Oujda, Maroc')
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <PhoneIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">{isArabic ? 'الهاتف' : 'Téléphone'}</h3>
                      <p className="opacity-90">
                        {dynamicContactInfo?.phone || '+212 5XX-XXXXXX'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <EnvelopeIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">{isArabic ? 'البريد الإلكتروني' : 'Email'}</h3>
                      <p className="opacity-90">
                        {dynamicContactInfo?.email || 'contact@lyceealmarinyine.ma'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <ClockIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">{isArabic ? 'أوقات العمل' : 'Horaires'}</h3>
                      <p className="opacity-90">
                        {dynamicContactInfo 
                          ? (isArabic ? dynamicContactInfo.hoursAr : dynamicContactInfo.hoursFr)
                          : (isArabic ? 'الإثنين - الجمعة: 8:00 - 17:00' : 'Lundi - Vendredi: 8h00 - 17h00')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ContactForm isArabic={isArabic} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* About */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white font-display">
                    {isArabic ? 'ثانوية المارينيين' : 'Lycée Almarinyine'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {isArabic 
                    ? 'مؤسسة تعليمية متميزة في خدمة أبنائنا'
                    : 'Un établissement d\'excellence au service de nos élèves'
                  }
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold mb-4">
                  {isArabic ? 'روابط سريعة' : 'Liens Rapides'}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#news" className="hover:text-primary-400 transition">{isArabic ? 'الأخبار' : 'Actualités'}</a></li>
                  <li><a href="#announcements" className="hover:text-primary-400 transition">{isArabic ? 'الإعلانات' : 'Annonces'}</a></li>
                  <li><a href="#clubs" className="hover:text-primary-400 transition">{isArabic ? 'النوادي' : 'Clubs'}</a></li>
                  <li><a href="#gallery" className="hover:text-primary-400 transition">{isArabic ? 'معرض الصور' : 'Galerie'}</a></li>
                </ul>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-white font-bold mb-4">
                  {isArabic ? 'خدمات' : 'Services'}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-primary-400 transition">{isArabic ? 'التسجيل' : 'Inscription'}</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">{isArabic ? 'التقويم' : 'Calendrier'}</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">{isArabic ? 'البرامج' : 'Programmes'}</a></li>
                  <li><Link to="/login" className="hover:text-primary-400 transition">{isArabic ? 'دخول الإدارة' : 'Espace Admin'}</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-white font-bold mb-4">
                  {isArabic ? 'اتصل بنا' : 'Contact'}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>+212 5XX-XXXXXX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>contact@lyceealmarinyine.ma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPinIcon className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{isArabic ? 'وجدة، المغرب' : 'Oujda, Maroc'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>
                © 2025 {isArabic ? 'ثانوية المارينيين' : 'Lycée Almarinyine'}. {isArabic ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
