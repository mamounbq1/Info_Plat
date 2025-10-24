import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { 
  HomeIcon, 
  AcademicCapIcon, 
  ArrowRightOnRectangleIcon,
  LanguageIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            )}
            <span className="text-xl font-bold text-gray-900">
              {language === 'ar' ? settings.schoolNameAr : settings.schoolNameFr}
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
