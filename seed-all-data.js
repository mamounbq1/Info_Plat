// Comprehensive Database Seeding Script - ALL DATA TYPES
// Includes: Courses, Quizzes, Exercises, Users, Academic Hierarchy
// Usage: node seed-all-data.js

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDocs,
  writeBatch 
} from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgu4dd6kZF-h8RLABbYOlYi_XNu7sNvlo",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "846430849952",
  appId: "1:846430849952:web:1af9d3c2654e3e0d0f2e19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility: Clear collection
async function clearCollection(collectionName) {
  console.log(`   🗑️  Clearing ${collectionName}...`);
  const snapshot = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  let count = 0;
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
  }
  console.log(`   ✅ Deleted ${count} documents from ${collectionName}`);
}

// ============================================
// 1. ACADEMIC HIERARCHY
// ============================================

const academicLevels = [
  {
    nameFr: "Tronc Commun",
    nameAr: "الجذع المشترك",
    code: "TC",
    order: 1,
    enabled: true,
    description: "Année de base commune à toutes les filières"
  },
  {
    nameFr: "Première Année Bac",
    nameAr: "السنة الأولى بكالوريا",
    code: "1BAC",
    order: 2,
    enabled: true,
    description: "Première année de spécialisation"
  },
  {
    nameFr: "Deuxième Année Bac",
    nameAr: "السنة الثانية بكالوريا",
    code: "2BAC",
    order: 3,
    enabled: true,
    description: "Année de préparation au baccalauréat"
  }
];

const branches = [
  {
    nameFr: "Sciences Expérimentales",
    nameAr: "العلوم التجريبية",
    code: "SVT",
    levelCode: "TC",
    order: 1,
    enabled: true,
    description: "Biologie, Chimie, Physique"
  },
  {
    nameFr: "Sciences Mathématiques",
    nameAr: "العلوم الرياضية",
    code: "SM",
    levelCode: "TC",
    order: 2,
    enabled: true,
    description: "Mathématiques et sciences appliquées"
  },
  {
    nameFr: "Lettres et Sciences Humaines",
    nameAr: "الآداب والعلوم الإنسانية",
    code: "LH",
    levelCode: "TC",
    order: 3,
    enabled: true,
    description: "Littérature, Histoire, Philosophie"
  },
  {
    nameFr: "Sciences Économiques",
    nameAr: "العلوم الاقتصادية",
    code: "ECO",
    levelCode: "TC",
    order: 4,
    enabled: true,
    description: "Économie et gestion"
  }
];

const subjects = [
  // Mathématiques
  { nameFr: "Mathématiques", nameAr: "الرياضيات", code: "MATH", levelCode: "TC", branchCode: "SVT", coefficient: 3, hoursPerWeek: 5, order: 1, enabled: true },
  { nameFr: "Mathématiques", nameAr: "الرياضيات", code: "MATH", levelCode: "TC", branchCode: "SM", coefficient: 4, hoursPerWeek: 6, order: 1, enabled: true },
  
  // Sciences
  { nameFr: "Physique-Chimie", nameAr: "الفيزياء والكيمياء", code: "PC", levelCode: "TC", branchCode: "SVT", coefficient: 3, hoursPerWeek: 4, order: 2, enabled: true },
  { nameFr: "Sciences de la Vie et de la Terre", nameAr: "علوم الحياة والأرض", code: "SVT", levelCode: "TC", branchCode: "SVT", coefficient: 3, hoursPerWeek: 3, order: 3, enabled: true },
  
  // Langues
  { nameFr: "Français", nameAr: "الفرنسية", code: "FR", levelCode: "TC", branchCode: "SVT", coefficient: 2, hoursPerWeek: 4, order: 4, enabled: true },
  { nameFr: "Arabe", nameAr: "العربية", code: "AR", levelCode: "TC", branchCode: "SVT", coefficient: 2, hoursPerWeek: 3, order: 5, enabled: true },
  { nameFr: "Anglais", nameAr: "الإنجليزية", code: "EN", levelCode: "TC", branchCode: "SVT", coefficient: 2, hoursPerWeek: 2, order: 6, enabled: true },
  
  // Autres
  { nameFr: "Histoire-Géographie", nameAr: "التاريخ والجغرافيا", code: "HG", levelCode: "TC", branchCode: "SVT", coefficient: 2, hoursPerWeek: 2, order: 7, enabled: true },
  { nameFr: "Éducation Islamique", nameAr: "التربية الإسلامية", code: "EI", levelCode: "TC", branchCode: "SVT", coefficient: 1, hoursPerWeek: 1, order: 8, enabled: true },
  { nameFr: "Informatique", nameAr: "المعلوميات", code: "INFO", levelCode: "TC", branchCode: "SVT", coefficient: 1, hoursPerWeek: 2, order: 9, enabled: true },
  { nameFr: "Philosophie", nameAr: "الفلسفة", code: "PHILO", levelCode: "TC", branchCode: "LH", coefficient: 3, hoursPerWeek: 4, order: 10, enabled: true }
];

// ============================================
// 2. COURSES (20+ COMPREHENSIVE COURSES)
// ============================================

const courses = [
  // MATHÉMATIQUES - Tronc Commun
  {
    titleFr: "Les Équations du Second Degré",
    titleAr: "المعادلات من الدرجة الثانية",
    descriptionFr: "Cours complet sur les équations du second degré : résolution, discriminant, somme et produit des racines",
    descriptionAr: "درس كامل حول المعادلات من الدرجة الثانية: الحل، المميز، مجموع وحاصل ضرب الجذور",
    subject: "Mathématiques",
    targetLevels: ["TC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/math-equations.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    difficulty: "Intermédiaire",
    duration: "2 heures",
    published: true,
    createdBy: "Prof. Ahmed Benjelloun",
    views: 245,
    likes: 67,
    tags: ["algèbre", "équations", "polynômes"]
  },
  {
    titleFr: "Les Fonctions Numériques",
    titleAr: "الدوال العددية",
    descriptionFr: "Étude des fonctions : domaine de définition, variations, limites et continuité",
    descriptionAr: "دراسة الدوال: مجال التعريف، التغيرات، النهايات والاستمرارية",
    subject: "Mathématiques",
    targetLevels: ["TC", "1BAC"],
    contentType: "video",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    difficulty: "Avancé",
    duration: "3 heures",
    published: true,
    createdBy: "Prof. Fatima Zahrae",
    views: 312,
    likes: 89,
    tags: ["fonctions", "analyse", "limites"]
  },
  {
    titleFr: "Les Suites Numériques",
    titleAr: "المتتاليات العددية",
    descriptionFr: "Introduction aux suites : arithmétiques, géométriques, récurrentes et limites",
    descriptionAr: "مقدمة في المتتاليات: الحسابية، الهندسية، التراجعية والنهايات",
    subject: "Mathématiques",
    targetLevels: ["1BAC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/suites.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400",
    difficulty: "Intermédiaire",
    duration: "2.5 heures",
    published: true,
    createdBy: "Prof. Karim Alaoui",
    views: 198,
    likes: 54,
    tags: ["suites", "limites", "convergence"]
  },

  // PHYSIQUE-CHIMIE
  {
    titleFr: "Les Mouvements Rectilignes",
    titleAr: "الحركات المستقيمية",
    descriptionFr: "Étude des mouvements : uniforme, uniformément varié, vitesse et accélération",
    descriptionAr: "دراسة الحركات: المنتظمة، المتغيرة بانتظام، السرعة والتسارع",
    subject: "Physique-Chimie",
    targetLevels: ["TC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/mouvements.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400",
    difficulty: "Débutant",
    duration: "1.5 heures",
    published: true,
    createdBy: "Prof. Mohammed Tazi",
    views: 276,
    likes: 71,
    tags: ["mécanique", "cinématique", "vitesse"]
  },
  {
    titleFr: "La Réaction Chimique",
    titleAr: "التفاعل الكيميائي",
    descriptionFr: "Les réactions chimiques : équilibrage, stœchiométrie, types de réactions",
    descriptionAr: "التفاعلات الكيميائية: الموازنة، القياس الكيميائي، أنواع التفاعلات",
    subject: "Physique-Chimie",
    targetLevels: ["TC"],
    contentType: "video",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
    difficulty: "Débutant",
    duration: "2 heures",
    published: true,
    createdBy: "Prof. Leila Benchekroun",
    views: 234,
    likes: 62,
    tags: ["chimie", "réactions", "stœchiométrie"]
  },
  {
    titleFr: "L'Électricité - Les Circuits",
    titleAr: "الكهرباء - الدوائر",
    descriptionFr: "Introduction aux circuits électriques : tension, intensité, résistance, loi d'Ohm",
    descriptionAr: "مقدمة في الدوائر الكهربائية: التوتر، التيار، المقاومة، قانون أوم",
    subject: "Physique-Chimie",
    targetLevels: ["TC", "1BAC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/electricite.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    difficulty: "Intermédiaire",
    duration: "2 heures",
    published: true,
    createdBy: "Prof. Youssef Berrada",
    views: 189,
    likes: 48,
    tags: ["électricité", "circuits", "ohm"]
  },

  // SVT
  {
    titleFr: "La Cellule : Unité du Vivant",
    titleAr: "الخلية: وحدة الحياة",
    descriptionFr: "Structure et fonctionnement de la cellule : membrane, noyau, organites",
    descriptionAr: "بنية ووظيفة الخلية: الغشاء، النواة، العضيات",
    subject: "Sciences de la Vie et de la Terre",
    targetLevels: ["TC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/cellule.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400",
    difficulty: "Débutant",
    duration: "2 heures",
    published: true,
    createdBy: "Prof. Samira Idrissi",
    views: 267,
    likes: 73,
    tags: ["biologie", "cellule", "organites"]
  },
  {
    titleFr: "La Génétique - L'ADN",
    titleAr: "علم الوراثة - الحمض النووي",
    descriptionFr: "Introduction à la génétique : ADN, gènes, chromosomes, hérédité",
    descriptionAr: "مقدمة في علم الوراثة: الحمض النووي، الجينات، الكروموسومات، الوراثة",
    subject: "Sciences de la Vie et de la Terre",
    targetLevels: ["1BAC", "2BAC"],
    contentType: "video",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400",
    difficulty: "Avancé",
    duration: "3 heures",
    published: true,
    createdBy: "Prof. Hassan Kettani",
    views: 298,
    likes: 81,
    tags: ["génétique", "ADN", "hérédité"]
  },

  // FRANÇAIS
  {
    titleFr: "La Boîte à Merveilles - Analyse",
    titleAr: "الصندوق العجيب - تحليل",
    descriptionFr: "Analyse complète de l'œuvre : thèmes, personnages, structure narrative",
    descriptionAr: "تحليل كامل للعمل: المواضيع، الشخصيات، البنية السردية",
    subject: "Français",
    targetLevels: ["TC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/boite-merveilles.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    difficulty: "Intermédiaire",
    duration: "2.5 heures",
    published: true,
    createdBy: "Prof. Nadia Benkirane",
    views: 445,
    likes: 112,
    tags: ["littérature", "analyse", "roman"]
  },
  {
    titleFr: "Grammaire : Les Temps Composés",
    titleAr: "القواعد: الأزمنة المركبة",
    descriptionFr: "Maîtriser les temps composés : passé composé, plus-que-parfait, futur antérieur",
    descriptionAr: "إتقان الأزمنة المركبة: الماضي المركب، الماضي الأسبق، المستقبل الأسبق",
    subject: "Français",
    targetLevels: ["TC", "1BAC"],
    contentType: "video",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
    difficulty: "Intermédiaire",
    duration: "1.5 heures",
    published: true,
    createdBy: "Prof. Sophie Marchand",
    views: 323,
    likes: 87,
    tags: ["grammaire", "conjugaison", "temps"]
  },
  {
    titleFr: "L'Expression Écrite - La Lettre",
    titleAr: "التعبير الكتابي - الرسالة",
    descriptionFr: "Techniques de rédaction : lettre formelle, lettre amicale, mise en page",
    descriptionAr: "تقنيات الكتابة: الرسالة الرسمية، الرسالة الودية، التنسيق",
    subject: "Français",
    targetLevels: ["TC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/expression-ecrite.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
    difficulty: "Débutant",
    duration: "1 heure",
    published: true,
    createdBy: "Prof. Rachid Lamrani",
    views: 267,
    likes: 69,
    tags: ["expression", "rédaction", "lettre"]
  },

  // ANGLAIS
  {
    titleFr: "Present Perfect vs Past Simple",
    titleAr: "المضارع التام مقابل الماضي البسيط",
    descriptionFr: "Différences et utilisations : present perfect, past simple, exemples pratiques",
    descriptionAr: "الفروقات والاستخدامات: المضارع التام، الماضي البسيط، أمثلة تطبيقية",
    subject: "Anglais",
    targetLevels: ["TC", "1BAC"],
    contentType: "video",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400",
    difficulty: "Intermédiaire",
    duration: "1.5 heures",
    published: true,
    createdBy: "Prof. Sarah Johnson",
    views: 289,
    likes: 76,
    tags: ["grammar", "tenses", "english"]
  },
  {
    titleFr: "Vocabulary: Technology & Internet",
    titleAr: "المفردات: التكنولوجيا والإنترنت",
    descriptionFr: "Vocabulaire essentiel : technologie, internet, réseaux sociaux",
    descriptionAr: "المفردات الأساسية: التكنولوجيا، الإنترنت، وسائل التواصل الاجتماعي",
    subject: "Anglais",
    targetLevels: ["TC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/vocabulary-tech.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
    difficulty: "Débutant",
    duration: "1 heure",
    published: true,
    createdBy: "Prof. Michael Brown",
    views: 198,
    likes: 52,
    tags: ["vocabulary", "technology", "internet"]
  },

  // ARABE
  {
    titleFr: "النحو: المبتدأ والخبر",
    titleAr: "النحو: المبتدأ والخبر",
    descriptionFr: "Grammaire arabe : le sujet et le prédicat nominal",
    descriptionAr: "قواعد اللغة العربية: المبتدأ والخبر وأنواعهما",
    subject: "Arabe",
    targetLevels: ["TC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/arabe-grammaire.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400",
    difficulty: "Intermédiaire",
    duration: "2 heures",
    published: true,
    createdBy: "الأستاذ عبد الله المنصوري",
    views: 312,
    likes: 84,
    tags: ["نحو", "قواعد", "عربية"]
  },

  // HISTOIRE-GÉOGRAPHIE
  {
    titleFr: "La Première Guerre Mondiale",
    titleAr: "الحرب العالمية الأولى",
    descriptionFr: "Causes, déroulement et conséquences de la Grande Guerre (1914-1918)",
    descriptionAr: "أسباب ومجريات ونتائج الحرب العظمى (1914-1918)",
    subject: "Histoire-Géographie",
    targetLevels: ["TC", "1BAC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/wwi.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400",
    difficulty: "Intermédiaire",
    duration: "2.5 heures",
    published: true,
    createdBy: "Prof. Omar Chraibi",
    views: 234,
    likes: 61,
    tags: ["histoire", "guerre", "XXe siècle"]
  },
  {
    titleFr: "Géographie: Les Ressources Naturelles",
    titleAr: "الجغرافيا: الموارد الطبيعية",
    descriptionFr: "Étude des ressources : eau, énergie, minerais, gestion durable",
    descriptionAr: "دراسة الموارد: الماء، الطاقة، المعادن، الإدارة المستدامة",
    subject: "Histoire-Géographie",
    targetLevels: ["TC"],
    contentType: "video",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=400",
    difficulty: "Intermédiaire",
    duration: "2 heures",
    published: true,
    createdBy: "Prof. Laila Bennani",
    views: 176,
    likes: 45,
    tags: ["géographie", "ressources", "environnement"]
  },

  // INFORMATIQUE
  {
    titleFr: "Introduction à la Programmation Python",
    titleAr: "مقدمة في البرمجة بلغة بايثون",
    descriptionFr: "Les bases de Python : variables, conditions, boucles, fonctions",
    descriptionAr: "أساسيات بايثون: المتغيرات، الشروط، الحلقات، الدوال",
    subject: "Informatique",
    targetLevels: ["TC", "1BAC"],
    contentType: "video",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
    difficulty: "Débutant",
    duration: "3 heures",
    published: true,
    createdBy: "Prof. Amine Benslimane",
    views: 412,
    likes: 128,
    tags: ["programmation", "python", "code"]
  },
  {
    titleFr: "Les Bases de Données - SQL",
    titleAr: "قواعد البيانات - SQL",
    descriptionFr: "Introduction aux bases de données : requêtes SQL, tables, relations",
    descriptionAr: "مقدمة في قواعد البيانات: استعلامات SQL، الجداول، العلاقات",
    subject: "Informatique",
    targetLevels: ["1BAC", "2BAC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/sql-basics.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
    difficulty: "Intermédiaire",
    duration: "2.5 heures",
    published: true,
    createdBy: "Prof. Khalid Ziani",
    views: 298,
    likes: 79,
    tags: ["base de données", "sql", "programmation"]
  },

  // PHILOSOPHIE
  {
    titleFr: "Introduction à la Philosophie",
    titleAr: "مدخل إلى الفلسفة",
    descriptionFr: "Qu'est-ce que la philosophie ? Histoire, méthodes, grands courants",
    descriptionAr: "ما هي الفلسفة؟ التاريخ، المناهج، التيارات الكبرى",
    subject: "Philosophie",
    targetLevels: ["TC", "1BAC"],
    contentType: "pdf",
    contentUrl: "https://www.example.com/intro-philo.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400",
    difficulty: "Intermédiaire",
    duration: "2 heures",
    published: true,
    createdBy: "Prof. Zineb Filali",
    views: 187,
    likes: 49,
    tags: ["philosophie", "pensée", "réflexion"]
  }
];

// ============================================
// 3. QUIZZES (15+ QUIZZES WITH QUESTIONS)
// ============================================

const quizzes = [
  // MATHÉMATIQUES
  {
    titleFr: "Quiz : Équations du Second Degré",
    titleAr: "اختبار: المعادلات من الدرجة الثانية",
    descriptionFr: "Testez vos connaissances sur les équations du second degré",
    descriptionAr: "اختبر معرفتك بالمعادلات من الدرجة الثانية",
    subject: "Mathématiques",
    targetLevels: ["TC"],
    duration: 30,
    totalPoints: 20,
    passingScore: 12,
    published: true,
    createdBy: "Prof. Ahmed Benjelloun",
    questions: [
      {
        questionFr: "Quelle est la forme générale d'une équation du second degré ?",
        questionAr: "ما هي الصيغة العامة للمعادلة من الدرجة الثانية؟",
        type: "multiple-choice",
        options: [
          { textFr: "ax² + bx + c = 0", textAr: "ax² + bx + c = 0", isCorrect: true },
          { textFr: "ax + b = 0", textAr: "ax + b = 0", isCorrect: false },
          { textFr: "ax³ + bx² + c = 0", textAr: "ax³ + bx² + c = 0", isCorrect: false },
          { textFr: "a/x + b = 0", textAr: "a/x + b = 0", isCorrect: false }
        ],
        points: 2,
        order: 1
      },
      {
        questionFr: "Comment appelle-t-on l'expression b² - 4ac ?",
        questionAr: "ماذا نسمي التعبير b² - 4ac؟",
        type: "multiple-choice",
        options: [
          { textFr: "Le discriminant (Δ)", textAr: "المميز (Δ)", isCorrect: true },
          { textFr: "Le coefficient", textAr: "المعامل", isCorrect: false },
          { textFr: "La racine", textAr: "الجذر", isCorrect: false },
          { textFr: "Le sommet", textAr: "القمة", isCorrect: false }
        ],
        points: 2,
        order: 2
      },
      {
        questionFr: "Si Δ > 0, combien de solutions réelles l'équation a-t-elle ?",
        questionAr: "إذا كان Δ > 0، كم عدد الحلول الحقيقية للمعادلة؟",
        type: "multiple-choice",
        options: [
          { textFr: "Deux solutions distinctes", textAr: "حلان مختلفان", isCorrect: true },
          { textFr: "Une solution double", textAr: "حل مضاعف واحد", isCorrect: false },
          { textFr: "Aucune solution", textAr: "لا يوجد حل", isCorrect: false },
          { textFr: "Trois solutions", textAr: "ثلاثة حلول", isCorrect: false }
        ],
        points: 3,
        order: 3
      },
      {
        questionFr: "Quelle est la somme des racines de l'équation ax² + bx + c = 0 ?",
        questionAr: "ما هو مجموع جذري المعادلة ax² + bx + c = 0؟",
        type: "multiple-choice",
        options: [
          { textFr: "-b/a", textAr: "-b/a", isCorrect: true },
          { textFr: "b/a", textAr: "b/a", isCorrect: false },
          { textFr: "c/a", textAr: "c/a", isCorrect: false },
          { textFr: "-c/a", textAr: "-c/a", isCorrect: false }
        ],
        points: 3,
        order: 4
      }
    ]
  },
  {
    titleFr: "Quiz : Fonctions Numériques",
    titleAr: "اختبار: الدوال العددية",
    descriptionFr: "Évaluation sur les fonctions, domaines et variations",
    descriptionAr: "تقييم حول الدوال والمجالات والتغيرات",
    subject: "Mathématiques",
    targetLevels: ["TC", "1BAC"],
    duration: 40,
    totalPoints: 25,
    passingScore: 15,
    published: true,
    createdBy: "Prof. Fatima Zahrae",
    questions: [
      {
        questionFr: "Quel est le domaine de définition de f(x) = 1/x ?",
        questionAr: "ما هو مجال تعريف الدالة f(x) = 1/x؟",
        type: "multiple-choice",
        options: [
          { textFr: "ℝ \\ {0}", textAr: "ℝ \\ {0}", isCorrect: true },
          { textFr: "ℝ", textAr: "ℝ", isCorrect: false },
          { textFr: "[0, +∞[", textAr: "[0, +∞[", isCorrect: false },
          { textFr: "]-∞, 0[", textAr: "]-∞, 0[", isCorrect: false }
        ],
        points: 3,
        order: 1
      },
      {
        questionFr: "Une fonction croissante sur un intervalle a une dérivée :",
        questionAr: "الدالة المتزايدة على مجال لها مشتقة:",
        type: "multiple-choice",
        options: [
          { textFr: "Positive ou nulle", textAr: "موجبة أو منعدمة", isCorrect: true },
          { textFr: "Négative", textAr: "سالبة", isCorrect: false },
          { textFr: "Nulle", textAr: "منعدمة", isCorrect: false },
          { textFr: "Constante", textAr: "ثابتة", isCorrect: false }
        ],
        points: 3,
        order: 2
      }
    ]
  },

  // PHYSIQUE-CHIMIE
  {
    titleFr: "Quiz : Mouvements et Forces",
    titleAr: "اختبار: الحركات والقوى",
    descriptionFr: "Test sur la cinématique et la dynamique",
    descriptionAr: "اختبار حول علم الحركة والديناميكا",
    subject: "Physique-Chimie",
    targetLevels: ["TC"],
    duration: 25,
    totalPoints: 15,
    passingScore: 9,
    published: true,
    createdBy: "Prof. Mohammed Tazi",
    questions: [
      {
        questionFr: "Quelle est l'unité SI de la vitesse ?",
        questionAr: "ما هي وحدة السرعة في النظام الدولي؟",
        type: "multiple-choice",
        options: [
          { textFr: "m/s (mètre par seconde)", textAr: "م/ث (متر في الثانية)", isCorrect: true },
          { textFr: "km/h", textAr: "كم/س", isCorrect: false },
          { textFr: "m/s²", textAr: "م/ث²", isCorrect: false },
          { textFr: "N (Newton)", textAr: "ن (نيوتن)", isCorrect: false }
        ],
        points: 2,
        order: 1
      },
      {
        questionFr: "Dans un mouvement rectiligne uniforme, la vitesse est :",
        questionAr: "في الحركة المستقيمية المنتظمة، السرعة:",
        type: "multiple-choice",
        options: [
          { textFr: "Constante", textAr: "ثابتة", isCorrect: true },
          { textFr: "Variable", textAr: "متغيرة", isCorrect: false },
          { textFr: "Nulle", textAr: "منعدمة", isCorrect: false },
          { textFr: "Croissante", textAr: "متزايدة", isCorrect: false }
        ],
        points: 2,
        order: 2
      },
      {
        questionFr: "L'accélération dans un MRUV est :",
        questionAr: "التسارع في الحركة المستقيمية المتغيرة بانتظام:",
        type: "multiple-choice",
        options: [
          { textFr: "Constante", textAr: "ثابت", isCorrect: true },
          { textFr: "Variable", textAr: "متغير", isCorrect: false },
          { textFr: "Nulle", textAr: "منعدم", isCorrect: false },
          { textFr: "Négative", textAr: "سالب", isCorrect: false }
        ],
        points: 3,
        order: 3
      }
    ]
  },
  {
    titleFr: "Quiz : Réactions Chimiques",
    titleAr: "اختبار: التفاعلات الكيميائية",
    descriptionFr: "Évaluation sur les réactions et la stœchiométrie",
    descriptionAr: "تقييم حول التفاعلات والقياس الكيميائي",
    subject: "Physique-Chimie",
    targetLevels: ["TC"],
    duration: 30,
    totalPoints: 20,
    passingScore: 12,
    published: true,
    createdBy: "Prof. Leila Benchekroun",
    questions: [
      {
        questionFr: "Dans une équation chimique équilibrée, que conserve-t-on ?",
        questionAr: "في معادلة كيميائية موزونة، ماذا نحافظ عليه؟",
        type: "multiple-choice",
        options: [
          { textFr: "Le nombre d'atomes de chaque élément", textAr: "عدد ذرات كل عنصر", isCorrect: true },
          { textFr: "Le nombre de molécules", textAr: "عدد الجزيئات", isCorrect: false },
          { textFr: "La masse totale seulement", textAr: "الكتلة الإجمالية فقط", isCorrect: false },
          { textFr: "Le volume", textAr: "الحجم", isCorrect: false }
        ],
        points: 3,
        order: 1
      }
    ]
  },

  // SVT
  {
    titleFr: "Quiz : La Cellule",
    titleAr: "اختبار: الخلية",
    descriptionFr: "Test sur la structure et les fonctions cellulaires",
    descriptionAr: "اختبار حول بنية ووظائف الخلية",
    subject: "Sciences de la Vie et de la Terre",
    targetLevels: ["TC"],
    duration: 25,
    totalPoints: 20,
    passingScore: 12,
    published: true,
    createdBy: "Prof. Samira Idrissi",
    questions: [
      {
        questionFr: "Quel organite est appelé 'centrale énergétique' de la cellule ?",
        questionAr: "أي عضية تسمى 'المحطة الطاقية' للخلية؟",
        type: "multiple-choice",
        options: [
          { textFr: "La mitochondrie", textAr: "الميتوكوندريا", isCorrect: true },
          { textFr: "Le noyau", textAr: "النواة", isCorrect: false },
          { textFr: "Le ribosome", textAr: "الريبوزوم", isCorrect: false },
          { textFr: "Le chloroplaste", textAr: "البلاستيدة الخضراء", isCorrect: false }
        ],
        points: 3,
        order: 1
      },
      {
        questionFr: "Où se trouve l'ADN dans une cellule eucaryote ?",
        questionAr: "أين يوجد الحمض النووي في الخلية حقيقية النواة؟",
        type: "multiple-choice",
        options: [
          { textFr: "Dans le noyau", textAr: "في النواة", isCorrect: true },
          { textFr: "Dans le cytoplasme", textAr: "في السيتوبلازم", isCorrect: false },
          { textFr: "Dans la membrane", textAr: "في الغشاء", isCorrect: false },
          { textFr: "Dans les ribosomes", textAr: "في الريبوزومات", isCorrect: false }
        ],
        points: 2,
        order: 2
      }
    ]
  },

  // FRANÇAIS
  {
    titleFr: "Quiz : La Boîte à Merveilles",
    titleAr: "اختبار: الصندوق العجيب",
    descriptionFr: "Questions sur l'œuvre de Ahmed Sefrioui",
    descriptionAr: "أسئلة حول عمل أحمد الصفريوي",
    subject: "Français",
    targetLevels: ["TC"],
    duration: 35,
    totalPoints: 25,
    passingScore: 15,
    published: true,
    createdBy: "Prof. Nadia Benkirane",
    questions: [
      {
        questionFr: "Qui est le narrateur de 'La Boîte à Merveilles' ?",
        questionAr: "من هو الراوي في 'الصندوق العجيب'؟",
        type: "multiple-choice",
        options: [
          { textFr: "Sidi Mohammed (un enfant)", textAr: "سيدي محمد (طفل)", isCorrect: true },
          { textFr: "Le père", textAr: "الأب", isCorrect: false },
          { textFr: "La mère (Lalla Zoubida)", textAr: "الأم (للا زوبيدة)", isCorrect: false },
          { textFr: "L'auteur adulte", textAr: "المؤلف البالغ", isCorrect: false }
        ],
        points: 3,
        order: 1
      },
      {
        questionFr: "Dans quelle ville se déroule l'histoire ?",
        questionAr: "في أي مدينة تدور أحداث القصة؟",
        type: "multiple-choice",
        options: [
          { textFr: "Fès", textAr: "فاس", isCorrect: true },
          { textFr: "Casablanca", textAr: "الدار البيضاء", isCorrect: false },
          { textFr: "Rabat", textAr: "الرباط", isCorrect: false },
          { textFr: "Marrakech", textAr: "مراكش", isCorrect: false }
        ],
        points: 2,
        order: 2
      }
    ]
  },
  {
    titleFr: "Quiz : Grammaire Française",
    titleAr: "اختبار: قواعد اللغة الفرنسية",
    descriptionFr: "Test sur les temps, modes et conjugaison",
    descriptionAr: "اختبار حول الأزمنة والصيغ والتصريف",
    subject: "Français",
    targetLevels: ["TC", "1BAC"],
    duration: 30,
    totalPoints: 20,
    passingScore: 12,
    published: true,
    createdBy: "Prof. Sophie Marchand",
    questions: [
      {
        questionFr: "Quel temps utilise-t-on pour exprimer une action passée et terminée ?",
        questionAr: "أي زمن نستخدم للتعبير عن فعل ماض ومنتهي؟",
        type: "multiple-choice",
        options: [
          { textFr: "Le passé composé", textAr: "الماضي المركب", isCorrect: true },
          { textFr: "L'imparfait", textAr: "الماضي الناقص", isCorrect: false },
          { textFr: "Le présent", textAr: "المضارع", isCorrect: false },
          { textFr: "Le futur simple", textAr: "المستقبل البسيط", isCorrect: false }
        ],
        points: 3,
        order: 1
      }
    ]
  },

  // ANGLAIS
  {
    titleFr: "Quiz : English Tenses",
    titleAr: "اختبار: أزمنة اللغة الإنجليزية",
    descriptionFr: "Test sur les temps verbaux en anglais",
    descriptionAr: "اختبار حول الأزمنة الفعلية في الإنجليزية",
    subject: "Anglais",
    targetLevels: ["TC", "1BAC"],
    duration: 30,
    totalPoints: 20,
    passingScore: 12,
    published: true,
    createdBy: "Prof. Sarah Johnson",
    questions: [
      {
        questionFr: "Which tense do we use for actions happening now?",
        questionAr: "أي زمن نستخدم للأفعال التي تحدث الآن؟",
        type: "multiple-choice",
        options: [
          { textFr: "Present Continuous", textAr: "المضارع المستمر", isCorrect: true },
          { textFr: "Present Simple", textAr: "المضارع البسيط", isCorrect: false },
          { textFr: "Past Simple", textAr: "الماضي البسيط", isCorrect: false },
          { textFr: "Future Simple", textAr: "المستقبل البسيط", isCorrect: false }
        ],
        points: 3,
        order: 1
      },
      {
        questionFr: "Complete: 'I ____ in Morocco since 2010.'",
        questionAr: "أكمل: 'I ____ in Morocco since 2010.'",
        type: "multiple-choice",
        options: [
          { textFr: "have lived", textAr: "have lived", isCorrect: true },
          { textFr: "lived", textAr: "lived", isCorrect: false },
          { textFr: "am living", textAr: "am living", isCorrect: false },
          { textFr: "will live", textAr: "will live", isCorrect: false }
        ],
        points: 3,
        order: 2
      }
    ]
  },

  // HISTOIRE-GÉOGRAPHIE
  {
    titleFr: "Quiz : Première Guerre Mondiale",
    titleAr: "اختبار: الحرب العالمية الأولى",
    descriptionFr: "Test sur la Grande Guerre (1914-1918)",
    descriptionAr: "اختبار حول الحرب العظمى (1914-1918)",
    subject: "Histoire-Géographie",
    targetLevels: ["TC", "1BAC"],
    duration: 30,
    totalPoints: 20,
    passingScore: 12,
    published: true,
    createdBy: "Prof. Omar Chraibi",
    questions: [
      {
        questionFr: "En quelle année a débuté la Première Guerre mondiale ?",
        questionAr: "في أي سنة بدأت الحرب العالمية الأولى؟",
        type: "multiple-choice",
        options: [
          { textFr: "1914", textAr: "1914", isCorrect: true },
          { textFr: "1918", textAr: "1918", isCorrect: false },
          { textFr: "1939", textAr: "1939", isCorrect: false },
          { textFr: "1945", textAr: "1945", isCorrect: false }
        ],
        points: 2,
        order: 1
      },
      {
        questionFr: "Quel événement a déclenché la Première Guerre mondiale ?",
        questionAr: "أي حدث أشعل الحرب العالمية الأولى؟",
        type: "multiple-choice",
        options: [
          { textFr: "L'assassinat de l'archiduc François-Ferdinand", textAr: "اغتيال الأرشيدوق فرانسوا فرديناند", isCorrect: true },
          { textFr: "La révolution russe", textAr: "الثورة الروسية", isCorrect: false },
          { textFr: "La crise de 1929", textAr: "أزمة 1929", isCorrect: false },
          { textFr: "Le traité de Versailles", textAr: "معاهدة فرساي", isCorrect: false }
        ],
        points: 3,
        order: 2
      }
    ]
  },

  // INFORMATIQUE
  {
    titleFr: "Quiz : Programmation Python",
    titleAr: "اختبار: البرمجة بلغة بايثون",
    descriptionFr: "Test sur les bases de Python",
    descriptionAr: "اختبار حول أساسيات بايثون",
    subject: "Informatique",
    targetLevels: ["TC", "1BAC"],
    duration: 35,
    totalPoints: 25,
    passingScore: 15,
    published: true,
    createdBy: "Prof. Amine Benslimane",
    questions: [
      {
        questionFr: "Comment déclare-t-on une variable en Python ?",
        questionAr: "كيف نعلن عن متغير في بايثون؟",
        type: "multiple-choice",
        options: [
          { textFr: "nom = valeur", textAr: "nom = valeur", isCorrect: true },
          { textFr: "var nom = valeur;", textAr: "var nom = valeur;", isCorrect: false },
          { textFr: "int nom;", textAr: "int nom;", isCorrect: false },
          { textFr: "declare nom", textAr: "declare nom", isCorrect: false }
        ],
        points: 2,
        order: 1
      },
      {
        questionFr: "Quelle fonction affiche du texte en Python ?",
        questionAr: "أي دالة تعرض النص في بايثون؟",
        type: "multiple-choice",
        options: [
          { textFr: "print()", textAr: "print()", isCorrect: true },
          { textFr: "echo()", textAr: "echo()", isCorrect: false },
          { textFr: "display()", textAr: "display()", isCorrect: false },
          { textFr: "show()", textAr: "show()", isCorrect: false }
        ],
        points: 2,
        order: 2
      }
    ]
  },

  // PHILOSOPHIE
  {
    titleFr: "Quiz : Introduction à la Philosophie",
    titleAr: "اختبار: مدخل إلى الفلسفة",
    descriptionFr: "Questions sur les concepts philosophiques de base",
    descriptionAr: "أسئلة حول المفاهيم الفلسفية الأساسية",
    subject: "Philosophie",
    targetLevels: ["TC", "1BAC"],
    duration: 30,
    totalPoints: 20,
    passingScore: 12,
    published: true,
    createdBy: "Prof. Zineb Filali",
    questions: [
      {
        questionFr: "Qui est considéré comme le père de la philosophie occidentale ?",
        questionAr: "من يعتبر أبو الفلسفة الغربية؟",
        type: "multiple-choice",
        options: [
          { textFr: "Socrate", textAr: "سقراط", isCorrect: true },
          { textFr: "Platon", textAr: "أفلاطون", isCorrect: false },
          { textFr: "Aristote", textAr: "أرسطو", isCorrect: false },
          { textFr: "Descartes", textAr: "ديكارت", isCorrect: false }
        ],
        points: 3,
        order: 1
      },
      {
        questionFr: "Que signifie 'philosophie' étymologiquement ?",
        questionAr: "ماذا تعني 'الفلسفة' من الناحية الاشتقاقية؟",
        type: "multiple-choice",
        options: [
          { textFr: "Amour de la sagesse", textAr: "محبة الحكمة", isCorrect: true },
          { textFr: "Connaissance totale", textAr: "المعرفة الكاملة", isCorrect: false },
          { textFr: "Pensée profonde", textAr: "التفكير العميق", isCorrect: false },
          { textFr: "Étude de l'univers", textAr: "دراسة الكون", isCorrect: false }
        ],
        points: 2,
        order: 2
      }
    ]
  }
];

// ============================================
// 4. EXERCISES (10+ EXERCISES)
// ============================================

const exercises = [
  // MATHÉMATIQUES
  {
    titleFr: "Exercices : Équations du Second Degré",
    titleAr: "تمارين: المعادلات من الدرجة الثانية",
    descriptionFr: "10 exercices corrigés avec différents niveaux de difficulté",
    descriptionAr: "10 تمارين مصححة بمستويات صعوبة مختلفة",
    subject: "Mathématiques",
    targetLevels: ["TC"],
    difficulty: "Intermédiaire",
    questionCount: 10,
    estimatedTime: 60,
    published: true,
    createdBy: "Prof. Ahmed Benjelloun",
    fileUrl: "https://www.example.com/exercices-equations.pdf"
  },
  {
    titleFr: "Exercices : Fonctions et Dérivées",
    titleAr: "تمارين: الدوال والمشتقات",
    descriptionFr: "Série d'exercices sur les fonctions, limites et dérivées",
    descriptionAr: "سلسلة تمارين حول الدوال والنهايات والمشتقات",
    subject: "Mathématiques",
    targetLevels: ["1BAC"],
    difficulty: "Avancé",
    questionCount: 15,
    estimatedTime: 90,
    published: true,
    createdBy: "Prof. Fatima Zahrae",
    fileUrl: "https://www.example.com/exercices-fonctions.pdf"
  },
  {
    titleFr: "Exercices : Suites Numériques",
    titleAr: "تمارين: المتتاليات العددية",
    descriptionFr: "Problèmes sur les suites arithmétiques et géométriques",
    descriptionAr: "مسائل حول المتتاليات الحسابية والهندسية",
    subject: "Mathématiques",
    targetLevels: ["1BAC"],
    difficulty: "Intermédiaire",
    questionCount: 12,
    estimatedTime: 75,
    published: true,
    createdBy: "Prof. Karim Alaoui",
    fileUrl: "https://www.example.com/exercices-suites.pdf"
  },

  // PHYSIQUE-CHIMIE
  {
    titleFr: "Exercices : Cinématique",
    titleAr: "تمارين: علم الحركة",
    descriptionFr: "Problèmes sur les mouvements rectilignes et circulaires",
    descriptionAr: "مسائل حول الحركات المستقيمية والدائرية",
    subject: "Physique-Chimie",
    targetLevels: ["TC"],
    difficulty: "Débutant",
    questionCount: 8,
    estimatedTime: 45,
    published: true,
    createdBy: "Prof. Mohammed Tazi",
    fileUrl: "https://www.example.com/exercices-cinematique.pdf"
  },
  {
    titleFr: "Exercices : Réactions Chimiques",
    titleAr: "تمارين: التفاعلات الكيميائية",
    descriptionFr: "Équilibrage et calculs stœchiométriques",
    descriptionAr: "الموازنة والحسابات القياسية الكيميائية",
    subject: "Physique-Chimie",
    targetLevels: ["TC"],
    difficulty: "Intermédiaire",
    questionCount: 10,
    estimatedTime: 60,
    published: true,
    createdBy: "Prof. Leila Benchekroun",
    fileUrl: "https://www.example.com/exercices-reactions.pdf"
  },

  // SVT
  {
    titleFr: "Exercices : Biologie Cellulaire",
    titleAr: "تمارين: البيولوجيا الخلوية",
    descriptionFr: "Questions sur la structure et fonction de la cellule",
    descriptionAr: "أسئلة حول بنية ووظيفة الخلية",
    subject: "Sciences de la Vie et de la Terre",
    targetLevels: ["TC"],
    difficulty: "Intermédiaire",
    questionCount: 12,
    estimatedTime: 50,
    published: true,
    createdBy: "Prof. Samira Idrissi",
    fileUrl: "https://www.example.com/exercices-cellule.pdf"
  },
  {
    titleFr: "Exercices : Génétique",
    titleAr: "تمارين: علم الوراثة",
    descriptionFr: "Problèmes de transmission héréditaire et croisements",
    descriptionAr: "مسائل انتقال الصفات الوراثية والتزاوجات",
    subject: "Sciences de la Vie et de la Terre",
    targetLevels: ["1BAC", "2BAC"],
    difficulty: "Avancé",
    questionCount: 15,
    estimatedTime: 90,
    published: true,
    createdBy: "Prof. Hassan Kettani",
    fileUrl: "https://www.example.com/exercices-genetique.pdf"
  },

  // FRANÇAIS
  {
    titleFr: "Exercices : Expression Écrite",
    titleAr: "تمارين: التعبير الكتابي",
    descriptionFr: "Sujets de rédaction avec corrigés types",
    descriptionAr: "مواضيع الإنشاء مع تصحيح نموذجي",
    subject: "Français",
    targetLevels: ["TC"],
    difficulty: "Intermédiaire",
    questionCount: 6,
    estimatedTime: 120,
    published: true,
    createdBy: "Prof. Rachid Lamrani",
    fileUrl: "https://www.example.com/exercices-expression.pdf"
  },

  // ANGLAIS
  {
    titleFr: "Exercises: Grammar Practice",
    titleAr: "تمارين: تدريب القواعد",
    descriptionFr: "Exercices sur les temps et la conjugaison anglaise",
    descriptionAr: "تمارين حول الأزمنة والتصريف الإنجليزي",
    subject: "Anglais",
    targetLevels: ["TC", "1BAC"],
    difficulty: "Intermédiaire",
    questionCount: 20,
    estimatedTime: 60,
    published: true,
    createdBy: "Prof. Sarah Johnson",
    fileUrl: "https://www.example.com/exercises-grammar.pdf"
  },

  // INFORMATIQUE
  {
    titleFr: "Exercices : Python - Débutant",
    titleAr: "تمارين: بايثون - مبتدئ",
    descriptionFr: "Exercices pratiques sur les bases de Python",
    descriptionAr: "تمارين تطبيقية على أساسيات بايثون",
    subject: "Informatique",
    targetLevels: ["TC", "1BAC"],
    difficulty: "Débutant",
    questionCount: 15,
    estimatedTime: 90,
    published: true,
    createdBy: "Prof. Amine Benslimane",
    fileUrl: "https://www.example.com/exercices-python.pdf"
  }
];

// ============================================
// 6. USERS (Students, Teachers, Admins)
// ============================================

const users = [
  // ADMIN USERS
  {
    uid: "admin001",
    email: "admin@eduplatform.ma",
    displayName: "Administrateur Principal",
    displayNameAr: "المدير الرئيسي",
    role: "admin",
    photoURL: "https://i.pravatar.cc/150?img=1",
    phoneNumber: "+212600000001",
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ["manage_users", "manage_content", "manage_settings", "view_analytics"]
  },
  {
    uid: "admin002",
    email: "superadmin@eduplatform.ma",
    displayName: "Super Admin",
    displayNameAr: "المشرف العام",
    role: "admin",
    photoURL: "https://i.pravatar.cc/150?img=2",
    phoneNumber: "+212600000002",
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ["*"]
  },

  // TEACHER USERS
  {
    uid: "teacher001",
    email: "ahmed.benjelloun@eduplatform.ma",
    displayName: "Prof. Ahmed Benjelloun",
    displayNameAr: "أ. أحمد بنجلون",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=11",
    phoneNumber: "+212600001001",
    active: true,
    subjects: ["Mathématiques"],
    levels: ["TC", "1BAC", "2BAC"],
    branches: ["Sciences Expérimentales", "Sciences Mathématiques"],
    bio: "Professeur de mathématiques avec 15 ans d'expérience",
    bioAr: "أستاذ الرياضيات مع 15 عامًا من الخبرة",
    qualifications: ["Doctorat en Mathématiques", "CAPES"],
    coursesCreated: 12,
    totalStudents: 245,
    rating: 4.8,
    createdAt: new Date(Date.now() - 365*24*60*60*1000).toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: "teacher002",
    email: "fatima.zahrae@eduplatform.ma",
    displayName: "Prof. Fatima Zahrae",
    displayNameAr: "أ. فاطمة الزهراء",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=5",
    phoneNumber: "+212600001002",
    active: true,
    subjects: ["Mathématiques", "Physique-Chimie"],
    levels: ["1BAC", "2BAC"],
    branches: ["Sciences Expérimentales"],
    bio: "Passionnée par l'enseignement des sciences",
    bioAr: "شغوفة بتدريس العلوم",
    qualifications: ["Master en Physique", "CAPES"],
    coursesCreated: 8,
    totalStudents: 189,
    rating: 4.9,
    createdAt: new Date(Date.now() - 300*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "teacher003",
    email: "mohammed.tazi@eduplatform.ma",
    displayName: "Prof. Mohammed Tazi",
    displayNameAr: "أ. محمد التازي",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=12",
    phoneNumber: "+212600001003",
    active: true,
    subjects: ["Physique-Chimie"],
    levels: ["TC", "1BAC"],
    branches: ["Sciences Expérimentales", "Sciences Mathématiques"],
    bio: "Expert en physique appliquée et chimie organique",
    bioAr: "خبير في الفيزياء التطبيقية والكيمياء العضوية",
    qualifications: ["Doctorat en Physique", "Ingénieur"],
    coursesCreated: 10,
    totalStudents: 210,
    rating: 4.7,
    createdAt: new Date(Date.now() - 400*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 5*60*60*1000).toISOString()
  },
  {
    uid: "teacher004",
    email: "samira.idrissi@eduplatform.ma",
    displayName: "Prof. Samira Idrissi",
    displayNameAr: "أ. سميرة الإدريسي",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=9",
    phoneNumber: "+212600001004",
    active: true,
    subjects: ["Sciences de la Vie et de la Terre"],
    levels: ["TC", "1BAC", "2BAC"],
    branches: ["Sciences Expérimentales"],
    bio: "Spécialiste en biologie et géologie",
    bioAr: "متخصصة في علوم الحياة والأرض",
    qualifications: ["Doctorat en Biologie", "CAPES"],
    coursesCreated: 15,
    totalStudents: 267,
    rating: 4.9,
    createdAt: new Date(Date.now() - 450*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 1*60*60*1000).toISOString()
  },
  {
    uid: "teacher005",
    email: "karim.alaoui@eduplatform.ma",
    displayName: "Prof. Karim Alaoui",
    displayNameAr: "أ. كريم العلوي",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=13",
    phoneNumber: "+212600001005",
    active: true,
    subjects: ["Français"],
    levels: ["TC", "1BAC", "2BAC"],
    branches: ["Sciences Expérimentales", "Lettres et Sciences Humaines"],
    bio: "Professeur de français et littérature francophone",
    bioAr: "أستاذ اللغة الفرنسية والأدب الفرنكوفوني",
    qualifications: ["Master en Lettres Modernes", "CAPES"],
    coursesCreated: 18,
    totalStudents: 320,
    rating: 4.8,
    createdAt: new Date(Date.now() - 500*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    uid: "teacher006",
    email: "laila.benchekroun@eduplatform.ma",
    displayName: "Prof. Laila Benchekroun",
    displayNameAr: "أ. ليلى بنشقرون",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=10",
    phoneNumber: "+212600001006",
    active: true,
    subjects: ["English", "Français"],
    levels: ["TC", "1BAC"],
    branches: ["Lettres et Sciences Humaines"],
    bio: "Enseignante bilingue anglais-français",
    bioAr: "مدرسة ثنائية اللغة إنجليزي-فرنسي",
    qualifications: ["Master en Linguistique", "TEFL Certified"],
    coursesCreated: 14,
    totalStudents: 285,
    rating: 4.9,
    createdAt: new Date(Date.now() - 350*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 4*60*60*1000).toISOString()
  },
  {
    uid: "teacher007",
    email: "youssef.amrani@eduplatform.ma",
    displayName: "Prof. Youssef Amrani",
    displayNameAr: "أ. يوسف العمراني",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=14",
    phoneNumber: "+212600001007",
    active: true,
    subjects: ["Histoire-Géographie"],
    levels: ["TC", "1BAC", "2BAC"],
    branches: ["Lettres et Sciences Humaines"],
    bio: "Historien et géographe passionné",
    bioAr: "مؤرخ وجغرافي شغوف",
    qualifications: ["Doctorat en Histoire", "CAPES"],
    coursesCreated: 11,
    totalStudents: 198,
    rating: 4.7,
    createdAt: new Date(Date.now() - 380*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 6*60*60*1000).toISOString()
  },
  {
    uid: "teacher008",
    email: "amine.benslimane@eduplatform.ma",
    displayName: "Prof. Amine Benslimane",
    displayNameAr: "أ. أمين بن سليمان",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=15",
    phoneNumber: "+212600001008",
    active: true,
    subjects: ["Informatique"],
    levels: ["TC", "1BAC", "2BAC"],
    branches: ["Sciences Mathématiques", "Sciences Expérimentales"],
    bio: "Expert en programmation et algorithmique",
    bioAr: "خبير في البرمجة والخوارزميات",
    qualifications: ["Ingénieur Informatique", "Master en IA"],
    coursesCreated: 9,
    totalStudents: 156,
    rating: 4.8,
    createdAt: new Date(Date.now() - 250*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 30*60*1000).toISOString()
  },

  // STUDENT USERS
  {
    uid: "student001",
    email: "ayoub.mansouri@student.eduplatform.ma",
    displayName: "Ayoub Mansouri",
    displayNameAr: "أيوب المنصوري",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=31",
    phoneNumber: "+212600002001",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 15,
    completedCourses: 8,
    totalPoints: 1450,
    averageScore: 85.3,
    badges: ["Mathématiques Expert", "Quiz Master", "Early Achiever"],
    createdAt: new Date(Date.now() - 180*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 30*60*1000).toISOString()
  },
  {
    uid: "student002",
    email: "salma.benali@student.eduplatform.ma",
    displayName: "Salma Benali",
    displayNameAr: "سلمى بنعلي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=22",
    phoneNumber: "+212600002002",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 18,
    completedCourses: 12,
    totalPoints: 1680,
    averageScore: 92.1,
    badges: ["SVT Expert", "Top Performer", "Quiz Champion", "Course Completer"],
    createdAt: new Date(Date.now() - 200*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 15*60*1000).toISOString()
  },
  {
    uid: "student003",
    email: "omar.kadiri@student.eduplatform.ma",
    displayName: "Omar Kadiri",
    displayNameAr: "عمر القادري",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=32",
    phoneNumber: "+212600002003",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 12,
    completedCourses: 5,
    totalPoints: 890,
    averageScore: 78.5,
    badges: ["Math Beginner", "Consistent Learner"],
    createdAt: new Date(Date.now() - 120*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "student004",
    email: "imane.hassani@student.eduplatform.ma",
    displayName: "Imane Hassani",
    displayNameAr: "إيمان الحسني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=23",
    phoneNumber: "+212600002004",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 14,
    completedCourses: 9,
    totalPoints: 1210,
    averageScore: 87.4,
    badges: ["Biology Star", "Chemistry Pro", "Quiz Master"],
    createdAt: new Date(Date.now() - 140*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 1*60*60*1000).toISOString()
  },
  {
    uid: "student005",
    email: "yassine.bouazza@student.eduplatform.ma",
    displayName: "Yassine Bouazza",
    displayNameAr: "ياسين بوعزة",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=33",
    phoneNumber: "+212600002005",
    active: true,
    level: "TC",
    branch: "Tronc Commun Scientifique",
    enrolledCourses: 10,
    completedCourses: 4,
    totalPoints: 620,
    averageScore: 72.3,
    badges: ["Beginner", "First Steps"],
    createdAt: new Date(Date.now() - 90*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    uid: "student006",
    email: "nour.elhassan@student.eduplatform.ma",
    displayName: "Nour El Hassan",
    displayNameAr: "نور الحسن",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=24",
    phoneNumber: "+212600002006",
    active: true,
    level: "TC",
    branch: "Tronc Commun Littéraire",
    enrolledCourses: 8,
    completedCourses: 3,
    totalPoints: 450,
    averageScore: 68.5,
    badges: ["Language Learner"],
    createdAt: new Date(Date.now() - 60*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 4*60*60*1000).toISOString()
  },
  {
    uid: "student007",
    email: "hamza.chahid@student.eduplatform.ma",
    displayName: "Hamza Chahid",
    displayNameAr: "حمزة الشاهد",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=34",
    phoneNumber: "+212600002007",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 16,
    completedCourses: 10,
    totalPoints: 1520,
    averageScore: 88.9,
    badges: ["Math Expert", "Physics Star", "Consistent Performer"],
    createdAt: new Date(Date.now() - 190*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 45*60*1000).toISOString()
  },
  {
    uid: "student008",
    email: "mariam.elidrissi@student.eduplatform.ma",
    displayName: "Mariam El Idrissi",
    displayNameAr: "مريم الإدريسي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=25",
    phoneNumber: "+212600002008",
    active: true,
    level: "1BAC",
    branch: "Lettres et Sciences Humaines",
    enrolledCourses: 11,
    completedCourses: 7,
    totalPoints: 980,
    averageScore: 82.7,
    badges: ["Literature Lover", "History Buff"],
    createdAt: new Date(Date.now() - 110*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "student009",
    email: "anas.bennani@student.eduplatform.ma",
    displayName: "Anas Bennani",
    displayNameAr: "أنس البناني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=35",
    phoneNumber: "+212600002009",
    active: true,
    level: "TC",
    branch: "Tronc Commun Scientifique",
    enrolledCourses: 9,
    completedCourses: 5,
    totalPoints: 740,
    averageScore: 75.8,
    badges: ["Science Explorer", "Quiz Participant"],
    createdAt: new Date(Date.now() - 80*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 5*60*60*1000).toISOString()
  },
  {
    uid: "student010",
    email: "sofia.amrani@student.eduplatform.ma",
    displayName: "Sofia Amrani",
    displayNameAr: "صوفيا العمراني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=26",
    phoneNumber: "+212600002010",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 17,
    completedCourses: 11,
    totalPoints: 1590,
    averageScore: 90.5,
    badges: ["Biology Expert", "Top Student", "Quiz Champion", "Early Achiever"],
    createdAt: new Date(Date.now() - 195*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 20*60*1000).toISOString()
  },
  {
    uid: "student011",
    email: "mehdi.ziani@student.eduplatform.ma",
    displayName: "Mehdi Ziani",
    displayNameAr: "مهدي الزياني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=36",
    phoneNumber: "+212600002011",
    active: true,
    level: "1BAC",
    branch: "Sciences Économiques",
    enrolledCourses: 10,
    completedCourses: 6,
    totalPoints: 850,
    averageScore: 79.2,
    badges: ["Economics Beginner", "Math Learner"],
    createdAt: new Date(Date.now() - 100*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 6*60*60*1000).toISOString()
  },
  {
    uid: "student012",
    email: "yasmine.tahiri@student.eduplatform.ma",
    displayName: "Yasmine Tahiri",
    displayNameAr: "ياسمين الطاهري",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=27",
    phoneNumber: "+212600002012",
    active: true,
    level: "TC",
    branch: "Tronc Commun Littéraire",
    enrolledCourses: 7,
    completedCourses: 4,
    totalPoints: 580,
    averageScore: 73.9,
    badges: ["Language Learner", "Consistent Reader"],
    createdAt: new Date(Date.now() - 70*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 8*60*60*1000).toISOString()
  }
];

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function seedAllData() {
  console.log("\n╔═══════════════════════════════════════════════════════════════╗");
  console.log("║     🎓 COMPREHENSIVE DATABASE SEEDING - ALL DATA TYPES       ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");

  try {
    // PHASE 1: Clear all data collections (optional)
    console.log("📦 PHASE 1: CLEARING COLLECTIONS (Optional)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const collectionsToClean = [
      'academicLevels',
      'branches',
      'subjects',
      'courses',
      'quizzes',
      'exercises',
      'users'
    ];

    for (const collectionName of collectionsToClean) {
      await clearCollection(collectionName);
    }

    console.log("\n✅ Collections cleared!\n");

    // PHASE 2: Seed Academic Hierarchy
    console.log("╔═══════════════════════════════════════════════════════════════╗");
    console.log("║          📚 PHASE 2: SEEDING ACADEMIC HIERARCHY               ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");

    console.log("1️⃣  Adding Academic Levels (" + academicLevels.length + " items)...");
    for (const level of academicLevels) {
      await addDoc(collection(db, "academicLevels"), {
        ...level,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("   ✅ " + academicLevels.length + " Academic Levels added\n");

    console.log("2️⃣  Adding Branches (" + branches.length + " items)...");
    for (const branch of branches) {
      await addDoc(collection(db, "branches"), {
        ...branch,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("   ✅ " + branches.length + " Branches added\n");

    console.log("3️⃣  Adding Subjects (" + subjects.length + " items)...");
    for (const subject of subjects) {
      await addDoc(collection(db, "subjects"), {
        ...subject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("   ✅ " + subjects.length + " Subjects added\n");

    // PHASE 3: Seed Courses
    console.log("╔═══════════════════════════════════════════════════════════════╗");
    console.log("║              📖 PHASE 3: SEEDING COURSES                       ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");

    console.log("📝 Adding Courses (" + courses.length + " items)...");
    for (const course of courses) {
      await addDoc(collection(db, "courses"), {
        ...course,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("   ✅ " + courses.length + " Courses added\n");

    // PHASE 4: Seed Quizzes
    console.log("╔═══════════════════════════════════════════════════════════════╗");
    console.log("║              📝 PHASE 4: SEEDING QUIZZES                       ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");

    console.log("🎯 Adding Quizzes (" + quizzes.length + " items)...");
    for (const quiz of quizzes) {
      await addDoc(collection(db, "quizzes"), {
        ...quiz,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("   ✅ " + quizzes.length + " Quizzes added\n");

    // PHASE 5: Seed Exercises
    console.log("╔═══════════════════════════════════════════════════════════════╗");
    console.log("║             💪 PHASE 5: SEEDING EXERCISES                      ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");

    console.log("📋 Adding Exercises (" + exercises.length + " items)...");
    for (const exercise of exercises) {
      await addDoc(collection(db, "exercises"), {
        ...exercise,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("   ✅ " + exercises.length + " Exercises added\n");

    // PHASE 6: Seed Users
    console.log("╔═══════════════════════════════════════════════════════════════╗");
    console.log("║              👥 PHASE 6: SEEDING USERS                         ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");

    console.log("👤 Adding Users (\" + users.length + \" items)...\n");
    
    let adminCount = 0;
    let teacherCount = 0;
    let studentCount = 0;
    
    for (const user of users) {
      await addDoc(collection(db, "users"), {
        ...user,
        updatedAt: new Date().toISOString()
      });
      
      if (user.role === 'admin') adminCount++;
      else if (user.role === 'teacher') teacherCount++;
      else if (user.role === 'student') studentCount++;
    }
    
    console.log("   ✅ " + adminCount + " Admin users added");
    console.log("   ✅ " + teacherCount + " Teacher users added");
    console.log("   ✅ " + studentCount + " Student users added");
    console.log("   📊 Total: " + users.length + " Users added\n");

    // FINAL SUMMARY
    console.log("\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║          🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!          ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");

    const totalDocs = academicLevels.length + branches.length + subjects.length + 
                      courses.length + quizzes.length + exercises.length + users.length;

    console.log("📊 SUMMARY OF SEEDED DATA:\n");
    console.log("🎓 ACADEMIC HIERARCHY:");
    console.log("   • Academic Levels: " + academicLevels.length + " documents");
    console.log("   • Branches: " + branches.length + " documents");
    console.log("   • Subjects: " + subjects.length + " documents");
    console.log("\n📚 EDUCATIONAL CONTENT:");
    console.log("   • Courses: " + courses.length + " documents");
    console.log("   • Quizzes: " + quizzes.length + " documents (with questions)");
    console.log("   • Exercises: " + exercises.length + " documents");
    console.log("\n👥 USERS:");
    console.log("   • Admin Users: " + users.filter(u => u.role === 'admin').length + " documents");
    console.log("   • Teacher Users: " + users.filter(u => u.role === 'teacher').length + " documents");
    console.log("   • Student Users: " + users.filter(u => u.role === 'student').length + " documents");
    console.log("\n   ═══════════════════════════════════════════");
    console.log("   📊 TOTAL DOCUMENTS CREATED: " + totalDocs);
    console.log("   ═══════════════════════════════════════════\n");

    console.log("✨ Your database is now fully populated!");
    console.log("🌐 Visit your application to see all the content!\n");

    process.exit(0);

  } catch (error) {
    console.error("\n❌ ERROR DURING SEEDING:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute
seedAllData();
