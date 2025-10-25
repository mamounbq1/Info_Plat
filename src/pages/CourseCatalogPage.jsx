import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { 
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export default function CourseCatalogPage() {
  const { isArabic } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('published', '==', true));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (courseId) => {
    if (!currentUser) {
      toast.error(isArabic 
        ? 'يرجى تسجيل الدخول للتسجيل في الدورة'
        : 'Veuillez vous connecter pour vous inscrire au cours'
      );
      navigate('/login');
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  const levels = [
    { value: 'all', labelFr: 'Tous les niveaux', labelAr: 'كل المستويات' },
    { value: 'TC', labelFr: 'Tronc Commun', labelAr: 'الجذع المشترك' },
    { value: '1BAC', labelFr: '1ère Bac', labelAr: 'الأولى باكالوريا' },
    { value: '2BAC', labelFr: '2ème Bac', labelAr: 'الثانية باكالوريا' }
  ];

  const branches = [
    { value: 'all', labelFr: 'Toutes les filières', labelAr: 'كل الشعب' },
    { value: 'Sciences', labelFr: 'Sciences', labelAr: 'علوم' },
    { value: 'Lettres', labelFr: 'Lettres', labelAr: 'آداب' },
    { value: 'Economie', labelFr: 'Économie', labelAr: 'اقتصاد' }
  ];

  const filteredCourses = courses.filter(course => {
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    const branchMatch = selectedBranch === 'all' || course.branch === selectedBranch;
    return levelMatch && branchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>{isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Retour à l\'accueil'}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BookOpenIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'كتالوج الدورات' : 'Catalogue de Cours'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {isArabic 
              ? 'تصفح جميع الدورات المتاحة حسب المستوى والشعبة'
              : 'Parcourez tous les cours disponibles par niveau et filière'
            }
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'المستوى' : 'Niveau'}
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>
                  {isArabic ? level.labelAr : level.labelFr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الشعبة' : 'Filière'}
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {branches.map(branch => (
                <option key={branch.value} value={branch.value}>
                  {isArabic ? branch.labelAr : branch.labelFr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'لا توجد دورات متاحة لهذه المعايير' : 'Aucun cours disponible pour ces critères'}
            </p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
              >
                {/* Course Image/Icon */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <AcademicCapIcon className="w-20 h-20 text-white opacity-80 group-hover:scale-110 transition-transform" />
                </div>

                <div className="p-6">
                  {/* Tags */}
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full font-medium">
                      {course.level}
                    </span>
                    {course.branch && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs rounded-full font-medium">
                        {course.branch}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {isArabic ? course.titleAr : course.titleFr}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {isArabic ? course.descriptionAr : course.descriptionFr}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{course.duration || '10'} {isArabic ? 'ساعات' : 'heures'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{course.enrolledCount || 0} {isArabic ? 'طالب' : 'étudiants'}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleEnrollClick(course.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>{isArabic ? 'عرض الدورة' : 'Voir le cours'}</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <AcademicCapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'هل تحتاج إلى مساعدة؟' : 'Besoin d\'aide?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {isArabic 
                  ? 'إذا كنت بحاجة إلى مساعدة في اختيار الدورات المناسبة، يرجى الاتصال بإدارة المدرسة.'
                  : 'Si vous avez besoin d\'aide pour choisir les cours appropriés, veuillez contacter l\'administration scolaire.'
                }
              </p>
              <Link 
                to="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
              >
                {isArabic ? 'اتصل بنا ←' : 'Contactez-nous →'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
