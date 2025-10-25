import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  CheckCircleIcon, 
  ClockIcon,
  BookOpenIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

/**
 * Enhanced Course Progress Tracker
 * Tracks: lessons completed, time spent, last accessed, completion date
 */
export default function CourseProgressTracker({ 
  courseId, 
  userId, 
  userProfile,
  course,
  isArabic 
}) {
  const [progressData, setProgressData] = useState({
    percentage: 0,
    lessonsCompleted: 0,
    totalLessons: 0,
    timeSpent: 0, // in minutes
    lastAccessed: null,
    completedAt: null,
    startedAt: null
  });

  useEffect(() => {
    loadProgressData();
  }, [courseId, userProfile]);

  const loadProgressData = async () => {
    try {
      // Get progress from user profile
      const percentage = userProfile?.progress?.[courseId] || 0;
      
      // Get detailed progress data
      const detailedProgress = userProfile?.detailedProgress?.[courseId] || {};
      
      // Calculate lessons
      const totalLessons = course?.lessonsCount || course?.files?.length || 0;
      const lessonsCompleted = detailedProgress.lessonsCompleted || 
        (percentage === 100 ? totalLessons : Math.floor(totalLessons * (percentage / 100)));
      
      setProgressData({
        percentage,
        lessonsCompleted,
        totalLessons,
        timeSpent: detailedProgress.timeSpent || 0,
        lastAccessed: detailedProgress.lastAccessed || null,
        completedAt: detailedProgress.completedAt || null,
        startedAt: detailedProgress.startedAt || null
      });
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const updateProgress = async (newPercentage, lessonsCompleted) => {
    try {
      const userRef = doc(db, 'users', userId);
      const now = new Date().toISOString();
      
      const updates = {
        [`progress.${courseId}`]: newPercentage,
        [`detailedProgress.${courseId}`]: {
          percentage: newPercentage,
          lessonsCompleted,
          totalLessons: progressData.totalLessons,
          timeSpent: progressData.timeSpent,
          lastAccessed: now,
          startedAt: progressData.startedAt || now,
          completedAt: newPercentage === 100 ? now : progressData.completedAt
        }
      };
      
      await updateDoc(userRef, updates);
      loadProgressData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const formatTimeSpent = (minutes) => {
    if (minutes < 60) return `${minutes}${isArabic ? ' دقيقة' : 'min'}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}${isArabic ? ' ساعة' : 'h'}`;
    return `${hours}${isArabic ? 'س' : 'h'} ${mins}${isArabic ? 'د' : 'm'}`;
  };

  const formatLastAccessed = (dateString) => {
    if (!dateString) return isArabic ? 'لم يتم الوصول' : 'Jamais';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return isArabic ? `منذ ${diffMins} دقيقة` : `Il y a ${diffMins}min`;
    } else if (diffHours < 24) {
      return isArabic ? `منذ ${diffHours} ساعة` : `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return isArabic ? `منذ ${diffDays} يوم` : `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString(isArabic ? 'ar' : 'fr', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const isCompleted = progressData.percentage === 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {isCompleted ? (
            <>
              <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
              {isArabic ? 'مكتمل!' : 'Terminé!'}
            </>
          ) : (
            <>
              <BookOpenIcon className="w-5 h-5 text-blue-500" />
              {isArabic ? 'التقدم' : 'Progression'}
            </>
          )}
        </h3>
        <span className={`text-lg font-bold ${
          isCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
        }`}>
          {progressData.percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              isCompleted 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${progressData.percentage}%` }}
          />
        </div>
      </div>

      {/* Progress Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lessons Completed */}
        <div className="flex items-start gap-2">
          <CheckCircleIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isArabic ? 'الدروس' : 'Leçons'}
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {progressData.lessonsCompleted} / {progressData.totalLessons}
            </div>
          </div>
        </div>

        {/* Time Spent */}
        <div className="flex items-start gap-2">
          <ClockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isArabic ? 'الوقت' : 'Temps'}
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatTimeSpent(progressData.timeSpent)}
            </div>
          </div>
        </div>

        {/* Last Accessed */}
        <div className="flex items-start gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isArabic ? 'آخر دخول' : 'Dernier accès'}
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatLastAccessed(progressData.lastAccessed)}
            </div>
          </div>
        </div>

        {/* Completion Date or Started Date */}
        {isCompleted && progressData.completedAt ? (
          <div className="flex items-start gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isArabic ? 'أنجز في' : 'Terminé le'}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(progressData.completedAt).toLocaleDateString(isArabic ? 'ar' : 'fr', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        ) : progressData.startedAt ? (
          <div className="flex items-start gap-2">
            <BookOpenIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isArabic ? 'بدأ في' : 'Commencé le'}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(progressData.startedAt).toLocaleDateString(isArabic ? 'ar' : 'fr', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
            <TrophyIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              {isArabic ? 'تهانينا على إنهاء هذه الدورة!' : 'Félicitations pour avoir terminé ce cours!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to update time spent on a course
 * Call this periodically (e.g., every minute) while user is viewing course
 */
export async function incrementTimeSpent(userId, courseId, minutesToAdd = 1) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const detailedProgress = userData.detailedProgress?.[courseId] || {};
      const currentTimeSpent = detailedProgress.timeSpent || 0;
      
      await updateDoc(userRef, {
        [`detailedProgress.${courseId}.timeSpent`]: currentTimeSpent + minutesToAdd,
        [`detailedProgress.${courseId}.lastAccessed`]: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error incrementing time spent:', error);
  }
}

/**
 * Helper function to mark a lesson as completed
 */
export async function markLessonCompleted(userId, courseId, lessonIndex, totalLessons) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const detailedProgress = userData.detailedProgress?.[courseId] || {};
      const currentCompleted = detailedProgress.lessonsCompleted || 0;
      const newCompleted = Math.min(currentCompleted + 1, totalLessons);
      const newPercentage = Math.round((newCompleted / totalLessons) * 100);
      
      const updates = {
        [`progress.${courseId}`]: newPercentage,
        [`detailedProgress.${courseId}.lessonsCompleted`]: newCompleted,
        [`detailedProgress.${courseId}.totalLessons`]: totalLessons,
        [`detailedProgress.${courseId}.percentage`]: newPercentage,
        [`detailedProgress.${courseId}.lastAccessed`]: new Date().toISOString()
      };
      
      // Mark as completed if all lessons done
      if (newCompleted === totalLessons) {
        updates[`detailedProgress.${courseId}.completedAt`] = new Date().toISOString();
      }
      
      await updateDoc(userRef, updates);
    }
  } catch (error) {
    console.error('Error marking lesson completed:', error);
  }
}
