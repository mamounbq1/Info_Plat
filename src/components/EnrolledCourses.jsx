import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  ChartBarIcon,
  TrophyIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CertificateModal } from './CertificateGenerator';
import { matchesStudentClassOrLevel } from '../utils/courseProgress';

export default function EnrolledCourses({ 
  courses, 
  enrolledCourseIds,
  getProgressPercentage,
  userProfile,
  isArabic,
  onUnenroll // New prop for unenrollment function
}) {
  // Certificate modal state
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Get detailed progress for a course
  const getDetailedProgress = (courseId) => {
    return userProfile?.detailedProgress?.[courseId] || {};
  };

  const openCertificate = (course) => {
    setSelectedCourse(course);
    setCertificateModalOpen(true);
  };
  // Filter only enrolled courses
  // ACADEMIC HIERARCHY: Also check if course matches student's class/level
  const enrolledCourses = courses.filter(course => {
    const isEnrolled = enrolledCourseIds && enrolledCourseIds.includes(course.id);
    const matchesClassLevel = matchesStudentClassOrLevel(course, userProfile);
    return isEnrolled && matchesClassLevel;
  });

  // Sort by progress: in-progress first, then by progress percentage
  const sortedEnrolled = [...enrolledCourses].sort((a, b) => {
    const progressA = getProgressPercentage(a.id);
    const progressB = getProgressPercentage(b.id);
    
    // Completed courses (100%) go last
    if (progressA === 100 && progressB !== 100) return 1;
    if (progressA !== 100 && progressB === 100) return -1;
    
    // In-progress sorted by most recent progress (highest percentage first)
    return progressB - progressA;
  });

  if (enrolledCourses.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
          {isArabic ? 'دوراتي المسجلة' : 'Mes Cours Inscrits'}
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            (0)
          </span>
        </h2>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 p-8 sm:p-12 text-center">
          <BookOpenIcon className="w-16 h-16 text-blue-400 dark:text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isArabic ? 'لم تسجل في أي دورة بعد' : 'Vous n\'êtes inscrit à aucun cours'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {isArabic 
              ? 'ابدأ رحلة التعلم بالتسجيل في أول دورة'
              : 'Commencez votre parcours d\'apprentissage en vous inscrivant à un cours'
            }
          </p>
          <a 
            href="#all-courses" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            {isArabic ? 'استكشف الدورات' : 'Explorer les cours'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'دوراتي المسجلة' : 'Mes Cours Inscrits'}
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({enrolledCourses.length})
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {sortedEnrolled.map((course) => {
          const progress = getProgressPercentage(course.id);
          const isCompleted = progress === 100;
          
          return (
            <div 
              key={course.id} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 relative group ${
                isCompleted 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-blue-200 dark:border-blue-800'
              }`}
            >
              {/* Unenroll Button - Top Right Corner */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm(isArabic 
                    ? 'هل أنت متأكد من إلغاء التسجيل من هذا الدورة؟' 
                    : 'Êtes-vous sûr de vouloir vous désinscrire de ce cours ?'
                  )) {
                    onUnenroll(course.id);
                  }
                }}
                className="absolute top-2 left-2 z-10 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title={isArabic ? 'إلغاء التسجيل' : 'Se désinscrire'}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              {/* Thumbnail */}
              {course.thumbnail && (
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={isArabic ? course.titleAr : course.titleFr}
                    className="w-full h-32 object-cover"
                  />
                  {/* Progress Badge Overlay */}
                  <div className="absolute top-2 right-2">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium shadow-lg">
                        <CheckCircleIcon className="w-4 h-4" />
                        {isArabic ? 'مكتمل' : 'Complété'}
                      </span>
                    ) : progress > 0 ? (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium shadow-lg">
                        {progress}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-900/70 text-white text-xs rounded-full font-medium shadow-lg">
                        <PlayIcon className="w-3 h-3" />
                        {isArabic ? 'ابدأ' : 'Commencer'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-3">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight min-h-[2.5rem] mb-2">
                  {isArabic ? course.titleAr : course.titleFr}
                </h3>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{isArabic ? 'التقدم' : 'Progression'}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {(() => {
                    const detailedProgress = getDetailedProgress(course.id);
                    const totalLessons = course.lessonsCount || course.files?.length || 0;
                    const lessonsCompleted = detailedProgress.lessonsCompleted || 
                      (progress === 100 ? totalLessons : Math.floor(totalLessons * (progress / 100)));
                    
                    if (totalLessons > 0) {
                      return (
                        <span className="flex items-center gap-1">
                          <BookOpenIcon className="w-4 h-4" />
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {lessonsCompleted}
                          </span>
                          /{totalLessons} {isArabic ? 'درس' : 'leçons'}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  {(() => {
                    const detailedProgress = getDetailedProgress(course.id);
                    const timeSpent = detailedProgress.timeSpent || 0;
                    if (timeSpent > 0) {
                      const hours = Math.floor(timeSpent / 60);
                      const mins = timeSpent % 60;
                      return (
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {hours > 0 ? `${hours}${isArabic ? 'س' : 'h'}` : ''} 
                          {mins > 0 || hours === 0 ? ` ${mins}${isArabic ? 'د' : 'm'}` : ''}
                        </span>
                      );
                    } else if (course.duration) {
                      return (
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {course.duration}h
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Action Buttons */}
                {isCompleted ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      to={`/course/${course.id}`}
                      className="text-center py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      {isArabic ? 'مراجعة' : 'Réviser'}
                    </Link>
                    <button
                      onClick={() => openCertificate(course)}
                      className="text-center py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-md"
                    >
                      <TrophyIcon className="w-4 h-4" />
                      {isArabic ? 'شهادة' : 'Certificat'}
                    </button>
                  </div>
                ) : (
                  <Link 
                    to={`/course/${course.id}`}
                    className={`w-full text-center py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      progress > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {progress > 0 ? (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        {isArabic ? 'متابعة' : 'Continuer'}
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        {isArabic ? 'بدء' : 'Commencer'}
                      </>
                    )}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {enrolledCourses.filter(c => {
              const p = getProgressPercentage(c.id);
              return p > 0 && p < 100;
            }).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {isArabic ? 'قيد التقدم' : 'En cours'}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {enrolledCourses.filter(c => getProgressPercentage(c.id) === 100).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {isArabic ? 'مكتملة' : 'Complétés'}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(
              enrolledCourses.reduce((sum, c) => sum + getProgressPercentage(c.id), 0) / 
              Math.max(enrolledCourses.length, 1)
            )}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {isArabic ? 'متوسط التقدم' : 'Progression moy.'}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCourse && (
        <CertificateModal
          isOpen={certificateModalOpen}
          onClose={() => setCertificateModalOpen(false)}
          studentName={userProfile?.fullName || 'Student'}
          courseName={isArabic ? selectedCourse.titleAr : selectedCourse.titleFr}
          completionDate={getDetailedProgress(selectedCourse.id).completedAt || new Date().toISOString()}
          courseId={selectedCourse.id}
          isArabic={isArabic}
        />
      )}
    </div>
  );
}
