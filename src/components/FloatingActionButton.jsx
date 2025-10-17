import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ArrowUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isArabic } = useLanguage();

  const actions = [
    {
      icon: MagnifyingGlassIcon,
      label: isArabic ? 'البحث' : 'Rechercher',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        document.querySelector('input[type="text"]')?.focus();
        setIsOpen(false);
      }
    },
    {
      icon: BookmarkIcon,
      label: isArabic ? 'المفضلة' : 'Favoris',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {
        const bookmarksSection = document.querySelector('[data-section="bookmarks"]');
        bookmarksSection?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      }
    },
    {
      icon: ArrowUpIcon,
      label: isArabic ? 'للأعلى' : 'Haut',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Action Buttons */}
      <div className={`flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center gap-2`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap pr-2">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95`}
      >
        {isOpen ? (
          <PlusIcon className="w-6 h-6 transform rotate-45 transition-transform" />
        ) : (
          <SparklesIcon className="w-6 h-6 animate-pulse" />
        )}
      </button>
    </div>
  );
}
