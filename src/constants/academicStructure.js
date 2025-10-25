/**
 * Academic Structure Constants for Moroccan Education System
 * Defines levels, subjects, and their relationships
 */

// Moroccan Academic Levels (Collège + Lycée)
export const ACADEMIC_LEVELS = [
  // Collège (Middle School)
  { 
    id: '1AC', 
    labelFr: '1ère Année Collège', 
    labelAr: 'الأولى إعدادي',
    category: 'college',
    order: 1
  },
  { 
    id: '2AC', 
    labelFr: '2ème Année Collège', 
    labelAr: 'الثانية إعدادي',
    category: 'college',
    order: 2
  },
  { 
    id: '3AC', 
    labelFr: '3ème Année Collège', 
    labelAr: 'الثالثة إعدادي',
    category: 'college',
    order: 3
  },
  
  // Lycée - Tronc Commun (Common Core)
  { 
    id: 'TCS', 
    labelFr: 'Tronc Commun Scientifique', 
    labelAr: 'الجذع المشترك علمي',
    category: 'lycee',
    order: 4
  },
  { 
    id: 'TCL', 
    labelFr: 'Tronc Commun Littéraire', 
    labelAr: 'الجذع المشترك أدبي',
    category: 'lycee',
    order: 5
  },
  { 
    id: 'TCT', 
    labelFr: 'Tronc Commun Technologique', 
    labelAr: 'الجذع المشترك تكنولوجي',
    category: 'lycee',
    order: 6
  },
  
  // 1ère Baccalauréat (First Year)
  { 
    id: '1BAC_SM', 
    labelFr: '1ère Bac Sciences Mathématiques', 
    labelAr: 'الأولى باك علوم رياضية',
    category: 'bac1',
    order: 7
  },
  { 
    id: '1BAC_PC', 
    labelFr: '1ère Bac Sciences Physiques', 
    labelAr: 'الأولى باك علوم فيزيائية',
    category: 'bac1',
    order: 8
  },
  { 
    id: '1BAC_SVT', 
    labelFr: '1ère Bac Sciences de la Vie et de la Terre', 
    labelAr: 'الأولى باك علوم الحياة والأرض',
    category: 'bac1',
    order: 9
  },
  { 
    id: '1BAC_L', 
    labelFr: '1ère Bac Lettres', 
    labelAr: 'الأولى باك آداب',
    category: 'bac1',
    order: 10
  },
  { 
    id: '1BAC_ECO', 
    labelFr: '1ère Bac Sciences Économiques', 
    labelAr: 'الأولى باك علوم اقتصادية',
    category: 'bac1',
    order: 11
  },
  
  // 2ème Baccalauréat (Second Year)
  { 
    id: '2BAC_SM', 
    labelFr: '2ème Bac Sciences Mathématiques', 
    labelAr: 'الثانية باك علوم رياضية',
    category: 'bac2',
    order: 12
  },
  { 
    id: '2BAC_PC', 
    labelFr: '2ème Bac Sciences Physiques', 
    labelAr: 'الثانية باك علوم فيزيائية',
    category: 'bac2',
    order: 13
  },
  { 
    id: '2BAC_SVT', 
    labelFr: '2ème Bac Sciences de la Vie et de la Terre', 
    labelAr: 'الثانية باك علوم الحياة والأرض',
    category: 'bac2',
    order: 14
  },
  { 
    id: '2BAC_L', 
    labelFr: '2ème Bac Lettres', 
    labelAr: 'الثانية باك آداب',
    category: 'bac2',
    order: 15
  },
  { 
    id: '2BAC_ECO', 
    labelFr: '2ème Bac Sciences Économiques', 
    labelAr: 'الثانية باك علوم اقتصادية',
    category: 'bac2',
    order: 16
  },
];

// Subjects taught in Moroccan schools
export const SUBJECTS = [
  { 
    id: 'mathematics', 
    labelFr: 'Mathématiques', 
    labelAr: 'الرياضيات',
    icon: '📐',
    color: 'blue'
  },
  { 
    id: 'physics', 
    labelFr: 'Physique-Chimie', 
    labelAr: 'الفيزياء والكيمياء',
    icon: '⚗️',
    color: 'purple'
  },
  { 
    id: 'svt', 
    labelFr: 'Sciences de la Vie et de la Terre', 
    labelAr: 'علوم الحياة والأرض',
    icon: '🌿',
    color: 'green'
  },
  { 
    id: 'arabic', 
    labelFr: 'Langue Arabe', 
    labelAr: 'اللغة العربية',
    icon: '📖',
    color: 'orange'
  },
  { 
    id: 'french', 
    labelFr: 'Langue Française', 
    labelAr: 'اللغة الفرنسية',
    icon: '🇫🇷',
    color: 'indigo'
  },
  { 
    id: 'english', 
    labelFr: 'Langue Anglaise', 
    labelAr: 'اللغة الإنجليزية',
    icon: '🇬🇧',
    color: 'red'
  },
  { 
    id: 'history', 
    labelFr: 'Histoire-Géographie', 
    labelAr: 'التاريخ والجغرافيا',
    icon: '🌍',
    color: 'yellow'
  },
  { 
    id: 'philosophy', 
    labelFr: 'Philosophie', 
    labelAr: 'الفلسفة',
    icon: '🤔',
    color: 'gray'
  },
  { 
    id: 'islamic', 
    labelFr: 'Éducation Islamique', 
    labelAr: 'التربية الإسلامية',
    icon: '☪️',
    color: 'teal'
  },
  { 
    id: 'computer', 
    labelFr: 'Informatique', 
    labelAr: 'المعلوميات',
    icon: '💻',
    color: 'cyan'
  },
  { 
    id: 'economics', 
    labelFr: 'Sciences Économiques', 
    labelAr: 'العلوم الاقتصادية',
    icon: '💰',
    color: 'emerald'
  },
];

// Helper function to get level by ID
export const getLevelById = (levelId) => {
  return ACADEMIC_LEVELS.find(level => level.id === levelId);
};

// Helper function to get subject by ID
export const getSubjectById = (subjectId) => {
  return SUBJECTS.find(subject => subject.id === subjectId);
};

// Helper function to get levels by category
export const getLevelsByCategory = (category) => {
  return ACADEMIC_LEVELS.filter(level => level.category === category);
};

// Academic year helper
export const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-indexed
  
  // Academic year starts in September (month 9)
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};
