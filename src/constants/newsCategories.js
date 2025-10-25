/**
 * News Categories Configuration
 * Shared between Admin Panel and News Page for consistency
 */

export const NEWS_CATEGORIES = [
  {
    value: 'all',
    label: { fr: 'Toutes', ar: 'الكل' },
    color: 'gray'
  },
  {
    value: 'Actualités',
    label: { fr: 'Actualités', ar: 'أخبار' },
    color: 'blue'
  },
  {
    value: 'Événements',
    label: { fr: 'Événements', ar: 'أحداث' },
    color: 'orange'
  },
  {
    value: 'Culture',
    label: { fr: 'Culture', ar: 'ثقافة' },
    color: 'purple'
  },
  {
    value: 'International',
    label: { fr: 'International', ar: 'دولي' },
    color: 'indigo'
  },
  {
    value: 'Infrastructure',
    label: { fr: 'Infrastructure', ar: 'بنية تحتية' },
    color: 'green'
  },
  {
    value: 'Partenariats',
    label: { fr: 'Partenariats', ar: 'شراكات' },
    color: 'teal'
  },
  {
    value: 'Compétitions',
    label: { fr: 'Compétitions', ar: 'مسابقات' },
    color: 'yellow'
  },
  {
    value: 'Numérique',
    label: { fr: 'Numérique', ar: 'رقمي' },
    color: 'cyan'
  }
];

/**
 * Get category badge color classes
 */
export const getCategoryColor = (category) => {
  const colors = {
    Actualités: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Événements: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Culture: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    International: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    Infrastructure: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Partenariats: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    Compétitions: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Numérique: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

/**
 * Get category label by language
 */
export const getCategoryLabel = (category, isArabic = false) => {
  const cat = NEWS_CATEGORIES.find(c => c.value === category);
  if (!cat) return category;
  return isArabic ? cat.label.ar : cat.label.fr;
};
