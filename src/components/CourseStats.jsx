import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  UsersIcon,
  ClockIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function CourseStats({ courseId, isArabic, onClose }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    views: [],
    totalViews: 0,
    uniqueStudents: 0,
    averageTime: 0
  });

  useEffect(() => {
    fetchCourseStats();
  }, [courseId]);

  const fetchCourseStats = async () => {
    try {
      setLoading(true);
      
      // Fetch course views from a "courseViews" collection
      const viewsQuery = query(
        collection(db, 'courseViews'),
        where('courseId', '==', courseId),
        orderBy('viewedAt', 'desc')
      );

      const viewsSnapshot = await getDocs(viewsQuery);
      const viewsData = viewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate stats
      const uniqueStudents = new Set(viewsData.map(v => v.studentId)).size;
      const totalViews = viewsData.length;
      const averageTime = viewsData.reduce((sum, v) => sum + (v.duration || 0), 0) / totalViews || 0;

      setStats({
        views: viewsData,
        totalViews,
        uniqueStudents,
        averageTime
      });
    } catch (error) {
      console.error('Error fetching course stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isArabic ? 'إحصائيات الدرس' : 'Statistiques du Cours'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {isArabic ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <EyeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'إجمالي المشاهدات' : 'Total Vues'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalViews}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'طلاب فريدون' : 'Étudiants Uniques'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.uniqueStudents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'متوسط الوقت' : 'Temps Moyen'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(stats.averageTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Views List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'سجل المشاهدات' : 'Historique des Vues'}
              </h3>
              
              {stats.views.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {isArabic ? 'لا توجد مشاهدات بعد' : 'Aucune vue pour le moment'}
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.views.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <UsersIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {view.studentName || view.studentEmail}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                              {new Date(view.viewedAt).toLocaleString(isArabic ? 'ar' : 'fr')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        {formatDuration(view.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
