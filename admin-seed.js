// Comprehensive Database Seeding Script using Firebase Admin SDK
// This bypasses security rules and can perform any operation
// Usage: node admin-seed.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
// Note: This uses default credentials from the environment
// For local development, you may need to set GOOGLE_APPLICATION_CREDENTIALS
try {
  admin.initializeApp({
    projectId: 'eduinfor-fff3d'
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function clearCollection(collectionName) {
  console.log(`   🗑️  Clearing ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  let count = 0;
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
  }
  console.log(`   ✅ Deleted ${count} documents from ${collectionName}`);
  return count;
}

// ============================================
// DATA DEFINITIONS
// ============================================

const heroData = {
  titleFr: "Bienvenue au Lycée d'Excellence",
  titleAr: "مرحبا بكم في الثانوية المتميزة",
  subtitleFr: "Former les leaders de demain avec excellence académique et valeurs humaines",
  subtitleAr: "تكوين قادة الغد بالتميز الأكاديمي والقيم الإنسانية",
  buttonText1Fr: "Inscription en ligne",
  buttonText1Ar: "التسجيل عبر الإنترنت",
  buttonText2Fr: "Découvrir nos programmes",
  buttonText2Ar: "اكتشف برامجنا",
  backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920",
  enabled: true,
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

const statsData = {
  students: 1250,
  teachers: 85,
  successRate: 98,
  years: 45,
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

const contactInfo = {
  addressFr: "Avenue Hassan II, Oujda 60000, Maroc",
  addressAr: "شارع الحسن الثاني، وجدة 60000، المغرب",
  phone: "+212 536 12 34 56",
  email: "contact@lycee-excellence.ma",
  hoursFr: "Lun-Ven: 8h-18h | Sam: 8h-13h",
  hoursAr: "الإثنين-الجمعة: 8ص-6م | السبت: 8ص-1م",
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

const features = [
  {
    titleFr: "Excellence Académique",
    titleAr: "التميز الأكاديمي",
    descriptionFr: "Programme d'enseignement avancé avec des professeurs hautement qualifiés",
    descriptionAr: "برنامج تعليمي متقدم مع أساتذة مؤهلين تأهيلا عاليا",
    icon: "AcademicCapIcon",
    color: "from-blue-600 to-cyan-600",
    enabled: true,
    order: 1
  },
  {
    titleFr: "Laboratoires Modernes",
    titleAr: "مختبرات حديثة",
    descriptionFr: "Équipements scientifiques de pointe pour l'expérimentation pratique",
    descriptionAr: "معدات علمية متطورة للتجارب العملية",
    icon: "BeakerIcon",
    color: "from-purple-600 to-pink-600",
    enabled: true,
    order: 2
  },
  {
    titleFr: "Activités Parascolaires",
    titleAr: "الأنشطة اللاصفية",
    descriptionFr: "Large gamme de clubs sportifs, artistiques et culturels",
    descriptionAr: "مجموعة واسعة من الأندية الرياضية والفنية والثقافية",
    icon: "TrophyIcon",
    color: "from-green-600 to-teal-600",
    enabled: true,
    order: 3
  },
  {
    titleFr: "Bibliothèque Numérique",
    titleAr: "المكتبة الرقمية",
    descriptionFr: "Plus de 15,000 ressources numériques et physiques disponibles",
    descriptionAr: "أكثر من 15000 مصدر رقمي ومادي متاح",
    icon: "BookOpenIcon",
    color: "from-orange-600 to-red-600",
    enabled: true,
    order: 4
  },
  {
    titleFr: "Orientation Professionnelle",
    titleAr: "التوجيه المهني",
    descriptionFr: "Conseil personnalisé pour les choix d'études supérieures",
    descriptionAr: "إرشاد شخصي لاختيارات الدراسات العليا",
    icon: "BriefcaseIcon",
    color: "from-indigo-600 to-blue-600",
    enabled: true,
    order: 5
  },
  {
    titleFr: "Plateforme E-Learning",
    titleAr: "منصة التعلم الإلكتروني",
    descriptionFr: "Accès 24/7 aux cours en ligne et ressources pédagogiques",
    descriptionAr: "وصول على مدار الساعة للدروس والموارد التعليمية عبر الإنترنت",
    icon: "ComputerDesktopIcon",
    color: "from-cyan-600 to-blue-600",
    enabled: true,
    order: 6
  }
];

const news = [
  {
    titleFr: "Succès remarquable au Baccalauréat 2024",
    titleAr: "نجاح ملحوظ في امتحان البكالوريا 2024",
    excerptFr: "98% de réussite avec 45 mentions très bien",
    excerptAr: "نسبة نجاح 98٪ مع 45 ميزة جيد جدا",
    contentFr: "Notre lycée a brillamment réussi la session 2024 du baccalauréat avec un taux de réussite exceptionnel de 98%. Parmi nos lauréats, 45 élèves ont obtenu la mention très bien, 120 la mention bien, et 85 la mention assez bien.",
    contentAr: "حققت ثانويتنا نجاحا باهرا في دورة 2024 من امتحان البكالوريا بنسبة نجاح استثنائية بلغت 98٪.",
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
    category: "Actualités",
    publishDate: "2024-07-15",
    author: "Direction du Lycée",
    enabled: true
  },
  {
    titleFr: "Nouveau laboratoire de robotique inauguré",
    titleAr: "تدشين مختبر الروبوتات الجديد",
    excerptFr: "Un espace high-tech pour l'innovation et la créativité",
    excerptAr: "مساحة عالية التقنية للابتكار والإبداع",
    contentFr: "Le lycée vient d'inaugurer un laboratoire de robotique ultramoderne équipé de matériel de dernière génération.",
    contentAr: "دشن المعهد مؤخرا مختبر روبوتات حديث مجهز بأحدث المعدات.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    category: "Infrastructure",
    publishDate: "2024-09-10",
    author: "Service Communication",
    enabled: true
  },
  {
    titleFr: "Victoire au championnat régional de mathématiques",
    titleAr: "الفوز في البطولة الإقليمية للرياضيات",
    excerptFr: "Nos élèves remportent la première place",
    excerptAr: "طلابنا يحصلون على المركز الأول",
    contentFr: "L'équipe de mathématiques du lycée a brillamment remporté le championnat régional inter-lycées.",
    contentAr: "فاز فريق الرياضيات بالثانوية بشكل رائع في البطولة الإقليمية بين الثانويات.",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800",
    category: "Compétitions",
    publishDate: "2024-10-05",
    author: "Club de Mathématiques",
    enabled: true
  },
  {
    titleFr: "Journée portes ouvertes - Samedi 15 novembre",
    titleAr: "يوم الأبواب المفتوحة - السبت 15 نوفمبر",
    excerptFr: "Venez découvrir notre établissement et nos programmes",
    excerptAr: "تعالوا واكتشفوا مؤسستنا وبرامجنا",
    contentFr: "Le lycée organise une journée portes ouvertes le samedi 15 novembre de 9h à 17h.",
    contentAr: "تنظم الثانوية يوم أبواب مفتوحة يوم السبت 15 نوفمبر من الساعة 9 صباحا إلى 5 مساء.",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
    category: "Événements",
    publishDate: "2024-10-20",
    author: "Direction",
    enabled: true
  },
  {
    titleFr: "Partenariat avec l'Université Hassan II",
    titleAr: "شراكة مع جامعة الحسن الثاني",
    excerptFr: "Convention signée pour faciliter l'orientation supérieure",
    excerptAr: "توقيع اتفاقية لتسهيل التوجيه الجامعي",
    contentFr: "Une convention de partenariat a été signée avec l'Université Hassan II de Casablanca.",
    contentAr: "تم توقيع اتفاقية شراكة مع جامعة الحسن الثاني بالدار البيضاء.",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
    category: "Partenariats",
    publishDate: "2024-09-25",
    author: "Service Orientation",
    enabled: true
  }
];

const testimonials = [
  {
    nameFr: "Amina El Fassi",
    nameAr: "أمينة الفاسي",
    roleFr: "Promotion 2023 - École Centrale Paris",
    roleAr: "دفعة 2023 - المدرسة المركزية باريس",
    contentFr: "Le lycée m'a donné les meilleures bases académiques.",
    contentAr: "أعطتني الثانوية أفضل الأسس الأكاديمية.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    rating: 5,
    enabled: true,
    order: 1
  },
  {
    nameFr: "Youssef Bennani",
    nameAr: "يوسف بناني",
    roleFr: "Promotion 2022 - Faculté de Médecine",
    roleAr: "دفعة 2022 - كلية الطب",
    contentFr: "L'encadrement exceptionnel m'a permis de me développer.",
    contentAr: "الإشراف الاستثنائي سمح لي بتطوير مهاراتي.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 5,
    enabled: true,
    order: 2
  }
];

const announcements = [
  {
    titleFr: "Inscriptions 2025-2026 ouvertes",
    titleAr: "التسجيلات 2025-2026 مفتوحة",
    dateFr: "Jusqu'au 30 novembre 2024",
    dateAr: "حتى 30 نوفمبر 2024",
    urgent: true,
    enabled: true,
    order: 1
  },
  {
    titleFr: "Examen blanc prévu le 25 octobre",
    titleAr: "امتحان تجريبي مقرر في 25 أكتوبر",
    dateFr: "Pour les classes terminales",
    dateAr: "لطلاب السنة النهائية",
    urgent: true,
    enabled: true,
    order: 2
  }
];

const clubs = [
  {
    nameFr: "Club Théâtre",
    nameAr: "نادي المسرح",
    descriptionFr: "Expression artistique et représentations théâtrales",
    descriptionAr: "التعبير الفني والعروض المسرحية",
    icon: "🎭",
    colorGradient: "from-purple-600 to-pink-600",
    enabled: true,
    order: 1
  },
  {
    nameFr: "Club Sciences",
    nameAr: "نادي العلوم",
    descriptionFr: "Expériences, robotique et projets scientifiques",
    descriptionAr: "التجارب والروبوتات والمشاريع العلمية",
    icon: "🔬",
    colorGradient: "from-indigo-600 to-purple-600",
    enabled: true,
    order: 2
  }
];

const gallery = [
  {
    titleFr: "Campus principal",
    titleAr: "الحرم الرئيسي",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    enabled: true,
    order: 1
  },
  {
    titleFr: "Laboratoire de chimie",
    titleAr: "مختبر الكيمياء",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    enabled: true,
    order: 2
  }
];

const quickLinks = [
  {
    titleFr: "Calendrier Scolaire",
    titleAr: "التقويم المدرسي",
    url: "/calendar",
    icon: "CalendarDaysIcon",
    enabled: true,
    order: 1
  },
  {
    titleFr: "Résultats & Notes",
    titleAr: "النتائج والدرجات",
    url: "/results",
    icon: "ClipboardDocumentCheckIcon",
    enabled: true,
    order: 2
  }
];

const academicLevels = [
  {
    nameFr: "Tronc Commun",
    nameAr: "الجذع المشترك",
    code: "TC",
    order: 1,
    enabled: true,
    description: "Année de base pour toutes les filières"
  },
  {
    nameFr: "Première Année Bac",
    nameAr: "السنة الأولى بكالوريا",
    code: "1BAC",
    order: 2,
    enabled: true,
    description: "Spécialisation par filière"
  },
  {
    nameFr: "Deuxième Année Bac",
    nameAr: "السنة الثانية بكالوريا",
    code: "2BAC",
    order: 3,
    enabled: true,
    description: "Préparation au baccalauréat"
  }
];

const branches = [
  {
    nameFr: "Sciences Expérimentales",
    nameAr: "العلوم التجريبية",
    code: "SVT",
    levelCode: "TC",
    order: 1,
    enabled: true
  },
  {
    nameFr: "Sciences Mathématiques",
    nameAr: "العلوم الرياضية",
    code: "SM",
    levelCode: "TC",
    order: 2,
    enabled: true
  }
];

const subjects = [
  {
    nameFr: "Mathématiques",
    nameAr: "الرياضيات",
    code: "MATH",
    levelCode: "TC",
    branchCode: "SVT",
    coefficient: 3,
    hoursPerWeek: 5,
    order: 1,
    enabled: true
  },
  {
    nameFr: "Physique-Chimie",
    nameAr: "الفيزياء والكيمياء",
    code: "PC",
    levelCode: "TC",
    branchCode: "SVT",
    coefficient: 3,
    hoursPerWeek: 4,
    order: 2,
    enabled: true
  },
  {
    nameFr: "Sciences de la Vie et de la Terre",
    nameAr: "علوم الحياة والأرض",
    code: "SVT",
    levelCode: "TC",
    branchCode: "SVT",
    coefficient: 3,
    hoursPerWeek: 3,
    order: 3,
    enabled: true
  }
];

const courses = [
  {
    titleFr: "Introduction aux Équations du Second Degré",
    titleAr: "مقدمة في المعادلات من الدرجة الثانية",
    descriptionFr: "Découvrez les bases des équations du second degré.",
    descriptionAr: "اكتشف أساسيات المعادلات من الدرجة الثانية.",
    subject: "Mathématiques",
    level: "TC",
    contentType: "pdf",
    contentUrl: "https://example.com/math-equations.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    difficulty: "Débutant",
    duration: "45 min",
    published: true,
    targetLevels: ["TC"],
    views: 125,
    likes: 34
  },
  {
    titleFr: "Les Mouvements Rectilignes",
    titleAr: "الحركات المستقيمية",
    descriptionFr: "Comprendre les différents types de mouvements.",
    descriptionAr: "فهم أنواع الحركات المختلفة.",
    subject: "Physique-Chimie",
    level: "TC",
    contentType: "video",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400",
    difficulty: "Débutant",
    duration: "50 min",
    published: true,
    targetLevels: ["TC"],
    views: 142,
    likes: 41
  }
];

const exercises = [
  {
    titleFr: "Exercices sur les Équations",
    titleAr: "تمارين على المعادلات",
    descriptionFr: "10 exercices corrigés",
    descriptionAr: "10 تمارين مصححة",
    subject: "Mathématiques",
    level: "TC",
    difficulty: "Intermédiaire",
    questionCount: 10,
    published: true
  }
];

const quizzes = [
  {
    titleFr: "Quiz Mathématiques",
    titleAr: "اختبار الرياضيات",
    descriptionFr: "Testez vos connaissances",
    descriptionAr: "اختبر معرفتك",
    subject: "Mathématiques",
    level: "TC",
    duration: 30,
    totalPoints: 20,
    published: true
  }
];

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function comprehensiveSeed() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("🚀 COMPREHENSIVE DATABASE SEEDING - START");
  console.log("═══════════════════════════════════════════════════\n");

  let totalDeleted = 0;
  let totalCreated = 0;

  try {
    // ============================================
    // PHASE 1: CLEAR ALL COLLECTIONS
    // ============================================
    console.log("📦 PHASE 1: CLEARING ALL COLLECTIONS\n");
    
    const collectionsToClean = [
      'homepage-features',
      'homepage-news',
      'homepage-testimonials',
      'homepage-announcements',
      'homepage-clubs',
      'homepage-gallery',
      'homepage-quicklinks',
      'academicLevels',
      'branches',
      'subjects',
      'courses',
      'exercises',
      'quizzes'
    ];

    for (const collectionName of collectionsToClean) {
      totalDeleted += await clearCollection(collectionName);
    }

    console.log(`\n✅ Cleared ${totalDeleted} documents from all collections!\n`);

    // ============================================
    // PHASE 2: SEED HOMEPAGE DATA
    // ============================================
    console.log("═══════════════════════════════════════════════════");
    console.log("📝 PHASE 2: SEEDING HOMEPAGE DATA");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("1️⃣  Adding Hero, Stats, Contact...");
    await db.collection('homepage').doc('hero').set(heroData);
    await db.collection('homepage').doc('stats').set(statsData);
    await db.collection('homepage').doc('contact').set(contactInfo);
    totalCreated += 3;
    console.log("   ✅ 3 documents added\n");

    console.log("2️⃣  Adding Features (" + features.length + ")...");
    for (const item of features) {
      await db.collection('homepage-features').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += features.length;
    console.log(`   ✅ ${features.length} added\n`);

    console.log("3️⃣  Adding News (" + news.length + ")...");
    for (const item of news) {
      await db.collection('homepage-news').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += news.length;
    console.log(`   ✅ ${news.length} added\n`);

    console.log("4️⃣  Adding Testimonials (" + testimonials.length + ")...");
    for (const item of testimonials) {
      await db.collection('homepage-testimonials').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += testimonials.length;
    console.log(`   ✅ ${testimonials.length} added\n`);

    console.log("5️⃣  Adding Announcements (" + announcements.length + ")...");
    for (const item of announcements) {
      await db.collection('homepage-announcements').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += announcements.length;
    console.log(`   ✅ ${announcements.length} added\n`);

    console.log("6️⃣  Adding Clubs (" + clubs.length + ")...");
    for (const item of clubs) {
      await db.collection('homepage-clubs').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += clubs.length;
    console.log(`   ✅ ${clubs.length} added\n`);

    console.log("7️⃣  Adding Gallery (" + gallery.length + ")...");
    for (const item of gallery) {
      await db.collection('homepage-gallery').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += gallery.length;
    console.log(`   ✅ ${gallery.length} added\n`);

    console.log("8️⃣  Adding Quick Links (" + quickLinks.length + ")...");
    for (const item of quickLinks) {
      await db.collection('homepage-quicklinks').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += quickLinks.length;
    console.log(`   ✅ ${quickLinks.length} added\n`);

    // ============================================
    // PHASE 3: SEED ACADEMIC HIERARCHY
    // ============================================
    console.log("═══════════════════════════════════════════════════");
    console.log("🎓 PHASE 3: SEEDING ACADEMIC HIERARCHY");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("1️⃣  Adding Academic Levels (" + academicLevels.length + ")...");
    for (const item of academicLevels) {
      await db.collection('academicLevels').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += academicLevels.length;
    console.log(`   ✅ ${academicLevels.length} added\n`);

    console.log("2️⃣  Adding Branches (" + branches.length + ")...");
    for (const item of branches) {
      await db.collection('branches').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += branches.length;
    console.log(`   ✅ ${branches.length} added\n`);

    console.log("3️⃣  Adding Subjects (" + subjects.length + ")...");
    for (const item of subjects) {
      await db.collection('subjects').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += subjects.length;
    console.log(`   ✅ ${subjects.length} added\n`);

    // ============================================
    // PHASE 4: SEED EDUCATIONAL CONTENT
    // ============================================
    console.log("═══════════════════════════════════════════════════");
    console.log("📚 PHASE 4: SEEDING EDUCATIONAL CONTENT");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("1️⃣  Adding Courses (" + courses.length + ")...");
    for (const item of courses) {
      await db.collection('courses').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += courses.length;
    console.log(`   ✅ ${courses.length} added\n`);

    console.log("2️⃣  Adding Exercises (" + exercises.length + ")...");
    for (const item of exercises) {
      await db.collection('exercises').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += exercises.length;
    console.log(`   ✅ ${exercises.length} added\n`);

    console.log("3️⃣  Adding Quizzes (" + quizzes.length + ")...");
    for (const item of quizzes) {
      await db.collection('quizzes').add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    totalCreated += quizzes.length;
    console.log(`   ✅ ${quizzes.length} added\n`);

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log("\n═══════════════════════════════════════════════════");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("📊 SUMMARY:\n");
    console.log(`   🗑️  Total Documents Deleted: ${totalDeleted}`);
    console.log(`   ✅ Total Documents Created: ${totalCreated}\n`);
    console.log("✨ Your database is now fully populated!\n");

    process.exit(0);

  } catch (error) {
    console.error("\n❌ ERROR DURING SEEDING:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute the seeding script
comprehensiveSeed();
