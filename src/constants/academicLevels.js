/**
 * Academic Level Definitions for Moroccan High School (Lycée)
 * Defines grade levels for High School only
 */

export const ACADEMIC_LEVELS = [
  // Tronc Commun (Common Trunk)
  { id: 'tc-sc', fr: 'Tronc Commun Sciences', ar: 'الجذع المشترك العلمي', category: 'tc' },
  { id: 'tc-let', fr: 'Tronc Commun Lettres', ar: 'الجذع المشترك الأدبي', category: 'tc' },
  { id: 'tc-tech', fr: 'Tronc Commun Technologique', ar: 'الجذع المشترك التكنولوجي', category: 'tc' },
  
  // 1ère Bac (First Year Baccalaureate)
  { id: '1bac-sm', fr: '1ère Bac Sciences Maths', ar: 'الأولى باك علوم رياضية', category: '1bac' },
  { id: '1bac-se', fr: '1ère Bac Sciences Expérimentales', ar: 'الأولى باك علوم تجريبية', category: '1bac' },
  { id: '1bac-eco', fr: '1ère Bac Sciences Économiques', ar: 'الأولى باك علوم اقتصادية', category: '1bac' },
  { id: '1bac-let', fr: '1ère Bac Lettres', ar: 'الأولى باك آداب', category: '1bac' },
  { id: '1bac-tech', fr: '1ère Bac Sciences et Technologies', ar: 'الأولى باك علوم وتكنولوجيا', category: '1bac' },
  
  // 2ème Bac (Second Year Baccalaureate / Terminal)
  { id: '2bac-sm-a', fr: '2ème Bac Sciences Maths A', ar: 'الثانية باك علوم رياضية أ', category: '2bac' },
  { id: '2bac-sm-b', fr: '2ème Bac Sciences Maths B', ar: 'الثانية باك علوم رياضية ب', category: '2bac' },
  { id: '2bac-pc', fr: '2ème Bac Sciences Physiques', ar: 'الثانية باك علوم فيزيائية', category: '2bac' },
  { id: '2bac-svt', fr: '2ème Bac Sciences de la Vie et de la Terre', ar: 'الثانية باك علوم الحياة والأرض', category: '2bac' },
  { id: '2bac-sac', fr: '2ème Bac Sciences Agronomiques', ar: 'الثانية باك علوم زراعية', category: '2bac' },
  { id: '2bac-eco', fr: '2ème Bac Sciences Économiques', ar: 'الثانية باك علوم اقتصادية', category: '2bac' },
  { id: '2bac-let', fr: '2ème Bac Lettres', ar: 'الثانية باك آداب', category: '2bac' },
  { id: '2bac-sh', fr: '2ème Bac Sciences Humaines', ar: 'الثانية باك علوم إنسانية', category: '2bac' },
  { id: '2bac-tech', fr: '2ème Bac Sciences et Technologies', ar: 'الثانية باك علوم وتكنولوجيا', category: '2bac' }
];

/**
 * Get levels grouped by category
 */
export const LEVELS_BY_CATEGORY = {
  tc: ACADEMIC_LEVELS.filter(level => level.category === 'tc'),
  '1bac': ACADEMIC_LEVELS.filter(level => level.category === '1bac'),
  '2bac': ACADEMIC_LEVELS.filter(level => level.category === '2bac')
};

/**
 * Category labels
 */
export const CATEGORY_LABELS = {
  tc: { fr: 'Tronc Commun', ar: 'الجذع المشترك' },
  '1bac': { fr: '1ère Année Bac', ar: 'الأولى باكالوريا' },
  '2bac': { fr: '2ème Année Bac', ar: 'الثانية باكالوريا' }
};

/**
 * Get level by ID
 */
export const getLevelById = (levelId) => {
  return ACADEMIC_LEVELS.find(level => level.id === levelId);
};

/**
 * Get level label
 */
export const getLevelLabel = (levelId, isArabic = false) => {
  const level = getLevelById(levelId);
  return level ? (isArabic ? level.ar : level.fr) : '';
};
