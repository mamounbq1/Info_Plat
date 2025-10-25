import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  HomeIcon, 
  AcademicCapIcon, 
  NewspaperIcon, 
  PhotoIcon, 
  UserGroupIcon,
  CalendarIcon,
  PhoneIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function SharedLayout({ children }) {
  const { isArabic, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    phone: '+212 5XX-XXXXXX',
    email: 'contact@lycee-excellence.ma',
    addressFr: 'Rabat, Maroc',
    addressAr: 'الرباط، المغرب'
  });
  const [footerData, setFooterData] = useState({
    schoolNameFr: 'Lycée Excellence',
    schoolNameAr: 'ثانوية التميز',
    descriptionFr: 'Un établissement d\'enseignement de premier plan engagé à fournir une éducation de haute qualité et à développer une génération de leaders exceptionnels.',
    descriptionAr: 'مؤسسة تعليمية رائدة تلتزم بتقديم تعليم عالي الجودة وتنمية جيل متميز من القادة.',
    socialTitleFr: 'Suivez-nous',
    socialTitleAr: 'تابعنا',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    linkedinUrl: ''
  });

  // Update favicon when settings change
  useEffect(() => {
    if (settings.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings.faviconUrl]);

  // Update page title when settings or language change
  useEffect(() => {
    const pageTitle = isArabic ? settings.pageTitleAr : settings.pageTitleFr;
    if (pageTitle) {
      document.title = pageTitle;
    }
  }, [settings.pageTitleFr, settings.pageTitleAr, isArabic]);

  // Fetch contact information from Firebase
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docRef = doc(db, 'homepage', 'contact');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContactInfo(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
        // Keep default values if fetch fails
      }
    };
    fetchContactInfo();
  }, []);

  // Fetch footer data from Firebase
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const docRef = doc(db, 'homepage', 'footer');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFooterData(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
        // Keep default values if fetch fails
      }
    };
    fetchFooterData();
  }, []);

  const navigation = [
    { name: { fr: 'Accueil', ar: 'الرئيسية' }, href: '/', icon: HomeIcon },
    { name: { fr: 'À Propos', ar: 'من نحن' }, href: '/about', icon: AcademicCapIcon },
    { 
      name: { fr: 'Actualités', ar: 'الأخبار' }, 
      href: '/news', 
      icon: NewspaperIcon,
      dropdown: [
        { name: { fr: 'Toutes les Actualités', ar: 'جميع الأخبار' }, href: '/news' },
        { name: { fr: 'Annonces', ar: 'الإعلانات' }, href: '/announcements' },
        { name: { fr: 'Événements', ar: 'الأحداث' }, href: '/events' }
      ]
    },
    { name: { fr: 'Galerie', ar: 'المعرض' }, href: '/gallery', icon: PhotoIcon },
    { name: { fr: 'Clubs', ar: 'الأندية' }, href: '/clubs', icon: UserGroupIcon },
    { name: { fr: 'Contact', ar: 'اتصل بنا' }, href: '/contact', icon: PhoneIcon }
  ];

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="w-12 h-12 object-contain transform group-hover:scale-110 transition-all duration-300"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <AcademicCapIcon className="w-7 h-7 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  {isArabic ? (settings.schoolNameAr || 'ثانوية التميز') : (settings.schoolNameFr || 'Lycée Excellence')}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {isArabic ? (settings.taglineAr || 'المعرفة والإبداع') : (settings.taglineFr || 'Savoir et Innovation')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
              {navigation.map((item) => (
                <div key={item.href} className="relative">
                  {item.dropdown ? (
                    <div
                      onMouseEnter={() => setDropdownOpen(item.href)}
                      onMouseLeave={() => setDropdownOpen(null)}
                    >
                      <button
                        className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{isArabic ? item.name.ar : item.name.fr}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${dropdownOpen === item.href ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {dropdownOpen === item.href && (
                        <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-fade-in-up">
                          {item.dropdown.map((dropItem) => (
                            <Link
                              key={dropItem.href}
                              to={dropItem.href}
                              className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {isArabic ? dropItem.name.ar : dropItem.name.fr}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{isArabic ? item.name.ar : item.name.fr}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={isArabic ? 'Français' : 'العربية'}
              >
                <LanguageIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? (
                  <SunIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Login Button */}
              <Link
                to="/login"
                className="hidden sm:flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                {isArabic ? 'تسجيل الدخول' : 'Connexion'}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <div key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{isArabic ? item.name.ar : item.name.fr}</span>
                    </Link>
                    
                    {/* Mobile Dropdown Items */}
                    {item.dropdown && (
                      <div className="ml-8 rtl:ml-0 rtl:mr-8 mt-2 space-y-1">
                        {item.dropdown.map((dropItem) => (
                          <Link
                            key={dropItem.href}
                            to={dropItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {isArabic ? dropItem.name.ar : dropItem.name.fr}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Mobile Login Button */}
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-lg shadow-lg"
                >
                  {isArabic ? 'تسجيل الدخول' : 'Connexion'}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* About - Dynamic from Footer Manager */}
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {isArabic ? footerData.schoolNameAr : footerData.schoolNameFr}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {isArabic ? footerData.descriptionAr : footerData.descriptionFr}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{isArabic ? 'روابط سريعة' : 'Liens Rapides'}</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors">{isArabic ? 'من نحن' : 'À Propos'}</Link></li>
                <li><Link to="/news" className="text-gray-400 hover:text-blue-400 transition-colors">{isArabic ? 'الأخبار' : 'Actualités'}</Link></li>
                <li><Link to="/events" className="text-gray-400 hover:text-blue-400 transition-colors">{isArabic ? 'الأحداث' : 'Événements'}</Link></li>
                <li><Link to="/clubs" className="text-gray-400 hover:text-blue-400 transition-colors">{isArabic ? 'الأندية' : 'Clubs'}</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{isArabic ? 'موارد' : 'Ressources'}</h3>
              <ul className="space-y-2">
                <li><Link to="/gallery" className="text-gray-400 hover:text-blue-400 transition-colors">{isArabic ? 'المعرض' : 'Galerie'}</Link></li>
                <li><Link to="/announcements" className="text-gray-400 hover:text-blue-400 transition-colors">{isArabic ? 'الإعلانات' : 'Annonces'}</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-blue-400 transition-colors">{isArabic ? 'تسجيل الدخول' : 'Connexion'}</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-blue-400 transition-colors">{isArabic ? 'إنشاء حساب' : 'Inscription'}</Link></li>
              </ul>
            </div>

            {/* Contact - Dynamic from Firebase */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{isArabic ? 'اتصل بنا' : 'Contact'}</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {contactInfo.phone && (
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <PhoneIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{contactInfo.phone}</span>
                  </li>
                )}
                {contactInfo.email && (
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{contactInfo.email}</span>
                  </li>
                )}
                {(contactInfo.addressFr || contactInfo.addressAr) && (
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{isArabic ? contactInfo.addressAr : contactInfo.addressFr}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Social Media - Dynamic from Footer Manager */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{isArabic ? footerData.socialTitleAr : footerData.socialTitleFr}</h3>
              <div className="flex flex-col space-y-3">
                {footerData.facebookUrl && (
                  <a href={footerData.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm">Facebook</span>
                  </a>
                )}
                {footerData.twitterUrl && (
                  <a href={footerData.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="text-sm">Twitter</span>
                  </a>
                )}
                {footerData.instagramUrl && (
                  <a href={footerData.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-sm">Instagram</span>
                  </a>
                )}
                {footerData.youtubeUrl && (
                  <a href={footerData.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="text-sm">YouTube</span>
                  </a>
                )}
                {footerData.linkedinUrl && (
                  <a href={footerData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar - Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {isArabic ? footerData.schoolNameAr || 'ثانوية التميز' : footerData.schoolNameFr || 'Lycée Excellence'}. {isArabic ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
