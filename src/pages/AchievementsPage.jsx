import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';
import { 
  TrophyIcon,
  FireIcon,
  StarIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'first-course',
    icon: AcademicCapIcon,
    titleFr: 'Premier Pas',
    titleAr: 'الخطوة الأولى',
    descriptionFr: 'Commencer votre premier cours',
    descriptionAr: 'ابدأ أول درس لك',
    requirement: (userProfile) => userProfile?.progress && Object.keys(userProfile.progress).length > 0,
    color: 'blue'
  },
  {
    id: 'complete-course',
    icon: CheckCircleIcon,
    titleFr: 'Diplômé',
    titleAr: 'متخرج',
    descriptionFr: 'Terminer votre premier cours',
    descriptionAr: 'أكمل أول درس لك',
    requirement: (userProfile) => userProfile?.completedCourses?.length > 0,
    color: 'green'
  },
  {
    id: 'streak-7',
    icon: FireIcon,
    titleFr: 'Semaine Active',
    titleAr: 'أسبوع نشط',
    descriptionFr: 'Maintenir une série de 7 jours',
    descriptionAr: 'حافظ على سلسلة 7 أيام',
    requirement: (userProfile) => (userProfile?.streak || 0) >= 7,
    color: 'orange'
  },
  {
    id: 'streak-30',
    icon: FireIcon,
    titleFr: 'Mois Dévoué',
    titleAr: 'شهر مخلص',
    descriptionFr: 'Maintenir une série de 30 jours',
    descriptionAr: 'حافظ على سلسلة 30 يومًا',
    requirement: (userProfile) => (userProfile?.streak || 0) >= 30,
    color: 'red'
  },
  {
    id: 'points-100',
    icon: StarIcon,
    titleFr: 'Cent Points',
    titleAr: 'مائة نقطة',
    descriptionFr: 'Gagner 100 points',
    descriptionAr: 'احصل على 100 نقطة',
    requirement: (userProfile) => (userProfile?.points || 0) >= 100,
    color: 'yellow'
  },
  {
    id: 'points-500',
    icon: StarIcon,
    titleFr: 'Étoile Brillante',
    titleAr: 'نجمة مشرقة',
    descriptionFr: 'Gagner 500 points',
    descriptionAr: 'احصل على 500 نقطة',
    requirement: (userProfile) => (userProfile?.points || 0) >= 500,
    color: 'yellow'
  },
  {
    id: 'complete-3-courses',
    icon: TrophyIcon,
    titleFr: 'Triple Menace',
    titleAr: 'تهديد ثلاثي',
    descriptionFr: 'Terminer 3 cours',
    descriptionAr: 'أكمل 3 دروس',
    requirement: (userProfile) => (userProfile?.completedCourses?.length || 0) >= 3,
    color: 'purple'
  },
  {
    id: 'complete-5-courses',
    icon: TrophyIcon,
    titleFr: 'Expert',
    titleAr: 'خبير',
    descriptionFr: 'Terminer 5 cours',
    descriptionAr: 'أكمل 5 دروس',
    requirement: (userProfile) => (userProfile?.completedCourses?.length || 0) >= 5,
    color: 'indigo'
  },
  {
    id: 'complete-10-courses',
    icon: TrophyIcon,
    titleFr: 'Maître',
    titleAr: 'سيد',
    descriptionFr: 'Terminer 10 cours',
    descriptionAr: 'أكمل 10 دروس',
    requirement: (userProfile) => (userProfile?.completedCourses?.length || 0) >= 10,
    color: 'pink'
  }
];

const COLOR_CLASSES = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
  purple: 'from-purple-500 to-purple-600',
  indigo: 'from-indigo-500 to-indigo-600',
  pink: 'from-pink-500 to-pink-600'
};

export default function AchievementsPage() {
  const { userProfile } = useAuth();
  const { isArabic } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const unlockedAchievements = ACHIEVEMENTS.filter(achievement => 
    achievement.requirement(userProfile)
  );

  const lockedAchievements = ACHIEVEMENTS.filter(achievement => 
    !achievement.requirement(userProfile)
  );

  const achievementProgress = Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isArabic ? 'الإنجازات' : 'Succès'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'تتبع تقدمك وأنجز الأهداف' : 'Suivez votre progression et débloquez des récompenses'}
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {isArabic ? 'التقدم الإجمالي' : 'Progression Globale'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {unlockedAchievements.length} / {ACHIEVEMENTS.length} {isArabic ? 'مفتوح' : 'débloqués'}
                </p>
              </div>
              <TrophyIcon className="w-12 h-12 text-yellow-300" />
            </div>
            
            <div className="w-full bg-blue-700/50 rounded-full h-3">
              <div 
                className="bg-yellow-300 h-3 rounded-full transition-all duration-500"
                style={{ width: `${achievementProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-100 mt-2 text-right">
              {achievementProgress}%
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <AcademicCapIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile?.completedCourses?.length || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'دروس مكتملة' : 'Cours terminés'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <StarIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile?.points || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'نقاط' : 'Points'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <FireIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile?.streak || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'أيام متتالية' : 'Jours consécutifs'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <TrophyIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {unlockedAchievements.length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'إنجازات' : 'Succès'}
              </p>
            </div>
          </div>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'الإنجازات المفتوحة' : 'Succès Débloqués'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={achievement.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <div className={`bg-gradient-to-r ${COLOR_CLASSES[achievement.color]} p-4`}>
                        <Icon className="w-12 h-12 text-white mx-auto" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-center mb-2">
                          {isArabic ? achievement.titleAr : achievement.titleFr}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {isArabic ? achievement.descriptionAr : achievement.descriptionFr}
                        </p>
                        <div className="mt-3 flex items-center justify-center">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            {isArabic ? 'مفتوح' : 'Débloqué'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'الإنجازات المقفلة' : 'Succès Verrouillés'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={achievement.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden opacity-60 hover:opacity-100 transition-all"
                    >
                      <div className="bg-gray-300 dark:bg-gray-700 p-4">
                        <LockClosedIcon className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-center mb-2">
                          {isArabic ? achievement.titleAr : achievement.titleFr}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {isArabic ? achievement.descriptionAr : achievement.descriptionFr}
                        </p>
                        <div className="mt-3 flex items-center justify-center">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium flex items-center gap-1">
                            <LockClosedIcon className="w-4 h-4" />
                            {isArabic ? 'مقفل' : 'Verrouillé'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
