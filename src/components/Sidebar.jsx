import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';
import { 
  HomeIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const { userProfile, logout, isAdmin } = useAuth();
  const { isArabic } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  // Role-based menu items
  const getMenuItems = () => {
    const role = userProfile?.role || 'student';
    
    // Student menu items
    if (role === 'student') {
      return [
        {
          icon: HomeIcon,
          labelFr: 'Accueil',
          labelAr: 'الرئيسية',
          path: '/dashboard',
          color: 'blue'
        },
        {
          icon: ChartBarIcon,
          labelFr: 'Performance',
          labelAr: 'الأداء',
          path: '/student/performance',
          color: 'purple',
          badge: 'new'
        },
        {
          icon: ClipboardDocumentCheckIcon,
          labelFr: 'Quiz',
          labelAr: 'الاختبارات',
          path: '/student/quizzes',
          color: 'pink'
        },
        {
          icon: DocumentTextIcon,
          labelFr: 'Exercices',
          labelAr: 'التمارين',
          path: '/student/exercises',
          color: 'indigo'
        },
        {
          icon: BookmarkIcon,
          labelFr: 'Favoris',
          labelAr: 'المفضلة',
          path: '/bookmarks',
          color: 'orange'
        }
      ];
    }
    
    // Teacher menu items
    if (role === 'teacher') {
      return [
        {
          icon: HomeIcon,
          labelFr: 'Tableau de bord',
          labelAr: 'لوحة التحكم',
          path: '/dashboard',
          color: 'blue'
        }
      ];
    }
    
    // Admin menu items
    if (role === 'admin') {
      return [
        {
          icon: HomeIcon,
          labelFr: 'Tableau de bord',
          labelAr: 'لوحة التحكم',
          path: '/dashboard',
          color: 'blue'
        },
        {
          icon: ChartBarIcon,
          labelFr: 'Analytique',
          labelAr: 'التحليلات',
          path: '/admin/analytics',
          color: 'purple'
        },
        {
          icon: BookOpenIcon,
          labelFr: 'Cours',
          labelAr: 'الدروس',
          path: '/admin/courses',
          color: 'green'
        },
        {
          icon: UsersIcon,
          labelFr: 'Utilisateurs',
          labelAr: 'المستخدمون',
          path: '/admin/users',
          color: 'indigo'
        },
        {
          icon: ClipboardDocumentCheckIcon,
          labelFr: 'Quiz',
          labelAr: 'الاختبارات',
          path: '/admin/quizzes',
          color: 'pink'
        },
        {
          icon: DocumentTextIcon,
          labelFr: 'Exercices',
          labelAr: 'التمارين',
          path: '/admin/exercises',
          color: 'yellow'
        }
      ];
    }
    
    // Default fallback
    return [];
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActivePath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Always Fixed */}
      <aside 
        className={`
          fixed top-0 ${isArabic ? 'right-0' : 'left-0'} h-screen 
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50
          ${isCollapsed ? 'w-16' : 'w-56'}
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : (isArabic ? 'translate-x-full' : '-translate-x-full')}
          lg:translate-x-0
          flex flex-col
          overflow-hidden
        `}
      >
        {/* Header - Compact */}
        <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2">
          {/* Logo and Brand Name */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">EP</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {isArabic ? 'منصة' : 'EduPlatform'}
              </span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white text-xs font-bold">EP</span>
            </div>
          )}

          {/* Right Side Actions - Notification Bell and Collapse Button */}
          {!isCollapsed && (
            <div className="flex items-center gap-1">
              {/* Notification Bell - Only for admins */}
              {isAdmin && <NotificationBell />}

              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
              >
                <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}

          {/* Collapsed state - show expand button */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition absolute right-1"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* User Info - Show only when expanded */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {userProfile?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {userProfile?.fullName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span>{userProfile?.points || 0}</span>
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed User Avatar */}
        {isCollapsed && (
          <div className="px-2 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {userProfile?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Navigation - Compact */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="space-y-0.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              // Color mapping for active state
              const colorClasses = {
                blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
                indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
                green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
                orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
              };
              
              const iconColorClasses = {
                blue: 'text-blue-600 dark:text-blue-400',
                purple: 'text-purple-600 dark:text-purple-400',
                pink: 'text-pink-600 dark:text-pink-400',
                indigo: 'text-indigo-600 dark:text-indigo-400',
                green: 'text-green-600 dark:text-green-400',
                yellow: 'text-yellow-600 dark:text-yellow-400',
                orange: 'text-orange-600 dark:text-orange-400'
              };
              
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? (isArabic ? item.labelAr : item.labelFr) : ''}
                  className={`
                    flex items-center ${isCollapsed ? 'justify-center relative' : 'gap-2 justify-between'} px-3 py-2 rounded-lg transition-all text-sm
                    ${isActive 
                      ? colorClasses[item.color] + ' font-medium shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'gap-2'}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? iconColorClasses[item.color] : 'text-gray-400 dark:text-gray-500'}`} />
                    {!isCollapsed && <span className="truncate">{isArabic ? item.labelAr : item.labelFr}</span>}
                  </div>
                  
                  {/* Badge for new items */}
                  {!isCollapsed && item.badge === 'new' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-500 text-white rounded">
                      {isArabic ? 'جديد' : 'NEW'}
                    </span>
                  )}
                  
                  {/* Collapsed badge indicator */}
                  {isCollapsed && item.badge === 'new' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - Compact */}
        <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (isDarkMode ? (isArabic ? 'نهاري' : 'Jour') : (isArabic ? 'ليلي' : 'Nuit')) : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-sm`}
          >
            {isDarkMode ? (
              <>
                <SunIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{isArabic ? 'نهاري' : 'Jour'}</span>}
              </>
            ) : (
              <>
                <MoonIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{isArabic ? 'ليلي' : 'Nuit'}</span>}
              </>
            )}
          </button>
          
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            title={isCollapsed ? (isArabic ? 'إعدادات' : 'Paramètres') : ''}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-sm`}
          >
            <Cog6ToothIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">{isArabic ? 'إعدادات' : 'Paramètres'}</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            title={isCollapsed ? (isArabic ? 'خروج' : 'Déconnexion') : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition text-sm`}
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">{isArabic ? 'خروج' : 'Déconnexion'}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button - Smaller */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed top-3 ${isArabic ? 'right-3' : 'left-3'} z-30 lg:hidden
          p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700 transition
        `}
      >
        <Bars3Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
    </>
  );
}
