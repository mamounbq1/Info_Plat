import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function SearchModal({ isOpen, onClose, courses }) {
  const { isArabic } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = courses.filter(course => 
      course.titleFr?.toLowerCase().includes(query) ||
      course.titleAr?.includes(searchQuery) ||
      course.descriptionFr?.toLowerCase().includes(query) ||
      course.descriptionAr?.includes(searchQuery) ||
      course.category?.toLowerCase().includes(query)
    ).slice(0, 5);

    setFilteredCourses(results);
  }, [searchQuery, courses]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectCourse = () => {
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all animate-slide-in">
          {/* Search Input */}
          <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isArabic ? 'ابحث عن الدروس...' : 'Rechercher des cours...'}
                    className="w-full pl-12 pr-12 py-4 text-lg bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none text-gray-900 dark:text-white"
                    autoFocus
                  />
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto p-2">
                  {searchQuery.trim() === '' ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        {isArabic ? 'ابدأ بالكتابة للبحث...' : 'Commencez à taper pour rechercher...'}
                      </p>
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <BookOpenIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        {isArabic ? 'لا توجد نتائج' : 'Aucun résultat trouvé'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredCourses.map((course) => (
                        <Link
                          key={course.id}
                          to={`/course/${course.id}`}
                          onClick={handleSelectCourse}
                          className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={isArabic ? course.titleAr : course.titleFr}
                                className="w-16 h-16 rounded object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                <BookOpenIcon className="w-8 h-8 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                                {isArabic ? course.titleAr : course.titleFr}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                {isArabic ? course.descriptionAr : course.descriptionFr}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                {course.category && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                    {course.category}
                                  </span>
                                )}
                                {course.duration && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    {course.duration}h
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">ESC</kbd>
                {isArabic ? 'للإغلاق' : 'pour fermer'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
