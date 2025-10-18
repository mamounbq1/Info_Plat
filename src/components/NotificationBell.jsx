import { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckIcon, XMarkIcon, EnvelopeIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, approveUser, rejectUser, markMessageAsRead } = useNotifications();
  const { isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApprove = async (notification) => {
    await approveUser(notification.userId, notification.userName);
    markAsRead(notification.id);
  };

  const handleReject = async (notification) => {
    await rejectUser(notification.userId, notification.userName);
    markAsRead(notification.id);
  };

  const handleMarkMessageRead = async (notification) => {
    await markMessageAsRead(notification.messageId);
    markAsRead(notification.id);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isArabic ? 'الآن' : 'maintenant';
    if (diffMins < 60) return `${diffMins} ${isArabic ? 'دقيقة' : 'min'}`;
    if (diffHours < 24) return `${diffHours} ${isArabic ? 'ساعة' : 'h'}`;
    return `${diffDays} ${isArabic ? 'يوم' : 'j'}`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel - Fixed positioning */}
      {isOpen && (
        <div className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] max-h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isArabic ? 'الإشعارات' : 'Notifications'}
              </h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} {isArabic ? 'غير مقروء' : 'non lus'}
                </p>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                {isArabic ? 'تعليم الكل كمقروء' : 'Tout marquer lu'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isArabic ? 'لا توجد إشعارات' : 'Aucune notification'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.type === 'registration'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {notification.type === 'registration' ? (
                          <UserPlusIcon className={`w-5 h-5 ${
                            notification.type === 'registration'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        ) : (
                          <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {notification.message}
                        </p>
                        
                        {notification.type === 'message' && notification.content && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {notification.content}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{notification.userEmail}</span>
                          <span>•</span>
                          <span>{getTimeAgo(notification.timestamp)}</span>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          {notification.type === 'registration' ? (
                            <>
                              <button
                                onClick={() => handleApprove(notification)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1"
                              >
                                <CheckIcon className="w-4 h-4" />
                                {isArabic ? 'موافقة' : 'Approuver'}
                              </button>
                              <button
                                onClick={() => handleReject(notification)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1"
                              >
                                <XMarkIcon className="w-4 h-4" />
                                {isArabic ? 'رفض' : 'Refuser'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleMarkMessageRead(notification)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg font-medium transition"
                            >
                              {isArabic ? 'تعليم كمقروء' : 'Marquer lu'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                {isArabic ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
