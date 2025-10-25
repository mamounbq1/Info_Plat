#!/usr/bin/env node

/**
 * Comprehensive Content Seeding Script
 * 
 * This script seeds the database with diverse courses, quizzes, and exercises
 * covering multiple subjects, levels, and question types.
 * 
 * Question Types Included:
 * - Multiple Choice (MCQ)
 * - True/False
 * - Fill in the Blanks
 * - Short Answer
 * - Essay
 * - Matching
 * - Ordering
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get teacher ID from Firestore
async function getTeacherId() {
  try {
    // Get any teacher from Firestore
    const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error('❌ No teacher accounts found in database');
      return null;
    }
    
    const teacherDoc = snapshot.docs[0];
    const teacherData = teacherDoc.data();
    console.log('✅ Using teacher account:');
    console.log('   Email:', teacherData.email);
    console.log('   Name:', teacherData.fullName || 'Not set');
    console.log('   ID:', teacherDoc.id);
    
    return teacherDoc.id;
  } catch (error) {
    console.error('❌ Error getting teacher:', error.message);
    return null;
  }
}

// Helper to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Course data templates
const courseTemplates = [
  // Mathematics Courses
  {
    title: 'Fonctions et Limites',
    titleAr: 'الدوال والنهايات',
    description: 'Étude complète des fonctions numériques, limites et continuité',
    descriptionAr: 'دراسة شاملة للدوال العددية والنهايات والاستمرارية',
    subject: 'MATH',
    targetClasses: ['2BAC-MATH-1', '2BAC-MATH-2', '2BAC-PC-1', '2BAC-PC-2'],
    level: '2BAC',
    difficulty: 'advanced',
    estimatedHours: 40,
    chapters: [
      { title: 'Généralités sur les fonctions', titleAr: 'عموميات حول الدوال', duration: 8 },
      { title: 'Limites et continuité', titleAr: 'النهايات والاستمرارية', duration: 12 },
      { title: 'Dérivabilité', titleAr: 'القابلية للاشتقاق', duration: 10 },
      { title: 'Étude de fonctions', titleAr: 'دراسة الدوال', duration: 10 }
    ]
  },
  {
    title: 'Probabilités et Statistiques',
    titleAr: 'الاحتمالات والإحصاء',
    description: 'Introduction aux probabilités et analyse statistique',
    descriptionAr: 'مقدمة في الاحتمالات والتحليل الإحصائي',
    subject: 'MATH',
    targetClasses: ['1BAC-MATH-1', '1BAC-MATH-2', '1BAC-SCEX-1', '1BAC-SCEX-2'],
    level: '1BAC',
    difficulty: 'intermediate',
    estimatedHours: 25,
    chapters: [
      { title: 'Statistiques descriptives', titleAr: 'الإحصاء الوصفي', duration: 6 },
      { title: 'Probabilités de base', titleAr: 'الاحتمالات الأساسية', duration: 8 },
      { title: 'Variables aléatoires', titleAr: 'المتغيرات العشوائية', duration: 11 }
    ]
  },
  
  // Physics Courses
  {
    title: 'Mécanique et Ondes',
    titleAr: 'الميكانيكا والأمواج',
    description: 'Étude de la mécanique classique et des phénomènes ondulatoires',
    descriptionAr: 'دراسة الميكانيكا الكلاسيكية والظواهر الموجية',
    subject: 'PC',
    targetClasses: ['2BAC-PC-1', '2BAC-PC-2'],
    level: '2BAC',
    difficulty: 'advanced',
    estimatedHours: 45,
    chapters: [
      { title: 'Cinématique', titleAr: 'علم الحركة', duration: 10 },
      { title: 'Dynamique newtonienne', titleAr: 'الديناميكا النيوتونية', duration: 12 },
      { title: 'Ondes mécaniques', titleAr: 'الأمواج الميكانيكية', duration: 11 },
      { title: 'Ondes lumineuses', titleAr: 'الأمواج الضوئية', duration: 12 }
    ]
  },
  
  // Computer Science Courses
  {
    title: 'Algorithmique et Programmation',
    titleAr: 'الخوارزميات والبرمجة',
    description: 'Introduction à l\'algorithmique et à la programmation en Python',
    descriptionAr: 'مقدمة في الخوارزميات والبرمجة بلغة Python',
    subject: 'INFO',
    targetClasses: ['TC-SF-1', 'TC-SF-2', 'TC-SF-3', 'TC-SF-4', 'TC-SF-5', 'TC-SF-6'],
    level: 'TC',
    difficulty: 'beginner',
    estimatedHours: 30,
    chapters: [
      { title: 'Introduction à l\'algorithmique', titleAr: 'مقدمة في الخوارزميات', duration: 8 },
      { title: 'Structures de contrôle', titleAr: 'بنيات التحكم', duration: 8 },
      { title: 'Fonctions et procédures', titleAr: 'الدوال والإجراءات', duration: 7 },
      { title: 'Tableaux et listes', titleAr: 'الجداول والقوائم', duration: 7 }
    ]
  },
  {
    title: 'Structures de Données Avancées',
    titleAr: 'بنيات البيانات المتقدمة',
    description: 'Arbres, graphes, et algorithmes de recherche',
    descriptionAr: 'الأشجار والرسوم البيانية وخوارزميات البحث',
    subject: 'INFO',
    targetClasses: ['2BAC-MATH-1', '2BAC-MATH-2'],
    level: '2BAC',
    difficulty: 'advanced',
    estimatedHours: 35,
    chapters: [
      { title: 'Listes chaînées', titleAr: 'القوائم المتسلسلة', duration: 8 },
      { title: 'Piles et files', titleAr: 'الأكوام والصفوف', duration: 7 },
      { title: 'Arbres binaires', titleAr: 'الأشجار الثنائية', duration: 10 },
      { title: 'Graphes', titleAr: 'الرسوم البيانية', duration: 10 }
    ]
  },
  
  // Biology Courses
  {
    title: 'Génétique et Évolution',
    titleAr: 'الوراثة والتطور',
    description: 'Principes de génétique et théorie de l\'évolution',
    descriptionAr: 'مبادئ الوراثة ونظرية التطور',
    subject: 'SVT',
    targetClasses: ['2BAC-PC-1', '2BAC-PC-2', '1BAC-SCEX-1', '1BAC-SCEX-2'],
    level: '2BAC',
    difficulty: 'intermediate',
    estimatedHours: 38,
    chapters: [
      { title: 'Mendélisme', titleAr: 'الوراثة المندلية', duration: 10 },
      { title: 'ADN et hérédité', titleAr: 'الحمض النووي والوراثة', duration: 12 },
      { title: 'Mutations', titleAr: 'الطفرات', duration: 8 },
      { title: 'Évolution des espèces', titleAr: 'تطور الأنواع', duration: 8 }
    ]
  },
  
  // French Literature
  {
    title: 'Littérature Française Moderne',
    titleAr: 'الأدب الفرنسي الحديث',
    description: 'Analyse des œuvres littéraires françaises du XXe siècle',
    descriptionAr: 'تحليل الأعمال الأدبية الفرنسية في القرن العشرين',
    subject: 'FR',
    targetClasses: ['2BAC-LET-1', '2BAC-LET-2', '1BAC-LET-1', '1BAC-LET-2'],
    level: '2BAC',
    difficulty: 'intermediate',
    estimatedHours: 35,
    chapters: [
      { title: 'Le roman moderne', titleAr: 'الرواية الحديثة', duration: 10 },
      { title: 'Le théâtre contemporain', titleAr: 'المسرح المعاصر', duration: 9 },
      { title: 'La poésie symboliste', titleAr: 'الشعر الرمزي', duration: 8 },
      { title: 'Analyse critique', titleAr: 'التحليل النقدي', duration: 8 }
    ]
  },
  
  // Philosophy
  {
    title: 'Introduction à la Philosophie',
    titleAr: 'مدخل إلى الفلسفة',
    description: 'Les grands courants philosophiques et questions fondamentales',
    descriptionAr: 'التيارات الفلسفية الكبرى والأسئلة الأساسية',
    subject: 'PHILO',
    targetClasses: ['2BAC-LET-1', '2BAC-LET-2', '2BAC-MATH-1', '2BAC-MATH-2', '2BAC-PC-1', '2BAC-PC-2'],
    level: '2BAC',
    difficulty: 'intermediate',
    estimatedHours: 32,
    chapters: [
      { title: 'Qu\'est-ce que la philosophie?', titleAr: 'ما هي الفلسفة؟', duration: 8 },
      { title: 'La conscience et l\'inconscient', titleAr: 'الوعي واللاوعي', duration: 8 },
      { title: 'La liberté', titleAr: 'الحرية', duration: 8 },
      { title: 'L\'État et la justice', titleAr: 'الدولة والعدالة', duration: 8 }
    ]
  },
  
  // History-Geography
  {
    title: 'Histoire du Monde Contemporain',
    titleAr: 'تاريخ العالم المعاصر',
    description: 'Les grands événements du XXe siècle',
    descriptionAr: 'الأحداث الكبرى في القرن العشرين',
    subject: 'HG',
    targetClasses: ['TC-LSHF-1', 'TC-LSHF-2', '1BAC-LET-1', '1BAC-LET-2'],
    level: 'TC',
    difficulty: 'intermediate',
    estimatedHours: 28,
    chapters: [
      { title: 'La Première Guerre mondiale', titleAr: 'الحرب العالمية الأولى', duration: 7 },
      { title: 'L\'entre-deux-guerres', titleAr: 'فترة ما بين الحربين', duration: 7 },
      { title: 'La Seconde Guerre mondiale', titleAr: 'الحرب العالمية الثانية', duration: 7 },
      { title: 'Le monde depuis 1945', titleAr: 'العالم منذ 1945', duration: 7 }
    ]
  },
  
  // English
  {
    title: 'English Grammar and Composition',
    titleAr: 'قواعد اللغة الإنجليزية والتعبير',
    description: 'Advanced English grammar and writing skills',
    descriptionAr: 'قواعد اللغة الإنجليزية المتقدمة ومهارات الكتابة',
    subject: 'EN',
    targetClasses: ['1BAC-MATH-1', '1BAC-MATH-2', '1BAC-SCEX-1', '1BAC-SCEX-2', '1BAC-LET-1', '1BAC-LET-2'],
    level: '1BAC',
    difficulty: 'intermediate',
    estimatedHours: 30,
    chapters: [
      { title: 'Tenses and Aspects', titleAr: 'الأزمنة والجوانب', duration: 8 },
      { title: 'Modal Verbs', titleAr: 'الأفعال الناقصة', duration: 6 },
      { title: 'Conditionals', titleAr: 'الجمل الشرطية', duration: 8 },
      { title: 'Essay Writing', titleAr: 'كتابة المقالات', duration: 8 }
    ]
  }
];

// Quiz templates with diverse question types
const quizTemplates = [
  // Mathematics Quiz - MCQ
  {
    courseName: 'Fonctions et Limites',
    title: 'Quiz sur les Limites',
    titleAr: 'اختبار النهايات',
    description: 'Test de compréhension sur les limites de fonctions',
    descriptionAr: 'اختبار الفهم حول نهايات الدوال',
    duration: 30,
    passingScore: 60,
    questions: [
      {
        type: 'multiple-choice',
        question: 'Quelle est la limite de f(x) = 1/x quand x tend vers +∞?',
        questionAr: 'ما هي نهاية f(x) = 1/x عندما x تتجه نحو +∞؟',
        options: ['0', '1', '+∞', 'La limite n\'existe pas'],
        optionsAr: ['0', '1', '+∞', 'النهاية غير موجودة'],
        correctAnswer: 0,
        points: 2,
        explanation: 'Quand x devient très grand, 1/x devient très petit et tend vers 0',
        explanationAr: 'عندما تصبح x كبيرة جدًا، يصبح 1/x صغيرًا جدًا ويتجه نحو 0'
      },
      {
        type: 'multiple-choice',
        question: 'Une fonction continue sur [a,b] est toujours:',
        questionAr: 'الدالة المستمرة على [a,b] دائمًا:',
        options: ['Dérivable', 'Bornée', 'Monotone', 'Constante'],
        optionsAr: ['قابلة للاشتقاق', 'محدودة', 'رتيبة', 'ثابتة'],
        correctAnswer: 1,
        points: 2,
        explanation: 'Le théorème des bornes dit qu\'une fonction continue sur un intervalle fermé est bornée',
        explanationAr: 'نظرية الحدود تقول أن الدالة المستمرة على فترة مغلقة محدودة'
      },
      {
        type: 'true-false',
        question: 'Si lim f(x) = L et lim g(x) = M, alors lim[f(x)+g(x)] = L+M',
        questionAr: 'إذا كانت lim f(x) = L و lim g(x) = M، فإن lim[f(x)+g(x)] = L+M',
        correctAnswer: true,
        points: 1,
        explanation: 'C\'est une propriété fondamentale des limites',
        explanationAr: 'هذه خاصية أساسية للنهايات'
      },
      {
        type: 'fill-blank',
        question: 'La limite de sin(x)/x quand x tend vers 0 est égale à ____',
        questionAr: 'نهاية sin(x)/x عندما x تتجه نحو 0 تساوي ____',
        correctAnswer: '1',
        points: 2,
        explanation: 'C\'est une limite remarquable très importante en analyse',
        explanationAr: 'هذه نهاية ملحوظة مهمة جدًا في التحليل'
      },
      {
        type: 'multiple-choice',
        question: 'Quelle affirmation est vraie pour les asymptotes?',
        questionAr: 'أي عبارة صحيحة بالنسبة للمقاربات؟',
        options: [
          'Une fonction peut avoir plusieurs asymptotes verticales',
          'Une fonction ne peut avoir qu\'une seule asymptote horizontale',
          'Les asymptotes obliques n\'existent pas',
          'Les asymptotes croisent toujours la courbe'
        ],
        optionsAr: [
          'يمكن أن تكون للدالة عدة مقاربات عمودية',
          'يمكن أن تكون للدالة مقاربة أفقية واحدة فقط',
          'المقاربات المائلة غير موجودة',
          'المقاربات تقطع المنحنى دائمًا'
        ],
        correctAnswer: 0,
        points: 2,
        explanation: 'Une fonction rationnelle peut avoir plusieurs asymptotes verticales aux points où le dénominateur s\'annule',
        explanationAr: 'يمكن أن تحتوي الدالة النسبية على عدة مقاربات عمودية عند النقاط التي ينعدم فيها المقام'
      }
    ]
  },
  
  // Computer Science Quiz - Mixed types
  {
    courseName: 'Algorithmique et Programmation',
    title: 'Quiz Algorithmique de Base',
    titleAr: 'اختبار الخوارزميات الأساسية',
    description: 'Évaluation des concepts fondamentaux en algorithmique',
    descriptionAr: 'تقييم المفاهيم الأساسية في الخوارزميات',
    duration: 25,
    passingScore: 70,
    questions: [
      {
        type: 'multiple-choice',
        question: 'Quelle est la complexité temporelle de la recherche linéaire?',
        questionAr: 'ما هي التعقيد الزمني للبحث الخطي؟',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        optionsAr: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 2,
        points: 2,
        explanation: 'La recherche linéaire parcourt tous les éléments dans le pire cas',
        explanationAr: 'البحث الخطي يمر عبر جميع العناصر في أسوأ الحالات'
      },
      {
        type: 'true-false',
        question: 'Un algorithme récursif est toujours plus rapide qu\'un algorithme itératif',
        questionAr: 'الخوارزمية العودية دائمًا أسرع من الخوارزمية التكرارية',
        correctAnswer: false,
        points: 1,
        explanation: 'Les algorithmes récursifs peuvent être plus lents à cause de l\'overhead des appels de fonction',
        explanationAr: 'يمكن أن تكون الخوارزميات العودية أبطأ بسبب العبء الإضافي لاستدعاءات الوظائف'
      },
      {
        type: 'fill-blank',
        question: 'Une structure de données LIFO (Last In First Out) est appelée ____',
        questionAr: 'بنية البيانات LIFO (الأخير يدخل الأول يخرج) تسمى ____',
        correctAnswer: 'pile',
        acceptableAnswers: ['pile', 'stack'],
        points: 2,
        explanation: 'Une pile (stack) fonctionne selon le principe LIFO',
        explanationAr: 'الكومة (stack) تعمل وفقًا لمبدأ LIFO'
      },
      {
        type: 'multiple-choice',
        question: 'Quel algorithme de tri a la meilleure complexité moyenne?',
        questionAr: 'أي خوارزمية ترتيب لديها أفضل تعقيد متوسط؟',
        options: ['Tri à bulles', 'Tri par sélection', 'Tri rapide (Quick Sort)', 'Tri par insertion'],
        optionsAr: ['الفرز الفقاعي', 'الفرز بالاختيار', 'الفرز السريع', 'الفرز بالإدراج'],
        correctAnswer: 2,
        points: 3,
        explanation: 'Le tri rapide a une complexité moyenne de O(n log n)',
        explanationAr: 'الفرز السريع له تعقيد متوسط O(n log n)'
      }
    ]
  },
  
  // Biology Quiz
  {
    courseName: 'Génétique et Évolution',
    title: 'Quiz sur les Lois de Mendel',
    titleAr: 'اختبار قوانين مندل',
    description: 'Test sur les principes de la génétique mendélienne',
    descriptionAr: 'اختبار حول مبادئ الوراثة المندلية',
    duration: 20,
    passingScore: 65,
    questions: [
      {
        type: 'multiple-choice',
        question: 'Selon la première loi de Mendel, que se passe-t-il en F1?',
        questionAr: 'وفقًا لقانون مندل الأول، ماذا يحدث في F1؟',
        options: [
          'Les deux allèles se mélangent',
          'Un allèle domine l\'autre',
          'Les caractères disparaissent',
          'Une nouvelle mutation apparaît'
        ],
        optionsAr: [
          'يمتزج الأليلان',
          'أحد الأليلات يسود الآخر',
          'تختفي الخصائص',
          'تظهر طفرة جديدة'
        ],
        correctAnswer: 1,
        points: 2,
        explanation: 'La loi de dominance stipule qu\'un allèle dominant masque l\'allèle récessif en F1',
        explanationAr: 'قانون السيادة ينص على أن الأليل السائد يخفي الأليل المتنحي في F1'
      },
      {
        type: 'true-false',
        question: 'Les mutations sont la seule source de variation génétique',
        questionAr: 'الطفرات هي المصدر الوحيد للتنوع الجيني',
        correctAnswer: false,
        points: 1,
        explanation: 'Le brassage génétique lors de la méiose est aussi une source importante de variation',
        explanationAr: 'الخلط الجيني أثناء الانقسام المنصف هو أيضًا مصدر مهم للتنوع'
      },
      {
        type: 'multiple-choice',
        question: 'Quelle est la probabilité d\'obtenir un homozygote récessif en F2?',
        questionAr: 'ما هو احتمال الحصول على متماثل الزيجة متنحي في F2؟',
        options: ['1/4', '1/2', '3/4', '1'],
        optionsAr: ['1/4', '1/2', '3/4', '1'],
        correctAnswer: 0,
        points: 2,
        explanation: 'Le carré de Punnett montre que aa apparaît dans 1 cas sur 4',
        explanationAr: 'مربع بانيت يوضح أن aa يظهر في حالة واحدة من 4'
      }
    ]
  },
  
  // Philosophy Quiz
  {
    courseName: 'Introduction à la Philosophie',
    title: 'Quiz sur la Liberté',
    titleAr: 'اختبار الحرية',
    description: 'Questions philosophiques sur le concept de liberté',
    descriptionAr: 'أسئلة فلسفية حول مفهوم الحرية',
    duration: 25,
    passingScore: 60,
    questions: [
      {
        type: 'multiple-choice',
        question: 'Selon Sartre, l\'homme est:',
        questionAr: 'حسب سارتر، الإنسان:',
        options: [
          'Déterminé par son essence',
          'Condamné à être libre',
          'Limité par la société',
          'Contrôlé par Dieu'
        ],
        optionsAr: [
          'محدد بجوهره',
          'محكوم عليه بأن يكون حرًا',
          'محدود بالمجتمع',
          'مسيطر عليه من قبل الله'
        ],
        correctAnswer: 1,
        points: 2,
        explanation: 'Pour Sartre, l\'existence précède l\'essence et l\'homme est totalement libre',
        explanationAr: 'بالنسبة لسارتر، الوجود يسبق الجوهر والإنسان حر تمامًا'
      },
      {
        type: 'true-false',
        question: 'Le déterminisme nie complètement la liberté humaine',
        questionAr: 'الحتمية تنفي الحرية الإنسانية تمامًا',
        correctAnswer: true,
        points: 1,
        explanation: 'Le déterminisme absolu affirme que tout est causé et rien n\'est libre',
        explanationAr: 'الحتمية المطلقة تؤكد أن كل شيء له سبب ولا شيء حر'
      },
      {
        type: 'multiple-choice',
        question: 'La liberté selon Kant est liée à:',
        questionAr: 'الحرية حسب كانط مرتبطة بـ:',
        options: [
          'Faire ce qu\'on veut',
          'L\'autonomie de la volonté',
          'L\'absence de contraintes',
          'Le bonheur personnel'
        ],
        optionsAr: [
          'فعل ما نريد',
          'استقلالية الإرادة',
          'غياب القيود',
          'السعادة الشخصية'
        ],
        correctAnswer: 1,
        points: 2,
        explanation: 'Pour Kant, être libre c\'est se donner à soi-même sa propre loi morale',
        explanationAr: 'بالنسبة لكانط، أن تكون حرًا يعني أن تمنح نفسك قانونك الأخلاقي الخاص'
      }
    ]
  }
];

// Exercise templates with diverse types
const exerciseTemplates = [
  // Mathematics Exercise - Mixed types
  {
    courseName: 'Fonctions et Limites',
    title: 'Exercices sur les Dérivées',
    titleAr: 'تمارين المشتقات',
    description: 'Pratique du calcul de dérivées',
    descriptionAr: 'ممارسة حساب المشتقات',
    difficulty: 'intermediate',
    estimatedTime: 45,
    totalPoints: 20,
    questions: [
      {
        type: 'short-answer',
        question: 'Calculez la dérivée de f(x) = x³ + 2x² - 5x + 1',
        questionAr: 'احسب مشتقة f(x) = x³ + 2x² - 5x + 1',
        correctAnswer: '3x² + 4x - 5',
        acceptableAnswers: ['3x^2 + 4x - 5', '3x² + 4x - 5', '3*x^2 + 4*x - 5'],
        points: 3,
        explanation: 'On applique la règle de dérivation: (xⁿ)′ = n·xⁿ⁻¹',
        explanationAr: 'نطبق قاعدة الاشتقاق: (xⁿ)′ = n·xⁿ⁻¹'
      },
      {
        type: 'essay',
        question: 'Démontrez que la dérivée d\'un produit de deux fonctions est (uv)′ = u′v + uv′',
        questionAr: 'أثبت أن مشتقة حاصل ضرب دالتين هي (uv)′ = u′v + uv′',
        minWords: 50,
        maxWords: 200,
        points: 5,
        rubric: 'La démonstration doit utiliser la définition de la dérivée et les limites',
        rubricAr: 'يجب أن يستخدم البرهان تعريف المشتقة والنهايات'
      },
      {
        type: 'multiple-choice',
        question: 'Quelle est la dérivée de ln(x)?',
        questionAr: 'ما هي مشتقة ln(x)؟',
        options: ['1/x', 'x', 'ln(x)', 'e^x'],
        optionsAr: ['1/x', 'x', 'ln(x)', 'e^x'],
        correctAnswer: 0,
        points: 2,
        explanation: 'C\'est une formule de dérivation fondamentale',
        explanationAr: 'هذه صيغة اشتقاق أساسية'
      },
      {
        type: 'fill-blank',
        question: 'La dérivée de sin(x) est ____ et la dérivée de cos(x) est ____',
        questionAr: 'مشتقة sin(x) هي ____ ومشتقة cos(x) هي ____',
        blanks: [
          { correctAnswer: 'cos(x)', acceptableAnswers: ['cos(x)', 'cosx', 'cos x'] },
          { correctAnswer: '-sin(x)', acceptableAnswers: ['-sin(x)', '-sinx', '-sin x'] }
        ],
        points: 2,
        explanation: 'Ce sont les dérivées trigonométriques de base',
        explanationAr: 'هذه هي المشتقات المثلثية الأساسية'
      },
      {
        type: 'short-answer',
        question: 'Trouvez les points où f(x) = x³ - 3x + 2 a une tangente horizontale',
        questionAr: 'أوجد النقاط التي تكون فيها f(x) = x³ - 3x + 2 مماسًا أفقيًا',
        correctAnswer: 'x = 1 et x = -1',
        acceptableAnswers: ['x=1 et x=-1', 'x=±1', 'x = 1, x = -1'],
        points: 4,
        explanation: 'Une tangente horizontale signifie f\'(x) = 0, donc 3x² - 3 = 0',
        explanationAr: 'المماس الأفقي يعني f\'(x) = 0، لذلك 3x² - 3 = 0'
      },
      {
        type: 'ordering',
        question: 'Ordonnez ces étapes pour étudier les variations d\'une fonction',
        questionAr: 'رتب هذه الخطوات لدراسة تغيرات دالة',
        items: [
          'Calculer la dérivée',
          'Trouver le domaine de définition',
          'Déterminer le signe de la dérivée',
          'Dresser le tableau de variations'
        ],
        itemsAr: [
          'حساب المشتقة',
          'إيجاد مجموعة التعريف',
          'تحديد إشارة المشتقة',
          'رسم جدول التغيرات'
        ],
        correctOrder: [1, 0, 2, 3],
        points: 4,
        explanation: 'On commence toujours par le domaine, puis on calcule la dérivée, on étudie son signe, et on dresse le tableau',
        explanationAr: 'نبدأ دائمًا بالمجال، ثم نحسب المشتقة، ندرس إشارتها، ونرسم الجدول'
      }
    ]
  },
  
  // Computer Science Exercise
  {
    courseName: 'Algorithmique et Programmation',
    title: 'Exercices de Programmation Python',
    titleAr: 'تمارين البرمجة بلغة Python',
    description: 'Pratique de la programmation avec Python',
    descriptionAr: 'ممارسة البرمجة بلغة Python',
    difficulty: 'beginner',
    estimatedTime: 60,
    totalPoints: 25,
    questions: [
      {
        type: 'short-answer',
        question: 'Écrivez une fonction Python qui retourne le maximum de deux nombres',
        questionAr: 'اكتب دالة Python تُرجع الحد الأقصى لرقمين',
        correctAnswer: 'def max(a, b): return a if a > b else b',
        acceptableAnswers: [
          'def max(a, b): return a if a > b else b',
          'def max(a,b):\\n    if a>b:\\n        return a\\n    else:\\n        return b'
        ],
        points: 3,
        explanation: 'On utilise une structure conditionnelle pour comparer les deux valeurs',
        explanationAr: 'نستخدم بنية شرطية لمقارنة القيمتين'
      },
      {
        type: 'essay',
        question: 'Expliquez la différence entre une liste et un tuple en Python avec des exemples',
        questionAr: 'اشرح الفرق بين القائمة والصف في Python مع أمثلة',
        minWords: 80,
        maxWords: 250,
        points: 5,
        rubric: 'La réponse doit mentionner la mutabilité, la syntaxe, et les cas d\'usage',
        rubricAr: 'يجب أن تذكر الإجابة القابلية للتغيير والصيغة وحالات الاستخدام'
      },
      {
        type: 'multiple-choice',
        question: 'Quelle méthode ajoute un élément à la fin d\'une liste?',
        questionAr: 'أي طريقة تضيف عنصرًا في نهاية القائمة؟',
        options: ['add()', 'append()', 'insert()', 'push()'],
        optionsAr: ['add()', 'append()', 'insert()', 'push()'],
        correctAnswer: 1,
        points: 2,
        explanation: 'La méthode append() ajoute un élément à la fin d\'une liste',
        explanationAr: 'طريقة append() تضيف عنصرًا في نهاية القائمة'
      },
      {
        type: 'matching',
        question: 'Associez chaque structure de données à sa caractéristique',
        questionAr: 'قم بمطابقة كل بنية بيانات بخاصيتها',
        pairs: [
          { left: 'Liste', leftAr: 'قائمة', right: 'Mutable et ordonnée', rightAr: 'قابلة للتغيير ومرتبة' },
          { left: 'Tuple', leftAr: 'صف', right: 'Immutable et ordonnée', rightAr: 'غير قابلة للتغيير ومرتبة' },
          { left: 'Set', leftAr: 'مجموعة', right: 'Mutable et non ordonnée', rightAr: 'قابلة للتغيير وغير مرتبة' },
          { left: 'Dictionary', leftAr: 'قاموس', right: 'Paires clé-valeur', rightAr: 'أزواج مفتاح-قيمة' }
        ],
        points: 4,
        explanation: 'Chaque structure de données Python a ses propres caractéristiques',
        explanationAr: 'كل بنية بيانات في Python لها خصائصها الخاصة'
      },
      {
        type: 'fill-blank',
        question: 'Pour créer une boucle qui parcourt les nombres de 0 à 9, on écrit: for i in ____:',
        questionAr: 'لإنشاء حلقة تمر عبر الأرقام من 0 إلى 9، نكتب: for i in ____:',
        correctAnswer: 'range(10)',
        acceptableAnswers: ['range(10)', 'range(0, 10)', 'range(0,10)'],
        points: 2,
        explanation: 'La fonction range(10) génère les nombres de 0 à 9',
        explanationAr: 'دالة range(10) تولد الأرقام من 0 إلى 9'
      },
      {
        type: 'short-answer',
        question: 'Écrivez une compréhension de liste qui génère les carrés des nombres de 1 à 10',
        questionAr: 'اكتب فهم قائمة يولد مربعات الأرقام من 1 إلى 10',
        correctAnswer: '[x**2 for x in range(1, 11)]',
        acceptableAnswers: ['[x**2 for x in range(1, 11)]', '[x*x for x in range(1,11)]'],
        points: 4,
        explanation: 'La compréhension de liste est une manière concise de créer des listes',
        explanationAr: 'فهم القائمة هو طريقة موجزة لإنشاء القوائم'
      },
      {
        type: 'true-false',
        question: 'En Python, les variables doivent être déclarées avec un type avant utilisation',
        questionAr: 'في Python، يجب الإعلان عن المتغيرات بنوع قبل الاستخدام',
        correctAnswer: false,
        points: 2,
        explanation: 'Python est un langage à typage dynamique',
        explanationAr: 'Python لغة ذات كتابة ديناميكية'
      },
      {
        type: 'essay',
        question: 'Expliquez le concept de récursivité et donnez un exemple d\'algorithme récursif',
        questionAr: 'اشرح مفهوم العودية وأعط مثالاً على خوارزمية عودية',
        minWords: 100,
        maxWords: 300,
        points: 5,
        rubric: 'Doit définir la récursivité, expliquer le cas de base et le cas récursif, avec un exemple comme factorielle ou Fibonacci',
        rubricAr: 'يجب تعريف العودية، شرح الحالة الأساسية والحالة العودية، مع مثال مثل العاملية أو فيبوناتشي'
      }
    ]
  },
  
  // Biology Exercise
  {
    courseName: 'Génétique et Évolution',
    title: 'Exercices de Génétique',
    titleAr: 'تمارين الوراثة',
    description: 'Problèmes de croisements génétiques',
    descriptionAr: 'مسائل التقاطعات الوراثية',
    difficulty: 'intermediate',
    estimatedTime: 50,
    totalPoints: 22,
    questions: [
      {
        type: 'short-answer',
        question: 'Chez les pois, quelle sera la proportion de graines jaunes en F2 si on croise deux hétérozygotes (Jj x Jj)?',
        questionAr: 'في البازلاء، ما نسبة البذور الصفراء في F2 إذا عبرنا متغايري الزيجوت (Jj x Jj)؟',
        correctAnswer: '75%',
        acceptableAnswers: ['75%', '3/4', '0.75'],
        points: 3,
        explanation: 'Le carré de Punnett donne JJ (25%), Jj (50%), jj (25%). Les phénotypes jaunes = JJ + Jj = 75%',
        explanationAr: 'مربع بانيت يعطي JJ (25%)، Jj (50%)، jj (25%). النمط الظاهري الأصفر = JJ + Jj = 75%'
      },
      {
        type: 'essay',
        question: 'Expliquez le principe de ségrégation des allèles selon la première loi de Mendel',
        questionAr: 'اشرح مبدأ فصل الأليلات وفقًا لقانون مندل الأول',
        minWords: 60,
        maxWords: 200,
        points: 5,
        rubric: 'Doit expliquer la séparation des allèles lors de la formation des gamètes',
        rubricAr: 'يجب شرح فصل الأليلات أثناء تكوين الأمشاج'
      },
      {
        type: 'multiple-choice',
        question: 'Un individu de génotype AaBbCc peut produire combien de types de gamètes différents?',
        questionAr: 'فرد بنمط وراثي AaBbCc يمكن أن ينتج كم نوعًا مختلفًا من الأمشاج؟',
        options: ['2', '4', '6', '8'],
        optionsAr: ['2', '4', '6', '8'],
        correctAnswer: 3,
        points: 3,
        explanation: 'Avec 3 gènes hétérozygotes, on a 2³ = 8 types de gamètes possibles',
        explanationAr: 'مع 3 جينات متغايرة الزيجوت، لدينا 2³ = 8 أنواع من الأمشاج الممكنة'
      },
      {
        type: 'matching',
        question: 'Associez chaque terme à sa définition',
        questionAr: 'قم بمطابقة كل مصطلح بتعريفه',
        pairs: [
          { left: 'Allèle', leftAr: 'أليل', right: 'Forme alternative d\'un gène', rightAr: 'شكل بديل للجين' },
          { left: 'Génotype', leftAr: 'النمط الوراثي', right: 'Constitution génétique', rightAr: 'التكوين الجيني' },
          { left: 'Phénotype', leftAr: 'النمط الظاهري', right: 'Caractère observable', rightAr: 'الصفة الملاحظة' },
          { left: 'Homozygote', leftAr: 'متماثل الزيجة', right: 'Deux allèles identiques', rightAr: 'أليلان متماثلان' }
        ],
        points: 4,
        explanation: 'Ce sont les termes de base en génétique',
        explanationAr: 'هذه المصطلحات الأساسية في علم الوراثة'
      },
      {
        type: 'true-false',
        question: 'Les mutations sont toujours néfastes pour l\'organisme',
        questionAr: 'الطفرات دائمًا ضارة للكائن الحي',
        correctAnswer: false,
        points: 2,
        explanation: 'Les mutations peuvent être neutres ou même bénéfiques dans certains contextes',
        explanationAr: 'يمكن أن تكون الطفرات محايدة أو حتى مفيدة في سياقات معينة'
      },
      {
        type: 'short-answer',
        question: 'Si la fréquence de l\'allèle A est 0.7, quelle est la fréquence de l\'allèle a?',
        questionAr: 'إذا كان تكرار الأليل A هو 0.7، ما هو تكرار الأليل a؟',
        correctAnswer: '0.3',
        acceptableAnswers: ['0.3', '30%'],
        points: 2,
        explanation: 'La somme des fréquences alléliques = 1, donc a = 1 - 0.7 = 0.3',
        explanationAr: 'مجموع ترددات الأليلات = 1، لذلك a = 1 - 0.7 = 0.3'
      },
      {
        type: 'ordering',
        question: 'Ordonnez les étapes de la méiose',
        questionAr: 'رتب مراحل الانقسام المنصف',
        items: [
          'Prophase I',
          'Métaphase I',
          'Anaphase I',
          'Télophase I',
          'Prophase II',
          'Métaphase II',
          'Anaphase II',
          'Télophase II'
        ],
        itemsAr: [
          'الطور التمهيدي I',
          'الطور الاستوائي I',
          'الطور الانفصالي I',
          'الطور النهائي I',
          'الطور التمهيدي II',
          'الطور الاستوائي II',
          'الطور الانفصالي II',
          'الطور النهائي II'
        ],
        correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
        points: 3,
        explanation: 'La méiose comprend deux divisions successives avec les mêmes phases',
        explanationAr: 'الانقسام المنصف يتضمن قسمين متتاليين بنفس المراحل'
      }
    ]
  },
  
  // English Exercise
  {
    courseName: 'English Grammar and Composition',
    title: 'Grammar Practice: Conditionals',
    titleAr: 'ممارسة القواعد: الجمل الشرطية',
    description: 'Exercise on conditional sentences',
    descriptionAr: 'تمرين على الجمل الشرطية',
    difficulty: 'intermediate',
    estimatedTime: 40,
    totalPoints: 20,
    questions: [
      {
        type: 'multiple-choice',
        question: 'If I ____ rich, I would travel around the world.',
        questionAr: 'لو كنت غنيًا، سأسافر حول العالم.',
        options: ['am', 'was', 'were', 'will be'],
        optionsAr: ['am', 'was', 'were', 'will be'],
        correctAnswer: 2,
        points: 2,
        explanation: 'This is a second conditional (unreal present). We use "were" for all persons.',
        explanationAr: 'هذه جملة شرطية ثانية (حاضر غير واقعي). نستخدم "were" لجميع الأشخاص.'
      },
      {
        type: 'fill-blank',
        question: 'If you heat water to 100°C, it ____.',
        questionAr: 'إذا قمت بتسخين الماء إلى 100 درجة مئوية، فإنه ____.',
        correctAnswer: 'boils',
        acceptableAnswers: ['boils', 'will boil'],
        points: 2,
        explanation: 'This is a zero conditional (general truth). We use present simple in both clauses.',
        explanationAr: 'هذه جملة شرطية صفرية (حقيقة عامة). نستخدم المضارع البسيط في كلا الجملتين.'
      },
      {
        type: 'short-answer',
        question: 'Complete: If she ____ (study) harder, she would have passed the exam.',
        questionAr: 'أكمل: لو ____ (تدرس) بجد أكبر، لكانت نجحت في الامتحان.',
        correctAnswer: 'had studied',
        acceptableAnswers: ['had studied'],
        points: 3,
        explanation: 'This is a third conditional (unreal past). We use past perfect in the if-clause.',
        explanationAr: 'هذه جملة شرطية ثالثة (ماض غير واقعي). نستخدم الماضي التام في جملة if.'
      },
      {
        type: 'matching',
        question: 'Match each conditional type with its use',
        questionAr: 'قم بمطابقة كل نوع شرطي باستخدامه',
        pairs: [
          { left: 'Zero conditional', leftAr: 'شرطي صفري', right: 'General truths', rightAr: 'حقائق عامة' },
          { left: 'First conditional', leftAr: 'شرطي أول', right: 'Real future possibility', rightAr: 'احتمال مستقبلي حقيقي' },
          { left: 'Second conditional', leftAr: 'شرطي ثاني', right: 'Unreal present', rightAr: 'حاضر غير واقعي' },
          { left: 'Third conditional', leftAr: 'شرطي ثالث', right: 'Unreal past', rightAr: 'ماض غير واقعي' }
        ],
        points: 4,
        explanation: 'Each conditional type has a specific use in English',
        explanationAr: 'كل نوع شرطي له استخدام محدد في اللغة الإنجليزية'
      },
      {
        type: 'essay',
        question: 'Write a short paragraph (100-150 words) about what you would do if you won the lottery. Use second conditional.',
        questionAr: 'اكتب فقرة قصيرة (100-150 كلمة) حول ما ستفعله لو فزت باليانصيب. استخدم الشرطي الثاني.',
        minWords: 100,
        maxWords: 150,
        points: 6,
        rubric: 'Must use second conditional correctly, with proper grammar and coherent ideas',
        rubricAr: 'يجب استخدام الشرطي الثاني بشكل صحيح، مع قواعد صحيحة وأفكار متماسكة'
      },
      {
        type: 'true-false',
        question: 'The sentence "If I will see him, I will tell him" is grammatically correct.',
        questionAr: 'الجملة "If I will see him, I will tell him" صحيحة نحويًا.',
        correctAnswer: false,
        points: 2,
        explanation: 'We don\'t use "will" in the if-clause. Correct: "If I see him, I will tell him"',
        explanationAr: 'لا نستخدم "will" في جملة if. الصحيح: "If I see him, I will tell him"'
      },
      {
        type: 'ordering',
        question: 'Order these words to make a correct third conditional sentence',
        questionAr: 'رتب هذه الكلمات لعمل جملة شرطية ثالثة صحيحة',
        items: ['If', 'I', 'had known', 'about the party', 'I', 'would have come'],
        itemsAr: ['If', 'I', 'had known', 'about the party', 'I', 'would have come'],
        correctOrder: [0, 1, 2, 3, 4, 5],
        points: 3,
        explanation: 'Third conditional: If + past perfect, would have + past participle',
        explanationAr: 'الشرطي الثالث: If + الماضي التام، would have + اسم المفعول'
      }
    ]
  }
];

// Main seeding function
async function seedComprehensiveContent() {
  console.log('\n🌱 Starting Comprehensive Content Seeding...\n');
  
  try {
    // Get teacher ID
    const teacherId = await getTeacherId();
    if (!teacherId) {
      console.error('❌ Cannot proceed without teacher authentication');
      return;
    }
    
    console.log('✅ Authenticated as teacher:', teacherId);
    console.log('\n');
    
    // Get existing subjects for mapping
    const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
    const subjectsMap = {};
    subjectsSnapshot.forEach(doc => {
      const data = doc.data();
      subjectsMap[data.code] = doc.id;
    });
    
    console.log('📚 Found', Object.keys(subjectsMap).length, 'subjects');
    console.log('\n');
    
    // Seed Courses
    console.log('📖 Seeding Courses...');
    console.log('═'.repeat(60));
    
    const createdCourses = {};
    
    for (const courseTemplate of courseTemplates) {
      try {
        const courseData = {
          ...courseTemplate,
          subjectId: subjectsMap[courseTemplate.subject] || null,
          teacherId: teacherId,
          published: true,
          featured: Math.random() > 0.7, // 30% chance of being featured
          enrolledStudents: [],
          rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
          reviewCount: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 500),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'courses'), courseData);
        createdCourses[courseTemplate.title] = docRef.id;
        
        console.log(`  ✅ ${courseTemplate.title}`);
        console.log(`     → ID: ${docRef.id}`);
        console.log(`     → Subject: ${courseTemplate.subject}`);
        console.log(`     → Level: ${courseTemplate.level}`);
        console.log(`     → Classes: ${courseTemplate.targetClasses.length} classes`);
        console.log('');
      } catch (error) {
        console.error(`  ❌ Error creating course ${courseTemplate.title}:`, error.message);
      }
    }
    
    console.log(`\n✅ Created ${Object.keys(createdCourses).length} courses\n`);
    
    // Seed Quizzes
    console.log('📝 Seeding Quizzes...');
    console.log('═'.repeat(60));
    
    let quizCount = 0;
    
    for (const quizTemplate of quizTemplates) {
      try {
        const courseId = createdCourses[quizTemplate.courseName];
        if (!courseId) {
          console.log(`  ⚠️  Skipping quiz "${quizTemplate.title}" - course not found`);
          continue;
        }
        
        // Find the course to get its details
        const courseDoc = courseTemplates.find(c => c.title === quizTemplate.courseName);
        
        const quizData = {
          ...quizTemplate,
          courseId: courseId,
          teacherId: teacherId,
          subject: courseDoc.subject,
          subjectId: subjectsMap[courseDoc.subject] || null,
          targetClasses: courseDoc.targetClasses,
          level: courseDoc.level,
          published: true,
          attempts: Math.floor(Math.random() * 100),
          averageScore: (Math.random() * 40 + 50).toFixed(1), // Random score between 50 and 90
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        delete quizData.courseName;
        
        const docRef = await addDoc(collection(db, 'quizzes'), quizData);
        quizCount++;
        
        console.log(`  ✅ ${quizTemplate.title}`);
        console.log(`     → ID: ${docRef.id}`);
        console.log(`     → Course: ${quizTemplate.courseName}`);
        console.log(`     → Questions: ${quizTemplate.questions.length}`);
        console.log(`     → Duration: ${quizTemplate.duration} min`);
        console.log('');
      } catch (error) {
        console.error(`  ❌ Error creating quiz ${quizTemplate.title}:`, error.message);
      }
    }
    
    console.log(`\n✅ Created ${quizCount} quizzes\n`);
    
    // Seed Exercises
    console.log('📄 Seeding Exercises...');
    console.log('═'.repeat(60));
    
    let exerciseCount = 0;
    
    for (const exerciseTemplate of exerciseTemplates) {
      try {
        const courseId = createdCourses[exerciseTemplate.courseName];
        if (!courseId) {
          console.log(`  ⚠️  Skipping exercise "${exerciseTemplate.title}" - course not found`);
          continue;
        }
        
        // Find the course to get its details
        const courseDoc = courseTemplates.find(c => c.title === exerciseTemplate.courseName);
        
        const exerciseData = {
          ...exerciseTemplate,
          courseId: courseId,
          teacherId: teacherId,
          subject: courseDoc.subject,
          subjectId: subjectsMap[courseDoc.subject] || null,
          targetClasses: courseDoc.targetClasses,
          level: courseDoc.level,
          published: true,
          submissions: Math.floor(Math.random() * 80),
          averageScore: (Math.random() * 35 + 55).toFixed(1), // Random score between 55 and 90
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        delete exerciseData.courseName;
        
        const docRef = await addDoc(collection(db, 'exercises'), exerciseData);
        exerciseCount++;
        
        console.log(`  ✅ ${exerciseTemplate.title}`);
        console.log(`     → ID: ${docRef.id}`);
        console.log(`     → Course: ${exerciseTemplate.courseName}`);
        console.log(`     → Questions: ${exerciseTemplate.questions.length}`);
        console.log(`     → Difficulty: ${exerciseTemplate.difficulty}`);
        console.log('');
      } catch (error) {
        console.error(`  ❌ Error creating exercise ${exerciseTemplate.title}:`, error.message);
      }
    }
    
    console.log(`\n✅ Created ${exerciseCount} exercises\n`);
    
    // Summary
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                   SEEDING COMPLETED                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   ✅ Courses created: ${Object.keys(createdCourses).length}`);
    console.log(`   ✅ Quizzes created: ${quizCount}`);
    console.log(`   ✅ Exercises created: ${exerciseCount}`);
    console.log('');
    console.log('📝 Question Types Included:');
    console.log('   • Multiple Choice (MCQ)');
    console.log('   • True/False');
    console.log('   • Fill in the Blanks');
    console.log('   • Short Answer');
    console.log('   • Essay');
    console.log('   • Matching');
    console.log('   • Ordering');
    console.log('');
    console.log('🎓 Subjects Covered:');
    console.log('   • Mathematics');
    console.log('   • Physics-Chemistry');
    console.log('   • Computer Science');
    console.log('   • Biology (SVT)');
    console.log('   • French Literature');
    console.log('   • Philosophy');
    console.log('   • History-Geography');
    console.log('   • English');
    console.log('');
    console.log('✨ All content is properly linked to courses and targeted to appropriate classes!');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Seeding Error:', error);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Run the seeding
seedComprehensiveContent();
