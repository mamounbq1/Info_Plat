import { Link } from 'react-router-dom';
import { SparklesIcon, StarIcon } from '@heroicons/react/24/outline';

export default function CourseRecommendations({ 
  courses, 
  userProfile, 
  isArabic,
  getProgressPercentage 
}) {
  // Get enrolled course categories
  const enrolledCourseIds = userProfile?.enrolledCourses || [];
  const enrolledCategories = courses
    .filter(c => enrolledCourseIds.includes(c.id))
    .map(c => c.category);

  // Recommend courses based on similar categories
  const recommendedCourses = courses
    .filter(course => {
      // Exclude already enrolled courses
      if (enrolledCourseIds.includes(course.id)) return false;
      
      // Exclude completed courses
      if (getProgressPercentage(course.id) === 100) return false;
      
      // Include courses from same categories
      if (enrolledCategories.includes(course.category)) return true;
      
      // Include popular courses (you can add a popularity field)
      return course.enrollmentCount > 50;
    })
    .slice(0, 3);

  if (recommendedCourses.length === 0) {
    // Show popular courses if no recommendations
    const popularCourses = courses
      .filter(c => !enrolledCourseIds.includes(c.id))
      .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
      .slice(0, 3);
    
    if (popularCourses.length === 0) return null;
    
    return renderSection(popularCourses, isArabic, true);
  }

  return renderSection(recommendedCourses, isArabic, false);
}

function renderSection(courses, isArabic, isPopular) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {isPopular ? (
            <>
              <StarIcon className="w-5 h-5 text-yellow-500" />
              {isArabic ? 'الدورات الشائعة' : 'Cours Populaires'}
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 text-purple-500" />
              {isArabic ? 'موصى به لك' : 'Recommandé pour vous'}
            </>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {courses.map((course) => (
          <Link 
            key={course.id}
            to={`/course/${course.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-100 dark:border-gray-700"
          >
            {course.thumbnail && (
              <div className="overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={isArabic ? course.titleAr : course.titleFr}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-2.5">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded">
                  {isPopular ? (
                    isArabic ? 'شائع' : 'Populaire'
                  ) : (
                    isArabic ? 'موصى به' : 'Recommandé'
                  )}
                </span>
                {course.level && (
                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                    {course.level === 'beginner' && (isArabic ? 'مبتدئ' : 'Débutant')}
                    {course.level === 'intermediate' && (isArabic ? 'متوسط' : 'Intermédiaire')}
                    {course.level === 'advanced' && (isArabic ? 'متقدم' : 'Avancé')}
                  </span>
                )}
              </div>

              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                {isArabic ? course.titleAr : course.titleFr}
              </h3>

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                {isArabic ? course.descriptionAr : course.descriptionFr}
              </p>

              {course.duration && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration}h
                </div>
              )}

              <button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white py-1.5 text-xs rounded-md transition font-medium">
                {isArabic ? 'عرض الدورة' : 'Voir le cours'}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
