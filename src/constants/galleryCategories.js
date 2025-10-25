/**
 * Gallery Categories Configuration
 * Shared between Admin Panel and Gallery Page for consistency
 */

export const GALLERY_CATEGORIES = [
  {
    value: 'all',
    label: { fr: 'Toutes', ar: 'الكل' },
    color: 'gray'
  },
  {
    value: 'campus',
    label: { fr: 'Campus', ar: 'الحرم الجامعي' },
    color: 'blue'
  },
  {
    value: 'events',
    label: { fr: 'Événements', ar: 'أحداث' },
    color: 'orange'
  },
  {
    value: 'sports',
    label: { fr: 'Sports', ar: 'رياضة' },
    color: 'green'
  },
  {
    value: 'activities',
    label: { fr: 'Activités', ar: 'أنشطة' },
    color: 'purple'
  },
  {
    value: 'ceremonies',
    label: { fr: 'Cérémonies', ar: 'حفلات' },
    color: 'pink'
  },
  {
    value: 'facilities',
    label: { fr: 'Installations', ar: 'المرافق' },
    color: 'teal'
  },
  {
    value: 'academic',
    label: { fr: 'Académique', ar: 'أكاديمي' },
    color: 'indigo'
  }
];

/**
 * Get category badge color classes
 */
export const getCategoryColor = (category) => {
  const colors = {
    campus: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    events: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    sports: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    activities: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ceremonies: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    facilities: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    academic: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

/**
 * Get category label by language
 */
export const getCategoryLabel = (category, isArabic = false) => {
  const cat = GALLERY_CATEGORIES.find(c => c.value === category);
  if (!cat) return category;
  return isArabic ? cat.label.ar : cat.label.fr;
};
