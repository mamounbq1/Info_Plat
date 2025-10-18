import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CoursesGridSkeleton } from '../components/LoadingSkeleton';

export default function MyCourses() {
  const { currentUser, userProfile } = useAuth();
  const { isArabic } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'in-progress', 'completed'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const coursesQuery = query(
        collection(db, 'courses'),
        where('published', '==', true)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (courseId) => {
    if (!userProfile?.progress) return 0;
    return userProfile.progress[courseId] || 0;
  };

  const isCompleted = (courseId) => {
    return userProfile?.completedCourses?.includes(courseId) || false;
  };

  const isInProgress = (courseId) => {
    const progress = getProgressPercentage(courseId);
    return progress > 0 && progress < 100;
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'completed') return isCompleted(course.id);
    if (filter === 'in-progress') return isInProgress(course.id);
    return true; // 'all'
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isArabic ? 'دوراتي' : 'Mes Cours'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'جميع دوراتك في مكان واحد' : 'Tous vos cours en un seul endroit'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {isArabic ? 'إجمالي الدروس' : 'Total des cours'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {courses.length}
                  </p>
                </div>
                <BookOpenIcon className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {isArabic ? 'قيد التقدم' : 'En cours'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {courses.filter(c => isInProgress(c.id)).length}
                  </p>
                </div>
                <ClockIcon className="w-10 h-10 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {isArabic ? 'مكتملة' : 'Terminés'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProfile?.completedCourses?.length || 0}
                  </p>
                </div>
                <CheckCircleIcon className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {isArabic ? 'الكل' : 'Tous'}
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'in-progress'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {isArabic ? 'قيد التقدم' : 'En cours'}
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {isArabic ? 'مكتملة' : 'Terminés'}
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <CoursesGridSkeleton count={6} viewMode="grid" />
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-16 text-center">
              <AcademicCapIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                {isArabic ? 'لا توجد دروس' : 'Aucun cours'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {filter === 'completed' && (isArabic ? 'لم تكمل أي دروس بعد' : 'Vous n\'avez pas encore terminé de cours')}
                {filter === 'in-progress' && (isArabic ? 'لا توجد دروس قيد التقدم' : 'Aucun cours en cours')}
                {filter === 'all' && (isArabic ? 'ابدأ في استكشاف الدروس' : 'Commencez à explorer les cours')}
              </p>
              {filter === 'all' && (
                <Link
                  to="/dashboard"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {isArabic ? 'استكشاف الدروس' : 'Explorer les cours'}
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentCourses.map((course) => {
                  const progress = getProgressPercentage(course.id);
                  const completed = isCompleted(course.id);
                  
                  return (
                    <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all group border border-gray-100 dark:border-gray-700">
                    {course.thumbnail && (
                      <div className="overflow-hidden relative">
                        <img 
                          src={course.thumbnail} 
                          alt={isArabic ? course.titleAr : course.titleFr}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {completed && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            {isArabic ? 'مكتمل' : 'Terminé'}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                        {isArabic ? course.titleAr : course.titleFr}
                      </h3>
                      
                      {course.category && (
                        <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded mb-2">
                          {course.category}
                        </span>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>{isArabic ? 'التقدم' : 'Progression'}</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              completed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/course/${course.id}`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs rounded-md transition-all font-medium"
                      >
                        {completed 
                          ? (isArabic ? 'مراجعة' : 'Réviser')
                          : progress > 0 
                            ? (isArabic ? 'متابعة' : 'Continuer')
                            : (isArabic ? 'بدء' : 'Commencer')
                        }
                      </Link>
                    </div>
                  </div>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      currentPage === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {isArabic ? 'السابق' : 'Précédent'}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={pageNum} className="text-gray-500">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      currentPage === totalPages
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isArabic ? 'التالي' : 'Suivant'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Results Summary */}
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {isArabic 
                  ? `عرض ${indexOfFirstCourse + 1}-${Math.min(indexOfLastCourse, filteredCourses.length)} من ${filteredCourses.length} دروس`
                  : `Affichage de ${indexOfFirstCourse + 1}-${Math.min(indexOfLastCourse, filteredCourses.length)} sur ${filteredCourses.length} cours`
                }
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
