import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  BookmarkIcon,
  HeartIcon,
  BookOpenIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { CoursesGridSkeleton } from '../components/LoadingSkeleton';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Bookmarks() {
  const { currentUser, userProfile } = useAuth();
  const { isArabic } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' or 'likes'
  
  const [bookmarkedCourses, setBookmarkedCourses] = useState(userProfile?.bookmarks || []);
  const [likedCourses, setLikedCourses] = useState(userProfile?.likes || []);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (userProfile?.bookmarks) {
      setBookmarkedCourses(userProfile.bookmarks);
    }
    if (userProfile?.likes) {
      setLikedCourses(userProfile.likes);
    }
  }, [userProfile]);

  const fetchCourses = async () => {
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
      setBookmarkedCourses(bookmarkedCourses);
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
    } catch (error) {
      console.error('Error updating likes:', error);
      setLikedCourses(likedCourses);
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
      navigator.clipboard.writeText(shareData.url);
      toast.success(isArabic ? 'تم نسخ الرابط' : 'Lien copié');
    }
  };

  const getProgressPercentage = (courseId) => {
    if (!userProfile?.progress) return 0;
    return userProfile.progress[courseId] || 0;
  };

  const displayedCourses = activeTab === 'bookmarks' 
    ? courses.filter(course => bookmarkedCourses.includes(course.id))
    : courses.filter(course => likedCourses.includes(course.id));

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
              {isArabic ? 'المفضلة' : 'Favoris'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'جميع الدروس المحفوظة والمفضلة' : 'Tous vos cours sauvegardés et aimés'}
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                  activeTab === 'bookmarks'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <BookmarkIcon className="w-5 h-5" />
                <span>{isArabic ? 'محفوظة' : 'Sauvegardés'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'bookmarks' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {bookmarkedCourses.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('likes')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                  activeTab === 'likes'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <HeartIcon className="w-5 h-5" />
                <span>{isArabic ? 'مفضلة' : 'Aimés'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'likes' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {likedCourses.length}
                </span>
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <CoursesGridSkeleton count={6} viewMode="grid" />
          ) : displayedCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-16 text-center" data-section="bookmarks">
              {activeTab === 'bookmarks' ? (
                <BookmarkIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              ) : (
                <HeartIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              )}
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                {activeTab === 'bookmarks' 
                  ? (isArabic ? 'لا توجد دروس محفوظة' : 'Aucun cours sauvegardé')
                  : (isArabic ? 'لا توجد دروس مفضلة' : 'Aucun cours aimé')
                }
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {activeTab === 'bookmarks'
                  ? (isArabic ? 'احفظ الدروس لمشاهدتها لاحقاً' : 'Sauvegardez des cours pour plus tard')
                  : (isArabic ? 'أعجب بالدروس التي تحبها' : 'Aimez les cours qui vous plaisent')
                }
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                {isArabic ? 'استكشاف الدروس' : 'Explorer les cours'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedCourses.map((course) => {
                const progress = getProgressPercentage(course.id);
                
                return (
                  <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all group border border-gray-100 dark:border-gray-700">
                    {course.thumbnail && (
                      <div className="overflow-hidden">
                        <img 
                          src={course.thumbnail} 
                          alt={isArabic ? course.titleAr : course.titleFr}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1 line-clamp-2 leading-tight">
                          {isArabic ? course.titleAr : course.titleFr}
                        </h3>
                        <div className="flex gap-1 ml-1">
                          <button
                            onClick={(e) => { e.preventDefault(); toggleLike(course.id); }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                          >
                            {likedCourses.includes(course.id) ? (
                              <HeartIconSolid className="w-4 h-4 text-red-500" />
                            ) : (
                              <HeartIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); toggleBookmark(course.id); }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                          >
                            {bookmarkedCourses.includes(course.id) ? (
                              <BookmarkIconSolid className="w-4 h-4 text-blue-500" />
                            ) : (
                              <BookmarkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {course.category && (
                        <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded mb-2">
                          {course.category}
                        </span>
                      )}
                      
                      {/* Progress Bar */}
                      {progress > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-1">
                        <Link 
                          to={`/course/${course.id}`}
                          className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs rounded-md transition-all font-medium"
                        >
                          {isArabic ? 'عرض' : 'Voir'}
                        </Link>
                        <button
                          onClick={() => shareCourse(course)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          <ShareIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
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
