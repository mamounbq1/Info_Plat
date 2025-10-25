import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import AvailableExercises from '../components/AvailableExercises';

export default function StudentExercises() {
  const { userProfile } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      // Fetch all exercises
      const exercisesQuery = query(collection(db, 'exercises'));
      const exercisesSnapshot = await getDocs(exercisesQuery);
      const exercisesData = exercisesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error fetching exercises:', error);
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
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {isArabic ? 'التمارين المتاحة' : 'Exercices Disponibles'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {isArabic 
                  ? 'تدرب وحسّن مهاراتك' 
                  : 'Pratiquez et améliorez vos compétences'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  {isArabic ? 'جاري التحميل...' : 'Chargement...'}
                </p>
              </div>
            </div>
          ) : (
            <AvailableExercises 
              exercises={exercises}
              userProfile={userProfile}
              isArabic={isArabic}
            />
          )}
        </div>
      </div>
    </div>
  );
}
