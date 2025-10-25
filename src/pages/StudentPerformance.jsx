import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import EnhancedStats from '../components/EnhancedStats';
import StudyGoalsAndStreak from '../components/StudyGoalsAndStreak';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ActivityTimeline from '../components/ActivityTimeline';
import Achievements from '../components/Achievements';
import { StatsSkeleton } from '../components/LoadingSkeleton';

export default function StudentPerformance() {
  const { currentUser, userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all courses
      const coursesQuery = query(collection(db, 'courses'));
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);

      // Fetch all quizzes
      const quizzesQuery = query(collection(db, 'quizzes'));
      const quizzesSnapshot = await getDocs(quizzesQuery);
      const quizzesData = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuizzes(quizzesData);

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (courseId) => {
    if (!userProfile?.progress) return 0;
    return userProfile.progress[courseId] || 0;
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">
              {isArabic ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}
            </span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {isArabic ? 'الأداء والتحليلات' : 'Performance & Analyse'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {isArabic 
                  ? 'تتبع تقدمك وتحليل أدائك الأكاديمي' 
                  : 'Suivez votre progression et analysez vos performances'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Enhanced Statistics */}
          {loading ? (
            <StatsSkeleton />
          ) : (
            <EnhancedStats 
              courses={courses}
              quizzes={quizzes}
              userProfile={userProfile}
              isArabic={isArabic}
              getProgressPercentage={getProgressPercentage}
            />
          )}

          {/* Study Goals and Streak Counter */}
          {!loading && (
            <StudyGoalsAndStreak 
              userId={currentUser.uid}
              userProfile={userProfile}
              isArabic={isArabic}
            />
          )}

          {/* Analytics Dashboard */}
          {!loading && (
            <AnalyticsDashboard 
              courses={courses}
              userProfile={userProfile}
              getProgressPercentage={getProgressPercentage}
              isArabic={isArabic}
            />
          )}

          {/* Activity Timeline */}
          {!loading && (
            <ActivityTimeline 
              userProfile={userProfile}
              courses={courses}
            />
          )}

          {/* Achievements Section */}
          {!loading && (
            <Achievements 
              courses={courses}
              userProfile={userProfile}
              isArabic={isArabic}
              getProgressPercentage={getProgressPercentage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
