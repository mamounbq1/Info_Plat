const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Firebase config for eduinfor-fff3d project
const firebaseConfig = {
  apiKey: "AIzaSyBhp2UOv8m9y0ZW1XFRw4nBt-n-l9guedc",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "960025808439",
  appId: "1:960025808439:web:5aad744488b9a855da79b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleEvents = [
  {
    titleFr: 'Journée Portes Ouvertes',
    titleAr: 'يوم الأبواب المفتوحة',
    descriptionFr: 'Venez découvrir notre établissement et rencontrer nos enseignants',
    descriptionAr: 'تعال واكتشف مؤسستنا وقابل معلمينا',
    dateFr: '15 Novembre 2025',
    dateAr: '15 نوفمبر 2025',
    timeFr: '09:00 - 16:00',
    timeAr: '09:00 - 16:00',
    locationFr: 'Campus Principal',
    locationAr: 'الحرم الرئيسي',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
    featured: true,
    enabled: true,
    order: 0,
    createdAt: new Date().toISOString()
  },
  {
    titleFr: 'Compétition Sportive Inter-Classes',
    titleAr: 'المسابقة الرياضية بين الفصول',
    descriptionFr: 'Tournoi de football entre les classes - Tous les élèves sont invités',
    descriptionAr: 'بطولة كرة القدم بين الفصول - جميع الطلاب مدعوون',
    dateFr: '20 Novembre 2025',
    dateAr: '20 نوفمبر 2025',
    timeFr: '14:00 - 17:00',
    timeAr: '14:00 - 17:00',
    locationFr: 'Terrain de Sport',
    locationAr: 'الملعب الرياضي',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    featured: false,
    enabled: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    titleFr: 'Exposition Scientifique',
    titleAr: 'المعرض العلمي',
    descriptionFr: 'Présentation des projets scientifiques des élèves - Venez voir les innovations',
    descriptionAr: 'عرض المشاريع العلمية للطلاب - تعال وشاهد الابتكارات',
    dateFr: '25 Novembre 2025',
    dateAr: '25 نوفمبر 2025',
    timeFr: '10:00 - 15:00',
    timeAr: '10:00 - 15:00',
    locationFr: 'Salle des Conférences',
    locationAr: 'قاعة المؤتمرات',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    featured: false,
    enabled: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    titleFr: 'Cérémonie de Remise des Prix',
    titleAr: 'حفل توزيع الجوائز',
    descriptionFr: 'Célébration des meilleurs élèves de l\'année - Présence des parents souhaitée',
    descriptionAr: 'الاحتفال بأفضل طلاب السنة - يرجى حضور أولياء الأمور',
    dateFr: '5 Décembre 2025',
    dateAr: '5 ديسمبر 2025',
    timeFr: '15:00 - 18:00',
    timeAr: '15:00 - 18:00',
    locationFr: 'Amphithéâtre',
    locationAr: 'المدرج',
    imageUrl: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800',
    featured: true,
    enabled: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    titleFr: 'Atelier de Robotique',
    titleAr: 'ورشة الروبوتات',
    descriptionFr: 'Atelier pratique de construction et programmation de robots',
    descriptionAr: 'ورشة عملية لبناء وبرمجة الروبوتات',
    dateFr: '10 Décembre 2025',
    dateAr: '10 ديسمبر 2025',
    timeFr: '13:00 - 16:00',
    timeAr: '13:00 - 16:00',
    locationFr: 'Laboratoire Informatique',
    locationAr: 'مختبر الحاسوب',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    featured: false,
    enabled: true,
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    titleFr: 'Sortie Éducative au Musée',
    titleAr: 'رحلة تعليمية إلى المتحف',
    descriptionFr: 'Visite guidée du Musée National d\'Histoire - Inscription obligatoire',
    descriptionAr: 'جولة مصحوبة بمرشدين في المتحف الوطني للتاريخ - التسجيل إلزامي',
    dateFr: '15 Décembre 2025',
    dateAr: '15 ديسمبر 2025',
    timeFr: '08:00 - 14:00',
    timeAr: '08:00 - 14:00',
    locationFr: 'Départ Campus - Destination: Musée National',
    locationAr: 'المغادرة من الحرم - الوجهة: المتحف الوطني',
    imageUrl: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800',
    featured: false,
    enabled: true,
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    titleFr: 'Concert de Musique de Fin d\'Année',
    titleAr: 'حفل موسيقى نهاية العام',
    descriptionFr: 'Performance musicale des élèves - Entrée gratuite pour tous',
    descriptionAr: 'أداء موسيقي للطلاب - الدخول مجاني للجميع',
    dateFr: '20 Décembre 2025',
    dateAr: '20 ديسمبر 2025',
    timeFr: '18:00 - 20:00',
    timeAr: '18:00 - 20:00',
    locationFr: 'Salle Polyvalente',
    locationAr: 'القاعة متعددة الأغراض',
    imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800',
    featured: false,
    enabled: true,
    order: 6,
    createdAt: new Date().toISOString()
  },
  {
    titleFr: 'Inscription Nouveaux Élèves 2026',
    titleAr: 'تسجيل الطلاب الجدد 2026',
    descriptionFr: 'Période d\'inscription pour l\'année scolaire 2026 - Documents requis',
    descriptionAr: 'فترة التسجيل للسنة الدراسية 2026 - الوثائق المطلوبة',
    dateFr: '6-10 Janvier 2026',
    dateAr: '6-10 يناير 2026',
    timeFr: '09:00 - 16:00',
    timeAr: '09:00 - 16:00',
    locationFr: 'Bureau des Admissions',
    locationAr: 'مكتب القبول',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    featured: true,
    enabled: true,
    order: 7,
    createdAt: new Date().toISOString()
  }
];

async function seedEvents() {
  try {
    console.log('🌱 Starting to seed events to Firestore...\n');
    
    // Check existing events
    const eventsSnapshot = await getDocs(collection(db, 'homepage-events'));
    console.log(`📦 Current events in database: ${eventsSnapshot.size}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of sampleEvents) {
      try {
        await addDoc(collection(db, 'homepage-events'), event);
        console.log(`✅ Added: ${event.titleFr}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add ${event.titleFr}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully added: ${successCount} events`);
    console.log(`❌ Failed: ${errorCount} events`);
    console.log(`📦 Previous count: ${eventsSnapshot.size} events`);
    console.log(`📦 New total: ${eventsSnapshot.size + successCount} events`);
    console.log('='.repeat(60));
    
    console.log('\n🎉 Seeding complete!');
    console.log('\n📍 Next steps:');
    console.log('   1. Go to: https://your-app-url/admin-dashboard');
    console.log('   2. Navigate to: Contenu du Site → Actualités & Contenu → Événements');
    console.log('   3. You should see all 8 events there! 🎊\n');
    
  } catch (error) {
    console.error('\n❌ ERROR during seeding:');
    console.error(error);
    console.log('\n⚠️  This might be a permissions issue.');
    console.log('💡 Make sure Firestore rules allow write access to homepage-events collection');
  } finally {
    process.exit(0);
  }
}

// Run the seeder
console.log('🚀 Events Seeder - Starting...\n');
seedEvents();
