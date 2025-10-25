import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

/**
 * Notification Center Component
 * Displays notifications with bell icon and dropdown
 */
export default function NotificationCenter({ userId, userProfile, isArabic }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [userProfile]);

  const loadNotifications = () => {
    const notifs = userProfile?.notifications || [];
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const markAsRead = async (notificationId) => {
    try {
      const updatedNotifs = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      await updateDoc(doc(db, 'users', userId), {
        notifications: updatedNotifs
      });
      
      setNotifications(updatedNotifs);
      setUnreadCount(updatedNotifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
      
      await updateDoc(doc(db, 'users', userId), {
        notifications: updatedNotifs
      });
      
      setNotifications(updatedNotifs);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const updatedNotifs = notifications.filter(n => n.id !== notificationId);
      
      await updateDoc(doc(db, 'users', userId), {
        notifications: updatedNotifs
      });
      
      setNotifications(updatedNotifs);
      setUnreadCount(updatedNotifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'course': return <AcademicCapIcon className="w-5 h-5" />;
      case 'achievement': return <TrophyIcon className="w-5 h-5" />;
      case 'streak': return <FireIcon className="w-5 h-5" />;
      case 'goal': return <CheckCircleIcon className="w-5 h-5" />;
      case 'reminder': return <ClockIcon className="w-5 h-5" />;
      default: return <SparklesIcon className="w-5 h-5" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'course': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'achievement': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'streak': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'goal': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'reminder': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isArabic ? 'الآن' : 'Maintenant';
    if (diffMins < 60) return isArabic ? `منذ ${diffMins} دقيقة` : `Il y a ${diffMins}min`;
    if (diffHours < 24) return isArabic ? `منذ ${diffHours} ساعة` : `Il y a ${diffHours}h`;
    if (diffDays < 7) return isArabic ? `منذ ${diffDays} يوم` : `Il y a ${diffDays}j`;
    return date.toLocaleDateString(isArabic ? 'ar' : 'fr', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        )}
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isArabic ? 'الإشعارات' : 'Notifications'}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isArabic ? 'تعليم الكل كمقروء' : 'Tout marquer lu'}
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'لا توجد إشعارات' : 'Aucune notification'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                        !notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${getColor(notif.type)}`}>
                          {getIcon(notif.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {isArabic ? notif.titleAr : notif.titleFr}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {isArabic ? notif.messageAr : notif.messageFr}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                              title={isArabic ? 'تعليم كمقروء' : 'Marquer comme lu'}
                            >
                              <CheckCircleIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                            title={isArabic ? 'حذف' : 'Supprimer'}
                          >
                            <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {isArabic ? 'إغلاق' : 'Fermer'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Helper function to add a notification
 */
export async function addNotification(userId, notification) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const notifications = userData.notifications || [];
      
      const newNotif = {
        id: Date.now().toString(),
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Keep only last 50 notifications
      const updated = [newNotif, ...notifications].slice(0, 50);
      
      await updateDoc(userRef, {
        notifications: updated
      });
    }
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

/**
 * Predefined notification templates
 */
export const NotificationTemplates = {
  courseCompleted: (courseName, isArabic) => ({
    type: 'achievement',
    titleFr: 'Cours terminé!',
    titleAr: 'تم إنهاء الدورة!',
    messageFr: `Félicitations! Vous avez terminé "${courseName}"`,
    messageAr: `تهانينا! لقد أنهيت "${courseName}"`
  }),
  
  streakMilestone: (days, isArabic) => ({
    type: 'streak',
    titleFr: `${days} jours de suite!`,
    titleAr: `${days} يوم متتالي!`,
    messageFr: `Incroyable! Vous avez atteint ${days} jours d'apprentissage consécutifs`,
    messageAr: `رائع! لقد وصلت إلى ${days} يوم من التعلم المتواصل`
  }),
  
  goalAchieved: (goalName, isArabic) => ({
    type: 'goal',
    titleFr: 'Objectif atteint!',
    titleAr: 'تم تحقيق الهدف!',
    messageFr: `Vous avez atteint votre objectif: ${goalName}`,
    messageAr: `لقد حققت هدفك: ${goalName}`
  }),
  
  newCourseAvailable: (courseName, isArabic) => ({
    type: 'course',
    titleFr: 'Nouveau cours disponible',
    titleAr: 'دورة جديدة متاحة',
    messageFr: `Un nouveau cours est disponible: "${courseName}"`,
    messageAr: `دورة جديدة متاحة: "${courseName}"`
  }),
  
  studyReminder: (isArabic) => ({
    type: 'reminder',
    titleFr: 'Rappel d\'étude',
    titleAr: 'تذكير بالدراسة',
    messageFr: 'N\'oubliez pas de continuer votre apprentissage aujourd\'hui!',
    messageAr: 'لا تنسَ متابعة تعلمك اليوم!'
  })
};
