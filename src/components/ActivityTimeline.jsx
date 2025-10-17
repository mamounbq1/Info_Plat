import { useLanguage } from '../contexts/LanguageContext';
import {
  CheckCircleIcon,
  BookOpenIcon,
  TrophyIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/solid';

export default function ActivityTimeline({ userProfile, courses }) {
  const { isArabic } = useLanguage();

  // Generate recent activities based on user data
  const activities = [
    {
      type: 'achievement',
      icon: TrophyIcon,
      color: 'bg-yellow-500',
      title: isArabic ? 'حصلت على إنجاز جديد!' : 'Nouveau succès débloqué!',
      description: isArabic ? 'متعلم سريع' : 'Apprenant Rapide',
      time: isArabic ? 'منذ ساعتين' : 'Il y a 2 heures'
    },
    {
      type: 'completion',
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      title: isArabic ? 'أكملت درسًا' : 'Cours terminé',
      description: isArabic ? 'أساسيات البرمجة' : 'Bases de la programmation',
      time: isArabic ? 'منذ 5 ساعات' : 'Il y a 5 heures'
    },
    {
      type: 'streak',
      icon: FireIcon,
      color: 'bg-orange-500',
      title: isArabic ? 'سلسلة تعلم مستمرة!' : 'Série d\'apprentissage!',
      description: isArabic ? `${userProfile?.streak || 0} أيام متتالية` : `${userProfile?.streak || 0} jours consécutifs`,
      time: isArabic ? 'اليوم' : 'Aujourd\'hui'
    },
    {
      type: 'progress',
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      title: isArabic ? 'تقدم في الدورة' : 'Progression du cours',
      description: isArabic ? 'تطوير الويب المتقدم' : 'Développement Web Avancé',
      time: isArabic ? 'أمس' : 'Hier'
    },
    {
      type: 'points',
      icon: StarIcon,
      color: 'bg-purple-500',
      title: isArabic ? 'حصلت على نقاط' : 'Points gagnés',
      description: isArabic ? '+150 نقطة' : '+150 points',
      time: isArabic ? 'منذ يومين' : 'Il y a 2 jours'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
        <FireIcon className="w-4 h-4 text-orange-500" />
        {isArabic ? 'النشاط الأخير' : 'Activité Récente'}
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
        
        {/* Activity items */}
        <div className="space-y-2">
          {activities.slice(0, 3).map((activity, index) => (
            <div key={index} className="relative pl-8 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Icon */}
              <div className={`absolute left-0 ${activity.color} text-white rounded-full p-1.5 shadow-md`}>
                <activity.icon className="w-3 h-3" />
              </div>
              
              {/* Content */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-semibold text-xs text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                    {activity.time}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
