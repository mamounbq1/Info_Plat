import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  DocumentIcon, 
  AcademicCapIcon,
  HomeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import HomeContentManager from '../components/HomeContentManager';
import GeneralSettingsManager from '../components/GeneralSettingsManager';
import AcademicStructureManagement from '../components/AcademicStructureManagement';
import PageManager from '../components/PageManager';



export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const { isArabic } = useLanguage();
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'structure', 'pages'
  const [contentSubTab, setContentSubTab] = useState('settings'); // 'settings', 'homepage'
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);



  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isArabic ? 'لوحة تحكم المسؤول' : 'Tableau de bord Administrateur'}
              </h1>
              <p className="text-purple-100">
                {isArabic ? 'إدارة كاملة للموقع' : 'Gestion complète du site'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'content'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600'
              }`}
            >
              <HomeIcon className="w-5 h-5 inline-block mr-2" />
              {isArabic ? 'محتوى الموقع' : 'Contenu du Site'}
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'structure'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600'
              }`}
            >
              <AcademicCapIcon className="w-5 h-5 inline-block mr-2" />
              {isArabic ? 'هيكل المدرسة' : 'Structure de l\'École'}
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'pages'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600'
              }`}
            >
              <DocumentIcon className="w-5 h-5 inline-block mr-2" />
              {isArabic ? 'الصفحات' : 'Pages'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' ? (
          // Tab 1: Contenu du Site avec Sidebar
          <div className="flex gap-6">
            {/* Sidebar pour Contenu */}
            <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'إدارة المحتوى' : 'Gestion du Contenu'}
              </h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setContentSubTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    contentSubTab === 'settings'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>{isArabic ? 'الإعدادات العامة' : 'Paramètres Généraux'}</span>
                </button>
                <button
                  onClick={() => setContentSubTab('homepage')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    contentSubTab === 'homepage'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <HomeIcon className="w-5 h-5" />
                  <span>{isArabic ? 'محتوى الصفحة الرئيسية' : 'Contenu de la Page d\'Accueil'}</span>
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {contentSubTab === 'settings' ? (
                <GeneralSettingsManager />
              ) : contentSubTab === 'homepage' ? (
                <HomeContentManager />
              ) : null}
            </div>
          </div>
        ) : activeTab === 'structure' ? (
          // Tab 2: Structure de l'École
          <AcademicStructureManagement />
        ) : activeTab === 'pages' ? (
          // Tab 3: Pages Management
          <PageManager />
        ) : null}
        </div>
      </div>
    </div>
  );
}
