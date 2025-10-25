import { useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  deleteDoc,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function DatabaseSeeder() {
  const { currentUser } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState('');
  const [stats, setStats] = useState({ deleted: 0, created: 0 });

  // ============================================
  // DATA DEFINITIONS
  // ============================================

  const heroData = {
    titleFr: "Bienvenue au Lycée d'Excellence d'Oujda",
    titleAr: "مرحبا بكم في ثانوية التميز بوجدة",
    subtitleFr: "Former les leaders de demain avec excellence académique et valeurs humaines",
    subtitleAr: "تكوين قادة الغد بالتميز الأكاديمي والقيم الإنسانية",
    buttonText1Fr: "Inscription en ligne",
    buttonText1Ar: "التسجيل عبر الإنترنت",
    buttonText2Fr: "Découvrir nos programmes",
    buttonText2Ar: "اكتشف برامجنا",
    backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920",
    enabled: true,
    updatedAt: new Date().toISOString()
  };

  const statsData = {
    students: 1250,
    teachers: 85,
    successRate: 98,
    years: 45,
    updatedAt: new Date().toISOString()
  };

  const contactInfo = {
    addressFr: "Avenue Hassan II, Oujda 60000, Maroc",
    addressAr: "شارع الحسن الثاني، وجدة 60000، المغرب",
    phone: "+212 536 12 34 56",
    email: "contact@lycee-excellence.ma",
    hoursFr: "Lun-Ven: 8h-18h | Sam: 8h-13h",
    hoursAr: "الإثنين-الجمعة: 8ص-6م | السبت: 8ص-1م",
    updatedAt: new Date().toISOString()
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
    }
  ];

  const news = [
    {
      titleFr: "Succès remarquable au Baccalauréat 2024",
      titleAr: "نجاح ملحوظ في امتحان البكالوريا 2024",
      excerptFr: "98% de réussite avec 45 mentions très bien",
      excerptAr: "نسبة نجاح 98٪ مع 45 ميزة جيد جدا",
      contentFr: "Notre lycée a brillamment réussi la session 2024 du baccalauréat.",
      contentAr: "حققت ثانويتنا نجاحا باهرا في دورة 2024.",
      imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
      category: "Actualités",
      publishDate: "2024-07-15",
      author: "Direction du Lycée",
      enabled: true
    },
    {
      titleFr: "Nouveau laboratoire de robotique inauguré",
      titleAr: "تدشين مختبر الروبوتات الجديد",
      excerptFr: "Un espace high-tech pour l'innovation",
      excerptAr: "مساحة عالية التقنية للابتكار",
      contentFr: "Le lycée vient d'inaugurer un laboratoire de robotique ultramoderne.",
      contentAr: "دشن المعهد مؤخرا مختبر روبوتات حديث.",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
      category: "Infrastructure",
      publishDate: "2024-09-10",
      author: "Service Communication",
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
    }
  ];

  const gallery = [
    {
      titleFr: "Campus principal",
      titleAr: "الحرم الرئيسي",
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
      enabled: true,
      order: 1
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
    }
  ];

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const clearCollection = async (collectionName) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      let count = 0;

      snapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
        count++;
      });

      if (count > 0) {
        await batch.commit();
      }

      return count;
    } catch (error) {
      console.error(`Error clearing ${collectionName}:`, error);
      return 0;
    }
  };

  // ============================================
  // MAIN SEEDING FUNCTION
  // ============================================

  const handleSeed = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to seed the database');
      return;
    }

    setIsSeeding(true);
    setProgress('Starting database seeding...');
    let deletedCount = 0;
    let createdCount = 0;

    try {
      // Phase 1: Clear collections
      setProgress('📦 Phase 1: Clearing collections...');
      
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
        'courses'
      ];

      for (const collName of collectionsToClean) {
        const deleted = await clearCollection(collName);
        deletedCount += deleted;
        setProgress(`Cleared ${collName}: ${deleted} docs`);
      }

      // Phase 2: Seed homepage data
      setProgress('📝 Phase 2: Seeding homepage data...');

      await setDoc(doc(db, 'homepage', 'hero'), heroData);
      await setDoc(doc(db, 'homepage', 'stats'), statsData);
      await setDoc(doc(db, 'homepage', 'contact'), contactInfo);
      createdCount += 3;

      for (const item of features) {
        await addDoc(collection(db, 'homepage-features'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      for (const item of news) {
        await addDoc(collection(db, 'homepage-news'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      for (const item of testimonials) {
        await addDoc(collection(db, 'homepage-testimonials'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      for (const item of announcements) {
        await addDoc(collection(db, 'homepage-announcements'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      for (const item of clubs) {
        await addDoc(collection(db, 'homepage-clubs'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      for (const item of gallery) {
        await addDoc(collection(db, 'homepage-gallery'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      for (const item of quickLinks) {
        await addDoc(collection(db, 'homepage-quicklinks'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      // Phase 3: Seed academic hierarchy
      setProgress('🎓 Phase 3: Seeding academic hierarchy...');

      for (const item of academicLevels) {
        await addDoc(collection(db, 'academicLevels'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      for (const item of branches) {
        await addDoc(collection(db, 'branches'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      for (const item of subjects) {
        await addDoc(collection(db, 'subjects'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      // Phase 4: Seed courses
      setProgress('📚 Phase 4: Seeding courses...');

      for (const item of courses) {
        await addDoc(collection(db, 'courses'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        createdCount++;
      }

      setStats({ deleted: deletedCount, created: createdCount });
      setProgress(`✅ Complete! Deleted: ${deletedCount}, Created: ${createdCount}`);
      toast.success('Database seeded successfully!');

    } catch (error) {
      console.error('Seeding error:', error);
      setProgress(`❌ Error: ${error.message}`);
      toast.error('Failed to seed database: ' + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You must be logged in as an admin to access the database seeder.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗄️ Database Seeder
          </h1>
          <p className="text-gray-600 mb-8">
            Clear and refill the database with comprehensive test data
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">⚠️ Warning</h2>
            <p className="text-blue-800 text-sm">
              This will DELETE all existing data in the following collections and refill them with test data:
            </p>
            <ul className="list-disc list-inside text-blue-800 text-sm mt-2 ml-2">
              <li>Homepage content (features, news, testimonials, etc.)</li>
              <li>Academic hierarchy (levels, branches, subjects)</li>
              <li>Courses and educational content</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-green-900 mb-2">📊 Data to be Added</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <p className="font-medium">Homepage:</p>
                <ul className="ml-4">
                  <li>• Hero, Stats, Contact</li>
                  <li>• {features.length} Features</li>
                  <li>• {news.length} News articles</li>
                  <li>• {testimonials.length} Testimonials</li>
                  <li>• {announcements.length} Announcements</li>
                  <li>• {clubs.length} Clubs</li>
                  <li>• {gallery.length} Gallery images</li>
                  <li>• {quickLinks.length} Quick links</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Academic:</p>
                <ul className="ml-4">
                  <li>• {academicLevels.length} Academic levels</li>
                  <li>• {branches.length} Branches</li>
                  <li>• {subjects.length} Subjects</li>
                  <li>• {courses.length} Courses</li>
                </ul>
              </div>
            </div>
          </div>

          {progress && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="font-mono text-sm text-gray-700">{progress}</p>
              {stats.deleted > 0 || stats.created > 0 ? (
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-red-600">🗑️ Deleted: {stats.deleted}</span>
                  <span className="text-green-600">✅ Created: {stats.created}</span>
                </div>
              ) : null}
            </div>
          )}

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isSeeding
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSeeding ? '⏳ Seeding Database...' : '🚀 Start Database Seeding'}
          </button>

          {!isSeeding && stats.created > 0 && (
            <div className="mt-6 text-center">
              <p className="text-green-600 font-semibold mb-2">✅ Seeding completed successfully!</p>
              <div className="flex gap-4 justify-center text-sm">
                <a href="/" className="text-blue-600 hover:underline">
                  View Homepage
                </a>
                <a href="/admin" className="text-blue-600 hover:underline">
                  Go to Admin Dashboard
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Make sure you have a stable internet connection</li>
            <li>• The process may take 30-60 seconds to complete</li>
            <li>• Do not close this page while seeding is in progress</li>
            <li>• You can run this multiple times to refresh the data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
