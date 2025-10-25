import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  HomeIcon, 
  AcademicCapIcon, 
  ArrowRightOnRectangleIcon,
  LanguageIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CACHE_KEY = 'siteSettings_cache';

export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Try to load cached settings immediately to prevent flash
  const getCachedSettings = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to read cached settings:', error);
    }
    return {
      schoolNameFr: '',
      schoolNameAr: '',
      logoUrl: '',
      faviconUrl: ''
    };
  };

  const [siteSettings, setSiteSettings] = useState(getCachedSettings());

  useEffect(() => {
    fetchSiteSettings();
    
    // Listen for updates from admin panel
    const handleSettingsUpdate = () => {
      fetchSiteSettings();
    };
    
    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('siteSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  // Update favicon when settings change
  useEffect(() => {
    if (siteSettings.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = siteSettings.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [siteSettings.faviconUrl]);

  // Update page title when settings or language change
  useEffect(() => {
    const pageTitle = language === 'ar' ? siteSettings.pageTitleAr : siteSettings.pageTitleFr;
    if (pageTitle) {
      document.title = pageTitle;
    }
  }, [siteSettings.pageTitleFr, siteSettings.pageTitleAr, language]);

  const fetchSiteSettings = async () => {
    try {
      const docRef = doc(db, 'siteSettings', 'general');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteSettings(data);
        
        // Update cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (error) {
          console.warn('Failed to cache settings:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getSchoolName = () => {
    // If custom school names are set, use them
    if (siteSettings.schoolNameFr || siteSettings.schoolNameAr) {
      return language === 'ar' ? (siteSettings.schoolNameAr || 'منصة التعليم') : (siteSettings.schoolNameFr || 'EduPlatform');
    }
    // Default fallback
    return language === 'ar' ? 'منصة التعليم' : 'EduPlatform';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {siteSettings.logoUrl ? (
              <img src={siteSettings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            )}
            <span className="text-xl font-bold text-gray-900">
              {getSchoolName()}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {currentUser ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                >
                  <HomeIcon className="w-5 h-5" />
                  {t('dashboard')}
                </Link>
                
                <button
                  onClick={toggleLanguage}
                  className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                >
                  <LanguageIcon className="w-5 h-5" />
                  {language === 'fr' ? 'العربية' : 'Français'}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  {t('home')}
                </Link>
                
                <button
                  onClick={toggleLanguage}
                  className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                >
                  <LanguageIcon className="w-5 h-5" />
                  {language === 'fr' ? 'العربية' : 'Français'}
                </button>
                
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 transition font-semibold"
                >
                  {t('login')}
                </Link>
                
                <Link 
                  to="/signup" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {t('signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {currentUser ? (
              <div className="flex flex-col gap-4">
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                >
                  <HomeIcon className="w-5 h-5" />
                  {t('dashboard')}
                </Link>
                
                <button
                  onClick={() => {
                    toggleLanguage();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2 text-left"
                >
                  <LanguageIcon className="w-5 h-5" />
                  {language === 'fr' ? 'العربية' : 'Français'}
                </button>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 justify-center"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  {t('home')}
                </Link>
                
                <button
                  onClick={() => {
                    toggleLanguage();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2 text-left"
                >
                  <LanguageIcon className="w-5 h-5" />
                  {language === 'fr' ? 'العربية' : 'Français'}
                </button>
                
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-blue-600 hover:text-blue-700 transition font-semibold"
                >
                  {t('login')}
                </Link>
                
                <Link 
                  to="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
