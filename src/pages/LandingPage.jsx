/**
 * LandingPage.jsx - PAGE D'ACCUEIL PROFESSIONNELLE REFONTÉE
 * 
 * 🎨 NOUVELLE VERSION - Design moderne et organisé
 * 
 * Structure en 12 sections:
 * 1. Navigation sticky moderne
 * 2. Hero section full-height avec gradient
 * 3. Barre d'annonces urgentes (défilant)
 * 4. Statistiques clés (grid moderne)
 * 5. Présentation du lycée
 * 6. Actualités récentes (cards horizontales)
 * 7. Clubs & Activités (grid coloré)
 * 8. Galerie photos (masonry layout)
 * 9. Témoignages d'étudiants (carousel)
 * 10. Liens rapides (grid compact)
 * 11. Contact & Informations
 * 12. Footer moderne
 * 
 * Contenu dynamique chargé depuis Firestore via useHomeContent hook
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useHomeContent } from '../hooks/useHomeContent';
import SharedLayout from '../components/SharedLayout';
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
  ChartBarIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ArrowUpRightIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import {
  AcademicCapIcon as AcademicCapSolidIcon,
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid';

export default function LandingPage() {
  const { language, toggleLanguage } = useLanguage();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // État local
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentCarouselImage, setCurrentCarouselImage] = useState(0);

  // Charger le contenu dynamique depuis Firestore
  const {
    heroContent,
    features,
    news: dynamicNews,
    testimonials: dynamicTestimonials,
    stats: dynamicStats,
    announcements: dynamicAnnouncements,
    clubs: dynamicClubs,
    gallery: dynamicGallery,
    quickLinks: dynamicQuickLinks,
    contactInfo: dynamicContactInfo,
    aboutContent: dynamicAboutContent,
    footerContent: dynamicFooterContent,
    sectionVisibility,
    loading: contentLoading,
  } = useHomeContent();

  const isArabic = language === 'ar';

  // Debug: Log hero content changes
  useEffect(() => {
    console.log('🎯 [LandingPage] Hero content changed:', heroContent);
  }, [heroContent]);

  // Gestion du scroll pour navbar sticky + fermeture menu mobile
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      // Fermer le menu mobile au scroll
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // Rotation automatique des témoignages
  useEffect(() => {
    if (dynamicTestimonials && dynamicTestimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) =>
          prev === dynamicTestimonials.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [dynamicTestimonials]);

  // Rotation automatique du carousel Hero
  useEffect(() => {
    if (heroContent?.backgroundType === 'carousel' && 
        heroContent?.backgroundImages && 
        heroContent.backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentCarouselImage((prev) =>
          prev === heroContent.backgroundImages.length - 1 ? 0 : prev + 1
        );
      }, heroContent.carouselInterval || 5000);
      return () => clearInterval(interval);
    }
  }, [heroContent]);

  // Textes statiques (fallback)
  const texts = {
    fr: {
      welcome: 'Bienvenue au',
      schoolName: 'Lycée Excellence',
      heroSubtitle: 'Former les Leaders de Demain',
      heroDescription:
        "Un établissement d'excellence dédié à l'épanouissement académique et personnel de chaque élève.",
      ctaPrimary: 'Découvrir le Lycée',
      ctaSecondary: 'Nous Contacter',
      statistics: 'Nos Chiffres',
      aboutTitle: 'À Propos du Lycée',
      aboutSubtitle: 'Excellence Académique & Épanouissement Personnel',
      aboutDescription:
        "Le Lycée Excellence est un établissement d'enseignement de référence qui combine rigueur académique et développement personnel. Nous offrons un environnement stimulant où chaque élève peut révéler son potentiel.",
      aboutCta: 'En Savoir Plus',
      newsTitle: 'Actualités Récentes',
      newsSubtitle: 'Restez informé de la vie du lycée',
      newsViewAll: 'Voir toutes les actualités',
      clubsTitle: 'Clubs & Activités',
      clubsSubtitle: 'Rejoignez nos clubs et développez vos talents',
      clubsJoin: 'Rejoindre',
      galleryTitle: 'Galerie Photos',
      gallerySubtitle: 'Découvrez la vie au lycée en images',
      testimonialsTitle: 'Témoignages',
      testimonialsSubtitle: 'Ce que disent nos élèves et parents',
      quickLinksTitle: 'Accès Rapide',
      quickLinksSubtitle: 'Trouvez rapidement ce que vous cherchez',
      contactTitle: 'Nous Contacter',
      contactSubtitle: 'Nous sommes là pour vous aider',
      contactForm: 'Envoyer un message',
      footerAbout: 'À propos',
      footerLinks: 'Liens utiles',
      footerContact: 'Contact',
      footerCopyright: '© 2024 Lycée Excellence. Tous droits réservés.',
      loading: 'Chargement...',
    },
    ar: {
      welcome: 'مرحبا بكم في',
      schoolName: 'ثانوية التميز',
      heroSubtitle: 'تكوين قادة الغد',
      heroDescription: 'مؤسسة متميزة مكرسة للازدهار الأكاديمي والشخصي لكل طالب.',
      ctaPrimary: 'اكتشف الثانوية',
      ctaSecondary: 'اتصل بنا',
      statistics: 'أرقامنا',
      aboutTitle: 'عن الثانوية',
      aboutSubtitle: 'التميز الأكاديمي والازدهار الشخصي',
      aboutDescription:
        'ثانوية التميز هي مؤسسة تعليمية مرجعية تجمع بين الصرامة الأكاديمية والتنمية الشخصية. نوفر بيئة محفزة حيث يمكن لكل طالب إظهار إمكاناته.',
      aboutCta: 'معرفة المزيد',
      newsTitle: 'الأخبار الأخيرة',
      newsSubtitle: 'ابق على اطلاع بحياة الثانوية',
      newsViewAll: 'عرض جميع الأخبار',
      clubsTitle: 'الأندية والأنشطة',
      clubsSubtitle: 'انضم إلى أنديتنا وطور مواهبك',
      clubsJoin: 'انضم',
      galleryTitle: 'معرض الصور',
      gallerySubtitle: 'اكتشف الحياة في الثانوية بالصور',
      testimonialsTitle: 'الشهادات',
      testimonialsSubtitle: 'ما يقوله طلابنا وأولياء الأمور',
      quickLinksTitle: 'وصول سريع',
      quickLinksSubtitle: 'اعثر بسرعة على ما تبحث عنه',
      contactTitle: 'اتصل بنا',
      contactSubtitle: 'نحن هنا لمساعدتك',
      contactForm: 'إرسال رسالة',
      footerAbout: 'حول',
      footerLinks: 'روابط مفيدة',
      footerContact: 'اتصال',
      footerCopyright: '© 2024 ثانوية التميز. جميع الحقوق محفوظة.',
      loading: 'جار التحميل...',
    },
  };

  const t = texts[language];

  // Annonces urgentes avec filtrage
  const urgentAnnouncements = dynamicAnnouncements?.filter((a) => a.urgent) || [];

  // Helper function to check if a section is enabled
  const isSectionEnabled = (sectionId) => {
    if (!sectionVisibility || sectionVisibility.length === 0) {
      // Default: all sections enabled if no visibility settings
      return true;
    }
    const section = sectionVisibility.find((s) => s.id === sectionId);
    return section ? section.enabled : true; // Default to enabled if section not found
  };

  // Helper function to get section order
  const getSectionOrder = (sectionId) => {
    if (!sectionVisibility || sectionVisibility.length === 0) {
      // Default order mapping
      const defaultOrder = {
        hero: 1,
        announcements: 2,
        stats: 3,
        about: 4,
        news: 5,
        clubs: 6,
        gallery: 7,
        testimonials: 8,
        quicklinks: 9,
        contact: 10,
      };
      return defaultOrder[sectionId] || 999;
    }
    const section = sectionVisibility.find((s) => s.id === sectionId);
    return section ? section.order : 999;
  };

  // Get ordered and enabled sections
  const getOrderedSections = () => {
    const availableSectionIds = [
      'hero',
      'announcements',
      'stats',
      'about',
      'news',
      'clubs',
      'gallery',
      'testimonials',
      'quicklinks',
      'contact',
    ];

    // Filter enabled sections and sort by order
    const orderedIds = availableSectionIds
      .filter((id) => isSectionEnabled(id))
      .sort((a, b) => getSectionOrder(a) - getSectionOrder(b));

    // Return array of section components based on IDs
    return orderedIds;
  };

  // Smooth scroll helper
  const smoothScrollTo = (elementId) => {
    const element = document.querySelector(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  // Navigation items
  const navItems = [
    { label: isArabic ? 'الرئيسية' : 'Accueil', href: '#hero' },
    { label: isArabic ? 'عن الثانوية' : 'À Propos', href: '#about' },
    { label: isArabic ? 'الأخبار' : 'Actualités', href: '#news' },
    { label: isArabic ? 'الأندية' : 'Clubs', href: '#clubs' },
    { label: isArabic ? 'اتصل' : 'Contact', href: '#contact' },
  ];

  // ==================== SECTION 1: NAVIGATION STICKY ====================
  const Navigation = () => (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-3 font-bold text-xl transition-colors ${
              scrolled
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-white drop-shadow-lg'
            }`}
          >
            <AcademicCapSolidIcon className="w-10 h-10" />
            <span className="hidden sm:inline">{t.schoolName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => smoothScrollTo(item.href)}
                className={`font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  scrolled
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-white drop-shadow-md'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  : 'hover:bg-white/20 text-white'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`p-2 rounded-lg font-semibold transition-colors ${
                scrolled
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  : 'hover:bg-white/20 text-white'
              }`}
              aria-label="Toggle language"
            >
              {language === 'fr' ? 'AR' : 'FR'}
            </button>

            {/* Auth Button */}
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  scrolled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                <AcademicCapIcon className="w-5 h-5" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  scrolled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {isArabic ? 'تسجيل الدخول' : 'Connexion'}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  : 'hover:bg-white/20 text-white'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => smoothScrollTo(item.href)}
                className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {isArabic ? 'تسجيل الدخول' : 'Connexion'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );

  // ==================== SECTION 2: HERO FULL-HEIGHT ====================
  const HeroSection = () => {
    // Déterminer le type de background (gradient par défaut)
    const backgroundType = heroContent?.backgroundType || 'gradient';
    const gradientColors = heroContent?.gradientColors || { from: 'blue-600', via: 'violet-600', to: 'purple-700' };
    const backgroundImages = heroContent?.backgroundImages || [];
    
    // Fonction pour obtenir la classe CSS complète du gradient
    const getGradientClass = () => {
      const { from, via, to } = gradientColors;
      // Mapping des couleurs Tailwind vers les classes complètes
      const colorMap = {
        'blue-600': 'from-blue-600',
        'blue-500': 'from-blue-500',
        'violet-600': 'via-violet-600',
        'violet-500': 'via-violet-500',
        'purple-700': 'to-purple-700',
        'purple-600': 'to-purple-600',
        'indigo-600': 'from-indigo-600',
        'indigo-500': 'via-indigo-500',
        'pink-600': 'to-pink-600',
        'teal-600': 'from-teal-600',
        'emerald-500': 'via-emerald-500',
        'cyan-600': 'to-cyan-600',
        'rose-600': 'from-rose-600',
        'orange-500': 'via-orange-500',
        'amber-600': 'to-amber-600',
        'green-600': 'from-green-600',
        'lime-500': 'via-lime-500',
        'yellow-600': 'to-yellow-600',
      };
      
      // Construire la classe gradient avec les valeurs appropriées
      const fromClass = colorMap[from] || 'from-blue-600';
      const viaClass = colorMap[via]?.replace('from-', 'via-') || 'via-violet-600';
      const toClass = colorMap[to]?.replace('from-', 'to-').replace('via-', 'to-') || 'to-purple-700';
      
      return `${fromClass} ${viaClass} ${toClass}`;
    };
    
    // Rendu du background selon le type
    const renderBackground = () => {
      if (backgroundType === 'image' && backgroundImages.length > 0) {
        // Mode: Image unique
        return (
          <div className="absolute inset-0">
            <img
              src={backgroundImages[0].url}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20"></div>
          </div>
        );
      } else if (backgroundType === 'carousel' && backgroundImages.length > 0) {
        // Mode: Carousel avec transition
        return (
          <div className="absolute inset-0">
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentCarouselImage ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Hero carousel ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20"></div>
            
            {/* Carousel indicators */}
            {backgroundImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {backgroundImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCarouselImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentCarouselImage
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      } else {
        // Mode: Gradient (par défaut)
        return (
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass()}`}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        );
      }
    };

    return (
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background dynamique */}
        {renderBackground()}

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
              <SparklesIcon className="w-5 h-5 text-amber-400" />
              {heroContent?.badge?.[isArabic ? 'ar' : 'fr'] || t.welcome}
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
              {heroContent?.title?.[isArabic ? 'ar' : 'fr'] || (
                <>
                  {t.welcome}
                  <br />
                  <span className="text-amber-400">{t.schoolName}</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              {heroContent?.subtitle?.[isArabic ? 'ar' : 'fr'] || t.heroSubtitle}
            </p>

            {/* Description */}
            <p className="text-base sm:text-lg text-blue-50 max-w-2xl mx-auto">
              {heroContent?.description?.[isArabic ? 'ar' : 'fr'] || t.heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#about"
                className="group inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-400 hover:text-white transition-all shadow-2xl hover:scale-105"
              >
                {heroContent?.primaryButtonText?.[isArabic ? 'ar' : 'fr'] || t.ctaPrimary}
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border-2 border-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all shadow-2xl hover:scale-105"
              >
                {heroContent?.secondaryButtonText?.[isArabic ? 'ar' : 'fr'] || t.ctaSecondary}
              </a>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white rounded-full animate-scroll"></div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 3: ANNONCES URGENTES ====================
  const UrgentAnnouncementsBar = () => {
    // Get latest 3 news sorted by date (newest first)
    const latestNews = dynamicNews
      ?.sort((a, b) => {
        const dateA = a.createdAt || a.date || 0;
        const dateB = b.createdAt || b.date || 0;
        return dateB - dateA;
      })
      .slice(0, 3) || [];

    if (latestNews.length === 0) return null;

    const AnnouncementItem = ({ article }) => (
      <button
        onClick={() => navigate(`/news/${article.id}`)}
        className="flex items-center gap-3 whitespace-nowrap px-8 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <BellAlertIcon className="w-5 h-5 animate-pulse flex-shrink-0" />
        <span className="font-semibold">
          {article[isArabic ? 'titleAr' : 'titleFr']}
        </span>
        <span className="opacity-75">•</span>
        <span className="text-sm">
          {article[isArabic ? 'dateAr' : 'dateFr']}
        </span>
      </button>
    );

    return (
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 overflow-hidden relative">
        <div className="flex items-center gap-4 animate-scroll-x">
          {/* First set */}
          {latestNews.map((article, index) => (
            <AnnouncementItem key={`first-${article.id || index}`} article={article} />
          ))}
          {/* Duplicate for seamless loop */}
          {latestNews.map((article, index) => (
            <AnnouncementItem key={`second-${article.id || index}`} article={article} />
          ))}
        </div>
      </div>
    );
  };

  // ==================== SECTION 4: STATISTIQUES ====================
  const StatisticsSection = () => {
    const defaultStats = [
      { labelFr: 'Élèves', labelAr: 'طلاب', value: '1200', icon: '👨‍🎓' },
      { labelFr: 'Enseignants', labelAr: 'أساتذة', value: '80', icon: '👨‍🏫' },
      { labelFr: 'Taux de Réussite', labelAr: 'معدل النجاح', value: '95%', icon: '🎓' },
      { labelFr: 'Clubs', labelAr: 'أندية', value: '15', icon: '🏆' },
    ];

    // Ensure stats is an array (fallback to default if not)
    const statsToDisplay = Array.isArray(dynamicStats) ? dynamicStats : defaultStats;

    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.statistics}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statsToDisplay.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat[isArabic ? 'labelAr' : 'labelFr']}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 5: À PROPOS ====================
  const AboutSection = () => {
    // Utiliser le contenu dynamique depuis Firestore, sinon fallback sur les traductions
    const aboutData = dynamicAboutContent || {};
    const title = aboutData[isArabic ? 'titleAr' : 'titleFr'] || t.aboutTitle;
    const subtitle = aboutData[isArabic ? 'subtitleAr' : 'subtitleFr'] || t.aboutSubtitle;
    const description = aboutData[isArabic ? 'descriptionAr' : 'descriptionFr'] || t.aboutDescription;
    const imageUrl = aboutData.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop';
    const yearsExp = aboutData.yearsOfExperience || 15;
    
    // Features avec fallback sur valeurs par défaut
    const defaultFeatures = [
      { titleFr: 'Programmes Excellents', titleAr: 'برامج متميزة', descriptionFr: 'Curriculums modernes', descriptionAr: 'مناهج حديثة ومتطورة' },
      { titleFr: 'Activités Variées', titleAr: 'أنشطة متنوعة', descriptionFr: 'Sport, Art, Culture', descriptionAr: 'رياضة، فن، ثقافة' },
      { titleFr: 'Équipe Dédiée', titleAr: 'فريق متميز', descriptionFr: 'Enseignants qualifiés', descriptionAr: 'أساتذة مؤهلون' },
      { titleFr: 'Infrastructure Moderne', titleAr: 'بيئة حديثة', descriptionFr: 'Équipements modernes', descriptionAr: 'تجهيزات متطورة' }
    ];
    const features = aboutData.features || defaultFeatures;

    return (
      <section id="about" className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={imageUrl}
                  alt="Lycée"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop';
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-2xl">
                <div className="text-4xl font-bold">{yearsExp}+</div>
                <div className="text-sm opacity-90">{isArabic ? 'سنوات من التميز' : "Ans d'Excellence"}</div>
              </div>
            </div>

            {/* Content Side */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <CheckCircleIcon className="w-5 h-5" />
                  {isArabic ? 'عن الثانوية' : 'À Propos'}
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {title}
                </h2>
                <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-6">
                  {subtitle}
                </p>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {feature[isArabic ? 'titleAr' : 'titleFr']}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {feature[isArabic ? 'descriptionAr' : 'descriptionFr']}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
              >
                {t.aboutCta}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 6: ACTUALITÉS ====================
  const NewsSection = () => {
    const newsToDisplay = dynamicNews?.slice(0, 3) || [];

    if (newsToDisplay.length === 0) return null;

    return (
      <section id="news" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <NewspaperIcon className="w-5 h-5" />
              {isArabic ? 'الأخبار' : 'Actualités'}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.newsTitle}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t.newsSubtitle}
            </p>
          </div>

          {/* News Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsToDisplay.map((article) => (
              <article
                key={article.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-500 to-violet-600 relative">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article[isArabic ? 'titleAr' : 'titleFr']}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <NewspaperIcon className="w-20 h-20 opacity-50" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
                      {article.category?.[isArabic ? 'ar' : 'fr'] || (isArabic ? 'أخبار' : 'Actualité')}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {article[isArabic ? 'dateAr' : 'dateFr']}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article[isArabic ? 'titleAr' : 'titleFr']}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                    {article[isArabic ? 'excerptAr' : 'excerptFr']}
                  </p>

                  {/* Read More */}
                  <button
                    onClick={() => navigate(`/news/${article.id}`)}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all"
                  >
                    {isArabic ? 'اقرأ المزيد' : 'Lire la suite'}
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/news')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
            >
              {t.newsViewAll}
              <ArrowUpRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 7: CLUBS ====================
  const ClubsSection = () => {
    const clubsToDisplay = dynamicClubs?.slice(0, 8) || [];

    if (clubsToDisplay.length === 0) return null;

    return (
      <section id="clubs" className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <UserGroupIcon className="w-5 h-5" />
              {isArabic ? 'الأندية' : 'Clubs'}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.clubsTitle}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t.clubsSubtitle}
            </p>
          </div>

          {/* Clubs Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubsToDisplay.map((club) => (
              <div
                key={club.id}
                onClick={() => navigate(`/clubs/${club.id}`)}
                className={`group relative bg-gradient-to-br ${club.color || 'from-blue-500 to-violet-600'} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer`}
              >
                {/* Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {club.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">
                  {club[isArabic ? 'nameAr' : 'nameFr']}
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  {club[isArabic ? 'descriptionAr' : 'descriptionFr']}
                </p>

                {/* Join Button */}
                <button className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors">
                  {t.clubsJoin}
                </button>

                {/* Decorative Element */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full -z-10 group-hover:scale-150 transition-transform"></div>
              </div>
            ))}
          </div>
          
          {/* View All Clubs Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/clubs')}
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-violet-700 transition-all hover:scale-105 shadow-lg"
            >
              {isArabic ? 'عرض جميع الأندية' : 'Voir Tous les Clubs'}
              <ArrowUpRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 8: GALERIE ====================
  const GallerySection = () => {
    const galleryToDisplay = dynamicGallery?.slice(0, 6) || [];

    if (galleryToDisplay.length === 0) return null;

    return (
      <section id="gallery" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <PhotoIcon className="w-5 h-5" />
              {isArabic ? 'الصور' : 'Galerie'}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.galleryTitle}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t.gallerySubtitle}
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryToDisplay.map((image, index) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className={`${index === 0 ? 'aspect-[2/1]' : 'aspect-square'} overflow-hidden bg-gradient-to-br ${
                  ['from-blue-500 to-violet-600', 'from-violet-500 to-purple-600', 'from-amber-500 to-orange-600', 
                   'from-green-500 to-teal-600', 'from-pink-500 to-rose-600', 'from-indigo-500 to-blue-600'][index % 6]
                } relative`}>
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt={image[isArabic ? 'titleAr' : 'titleFr']}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <PhotoIcon className="w-16 h-16 opacity-50" />
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div className="text-white">
                    <h3 className="font-bold text-lg mb-1">
                      {image[isArabic ? 'titleAr' : 'titleFr']}
                    </h3>
                    {image[isArabic ? 'descriptionAr' : 'descriptionFr'] && (
                      <p className="text-sm text-white/90">
                        {image[isArabic ? 'descriptionAr' : 'descriptionFr']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/gallery')}
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-amber-600 transition-all hover:scale-105 shadow-lg"
            >
              {isArabic ? 'عرض المزيد' : 'Voir Plus de Photos'}
              <PhotoIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 9: TÉMOIGNAGES ====================
  const TestimonialsSection = () => {
    if (!dynamicTestimonials || dynamicTestimonials.length === 0) return null;

    const currentTestimonialData = dynamicTestimonials[currentTestimonial];

    return (
      <section className="py-24 bg-gradient-to-br from-blue-600 to-violet-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <StarSolidIcon className="w-5 h-5 text-amber-300" />
              {isArabic ? 'الشهادات' : 'Témoignages'}
            </div>
            <h2 className="text-4xl font-bold mb-4">{t.testimonialsTitle}</h2>
            <p className="text-xl text-blue-100">{t.testimonialsSubtitle}</p>
          </div>

          {/* Testimonial Card */}
          <div className="bg-white text-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon key={i} className="w-6 h-6 text-amber-400" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl leading-relaxed mb-8 italic">
              "{currentTestimonialData[isArabic ? 'quoteAr' : 'quoteFr']}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                {currentTestimonialData[isArabic ? 'nameAr' : 'nameFr']?.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">
                  {currentTestimonialData[isArabic ? 'nameAr' : 'nameFr']}
                </div>
                <div className="text-gray-600">
                  {currentTestimonialData[isArabic ? 'roleAr' : 'roleFr']}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {dynamicTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial
                    ? 'bg-white w-8'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 10: LIENS RAPIDES ====================
  const QuickLinksSection = () => {
    const linksToDisplay = dynamicQuickLinks?.slice(0, 8) || [];

    if (linksToDisplay.length === 0) return null;

    return (
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <ArrowRightIcon className="w-5 h-5" />
              {isArabic ? 'روابط سريعة' : 'Accès Rapide'}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.quickLinksTitle}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t.quickLinksSubtitle}
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {linksToDisplay.map((link) => {
              const IconComponent = {
                AcademicCapIcon,
                NewspaperIcon,
                CalendarDaysIcon,
                DocumentTextIcon,
                BookOpenIcon,
                TrophyIcon,
                UserGroupIcon,
                PhoneIcon,
              }[link.icon] || AcademicCapIcon;

              return (
                <a
                  key={link.id}
                  href={link.url || '#'}
                  className="group flex items-center gap-4 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-6 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {link[isArabic ? 'titleAr' : 'titleFr']}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {link[isArabic ? 'descriptionAr' : 'descriptionFr']}
                    </div>
                  </div>
                  <ArrowUpRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 11: CONTACT ====================
  const ContactSection = () => {
    const contact = dynamicContactInfo || {
      phone: '+212 5XX-XXXXXX',
      email: 'contact@lycee-excellence.ma',
      addressFr: 'Adresse du Lycée',
      addressAr: 'عنوان الثانوية',
      hoursFr: 'Lun-Ven: 8h-17h',
      hoursAr: 'الاثنين-الجمعة: 8 صباحاً - 5 مساءً',
    };

    // Contact form state
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Handle form input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        alert(isArabic ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis');
        return;
      }

      setIsSubmitting(true);

      try {
        // Import Firestore functions
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');

        // Save to Firestore
        await addDoc(collection(db, 'messages'), {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || (isArabic ? 'رسالة من الصفحة الرئيسية' : 'Message depuis la page d\'accueil'),
          message: formData.message.trim(),
          status: 'new',
          read: false,
          replied: false,
          createdAt: serverTimestamp(),
          source: 'landing_page'
        });

        // Show success message
        setSubmitSuccess(true);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });

        // Hide success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);

      } catch (error) {
        console.error('Error submitting contact form:', error);
        alert(isArabic ? 'حدث خطأ أثناء إرسال الرسالة' : 'Erreur lors de l\'envoi du message');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <PhoneIcon className="w-5 h-5" />
              {isArabic ? 'اتصل بنا' : 'Contact'}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.contactTitle}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t.contactSubtitle}
            </p>
          </div>

          {/* Contact Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Phone */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                  <PhoneIcon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'الهاتف' : 'Téléphone'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {contact.phone}
                </p>
              </div>

              {/* Email */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mb-4">
                  <EnvelopeIcon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 break-all">
                  {contact.email}
                </p>
              </div>

              {/* Address */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
                  <MapPinIcon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'العنوان' : 'Adresse'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {contact[isArabic ? 'addressAr' : 'addressFr']}
                </p>
              </div>

              {/* Hours */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
                  <ClockIcon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'ساعات العمل' : 'Horaires'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {contact[isArabic ? 'hoursAr' : 'hoursFr']}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t.contactForm}
                </h3>
                
                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-green-800 dark:text-green-200">
                      {isArabic 
                        ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' 
                        : 'Votre message a été envoyé avec succès ! Nous vous contacterons bientôt.'}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isArabic ? 'الاسم *' : 'Nom *'}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={isArabic ? 'اسمك' : 'Votre nom'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isArabic ? 'البريد الإلكتروني *' : 'Email *'}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={isArabic ? 'بريدك الإلكتروني' : 'Votre email'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'الموضوع' : 'Sujet'} ({isArabic ? 'اختياري' : 'optionnel'})
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={isArabic ? 'موضوع الرسالة' : 'Sujet du message'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'الرسالة *' : 'Message *'}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={isArabic ? 'رسالتك هنا...' : 'Votre message...'}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {isArabic ? 'جاري الإرسال...' : 'Envoi en cours...'}
                      </>
                    ) : (
                      <>
                        {isArabic ? 'إرسال الرسالة' : 'Envoyer le Message'}
                        <ArrowRightIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ==================== SECTION 12: FOOTER ====================
  const Footer = () => {
    // Default footer content
    const defaultFooter = {
      schoolNameFr: t.schoolName,
      schoolNameAr: t.schoolName,
      descriptionFr: 'Établissement d\'excellence dédié à former les leaders de demain',
      descriptionAr: 'مؤسسة تعليمية متميزة مكرسة لتكوين قادة الغد',
      linksColumnTitleFr: t.footerLinks,
      linksColumnTitleAr: t.footerLinks,
      contactColumnTitleFr: t.footerContact,
      contactColumnTitleAr: t.footerContact,
      socialTitleFr: 'Suivez-nous',
      socialTitleAr: 'تابعنا',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      linkedinUrl: '',
      copyrightTextFr: t.footerCopyright,
      copyrightTextAr: t.footerCopyright
    };

    const footer = dynamicFooterContent || defaultFooter;

    return (
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                <AcademicCapSolidIcon className="w-8 h-8 text-blue-400" />
                {isArabic ? footer.schoolNameAr : footer.schoolNameFr}
              </div>
              <p className="text-sm text-gray-400">
                {isArabic ? footer.descriptionAr : footer.descriptionFr}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                {isArabic ? footer.linksColumnTitleAr : footer.linksColumnTitleFr}
              </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'عن الثانوية' : 'À Propos'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/news')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'الأخبار' : 'Actualités'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/clubs')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'الأندية' : 'Clubs'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/gallery')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'المعرض' : 'Galerie'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'اتصل بنا' : 'Contact'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/calendar')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'التقويم الأكاديمي' : 'Calendrier'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'الدورات' : 'Cours'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/enroll')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'التسجيل' : 'Inscription'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-blue-400 transition-colors text-left">
                  {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
                </button>
              </li>
            </ul>
          </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                {isArabic ? footer.contactColumnTitleAr : footer.contactColumnTitleFr}
              </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-blue-400" />
                {dynamicContactInfo?.phone || '+212 5XX-XXXXXX'}
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-blue-400" />
                {dynamicContactInfo?.email || 'contact@lycee-excellence.ma'}
              </li>
              <li className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <span>
                  {dynamicContactInfo?.[isArabic ? 'addressAr' : 'addressFr'] ||
                    'Adresse du Lycée'}
                </span>
              </li>
            </ul>
          </div>

            {/* Social */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                {isArabic ? footer.socialTitleAr : footer.socialTitleFr}
              </h3>
              <div className="flex gap-3">
                {footer.facebookUrl && (
                  <a
                    href={footer.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {footer.twitterUrl && (
                  <a
                    href={footer.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                )}
                {footer.instagramUrl && (
                  <a
                    href={footer.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {footer.youtubeUrl && (
                  <a
                    href={footer.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {footer.linkedinUrl && (
                  <a
                    href={footer.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>{isArabic ? footer.copyrightTextAr : footer.copyrightTextFr}</p>
          </div>
        </div>
      </footer>
    );
  };

  // ==================== LOADING STATE ====================
  if (contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-violet-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  // Map section IDs to their components
  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'hero':
        return <HeroSection key="hero" />;
      case 'announcements':
        return <UrgentAnnouncementsBar key="announcements" />;
      case 'stats':
        return <StatisticsSection key="stats" />;
      case 'about':
        return <AboutSection key="about" />;
      case 'news':
        return <NewsSection key="news" />;
      case 'clubs':
        return <ClubsSection key="clubs" />;
      case 'gallery':
        return <GallerySection key="gallery" />;
      case 'testimonials':
        return <TestimonialsSection key="testimonials" />;
      case 'quicklinks':
        return <QuickLinksSection key="quicklinks" />;
      case 'contact':
        return <ContactSection key="contact" />;
      default:
        return null;
    }
  };

  return (
    <SharedLayout>
      {getOrderedSections().map(renderSection)}
    </SharedLayout>
  );
}
