import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  CheckCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import SectionVisibilityManager from './SectionVisibilityManager';
import SiteSettingsManager from './cms/SiteSettingsManager';

/**
 * GeneralSettingsManager - Combines Visibility and Site Settings
 * This component groups general site-wide settings together
 */
export default function GeneralSettingsManager() {
  const { isArabic } = useLanguage();
  const [activeSection, setActiveSection] = useState('settings'); // 'settings' or 'visibility'

  const sections = [
    { 
      id: 'settings', 
      icon: Cog6ToothIcon, 
      label: isArabic ? 'إعدادات الموقع' : 'Paramètres du Site',
      description: isArabic ? 'إدارة اسم المدرسة والشعار ومعلومات الاتصال' : 'Gérer le nom de l\'école, logo et informations de contact',
      color: 'blue'
    },
    { 
      id: 'visibility', 
      icon: CheckCircleIcon, 
      label: isArabic ? 'رؤية الأقسام' : 'Visibilité des Sections',
      description: isArabic ? 'التحكم في ظهور أقسام الصفحة الرئيسية' : 'Contrôler l\'affichage des sections de la page d\'accueil',
      color: 'purple'
    }
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive 
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50',
      purple: isActive 
        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-l-4 border-purple-600' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
    };
    return colors[color] || '';
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <div className="w-72 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">
            {isArabic ? 'الإعدادات العامة' : 'Paramètres Généraux'}
          </h3>
          
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${getColorClasses(section.color, isActive)}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs opacity-75 mt-0.5">{section.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Info Box */}
          <div className="mt-6 p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              💡 {isArabic 
                ? 'استخدم هذا القسم لإدارة الإعدادات العامة للموقع والتحكم في ظهور المحتوى'
                : 'Utilisez cette section pour gérer les paramètres généraux du site et contrôler la visibilité du contenu'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        {activeSection === 'settings' && <SiteSettingsManager />}
        {activeSection === 'visibility' && <SectionVisibilityManager isArabic={isArabic} />}
      </div>
    </div>
  );
}
