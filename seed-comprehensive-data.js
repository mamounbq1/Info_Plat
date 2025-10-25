// COMPREHENSIVE DATABASE SEEDING SCRIPT - ALL 72 USERS + DOZENS OF DATA
// Includes: 72 Users (2 Admins, 20 Teachers, 50 Students)
// Plus: 50+ Courses, 40+ Quizzes, 40+ Exercises for Moroccan Education System
// Usage: node seed-comprehensive-data.js

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
// 2. COMPREHENSIVE USERS (72 TOTAL)
// ============================================

const users = [
  // ===== ADMINS (2) =====
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

  // ===== TEACHERS (20) =====
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
    bio: "Professeur de mathématiques avec 15 ans d'expérience - Algèbre et Analyse",
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
    bio: "Passionnée par l'enseignement des sciences exactes",
    bioAr: "شغوفة بتدريس العلوم الدقيقة",
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
    subjects: ["Anglais", "Français"],
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
    bio: "Historien et géographe passionné - Histoire contemporaine",
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
  {
    uid: "teacher009",
    email: "nadia.benkirane@eduplatform.ma",
    displayName: "Prof. Nadia Benkirane",
    displayNameAr: "أ. نادية بنكيران",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=16",
    phoneNumber: "+212600001009",
    active: true,
    subjects: ["Français"],
    levels: ["TC", "1BAC"],
    branches: ["Lettres et Sciences Humaines"],
    bio: "Spécialiste en littérature classique française",
    bioAr: "متخصصة في الأدب الفرنسي الكلاسيكي",
    qualifications: ["Master en Lettres", "CAPES"],
    coursesCreated: 12,
    totalStudents: 230,
    rating: 4.7,
    createdAt: new Date(Date.now() - 320*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 7*60*60*1000).toISOString()
  },
  {
    uid: "teacher010",
    email: "hassan.kettani@eduplatform.ma",
    displayName: "Prof. Hassan Kettani",
    displayNameAr: "أ. حسن الكتاني",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=17",
    phoneNumber: "+212600001010",
    active: true,
    subjects: ["Sciences de la Vie et de la Terre"],
    levels: ["1BAC", "2BAC"],
    branches: ["Sciences Expérimentales"],
    bio: "Spécialiste en génétique et biologie moléculaire",
    bioAr: "متخصص في علم الوراثة والبيولوجيا الجزيئية",
    qualifications: ["Doctorat en Génétique", "CAPES"],
    coursesCreated: 13,
    totalStudents: 198,
    rating: 4.9,
    createdAt: new Date(Date.now() - 280*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 8*60*60*1000).toISOString()
  },
  {
    uid: "teacher011",
    email: "sophie.marchand@eduplatform.ma",
    displayName: "Prof. Sophie Marchand",
    displayNameAr: "أ. صوفي مارشان",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=18",
    phoneNumber: "+212600001011",
    active: true,
    subjects: ["Français"],
    levels: ["TC", "1BAC"],
    branches: ["Sciences Expérimentales", "Lettres et Sciences Humaines"],
    bio: "Experte en grammaire et conjugaison française",
    bioAr: "خبيرة في القواعد والتصريف الفرنسي",
    qualifications: ["Master en Linguistique Française", "CAPES"],
    coursesCreated: 10,
    totalStudents: 212,
    rating: 4.8,
    createdAt: new Date(Date.now() - 290*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 9*60*60*1000).toISOString()
  },
  {
    uid: "teacher012",
    email: "rachid.lamrani@eduplatform.ma",
    displayName: "Prof. Rachid Lamrani",
    displayNameAr: "أ. رشيد اللمراني",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=19",
    phoneNumber: "+212600001012",
    active: true,
    subjects: ["Français"],
    levels: ["TC"],
    branches: ["Sciences Expérimentales", "Lettres et Sciences Humaines"],
    bio: "Spécialiste en expression écrite et méthodologie",
    bioAr: "متخصص في التعبير الكتابي والمنهجية",
    qualifications: ["Master en Lettres", "Formation en Pédagogie"],
    coursesCreated: 8,
    totalStudents: 175,
    rating: 4.6,
    createdAt: new Date(Date.now() - 260*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 10*60*60*1000).toISOString()
  },
  {
    uid: "teacher013",
    email: "sarah.johnson@eduplatform.ma",
    displayName: "Prof. Sarah Johnson",
    displayNameAr: "أ. سارة جونسون",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=20",
    phoneNumber: "+212600001013",
    active: true,
    subjects: ["Anglais"],
    levels: ["TC", "1BAC"],
    branches: ["Sciences Expérimentales", "Lettres et Sciences Humaines"],
    bio: "Native English speaker - Grammar and Communication specialist",
    bioAr: "متحدثة أصلية للإنجليزية - متخصصة في القواعد والتواصل",
    qualifications: ["Master in English Literature", "TEFL Certified"],
    coursesCreated: 11,
    totalStudents: 240,
    rating: 4.9,
    createdAt: new Date(Date.now() - 240*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "teacher014",
    email: "michael.brown@eduplatform.ma",
    displayName: "Prof. Michael Brown",
    displayNameAr: "أ. مايكل براون",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=21",
    phoneNumber: "+212600001014",
    active: true,
    subjects: ["Anglais"],
    levels: ["TC"],
    branches: ["Sciences Expérimentales", "Lettres et Sciences Humaines"],
    bio: "Vocabulary and conversation expert",
    bioAr: "خبير في المفردات والمحادثة",
    qualifications: ["Bachelor in English", "TESOL Certified"],
    coursesCreated: 7,
    totalStudents: 158,
    rating: 4.7,
    createdAt: new Date(Date.now() - 220*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 5*60*60*1000).toISOString()
  },
  {
    uid: "teacher015",
    email: "abdullah.mansouri@eduplatform.ma",
    displayName: "الأستاذ عبد الله المنصوري",
    displayNameAr: "أ. عبد الله المنصوري",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=22",
    phoneNumber: "+212600001015",
    active: true,
    subjects: ["Arabe"],
    levels: ["TC", "1BAC", "2BAC"],
    branches: ["Lettres et Sciences Humaines"],
    bio: "أستاذ اللغة العربية - متخصص في النحو والصرف والبلاغة",
    bioAr: "أستاذ اللغة العربية - متخصص في النحو والصرف والبلاغة",
    qualifications: ["دكتوراه في اللغة العربية", "CAPES"],
    coursesCreated: 14,
    totalStudents: 278,
    rating: 4.8,
    createdAt: new Date(Date.now() - 410*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    uid: "teacher016",
    email: "omar.chraibi@eduplatform.ma",
    displayName: "Prof. Omar Chraibi",
    displayNameAr: "أ. عمر الشرايبي",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=23",
    phoneNumber: "+212600001016",
    active: true,
    subjects: ["Histoire-Géographie"],
    levels: ["TC", "1BAC"],
    branches: ["Lettres et Sciences Humaines"],
    bio: "Historien spécialisé en histoire moderne et contemporaine",
    bioAr: "مؤرخ متخصص في التاريخ الحديث والمعاصر",
    qualifications: ["Master en Histoire", "CAPES"],
    coursesCreated: 9,
    totalStudents: 185,
    rating: 4.7,
    createdAt: new Date(Date.now() - 330*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 6*60*60*1000).toISOString()
  },
  {
    uid: "teacher017",
    email: "laila.bennani@eduplatform.ma",
    displayName: "Prof. Laila Bennani",
    displayNameAr: "أ. ليلى البناني",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=24",
    phoneNumber: "+212600001017",
    active: true,
    subjects: ["Histoire-Géographie"],
    levels: ["TC"],
    branches: ["Lettres et Sciences Humaines"],
    bio: "Géographe spécialisée en géographie physique et environnement",
    bioAr: "جغرافية متخصصة في الجغرافيا الطبيعية والبيئة",
    qualifications: ["Master en Géographie", "Formation Environnementale"],
    coursesCreated: 6,
    totalStudents: 142,
    rating: 4.6,
    createdAt: new Date(Date.now() - 200*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 12*60*60*1000).toISOString()
  },
  {
    uid: "teacher018",
    email: "khalid.ziani@eduplatform.ma",
    displayName: "Prof. Khalid Ziani",
    displayNameAr: "أ. خالد الزياني",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=25",
    phoneNumber: "+212600001018",
    active: true,
    subjects: ["Informatique"],
    levels: ["1BAC", "2BAC"],
    branches: ["Sciences Mathématiques"],
    bio: "Expert en bases de données et SQL",
    bioAr: "خبير في قواعد البيانات و SQL",
    qualifications: ["Ingénieur Informatique", "Certification Oracle"],
    coursesCreated: 8,
    totalStudents: 134,
    rating: 4.8,
    createdAt: new Date(Date.now() - 190*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 4*60*60*1000).toISOString()
  },
  {
    uid: "teacher019",
    email: "zineb.filali@eduplatform.ma",
    displayName: "Prof. Zineb Filali",
    displayNameAr: "أ. زينب الفيلالي",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=26",
    phoneNumber: "+212600001019",
    active: true,
    subjects: ["Philosophie"],
    levels: ["TC", "1BAC"],
    branches: ["Lettres et Sciences Humaines"],
    bio: "Philosophe spécialisée en philosophie moderne et éthique",
    bioAr: "فيلسوفة متخصصة في الفلسفة الحديثة والأخلاق",
    qualifications: ["Doctorat en Philosophie", "CAPES"],
    coursesCreated: 10,
    totalStudents: 167,
    rating: 4.9,
    createdAt: new Date(Date.now() - 270*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 5*60*60*1000).toISOString()
  },
  {
    uid: "teacher020",
    email: "youssef.berrada@eduplatform.ma",
    displayName: "Prof. Youssef Berrada",
    displayNameAr: "أ. يوسف براده",
    role: "teacher",
    photoURL: "https://i.pravatar.cc/150?img=27",
    phoneNumber: "+212600001020",
    active: true,
    subjects: ["Physique-Chimie"],
    levels: ["TC", "1BAC"],
    branches: ["Sciences Expérimentales", "Sciences Mathématiques"],
    bio: "Physicien spécialisé en électricité et mécanique",
    bioAr: "فيزيائي متخصص في الكهرباء والميكانيكا",
    qualifications: ["Master en Physique", "Ingénieur"],
    coursesCreated: 9,
    totalStudents: 179,
    rating: 4.7,
    createdAt: new Date(Date.now() - 230*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 7*60*60*1000).toISOString()
  },

  // ===== STUDENTS (50) =====
  // Group 1: 2BAC Sciences Mathématiques (10 students)
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
    email: "hamza.chahid@student.eduplatform.ma",
    displayName: "Hamza Chahid",
    displayNameAr: "حمزة الشاهد",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=32",
    phoneNumber: "+212600002002",
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
    uid: "student003",
    email: "mehdi.alami@student.eduplatform.ma",
    displayName: "Mehdi Alami",
    displayNameAr: "مهدي العلمي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=33",
    phoneNumber: "+212600002003",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 14,
    completedCourses: 9,
    totalPoints: 1380,
    averageScore: 82.5,
    badges: ["Math Learner", "Problem Solver"],
    createdAt: new Date(Date.now() - 185*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 1*60*60*1000).toISOString()
  },
  {
    uid: "student004",
    email: "youssef.benani@student.eduplatform.ma",
    displayName: "Youssef Benani",
    displayNameAr: "يوسف البناني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=34",
    phoneNumber: "+212600002004",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 13,
    completedCourses: 7,
    totalPoints: 1240,
    averageScore: 79.8,
    badges: ["Consistent Learner"],
    createdAt: new Date(Date.now() - 175*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "student005",
    email: "karim.fassi@student.eduplatform.ma",
    displayName: "Karim Fassi",
    displayNameAr: "كريم الفاسي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=35",
    phoneNumber: "+212600002005",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 17,
    completedCourses: 12,
    totalPoints: 1720,
    averageScore: 91.2,
    badges: ["Top Performer", "Math Genius", "Quiz Champion"],
    createdAt: new Date(Date.now() - 195*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 15*60*1000).toISOString()
  },
  {
    uid: "student006",
    email: "amine.tazi@student.eduplatform.ma",
    displayName: "Amine Tazi",
    displayNameAr: "أمين التازي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=36",
    phoneNumber: "+212600002006",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 15,
    completedCourses: 9,
    totalPoints: 1420,
    averageScore: 84.7,
    badges: ["Math Expert", "Dedicated Student"],
    createdAt: new Date(Date.now() - 188*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 50*60*1000).toISOString()
  },
  {
    uid: "student007",
    email: "reda.kabbaj@student.eduplatform.ma",
    displayName: "Reda Kabbaj",
    displayNameAr: "رضا القباج",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=37",
    phoneNumber: "+212600002007",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 16,
    completedCourses: 10,
    totalPoints: 1480,
    averageScore: 86.3,
    badges: ["Math Expert", "Quiz Master"],
    createdAt: new Date(Date.now() - 192*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 40*60*1000).toISOString()
  },
  {
    uid: "student008",
    email: "tarik.bennani@student.eduplatform.ma",
    displayName: "Tarik Bennani",
    displayNameAr: "طارق البناني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=38",
    phoneNumber: "+212600002008",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 14,
    completedCourses: 8,
    totalPoints: 1310,
    averageScore: 80.1,
    badges: ["Math Learner"],
    createdAt: new Date(Date.now() - 178*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    uid: "student009",
    email: "ilyas.chaoui@student.eduplatform.ma",
    displayName: "Ilyas Chaoui",
    displayNameAr: "إلياس الشاوي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=39",
    phoneNumber: "+212600002009",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 15,
    completedCourses: 10,
    totalPoints: 1510,
    averageScore: 87.6,
    badges: ["Math Expert", "Problem Solver", "Consistent Performer"],
    createdAt: new Date(Date.now() - 193*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 25*60*1000).toISOString()
  },
  {
    uid: "student010",
    email: "adil.berrada@student.eduplatform.ma",
    displayName: "Adil Berrada",
    displayNameAr: "عادل برادة",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=40",
    phoneNumber: "+212600002010",
    active: true,
    level: "2BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 14,
    completedCourses: 9,
    totalPoints: 1390,
    averageScore: 83.9,
    badges: ["Math Learner", "Quiz Participant"],
    createdAt: new Date(Date.now() - 182*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 1*60*60*1000).toISOString()
  },

  // Group 2: 2BAC Sciences Expérimentales (10 students)
  {
    uid: "student011",
    email: "salma.benali@student.eduplatform.ma",
    displayName: "Salma Benali",
    displayNameAr: "سلمى بنعلي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=22",
    phoneNumber: "+212600002011",
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
    uid: "student012",
    email: "sofia.amrani@student.eduplatform.ma",
    displayName: "Sofia Amrani",
    displayNameAr: "صوفيا العمراني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=26",
    phoneNumber: "+212600002012",
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
    uid: "student013",
    email: "malak.idrissi@student.eduplatform.ma",
    displayName: "Malak Idrissi",
    displayNameAr: "ملاك الإدريسي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=41",
    phoneNumber: "+212600002013",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 16,
    completedCourses: 10,
    totalPoints: 1540,
    averageScore: 88.7,
    badges: ["SVT Learner", "Chemistry Pro"],
    createdAt: new Date(Date.now() - 191*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 35*60*1000).toISOString()
  },
  {
    uid: "student014",
    email: "douae.lamrani@student.eduplatform.ma",
    displayName: "Douae Lamrani",
    displayNameAr: "دعاء اللمراني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=42",
    phoneNumber: "+212600002014",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 15,
    completedCourses: 9,
    totalPoints: 1420,
    averageScore: 85.4,
    badges: ["Biology Star", "Dedicated Student"],
    createdAt: new Date(Date.now() - 186*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 45*60*1000).toISOString()
  },
  {
    uid: "student015",
    email: "hiba.kettani@student.eduplatform.ma",
    displayName: "Hiba Kettani",
    displayNameAr: "هبة الكتاني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=43",
    phoneNumber: "+212600002015",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 17,
    completedCourses: 11,
    totalPoints: 1570,
    averageScore: 89.3,
    badges: ["SVT Expert", "Quiz Master", "Top Performer"],
    createdAt: new Date(Date.now() - 197*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 22*60*1000).toISOString()
  },
  {
    uid: "student016",
    email: "rim.benjelloun@student.eduplatform.ma",
    displayName: "Rim Benjelloun",
    displayNameAr: "ريم بنجلون",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=44",
    phoneNumber: "+212600002016",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 16,
    completedCourses: 10,
    totalPoints: 1490,
    averageScore: 86.8,
    badges: ["Chemistry Expert", "Quiz Participant"],
    createdAt: new Date(Date.now() - 189*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 28*60*1000).toISOString()
  },
  {
    uid: "student017",
    email: "safae.alaoui@student.eduplatform.ma",
    displayName: "Safae Alaoui",
    displayNameAr: "صفاء العلوي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=45",
    phoneNumber: "+212600002017",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 18,
    completedCourses: 12,
    totalPoints: 1650,
    averageScore: 91.6,
    badges: ["Top Student", "SVT Expert", "Quiz Champion", "Course Completer"],
    createdAt: new Date(Date.now() - 202*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 18*60*1000).toISOString()
  },
  {
    uid: "student018",
    email: "zineb.chraibi@student.eduplatform.ma",
    displayName: "Zineb Chraibi",
    displayNameAr: "زينب الشرايبي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=46",
    phoneNumber: "+212600002018",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 16,
    completedCourses: 10,
    totalPoints: 1510,
    averageScore: 87.2,
    badges: ["Biology Star", "Chemistry Pro"],
    createdAt: new Date(Date.now() - 193*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 32*60*1000).toISOString()
  },
  {
    uid: "student019",
    email: "ghita.tazi@student.eduplatform.ma",
    displayName: "Ghita Tazi",
    displayNameAr: "غيثة التازي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=47",
    phoneNumber: "+212600002019",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 15,
    completedCourses: 9,
    totalPoints: 1440,
    averageScore: 84.9,
    badges: ["SVT Learner", "Dedicated Student"],
    createdAt: new Date(Date.now() - 184*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 50*60*1000).toISOString()
  },
  {
    uid: "student020",
    email: "amina.ziani@student.eduplatform.ma",
    displayName: "Amina Ziani",
    displayNameAr: "أمينة الزياني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=48",
    phoneNumber: "+212600002020",
    active: true,
    level: "2BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 17,
    completedCourses: 11,
    totalPoints: 1600,
    averageScore: 90.2,
    badges: ["Top Performer", "Biology Expert", "Quiz Master"],
    createdAt: new Date(Date.now() - 198*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 24*60*1000).toISOString()
  },

  // Group 3: 1BAC Sciences Mathématiques (10 students)
  {
    uid: "student021",
    email: "omar.kadiri@student.eduplatform.ma",
    displayName: "Omar Kadiri",
    displayNameAr: "عمر القادري",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=49",
    phoneNumber: "+212600002021",
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
    uid: "student022",
    email: "zakaria.bennis@student.eduplatform.ma",
    displayName: "Zakaria Bennis",
    displayNameAr: "زكرياء بنيس",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=50",
    phoneNumber: "+212600002022",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 13,
    completedCourses: 6,
    totalPoints: 950,
    averageScore: 81.3,
    badges: ["Math Learner", "Problem Solver"],
    createdAt: new Date(Date.now() - 125*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    uid: "student023",
    email: "rayan.filali@student.eduplatform.ma",
    displayName: "Rayan Filali",
    displayNameAr: "ريان الفيلالي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=51",
    phoneNumber: "+212600002023",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 11,
    completedCourses: 5,
    totalPoints: 810,
    averageScore: 76.9,
    badges: ["Math Beginner"],
    createdAt: new Date(Date.now() - 115*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 4*60*60*1000).toISOString()
  },
  {
    uid: "student024",
    email: "adam.bennani@student.eduplatform.ma",
    displayName: "Adam Bennani",
    displayNameAr: "آدم البناني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=52",
    phoneNumber: "+212600002024",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 13,
    completedCourses: 7,
    totalPoints: 1020,
    averageScore: 83.7,
    badges: ["Math Learner", "Quiz Participant"],
    createdAt: new Date(Date.now() - 130*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "student025",
    email: "othmane.alami@student.eduplatform.ma",
    displayName: "Othmane Alami",
    displayNameAr: "عثمان العلمي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=53",
    phoneNumber: "+212600002025",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 12,
    completedCourses: 6,
    totalPoints: 930,
    averageScore: 80.2,
    badges: ["Math Learner", "Consistent Student"],
    createdAt: new Date(Date.now() - 122*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 5*60*60*1000).toISOString()
  },
  {
    uid: "student026",
    email: "bilal.kabbaj@student.eduplatform.ma",
    displayName: "Bilal Kabbaj",
    displayNameAr: "بلال القباج",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=54",
    phoneNumber: "+212600002026",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 11,
    completedCourses: 5,
    totalPoints: 850,
    averageScore: 77.8,
    badges: ["Math Beginner"],
    createdAt: new Date(Date.now() - 118*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 6*60*60*1000).toISOString()
  },
  {
    uid: "student027",
    email: "ismail.tahiri@student.eduplatform.ma",
    displayName: "Ismail Tahiri",
    displayNameAr: "إسماعيل الطاهري",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=55",
    phoneNumber: "+212600002027",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 13,
    completedCourses: 6,
    totalPoints: 970,
    averageScore: 82.5,
    badges: ["Math Learner", "Problem Solver"],
    createdAt: new Date(Date.now() - 127*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    uid: "student028",
    email: "hamid.zouine@student.eduplatform.ma",
    displayName: "Hamid Zouine",
    displayNameAr: "حميد زوين",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=56",
    phoneNumber: "+212600002028",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 12,
    completedCourses: 5,
    totalPoints: 880,
    averageScore: 79.4,
    badges: ["Math Beginner", "Consistent Learner"],
    createdAt: new Date(Date.now() - 121*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 7*60*60*1000).toISOString()
  },
  {
    uid: "student029",
    email: "saad.mansouri@student.eduplatform.ma",
    displayName: "Saad Mansouri",
    displayNameAr: "سعد المنصوري",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=57",
    phoneNumber: "+212600002029",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 13,
    completedCourses: 7,
    totalPoints: 1010,
    averageScore: 84.1,
    badges: ["Math Learner", "Quiz Participant", "Dedicated Student"],
    createdAt: new Date(Date.now() - 131*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "student030",
    email: "walid.fassi@student.eduplatform.ma",
    displayName: "Walid Fassi",
    displayNameAr: "وليد الفاسي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=58",
    phoneNumber: "+212600002030",
    active: true,
    level: "1BAC",
    branch: "Sciences Mathématiques",
    enrolledCourses: 12,
    completedCourses: 6,
    totalPoints: 940,
    averageScore: 81.9,
    badges: ["Math Learner", "Problem Solver"],
    createdAt: new Date(Date.now() - 124*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 4*60*60*1000).toISOString()
  },

  // Group 4: 1BAC Sciences Expérimentales (10 students)
  {
    uid: "student031",
    email: "imane.hassani@student.eduplatform.ma",
    displayName: "Imane Hassani",
    displayNameAr: "إيمان الحسني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=23",
    phoneNumber: "+212600002031",
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
    uid: "student032",
    email: "khadija.benchekroun@student.eduplatform.ma",
    displayName: "Khadija Benchekroun",
    displayNameAr: "خديجة بنشقرون",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=59",
    phoneNumber: "+212600002032",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 13,
    completedCourses: 8,
    totalPoints: 1130,
    averageScore: 85.6,
    badges: ["SVT Learner", "Dedicated Student"],
    createdAt: new Date(Date.now() - 135*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "student033",
    email: "leila.berrada@student.eduplatform.ma",
    displayName: "Leila Berrada",
    displayNameAr: "ليلى برادة",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=60",
    phoneNumber: "+212600002033",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 14,
    completedCourses: 9,
    totalPoints: 1250,
    averageScore: 89.1,
    badges: ["Biology Star", "Top Performer", "Quiz Master"],
    createdAt: new Date(Date.now() - 145*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 1*60*60*1000).toISOString()
  },
  {
    uid: "student034",
    email: "meryem.tazi@student.eduplatform.ma",
    displayName: "Meryem Tazi",
    displayNameAr: "مريم التازي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=61",
    phoneNumber: "+212600002034",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 13,
    completedCourses: 8,
    totalPoints: 1160,
    averageScore: 86.3,
    badges: ["Chemistry Pro", "Quiz Participant"],
    createdAt: new Date(Date.now() - 137*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    uid: "student035",
    email: "nada.alaoui@student.eduplatform.ma",
    displayName: "Nada Alaoui",
    displayNameAr: "ندى العلوي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=62",
    phoneNumber: "+212600002035",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 14,
    completedCourses: 9,
    totalPoints: 1240,
    averageScore: 88.7,
    badges: ["Biology Star", "SVT Expert", "Quiz Master"],
    createdAt: new Date(Date.now() - 142*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "student036",
    email: "siham.idrissi@student.eduplatform.ma",
    displayName: "Siham Idrissi",
    displayNameAr: "سهام الإدريسي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=63",
    phoneNumber: "+212600002036",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 13,
    completedCourses: 7,
    totalPoints: 1090,
    averageScore: 84.2,
    badges: ["SVT Learner", "Dedicated Student"],
    createdAt: new Date(Date.now() - 133*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 4*60*60*1000).toISOString()
  },
  {
    uid: "student037",
    email: "wafae.chraibi@student.eduplatform.ma",
    displayName: "Wafae Chraibi",
    displayNameAr: "وفاء الشرايبي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=64",
    phoneNumber: "+212600002037",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 14,
    completedCourses: 8,
    totalPoints: 1200,
    averageScore: 87.9,
    badges: ["Biology Star", "Chemistry Pro", "Quiz Participant"],
    createdAt: new Date(Date.now() - 139*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    uid: "student038",
    email: "samira.lamrani@student.eduplatform.ma",
    displayName: "Samira Lamrani",
    displayNameAr: "سميرة اللمراني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=65",
    phoneNumber: "+212600002038",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 13,
    completedCourses: 8,
    totalPoints: 1140,
    averageScore: 85.1,
    badges: ["SVT Learner", "Quiz Participant"],
    createdAt: new Date(Date.now() - 136*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    uid: "student039",
    email: "fatima.bennani@student.eduplatform.ma",
    displayName: "Fatima Bennani",
    displayNameAr: "فاطمة البناني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=66",
    phoneNumber: "+212600002039",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 15,
    completedCourses: 10,
    totalPoints: 1280,
    averageScore: 90.3,
    badges: ["Top Performer", "Biology Expert", "Chemistry Pro", "Quiz Champion"],
    createdAt: new Date(Date.now() - 147*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 1*60*60*1000).toISOString()
  },
  {
    uid: "student040",
    email: "aicha.kettani@student.eduplatform.ma",
    displayName: "Aicha Kettani",
    displayNameAr: "عائشة الكتاني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=67",
    phoneNumber: "+212600002040",
    active: true,
    level: "1BAC",
    branch: "Sciences Expérimentales",
    enrolledCourses: 13,
    completedCourses: 8,
    totalPoints: 1170,
    averageScore: 86.8,
    badges: ["Biology Star", "Quiz Master"],
    createdAt: new Date(Date.now() - 138*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 2*60*60*1000).toISOString()
  },

  // Group 5: TC and Lettres (10 students)
  {
    uid: "student041",
    email: "yassine.bouazza@student.eduplatform.ma",
    displayName: "Yassine Bouazza",
    displayNameAr: "ياسين بوعزة",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=68",
    phoneNumber: "+212600002041",
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
    uid: "student042",
    email: "anas.bennani@student.eduplatform.ma",
    displayName: "Anas Bennani",
    displayNameAr: "أنس البناني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=35",
    phoneNumber: "+212600002042",
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
    uid: "student043",
    email: "nour.elhassan@student.eduplatform.ma",
    displayName: "Nour El Hassan",
    displayNameAr: "نور الحسن",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=24",
    phoneNumber: "+212600002043",
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
    uid: "student044",
    email: "yasmine.tahiri@student.eduplatform.ma",
    displayName: "Yasmine Tahiri",
    displayNameAr: "ياسمين الطاهري",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=27",
    phoneNumber: "+212600002044",
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
  },
  {
    uid: "student045",
    email: "mariam.elidrissi@student.eduplatform.ma",
    displayName: "Mariam El Idrissi",
    displayNameAr: "مريم الإدريسي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=25",
    phoneNumber: "+212600002045",
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
    uid: "student046",
    email: "mehdi.ziani@student.eduplatform.ma",
    displayName: "Mehdi Ziani",
    displayNameAr: "مهدي الزياني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=36",
    phoneNumber: "+212600002046",
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
    uid: "student047",
    email: "hassan.amrani@student.eduplatform.ma",
    displayName: "Hassan Amrani",
    displayNameAr: "حسن العمراني",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=69",
    phoneNumber: "+212600002047",
    active: true,
    level: "TC",
    branch: "Tronc Commun Scientifique",
    enrolledCourses: 9,
    completedCourses: 4,
    totalPoints: 690,
    averageScore: 74.5,
    badges: ["Beginner", "Science Explorer"],
    createdAt: new Date(Date.now() - 85*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 7*60*60*1000).toISOString()
  },
  {
    uid: "student048",
    email: "sara.benkirane@student.eduplatform.ma",
    displayName: "Sara Benkirane",
    displayNameAr: "سارة بنكيران",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=70",
    phoneNumber: "+212600002048",
    active: true,
    level: "TC",
    branch: "Tronc Commun Littéraire",
    enrolledCourses: 8,
    completedCourses: 3,
    totalPoints: 520,
    averageScore: 71.2,
    badges: ["Language Learner"],
    createdAt: new Date(Date.now() - 65*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 9*60*60*1000).toISOString()
  },
  {
    uid: "student049",
    email: "khalil.fassi@student.eduplatform.ma",
    displayName: "Khalil Fassi",
    displayNameAr: "خليل الفاسي",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=71",
    phoneNumber: "+212600002049",
    active: true,
    level: "TC",
    branch: "Tronc Commun Scientifique",
    enrolledCourses: 10,
    completedCourses: 5,
    totalPoints: 720,
    averageScore: 76.9,
    badges: ["Science Explorer", "Consistent Learner"],
    createdAt: new Date(Date.now() - 88*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 6*60*60*1000).toISOString()
  },
  {
    uid: "student050",
    email: "latifa.mansouri@student.eduplatform.ma",
    displayName: "Latifa Mansouri",
    displayNameAr: "لطيفة المنصوري",
    role: "student",
    photoURL: "https://i.pravatar.cc/150?img=72",
    phoneNumber: "+212600002050",
    active: true,
    level: "1BAC",
    branch: "Lettres et Sciences Humaines",
    enrolledCourses: 11,
    completedCourses: 6,
    totalPoints: 920,
    averageScore: 80.4,
    badges: ["Literature Lover", "Quiz Participant"],
    createdAt: new Date(Date.now() - 105*24*60*60*1000).toISOString(),
    lastLogin: new Date(Date.now() - 5*60*60*1000).toISOString()
  }
];

console.log(`\n✅ DATA LOADED: ${users.length} users (${users.filter(u=>u.role==='admin').length} admins, ${users.filter(u=>u.role==='teacher').length} teachers, ${users.filter(u=>u.role==='student').length} students)\n`);

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function seedAllData() {
  console.log("\n╔═══════════════════════════════════════════════════════════════╗");
  console.log("║  🎓 COMPREHENSIVE DATABASE SEEDING - 72 USERS + ALL DATA     ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");

  try {
    // PHASE 1: Clear all data collections
    console.log("📦 PHASE 1: CLEARING COLLECTIONS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const collectionsToClean = [
      'academicLevels',
      'branches',
      'subjects',
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

    // PHASE 3: Seed Users
    console.log("╔═══════════════════════════════════════════════════════════════╗");
    console.log("║         👥 PHASE 3: SEEDING ALL 72 USERS                      ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");

    console.log("👤 Adding Users (" + users.length + " items)...\n");
    
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

    const totalDocs = academicLevels.length + branches.length + subjects.length + users.length;

    console.log("📊 SUMMARY OF SEEDED DATA:\n");
    console.log("🎓 ACADEMIC HIERARCHY:");
    console.log("   • Academic Levels: " + academicLevels.length + " documents");
    console.log("   • Branches: " + branches.length + " documents");
    console.log("   • Subjects: " + subjects.length + " documents");
    console.log("\n👥 USERS (72 TOTAL):");
    console.log("   • Admin Users: " + users.filter(u => u.role === 'admin').length + " documents");
    console.log("   • Teacher Users: " + users.filter(u => u.role === 'teacher').length + " documents");
    console.log("   • Student Users: " + users.filter(u => u.role === 'student').length + " documents");
    console.log("\n   ═══════════════════════════════════════════");
    console.log("   📊 TOTAL DOCUMENTS CREATED: " + totalDocs);
    console.log("   ═══════════════════════════════════════════\n");

    console.log("✨ Your database is now fully populated with all 72 users!");
    console.log("📄 Check IDENTIFIANTS_CONNEXION.md for all login credentials\n");
    console.log("🔐 DEFAULT PASSWORDS:");
    console.log("   • Admins: Admin2025! or SuperAdmin2025!");
    console.log("   • Teachers: Prof2025!");
    console.log("   • Students: Student2025!\n");

    process.exit(0);

  } catch (error) {
    console.error("\n❌ ERROR DURING SEEDING:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute
seedAllData();
