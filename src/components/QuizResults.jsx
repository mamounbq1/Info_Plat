import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function QuizResults({ quiz, isArabic, onClose }) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    questionStats: []
  });

  useEffect(() => {
    fetchQuizResults();
  }, [quiz.id]);

  const fetchQuizResults = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz submissions
      const resultsQuery = query(
        collection(db, 'quizSubmissions'),
        where('quizId', '==', quiz.id),
        orderBy('submittedAt', 'desc')
      );

      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = resultsSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Deserialize answers: convert comma-separated strings back to arrays for QCM and fill-blank
        const deserializedAnswers = data.answers?.map((answer, idx) => {
          const question = quiz.questions?.[idx];
          if (!question) return answer;
          
          // For QCM (multiple choice), convert comma-separated string to array of numbers
          if (question.type === 'qcm' && typeof answer === 'string' && answer.includes(',')) {
            return answer.split(',').map(num => parseInt(num.trim())).filter(n => !isNaN(n));
          }
          
          // For fill-blank, convert comma-separated string to array of words
          if (question.type === 'fill-blank' && typeof answer === 'string' && answer.includes(',')) {
            return answer.split(',').map(word => word.trim());
          }
          
          // For single values (QCU, true-false), convert string numbers to integers
          if ((question.type === 'qcu' || question.type === 'true-false') && typeof answer === 'string') {
            const num = parseInt(answer);
            return isNaN(num) ? answer : num;
          }
          
          return answer;
        }) || data.answers;
        
        return {
          id: doc.id,
          ...data,
          answers: deserializedAnswers
        };
      });

      // Calculate statistics
      calculateStats(resultsData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      toast.error(isArabic ? 'خطأ في تحميل النتائج' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (resultsData) => {
    if (resultsData.length === 0) {
      setStats({
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        questionStats: []
      });
      return;
    }

    const totalAttempts = resultsData.length;
    const totalScore = resultsData.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = totalScore / totalAttempts;
    const passed = resultsData.filter(r => r.score >= (quiz.passingScore || 50)).length;
    const passRate = (passed / totalAttempts) * 100;

    // Calculate per-question statistics
    const questionStats = quiz.questions.map((question, qIndex) => {
      const correctAnswers = resultsData.filter(result => {
        const answer = result.answers?.[qIndex];
        return checkAnswer(question, answer);
      }).length;

      return {
        questionIndex: qIndex,
        question: question.question,
        correctCount: correctAnswers,
        incorrectCount: totalAttempts - correctAnswers,
        successRate: (correctAnswers / totalAttempts) * 100
      };
    });

    setStats({
      totalAttempts,
      averageScore: Math.round(averageScore * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
      questionStats
    });
  };

  const checkAnswer = (question, userAnswer) => {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'qcu':
      case 'true-false':
        return userAnswer === question.correctAnswer;
      case 'qcm':
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswers)) return false;
        return JSON.stringify([...userAnswer].sort()) === JSON.stringify([...question.correctAnswers].sort());
      case 'fill-blank':
        // Check if all blanks are filled correctly
        if (!Array.isArray(userAnswer)) return false;
        const correctWords = question.selectedWordIndices?.map(i => 
          question.correctAnswerText.split(' ')[i]
        ) || [];
        return JSON.stringify(userAnswer) === JSON.stringify(correctWords);
      default:
        return false;
    }
  };

  const getQuestionTypeName = (type) => {
    const types = {
      qcu: isArabic ? 'اختيار واحد' : 'Choix Unique',
      qcm: isArabic ? 'اختيار متعدد' : 'Choix Multiple',
      'true-false': isArabic ? 'صح/خطأ' : 'Vrai/Faux',
      'fill-blank': isArabic ? 'ملء الفراغات' : 'Remplir les Blancs'
    };
    return types[type] || type;
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'نتائج الاختبار' : 'Résultats du Quiz'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isArabic ? quiz.titleAr : quiz.titleFr}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {isArabic ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'عدد المحاولات' : 'Tentatives'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalAttempts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrophyIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'المعدل' : 'Moyenne'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.averageScore}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'نسبة النجاح' : 'Taux Réussite'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.passRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <ChartBarIcon className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'الأسئلة' : 'Questions'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {quiz.questions?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'إحصائيات الأسئلة' : 'Statistiques par Question'}
              </h3>
              <div className="space-y-3">
                {stats.questionStats.map((qStat) => (
                  <div
                    key={qStat.questionIndex}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {qStat.questionIndex + 1}. {qStat.question}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getQuestionTypeName(quiz.questions[qStat.questionIndex].type)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${qStat.successRate >= 70 ? 'text-green-600' : qStat.successRate >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                          {Math.round(qStat.successRate)}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isArabic ? 'نجاح' : 'réussite'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${qStat.successRate >= 70 ? 'bg-green-600' : qStat.successRate >= 40 ? 'bg-orange-600' : 'bg-red-600'}`}
                        style={{ width: `${qStat.successRate}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>{qStat.correctCount} {isArabic ? 'صحيح' : 'correct'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircleIcon className="w-4 h-4" />
                        <span>{qStat.incorrectCount} {isArabic ? 'خطأ' : 'incorrect'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Results List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'نتائج الطلاب' : 'Résultats des Étudiants'}
              </h3>
              
              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {isArabic ? 'لا توجد نتائج بعد' : 'Aucun résultat pour le moment'}
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition"
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {result.studentName || result.studentEmail}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(result.submittedAt).toLocaleString(isArabic ? 'ar' : 'fr')}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatDuration(result.timeSpent || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${result.score >= (quiz.passingScore || 50) ? 'text-green-600' : 'text-red-600'}`}>
                          {result.score}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.correctAnswers || 0}/{quiz.questions?.length || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Result Modal */}
        {selectedResult && (
          <DetailedResultModal
            result={selectedResult}
            quiz={quiz}
            isArabic={isArabic}
            onClose={() => setSelectedResult(null)}
            checkAnswer={checkAnswer}
            getQuestionTypeName={getQuestionTypeName}
          />
        )}
      </div>
    </div>
  );
}

// Detailed Result Modal Component
function DetailedResultModal({ result, quiz, isArabic, onClose, checkAnswer, getQuestionTypeName }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'التفاصيل الكاملة' : 'Détails Complets'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {result.studentName || result.studentEmail}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? 'النتيجة' : 'Score'}
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {result.score}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? 'صحيح/المجموع' : 'Correct/Total'}
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {result.correctAnswers}/{quiz.questions?.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? 'الوقت' : 'Temps'}
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.floor((result.timeSpent || 0) / 60)}m
                </p>
              </div>
            </div>
          </div>

          {/* Question by Question */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
              {isArabic ? 'الإجابات سؤالاً بسؤال' : 'Réponses Question par Question'}
            </h4>
            
            {quiz.questions.map((question, qIndex) => {
              const userAnswer = result.answers?.[qIndex];
              const isCorrect = checkAnswer(question, userAnswer);
              
              return (
                <div
                  key={qIndex}
                  className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-red-300 bg-red-50 dark:bg-red-900/20'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircleIcon className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {qIndex + 1}.
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">
                          {getQuestionTypeName(question.type)}
                        </span>
                      </div>
                      
                      <p className="font-medium text-gray-900 dark:text-white mb-3">
                        {question.question || question.questionWithBlanks}
                      </p>

                      {/* User Answer */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isArabic ? 'إجابة الطالب:' : 'Réponse de l\'étudiant:'}
                        </p>
                        <div className={`p-3 rounded ${isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          {renderUserAnswer(question, userAnswer, isArabic)}
                        </div>

                        {/* Correct Answer (if wrong) */}
                        {!isCorrect && (
                          <>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300 mt-3">
                              {isArabic ? 'الإجابة الصحيحة:' : 'Bonne réponse:'}
                            </p>
                            <div className="p-3 rounded bg-green-100 dark:bg-green-900/30">
                              {renderCorrectAnswer(question, isArabic)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render user answer
function renderUserAnswer(question, userAnswer, isArabic) {
  if (userAnswer === null || userAnswer === undefined) {
    return <span className="text-gray-500 italic">{isArabic ? 'لم يتم الإجابة' : 'Pas de réponse'}</span>;
  }

  switch (question.type) {
    case 'qcu':
      return <span>{question.options?.[userAnswer] || userAnswer}</span>;
    case 'qcm':
      return (
        <div className="space-y-1">
          {Array.isArray(userAnswer) && userAnswer.map((idx, i) => (
            <div key={i}>• {question.options?.[idx] || idx}</div>
          ))}
        </div>
      );
    case 'true-false':
      return <span>{userAnswer === 1 ? (isArabic ? 'صح' : 'Vrai') : (isArabic ? 'خطأ' : 'Faux')}</span>;
    case 'fill-blank':
      return (
        <div className="space-y-1">
          {Array.isArray(userAnswer) && userAnswer.map((word, i) => (
            <div key={i}>Blank {i + 1}: <strong>{word}</strong></div>
          ))}
        </div>
      );
    default:
      return <span>{JSON.stringify(userAnswer)}</span>;
  }
}

// Helper function to render correct answer
function renderCorrectAnswer(question, isArabic) {
  switch (question.type) {
    case 'qcu':
      return <span>{question.options?.[question.correctAnswer]}</span>;
    case 'qcm':
      return (
        <div className="space-y-1">
          {question.correctAnswers?.map((idx, i) => (
            <div key={i}>• {question.options?.[idx]}</div>
          ))}
        </div>
      );
    case 'true-false':
      return <span>{question.correctAnswer === 1 ? (isArabic ? 'صح' : 'Vrai') : (isArabic ? 'خطأ' : 'Faux')}</span>;
    case 'fill-blank':
      const correctWords = question.selectedWordIndices?.map(i => 
        question.correctAnswerText.split(' ')[i]
      ) || [];
      return (
        <div className="space-y-1">
          {correctWords.map((word, i) => (
            <div key={i}>Blank {i + 1}: <strong>{word}</strong></div>
          ))}
        </div>
      );
    default:
      return <span>{isArabic ? 'غير محدد' : 'Non défini'}</span>;
  }
}
