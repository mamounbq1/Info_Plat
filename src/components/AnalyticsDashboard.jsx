import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsDashboard() {
  const { isArabic } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
    avgProgress: 0,
    recentActivity: [],
    popularCourses: [],
    userGrowth: [],
    categoryStats: {}
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate user statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const pendingUsers = users.filter(u => u.status === 'pending').length;
      
      // Calculate course statistics
      const totalCourses = courses.length;
      const publishedCourses = courses.filter(c => c.published).length;
      
      // Calculate enrollments (sum of all enrolled courses)
      const totalEnrollments = users.reduce((sum, user) => {
        return sum + (user.enrolledCourses?.length || 0);
      }, 0);
      
      // Calculate average progress
      let totalProgress = 0;
      let progressCount = 0;
      users.forEach(user => {
        if (user.progress) {
          Object.values(user.progress).forEach(courseProgress => {
            if (typeof courseProgress === 'number') {
              totalProgress += courseProgress;
              progressCount++;
            }
          });
        }
      });
      const avgProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;
      
      // Calculate completion rate
      const completedCount = users.reduce((sum, user) => {
        if (user.progress) {
          return sum + Object.values(user.progress).filter(p => p >= 100).length;
        }
        return sum;
      }, 0);
      const completionRate = totalEnrollments > 0 
        ? Math.round((completedCount / totalEnrollments) * 100) 
        : 0;
      
      // Get popular courses (by enrollment count)
      const courseEnrollments = {};
      users.forEach(user => {
        user.enrolledCourses?.forEach(courseId => {
          courseEnrollments[courseId] = (courseEnrollments[courseId] || 0) + 1;
        });
      });
      
      const popularCourses = courses
        .map(course => ({
          ...course,
          enrollments: courseEnrollments[course.id] || 0
        }))
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5);
      
      // Calculate category statistics
      const categoryStats = {};
      courses.forEach(course => {
        const category = course.category || 'other';
        if (!categoryStats[category]) {
          categoryStats[category] = {
            count: 0,
            published: 0,
            enrollments: 0
          };
        }
        categoryStats[category].count++;
        if (course.published) categoryStats[category].published++;
        categoryStats[category].enrollments += courseEnrollments[course.id] || 0;
      });
      
      // Simulate user growth (last 7 days)
      const userGrowth = generateUserGrowthData(users);
      
      // Get recent activity
      const recentActivity = generateRecentActivity(users, courses);
      
      setAnalytics({
        totalUsers,
        activeUsers,
        pendingUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        completionRate,
        avgProgress,
        popularCourses,
        categoryStats,
        userGrowth,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUserGrowthData = (users) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      // Count users created on this day
      const count = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        return userDate.toDateString() === date.toDateString();
      }).length;
      
      data.push({ day: dayName, count });
    }
    
    return data;
  };

  const generateRecentActivity = (users, courses) => {
    const activities = [];
    
    // Add recent user registrations
    const recentUsers = [...users]
      .filter(u => u.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        message: isArabic 
          ? `${user.fullName} انضم للمنصة`
          : `${user.fullName} a rejoint la plateforme`,
        time: user.createdAt,
        icon: UserGroupIcon
      });
    });
    
    // Add recent course creations
    const recentCourses = [...courses]
      .filter(c => c.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);
    
    recentCourses.forEach(course => {
      activities.push({
        type: 'course_created',
        message: isArabic 
          ? `تم إنشاء درس جديد: ${course.titleAr}`
          : `Nouveau cours créé: ${course.titleFr}`,
        time: course.createdAt,
        icon: BookOpenIcon
      });
    });
    
    // Sort by time
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return isArabic ? 'الآن' : 'maintenant';
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return isArabic ? `منذ ${minutes} دقيقة` : `il y a ${minutes} min`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return isArabic ? `منذ ${hours} ساعة` : `il y a ${hours}h`;
    }
    const days = Math.floor(seconds / 86400);
    return isArabic ? `منذ ${days} يوم` : `il y a ${days}j`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={isArabic ? 'إجمالي المستخدمين' : 'Total Utilisateurs'}
          value={analytics.totalUsers}
          change="+12%"
          icon={UserGroupIcon}
          color="blue"
          subtitle={`${analytics.activeUsers} ${isArabic ? 'نشط' : 'actifs'}`}
        />
        <StatCard
          title={isArabic ? 'الدروس المنشورة' : 'Cours Publiés'}
          value={analytics.publishedCourses}
          change="+8%"
          icon={BookOpenIcon}
          color="green"
          subtitle={`${analytics.totalCourses} ${isArabic ? 'إجمالي' : 'total'}`}
        />
        <StatCard
          title={isArabic ? 'إجمالي التسجيلات' : 'Total Inscriptions'}
          value={analytics.totalEnrollments}
          change="+23%"
          icon={AcademicCapIcon}
          color="purple"
          subtitle={isArabic ? 'هذا الشهر' : 'ce mois'}
        />
        <StatCard
          title={isArabic ? 'معدل الإكمال' : 'Taux de Complétion'}
          value={`${analytics.completionRate}%`}
          change="+5%"
          icon={CheckCircleIcon}
          color="orange"
          subtitle={`${analytics.avgProgress}% ${isArabic ? 'متوسط التقدم' : 'progression moy.'}`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isArabic ? 'نمو المستخدمين' : 'Croissance des Utilisateurs'}
            </h3>
            <TrendingUpIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            {analytics.userGrowth.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                  {item.day}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500"
                    style={{ width: `${Math.max((item.count / Math.max(...analytics.userGrowth.map(d => d.count), 1)) * 100, 5)}%` }}
                  >
                    {item.count > 0 && item.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isArabic ? 'الدروس الأكثر شعبية' : 'Cours les Plus Populaires'}
            </h3>
            <FireIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-3">
            {analytics.popularCourses.map((course, index) => (
              <div key={course.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {isArabic ? course.titleAr : course.titleFr}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {course.enrollments} {isArabic ? 'طالب' : 'étudiants'}
                  </p>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                  {course.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          {isArabic ? 'إحصائيات حسب الفئة' : 'Statistiques par Catégorie'}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analytics.categoryStats).map(([category, stats]) => (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                {category}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'الدروس' : 'Cours'}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'منشور' : 'Publiés'}
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {stats.published}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'التسجيلات' : 'Inscriptions'}
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {stats.enrollments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {isArabic ? 'النشاط الأخير' : 'Activité Récente'}
          </h3>
          <ClockIcon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="space-y-3">
          {analytics.recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getTimeAgo(activity.time)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <InsightCard
          title={isArabic ? 'مستخدمون في الانتظار' : 'Utilisateurs en Attente'}
          value={analytics.pendingUsers}
          description={isArabic ? 'بحاجة للموافقة' : 'nécessitent approbation'}
          color="yellow"
          action={isArabic ? 'مراجعة الآن' : 'Réviser maintenant'}
        />
        <InsightCard
          title={isArabic ? 'المسودات' : 'Brouillons'}
          value={analytics.totalCourses - analytics.publishedCourses}
          description={isArabic ? 'دروس غير منشورة' : 'cours non publiés'}
          color="orange"
          action={isArabic ? 'نشر الدروس' : 'Publier les cours'}
        />
        <InsightCard
          title={isArabic ? 'التفاعل' : 'Engagement'}
          value={`${Math.round((analytics.totalEnrollments / Math.max(analytics.totalUsers, 1)) * 100)}%`}
          description={isArabic ? 'معدل التسجيل' : "taux d'inscription"}
          color="green"
          action={isArabic ? 'عرض التفاصيل' : 'Voir détails'}
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, change, icon: Icon, color, subtitle }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl p-6 shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
          {subtitle && (
            <p className="text-white/70 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-white/20 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1 text-sm">
          <TrendingUpIcon className="w-4 h-4" />
          <span className="font-medium">{change}</span>
          <span className="text-white/70 text-xs">vs mois dernier</span>
        </div>
      )}
    </div>
  );
}

// Insight Card Component
function InsightCard({ title, value, description, color, action }) {
  const colors = {
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
  };

  return (
    <div className={`border-2 rounded-xl p-6 ${colors[color]}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-80 mb-4">{description}</p>
      <button className="text-sm font-medium underline hover:no-underline transition">
        {action} →
      </button>
    </div>
  );
}
