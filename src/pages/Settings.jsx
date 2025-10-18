import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon,
  LanguageIcon,
  PaintBrushIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function Settings() {
  const { currentUser, userProfile, logout } = useAuth();
  const { language, toggleLanguage, isArabic } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(userProfile?.settings?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(userProfile?.settings?.pushNotifications ?? true);
  const [courseUpdates, setCourseUpdates] = useState(userProfile?.settings?.courseUpdates ?? true);

  const handleUpdateSettings = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'settings.emailNotifications': emailNotifications,
        'settings.pushNotifications': pushNotifications,
        'settings.courseUpdates': courseUpdates
      });
      toast.success(isArabic ? 'تم حفظ الإعدادات' : 'Paramètres enregistrés');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(isArabic ? 'خطأ في حفظ الإعدادات' : 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      isArabic 
        ? 'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.'
        : 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    );
    
    if (confirmed) {
      toast.error(isArabic ? 'يرجى الاتصال بالدعم لحذف الحساب' : 'Veuillez contacter le support pour supprimer le compte');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {isArabic ? 'الإعدادات' : 'Paramètres'}
          </h1>

          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'معلومات الملف الشخصي' : 'Informations du profil'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isArabic ? 'الاسم الكامل' : 'Nom complet'}
                </label>
                <input 
                  type="text" 
                  value={userProfile?.fullName || ''} 
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input 
                  type="email" 
                  value={currentUser?.email || ''} 
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isArabic ? 'النقاط' : 'Points'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userProfile?.points || 0}
                  </span>
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <PaintBrushIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'المظهر' : 'Apparence'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isArabic ? 'الوضع الداكن' : 'Mode sombre'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isArabic ? 'تبديل بين الوضع الفاتح والداكن' : 'Basculer entre le mode clair et sombre'}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isArabic ? 'اللغة' : 'Langue'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isArabic ? 'العربية / Français' : 'Français / العربية'}
                  </p>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {language === 'fr' ? 'العربية' : 'Français'}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BellIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'الإشعارات' : 'Notifications'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isArabic ? 'إشعارات البريد الإلكتروني' : 'Notifications par email'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isArabic ? 'تلقي إشعارات عبر البريد الإلكتروني' : 'Recevoir des notifications par email'}
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isArabic ? 'الإشعارات الفورية' : 'Notifications push'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isArabic ? 'تلقي إشعارات فورية' : 'Recevoir des notifications push'}
                  </p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pushNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isArabic ? 'تحديثات الدروس' : 'Mises à jour de cours'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isArabic ? 'إشعارات عند إضافة دروس جديدة' : 'Notifications lors de nouveaux cours'}
                  </p>
                </div>
                <button
                  onClick={() => setCourseUpdates(!courseUpdates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    courseUpdates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      courseUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <button
                onClick={handleUpdateSettings}
                className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                {isArabic ? 'حفظ الإعدادات' : 'Enregistrer les paramètres'}
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'الأمان' : 'Sécurité'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => toast.success(isArabic ? 'قريباً' : 'Bientôt disponible')}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {isArabic ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}
              </button>
              
              <button
                onClick={logout}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
              >
                {isArabic ? 'تسجيل الخروج' : 'Se déconnecter'}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">
                {isArabic ? 'منطقة خطرة' : 'Zone de danger'}
              </h2>
            </div>
            
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {isArabic 
                ? 'حذف حسابك سيؤدي إلى فقدان جميع بياناتك بشكل دائم.'
                : 'La suppression de votre compte entraînera la perte permanente de toutes vos données.'}
            </p>
            
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              {isArabic ? 'حذف الحساب' : 'Supprimer le compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
