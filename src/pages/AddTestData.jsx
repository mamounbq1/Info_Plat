import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AddTestData() {
  const { currentUser, userProfile } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

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
      files: ["https://example.com/algebra-course.pdf"],
      tags: ["algèbre", "mathématiques", "équations"],
      enrollmentCount: 0
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
      files: ["https://example.com/mechanics-course.pdf"],
      tags: ["mécanique", "physique", "forces"],
      enrollmentCount: 0
    }
  ];

  const getQuizzesData = (courseIds) => [
    {
      title: "Quiz Algèbre - Équations du premier degré",
      courseId: courseIds[0],
      questions: [
        {
          question: "Quelle est la solution de l'équation: 2x + 5 = 13?",
          type: "qcu",
          options: ["x = 3", "x = 4", "x = 5", "x = 6"],
          correctAnswers: [1],
          points: 5
        },
        {
          question: "Résoudre: 3x - 7 = 2x + 3",
          type: "qcu",
          options: ["x = 8", "x = 9", "x = 10", "x = 11"],
          correctAnswers: [2],
          points: 5
        },
        {
          question: "Quelles sont les propriétés de l'addition? (plusieurs réponses possibles)",
          type: "qcm",
          options: ["Commutativité", "Associativité", "Distributivité", "Élément neutre"],
          correctAnswers: [0, 1, 3],
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
      subject: "Mathématiques"
    },
    {
      title: "Quiz Mécanique - Forces et Mouvement",
      courseId: courseIds[1],
      questions: [
        {
          question: "Quelle est l'unité de la force dans le système international?",
          type: "qcu",
          options: ["Joule (J)", "Newton (N)", "Watt (W)", "Pascal (Pa)"],
          correctAnswers: [1],
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
      subject: "Physique"
    }
  ];

  const getExercisesData = (courseIds) => [
    {
      title: "Exercices Algèbre - Équations",
      description: "Série d'exercices sur les équations du premier degré avec corrections détaillées",
      courseId: courseIds[0],
      type: "file",
      files: ["https://example.com/algebra-exercises-1.pdf"],
      difficulty: "easy",
      published: true,
      targetLevels: ["1ère année", "2ème année"],
      subject: "Mathématiques"
    },
    {
      title: "Vidéo - Résolution d'équations",
      description: "Tutoriel vidéo expliquant pas à pas la résolution d'équations complexes",
      courseId: courseIds[0],
      type: "link",
      externalLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      difficulty: "medium",
      published: true,
      targetLevels: ["1ère année", "2ème année"],
      subject: "Mathématiques"
    },
    {
      title: "Exercices Mécanique - Calcul de Forces",
      description: "Problèmes pratiques sur le calcul des forces et l'équilibre des corps",
      courseId: courseIds[1],
      type: "file",
      files: ["https://example.com/mechanics-exercises-1.pdf"],
      difficulty: "easy",
      published: true,
      targetLevels: ["1ère année"],
      subject: "Physique"
    },
    {
      title: "Simulation Interactive - Lois de Newton",
      description: "Expérimentez avec les lois de Newton dans cette simulation interactive",
      courseId: courseIds[1],
      type: "link",
      externalLink: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_fr.html",
      difficulty: "medium",
      published: true,
      targetLevels: ["1ère année"],
      subject: "Physique"
    }
  ];

  const handleAddTestData = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      const results = {
        courses: [],
        quizzes: [],
        exercises: []
      };

      // Add courses
      const courseIds = [];
      for (const courseData of coursesData) {
        const data = {
          ...courseData,
          createdBy: userProfile?.fullName || currentUser?.email || "Test Teacher",
          teacherId: currentUser?.uid || "test-teacher-id",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'courses'), data);
        courseIds.push(docRef.id);
        results.courses.push({ id: docRef.id, title: courseData.titleFr });
      }

      // Add quizzes
      const quizzesData = getQuizzesData(courseIds);
      for (const quizData of quizzesData) {
        const data = {
          ...quizData,
          createdBy: userProfile?.fullName || currentUser?.email || "Test Teacher",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'quizzes'), data);
        results.quizzes.push({ id: docRef.id, title: quizData.title, questions: quizData.questions.length });
      }

      // Add exercises
      const exercisesData = getExercisesData(courseIds);
      for (const exerciseData of exercisesData) {
        const data = {
          ...exerciseData,
          createdBy: userProfile?.fullName || currentUser?.email || "Test Teacher",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'exercises'), data);
        results.exercises.push({ id: docRef.id, title: exerciseData.title, type: exerciseData.type });
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      results.duration = duration;
      setResults(results);

      toast.success(
        isArabic
          ? `تم إنشاء البيانات بنجاح في ${duration} ثانية!`
          : `Données créées avec succès en ${duration}s!`
      );
    } catch (error) {
      console.error('Error adding test data:', error);
      toast.error(
        isArabic
          ? `خطأ: ${error.message}`
          : `Erreur: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isArabic ? 'إضافة بيانات اختبار' : 'Ajouter Données de Test'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic
                ? 'إنشاء دورتين مع اختباراتهم وتماريناتهم لاختبار النظام'
                : 'Créer 2 cours avec leurs quiz et exercices pour tester le système'}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
              {isArabic ? 'ما سيتم إنشاؤه:' : 'Ce qui sera créé:'}
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📚</span>
                <span>{isArabic ? 'دورتان: رياضيات وفيزياء' : '2 Cours: Mathématiques et Physique'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📝</span>
                <span>{isArabic ? 'اختباران (4 أسئلة لكل منهما)' : '2 Quiz (4 questions chacun)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📋</span>
                <span>{isArabic ? '4 تمارين (ملفات وروابط)' : '4 Exercices (fichiers et liens)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>{isArabic ? 'جميعها منشورة ومرئية للطلاب' : 'Tous publiés et visibles aux étudiants'}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleAddTestData}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading
              ? (isArabic ? '⏳ جاري الإنشاء...' : '⏳ Création en cours...')
              : (isArabic ? '🚀 إنشاء البيانات' : '🚀 Créer les Données')}
          </button>

          {results && (
            <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="font-bold text-green-900 dark:text-green-300 mb-4 text-lg">
                ✅ {isArabic ? 'تم بنجاح!' : 'Succès!'}
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    📚 {isArabic ? 'الدورات المنشأة:' : 'Cours créés:'} ({results.courses.length})
                  </p>
                  <ul className="space-y-1 ml-4">
                    {results.courses.map((course, idx) => (
                      <li key={idx} className="text-green-700 dark:text-green-300">
                        • {course.title} <span className="text-xs text-gray-500">({course.id})</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    📝 {isArabic ? 'الاختبارات المنشأة:' : 'Quiz créés:'} ({results.quizzes.length})
                  </p>
                  <ul className="space-y-1 ml-4">
                    {results.quizzes.map((quiz, idx) => (
                      <li key={idx} className="text-green-700 dark:text-green-300">
                        • {quiz.title} <span className="text-xs">({quiz.questions} questions)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    📋 {isArabic ? 'التمارين المنشأة:' : 'Exercices créés:'} ({results.exercises.length})
                  </p>
                  <ul className="space-y-1 ml-4">
                    {results.exercises.map((exercise, idx) => (
                      <li key={idx} className="text-green-700 dark:text-green-300">
                        • {exercise.title} <span className="text-xs">({exercise.type})</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300">
                    ⏱️ {isArabic ? 'المدة:' : 'Durée:'} <span className="font-semibold">{results.duration}s</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
                >
                  {isArabic ? '👀 عرض في لوحة التحكم' : '👀 Voir dans Dashboard'}
                </button>
                <button
                  onClick={() => setResults(null)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition"
                >
                  {isArabic ? 'إغلاق' : 'Fermer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
