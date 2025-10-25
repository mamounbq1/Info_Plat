import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import AvailableQuizzes from '../components/AvailableQuizzes';

export default function StudentQuizzes() {
  const { userProfile } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      
      // Fetch all quizzes
      const quizzesQuery = query(collection(db, 'quizzes'));
      const quizzesSnapshot = await getDocs(quizzesQuery);
      const quizzesData = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
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
            <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {isArabic ? 'الاختبارات المتاحة' : 'Quiz Disponibles'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {isArabic 
                  ? 'اختبر معرفتك واحصل على شهادات' 
                  : 'Testez vos connaissances et obtenez des certificats'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  {isArabic ? 'جاري التحميل...' : 'Chargement...'}
                </p>
              </div>
            </div>
          ) : (
            <AvailableQuizzes 
              quizzes={quizzes}
              userProfile={userProfile}
              isArabic={isArabic}
            />
          )}
        </div>
      </div>
    </div>
  );
}
