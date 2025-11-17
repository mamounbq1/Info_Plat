import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import {
  UsersIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function AdminAnalytics() {
  const { isArabic } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    uniqueVisitors: 0,
    totalPageViews: 0,
    avgSessionDuration: 0,
    topPages: [],
    recentActivities: [],
    visitorsByDay: [],
    browserStats: {},
    userActivities: []
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics(true); // true = silent refresh (no loading screen)
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Fetch all analytics data
      const [
        visitorStats,
        pageViews,
        recentActivities,
        dailyStats
      ] = await Promise.all([
        fetchVisitorStats(),
        fetchPageViews(),
        fetchRecentActivities(),
        fetchDailyStats()
      ]);

      setStats({
        ...visitorStats,
        ...pageViews,
        recentActivities,
        visitorsByDay: dailyStats
      });
      
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchVisitorStats = async () => {
    try {
      const visitorsQuery = query(collection(db, 'visitorStats'));
      const snapshot = await getDocs(visitorsQuery);
      
      const totalPageViews = snapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().totalPageViews || 0);
      }, 0);

      return {
        totalVisitors: snapshot.size,
        uniqueVisitors: snapshot.docs.filter(doc => !doc.data().isReturningVisitor).length,
        totalPageViews
      };
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
      return { totalVisitors: 0, uniqueVisitors: 0, totalPageViews: 0 };
    }
  };

  const fetchPageViews = async () => {
    try {
      const analyticsQuery = query(
        collection(db, 'analytics'),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );
      const snapshot = await getDocs(analyticsQuery);
      
      // Count pages
      const pageCounts = {};
      const browserCounts = {};
      let totalDuration = 0;
      let durationCount = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Count pages
        const page = data.pathname || '/';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
        
        // Count browsers
        const browser = getBrowserName(data.userAgent || '');
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        
        // Session duration
        if (data.sessionDuration) {
          totalDuration += data.sessionDuration;
          durationCount++;
        }
      });

      // Sort top pages
      const topPages = Object.entries(pageCounts)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const avgSessionDuration = durationCount > 0 ? Math.round(totalDuration / durationCount / 1000) : 0;

      return {
        topPages,
        browserStats: browserCounts,
        avgSessionDuration
      };
    } catch (error) {
      console.error('Error fetching page views:', error);
      return { topPages: [], browserStats: {}, avgSessionDuration: 0 };
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activitiesQuery = query(
        collection(db, 'analytics'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(activitiesQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  };

  const fetchDailyStats = async () => {
    try {
      const dailyQuery = query(
        collection(db, 'dailyStats'),
        orderBy('date', 'desc'),
        limit(30)
      );
      const snapshot = await getDocs(dailyQuery);
      
      return snapshot.docs.map(doc => ({
        date: doc.id,
        ...doc.data()
      })).reverse();
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      return [];
    }
  };

  const getBrowserName = (userAgent) => {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Other';
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getPageTitle = (pathname) => {
    const titles = {
      '/': isArabic ? 'الصفحة الرئيسية' : 'Accueil',
      '/login': isArabic ? 'تسجيل الدخول' : 'Connexion',
      '/signup': isArabic ? 'التسجيل' : 'Inscription',
      '/courses': isArabic ? 'الدروس' : 'Cours',
      '/student-dashboard': isArabic ? 'لوحة الطالب' : 'Tableau étudiant',
      '/teacher-dashboard': isArabic ? 'لوحة المعلم' : 'Tableau enseignant',
      '/admin-dashboard': isArabic ? 'لوحة الإدارة' : 'Tableau admin',
      '/about': isArabic ? 'من نحن' : 'À propos',
      '/privacy': isArabic ? 'سياسة الخصوصية' : 'Confidentialité',
      '/terms': isArabic ? 'شروط الاستخدام' : 'Conditions'
    };
    return titles[pathname] || pathname;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isArabic ? 'إحصائيات الموقع' : 'Statistiques du Site'}
          </h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isArabic ? 'آخر تحديث: ' : 'Dernière mise à jour: '}
              {lastUpdate.toLocaleTimeString()}
              {refreshing && (
                <span className="ml-2 text-purple-600 dark:text-purple-400 animate-pulse">
                  {isArabic ? '● تحديث...' : '● Actualisation...'}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
            {isArabic ? 'تحديث تلقائي كل 30 ثانية' : 'Auto-refresh 30s'}
          </div>
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchAnalytics();
            }}
            disabled={refreshing}
            className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              refreshing ? 'animate-pulse' : ''
            }`}
          >
            <ArrowTrendingUpIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {isArabic ? 'تحديث' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<UsersIcon className="w-8 h-8" />}
          title={isArabic ? 'إجمالي الزوار' : 'Total Visiteurs'}
          value={stats.totalVisitors}
          color="blue"
          subtitle={isArabic ? 'زائر فريد' : 'visiteurs uniques'}
        />
        <StatCard
          icon={<EyeIcon className="w-8 h-8" />}
          title={isArabic ? 'مشاهدات الصفحات' : 'Pages Vues'}
          value={stats.totalPageViews}
          color="green"
          subtitle={isArabic ? 'إجمالي المشاهدات' : 'vues totales'}
        />
        <StatCard
          icon={<UserGroupIcon className="w-8 h-8" />}
          title={isArabic ? 'زوار جدد' : 'Nouveaux Visiteurs'}
          value={stats.uniqueVisitors}
          color="purple"
          subtitle={isArabic ? 'زيارة أولى' : 'première visite'}
        />
        <StatCard
          icon={<ClockIcon className="w-8 h-8" />}
          title={isArabic ? 'متوسط المدة' : 'Durée Moyenne'}
          value={formatDuration(stats.avgSessionDuration)}
          color="orange"
          subtitle={isArabic ? 'لكل جلسة' : 'par session'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            {isArabic ? 'أكثر الصفحات زيارة' : 'Pages les Plus Visitées'}
          </h3>
          <div className="space-y-3">
            {stats.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl font-bold text-purple-600">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {getPageTitle(page.page)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(page.count / stats.topPages[0].count) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                    {page.count}
                  </span>
                </div>
              </div>
            ))}
            {stats.topPages.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {isArabic ? 'لا توجد بيانات' : 'Aucune donnée'}
              </p>
            )}
          </div>
        </div>

        {/* Browser Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ComputerDesktopIcon className="w-5 h-5" />
            {isArabic ? 'المتصفحات المستخدمة' : 'Navigateurs Utilisés'}
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.browserStats)
              .sort((a, b) => b[1] - a[1])
              .map(([browser, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {browser}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Object.values(stats.browserStats).reduce((a, b) => Math.max(a, b), 0)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            {Object.keys(stats.browserStats).length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {isArabic ? 'لا توجد بيانات' : 'Aucune donnée'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            {isArabic ? 'النشاطات الأخيرة' : 'Activités Récentes'}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isArabic 
              ? `إجمالي: ${stats.recentActivities.length}` 
              : `Total: ${stats.recentActivities.length}`}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {isArabic ? 'الوقت' : 'Temps'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {isArabic ? 'المستخدم' : 'Utilisateur'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {isArabic ? 'الصفحة' : 'Page'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {isArabic ? 'المتصفح' : 'Navigateur'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {isArabic ? 'الدور' : 'Rôle'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(() => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedActivities = stats.recentActivities.slice(startIndex, endIndex);
                
                if (paginatedActivities.length === 0) {
                  return (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {isArabic ? 'لا توجد نشاطات حديثة' : 'Aucune activité récente'}
                      </td>
                    </tr>
                  );
                }
                
                return paginatedActivities.map((activity, index) => (
                  <tr key={startIndex + index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                      {activity.userName || 'Anonymous'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {getPageTitle(activity.pathname)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {getBrowserName(activity.userAgent || '')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        activity.userRole === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        activity.userRole === 'teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        activity.userRole === 'student' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {activity.userRole || 'visitor'}
                      </span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {stats.recentActivities.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isArabic ? (
                <>عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, stats.recentActivities.length)} من أصل {stats.recentActivities.length}</>
              ) : (
                <>Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, stats.recentActivities.length)} sur {stats.recentActivities.length}</>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                {isArabic ? 'السابق' : 'Précédent'}
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const totalPages = Math.ceil(stats.recentActivities.length / itemsPerPage);
                  const pages = [];
                  const maxVisiblePages = 5;
                  
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  // First page button
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key="first"
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(<span key="dots1" className="px-2 text-gray-400">...</span>);
                    }
                  }
                  
                  // Page number buttons
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          currentPage === i
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // Last page button
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(<span key="dots2" className="px-2 text-gray-400">...</span>);
                    }
                    pages.push(
                      <button
                        key="last"
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(stats.recentActivities.length / itemsPerPage), prev + 1))}
                disabled={currentPage >= Math.ceil(stats.recentActivities.length / itemsPerPage)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  currentPage >= Math.ceil(stats.recentActivities.length / itemsPerPage)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
                }`}
              >
                {isArabic ? 'التالي' : 'Suivant'}
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Visitors Chart */}
      {stats.visitorsByDay.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5" />
            {isArabic ? 'الزوار اليوميون (آخر 30 يوم)' : 'Visiteurs Quotidiens (30 derniers jours)'}
          </h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {stats.visitorsByDay.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-purple-600 rounded-t-lg hover:bg-purple-700 transition"
                  style={{
                    height: `${(day.totalViews / Math.max(...stats.visitorsByDay.map(d => d.totalViews))) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`${day.date}: ${day.totalViews} vues`}
                ></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-xl p-6 shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="opacity-80">
          {icon}
        </div>
      </div>
      <p className="text-white/80 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-white/70 text-xs">{subtitle}</p>
    </div>
  );
}
