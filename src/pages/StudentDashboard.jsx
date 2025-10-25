import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ClipboardDocumentCheckIcon, AcademicCapIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { isCourseCompleted, canAccessQuizOrExercise, getCourseProgress } from '../utils/courseProgress';

export default function StudentDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizViewMode, setQuizViewMode] = useState('list'); // 'list' or 'grid' - default is LIST

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all published courses
      try {
        const coursesQuery = query(
          collection(db, 'courses'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        let coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter courses based on student's CLASS (new system) or LEVEL (backward compatibility)
        if (userProfile?.class) {
          // NEW SYSTEM: Filter by specific class
          coursesData = coursesData.filter(course => {
            // If course has targetClasses, filter by class
            if (course.targetClasses && course.targetClasses.length > 0) {
              return course.targetClasses.includes(userProfile.class);
            }
            
            // FALLBACK: If course uses old targetLevels system
            if (course.targetLevels && course.targetLevels.length > 0 && userProfile.level) {
              return course.targetLevels.includes(userProfile.level);
            }
            
            // If course has no targeting, show to everyone (backward compatibility)
            return true;
          });
          console.log(`✅ Courses filtered for class ${userProfile.class}:`, coursesData.length);
        } else if (userProfile?.level) {
          // OLD SYSTEM FALLBACK: Filter by level only
          coursesData = coursesData.filter(course => {
            if (!course.targetLevels || course.targetLevels.length === 0) {
              return true;
            }
            return course.targetLevels.includes(userProfile.level);
          });
          console.log(`⚠️ Fallback: Courses filtered by level ${userProfile.level}:`, coursesData.length);
        } else {
          console.warn('⚠️ Student has no class or level assigned - showing all courses');
        }
        
        setCourses(coursesData);
      } catch (error) {
        console.error('❌ Error fetching courses:', error);
        if (error.code === 'failed-precondition') {
          console.warn('⚠️ Courses index not created yet. Please create the index.');
        }
      }

      // Fetch all published quizzes (optional feature)
      try {
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizzesData = quizzesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuizzes(quizzesData);
        console.log('✅ Quizzes loaded:', quizzesData.length);
      } catch (error) {
        console.error('⚠️ Error fetching quizzes (optional feature):', error);
        if (error.code === 'failed-precondition') {
          console.warn('ℹ️ Quizzes index not created. Quizzes feature will be unavailable.');
        }
        // Don't show error toast for quizzes, it's optional
        setQuizzes([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(isArabic ? 'خطأ في تحميل البيانات' : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (courseId) => {
    if (!userProfile?.progress) return 0;
    return userProfile.progress[courseId] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome')}, {userProfile?.fullName}!
          </h1>
          
          {/* Display student's class */}
          {userProfile?.class && (
            <div className="mt-3 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium">
              <AcademicCapIcon className="w-5 h-5 mr-2" />
              <span>
                {isArabic ? userProfile.classNameAr : userProfile.classNameFr}
              </span>
            </div>
          )}
          
          <p className="text-gray-600 mt-3">
            {isArabic 
              ? userProfile?.class 
                ? 'استكشف الدروس الخاصة بفصلك'
                : 'استكشف الدروس والاختبارات الخاصة بك'
              : userProfile?.class
                ? 'Explorez les cours de votre classe'
                : 'Explorez vos cours et quiz disponibles'
            }
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-500 text-white rounded-xl shadow-md p-6">
            <BookOpenIcon className="w-12 h-12 mb-3 opacity-80" />
            <h3 className="text-3xl font-bold mb-1">{courses.length}</h3>
            <p className="text-blue-100">{isArabic ? 'الدروس المتاحة' : 'Cours disponibles'}</p>
          </div>
          
          <div className="bg-green-500 text-white rounded-xl shadow-md p-6">
            <ClipboardDocumentCheckIcon className="w-12 h-12 mb-3 opacity-80" />
            <h3 className="text-3xl font-bold mb-1">{quizzes.length}</h3>
            <p className="text-green-100">{isArabic ? 'الاختبارات المتاحة' : 'Quiz disponibles'}</p>
          </div>
          
          <div className="bg-purple-500 text-white rounded-xl shadow-md p-6">
            <AcademicCapIcon className="w-12 h-12 mb-3 opacity-80" />
            <h3 className="text-3xl font-bold mb-1">
              {Math.round(Object.values(userProfile?.progress || {}).reduce((a, b) => a + b, 0) / Math.max(courses.length, 1))}%
            </h3>
            <p className="text-purple-100">{isArabic ? 'التقدم العام' : 'Progression globale'}</p>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('myCourses')}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loading')}</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isArabic ? 'لا توجد دروس متاحة حالياً' : 'Aucun cours disponible pour le moment'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={isArabic ? course.titleAr : course.titleFr}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {isArabic ? course.titleAr : course.titleFr}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {isArabic ? course.descriptionAr : course.descriptionFr}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{isArabic ? 'التقدم' : 'Progression'}</span>
                        <span>{getProgressPercentage(course.id)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(course.id)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/course/${course.id}`}
                      className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      {t('viewCourse')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Quizzes Section */}
        <div>
          {/* Header with View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {isArabic ? 'الاختبارات المتاحة' : 'Quiz Disponibles'}
              {quizzes.length > 0 && (
                <span className="ml-2 text-lg font-normal text-gray-500">
                  ({quizzes.length})
                </span>
              )}
            </h2>
            
            {/* View Mode Toggle */}
            {quizzes.length > 0 && (
              <div className="flex gap-1">
                <button
                  onClick={() => setQuizViewMode('grid')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                    quizViewMode === 'grid'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isArabic ? 'شبكة' : 'Grille'}
                </button>
                <button
                  onClick={() => setQuizViewMode('list')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                    quizViewMode === 'list'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isArabic ? 'قائمة' : 'Liste'}
                </button>
              </div>
            )}
          </div>
          
          {quizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isArabic ? 'لا توجد اختبارات متاحة حالياً' : 'Aucun quiz disponible pour le moment'}
              </p>
            </div>
          ) : (
            <div className={quizViewMode === 'grid' 
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {quizzes.map((quiz) => {
                const accessCheck = canAccessQuizOrExercise(userProfile, quiz.courseId);
                const isLocked = !accessCheck.canAccess;
                const progress = getCourseProgress(userProfile, quiz.courseId);
                
                // LIST VIEW
                if (quizViewMode === 'list') {
                  return (
                    <div 
                      key={quiz.id} 
                      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${
                        isLocked ? 'border-red-400 opacity-60' : 'border-green-400'
                      }`}
                    >
                      <div className="p-4 flex items-center gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          isLocked ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          <ClipboardDocumentCheckIcon className={`w-7 h-7 ${
                            isLocked ? 'text-red-600' : 'text-green-600'
                          }`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex items-center gap-2" dir="auto">
                              {isArabic ? quiz.titleAr : quiz.titleFr}
                              {isLocked && <LockClosedIcon className="w-5 h-5 text-red-500" />}
                              {!isLocked && quiz.courseId && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium whitespace-nowrap">
                              {quiz.questions?.length || 0} {isArabic ? 'سؤال' : 'questions'}
                            </span>
                          </div>

                          {/* Course Prerequisite Status */}
                          {quiz.courseId && (
                            <div className="mb-2">
                              {isLocked ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                                  <p className="text-red-700 text-xs font-medium">
                                    🔒 {isArabic ? 'مغلق' : 'Verrouillé'} - {isArabic ? `يجب إكمال الدرس أولاً (${progress}%)` : `Terminez le cours d'abord (${progress}%)`}
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                  <p className="text-green-700 text-xs font-medium flex items-center gap-1">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    {isArabic ? 'متاح' : 'Disponible'}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
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
                            <Link 
                              to={`/quiz/${quiz.id}`}
                              className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <ClipboardDocumentCheckIcon className="w-4 h-4" />
                              {isArabic ? 'بدء الاختبار' : 'Commencer'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // GRID VIEW (Original)
                return (
                  <div 
                    key={quiz.id} 
                    className={`bg-white rounded-xl shadow-md p-6 transition ${
                      isLocked ? 'opacity-60' : 'hover:shadow-lg'
                    }`}
                  >
                    {/* Lock/Unlock Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {isArabic ? quiz.titleAr : quiz.titleFr}
                      </h3>
                      {isLocked ? (
                        <LockClosedIcon className="w-6 h-6 text-red-500" />
                      ) : (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                      {quiz.questions?.length || 0} {isArabic ? 'سؤال' : 'questions'}
                    </p>
                    
                    {/* Course prerequisite info */}
                    {quiz.courseId && (
                      <div className="mb-4">
                        {isLocked ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                            <p className="text-red-700 font-medium mb-1">
                              🔒 {isArabic ? 'مغلق' : 'Verrouillé'}
                            </p>
                            <p className="text-red-600 text-xs">
                              {isArabic 
                                ? `يجب إكمال الدرس أولاً (${progress}%)`
                                : `Terminez le cours d'abord (${progress}%)`
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                            <p className="text-green-700 font-medium flex items-center">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              {isArabic ? 'متاح' : 'Disponible'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isLocked ? (
                      <button
                        disabled
                        className="block w-full text-center bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed"
                      >
                        {isArabic ? 'مغلق' : 'Verrouillé'}
                      </button>
                    ) : (
                      <Link 
                        to={`/quiz/${quiz.id}`}
                        className="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        {isArabic ? 'بدء الاختبار' : 'Commencer le quiz'}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
