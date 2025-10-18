import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ClipboardDocumentCheckIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
        console.log('✅ Courses loaded:', coursesData.length);
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
          <p className="text-gray-600">
            {isArabic 
              ? 'استكشف الدروس والاختبارات الخاصة بك'
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isArabic ? 'الاختبارات المتاحة' : 'Quiz Disponibles'}
          </h2>
          
          {quizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isArabic ? 'لا توجد اختبارات متاحة حالياً' : 'Aucun quiz disponible pour le moment'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isArabic ? quiz.titleAr : quiz.titleFr}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {quiz.questions?.length || 0} {isArabic ? 'سؤال' : 'questions'}
                  </p>
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    {isArabic ? 'بدء الاختبار' : 'Commencer le quiz'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
