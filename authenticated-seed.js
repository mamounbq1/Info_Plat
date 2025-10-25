// Authenticated Database Seeding Script
// This script logs in as an admin user to seed the database
// Usage: node authenticated-seed.js <admin-email> <admin-password>

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDocs,
  deleteDoc,
  writeBatch 
} from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhp2UOv8m9y0ZW1XFRw4nBt-n-l9guedc",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "960025808439",
  appId: "1:960025808439:web:5aad744488b9a855da79b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get credentials from command line or use defaults
const adminEmail = process.argv[2] || 'admin@edu.com';
const adminPassword = process.argv[3] || 'Admin@123';

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function clearCollection(collectionName) {
  console.log(`   🗑️  Clearing ${collectionName}...`);
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
    console.log(`   ✅ Deleted ${count} documents from ${collectionName}`);
    return count;
  } catch (error) {
    console.log(`   ⚠️  Could not clear ${collectionName}: ${error.message}`);
    return 0;
  }
}

// ============================================
// DATA DEFINITIONS (COMPREHENSIVE)
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
  fax: "+212 536 12 34 57",
  email: "contact@lycee-excellence.ma",
  hoursFr: "Lun-Ven: 8h-18h | Sam: 8h-13h",
  hoursAr: "الإثنين-الجمعة: 8ص-6م | السبت: 8ص-1م",
  updatedAt: new Date().toISOString()
};

const features = [
  {
    titleFr: "Excellence Académique",
    titleAr: "التميز الأكاديمي",
    descriptionFr: "Programme d'enseignement avancé avec des professeurs hautement qualifiés et méthodologie innovante",
    descriptionAr: "برنامج تعليمي متقدم مع أساتذة مؤهلين تأهيلا عاليا ومنهجية مبتكرة",
    icon: "AcademicCapIcon",
    color: "from-blue-600 to-cyan-600",
    enabled: true,
    order: 1
  },
  {
    titleFr: "Laboratoires Modernes",
    titleAr: "مختبرات حديثة",
    descriptionFr: "Équipements scientifiques de pointe pour l'expérimentation pratique en physique, chimie et biologie",
    descriptionAr: "معدات علمية متطورة للتجارب العملية في الفيزياء والكيمياء والأحياء",
    icon: "BeakerIcon",
    color: "from-purple-600 to-pink-600",
    enabled: true,
    order: 2
  },
  {
    titleFr: "Activités Parascolaires",
    titleAr: "الأنشطة اللاصفية",
    descriptionFr: "Large gamme de clubs sportifs, artistiques et culturels pour développement personnel",
    descriptionAr: "مجموعة واسعة من الأندية الرياضية والفنية والثقافية للتطوير الشخصي",
    icon: "TrophyIcon",
    color: "from-green-600 to-teal-600",
    enabled: true,
    order: 3
  },
  {
    titleFr: "Bibliothèque Numérique",
    titleAr: "المكتبة الرقمية",
    descriptionFr: "Plus de 15,000 ressources numériques et physiques disponibles pour tous les élèves",
    descriptionAr: "أكثر من 15000 مصدر رقمي ومادي متاح لجميع الطلاب",
    icon: "BookOpenIcon",
    color: "from-orange-600 to-red-600",
    enabled: true,
    order: 4
  },
  {
    titleFr: "Orientation Professionnelle",
    titleAr: "التوجيه المهني",
    descriptionFr: "Conseil personnalisé pour les choix d'études supérieures et carrières professionnelles",
    descriptionAr: "إرشاد شخصي لاختيارات الدراسات العليا والمهن المهنية",
    icon: "BriefcaseIcon",
    color: "from-indigo-600 to-blue-600",
    enabled: true,
    order: 5
  },
  {
    titleFr: "Plateforme E-Learning",
    titleAr: "منصة التعلم الإلكتروني",
    descriptionFr: "Accès 24/7 aux cours en ligne, exercices interactifs et ressources pédagogiques",
    descriptionAr: "وصول على مدار الساعة للدروس عبر الإنترنت والتمارين التفاعلية والموارد التعليمية",
    icon: "ComputerDesktopIcon",
    color: "from-cyan-600 to-blue-600",
    enabled: true,
    order: 6
  },
  {
    titleFr: "Infrastructure Moderne",
    titleAr: "بنية تحتية حديثة",
    descriptionFr: "Salles de classe climatisées, amphithéâtre, terrains sportifs et espaces verts",
    descriptionAr: "قاعات دراسية مكيفة، مدرج، ملاعب رياضية ومساحات خضراء",
    icon: "BuildingOfficeIcon",
    color: "from-emerald-600 to-green-600",
    enabled: true,
    order: 7
  },
  {
    titleFr: "Soutien Scolaire",
    titleAr: "الدعم المدرسي",
    descriptionFr: "Cours de soutien gratuits et aide aux devoirs par des enseignants qualifiés",
    descriptionAr: "دروس دعم مجانية ومساعدة في الواجبات من قبل معلمين مؤهلين",
    icon: "UsersIcon",
    color: "from-rose-600 to-pink-600",
    enabled: true,
    order: 8
  }
];

const news = [
  {
    titleFr: "Succès remarquable au Baccalauréat 2024",
    titleAr: "نجاح ملحوظ في امتحان البكالوريا 2024",
    excerptFr: "98% de réussite avec 45 mentions très bien - Un record historique pour notre établissement",
    excerptAr: "نسبة نجاح 98٪ مع 45 ميزة جيد جدا - رقم قياسي تاريخي لمؤسستنا",
    contentFr: "Notre lycée a brillamment réussi la session 2024 du baccalauréat avec un taux de réussite exceptionnel de 98%. Parmi nos lauréats, 45 élèves ont obtenu la mention très bien, 120 la mention bien, et 85 la mention assez bien. Ces résultats remarquables témoignent de l'excellence de notre enseignement, de l'engagement de nos élèves et du soutien constant de leurs familles. Félicitations à tous nos bacheliers!",
    contentAr: "حققت ثانويتنا نجاحا باهرا في دورة 2024 من امتحان البكالوريا بنسبة نجاح استثنائية بلغت 98٪. من بين خريجينا، حصل 45 طالبا على ميزة جيد جدا، و120 على ميزة جيد، و85 على ميزة حسن. تشهد هذه النتائج المتميزة على تميز تعليمنا والتزام طلابنا والدعم المستمر من عائلاتهم. تهانينا لجميع حاملي البكالوريا!",
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
    category: "Actualités",
    publishDate: "2024-07-15",
    author: "Direction du Lycée",
    enabled: true
  },
  {
    titleFr: "Nouveau laboratoire de robotique inauguré",
    titleAr: "تدشين مختبر الروبوتات الجديد",
    excerptFr: "Un espace high-tech de 200m² pour l'innovation et la créativité technologique",
    excerptAr: "مساحة عالية التقنية من 200 متر مربع للابتكار والإبداع التكنولوجي",
    contentFr: "Le lycée vient d'inaugurer un laboratoire de robotique ultramoderne équipé de matériel de dernière génération. Les élèves pourront y développer leurs compétences en programmation, électronique et mécanique. Des robots éducatifs, imprimantes 3D et kits Arduino sont à leur disposition. Ce nouvel espace favorisera l'innovation et préparera nos élèves aux métiers du futur.",
    contentAr: "دشن المعهد مؤخرا مختبر روبوتات حديث مجهز بأحدث المعدات. سيتمكن الطلاب من تطوير مهاراتهم في البرمجة والإلكترونيات والميكانيكا. الروبوتات التعليمية والطابعات ثلاثية الأبعاد ومجموعات أردوينو متاحة لهم. ستعزز هذه المساحة الجديدة الابتكار وتعد طلابنا لوظائف المستقبل.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    category: "Infrastructure",
    publishDate: "2024-09-10",
    author: "Service Communication",
    enabled: true
  },
  {
    titleFr: "Victoire au championnat régional de mathématiques",
    titleAr: "الفوز في البطولة الإقليمية للرياضيات",
    excerptFr: "Nos élèves remportent la première place sur 32 établissements participants",
    excerptAr: "طلابنا يحصلون على المركز الأول من بين 32 مؤسسة مشاركة",
    contentFr: "L'équipe de mathématiques du lycée a brillamment remporté le championnat régional inter-lycées. Face à 32 établissements, nos élèves ont démontré leur excellence en résolvant des problèmes complexes. Cette victoire illustre la qualité de notre enseignement scientifique. Félicitations à toute l'équipe et à leur professeur encadrant M. Bennani!",
    contentAr: "فاز فريق الرياضيات بالثانوية بشكل رائع في البطولة الإقليمية بين الثانويات. أمام 32 مؤسسة، أظهر طلابنا تميزهم في حل المسائل المعقدة. يوضح هذا الفوز جودة تعليمنا العلمي. تهانينا لكل الفريق وأستاذهم المشرف السيد بناني!",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800",
    category: "Compétitions",
    publishDate: "2024-10-05",
    author: "Club de Mathématiques",
    enabled: true
  },
  {
    titleFr: "Journée portes ouvertes - Samedi 15 novembre",
    titleAr: "يوم الأبواب المفتوحة - السبت 15 نوفمبر",
    excerptFr: "Venez découvrir notre établissement, rencontrer nos professeurs et visiter nos installations",
    excerptAr: "تعالوا واكتشفوا مؤسستنا، التقوا بمعلمينا وزوروا منشآتنا",
    contentFr: "Le lycée organise une journée portes ouvertes le samedi 15 novembre de 9h à 17h. Parents et futurs élèves pourront visiter nos installations, rencontrer les professeurs, assister à des démonstrations en laboratoire et découvrir nos différents clubs. Inscriptions sur place pour l'année 2025-2026. Présence obligatoire pour les nouvelles inscriptions.",
    contentAr: "تنظم الثانوية يوم أبواب مفتوحة يوم السبت 15 نوفمبر من الساعة 9 صباحا إلى 5 مساء. سيتمكن أولياء الأمور والطلاب المستقبليون من زيارة منشآتنا ومقابلة المعلمين وحضور العروض التوضيحية في المختبر واكتشاف أنديتنا المختلفة. التسجيلات في الموقع للعام الدراسي 2025-2026. الحضور إلزامي للتسجيلات الجديدة.",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
    category: "Événements",
    publishDate: "2024-10-20",
    author: "Direction",
    enabled: true
  },
  {
    titleFr: "Partenariat stratégique avec l'Université Hassan II",
    titleAr: "شراكة استراتيجية مع جامعة الحسن الثاني",
    excerptFr: "Convention signée pour faciliter l'orientation supérieure et les parcours universitaires",
    excerptAr: "توقيع اتفاقية لتسهيل التوجيه الجامعي والمسارات الجامعية",
    contentFr: "Une convention de partenariat a été signée avec l'Université Hassan II de Casablanca. Nos élèves bénéficieront de journées d'orientation, de visites des facultés, de conférences thématiques et d'un accompagnement personnalisé pour leurs choix d'études supérieures. Un programme de mentorat avec des étudiants universitaires est également prévu.",
    contentAr: "تم توقيع اتفاقية شراكة مع جامعة الحسن الثاني بالدار البيضاء. سيستفيد طلابنا من أيام التوجيه وزيارات الكليات والمؤتمرات المواضيعية والمرافقة الشخصية لاختياراتهم في الدراسات العليا. برنامج توجيه مع طلاب الجامعة مخطط أيضا.",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
    category: "Partenariats",
    publishDate: "2024-09-25",
    author: "Service Orientation",
    enabled: true
  },
  {
    titleFr: "Festival culturel annuel - 5-7 décembre 2024",
    titleAr: "المهرجان الثقافي السنوي - 5-7 ديسمبر 2024",
    excerptFr: "Trois jours de célébration des arts, de la culture et de la créativité estudiantine",
    excerptAr: "ثلاثة أيام من الاحتفال بالفنون والثقافة والإبداع الطلابي",
    contentFr: "Notre festival culturel annuel se tiendra du 5 au 7 décembre 2024. Au programme: expositions d'art, pièces de théâtre, concerts musicaux, récitals de poésie, démonstrations culinaires et compétitions sportives. Tous les clubs du lycée participeront à cet événement majeur. Entrée gratuite pour tous!",
    contentAr: "سيقام مهرجاننا الثقافي السنوي من 5 إلى 7 ديسمبر 2024. في البرنامج: معارض فنية ومسرحيات وحفلات موسيقية وأمسيات شعرية وعروض طهي ومسابقات رياضية. ستشارك جميع أندية الثانوية في هذا الحدث الكبير. الدخول مجاني للجميع!",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    category: "Culture",
    publishDate: "2024-11-01",
    author: "Club Culturel",
    enabled: true
  }
];

const testimonials = [
  {
    nameFr: "Amina El Fassi",
    nameAr: "أمينة الفاسي",
    roleFr: "Promotion 2023 - École Centrale Paris",
    roleAr: "دفعة 2023 - المدرسة المركزية باريس",
    contentFr: "Le lycée m'a donné les meilleures bases académiques et m'a appris la rigueur scientifique. Grâce à mes professeurs dévoués et à l'excellent programme, j'ai pu intégrer l'une des meilleures écoles d'ingénieurs de France. Je recommande vivement cet établissement!",
    contentAr: "أعطتني الثانوية أفضل الأسس الأكاديمية وعلمتني الدقة العلمية. بفضل أساتذتي المتفانين والبرنامج الممتاز، تمكنت من الالتحاق بواحدة من أفضل كليات الهندسة في فرنسا. أوصي بشدة بهذه المؤسسة!",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    rating: 5,
    enabled: true,
    order: 1
  },
  {
    nameFr: "Youssef Bennani",
    nameAr: "يوسف بناني",
    roleFr: "Promotion 2022 - Faculté de Médecine, Rabat",
    roleAr: "دفعة 2022 - كلية الطب، الرباط",
    contentFr: "L'encadrement exceptionnel et les activités parascolaires m'ont permis de développer mes compétences académiques et ma personnalité. Je suis fier d'être un ancien élève de ce lycée d'excellence. Les valeurs humaines qu'on m'y a inculquées me guident encore aujourd'hui.",
    contentAr: "الإشراف الاستثنائي والأنشطة اللاصفية سمحت لي بتطوير مهاراتي الأكاديمية وشخصيتي. أنا فخور بكوني خريج هذه الثانوية المتميزة. القيم الإنسانية التي غرست في لا تزال ترشدني اليوم.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 5,
    enabled: true,
    order: 2
  },
  {
    nameFr: "Salma Idrissi",
    nameAr: "سلمى الإدريسي",
    roleFr: "Promotion 2024 - Classes Préparatoires CPGE",
    roleAr: "دفعة 2024 - الأقسام التحضيرية",
    contentFr: "Les laboratoires modernes et les cours de qualité m'ont préparée parfaitement aux classes préparatoires. Les professeurs sont toujours disponibles et encourageants. L'ambiance de travail et la qualité de l'enseignement sont exceptionnelles. Merci pour tout!",
    contentAr: "المختبرات الحديثة والدروس عالية الجودة أعدتني بشكل مثالي للأقسام التحضيرية. الأساتذة متاحون دائما ومشجعون. جو العمل وجودة التعليم استثنائية. شكرا على كل شيء!",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    rating: 5,
    enabled: true,
    order: 3
  },
  {
    nameFr: "Karim Alaoui",
    nameAr: "كريم العلوي",
    roleFr: "Promotion 2021 - ENSAM Rabat",
    roleAr: "دفعة 2021 - المدرسة الوطنية للصناعة المعدنية الرباط",
    contentFr: "Le lycée offre un environnement stimulant qui pousse à l'excellence. Les compétitions scientifiques auxquelles j'ai participé m'ont permis de me dépasser et d'atteindre mes objectifs. La préparation aux concours est excellente!",
    contentAr: "توفر الثانوية بيئة محفزة تدفع إلى التميز. المسابقات العلمية التي شاركت فيها سمحت لي بتجاوز نفسي وتحقيق أهدافي. التحضير للمسابقات ممتاز!",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    rating: 5,
    enabled: true,
    order: 4
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
    dateFr: "Pour les classes terminales - Présence obligatoire",
    dateAr: "لطلاب السنة النهائية - الحضور إلزامي",
    urgent: true,
    enabled: true,
    order: 2
  },
  {
    titleFr: "Réunion parents-professeurs",
    titleAr: "اجتماع أولياء الأمور والمعلمين",
    dateFr: "Samedi 2 novembre à 14h - Amphithéâtre",
    dateAr: "السبت 2 نوفمبر الساعة 2 مساء - المدرج",
    urgent: false,
    enabled: true,
    order: 3
  },
  {
    titleFr: "Bibliothèque: Nouveaux horaires",
    titleAr: "المكتبة: أوقات فتح جديدة",
    dateFr: "7h-19h du lundi au samedi",
    dateAr: "7 صباحا - 7 مساء من الاثنين إلى السبت",
    urgent: false,
    enabled: true,
    order: 4
  }
];

const clubs = [
  {
    nameFr: "Club Théâtre",
    nameAr: "نادي المسرح",
    descriptionFr: "Expression artistique, représentations théâtrales et ateliers d'improvisation",
    descriptionAr: "التعبير الفني والعروض المسرحية وورش الارتجال",
    icon: "🎭",
    colorGradient: "from-purple-600 to-pink-600",
    enabled: true,
    order: 1
  },
  {
    nameFr: "Club Sciences et Robotique",
    nameAr: "نادي العلوم والروبوتات",
    descriptionFr: "Expériences scientifiques, projets robotique et compétitions nationales",
    descriptionAr: "التجارب العلمية ومشاريع الروبوتات والمسابقات الوطنية",
    icon: "🔬",
    colorGradient: "from-indigo-600 to-purple-600",
    enabled: true,
    order: 2
  },
  {
    nameFr: "Club Football",
    nameAr: "نادي كرة القدم",
    descriptionFr: "Entraînements réguliers et compétitions inter-lycées régionales",
    descriptionAr: "التدريبات المنتظمة والمسابقات الإقليمية بين الثانويات",
    icon: "⚽",
    colorGradient: "from-green-600 to-emerald-600",
    enabled: true,
    order: 3
  },
  {
    nameFr: "Club Musique et Chant",
    nameAr: "نادي الموسيقى والغناء",
    descriptionFr: "Orchestre scolaire, chorale et apprentissage d'instruments",
    descriptionAr: "الأوركسترا المدرسية والكورال وتعلم الآلات الموسيقية",
    icon: "🎵",
    colorGradient: "from-blue-600 to-cyan-600",
    enabled: true,
    order: 4
  },
  {
    nameFr: "Club Environnement",
    nameAr: "نادي البيئة",
    descriptionFr: "Actions écologiques, sensibilisation et projets de développement durable",
    descriptionAr: "الإجراءات البيئية والتوعية ومشاريع التنمية المستدامة",
    icon: "🌍",
    colorGradient: "from-teal-600 to-green-600",
    enabled: true,
    order: 5
  }
];

const gallery = [
  {
    titleFr: "Campus principal et espaces verts",
    titleAr: "الحرم الرئيسي والمساحات الخضراء",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    enabled: true,
    order: 1
  },
  {
    titleFr: "Laboratoire de chimie moderne",
    titleAr: "مختبر الكيمياء الحديث",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    enabled: true,
    order: 2
  },
  {
    titleFr: "Bibliothèque multimédia",
    titleAr: "المكتبة المتعددة الوسائط",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800",
    enabled: true,
    order: 3
  },
  {
    titleFr: "Salle informatique équipée",
    titleAr: "قاعة الحاسوب المجهزة",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    enabled: true,
    order: 4
  }
];

const quickLinks = [
  {
    titleFr: "Calendrier Scolaire 2024-2025",
    titleAr: "التقويم المدرسي 2024-2025",
    url: "/calendar",
    icon: "CalendarDaysIcon",
    enabled: true,
    order: 1
  },
  {
    titleFr: "Résultats et Notes en Ligne",
    titleAr: "النتائج والدرجات عبر الإنترنت",
    url: "/results",
    icon: "ClipboardDocumentCheckIcon",
    enabled: true,
    order: 2
  },
  {
    titleFr: "Emploi du Temps",
    titleAr: "جدول الحصص",
    url: "/schedule",
    icon: "ClockIcon",
    enabled: true,
    order: 3
  },
  {
    titleFr: "Bibliothèque Numérique",
    titleAr: "المكتبة الرقمية",
    url: "/library",
    icon: "BookOpenIcon",
    enabled: true,
    order: 4
  }
];

const academicLevels = [
  {
    nameFr: "Tronc Commun",
    nameAr: "الجذع المشترك",
    code: "TC",
    order: 1,
    enabled: true,
    description: "Année de base pour toutes les filières - Formation générale"
  },
  {
    nameFr: "Première Année Baccalauréat",
    nameAr: "السنة الأولى بكالوريا",
    code: "1BAC",
    order: 2,
    enabled: true,
    description: "Spécialisation par filière - Approfondissement"
  },
  {
    nameFr: "Deuxième Année Baccalauréat",
    nameAr: "السنة الثانية بكالوريا",
    code: "2BAC",
    order: 3,
    enabled: true,
    description: "Préparation intensive au baccalauréat national"
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
    description: "Biologie, Chimie, Physique - Option Française"
  },
  {
    nameFr: "Sciences Mathématiques",
    nameAr: "العلوم الرياضية",
    code: "SM",
    levelCode: "TC",
    order: 2,
    enabled: true,
    description: "Mathématiques avancées, Physique"
  },
  {
    nameFr: "Sciences Économiques",
    nameAr: "العلوم الاقتصادية",
    code: "SE",
    levelCode: "TC",
    order: 3,
    enabled: true,
    description: "Économie, Comptabilité, Gestion"
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
  },
  {
    nameFr: "Français",
    nameAr: "الفرنسية",
    code: "FR",
    levelCode: "TC",
    branchCode: "SVT",
    coefficient: 2,
    hoursPerWeek: 4,
    order: 4,
    enabled: true
  },
  {
    nameFr: "Arabe",
    nameAr: "العربية",
    code: "AR",
    levelCode: "TC",
    branchCode: "SVT",
    coefficient: 2,
    hoursPerWeek: 3,
    order: 5,
    enabled: true
  }
];

const courses = [
  {
    titleFr: "Introduction aux Équations du Second Degré",
    titleAr: "مقدمة في المعادلات من الدرجة الثانية",
    descriptionFr: "Découvrez les bases des équations du second degré: résolution, discriminant, applications pratiques et exercices corrigés.",
    descriptionAr: "اكتشف أساسيات المعادلات من الدرجة الثانية: الحل، المميز، التطبيقات العملية والتمارين المصححة.",
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
    descriptionFr: "Comprendre les différents types de mouvements: uniforme, uniformément varié, chute libre. Avec graphiques et applications.",
    descriptionAr: "فهم أنواع الحركات المختلفة: المنتظمة، المتغيرة بانتظام، السقوط الحر. مع الرسوم البيانية والتطبيقات.",
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
  },
  {
    titleFr: "La Cellule: Unité de Base de la Vie",
    titleAr: "الخلية: وحدة الحياة الأساسية",
    descriptionFr: "Structure cellulaire, organites, fonctions biologiques et division cellulaire. Cours complet avec schémas annotés.",
    descriptionAr: "البنية الخلوية، العضيات، الوظائف البيولوجية والانقسام الخلوي. دورة كاملة مع رسوم توضيحية.",
    subject: "Sciences de la Vie et de la Terre",
    level: "TC",
    contentType: "pdf",
    contentUrl: "https://example.com/biology-cell.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400",
    difficulty: "Intermédiaire",
    duration: "60 min",
    published: true,
    targetLevels: ["TC"],
    views: 167,
    likes: 52
  }
];

const exercises = [
  {
    titleFr: "Exercices sur les Équations du Second Degré",
    titleAr: "تمارين على المعادلات من الدرجة الثانية",
    descriptionFr: "15 exercices progressifs avec corrections détaillées et méthodes de résolution variées.",
    descriptionAr: "15 تمرين تدريجي مع تصحيحات مفصلة وطرق حل متنوعة.",
    subject: "Mathématiques",
    level: "TC",
    difficulty: "Intermédiaire",
    questionCount: 15,
    published: true,
    estimatedTime: 60
  },
  {
    titleFr: "QCM Physique - Mouvements et Forces",
    titleAr: "أسئلة اختيار متعدد في الفيزياء - الحركات والقوى",
    descriptionFr: "25 questions à choix multiples couvrant la cinématique et la dynamique.",
    descriptionAr: "25 سؤال اختيار متعدد يغطي علم الحركة والديناميكا.",
    subject: "Physique-Chimie",
    level: "TC",
    difficulty: "Débutant",
    questionCount: 25,
    published: true,
    estimatedTime: 40
  }
];

const quizzes = [
  {
    titleFr: "Quiz Mathématiques - Algèbre",
    titleAr: "اختبار الرياضيات - الجبر",
    descriptionFr: "Testez vos connaissances en algèbre: équations, inéquations, systèmes.",
    descriptionAr: "اختبر معرفتك في الجبر: المعادلات، المتباينات، الأنظمة.",
    subject: "Mathématiques",
    level: "TC",
    duration: 30,
    totalPoints: 20,
    published: true,
    passingScore: 12
  },
  {
    titleFr: "Quiz Physique - Mécanique",
    titleAr: "اختبار الفيزياء - الميكانيكا",
    descriptionFr: "Évaluation sur les mouvements, forces et énergie mécanique.",
    descriptionAr: "تقييم حول الحركات والقوى والطاقة الميكانيكية.",
    subject: "Physique-Chimie",
    level: "TC",
    duration: 25,
    totalPoints: 15,
    published: true,
    passingScore: 9
  }
];

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function authenticatedSeed() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("🚀 AUTHENTICATED DATABASE SEEDING - START");
  console.log("═══════════════════════════════════════════════════\n");

  let totalDeleted = 0;
  let totalCreated = 0;

  try {
    // Step 1: Authenticate
    console.log("🔐 Step 1: Authenticating as admin...");
    console.log(`   Email: ${adminEmail}`);
    
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log(`   ✅ Authenticated as: ${userCredential.user.email}\n`);

    // Step 2: Clear all collections
    console.log("═══════════════════════════════════════════════════");
    console.log("📦 Step 2: CLEARING ALL COLLECTIONS");
    console.log("═══════════════════════════════════════════════════\n");
    
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

    console.log(`\n✅ Cleared ${totalDeleted} documents total!\n`);

    // Step 3: Seed homepage data
    console.log("═══════════════════════════════════════════════════");
    console.log("📝 Step 3: SEEDING HOMEPAGE DATA");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("1️⃣  Adding Hero, Stats, Contact...");
    await setDoc(doc(db, "homepage", "hero"), heroData);
    await setDoc(doc(db, "homepage", "stats"), statsData);
    await setDoc(doc(db, "homepage", "contact"), contactInfo);
    totalCreated += 3;
    console.log("   ✅ 3 documents added\n");

    console.log("2️⃣  Adding Features (" + features.length + ")...");
    for (const item of features) {
      await addDoc(collection(db, "homepage-features"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += features.length;
    console.log(`   ✅ ${features.length} added\n`);

    console.log("3️⃣  Adding News (" + news.length + ")...");
    for (const item of news) {
      await addDoc(collection(db, "homepage-news"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += news.length;
    console.log(`   ✅ ${news.length} added\n`);

    console.log("4️⃣  Adding Testimonials (" + testimonials.length + ")...");
    for (const item of testimonials) {
      await addDoc(collection(db, "homepage-testimonials"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += testimonials.length;
    console.log(`   ✅ ${testimonials.length} added\n`);

    console.log("5️⃣  Adding Announcements (" + announcements.length + ")...");
    for (const item of announcements) {
      await addDoc(collection(db, "homepage-announcements"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += announcements.length;
    console.log(`   ✅ ${announcements.length} added\n`);

    console.log("6️⃣  Adding Clubs (" + clubs.length + ")...");
    for (const item of clubs) {
      await addDoc(collection(db, "homepage-clubs"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += clubs.length;
    console.log(`   ✅ ${clubs.length} added\n`);

    console.log("7️⃣  Adding Gallery (" + gallery.length + ")...");
    for (const item of gallery) {
      await addDoc(collection(db, "homepage-gallery"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += gallery.length;
    console.log(`   ✅ ${gallery.length} added\n`);

    console.log("8️⃣  Adding Quick Links (" + quickLinks.length + ")...");
    for (const item of quickLinks) {
      await addDoc(collection(db, "homepage-quicklinks"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += quickLinks.length;
    console.log(`   ✅ ${quickLinks.length} added\n`);

    // Step 4: Seed academic hierarchy
    console.log("═══════════════════════════════════════════════════");
    console.log("🎓 Step 4: SEEDING ACADEMIC HIERARCHY");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("1️⃣  Adding Academic Levels (" + academicLevels.length + ")...");
    for (const item of academicLevels) {
      await addDoc(collection(db, "academicLevels"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += academicLevels.length;
    console.log(`   ✅ ${academicLevels.length} added\n`);

    console.log("2️⃣  Adding Branches (" + branches.length + ")...");
    for (const item of branches) {
      await addDoc(collection(db, "branches"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += branches.length;
    console.log(`   ✅ ${branches.length} added\n`);

    console.log("3️⃣  Adding Subjects (" + subjects.length + ")...");
    for (const item of subjects) {
      await addDoc(collection(db, "subjects"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += subjects.length;
    console.log(`   ✅ ${subjects.length} added\n`);

    // Step 5: Seed educational content
    console.log("═══════════════════════════════════════════════════");
    console.log("📚 Step 5: SEEDING EDUCATIONAL CONTENT");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("1️⃣  Adding Courses (" + courses.length + ")...");
    for (const item of courses) {
      await addDoc(collection(db, "courses"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += courses.length;
    console.log(`   ✅ ${courses.length} added\n`);

    console.log("2️⃣  Adding Exercises (" + exercises.length + ")...");
    for (const item of exercises) {
      await addDoc(collection(db, "exercises"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += exercises.length;
    console.log(`   ✅ ${exercises.length} added\n`);

    console.log("3️⃣  Adding Quizzes (" + quizzes.length + ")...");
    for (const item of quizzes) {
      await addDoc(collection(db, "quizzes"), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    totalCreated += quizzes.length;
    console.log(`   ✅ ${quizzes.length} added\n`);

    // Final summary
    console.log("\n═══════════════════════════════════════════════════");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("📊 SUMMARY:\n");
    console.log(`   🗑️  Documents Deleted: ${totalDeleted}`);
    console.log(`   ✅ Documents Created: ${totalCreated}`);
    console.log(`\n   📝 Homepage: ${3 + features.length + news.length + testimonials.length + announcements.length + clubs.length + gallery.length + quickLinks.length} docs`);
    console.log(`   🎓 Academic: ${academicLevels.length + branches.length + subjects.length} docs`);
    console.log(`   📚 Content: ${courses.length + exercises.length + quizzes.length} docs\n`);
    console.log("✨ Your database is now fully populated with comprehensive data!\n");

    // Sign out
    await auth.signOut();
    console.log("🚪 Signed out successfully\n");

    process.exit(0);

  } catch (error) {
    console.error("\n❌ ERROR DURING SEEDING:", error.message);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    console.error("\n💡 TIPS:");
    console.error("   1. Make sure you created an admin user first");
    console.error("   2. Check your email/password are correct");
    console.error("   3. Verify Firestore rules allow admin write access");
    console.error("   4. Try: node authenticated-seed.js your-email@domain.com your-password\n");
    process.exit(1);
  }
}

// Execute the seeding script
authenticatedSeed();
