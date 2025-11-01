import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { canAccessQuizOrExercise, getCourseProgress } from '../utils/courseProgress';

/**
 * ExerciseTaking Page
 * Allows students to submit answers to exercises
 * Features:
 * - View exercise details (text or files)
 * - Submit text answer
 * - View previous submissions
 * - See grades and feedback from teachers
 */
export default function ExerciseTaking() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { isArabic } = useLanguage();
  
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previousSubmissions, setPreviousSubmissions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchExercise();
    fetchPreviousSubmissions();
  }, [exerciseId]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const exerciseDoc = await getDoc(doc(db, 'exercises', exerciseId));
      
      if (!exerciseDoc.exists()) {
        toast.error(isArabic ? 'التمرين غير موجود' : 'Exercice introuvable');
        navigate('/dashboard');
        return;
      }

      const exerciseData = { id: exerciseDoc.id, ...exerciseDoc.data() };
      
      // Check if student has access (course prerequisite)
      if (exerciseData.courseId) {
        const accessCheck = canAccessQuizOrExercise(userProfile, exerciseData.courseId);
        if (!accessCheck.canAccess) {
          const progress = getCourseProgress(userProfile, exerciseData.courseId);
          toast.error(
            isArabic 
              ? `🔒 يجب إكمال الدرس أولاً (التقدم: ${progress}%)`
              : `🔒 Vous devez terminer le cours d'abord (progression: ${progress}%)`
          );
          navigate('/dashboard');
          return;
        }
      }
      
      setExercise(exerciseData);
    } catch (error) {
      console.error('Error fetching exercise:', error);
      toast.error(isArabic ? 'خطأ في تحميل التمرين' : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousSubmissions = async () => {
    if (!currentUser) return;
    
    try {
      const submissionsQuery = query(
        collection(db, 'exerciseSubmissions'),
        where('exerciseId', '==', exerciseId),
        where('userId', '==', currentUser.uid)
      );
      
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissions = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by submission date (newest first)
      submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      
      setPreviousSubmissions(submissions);
      console.log('✅ Previous submissions loaded:', submissions.length);
    } catch (error) {
      console.error('Error fetching previous submissions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      toast.error(isArabic ? 'الرجاء كتابة إجابة' : 'Veuillez écrire une réponse');
      return;
    }
    
    if (answer.trim().length < 10) {
      toast.error(
        isArabic 
          ? 'الإجابة قصيرة جداً (10 أحرف على الأقل)'
          : 'Réponse trop courte (minimum 10 caractères)'
      );
      return;
    }
    
    try {
      setSubmitting(true);
      
      // ⭐ Submit to exerciseSubmissions collection for teacher grading
      await addDoc(collection(db, 'exerciseSubmissions'), {
        exerciseId: exerciseId,
        userId: currentUser.uid,
        studentName: userProfile.fullName || userProfile.email,
        answer: answer.trim(),
        submittedAt: new Date().toISOString()
        // grade, feedback, gradedAt, gradedBy will be added by teacher
      });
      
      toast.success(isArabic ? 'تم إرسال الإجابة بنجاح!' : 'Réponse soumise avec succès!');
      
      // Clear answer field
      setAnswer('');
      
      // Refresh previous submissions
      setTimeout(() => {
        fetchPreviousSubmissions();
      }, 500);
      
    } catch (error) {
      console.error('Error submitting exercise:', error);
      toast.error(isArabic ? 'خطأ في إرسال الإجابة' : 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isArabic ? 'ar-MA' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {isArabic ? 'جاري تحميل التمرين...' : 'Chargement de l\'exercice...'}
          </p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {isArabic ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}
          </button>

          {/* Exercise Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" dir="auto">
                  {isArabic ? exercise.titleAr : exercise.titleFr}
                </h1>
                {(exercise.descriptionAr || exercise.descriptionFr) && (
                  <p className="text-gray-600 dark:text-gray-400" dir="auto">
                    {isArabic ? exercise.descriptionAr : exercise.descriptionFr}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Exercise Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'محتوى التمرين' : 'Contenu de l\'exercice'}
            </h2>
            
            {exercise.contentType === 'text' && exercise.textContent && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap" dir="auto">
                  {exercise.textContent}
                </p>
              </div>
            )}
            
            {exercise.contentType === 'file' && exercise.files && exercise.files.length > 0 && (
              <div className="space-y-3">
                {exercise.files.map((file, index) => (
                  <a
                    key={index}
                    href={file.url || file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                  >
                    <DocumentArrowDownIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file.name || `${isArabic ? 'ملف' : 'Fichier'} ${index + 1}`}
                      </p>
                      {file.size && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <DocumentArrowDownIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Answer Submission Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'إجابتك' : 'Votre réponse'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={isArabic ? 'اكتب إجابتك هنا...' : 'Écrivez votre réponse ici...'}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                dir="auto"
              />
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {answer.length} {isArabic ? 'حرف' : 'caractères'}
                  {answer.length > 0 && answer.length < 10 && (
                    <span className="text-red-500 ml-2">
                      ({isArabic ? 'الحد الأدنى: 10 أحرف' : 'Minimum: 10 caractères'})
                    </span>
                  )}
                </p>
                
                <button
                  type="submit"
                  disabled={submitting || !answer.trim() || answer.length < 10}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  {submitting 
                    ? (isArabic ? 'جاري الإرسال...' : 'Envoi en cours...')
                    : (isArabic ? 'إرسال الإجابة' : 'Soumettre la réponse')
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Previous Submissions */}
          {previousSubmissions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'إجاباتك السابقة' : 'Vos soumissions précédentes'}
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({previousSubmissions.length})
                </span>
              </h2>
              
              <div className="space-y-4">
                {previousSubmissions.map((submission, index) => (
                  <div
                    key={submission.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(submission.submittedAt)}
                        </span>
                      </div>
                      
                      {submission.grade !== undefined && submission.grade !== null ? (
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {submission.grade}/20
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm rounded-full">
                          {isArabic ? 'في انتظار التقييم' : 'En attente d\'évaluation'}
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3" dir="auto">
                        {submission.answer}
                      </p>
                    </div>
                    
                    {submission.feedback && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {isArabic ? 'تعليق المعلم:' : 'Commentaire du professeur:'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400" dir="auto">
                          {submission.feedback}
                        </p>
                        {submission.gradedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {isArabic ? 'تم التقييم في:' : 'Évalué le:'} {formatDate(submission.gradedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
