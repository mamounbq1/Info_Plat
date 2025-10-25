import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  FireIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

/**
 * Study Goals and Streak Counter Component
 * Tracks daily/weekly study goals and learning streaks
 */
export default function StudyGoalsAndStreak({ 
  userId, 
  userProfile, 
  isArabic 
}) {
  const [goals, setGoals] = useState({
    dailyMinutes: 30,
    weeklyLessons: 5,
    weeklyQuizzes: 2
  });
  
  const [progress, setProgress] = useState({
    todayMinutes: 0,
    weekLessons: 0,
    weekQuizzes: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    streakFrozen: false
  });

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoals, setEditingGoals] = useState({ ...goals });

  useEffect(() => {
    loadGoalsAndProgress();
  }, [userId, userProfile]);

  const loadGoalsAndProgress = async () => {
    try {
      // Load goals from user profile
      const userGoals = userProfile?.studyGoals || {
        dailyMinutes: 30,
        weeklyLessons: 5,
        weeklyQuizzes: 2
      };
      setGoals(userGoals);
      setEditingGoals(userGoals);

      // Load progress
      const userProgress = userProfile?.studyProgress || {
        todayMinutes: 0,
        weekLessons: 0,
        weekQuizzes: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakFrozen: false
      };

      // Check if streak needs to be updated
      const updatedProgress = checkAndUpdateStreak(userProgress);
      setProgress(updatedProgress);

      // If streak was broken, update in Firestore
      if (updatedProgress.currentStreak !== userProgress.currentStreak) {
        await updateDoc(doc(db, 'users', userId), {
          'studyProgress.currentStreak': updatedProgress.currentStreak
        });
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const checkAndUpdateStreak = (currentProgress) => {
    const today = new Date().toDateString();
    const lastActive = currentProgress.lastActiveDate 
      ? new Date(currentProgress.lastActiveDate).toDateString()
      : null;

    if (!lastActive) return currentProgress;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // If last active was today, keep streak
    if (lastActive === today) {
      return currentProgress;
    }

    // If last active was yesterday, keep streak
    if (lastActive === yesterdayStr) {
      return currentProgress;
    }

    // If streak is frozen (used a streak freeze), keep it
    if (currentProgress.streakFrozen) {
      return { ...currentProgress, streakFrozen: false };
    }

    // Otherwise, streak is broken
    return {
      ...currentProgress,
      currentStreak: 0
    };
  };

  const saveGoals = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        studyGoals: editingGoals
      });
      setGoals(editingGoals);
      setShowGoalModal(false);
      toast.success(isArabic ? 'تم حفظ الأهداف!' : 'Objectifs sauvegardés!');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    }
  };

  const getDailyProgress = () => {
    return Math.min(100, Math.round((progress.todayMinutes / goals.dailyMinutes) * 100));
  };

  const getWeeklyLessonsProgress = () => {
    return Math.min(100, Math.round((progress.weekLessons / goals.weeklyLessons) * 100));
  };

  const getWeeklyQuizzesProgress = () => {
    return Math.min(100, Math.round((progress.weekQuizzes / goals.weeklyQuizzes) * 100));
  };

  const getStreakColor = () => {
    if (progress.currentStreak === 0) return 'text-gray-400';
    if (progress.currentStreak < 7) return 'text-orange-500';
    if (progress.currentStreak < 30) return 'text-red-500';
    return 'text-purple-500';
  };

  const getStreakEmoji = () => {
    if (progress.currentStreak === 0) return '🔥';
    if (progress.currentStreak < 7) return '🔥';
    if (progress.currentStreak < 30) return '🔥🔥';
    return '🔥🔥🔥';
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-yellow-500" />
          {isArabic ? 'الأهداف والإنجازات' : 'Objectifs et Progression'}
        </h2>
        <button
          onClick={() => setShowGoalModal(true)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isArabic ? 'تعديل الأهداف' : 'Modifier'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                progress.currentStreak > 0 
                  ? 'bg-gradient-to-br from-orange-400 to-red-500' 
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}>
                {progress.currentStreak > 0 ? (
                  <FireIconSolid className="w-6 h-6 text-white" />
                ) : (
                  <FireIcon className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {isArabic ? 'سلسلة التعلم' : 'Série d\'apprentissage'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {isArabic ? 'أيام متتالية' : 'Jours consécutifs'}
                </p>
              </div>
            </div>
            <div className={`text-3xl ${getStreakColor()}`}>
              {getStreakEmoji()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                {progress.currentStreak}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400">
                {isArabic ? 'يوم' : 'jours'}
              </span>
            </div>

            {progress.longestStreak > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <TrophyIcon className="w-4 h-4" />
                <span>
                  {isArabic ? 'أطول سلسلة:' : 'Record:'} {progress.longestStreak} {isArabic ? 'يوم' : 'jours'}
                </span>
              </div>
            )}

            {/* Streak Milestones */}
            <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between text-xs">
                <span className={progress.currentStreak >= 7 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                  7 {isArabic ? 'أيام' : 'jours'} ⭐
                </span>
                <span className={progress.currentStreak >= 30 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                  30 {isArabic ? 'يوم' : 'jours'} 🏆
                </span>
                <span className={progress.currentStreak >= 100 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
                  100 {isArabic ? 'يوم' : 'jours'} 👑
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {isArabic ? 'الهدف اليومي' : 'Objectif quotidien'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {progress.todayMinutes} / {goals.dailyMinutes} {isArabic ? 'دقيقة' : 'min'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getDailyProgress()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {getDailyProgress()}%
              </span>
              {getDailyProgress() === 100 && (
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  {isArabic ? 'مكتمل!' : 'Complété!'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CalendarDaysIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {isArabic ? 'الأهداف الأسبوعية' : 'Objectifs hebdomadaires'}
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {/* Weekly Lessons */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 'الدروس' : 'Leçons'}: {progress.weekLessons}/{goals.weeklyLessons}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {getWeeklyLessonsProgress()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getWeeklyLessonsProgress()}%` }}
                />
              </div>
            </div>

            {/* Weekly Quizzes */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 'الاختبارات' : 'Quiz'}: {progress.weekQuizzes}/{goals.weeklyQuizzes}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {getWeeklyQuizzesProgress()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getWeeklyQuizzesProgress()}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'تعديل الأهداف' : 'Modifier les Objectifs'}
            </h3>

            <div className="space-y-4">
              {/* Daily Minutes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الهدف اليومي (دقيقة)' : 'Objectif quotidien (minutes)'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={editingGoals.dailyMinutes}
                  onChange={(e) => setEditingGoals({ ...editingGoals, dailyMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Weekly Lessons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الدروس الأسبوعية' : 'Leçons hebdomadaires'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={editingGoals.weeklyLessons}
                  onChange={(e) => setEditingGoals({ ...editingGoals, weeklyLessons: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Weekly Quizzes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الاختبارات الأسبوعية' : 'Quiz hebdomadaires'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editingGoals.weeklyQuizzes}
                  onChange={(e) => setEditingGoals({ ...editingGoals, weeklyQuizzes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {isArabic ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={saveGoals}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {isArabic ? 'حفظ' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to increment daily minutes
 * Call this when student spends time learning
 */
export async function incrementDailyMinutes(userId, minutesToAdd = 1) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const progress = userData.studyProgress || {};
      const today = new Date().toDateString();
      const lastActive = progress.lastActiveDate 
        ? new Date(progress.lastActiveDate).toDateString()
        : null;

      // Reset daily minutes if it's a new day
      const todayMinutes = lastActive === today 
        ? (progress.todayMinutes || 0) + minutesToAdd
        : minutesToAdd;

      // Check if streak should be updated
      let currentStreak = progress.currentStreak || 0;
      let longestStreak = progress.longestStreak || 0;

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastActive === yesterdayStr || !lastActive) {
          // Continue streak
          currentStreak += 1;
        } else if (!progress.streakFrozen) {
          // Streak broken
          currentStreak = 1;
        }

        longestStreak = Math.max(longestStreak, currentStreak);
      }

      await updateDoc(userRef, {
        'studyProgress.todayMinutes': todayMinutes,
        'studyProgress.currentStreak': currentStreak,
        'studyProgress.longestStreak': longestStreak,
        'studyProgress.lastActiveDate': new Date().toISOString(),
        'studyProgress.streakFrozen': false
      });
    }
  } catch (error) {
    console.error('Error incrementing daily minutes:', error);
  }
}

/**
 * Helper function to increment weekly lessons
 */
export async function incrementWeeklyLessons(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const progress = userData.studyProgress || {};
      const weekLessons = (progress.weekLessons || 0) + 1;

      await updateDoc(userRef, {
        'studyProgress.weekLessons': weekLessons
      });
    }
  } catch (error) {
    console.error('Error incrementing weekly lessons:', error);
  }
}

/**
 * Helper function to increment weekly quizzes
 */
export async function incrementWeeklyQuizzes(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const progress = userData.studyProgress || {};
      const weekQuizzes = (progress.weekQuizzes || 0) + 1;

      await updateDoc(userRef, {
        'studyProgress.weekQuizzes': weekQuizzes
      });
    }
  } catch (error) {
    console.error('Error incrementing weekly quizzes:', error);
  }
}
