// Script pour remplir la base de données Firestore avec des données réalistes
// Usage: node seed-database.js

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  writeBatch 
} from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDgu4dd6kZF-h8RLABbYOlYi_XNu7sNvlo",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "846430849952",
  appId: "1:846430849952:web:1af9d3c2654e3e0d0f2e19"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// 1. HOMEPAGE HERO SECTION
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
  updatedAt: new Date().toISOString()
};

// ============================================
// 2. HOMEPAGE STATS
// ============================================
const statsData = {
  students: 1250,
  teachers: 85,
  successRate: 98,
  years: 45,
  updatedAt: new Date().toISOString()
};

// ============================================
// 3. HOMEPAGE FEATURES (6 features)
// ============================================
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

// ============================================
// 4. HOMEPAGE NEWS (8 actualités)
// ============================================
const news = [
  {
    titleFr: "Succès remarquable au Baccalauréat 2024",
    titleAr: "نجاح ملحوظ في امتحان البكالوريا 2024",
    excerptFr: "98% de réussite avec 45 mentions très bien",
    excerptAr: "نسبة نجاح 98٪ مع 45 ميزة جيد جدا",
    contentFr: "Notre lycée a brillamment réussi la session 2024 du baccalauréat avec un taux de réussite exceptionnel de 98%. Parmi nos lauréats, 45 élèves ont obtenu la mention très bien, 120 la mention bien, et 85 la mention assez bien. Ces résultats témoignent de l'excellence de notre enseignement et de l'engagement de nos élèves.",
    contentAr: "حققت ثانويتنا نجاحا باهرا في دورة 2024 من امتحان البكالوريا بنسبة نجاح استثنائية بلغت 98٪. من بين خريجينا، حصل 45 طالبا على ميزة جيد جدا، و120 على ميزة جيد، و85 على ميزة حسن. تشهد هذه النتائج على تميز تعليمنا والتزام طلابنا.",
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
    contentFr: "Le lycée vient d'inaugurer un laboratoire de robotique ultramoderne équipé de matériel de dernière génération. Les élèves pourront y développer leurs compétences en programmation, électronique et mécanique. Ce nouvel espace favorisera l'innovation et préparera nos élèves aux métiers du futur.",
    contentAr: "دشن المعهد مؤخرا مختبر روبوتات حديث مجهز بأحدث المعدات. سيتمكن الطلاب من تطوير مهاراتهم في البرمجة والإلكترونيات والميكانيكا. ستعزز هذه المساحة الجديدة الابتكار وتعد طلابنا لوظائف المستقبل.",
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
    contentFr: "L'équipe de mathématiques du lycée a brillamment remporté le championnat régional inter-lycées. Nos élèves ont démontré leur excellence en résolvant des problèmes complexes. Félicitations à toute l'équipe et à leur professeur encadrant!",
    contentAr: "فاز فريق الرياضيات بالثانوية بشكل رائع في البطولة الإقليمية بين الثانويات. أظهر طلابنا تميزهم في حل المسائل المعقدة. تهانينا لكل الفريق وأستاذهم المشرف!",
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
    contentFr: "Le lycée organise une journée portes ouvertes le samedi 15 novembre de 9h à 17h. Parents et futurs élèves pourront visiter nos installations, rencontrer les professeurs, assister à des démonstrations en laboratoire et découvrir nos différents clubs. Inscriptions sur place pour l'année 2025-2026.",
    contentAr: "تنظم الثانوية يوم أبواب مفتوحة يوم السبت 15 نوفمبر من الساعة 9 صباحا إلى 5 مساء. سيتمكن أولياء الأمور والطلاب المستقبليون من زيارة منشآتنا ومقابلة المعلمين وحضور العروض التوضيحية في المختبر واكتشاف أنديتنا المختلفة. التسجيلات في الموقع للعام الدراسي 2025-2026.",
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
    contentFr: "Une convention de partenariat a été signée avec l'Université Hassan II de Casablanca. Nos élèves bénéficieront de journées d'orientation, de visites des facultés, et d'un accompagnement personnalisé pour leurs choix d'études supérieures.",
    contentAr: "تم توقيع اتفاقية شراكة مع جامعة الحسن الثاني بالدار البيضاء. سيستفيد طلابنا من أيام التوجيه وزيارات الكليات والمرافقة الشخصية لاختياراتهم في الدراسات العليا.",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
    category: "Partenariats",
    publishDate: "2024-09-25",
    author: "Service Orientation",
    enabled: true
  },
  {
    titleFr: "Festival culturel annuel - 5-7 décembre",
    titleAr: "المهرجان الثقافي السنوي - 5-7 ديسمبر",
    excerptFr: "Trois jours de célébration des arts et de la culture",
    excerptAr: "ثلاثة أيام من الاحتفال بالفنون والثقافة",
    contentFr: "Notre festival culturel annuel se tiendra du 5 au 7 décembre. Au programme: expositions d'art, pièces de théâtre, concerts musicaux, poésie, et démonstrations culinaires. Tous les clubs du lycée participeront à cet événement majeur.",
    contentAr: "سيقام مهرجاننا الثقافي السنوي من 5 إلى 7 ديسمبر. في البرنامج: معارض فنية ومسرحيات وحفلات موسيقية وشعر وعروض طهي. ستشارك جميع أندية الثانوية في هذا الحدث الكبير.",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    category: "Culture",
    publishDate: "2024-11-01",
    author: "Club Culturel",
    enabled: true
  },
  {
    titleFr: "Nouvelle bibliothèque numérique disponible",
    titleAr: "المكتبة الرقمية الجديدة متاحة",
    excerptFr: "Accès gratuit à 15,000 ressources en ligne",
    excerptAr: "وصول مجاني إلى 15000 مصدر عبر الإنترنت",
    contentFr: "La nouvelle bibliothèque numérique du lycée est maintenant accessible à tous les élèves. Elle comprend 15,000 livres électroniques, des revues scientifiques, des cours vidéo et des exercices interactifs. Connexion avec vos identifiants habituels.",
    contentAr: "أصبحت المكتبة الرقمية الجديدة للثانوية متاحة الآن لجميع الطلاب. تتضمن 15000 كتاب إلكتروني ومجلات علمية ودروس فيديو وتمارين تفاعلية. الدخول ببيانات الاعتماد المعتادة.",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    category: "Numérique",
    publishDate: "2024-10-12",
    author: "Bibliothèque",
    enabled: true
  },
  {
    titleFr: "Programme d'échange avec la France",
    titleAr: "برنامج تبادل مع فرنسا",
    excerptFr: "20 élèves sélectionnés pour un échange de 2 semaines",
    excerptAr: "تم اختيار 20 طالبا لبرنامج تبادل لمدة أسبوعين",
    contentFr: "20 de nos élèves auront la chance de participer à un programme d'échange avec le lycée Louis-le-Grand à Paris en mars 2025. Cette expérience enrichissante leur permettra de perfectionner leur français et de découvrir le système éducatif français.",
    contentAr: "سيتاح ل20 من طلابنا فرصة المشاركة في برنامج تبادل مع ثانوية لويس لوغران في باريس في مارس 2025. ستسمح لهم هذه التجربة الإثرائية بتحسين لغتهم الفرنسية واكتشاف النظام التعليمي الفرنسي.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    category: "International",
    publishDate: "2024-10-18",
    author: "Relations Internationales",
    enabled: true
  }
];

// ============================================
// 5. HOMEPAGE TESTIMONIALS (6 témoignages)
// ============================================
const testimonials = [
  {
    nameFr: "Amina El Fassi",
    nameAr: "أمينة الفاسي",
    roleFr: "Promotion 2023 - École Centrale Paris",
    roleAr: "دفعة 2023 - المدرسة المركزية باريس",
    contentFr: "Le lycée m'a donné les meilleures bases académiques et m'a appris la rigueur scientifique. Grâce à mes professeurs dévoués, j'ai pu intégrer l'une des meilleures écoles d'ingénieurs de France.",
    contentAr: "أعطتني الثانوية أفضل الأسس الأكاديمية وعلمتني الدقة العلمية. بفضل أساتذتي المتفانين، تمكنت من الالتحاق بواحدة من أفضل كليات الهندسة في فرنسا.",
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
    contentFr: "L'encadrement exceptionnel et les activités parascolaires m'ont permis de développer mes compétences et ma personnalité. Je suis fier d'être un ancien élève de ce lycée d'excellence.",
    contentAr: "الإشراف الاستثنائي والأنشطة اللاصفية سمحت لي بتطوير مهاراتي وشخصيتي. أنا فخور بكوني خريج هذه الثانوية المتميزة.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 5,
    enabled: true,
    order: 2
  },
  {
    nameFr: "Salma Idrissi",
    nameAr: "سلمى الإدريسي",
    roleFr: "Promotion 2024 - Classes Préparatoires",
    roleAr: "دفعة 2024 - الأقسام التحضيرية",
    contentFr: "Les laboratoires modernes et les cours de qualité m'ont préparée parfaitement aux classes préparatoires. Les professeurs sont toujours disponibles et encourageants.",
    contentAr: "المختبرات الحديثة والدروس عالية الجودة أعدتني بشكل مثالي للأقسام التحضيرية. الأساتذة متاحون دائما ومشجعون.",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    rating: 5,
    enabled: true,
    order: 3
  },
  {
    nameFr: "Karim Alaoui",
    nameAr: "كريم العلوي",
    roleFr: "Promotion 2021 - ENSAM Rabat",
    roleAr: "دفعة 2021 - المدرسة الوطنية للهندسة الرباط",
    contentFr: "Le lycée offre un environnement stimulant qui pousse à l'excellence. Les compétitions scientifiques m'ont permis de me dépasser et d'atteindre mes objectifs.",
    contentAr: "توفر الثانوية بيئة محفزة تدفع إلى التميز. المسابقات العلمية سمحت لي بتجاوز نفسي وتحقيق أهدافي.",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    rating: 5,
    enabled: true,
    order: 4
  },
  {
    nameFr: "Fatima Zahra Tazi",
    nameAr: "فاطمة الزهراء التازي",
    roleFr: "Promotion 2023 - Sciences Po Paris",
    roleAr: "دفعة 2023 - معهد العلوم السياسية باريس",
    contentFr: "Au-delà de l'excellence académique, le lycée m'a appris le leadership et l'engagement citoyen à travers les clubs et associations. Une expérience inoubliable!",
    contentAr: "بالإضافة إلى التميز الأكاديمي، علمتني الثانوية القيادة والمشاركة المدنية من خلال النوادي والجمعيات. تجربة لا تنسى!",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
    rating: 5,
    enabled: true,
    order: 5
  },
  {
    nameFr: "Omar Berrada",
    nameAr: "عمر براده",
    roleFr: "Promotion 2022 - École Polytechnique",
    roleAr: "دفعة 2022 - المدرسة متعددة التقنيات",
    contentFr: "La qualité de l'enseignement et le suivi personnalisé m'ont permis d'intégrer l'école de mes rêves. Merci à toute l'équipe pédagogique pour leur dévouement!",
    contentAr: "جودة التعليم والمتابعة الشخصية سمحت لي بالالتحاق بالمدرسة التي أحلم بها. شكرا لكل الطاقم التربوي على تفانيهم!",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    rating: 5,
    enabled: true,
    order: 6
  }
];

// ============================================
// 6. HOMEPAGE ANNOUNCEMENTS (8 annonces)
// ============================================
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
  },
  {
    titleFr: "Réunion parents-professeurs",
    titleAr: "اجتماع أولياء الأمور والمعلمين",
    dateFr: "Samedi 2 novembre à 14h",
    dateAr: "السبت 2 نوفمبر الساعة 2 مساء",
    urgent: false,
    enabled: true,
    order: 3
  },
  {
    titleFr: "Bibliothèque: Nouveaux horaires d'ouverture",
    titleAr: "المكتبة: أوقات فتح جديدة",
    dateFr: "7h-19h du lundi au samedi",
    dateAr: "7 صباحا - 7 مساء من الاثنين إلى السبت",
    urgent: false,
    enabled: true,
    order: 4
  },
  {
    titleFr: "Concours national des sciences",
    titleAr: "المسابقة الوطنية للعلوم",
    dateFr: "Inscriptions avant le 15 novembre",
    dateAr: "التسجيلات قبل 15 نوفمبر",
    urgent: false,
    enabled: true,
    order: 5
  },
  {
    titleFr: "Sortie pédagogique à Ifrane",
    titleAr: "رحلة تعليمية إلى إفران",
    dateFr: "12-14 décembre - Classes de 1ère",
    dateAr: "12-14 ديسمبر - طلاب السنة الأولى",
    urgent: false,
    enabled: true,
    order: 6
  },
  {
    titleFr: "Tournoi sportif inter-classes",
    titleAr: "بطولة رياضية بين الفصول",
    dateFr: "Du 20 au 27 novembre",
    dateAr: "من 20 إلى 27 نوفمبر",
    urgent: false,
    enabled: true,
    order: 7
  },
  {
    titleFr: "Séminaire sur l'orientation universitaire",
    titleAr: "ندوة حول التوجيه الجامعي",
    dateFr: "5 décembre à 15h - Amphithéâtre",
    dateAr: "5 ديسمبر الساعة 3 مساء - المدرج",
    urgent: false,
    enabled: true,
    order: 8
  }
];

// ============================================
// 7. HOMEPAGE CLUBS (10 clubs)
// ============================================
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
    nameFr: "Club Arts Plastiques",
    nameAr: "نادي الفنون التشكيلية",
    descriptionFr: "Peinture, sculpture et créations artistiques",
    descriptionAr: "الرسم والنحت والإبداعات الفنية",
    icon: "🎨",
    colorGradient: "from-pink-600 to-rose-600",
    enabled: true,
    order: 2
  },
  {
    nameFr: "Club Musique",
    nameAr: "نادي الموسيقى",
    descriptionFr: "Orchestre, chorale et instruments",
    descriptionAr: "الأوركسترا والكورال والآلات الموسيقية",
    icon: "🎵",
    colorGradient: "from-blue-600 to-cyan-600",
    enabled: true,
    order: 3
  },
  {
    nameFr: "Club Football",
    nameAr: "نادي كرة القدم",
    descriptionFr: "Entraînements et compétitions inter-lycées",
    descriptionAr: "التدريبات والمسابقات بين الثانويات",
    icon: "⚽",
    colorGradient: "from-green-600 to-emerald-600",
    enabled: true,
    order: 4
  },
  {
    nameFr: "Club Sciences",
    nameAr: "نادي العلوم",
    descriptionFr: "Expériences, robotique et projets scientifiques",
    descriptionAr: "التجارب والروبوتات والمشاريع العلمية",
    icon: "🔬",
    colorGradient: "from-indigo-600 to-purple-600",
    enabled: true,
    order: 5
  },
  {
    nameFr: "Club Lecture",
    nameAr: "نادي القراءة",
    descriptionFr: "Découverte littéraire et débats",
    descriptionAr: "الاكتشاف الأدبي والمناقشات",
    icon: "📚",
    colorGradient: "from-orange-600 to-amber-600",
    enabled: true,
    order: 6
  },
  {
    nameFr: "Club Jeux Vidéo",
    nameAr: "نادي ألعاب الفيديو",
    descriptionFr: "E-sport et développement de jeux",
    descriptionAr: "الرياضات الإلكترونية وتطوير الألعاب",
    icon: "🎮",
    colorGradient: "from-red-600 to-orange-600",
    enabled: true,
    order: 7
  },
  {
    nameFr: "Club Environnement",
    nameAr: "نادي البيئة",
    descriptionFr: "Actions écologiques et sensibilisation",
    descriptionAr: "الإجراءات البيئية والتوعية",
    icon: "🌍",
    colorGradient: "from-teal-600 to-green-600",
    enabled: true,
    order: 8
  },
  {
    nameFr: "Club Photographie",
    nameAr: "نادي التصوير الفوتوغرافي",
    descriptionFr: "Art photographique et expositions",
    descriptionAr: "فن التصوير الفوتوغرافي والمعارض",
    icon: "📷",
    colorGradient: "from-slate-600 to-gray-600",
    enabled: true,
    order: 9
  },
  {
    nameFr: "Club Débat",
    nameAr: "نادي المناظرة",
    descriptionFr: "Éloquence et argumentation",
    descriptionAr: "البلاغة والحجج",
    icon: "💬",
    colorGradient: "from-cyan-600 to-blue-600",
    enabled: true,
    order: 10
  }
];

// ============================================
// 8. HOMEPAGE GALLERY (12 images)
// ============================================
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
  },
  {
    titleFr: "Bibliothèque moderne",
    titleAr: "المكتبة الحديثة",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800",
    enabled: true,
    order: 3
  },
  {
    titleFr: "Salle informatique",
    titleAr: "قاعة الحاسوب",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    enabled: true,
    order: 4
  },
  {
    titleFr: "Terrain de sport",
    titleAr: "الملعب الرياضي",
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800",
    enabled: true,
    order: 5
  },
  {
    titleFr: "Amphithéâtre",
    titleAr: "المدرج",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    enabled: true,
    order: 6
  },
  {
    titleFr: "Salle de classe",
    titleAr: "قاعة الدراسة",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800",
    enabled: true,
    order: 7
  },
  {
    titleFr: "Laboratoire de physique",
    titleAr: "مختبر الفيزياء",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800",
    enabled: true,
    order: 8
  },
  {
    titleFr: "Cafétéria",
    titleAr: "الكافتيريا",
    imageUrl: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800",
    enabled: true,
    order: 9
  },
  {
    titleFr: "Cérémonie de remise des diplômes",
    titleAr: "حفل توزيع الشهادات",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
    enabled: true,
    order: 10
  },
  {
    titleFr: "Activités parascolaires",
    titleAr: "الأنشطة اللاصفية",
    imageUrl: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800",
    enabled: true,
    order: 11
  },
  {
    titleFr: "Festival culturel",
    titleAr: "المهرجان الثقافي",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    enabled: true,
    order: 12
  }
];

// ============================================
// 9. HOMEPAGE QUICK LINKS (10 liens)
// ============================================
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
  },
  {
    titleFr: "Orientation",
    titleAr: "التوجيه",
    url: "/orientation",
    icon: "MapIcon",
    enabled: true,
    order: 5
  },
  {
    titleFr: "Clubs & Activités",
    titleAr: "النوادي والأنشطة",
    url: "/clubs",
    icon: "UserGroupIcon",
    enabled: true,
    order: 6
  },
  {
    titleFr: "Bourses d'Études",
    titleAr: "المنح الدراسية",
    url: "/scholarships",
    icon: "AcademicCapIcon",
    enabled: true,
    order: 7
  },
  {
    titleFr: "Santé & Sécurité",
    titleAr: "الصحة والسلامة",
    url: "/health",
    icon: "HeartIcon",
    enabled: true,
    order: 8
  },
  {
    titleFr: "Transport Scolaire",
    titleAr: "النقل المدرسي",
    url: "/transport",
    icon: "TruckIcon",
    enabled: true,
    order: 9
  },
  {
    titleFr: "Contact & Support",
    titleAr: "الاتصال والدعم",
    url: "/contact",
    icon: "ChatBubbleLeftRightIcon",
    enabled: true,
    order: 10
  }
];

// ============================================
// 10. HOMEPAGE CONTACT INFO
// ============================================
const contactInfo = {
  addressFr: "Avenue Hassan II, Oujda 60000, Maroc",
  addressAr: "شارع الحسن الثاني، وجدة 60000، المغرب",
  phone: "+212 536 12 34 56",
  email: "contact@lycee-excellence.ma",
  hoursFr: "Lun-Ven: 8h-18h | Sam: 8h-13h",
  hoursAr: "الإثنين-الجمعة: 8ص-6م | السبت: 8ص-1م",
  updatedAt: new Date().toISOString()
};

// ============================================
// FONCTION PRINCIPALE
// ============================================
async function seedDatabase() {
  console.log("🚀 Démarrage de l'enrichissement de la base de données...\n");

  try {
    // 1. Homepage Hero
    console.log("📝 1/10 - Ajout du Hero Section...");
    await setDoc(doc(db, "homepage", "hero"), heroData);
    console.log("✅ Hero Section ajouté\n");

    // 2. Homepage Stats
    console.log("📊 2/10 - Ajout des Statistiques...");
    await setDoc(doc(db, "homepage", "stats"), statsData);
    console.log("✅ Statistiques ajoutées\n");

    // 3. Homepage Features
    console.log("⭐ 3/10 - Ajout des Features (" + features.length + " items)...");
    for (const feature of features) {
      await addDoc(collection(db, "homepage-features"), {
        ...feature,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("✅ " + features.length + " Features ajoutées\n");

    // 4. Homepage News
    console.log("📰 4/10 - Ajout des Actualités (" + news.length + " items)...");
    for (const article of news) {
      await addDoc(collection(db, "homepage-news"), {
        ...article,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("✅ " + news.length + " Actualités ajoutées\n");

    // 5. Homepage Testimonials
    console.log("💬 5/10 - Ajout des Témoignages (" + testimonials.length + " items)...");
    for (const testimonial of testimonials) {
      await addDoc(collection(db, "homepage-testimonials"), {
        ...testimonial,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("✅ " + testimonials.length + " Témoignages ajoutés\n");

    // 6. Homepage Announcements
    console.log("📢 6/10 - Ajout des Annonces (" + announcements.length + " items)...");
    for (const announcement of announcements) {
      await addDoc(collection(db, "homepage-announcements"), {
        ...announcement,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("✅ " + announcements.length + " Annonces ajoutées\n");

    // 7. Homepage Clubs
    console.log("🎭 7/10 - Ajout des Clubs (" + clubs.length + " items)...");
    for (const club of clubs) {
      await addDoc(collection(db, "homepage-clubs"), {
        ...club,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("✅ " + clubs.length + " Clubs ajoutés\n");

    // 8. Homepage Gallery
    console.log("🖼️  8/10 - Ajout de la Galerie (" + gallery.length + " images)...");
    for (const image of gallery) {
      await addDoc(collection(db, "homepage-gallery"), {
        ...image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("✅ " + gallery.length + " Images ajoutées\n");

    // 9. Homepage Quick Links
    console.log("🔗 9/10 - Ajout des Liens Rapides (" + quickLinks.length + " items)...");
    for (const link of quickLinks) {
      await addDoc(collection(db, "homepage-quicklinks"), {
        ...link,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log("✅ " + quickLinks.length + " Liens Rapides ajoutés\n");

    // 10. Homepage Contact Info
    console.log("📞 10/10 - Ajout des Informations de Contact...");
    await setDoc(doc(db, "homepage", "contact"), contactInfo);
    console.log("✅ Contact Info ajouté\n");

    console.log("═══════════════════════════════════════════════════");
    console.log("🎉 BASE DE DONNÉES ENRICHIE AVEC SUCCÈS!");
    console.log("═══════════════════════════════════════════════════\n");
    
    console.log("📊 RÉSUMÉ:");
    console.log("   • Hero Section: 1 document");
    console.log("   • Statistiques: 1 document");
    console.log("   • Features: " + features.length + " documents");
    console.log("   • Actualités: " + news.length + " documents");
    console.log("   • Témoignages: " + testimonials.length + " documents");
    console.log("   • Annonces: " + announcements.length + " documents");
    console.log("   • Clubs: " + clubs.length + " documents");
    console.log("   • Galerie: " + gallery.length + " images");
    console.log("   • Liens Rapides: " + quickLinks.length + " documents");
    console.log("   • Contact Info: 1 document");
    console.log("   ───────────────────────────────────────────");
    console.log("   TOTAL: " + (features.length + news.length + testimonials.length + announcements.length + clubs.length + gallery.length + quickLinks.length + 3) + " documents créés ✅\n");

    console.log("🌐 Visitez votre site pour voir les nouvelles données!");
    process.exit(0);

  } catch (error) {
    console.error("❌ ERREUR lors de l'enrichissement:", error);
    process.exit(1);
  }
}

// Exécuter le script
seedDatabase();
