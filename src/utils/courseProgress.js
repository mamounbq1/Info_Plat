/**
 * Utility functions for course progress tracking and prerequisites
 */

/**
 * Check if content (course/quiz/exercise) matches student's class or level
 * @param {Object} item - Content item with targetClasses or targetLevels
 * @param {Object} userProfile - User profile from Auth context
 * @returns {boolean} - True if content is accessible to this student
 */
export const matchesStudentClassOrLevel = (item, userProfile) => {
  if (!userProfile) return true; // Show all if no profile
  
  // Priority 1: Check targetClasses (new class-based system)
  if (item.targetClasses && item.targetClasses.length > 0) {
    // If student has a class code, check if it matches
    if (userProfile.class) {
      return item.targetClasses.includes(userProfile.class);
    }
    // If student doesn't have class but has levelCode, check if any targetClass starts with student's level
    if (userProfile.levelCode) {
      return item.targetClasses.some(classCode => classCode.startsWith(userProfile.levelCode));
    }
  }
  
  // Priority 2: Check targetLevels (old level-based system for backward compatibility)
  if (item.targetLevels && item.targetLevels.length > 0) {
    if (userProfile.level) {
      return item.targetLevels.includes(userProfile.level);
    }
    if (userProfile.levelCode) {
      return item.targetLevels.includes(userProfile.levelCode);
    }
  }
  
  // If no targeting specified, show to all students
  return true;
};

/**
 * Check if a student has completed a course
 * @param {Object} userProfile - User profile from Auth context
 * @param {string} courseId - Course ID to check
 * @returns {boolean} - True if course is completed (progress >= 100)
 */
export const isCourseCompleted = (userProfile, courseId) => {
  if (!userProfile || !courseId) return false;
  const progress = userProfile.progress || {};
  return (progress[courseId] || 0) >= 100;
};

/**
 * Get course completion percentage
 * @param {Object} userProfile - User profile from Auth context
 * @param {string} courseId - Course ID to check
 * @returns {number} - Completion percentage (0-100)
 */
export const getCourseProgress = (userProfile, courseId) => {
  if (!userProfile || !courseId) return 0;
  const progress = userProfile.progress || {};
  return progress[courseId] || 0;
};

/**
 * Check if a student can access a quiz/exercise
 * @param {Object} userProfile - User profile from Auth context
 * @param {string} courseId - Parent course ID
 * @returns {Object} - { canAccess: boolean, reason: string }
 */
export const canAccessQuizOrExercise = (userProfile, courseId) => {
  if (!courseId) {
    return { canAccess: true, reason: 'no_course_required' };
  }
  
  const completed = isCourseCompleted(userProfile, courseId);
  
  if (completed) {
    return { canAccess: true, reason: 'course_completed' };
  }
  
  const progress = getCourseProgress(userProfile, courseId);
  return { 
    canAccess: false, 
    reason: 'course_not_completed',
    progress: progress
  };
};

/**
 * Get localized message for access denial
 * @param {string} reason - Reason code from canAccessQuizOrExercise
 * @param {boolean} isArabic - Is Arabic language active
 * @param {number} progress - Current course progress
 * @returns {string} - Localized message
 */
export const getAccessDenialMessage = (reason, isArabic, progress = 0) => {
  if (reason === 'course_not_completed') {
    return isArabic 
      ? `يجب عليك إكمال الدرس أولاً (التقدم الحالي: ${progress}%)`
      : `Vous devez terminer le cours d'abord (progression actuelle: ${progress}%)`;
  }
  return isArabic ? 'غير متاح' : 'Non disponible';
};
