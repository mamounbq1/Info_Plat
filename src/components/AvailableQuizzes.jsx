import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardDocumentCheckIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  CheckBadgeIcon,
  PlayIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TrophyIcon,
  EyeIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeIconSolid } from '@heroicons/react/24/solid';
import { canAccessQuizOrExercise, getCourseProgress, matchesStudentClassOrLevel } from '../utils/courseProgress';

export default function AvailableQuizzes({ quizzes, userProfile, isArabic }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid' - default is LIST

  // Get quiz attempt data from user profile
  const getQuizStatus = (quizId) => {
    const attempts = userProfile?.quizAttempts?.[quizId];
    if (!attempts || attempts.length === 0) {
      return { status: 'not-started', bestScore: null, attempts: 0, lastAttempt: null };
    }

    const bestScore = Math.max(...attempts.map(a => a.score || 0));
    const lastAttempt = attempts[attempts.length - 1];
    const passed = bestScore >= 70; // Assuming 70% is passing

    return {
      status: passed ? 'passed' : 'failed',
      bestScore,
      attempts: attempts.length,
      lastAttempt: lastAttempt.completedAt,
      passed
    };
  };

  // ACADEMIC HIERARCHY: Filter quizzes by student's class/level
  const filteredQuizzes = quizzes.filter(quiz => matchesStudentClassOrLevel(quiz, userProfile));

  // Sort quizzes: not started first, then by best score
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    const statusA = getQuizStatus(a.id);
    const statusB = getQuizStatus(b.id);
    
    // Not started quizzes first
    if (statusA.status === 'not-started' && statusB.status !== 'not-started') return -1;
    if (statusA.status !== 'not-started' && statusB.status === 'not-started') return 1;
    
    // Then by best score
    return (statusB.bestScore || 0) - (statusA.bestScore || 0);
  });

  if (sortedQuizzes.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
          {isArabic ? 'الاختبارات المتاحة' : 'Quiz Disponibles'}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
          <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            {isArabic ? 'لا توجد اختبارات متاحة حالياً' : 'Aucun quiz disponible pour le moment'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isArabic 
              ? 'سيتم إضافة الاختبارات قريباً من قبل المعلمين'
              : 'Les quiz seront bientôt ajoutés par vos enseignants'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'الاختبارات المتاحة' : 'Quiz Disponibles'}
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({sortedQuizzes.length})
          </span>
        </h2>
        
        {/* View Mode Toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              viewMode === 'grid'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isArabic ? 'شبكة' : 'Grille'}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              viewMode === 'list'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isArabic ? 'قائمة' : 'Liste'}
          </button>
        </div>
      </div>

      {/* Quizzes Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' 
        : 'space-y-3'
      }>
        {sortedQuizzes.map((quiz) => {
          const status = getQuizStatus(quiz.id);
          return (
            <QuizCard 
              key={quiz.id}
              quiz={quiz}
              status={status}
              isArabic={isArabic}
              viewMode={viewMode}
              userProfile={userProfile}
            />
          );
        })}
      </div>
    </div>
  );
}

// Quiz Card Component
function QuizCard({ quiz, status, isArabic, viewMode, userProfile }) {
  // Check if quiz is locked based on course prerequisites
  const accessCheck = canAccessQuizOrExercise(userProfile, quiz.courseId);
  const isLocked = !accessCheck.canAccess;
  const progress = getCourseProgress(userProfile, quiz.courseId);
  
  const getStatusColor = () => {
    // If locked, always show red
    if (isLocked) return 'border-red-400 dark:border-red-600';
    
    if (status.status === 'not-started') return 'border-blue-200 dark:border-blue-800';
    if (status.passed) return 'border-green-200 dark:border-green-800';
    return 'border-orange-200 dark:border-orange-800';
  };

  const getStatusBadge = () => {
    if (status.status === 'not-started') {
      return (
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">
          {isArabic ? 'جديد' : 'Nouveau'}
        </span>
      );
    }
    if (status.passed) {
      return (
        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium flex items-center gap-1">
          <CheckBadgeIconSolid className="w-3.5 h-3.5" />
          {isArabic ? 'ناجح' : 'Réussi'}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium">
        {isArabic ? 'يحتاج إعادة' : 'À refaire'}
      </span>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${getStatusColor()} group ${
        isLocked ? 'opacity-60' : ''
      }`}>
        <div className="p-4 flex items-center gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
            isLocked ? 'bg-red-100 dark:bg-red-900/30' :
            status.passed ? 'bg-green-100 dark:bg-green-900/30' : 
            status.status === 'not-started' ? 'bg-blue-100 dark:bg-blue-900/30' : 
            'bg-orange-100 dark:bg-orange-900/30'
          }`}>
            {isLocked ? (
              <LockClosedIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
            ) : status.passed ? (
              <CheckBadgeIconSolid className="w-7 h-7 text-green-600 dark:text-green-400" />
            ) : (
              <ClipboardDocumentCheckIcon className={`w-7 h-7 ${
                status.status === 'not-started' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
              }`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 flex items-center gap-2" dir="auto">
                {quiz.title || quiz.titleFr || (isArabic ? quiz.titleAr : quiz.titleFr)}
                {isLocked && <LockClosedIcon className="w-5 h-5 text-red-500" />}
                {!isLocked && quiz.courseId && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
              </h3>
              {getStatusBadge()}
            </div>

            {/* Course Prerequisite Status */}
            {quiz.courseId && (
              <div className="mb-2">
                {isLocked ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                    <p className="text-red-700 dark:text-red-400 text-xs font-medium">
                      🔒 {isArabic ? 'مغلق' : 'Verrouillé'} - {isArabic ? `يجب إكمال الدرس أولاً (${progress}%)` : `Terminez le cours d'abord (${progress}%)`}
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2">
                    <p className="text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" />
                      {isArabic ? 'متاح' : 'Disponible'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <QuestionMarkCircleIcon className="w-4 h-4" />
                {quiz.questions?.length || 0} {isArabic ? 'سؤال' : 'questions'}
              </span>
              {quiz.timeLimit && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {quiz.timeLimit} {isArabic ? 'دقيقة' : 'min'}
                </span>
              )}
              {status.bestScore !== null && (
                <span className="flex items-center gap-1">
                  <TrophyIcon className="w-4 h-4" />
                  {isArabic ? 'أفضل نتيجة:' : 'Meilleur:'} {status.bestScore}%
                </span>
              )}
              {status.attempts > 0 && (
                <span className="flex items-center gap-1">
                  <ChartBarIcon className="w-4 h-4" />
                  {status.attempts} {isArabic ? 'محاولة' : 'tentative(s)'}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex gap-2">
            {isLocked ? (
              <button
                disabled
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 bg-gray-400 text-white cursor-not-allowed"
              >
                <LockClosedIcon className="w-4 h-4" />
                {isArabic ? 'مغلق' : 'Verrouillé'}
              </button>
            ) : (
              <>
                <Link
                  to={`/quiz/${quiz.id}`}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    status.status === 'not-started'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : status.passed
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {status.status === 'not-started' ? (
                    <>
                      <PlayIcon className="w-4 h-4" />
                      {isArabic ? 'بدء' : 'Commencer'}
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="w-4 h-4" />
                      {isArabic ? 'إعادة' : 'Refaire'}
                    </>
                  )}
                </Link>
                
                {/* View Last Result Button (only if attempted) */}
                {status.attempts > 0 && (
                  <Link
                    to={`/quiz-results/${quiz.id}/${status.attempts - 1}`}
                    className="px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    title={isArabic ? 'عرض النتيجة الأخيرة' : 'Voir dernier résultat'}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 ${getStatusColor()} group ${
      isLocked ? 'opacity-60' : ''
    }`}>
      {/* Header with Icon */}
      <div className={`p-4 ${
        isLocked ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20' :
        status.passed ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' : 
        status.status === 'not-started' ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : 
        'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isLocked ? 'bg-red-500' :
            status.passed ? 'bg-green-500' : 
            status.status === 'not-started' ? 'bg-blue-500' : 
            'bg-orange-500'
          }`}>
            {isLocked ? (
              <LockClosedIcon className="w-6 h-6 text-white" />
            ) : status.passed ? (
              <CheckBadgeIconSolid className="w-6 h-6 text-white" />
            ) : (
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {getStatusBadge()}
            {isLocked && <LockClosedIcon className="w-4 h-4 text-red-500" />}
            {!isLocked && quiz.courseId && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
          </div>
        </div>
        
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight min-h-[2.5rem]" dir="auto">
          {quiz.title || quiz.titleFr || (isArabic ? quiz.titleAr : quiz.titleFr)}
        </h3>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Course Prerequisite Status */}
        {quiz.courseId && (
          <div className="mb-3">
            {isLocked ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <p className="text-red-700 dark:text-red-400 text-xs font-medium text-center">
                  🔒 {isArabic ? 'مغلق' : 'Verrouillé'}
                </p>
                <p className="text-red-600 dark:text-red-500 text-xs text-center mt-1">
                  {isArabic ? `التقدم: ${progress}%` : `Progression: ${progress}%`}
                </p>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2">
                <p className="text-green-700 dark:text-green-400 text-xs font-medium text-center flex items-center justify-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  {isArabic ? 'متاح' : 'Disponible'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <QuestionMarkCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{quiz.questions?.length || 0} {isArabic ? 'سؤال' : 'Q'}</span>
          </div>
          {quiz.timeLimit && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <ClockIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{quiz.timeLimit} {isArabic ? 'د' : 'min'}</span>
            </div>
          )}
          {status.bestScore !== null && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <TrophyIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{status.bestScore}%</span>
            </div>
          )}
          {status.attempts > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <ChartBarIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{status.attempts}x</span>
            </div>
          )}
        </div>

        {/* Category/Difficulty */}
        {(quiz.category || quiz.difficulty) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quiz.category && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                {quiz.category}
              </span>
            )}
            {quiz.difficulty && (
              <span className={`px-2 py-0.5 text-xs rounded ${
                quiz.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                quiz.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {quiz.difficulty}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isLocked ? (
            <button
              disabled
              className="w-full text-center py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 bg-gray-400 text-white cursor-not-allowed"
            >
              <LockClosedIcon className="w-4 h-4" />
              {isArabic ? 'مغلق' : 'Verrouillé'}
            </button>
          ) : (
            <>
              <Link
                to={`/quiz/${quiz.id}`}
                className={`w-full text-center py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  status.status === 'not-started'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : status.passed
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {status.status === 'not-started' ? (
                  <>
                    <PlayIcon className="w-4 h-4" />
                    {isArabic ? 'بدء الاختبار' : 'Commencer'}
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-4 h-4" />
                    {isArabic ? 'إعادة المحاولة' : 'Refaire'}
                  </>
                )}
              </Link>
              
              {/* View Last Result Button (only if attempted) */}
              {status.attempts > 0 && (
                <Link
                  to={`/quiz-results/${quiz.id}/${status.attempts - 1}`}
                  className="w-full text-center py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <EyeIcon className="w-4 h-4" />
                  {isArabic ? 'عرض النتيجة الأخيرة' : 'Voir dernier résultat'}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
