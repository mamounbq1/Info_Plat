import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

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

// Sample courses data
const sampleCourses = [
  {
    titleFr: "Algèbre Linéaire Avancée",
    titleAr: "الجبر الخطي المتقدم",
    descriptionFr: "Apprenez les concepts avancés de l'algèbre linéaire: matrices, espaces vectoriels, et applications",
    descriptionAr: "تعلم المفاهيم المتقدمة في الجبر الخطي: المصفوفات، الفضاءات الشعاعية، والتطبيقات",
    category: "mathematics",
    level: "advanced",
    duration: 40,
    published: true,
    enrollmentCount: 156,
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Introduction à la Physique Quantique",
    titleAr: "مقدمة في الفيزياء الكمية",
    descriptionFr: "Découvrez les principes fondamentaux de la mécanique quantique et ses applications",
    descriptionAr: "اكتشف المبادئ الأساسية للميكانيكا الكمية وتطبيقاتها",
    category: "physics",
    level: "intermediate",
    duration: 35,
    published: true,
    enrollmentCount: 203,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Chimie Organique - Niveau 1",
    titleAr: "الكيمياء العضوية - المستوى 1",
    descriptionFr: "Maîtrisez les bases de la chimie organique: hydrocarbures, groupes fonctionnels et réactions",
    descriptionAr: "أتقن أساسيات الكيمياء العضوية: الهيدروكربونات، المجموعات الوظيفية والتفاعلات",
    category: "chemistry",
    level: "beginner",
    duration: 30,
    published: true,
    enrollmentCount: 89,
    thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Biologie Cellulaire et Moléculaire",
    titleAr: "البيولوجيا الخلوية والجزيئية",
    descriptionFr: "Explorez la structure et les fonctions des cellules, ADN, ARN et protéines",
    descriptionAr: "استكشف بنية ووظائف الخلايا، الحمض النووي، الحمض النووي الريبي والبروتينات",
    category: "biology",
    level: "intermediate",
    duration: 45,
    published: true,
    enrollmentCount: 178,
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Programmation Python - Débutant",
    titleAr: "برمجة بايثون - للمبتدئين",
    descriptionFr: "Apprenez les bases de la programmation avec Python: variables, boucles, fonctions",
    descriptionAr: "تعلم أساسيات البرمجة باستخدام بايثون: المتغيرات، الحلقات، الدوال",
    category: "computer",
    level: "beginner",
    duration: 25,
    published: true,
    enrollmentCount: 342,
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Intelligence Artificielle et Machine Learning",
    titleAr: "الذكاء الاصطناعي والتعلم الآلي",
    descriptionFr: "Découvrez les algorithmes d'IA, réseaux de neurones et apprentissage profond",
    descriptionAr: "اكتشف خوارزميات الذكاء الاصطناعي، الشبكات العصبية والتعلم العميق",
    category: "computer",
    level: "advanced",
    duration: 50,
    published: true,
    enrollmentCount: 267,
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Langue Française - Grammaire Avancée",
    titleAr: "اللغة الفرنسية - القواعد المتقدمة",
    descriptionFr: "Perfectionnez votre français: temps verbaux, subjonctif, concordance des temps",
    descriptionAr: "أتقن لغتك الفرنسية: الأزمنة الفعلية، صيغة الشرط، توافق الأزمنة",
    category: "languages",
    level: "advanced",
    duration: 28,
    published: true,
    enrollmentCount: 134,
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Histoire du Maroc Contemporain",
    titleAr: "تاريخ المغرب المعاصر",
    descriptionFr: "Explorez l'histoire du Maroc du protectorat à l'indépendance et au-delà",
    descriptionAr: "استكشف تاريخ المغرب من الحماية إلى الاستقلال وما بعده",
    category: "history",
    level: "intermediate",
    duration: 20,
    published: true,
    enrollmentCount: 198,
    thumbnail: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Géographie Physique du Maroc",
    titleAr: "الجغرافيا الطبيعية للمغرب",
    descriptionFr: "Découvrez les reliefs, climats et ressources naturelles du Maroc",
    descriptionAr: "اكتشف التضاريس والمناخات والموارد الطبيعية للمغرب",
    category: "geography",
    level: "beginner",
    duration: 18,
    published: true,
    enrollmentCount: 87,
    thumbnail: "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Philosophie et Pensée Critique",
    titleAr: "الفلسفة والتفكير النقدي",
    descriptionFr: "Développez votre esprit critique à travers les grands courants philosophiques",
    descriptionAr: "طور تفكيرك النقدي من خلال التيارات الفلسفية الكبرى",
    category: "philosophy",
    level: "intermediate",
    duration: 32,
    published: true,
    enrollmentCount: 145,
    thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Calcul Différentiel et Intégral",
    titleAr: "حساب التفاضل والتكامل",
    descriptionFr: "Maîtrisez les dérivées, intégrales et leurs applications pratiques",
    descriptionAr: "أتقن المشتقات والتكاملات وتطبيقاتها العملية",
    category: "mathematics",
    level: "intermediate",
    duration: 38,
    published: true,
    enrollmentCount: 211,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Électromagnétisme - Théorie et Applications",
    titleAr: "الكهرومغناطيسية - النظرية والتطبيقات",
    descriptionFr: "Comprenez les champs électriques, magnétiques et les ondes électromagnétiques",
    descriptionAr: "افهم المجالات الكهربائية والمغناطيسية والموجات الكهرومغناطيسية",
    category: "physics",
    level: "advanced",
    duration: 42,
    published: true,
    enrollmentCount: 93,
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Développement Web Full Stack",
    titleAr: "تطوير الويب الكامل",
    descriptionFr: "Créez des applications web complètes avec React, Node.js et MongoDB",
    descriptionAr: "أنشئ تطبيقات ويب كاملة باستخدام React و Node.js و MongoDB",
    category: "computer",
    level: "intermediate",
    duration: 55,
    published: true,
    enrollmentCount: 289,
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Anglais des Affaires - Niveau Avancé",
    titleAr: "الإنجليزية للأعمال - المستوى المتقدم",
    descriptionFr: "Perfectionnez votre anglais professionnel: présentations, négociations, emails",
    descriptionAr: "أتقن لغتك الإنجليزية المهنية: العروض التقديمية، المفاوضات، رسائل البريد الإلكتروني",
    category: "languages",
    level: "advanced",
    duration: 30,
    published: true,
    enrollmentCount: 176,
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop"
  },
  {
    titleFr: "Géométrie Analytique",
    titleAr: "الهندسة التحليلية",
    descriptionFr: "Étudiez les courbes, surfaces et leurs équations dans l'espace",
    descriptionAr: "ادرس المنحنيات والأسطح ومعادلاتها في الفضاء",
    category: "mathematics",
    level: "beginner",
    duration: 22,
    published: true,
    enrollmentCount: 112,
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop"
  }
];

async function addCourses() {
  console.log('🚀 Starting to add courses to Firebase...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sampleCourses.length; i++) {
    const course = sampleCourses[i];
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'courses'), {
        ...course,
        createdAt: now,
        updatedAt: now
      });
      
      successCount++;
      console.log(`✅ [${successCount}/${sampleCourses.length}] Added: ${course.titleFr}`);
      console.log(`   ID: ${docRef.id}`);
      console.log(`   Category: ${course.category} | Level: ${course.level} | Enrollments: ${course.enrollmentCount}\n`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error adding course "${course.titleFr}":`, error.message, '\n');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   ✅ Successfully added: ${successCount} courses`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📚 Total processed: ${sampleCourses.length}`);
  console.log('='.repeat(60));
}

// Run the script
addCourses()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
