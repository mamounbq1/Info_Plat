import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { matchesStudentClassOrLevel } from '../utils/courseProgress';
import { 
  BookOpenIcon, 
  BookmarkIcon,
  ShareIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Import new components
import Sidebar from '../components/Sidebar';
import CourseFilters from '../components/CourseFilters';
import EnhancedStats from '../components/EnhancedStats';
import ContinueLearning from '../components/ContinueLearning';
import Achievements from '../components/Achievements';
import CourseRecommendations from '../components/CourseRecommendations';
import FloatingActionButton from '../components/FloatingActionButton';
import ActivityTimeline from '../components/ActivityTimeline';
import SearchModal from '../components/SearchModal';
import AvailableQuizzes from '../components/AvailableQuizzes';
import AvailableExercises from '../components/AvailableExercises';
import EnrolledCourses from '../components/EnrolledCourses';
import StudyGoalsAndStreak from '../components/StudyGoalsAndStreak';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import NotificationCenter from '../components/NotificationCenter';
import { StatsSkeleton, CoursesGridSkeleton } from '../components/LoadingSkeleton';
import { Confetti } from '../components/ProgressCircle';

export default function EnhancedStudentDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  
  // Data states
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [subjects, setSubjects] = useState([]); // NEW: Subjects for filter
  const [loading, setLoading] = useState(true);
  
  // Filter states - SIMPLIFIED: Only search, subject, and date sort
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // User interaction states
  const [bookmarkedCourses, setBookmarkedCourses] = useState(userProfile?.bookmarks || []);
  const [likedCourses, setLikedCourses] = useState(userProfile?.likes || []);
  const [enrolledCourses, setEnrolledCourses] = useState(userProfile?.enrolledCourses || []);
  
  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Search modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Confetti state for celebrations
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    fetchData();
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Update bookmarks when userProfile changes
    if (userProfile?.bookmarks) {
      setBookmarkedCourses(userProfile.bookmarks);
    }
    if (userProfile?.likes) {
      setLikedCourses(userProfile.likes);
    }
    if (userProfile?.enrolledCourses) {
      setEnrolledCourses(userProfile.enrolledCourses);
    }
  }, [userProfile]);

  const fetchSubjects = async () => {
    try {
      const subjectsQuery = query(collection(db, 'subjects'), orderBy('order', 'asc'));
      const subjectsSnapshot = await getDocs(subjectsQuery);
      const subjectsData = subjectsSnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setSubjects(subjectsData);
      console.log('✅ Subjects loaded:', subjectsData.length);
    } catch (error) {
      console.error('⚠️ Error fetching subjects:', error);
      // Don't show error toast, subjects are optional for filtering
      setSubjects([]);
    }
  };

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
        setQuizzes([]);
      }

      // Fetch all published exercises
      try {
        const exercisesQuery = query(
          collection(db, 'exercises'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
        const exercisesSnapshot = await getDocs(exercisesQuery);
        const exercisesData = exercisesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExercises(exercisesData);
        console.log('✅ Exercises loaded:', exercisesData.length);
      } catch (error) {
        console.error('⚠️ Error fetching exercises:', error);
        if (error.code === 'failed-precondition') {
          console.warn('ℹ️ Exercises index not created. Exercises feature will be unavailable.');
        }
        setExercises([]);
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

  // Calculate filtered counts for student's class/level
  const getFilteredCounts = () => {
    const filteredCourses = courses.filter(c => matchesStudentClassOrLevel(c, userProfile));
    const filteredQuizzes = quizzes.filter(q => matchesStudentClassOrLevel(q, userProfile));
    const filteredExercises = exercises.filter(e => matchesStudentClassOrLevel(e, userProfile));
    
    return {
      coursesCount: filteredCourses.length,
      quizzesCount: filteredQuizzes.length,
      exercisesCount: filteredExercises.length,
      availableCoursesCount: filteredCourses.filter(c => !enrolledCourses.includes(c.id)).length,
      enrolledCoursesCount: filteredCourses.filter(c => enrolledCourses.includes(c.id)).length
    };
  };

  const filteredCounts = getFilteredCounts();

  // Filter and sort courses - SIMPLIFIED: Only by subject and date
  const filteredAndSortedCourses = courses
    .filter(course => {
      // Exclude enrolled courses from browse section
      const notEnrolled = !enrolledCourses.includes(course.id);
      
      // ACADEMIC HIERARCHY: Filter by student's class/level
      const matchesStudentClassLevel = matchesStudentClassOrLevel(course, userProfile);
      
      // Search filter
      const matchesSearch = !searchTerm || 
        course.titleFr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.titleAr?.includes(searchTerm) ||
        course.descriptionFr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.descriptionAr?.includes(searchTerm);
      
      // Subject filter (matière) - NEW SIMPLIFIED FILTER
      const matchesSubject = selectedSubject === 'all' || course.subject === selectedSubject;
      
      return notEnrolled && matchesStudentClassLevel && matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      // Date sorting only - SIMPLIFIED
      switch(sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredAndSortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject, sortBy]);

  // Bookmark/Like handlers
  const toggleBookmark = async (courseId) => {
    const newBookmarks = bookmarkedCourses.includes(courseId)
      ? bookmarkedCourses.filter(id => id !== courseId)
      : [...bookmarkedCourses, courseId];
    
    setBookmarkedCourses(newBookmarks);
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        bookmarks: newBookmarks
      });
      toast.success(
        newBookmarks.includes(courseId)
          ? (isArabic ? 'تمت الإضافة إلى المفضلة' : 'Ajouté aux favoris')
          : (isArabic ? 'تمت الإزالة من المفضلة' : 'Retiré des favoris')
      );
    } catch (error) {
      console.error('Error updating bookmarks:', error);
      setBookmarkedCourses(bookmarkedCourses); // Revert on error
    }
  };

  const toggleLike = async (courseId) => {
    const newLikes = likedCourses.includes(courseId)
      ? likedCourses.filter(id => id !== courseId)
      : [...likedCourses, courseId];
    
    setLikedCourses(newLikes);
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        likes: newLikes
      });
      
      // Show confetti if user likes a course
      if (!likedCourses.includes(courseId)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      setLikedCourses(likedCourses); // Revert on error
    }
  };

  // Enroll/Unenroll functionality
  const toggleEnrollment = async (courseId) => {
    const isEnrolled = enrolledCourses.includes(courseId);
    const newEnrolled = isEnrolled
      ? enrolledCourses.filter(id => id !== courseId)
      : [...enrolledCourses, courseId];
    
    setEnrolledCourses(newEnrolled);
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        enrolledCourses: newEnrolled
      });
      
      toast.success(
        isEnrolled
          ? (isArabic ? 'تم إلغاء التسجيل من الدورة' : 'Désinscrit du cours')
          : (isArabic ? 'تم التسجيل في الدورة بنجاح!' : 'Inscrit au cours avec succès!')
      );
      
      // Show confetti when enrolling
      if (!isEnrolled) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      setEnrolledCourses(enrolledCourses); // Revert on error
      toast.error(isArabic ? 'خطأ في التسجيل' : 'Erreur d\'inscription');
    }
  };

  const shareCourse = async (course) => {
    const shareData = {
      title: isArabic ? course.titleAr : course.titleFr,
      text: `${isArabic ? 'اطلع على هذه الدورة' : 'Découvrez ce cours'}: ${isArabic ? course.titleAr : course.titleFr}`,
      url: `${window.location.origin}/course/${course.id}`
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success(isArabic ? 'تمت المشاركة بنجاح' : 'Partagé avec succès');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      toast.success(isArabic ? 'تم نسخ الرابط' : 'Lien copié');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Confetti Effect */}
      {showConfetti && <Confetti />}
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)}
        courses={courses}
      />
      
      {/* Sidebar - Fixed */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Main Content - No navbar, full height, offset for sidebar */}
      <div className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-6 max-w-7xl">
        {/* Welcome Banner - Ultra Compact */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold mb-0.5">
                {isArabic ? 'مرحباً' : 'Bonjour'}, {userProfile?.fullName?.split(' ')[0] || userProfile?.fullName}! 👋
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm">
                {isArabic 
                  ? 'استمر في رحلة التعلم'
                  : 'Continuez votre apprentissage'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Notification Center */}
              <NotificationCenter 
                userId={currentUser.uid}
                userProfile={userProfile}
                isArabic={isArabic}
              />
              
              {/* Points Display */}
              <div className="hidden sm:flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-lg md:text-xl font-bold">{userProfile?.points || 0}</span>
                <span className="text-yellow-300">★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards - VIVID COLORS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
          {/* Performance & Analytics Link - VIVID PURPLE */}
          <Link
            to="/student/performance"
            className="bg-gradient-to-br from-purple-600 via-purple-500 to-fuchsia-500 text-white rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl hover:scale-105 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg" />
              <span className="text-xs sm:text-sm bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold shadow-md">
                {isArabic ? 'جديد' : 'Nouveau'}
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base mb-1 drop-shadow-md">
              {isArabic ? 'الأداء' : 'Performance'}
            </h3>
            <p className="text-xs text-purple-50 line-clamp-2">
              {isArabic ? 'الإحصائيات والأهداف' : 'Stats & Objectifs'}
            </p>
          </Link>

          {/* Quizzes Link - VIVID PINK/MAGENTA */}
          <Link
            to="/student/quizzes"
            className="bg-gradient-to-br from-pink-600 via-pink-500 to-rose-500 text-white rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl hover:scale-105 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <ClipboardDocumentCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg" />
              <span className="text-xs sm:text-sm bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold shadow-md">
                {filteredCounts.quizzesCount}
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base mb-1 drop-shadow-md">
              {isArabic ? 'الاختبارات' : 'Quiz'}
            </h3>
            <p className="text-xs text-pink-50 line-clamp-2">
              {isArabic ? 'اختبارات متاحة' : 'Quiz disponibles'}
            </p>
          </Link>

          {/* Exercises Link - VIVID BLUE */}
          <Link
            to="/student/exercises"
            className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl hover:scale-105 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <DocumentTextIcon className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg" />
              <span className="text-xs sm:text-sm bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold shadow-md">
                {filteredCounts.exercisesCount}
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base mb-1 drop-shadow-md">
              {isArabic ? 'التمارين' : 'Exercices'}
            </h3>
            <p className="text-xs text-blue-50 line-clamp-2">
              {isArabic ? 'تمارين متاحة' : 'Exercices disponibles'}
            </p>
          </Link>

          {/* Courses Link - VIVID GREEN/EMERALD */}
          <a
            href="#all-courses"
            className="bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 text-white rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl hover:scale-105 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <BookOpenIcon className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg" />
              <span className="text-xs sm:text-sm bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold shadow-md">
                {filteredCounts.availableCoursesCount}
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base mb-1 drop-shadow-md">
              {isArabic ? 'الدروس' : 'Cours'}
            </h3>
            <p className="text-xs text-emerald-50 line-clamp-2">
              {isArabic ? 'تصفح الدروس' : 'Parcourir cours'}
            </p>
          </a>
        </div>

        {/* TODO: Move to separate "Performance" page */}
        {/* Enhanced Statistics */}
        {/* {loading ? (
          <StatsSkeleton />
        ) : (
          <EnhancedStats 
            courses={courses}
            quizzes={quizzes}
            userProfile={userProfile}
            isArabic={isArabic}
            getProgressPercentage={getProgressPercentage}
          />
        )} */}

        {/* TODO: Move to separate "Performance" page */}
        {/* Study Goals and Streak Counter */}
        {/* {!loading && (
          <StudyGoalsAndStreak 
            userId={currentUser.uid}
            userProfile={userProfile}
            isArabic={isArabic}
          />
        )} */}

        {/* TODO: Move to separate "Quizzes" page */}
        {/* Available Quizzes Section */}
        {/* {!loading && (
          <AvailableQuizzes 
            quizzes={quizzes}
            userProfile={userProfile}
            isArabic={isArabic}
          />
        )} */}

        {/* TODO: Move to separate "Exercises" page */}
        {/* Available Exercises Section */}
        {/* {!loading && (
          <AvailableExercises 
            exercises={exercises}
            userProfile={userProfile}
            isArabic={isArabic}
          />
        )} */}

        {/* Enrolled Courses Section */}
        {!loading && (
          <EnrolledCourses 
            courses={courses}
            enrolledCourseIds={enrolledCourses}
            getProgressPercentage={getProgressPercentage}
            userProfile={userProfile}
            isArabic={isArabic}
            onUnenroll={toggleEnrollment}
          />
        )}

        {/* Course Filters - SIMPLIFIED: Only Date and Subject */}
        <CourseFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          sortBy={sortBy}
          setSortBy={setSortBy}
          isArabic={isArabic}
          resultCount={filteredAndSortedCourses.length}
          subjects={subjects}
        />

        {/* Browse Available Courses Section */}
        <div className="mb-4" id="all-courses">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {isArabic ? 'تصفح الدروس المتاحة' : 'Parcourir les Cours Disponibles'}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredAndSortedCourses.length})
              </span>
            </h2>
            
            {/* View Mode Toggle */}
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isArabic ? 'شبكة' : 'Grille'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isArabic ? 'قائمة' : 'Liste'}
              </button>
            </div>
          </div>
          
          {loading ? (
            <CoursesGridSkeleton count={8} viewMode={viewMode} />
          ) : filteredAndSortedCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-10 sm:p-16 text-center">
              <BookOpenIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-1">
                {isArabic ? 'لا توجد دروس متطابقة' : 'Aucun cours correspondant'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                {isArabic ? 'جرب تغيير الفلاتر' : 'Essayez de modifier vos filtres'}
              </p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4' : 'space-y-3'}>
                {currentCourses.map((course) => (
                  <CourseCard 
                    key={course.id}
                    course={course}
                    isArabic={isArabic}
                    viewMode={viewMode}
                    progress={getProgressPercentage(course.id)}
                    isBookmarked={bookmarkedCourses.includes(course.id)}
                    isLiked={likedCourses.includes(course.id)}
                    isEnrolled={enrolledCourses.includes(course.id)}
                    onToggleBookmark={() => toggleBookmark(course.id)}
                    onToggleLike={() => toggleLike(course.id)}
                    onToggleEnrollment={() => toggleEnrollment(course.id)}
                    onShare={() => shareCourse(course)}
                  />
                ))}
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
                      // Show first page, last page, current page, and pages around current
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
                  ? `عرض ${indexOfFirstCourse + 1}-${Math.min(indexOfLastCourse, filteredAndSortedCourses.length)} من ${filteredAndSortedCourses.length} دروس`
                  : `Affichage de ${indexOfFirstCourse + 1}-${Math.min(indexOfLastCourse, filteredAndSortedCourses.length)} sur ${filteredAndSortedCourses.length} cours`
                }
              </div>
            </>
          )}
        </div>

        {/* TODO: Move to separate "Performance" page */}
        {/* Analytics Dashboard */}
        {/* {!loading && (
          <AnalyticsDashboard 
            courses={courses}
            userProfile={userProfile}
            getProgressPercentage={getProgressPercentage}
            isArabic={isArabic}
          />
        )} */}

        {/* REMOVED: Popular Courses / Recommendations (as requested) */}

        {/* TODO: Move to separate "Performance" page */}
        {/* Activity Timeline */}
        {/* {!loading && (
          <ActivityTimeline 
            userProfile={userProfile}
            courses={courses}
          />
        )} */}

        {/* TODO: Move to separate "Performance" page */}
        {/* Achievements Section */}
        {/* {!loading && (
          <Achievements 
            courses={courses}
            userProfile={userProfile}
            isArabic={isArabic}
            getProgressPercentage={getProgressPercentage}
          />
        )} */}

        {/* TODO: Move to separate page or keep for quick access */}
        {/* Continue Learning Section */}
        {/* {!loading && (
          <ContinueLearning 
            courses={courses}
            userProfile={userProfile}
            isArabic={isArabic}
            getProgressPercentage={getProgressPercentage}
          />
        )} */}
        </div>
      </div>
    </div>
  );
}

// Enhanced Course Card Component
function CourseCard({ 
  course, 
  isArabic, 
  viewMode, 
  progress,
  isBookmarked,
  isLiked,
  isEnrolled,
  onToggleBookmark,
  onToggleLike,
  onToggleEnrollment,
  onShare
}) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col sm:flex-row group border border-gray-100 dark:border-gray-700">
        {course.thumbnail && (
          <img 
            src={course.thumbnail} 
            alt={isArabic ? course.titleAr : course.titleFr}
            className="w-full sm:w-32 h-32 sm:h-auto object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="flex-1 p-3">
          <div className="flex justify-between items-start mb-1.5">
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                {isArabic ? course.titleAr : course.titleFr}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-1 text-xs">
                {isArabic ? course.descriptionAr : course.descriptionFr}
              </p>
            </div>
            <div className="flex gap-1 ml-2">
              <button
                onClick={(e) => { e.preventDefault(); onToggleLike(); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {isLiked ? (
                  <HeartIconSolid className="w-4 h-4 text-red-500 animate-pulse" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onToggleBookmark(); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {isBookmarked ? (
                  <BookmarkIconSolid className="w-4 h-4 text-blue-500" />
                ) : (
                  <BookmarkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onShare(); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ShareIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {course.category && (
              <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                {course.category}
              </span>
            )}
            {course.level && (
              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                {course.level}
              </span>
            )}
            {progress > 0 && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {progress}%
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); onToggleEnrollment(); }}
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-1.5 text-xs rounded-md transition-all font-medium shadow-sm"
            >
              {isArabic ? '✓ التسجيل' : '✓ S\'inscrire'}
            </button>
            <Link 
              to={`/course/${course.id}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs rounded-md transition-all font-medium"
            >
              {isArabic ? 'عرض' : 'Voir'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-100 dark:border-gray-700">
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
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white flex-1 line-clamp-2 leading-tight">
            {isArabic ? course.titleAr : course.titleFr}
          </h3>
          <div className="flex gap-0.5 ml-1">
            <button
              onClick={(e) => { e.preventDefault(); onToggleLike(); }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            >
              {isLiked ? (
                <HeartIconSolid className="w-4 h-4 text-red-500 animate-pulse" />
              ) : (
                <HeartIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onToggleBookmark(); }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            >
              {isBookmarked ? (
                <BookmarkIconSolid className="w-4 h-4 text-blue-500" />
              ) : (
                <BookmarkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-1.5 line-clamp-1 text-xs">
          {isArabic ? course.descriptionAr : course.descriptionFr}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-1.5">
          {course.category && (
            <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
              {course.category}
            </span>
          )}
          {course.level && (
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
              {course.level}
            </span>
          )}
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-0.5">
              <span className="text-xs">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-1.5">
          <button
            onClick={(e) => { e.preventDefault(); onToggleEnrollment(); }}
            className="w-full text-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-1.5 text-xs rounded-md transition-all font-medium shadow-sm"
          >
            {isArabic ? '✓ التسجيل في الدورة' : '✓ S\'inscrire'}
          </button>
          <div className="flex gap-1">
            <Link 
              to={`/course/${course.id}`}
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-1.5 text-xs rounded-md transition-all font-medium"
            >
              {isArabic ? 'عرض' : 'Voir'}
            </Link>
            <button
              onClick={onShare}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <ShareIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
