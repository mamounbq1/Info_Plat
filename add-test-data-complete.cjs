#!/usr/bin/env node

/**
 * Complete Test Data Script
 * Adds 2 courses with quizzes and exercises to test the complete flow
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.VITE_FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

// Sample data
const coursesData = [
  {
    titleFr: "Mathématiques - Algèbre",
    titleAr: "الرياضيات - الجبر",
    descriptionFr: "Cours complet d'algèbre pour le tronc commun avec des exercices pratiques et des quiz interactifs",
    descriptionAr: "دورة كاملة في الجبر للجذع المشترك مع تمارين عملية واختبارات تفاعلية",
    category: "mathematics",
    level: "intermediate",
    duration: "30 heures",
    published: true,
    subject: "Mathématiques",
    targetLevels: ["1ère année", "2ème année"],
    thumbnail: "https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=800&h=600&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    files: [
      "https://example.com/algebra-course.pdf"
    ],
    tags: ["algèbre", "mathématiques", "équations"],
    enrollmentCount: 0,
    createdBy: "Test Teacher",
    teacherId: "test-teacher-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titleFr: "Physique - Mécanique",
    titleAr: "الفيزياء - الميكانيكا",
    descriptionFr: "Découvrez les lois fondamentales de la mécanique classique avec des expériences virtuelles",
    descriptionAr: "اكتشف القوانين الأساسية للميكانيكا الكلاسيكية مع تجارب افتراضية",
    category: "physics",
    level: "beginner",
    duration: "25 heures",
    published: true,
    subject: "Physique",
    targetLevels: ["1ère année"],
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=600&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    files: [
      "https://example.com/mechanics-course.pdf"
    ],
    tags: ["mécanique", "physique", "forces"],
    enrollmentCount: 0,
    createdBy: "Test Teacher",
    teacherId: "test-teacher-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const quizzesData = [
  // Quiz for Course 1 (Mathématiques)
  {
    title: "Quiz Algèbre - Équations du premier degré",
    courseId: null, // Will be set after course creation
    questions: [
      {
        question: "Quelle est la solution de l'équation: 2x + 5 = 13?",
        type: "qcu",
        options: ["x = 3", "x = 4", "x = 5", "x = 6"],
        correctAnswers: [1], // x = 4
        points: 5
      },
      {
        question: "Résoudre: 3x - 7 = 2x + 3",
        type: "qcu",
        options: ["x = 8", "x = 9", "x = 10", "x = 11"],
        correctAnswers: [2], // x = 10
        points: 5
      },
      {
        question: "Quelles sont les propriétés de l'addition? (plusieurs réponses possibles)",
        type: "qcm",
        options: ["Commutativité", "Associativité", "Distributivité", "Élément neutre"],
        correctAnswers: [0, 1, 3], // Commutativité, Associativité, Élément neutre
        points: 8
      },
      {
        question: "L'équation ax + b = 0 a pour solution x = _____ (où a ≠ 0)",
        type: "fill-blank",
        correctAnswer: "-b/a",
        wordSuggestions: ["-b/a", "b/a", "-a/b", "a/b"],
        points: 7
      }
    ],
    timeLimit: 15,
    difficulty: "easy",
    published: true,
    targetLevels: ["1ère année", "2ème année"],
    subject: "Mathématiques",
    createdBy: "Test Teacher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Quiz for Course 2 (Physique)
  {
    title: "Quiz Mécanique - Forces et Mouvement",
    courseId: null, // Will be set after course creation
    questions: [
      {
        question: "Quelle est l'unité de la force dans le système international?",
        type: "qcu",
        options: ["Joule (J)", "Newton (N)", "Watt (W)", "Pascal (Pa)"],
        correctAnswers: [1], // Newton (N)
        points: 5
      },
      {
        question: "La première loi de Newton affirme que:",
        type: "qcu",
        options: [
          "F = ma",
          "Un corps reste au repos ou en mouvement rectiligne uniforme si aucune force ne s'exerce sur lui",
          "À toute action correspond une réaction",
          "E = mc²"
        ],
        correctAnswers: [1],
        points: 6
      },
      {
        question: "Quels sont les types de forces? (plusieurs réponses)",
        type: "qcm",
        options: ["Force gravitationnelle", "Force électrique", "Force magnétique", "Force imaginaire"],
        correctAnswers: [0, 1, 2],
        points: 8
      },
      {
        question: "La formule de la deuxième loi de Newton est F = _____",
        type: "fill-blank",
        correctAnswer: "ma",
        wordSuggestions: ["ma", "m/a", "a/m", "m+a"],
        points: 6
      }
    ],
    timeLimit: 12,
    difficulty: "easy",
    published: true,
    targetLevels: ["1ère année"],
    subject: "Physique",
    createdBy: "Test Teacher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const exercisesData = [
  // Exercises for Course 1 (Mathématiques)
  {
    title: "Exercices Algèbre - Équations",
    description: "Série d'exercices sur les équations du premier degré avec corrections détaillées",
    courseId: null, // Will be set after course creation
    type: "file",
    files: ["https://example.com/algebra-exercises-1.pdf"],
    difficulty: "easy",
    published: true,
    targetLevels: ["1ère année", "2ème année"],
    subject: "Mathématiques",
    createdBy: "Test Teacher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Vidéo - Résolution d'équations",
    description: "Tutoriel vidéo expliquant pas à pas la résolution d'équations complexes",
    courseId: null,
    type: "link",
    externalLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    difficulty: "medium",
    published: true,
    targetLevels: ["1ère année", "2ème année"],
    subject: "Mathématiques",
    createdBy: "Test Teacher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Exercises for Course 2 (Physique)
  {
    title: "Exercices Mécanique - Calcul de Forces",
    description: "Problèmes pratiques sur le calcul des forces et l'équilibre des corps",
    courseId: null,
    type: "file",
    files: ["https://example.com/mechanics-exercises-1.pdf"],
    difficulty: "easy",
    published: true,
    targetLevels: ["1ère année"],
    subject: "Physique",
    createdBy: "Test Teacher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Simulation Interactive - Lois de Newton",
    description: "Expérimentez avec les lois de Newton dans cette simulation interactive",
    courseId: null,
    type: "link",
    externalLink: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_fr.html",
    difficulty: "medium",
    published: true,
    targetLevels: ["1ère année"],
    subject: "Physique",
    createdBy: "Test Teacher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function addTestData() {
  try {
    console.log('🚀 Starting test data creation...\n');

    // Step 1: Add courses
    console.log('📚 Adding courses...');
    const courseIds = [];
    
    for (let i = 0; i < coursesData.length; i++) {
      const courseRef = await db.collection('courses').add(coursesData[i]);
      courseIds.push(courseRef.id);
      console.log(`✅ Course ${i + 1} added: ${coursesData[i].titleFr} (ID: ${courseRef.id})`);
    }

    // Step 2: Add quizzes linked to courses
    console.log('\n📝 Adding quizzes...');
    
    for (let i = 0; i < quizzesData.length; i++) {
      quizzesData[i].courseId = courseIds[i];
      const quizRef = await db.collection('quizzes').add(quizzesData[i]);
      console.log(`✅ Quiz ${i + 1} added: ${quizzesData[i].title} (ID: ${quizRef.id})`);
      console.log(`   → Linked to course: ${coursesData[i].titleFr}`);
      console.log(`   → Questions: ${quizzesData[i].questions.length}`);
      console.log(`   → Time limit: ${quizzesData[i].timeLimit} minutes`);
      console.log(`   → Published: ${quizzesData[i].published ? 'Yes ✓' : 'No ✗'}`);
    }

    // Step 3: Add exercises linked to courses
    console.log('\n📋 Adding exercises...');
    
    for (let i = 0; i < exercisesData.length; i++) {
      // Distribute exercises across courses
      exercisesData[i].courseId = courseIds[Math.floor(i / 2)];
      const exerciseRef = await db.collection('exercises').add(exercisesData[i]);
      console.log(`✅ Exercise ${i + 1} added: ${exercisesData[i].title} (ID: ${exerciseRef.id})`);
      console.log(`   → Type: ${exercisesData[i].type}`);
      console.log(`   → Difficulty: ${exercisesData[i].difficulty}`);
      console.log(`   → Published: ${exercisesData[i].published ? 'Yes ✓' : 'No ✗'}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📚 Courses created: ${courseIds.length}`);
    console.log(`📝 Quizzes created: ${quizzesData.length}`);
    console.log(`📋 Exercises created: ${exercisesData.length}`);
    console.log('\n📊 Summary by course:');
    
    for (let i = 0; i < courseIds.length; i++) {
      console.log(`\n   Course ${i + 1}: ${coursesData[i].titleFr}`);
      console.log(`   └─ ID: ${courseIds[i]}`);
      console.log(`   └─ Quiz: ${quizzesData[i].title} (${quizzesData[i].questions.length} questions)`);
      console.log(`   └─ Exercises: ${exercisesData.filter((_, idx) => Math.floor(idx / 2) === i).length}`);
    }

    console.log('\n✨ You can now test the complete flow:');
    console.log('   1. Teacher can see courses in dashboard');
    console.log('   2. Student can see published courses, quizzes, and exercises');
    console.log('   3. Student can take quizzes and view results');
    console.log('   4. Student can download/view exercises');
    console.log('\n🔗 Navigate to: /dashboard (as student) to test\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    process.exit(1);
  }
}

// Run the script
addTestData();
