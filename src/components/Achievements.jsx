import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon, 
  AcademicCapIcon,
  BoltIcon,
  SparklesIcon,
  CheckBadgeIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const BADGES = [
  {
    id: 'first_steps',
    icon: RocketLaunchIcon,
    titleFr: 'Premiers Pas',
    titleAr: 'الخطوات الأولى',
    descriptionFr: 'Commencez votre premier cours',
    descriptionAr: 'ابدأ دورتك الأولى',
    requirement: (stats) => stats.enrolledCourses > 0,
    color: 'bg-blue-500'
  },
  {
    id: 'fast_learner',
    icon: BoltIcon,
    titleFr: 'Apprenant Rapide',
    titleAr: 'متعلم سريع',
    descriptionFr: 'Complétez 5 cours',
    descriptionAr: 'أكمل 5 دورات',
    requirement: (stats) => stats.completedCourses >= 5,
    color: 'bg-yellow-500'
  },
  {
    id: 'dedicated',
    icon: FireIcon,
    titleFr: 'Dévoué',
    titleAr: 'مخلص',
    descriptionFr: '7 jours de streak',
    descriptionAr: '7 أيام متواصلة',
    requirement: (stats) => stats.currentStreak >= 7,
    color: 'bg-orange-500'
  },
  {
    id: 'quiz_master',
    icon: CheckBadgeIcon,
    titleFr: 'Maître des Quiz',
    titleAr: 'أستاذ الاختبارات',
    descriptionFr: 'Réussissez 10 quiz',
    descriptionAr: 'انجح في 10 اختبارات',
    requirement: (stats) => (stats.quizzesPassed || 0) >= 10,
    color: 'bg-green-500'
  },
  {
    id: 'scholar',
    icon: AcademicCapIcon,
    titleFr: 'Érudit',
    titleAr: 'عالم',
    descriptionFr: 'Complétez 10 cours',
    descriptionAr: 'أكمل 10 دورات',
    requirement: (stats) => stats.completedCourses >= 10,
    color: 'bg-purple-500'
  },
  {
    id: 'perfectionist',
    icon: StarIcon,
    titleFr: 'Perfectionniste',
    titleAr: 'مثالي',
    descriptionFr: 'Obtenez 100% dans 3 cours',
    descriptionAr: 'احصل على 100% في 3 دورات',
    requirement: (stats) => stats.perfectCourses >= 3,
    color: 'bg-pink-500'
  },
  {
    id: 'consistent',
    icon: SparklesIcon,
    titleFr: 'Constant',
    titleAr: 'ثابت',
    descriptionFr: '30 jours de streak',
    descriptionAr: '30 يوم متواصل',
    requirement: (stats) => stats.currentStreak >= 30,
    color: 'bg-indigo-500'
  },
  {
    id: 'master',
    icon: TrophyIcon,
    titleFr: 'Maître',
    titleAr: 'خبير',
    descriptionFr: 'Complétez 20 cours',
    descriptionAr: 'أكمل 20 دورة',
    requirement: (stats) => stats.completedCourses >= 20,
    color: 'bg-yellow-600'
  }
];

export default function Achievements({ 
  courses, 
  userProfile, 
  isArabic,
  getProgressPercentage 
}) {
  // Calculate stats for badge requirements
  const stats = {
    enrolledCourses: userProfile?.enrolledCourses?.length || 0,
    completedCourses: courses.filter(c => getProgressPercentage(c.id) === 100).length,
    currentStreak: userProfile?.learningStreak || 0,
    quizzesPassed: userProfile?.quizzesPassed || 0,
    perfectCourses: courses.filter(c => getProgressPercentage(c.id) === 100 && (userProfile?.courseScores?.[c.id] || 0) === 100).length
  };

  // Check which badges are earned
  const earnedBadges = BADGES.filter(badge => badge.requirement(stats));
  const lockedBadges = BADGES.filter(badge => !badge.requirement(stats));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-yellow-600" />
          {isArabic ? 'الإنجازات' : 'Succès & Badges'}
        </h2>
        <span className="text-sm text-gray-600">
          {earnedBadges.length} / {BADGES.length} {isArabic ? 'مكتسبة' : 'débloqués'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Earned Badges */}
          {earnedBadges.map((badge) => (
            <div 
              key={badge.id}
              className={`${badge.color} text-white rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300 shadow-lg`}
            >
              <badge.icon className="w-12 h-12 mx-auto mb-2 animate-bounce" />
              <h3 className="font-bold text-sm mb-1">
                {isArabic ? badge.titleAr : badge.titleFr}
              </h3>
              <p className="text-xs opacity-90">
                {isArabic ? badge.descriptionAr : badge.descriptionFr}
              </p>
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-white text-gray-800 text-xs font-semibold rounded-full">
                  ✓ {isArabic ? 'مكتسب' : 'Débloqué'}
                </span>
              </div>
            </div>
          ))}

          {/* Locked Badges */}
          {lockedBadges.map((badge) => (
            <div 
              key={badge.id}
              className="bg-gray-200 text-gray-500 rounded-lg p-4 text-center opacity-60 relative"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                </svg>
              </div>
              <badge.icon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <h3 className="font-bold text-sm mb-1">
                {isArabic ? badge.titleAr : badge.titleFr}
              </h3>
              <p className="text-xs">
                {isArabic ? badge.descriptionAr : badge.descriptionFr}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
