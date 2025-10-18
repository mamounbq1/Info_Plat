import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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

export default function AddSampleCourses() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleAddCourses = async () => {
    if (!isAdmin) {
      toast.error('Vous devez être administrateur pour effectuer cette action');
      return;
    }

    const confirmed = window.confirm(`Voulez-vous ajouter ${sampleCourses.length} cours à la base de données?`);
    if (!confirmed) return;

    setLoading(true);
    setProgress({ current: 0, total: sampleCourses.length });
    setLogs([]);
    addLog(`🚀 Début de l'ajout de ${sampleCourses.length} cours...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sampleCourses.length; i++) {
      const course = sampleCourses[i];
      try {
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, 'courses'), {
          ...course,
          createdBy: currentUser.uid,
          createdAt: now,
          updatedAt: now
        });
        
        successCount++;
        setProgress({ current: i + 1, total: sampleCourses.length });
        addLog(`✅ [${successCount}] ${course.titleFr}`, 'success');
      } catch (error) {
        errorCount++;
        addLog(`❌ Erreur: ${course.titleFr} - ${error.message}`, 'error');
      }
    }

    setLoading(false);
    addLog(`\n📊 Résumé: ${successCount} succès, ${errorCount} erreurs`, successCount > 0 ? 'success' : 'error');
    
    if (successCount > 0) {
      toast.success(`${successCount} cours ajoutés avec succès!`);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h1>
          <p className="text-gray-600 dark:text-gray-400">Seuls les administrateurs peuvent accéder à cette page</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ajouter des Cours d'Exemple
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>📚 {sampleCourses.length} cours</strong> seront ajoutés à la base de données:
            </p>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Mathématiques: 3 cours</li>
              <li>• Physique: 2 cours</li>
              <li>• Chimie: 1 cours</li>
              <li>• Biologie: 1 cours</li>
              <li>• Informatique: 3 cours</li>
              <li>• Langues: 2 cours</li>
              <li>• Histoire: 1 cours</li>
              <li>• Géographie: 1 cours</li>
              <li>• Philosophie: 1 cours</li>
            </ul>
          </div>

          {!loading && logs.length === 0 && (
            <button
              onClick={handleAddCourses}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Ajouter les Cours
            </button>
          )}

          {loading && (
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progression
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Journal d'Exécution
              </h2>
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
                {logs.map((log, index) => (
                  <div 
                    key={index}
                    className={`mb-1 ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' :
                      'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
              
              {!loading && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Retour au Dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
