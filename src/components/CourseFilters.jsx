import { MagnifyingGlassIcon, BookOpenIcon, CalendarIcon } from '@heroicons/react/24/outline';

// Simplified: Only Date and Subject filters
const DATE_SORT_OPTIONS = [
  { id: 'recent', fr: 'Plus récents', ar: 'الأحدث' },
  { id: 'oldest', fr: 'Plus anciens', ar: 'الأقدم' }
];

export default function CourseFilters({ 
  searchTerm, 
  setSearchTerm, 
  selectedSubject,
  setSelectedSubject,
  sortBy,
  setSortBy,
  isArabic,
  resultCount,
  subjects = []
}) {
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSortBy('recent');
  };

  const hasActiveFilters = searchTerm || selectedSubject !== 'all' || sortBy !== 'recent';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-4">
      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isArabic ? 'بحث...' : 'Rechercher...'}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Simplified Filters Row - Only Date and Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {/* Subject Filter (Matière) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            <BookOpenIcon className="w-3 h-3 inline mr-1" />
            {isArabic ? 'المادة' : 'Matière'}
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{isArabic ? 'جميع المواد' : 'Toutes les matières'}</option>
            {subjects.map(subject => (
              <option key={subject.code} value={subject.code}>
                {isArabic ? subject.nameAr : subject.nameFr}
              </option>
            ))}
          </select>
        </div>

        {/* Date Sort (Date d'ajout) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            <CalendarIcon className="w-3 h-3 inline mr-1" />
            {isArabic ? 'تاريخ الإضافة' : 'Date d\'ajout'}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DATE_SORT_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>
                {isArabic ? option.ar : option.fr}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className={`w-full px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              hasActiveFilters
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isArabic ? 'مسح' : 'Réinitialiser'}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        {resultCount} {isArabic ? 'نتيجة' : 'résultat(s)'}
      </div>
    </div>
  );
}
