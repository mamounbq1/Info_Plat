import { Link } from 'react-router-dom';
import { PlayIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ContinueLearning({ courses, userProfile, isArabic, getProgressPercentage }) {
  // Get courses in progress (0% < progress < 100%)
  const inProgressCourses = courses
    .filter(course => {
      const progress = getProgressPercentage(course.id);
      return progress > 0 && progress < 100;
    })
    .sort((a, b) => {
      // Sort by most recently accessed or highest progress
      const progressA = getProgressPercentage(a.id);
      const progressB = getProgressPercentage(b.id);
      return progressB - progressA;
    })
    .slice(0, 3);

  if (inProgressCourses.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PlayIcon className="w-6 h-6 text-blue-600" />
          {isArabic ? 'تابع التعلم' : 'Continuer l\'apprentissage'}
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {inProgressCourses.map((course) => {
          const progress = getProgressPercentage(course.id);
          
          return (
            <Link 
              key={course.id}
              to={`/course/${course.id}`}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-blue-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    {isArabic ? 'قيد التقدم' : 'En cours'}
                  </span>
                  <ClockIcon className="w-5 h-5 text-gray-500" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {isArabic ? course.titleAr : course.titleFr}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {isArabic ? course.descriptionAr : course.descriptionFr}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>{isArabic ? 'التقدم' : 'Progression'}</span>
                    <span className="text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                  <PlayIcon className="w-5 h-5" />
                  {isArabic ? 'متابعة' : 'Continuer'}
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
