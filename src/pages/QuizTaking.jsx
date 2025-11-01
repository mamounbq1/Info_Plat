import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ClockIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FlagIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { canAccessQuizOrExercise, getCourseProgress } from '../utils/courseProgress';

/**
 * QuizTaking Page
 * Allows students to take quizzes with timer, question navigation, and auto-submit
 * Features:
 * - Question-by-question navigation
 * - Timer countdown with auto-submit
 * - Progress indicator
 * - Review before submit
 * - Save answers to Firestore
 * - Mobile-responsive design
 */
export default function QuizTaking() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { isArabic } = useLanguage();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (quiz && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, timeRemaining]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      
      if (!quizDoc.exists()) {
        toast.error(isArabic ? 'الاختبار غير موجود' : 'Quiz introuvable');
        navigate('/dashboard');
        return;
      }

      const quizData = { id: quizDoc.id, ...quizDoc.data() };
      
      // Check if student has access (course prerequisite)
      if (quizData.courseId) {
        const accessCheck = canAccessQuizOrExercise(userProfile, quizData.courseId);
        if (!accessCheck.canAccess) {
          const progress = getCourseProgress(userProfile, quizData.courseId);
          toast.error(
            isArabic 
              ? `🔒 يجب إكمال الدرس أولاً (التقدم: ${progress}%)`
              : `🔒 Vous devez terminer le cours d'abord (progression: ${progress}%)`
          );
          navigate('/dashboard');
          return;
        }
      }
      
      setQuiz(quizData);
      
      // Set timer if quiz has time limit (in minutes)
      if (quizData.timeLimit) {
        setTimeRemaining(quizData.timeLimit * 60); // Convert to seconds
      }
      
      // Initialize answers object based on question type
      const initialAnswers = {};
      quizData.questions?.forEach((q, idx) => {
        initialAnswers[idx] = q.type === 'qcm' ? [] : q.type === 'fill-blank' ? [] : null;
      });
      setAnswers(initialAnswers);
      
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error(isArabic ? 'خطأ في تحميل الاختبار' : 'Erreur lors du chargement du quiz');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, value, isMultiple = false) => {
    if (isMultiple) {
      // For QCM: toggle selection in array
      setAnswers(prev => {
        const current = prev[questionIndex] || [];
        const newAnswers = Array.isArray(current) ? [...current] : [];
        const index = newAnswers.indexOf(value);
        if (index > -1) {
          newAnswers.splice(index, 1);
        } else {
          newAnswers.push(value);
        }
        return {
          ...prev,
          [questionIndex]: newAnswers
        };
      });
    } else {
      // For QCU and True/False: single selection
      setAnswers(prev => ({
        ...prev,
        [questionIndex]: value
      }));
    }
  };

  const handleFillBlankAnswer = (questionIndex, blankIndex, value) => {
    // For fill-blank: store answers as array of {blankIndex, word}
    setAnswers(prev => {
      const currentAnswers = Array.isArray(prev[questionIndex]) ? prev[questionIndex] : [];
      const newAnswers = [...currentAnswers];
      newAnswers[blankIndex] = value;
      return {
        ...prev,
        [questionIndex]: newAnswers
      };
    });
  };

  const removeFillBlankAnswer = (questionIndex, blankIndex) => {
    setAnswers(prev => {
      const currentAnswers = Array.isArray(prev[questionIndex]) ? [...prev[questionIndex]] : [];
      currentAnswers[blankIndex] = null;
      return {
        ...prev,
        [questionIndex]: currentAnswers
      };
    });
  };

  // Calculate string similarity using Levenshtein distance
  const calculateStringSimilarity = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - (distance / maxLen);
  };

  const calculateScore = () => {
    if (!quiz?.questions) return 0;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    
    quiz.questions.forEach((question, idx) => {
      totalPoints += question.points || 1;
      
      if (question.type === 'qcm') {
        // QCM: Check if all correct answers are selected and no wrong ones
        const userAnswers = answers[idx] || [];
        const correctAnswers = question.correctAnswers || [];
        
        if (Array.isArray(userAnswers) && userAnswers.length === correctAnswers.length) {
          const allCorrect = userAnswers.every(ans => correctAnswers.includes(ans)) &&
                            correctAnswers.every(ans => userAnswers.includes(ans));
          if (allCorrect) {
            earnedPoints += question.points || 1;
          }
        }
      } else if (question.type === 'qcu' || question.type === 'true-false') {
        // QCU and True/False: Check if selected answer matches correct answer
        if (answers[idx] === question.correctAnswer) {
          earnedPoints += question.points || 1;
        }
      } else if (question.type === 'fill-blank') {
        // Fill-blank: Score each blank individually and divide points
        const userAnswers = Array.isArray(answers[idx]) ? answers[idx] : [];
        
        // Get correct words from the original sentence
        const allWords = (question.correctAnswerText || '').split(' ');
        const selectedIndices = question.selectedWordIndices || [];
        const correctWords = selectedIndices.map(i => allWords[i]).filter(w => w);
        
        // Calculate number of blanks from questionWithBlanks
        const sentenceWithBlanks = question.questionWithBlanks || question.question || '';
        const totalBlanks = (sentenceWithBlanks.match(/_____/g) || []).length;
        
        if (totalBlanks === 0) return; // No blanks, skip
        
        const pointsPerBlank = (question.points || 1) / totalBlanks;
        
        // Check each blank individually
        correctWords.forEach((correctWord, blankIdx) => {
          const userWord = userAnswers[blankIdx];
          if (!userWord) return; // No answer for this blank
          
          const userWordLower = userWord.trim().toLowerCase();
          const correctWordLower = correctWord.trim().toLowerCase();
          
          // Exact match gets full points for this blank
          if (userWordLower === correctWordLower) {
            earnedPoints += pointsPerBlank;
          } else {
            // Fuzzy matching for this specific word
            const similarity = calculateStringSimilarity(userWordLower, correctWordLower);
            if (similarity >= 0.85) {
              // 85%+ similarity gets full points for this blank
              earnedPoints += pointsPerBlank;
            } else if (similarity >= 0.70) {
              // 70-85% similarity gets partial credit (half points for this blank)
              earnedPoints += pointsPerBlank * 0.5;
            }
          }
        });
      }
    });
    
    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const handleSubmit = async (autoSubmit = false) => {
    try {
      setSubmitting(true);
      
      // Calculate score
      const score = calculateScore();
      const answersArray = Object.values(answers);
      
      // Serialize answers to avoid nested arrays (Firestore limitation)
      // Convert array answers to comma-separated strings
      const serializedAnswers = answersArray.map(answer => {
        if (Array.isArray(answer)) {
          return answer.join(','); // Convert array to string
        }
        return answer;
      });
      
      // Create attempt object
      const attempt = {
        quizId,
        answers: serializedAnswers,
        score,
        completedAt: new Date().toISOString(),
        timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60 - timeRemaining) : null
      };

      // Update user profile with quiz attempt
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        [`quizAttempts.${quizId}`]: arrayUnion(attempt)
      });
      
      // ⭐ Track quiz submission for teacher statistics
      try {
        await addDoc(collection(db, 'quizSubmissions'), {
          quizId: quizId,
          userId: currentUser.uid,
          studentName: userProfile.fullName || userProfile.email,
          answers: serializedAnswers, // Use serialized answers (no nested arrays)
          score: score,
          submittedAt: new Date().toISOString()
        });
        console.log('✅ Quiz submission tracked for teacher stats');
      } catch (trackError) {
        console.error('Error tracking quiz submission:', trackError);
        // Don't fail the entire submission if tracking fails
      }

      // Show success message
      if (autoSubmit) {
        toast.success(isArabic ? 'انتهى الوقت! تم إرسال الإجابات تلقائياً' : 'Temps écoulé! Réponses soumises automatiquement');
      } else {
        toast.success(isArabic ? 'تم إرسال الإجابات بنجاح!' : 'Réponses soumises avec succès!');
      }

      // Get the attempt index (number of previous attempts)
      const previousAttempts = userProfile?.quizAttempts?.[quizId] || [];
      const attemptIndex = previousAttempts.length;

      // Navigate to results page
      setTimeout(() => {
        navigate(`/quiz-results/${quizId}/${attemptIndex}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(isArabic ? 'خطأ في إرسال الإجابات' : 'Erreur lors de la soumission');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(a => {
      if (a === null || a === undefined) return false;
      if (Array.isArray(a)) return a.some(item => item !== null && item !== undefined && item !== '');
      if (typeof a === 'string') return a.trim().length > 0;
      return true;
    }).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {isArabic ? 'جاري تحميل الاختبار...' : 'Chargement du quiz...'}
          </p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const totalQuestions = quiz.questions?.length || 0;
  const answeredCount = getAnsweredCount();
  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-4 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1" dir="auto">
                {quiz.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic 
                  ? `السؤال ${currentQuestion + 1} من ${totalQuestions}`
                  : `Question ${currentQuestion + 1} sur ${totalQuestions}`
                }
              </p>
            </div>
            
            {/* Timer */}
            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
                timeRemaining < 60 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                <ClockIcon className="w-6 h-6" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>
                {isArabic 
                  ? `الإجابات: ${answeredCount} من ${totalQuestions}`
                  : `Réponses: ${answeredCount} sur ${totalQuestions}`
                }
              </span>
              <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Navigation Dots */}
          <div className="flex flex-wrap gap-1 justify-center">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition ${
                  idx === currentQuestion
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : answers[idx] !== null
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1" dir="auto">
              {currentQ.question || (currentQ.type === 'fill-blank' 
                ? (isArabic ? 'أكمل الجملة بالكلمات المناسبة' : 'Complétez la phrase avec les mots appropriés')
                : ''
              )}
            </h2>
            <span className={`px-2 py-1 rounded text-xs font-medium ml-3 ${
              currentQ.type === 'qcm' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              currentQ.type === 'qcu' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
              currentQ.type === 'true-false' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {currentQ.points || 1} pt
            </span>
          </div>

          {/* QCM - Multiple Choice (Multiple Answers) */}
          {currentQ.type === 'qcm' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {isArabic ? 'اختر إجابة واحدة أو أكثر' : 'Choisissez une ou plusieurs réponses'}
              </p>
              {currentQ.options.map((option, idx) => {
                const userAnswers = answers[currentQuestion] || [];
                const isSelected = Array.isArray(userAnswers) && userAnswers.includes(idx);
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(currentQuestion, idx, true)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center border-2 flex-shrink-0 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <CheckCircleIcon className="w-5 h-5 text-white" />}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* QCU - Single Choice */}
          {currentQ.type === 'qcu' && (
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = answers[currentQuestion] === idx;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(currentQuestion, idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <CheckCircleIcon className="w-5 h-5 text-white" />}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* True/False */}
          {currentQ.type === 'true-false' && (
            <div className="space-y-3">
              {[
                { value: 1, label: isArabic ? 'صحيح' : 'Vrai', color: 'green' },
                { value: 0, label: isArabic ? 'خاطئ' : 'Faux', color: 'red' }
              ].map(({ value, label, color }) => {
                const isSelected = answers[currentQuestion] === value;
                
                return (
                  <button
                    key={value}
                    onClick={() => handleAnswerSelect(currentQuestion, value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-900 dark:text-${color}-100`
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        isSelected
                          ? `border-${color}-500 bg-${color}-500`
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <CheckCircleIcon className="w-5 h-5 text-white" />}
                      </div>
                      <span className="font-bold text-lg">{label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill in the Blank - Drag & Drop Interface */}
          {currentQ.type === 'fill-blank' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {isArabic 
                    ? '🖱️ اسحب الكلمات من الأسفل وأفلتها في الفراغات' 
                    : '🖱️ Glissez les mots du bas et déposez-les dans les espaces'}
                </p>
              </div>

              {/* Sentence with Blanks */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                <div className="flex flex-wrap items-center gap-3 text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                  {(() => {
                    const parts = (currentQ.questionWithBlanks || currentQ.question || '').split('_____');
                    const userAnswers = Array.isArray(answers[currentQuestion]) ? answers[currentQuestion] : [];
                    
                    return parts.map((part, idx) => (
                      <span key={idx} className="inline-flex items-center gap-3">
                        <span>{part}</span>
                        {idx < parts.length - 1 && (
                          <div
                            onDrop={(e) => {
                              e.preventDefault();
                              const word = e.dataTransfer.getData('text/plain');
                              handleFillBlankAnswer(currentQuestion, idx, word);
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            className="inline-flex items-center min-w-[120px] px-4 py-3 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition cursor-pointer group"
                          >
                            {userAnswers[idx] ? (
                              <div className="flex items-center gap-2 w-full">
                                <span className="flex-1 font-semibold text-indigo-700 dark:text-indigo-300">
                                  {userAnswers[idx]}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFillBlankAnswer(currentQuestion, idx);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                >
                                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600 text-sm">
                                {isArabic ? 'أسقط هنا' : 'Déposez ici'}
                              </span>
                            )}
                          </div>
                        )}
                      </span>
                    ));
                  })()}
                </div>
              </div>
              
              {/* Draggable Words */}
              {currentQ.wordSuggestions && currentQ.wordSuggestions.length > 0 && (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {isArabic ? 'كلمات متاحة للسحب:' : 'Mots disponibles à glisser:'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {currentQ.wordSuggestions.map((word, idx) => {
                      const isUsed = Array.isArray(answers[currentQuestion]) && answers[currentQuestion].includes(word);
                      return (
                        <div
                          key={idx}
                          draggable={!isUsed}
                          onDragStart={(e) => {
                            if (!isUsed) {
                              e.dataTransfer.setData('text/plain', word);
                              e.currentTarget.style.opacity = '0.5';
                            }
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          className={`px-5 py-3 rounded-lg font-semibold text-base transition-all shadow-md ${
                            isUsed
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white cursor-move hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:scale-105 active:scale-95'
                          }`}
                          style={{ userSelect: 'none' }}
                        >
                          {isUsed && <span className="mr-2">✓</span>}
                          {word}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-4 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {isArabic 
                      ? 'انتبه: ليست كل الكلمات صحيحة! بعضها للتمويه' 
                      : 'Attention: Tous les mots ne sont pas corrects! Certains sont des leurres'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              currentQuestion === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md'
            }`}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {isArabic ? 'السابق' : 'Précédent'}
          </button>

          {currentQuestion === totalQuestions - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={answeredCount === 0 || submitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition shadow-md"
            >
              <FlagIcon className="w-5 h-5" />
              {isArabic ? 'إنهاء الاختبار' : 'Terminer le quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-md"
            >
              {isArabic ? 'التالي' : 'Suivant'}
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'تأكيد الإرسال' : 'Confirmer la soumission'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {isArabic 
                  ? `لقد أجبت على ${answeredCount} من ${totalQuestions} أسئلة.`
                  : `Vous avez répondu à ${answeredCount} sur ${totalQuestions} questions.`
                }
              </p>
              {answeredCount < totalQuestions && (
                <p className="text-orange-600 dark:text-orange-400 text-sm mb-4">
                  {isArabic 
                    ? `⚠️ لديك ${totalQuestions - answeredCount} أسئلة بدون إجابة. هل تريد المتابعة؟`
                    : `⚠️ ${totalQuestions - answeredCount} question(s) non répondue(s). Continuer?`
                  }
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                >
                  {submitting 
                    ? (isArabic ? 'جاري الإرسال...' : 'Envoi...')
                    : (isArabic ? 'تأكيد الإرسال' : 'Confirmer')
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
