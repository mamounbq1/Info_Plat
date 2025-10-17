import { 
  BookOpenIcon, 
  ClipboardDocumentCheckIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function EnhancedStats({ 
  courses, 
  quizzes, 
  userProfile, 
  isArabic,
  getProgressPercentage 
}) {
  // Calculate statistics
  const enrolledCoursesCount = userProfile?.enrolledCourses?.length || 0;
  const completedCourses = courses.filter(c => getProgressPercentage(c.id) === 100).length;
  const inProgressCourses = courses.filter(c => {
    const progress = getProgressPercentage(c.id);
    return progress > 0 && progress < 100;
  }).length;
  
  const totalLearningHours = courses.reduce((sum, course) => {
    const duration = parseFloat(course.duration) || 0;
    return sum + duration;
  }, 0);

  const averageProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + getProgressPercentage(c.id), 0) / courses.length)
    : 0;

  const currentStreak = userProfile?.learningStreak || 0;
  const totalPoints = userProfile?.points || (completedCourses * 100 + inProgressCourses * 50);

  const stats = [
    {
      icon: BookOpenIcon,
      value: courses.length,
      label: isArabic ? 'الدروس المتاحة' : 'Cours disponibles',
      color: 'bg-blue-500',
      textColor: 'text-blue-100'
    },
    {
      icon: CheckCircleIcon,
      value: completedCourses,
      label: isArabic ? 'دروس مكتملة' : 'Cours complétés',
      color: 'bg-green-500',
      textColor: 'text-green-100'
    },
    {
      icon: ClockIcon,
      value: inProgressCourses,
      label: isArabic ? 'قيد التقدم' : 'En cours',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-100'
    },
    {
      icon: AcademicCapIcon,
      value: `${averageProgress}%`,
      label: isArabic ? 'متوسط التقدم' : 'Progression moyenne',
      color: 'bg-purple-500',
      textColor: 'text-purple-100'
    },
    {
      icon: FireIcon,
      value: currentStreak,
      label: isArabic ? 'سلسلة الأيام' : 'Streak de jours',
      color: 'bg-orange-500',
      textColor: 'text-orange-100'
    },
    {
      icon: TrophyIcon,
      value: totalPoints,
      label: isArabic ? 'النقاط' : 'Points',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-100'
    },
    {
      icon: ClipboardDocumentCheckIcon,
      value: quizzes.length,
      label: isArabic ? 'الاختبارات المتاحة' : 'Quiz disponibles',
      color: 'bg-pink-500',
      textColor: 'text-pink-100'
    },
    {
      icon: ChartBarIcon,
      value: `${Math.round(totalLearningHours)}h`,
      label: isArabic ? 'ساعات التعلم' : 'Heures d\'apprentissage',
      color: 'bg-teal-500',
      textColor: 'text-teal-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2 mb-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`${stat.color} text-white rounded-lg shadow-sm p-2.5 hover:shadow-md transition-all duration-200`}
        >
          <stat.icon className="w-5 h-5 mb-1 opacity-80" />
          <h3 className="text-lg font-bold mb-0">{stat.value}</h3>
          <p className={`${stat.textColor} text-xs leading-tight`}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
