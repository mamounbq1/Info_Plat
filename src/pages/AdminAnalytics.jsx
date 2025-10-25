import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function AdminAnalytics() {
  const { isArabic } = useLanguage();
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}
        ${isArabic ? 'lg:mr-56 lg:ml-0' : ''}
        transition-all duration-300
      `}>
        {/* Page Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'لوحة التحليلات' : 'Tableau Analytique'}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {isArabic ? 'إحصائيات وتحليلات المنصة' : 'Statistiques et analyses de la plateforme'}
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <AnalyticsDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}
