import { MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const CATEGORIES = [
  { id: 'all', fr: 'Toutes les catégories', ar: 'جميع الفئات' },
  { id: 'mathematics', fr: 'Mathématiques', ar: 'الرياضيات' },
  { id: 'physics', fr: 'Physique', ar: 'الفيزياء' },
  { id: 'chemistry', fr: 'Chimie', ar: 'الكيمياء' },
  { id: 'biology', fr: 'Biologie', ar: 'الأحياء' },
  { id: 'computer', fr: 'Informatique', ar: 'علوم الحاسوب' },
  { id: 'languages', fr: 'Langues', ar: 'اللغات' },
  { id: 'history', fr: 'Histoire', ar: 'التاريخ' },
  { id: 'geography', fr: 'Géographie', ar: 'الجغرافيا' },
  { id: 'philosophy', fr: 'Philosophie', ar: 'الفلسفة' },
  { id: 'other', fr: 'Autre', ar: 'أخرى' }
];

const LEVELS = [
  { id: 'all', fr: 'Tous les niveaux', ar: 'جميع المستويات' },
  { id: 'beginner', fr: 'Débutant', ar: 'مبتدئ' },
  { id: 'intermediate', fr: 'Intermédiaire', ar: 'متوسط' },
  { id: 'advanced', fr: 'Avancé', ar: 'متقدم' }
];

const SORT_OPTIONS = [
  { id: 'recent', fr: 'Plus récents', ar: 'الأحدث' },
  { id: 'popular', fr: 'Plus populaires', ar: 'الأكثر شعبية' },
  { id: 'progress', fr: 'Par progression', ar: 'حسب التقدم' },
  { id: 'alphabetical', fr: 'Alphabétique', ar: 'أبجدي' }
];

export default function CourseFilters({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  sortBy,
  setSortBy,
  isArabic,
  resultCount
}) {
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSortBy('recent');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || sortBy !== 'recent';

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

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {/* Category Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            <FunnelIcon className="w-3 h-3 inline mr-1" />
            {isArabic ? 'الفئة' : 'Catégorie'}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {isArabic ? cat.ar : cat.fr}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            <AdjustmentsHorizontalIcon className="w-3 h-3 inline mr-1" />
            {isArabic ? 'المستوى' : 'Niveau'}
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LEVELS.map(level => (
              <option key={level.id} value={level.id}>
                {isArabic ? level.ar : level.fr}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isArabic ? 'ترتيب' : 'Trier'}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map(option => (
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
