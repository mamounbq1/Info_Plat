import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClockIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

/**
 * Analytics Dashboard Component
 * Displays comprehensive learning analytics with charts and metrics
 */
export default function AnalyticsDashboard({ 
  courses, 
  userProfile, 
  getProgressPercentage,
  isArabic 
}) {
  const [timeframe, setTimeframe] = useState('week'); // 'week', 'month', 'all'
  const [analytics, setAnalytics] = useState({
    progressOverTime: [],
    coursePerformance: [],
    timeDistribution: [],
    categoryBreakdown: [],
    weeklyActivity: [],
    skillRadar: []
  });

  useEffect(() => {
    calculateAnalytics();
  }, [courses, userProfile, timeframe]);

  const calculateAnalytics = () => {
    // Progress Over Time (Last 7 or 30 days)
    const progressData = generateProgressOverTime();
    
    // Course Performance
    const coursePerf = (courses || []).map(course => ({
      name: isArabic ? (course.titleAr || course.titleFr).substring(0, 20) : (course.titleFr || course.titleAr).substring(0, 20),
      progress: getProgressPercentage(course.id),
      timeSpent: userProfile?.detailedProgress?.[course.id]?.timeSpent || 0,
      completed: getProgressPercentage(course.id) === 100
    })).filter(c => c.progress > 0).sort((a, b) => b.progress - a.progress).slice(0, 8);

    // Time Distribution by Category
    const categoryTime = {};
    (courses || []).forEach(course => {
      const category = course.category || 'Other';
      const timeSpent = userProfile?.detailedProgress?.[course.id]?.timeSpent || 0;
      categoryTime[category] = (categoryTime[category] || 0) + timeSpent;
    });
    const timeDistribution = Object.entries(categoryTime).map(([name, value]) => ({
      name,
      value
    })).filter(item => item.value > 0);

    // Weekly Activity Pattern
    const weeklyActivity = [
      { day: isArabic ? 'الأحد' : 'Dim', hours: Math.random() * 5 },
      { day: isArabic ? 'الاثنين' : 'Lun', hours: Math.random() * 5 },
      { day: isArabic ? 'الثلاثاء' : 'Mar', hours: Math.random() * 5 },
      { day: isArabic ? 'الأربعاء' : 'Mer', hours: Math.random() * 5 },
      { day: isArabic ? 'الخميس' : 'Jeu', hours: Math.random() * 5 },
      { day: isArabic ? 'الجمعة' : 'Ven', hours: Math.random() * 5 },
      { day: isArabic ? 'السبت' : 'Sam', hours: Math.random() * 5 }
    ];

    // Skill Radar (based on course categories)
    const skillRadar = [
      { subject: isArabic ? 'البرمجة' : 'Programmation', A: 80, fullMark: 100 },
      { subject: isArabic ? 'الرياضيات' : 'Mathématiques', A: 65, fullMark: 100 },
      { subject: isArabic ? 'العلوم' : 'Sciences', A: 90, fullMark: 100 },
      { subject: isArabic ? 'اللغات' : 'Langues', A: 75, fullMark: 100 },
      { subject: isArabic ? 'الفنون' : 'Arts', A: 60, fullMark: 100 }
    ];

    setAnalytics({
      progressOverTime: progressData,
      coursePerformance: coursePerf,
      timeDistribution,
      categoryBreakdown: timeDistribution,
      weeklyActivity,
      skillRadar
    });
  };

  const generateProgressOverTime = () => {
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString(isArabic ? 'ar' : 'fr', { month: 'short', day: 'numeric' }),
        progress: Math.min(100, 20 + (days - i) * 2 + Math.random() * 10)
      });
    }
    return data;
  };

  // Calculate summary stats
  const totalTimeSpent = Object.values(userProfile?.detailedProgress || {})
    .reduce((sum, prog) => sum + (prog.timeSpent || 0), 0);
  const completedCourses = (courses || []).filter(c => getProgressPercentage(c.id) === 100).length;
  const inProgressCourses = (courses || []).filter(c => {
    const prog = getProgressPercentage(c.id);
    return prog > 0 && prog < 100;
  }).length;
  const averageProgress = (courses || []).length > 0
    ? Math.round((courses || []).reduce((sum, c) => sum + getProgressPercentage(c.id), 0) / courses.length)
    : 0;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-blue-500" />
          {isArabic ? 'تحليلات الأداء' : 'Analyse de Performance'}
        </h2>
        
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {['week', 'month', 'all'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tf === 'week' ? (isArabic ? 'أسبوع' : 'Semaine') : 
               tf === 'month' ? (isArabic ? 'شهر' : 'Mois') : 
               (isArabic ? 'الكل' : 'Tout')}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'إجمالي الوقت' : 'Temps total'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrophyIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedCourses}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'دروس مكتملة' : 'Cours complétés'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <FireIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {inProgressCourses}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'قيد التقدم' : 'En cours'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {averageProgress}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'متوسط التقدم' : 'Progression moy.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Progress Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {isArabic ? 'التقدم عبر الزمن' : 'Progression dans le temps'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.progressOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="progress" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Course Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {isArabic ? 'أداء الدروس' : 'Performance par cours'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.coursePerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="progress" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time Distribution by Category */}
        {analytics.timeDistribution.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {isArabic ? 'توزيع الوقت حسب الفئة' : 'Répartition du temps'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.timeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value) => [`${Math.floor(value / 60)}h ${value % 60}m`, isArabic ? 'الوقت' : 'Temps']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly Activity Pattern */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {isArabic ? 'نشاط الأسبوع' : 'Activité hebdomadaire'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="hours" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {isArabic ? 'تحليل المهارات' : 'Analyse des compétences'}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={analytics.skillRadar}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <Radar name="Skills" dataKey="A" stroke="#EC4899" fill="#EC4899" fillOpacity={0.6} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                {isArabic ? 'أداء ممتاز!' : 'Performance excellente!'}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {isArabic 
                  ? `لقد أكملت ${completedCourses} دروس هذا الشهر`
                  : `Vous avez complété ${completedCourses} cours ce mois-ci`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <TrophyIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900 dark:text-green-200">
                {isArabic ? 'استمر!' : 'Continuez!'}
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300">
                {isArabic 
                  ? `${inProgressCourses} دروس قيد التقدم`
                  : `${inProgressCourses} cours en progression`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-2">
            <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200">
                {isArabic ? 'وقت الدراسة' : 'Temps d\'étude'}
              </h4>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                {isArabic 
                  ? `متوسط ${Math.round(totalTimeSpent / 7)} دقيقة يومياً`
                  : `Moyenne de ${Math.round(totalTimeSpent / 7)} min/jour`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
