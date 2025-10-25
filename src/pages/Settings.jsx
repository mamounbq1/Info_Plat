import { useState, useEffect } from 'react';
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
  TrashIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function Settings() {
  const { currentUser, userProfile, logout } = useAuth();
  const { language, toggleLanguage, isArabic } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(userProfile?.settings?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(userProfile?.settings?.pushNotifications ?? true);
  const [courseUpdates, setCourseUpdates] = useState(userProfile?.settings?.courseUpdates ?? true);
  
  // Initialize profile data
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setDateOfBirth(userProfile.dateOfBirth || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    try {
      const updates = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: dateOfBirth.trim(),
        bio: bio.trim(),
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'users', currentUser.uid), updates);
      toast.success(isArabic ? 'تم تحديث المعلومات' : 'Informations mises à jour');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(isArabic ? 'خطأ في تحديث المعلومات' : 'Erreur lors de la mise à jour');
    }
  };
  
  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error(isArabic ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error(isArabic ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
      return;
    }
    
    if (oldPassword === newPassword) {
      toast.error(isArabic ? 'كلمة المرور الجديدة يجب أن تكون مختلفة' : 'Le nouveau mot de passe doit être différent');
      return;
    }
    
    try {
      // Re-authenticate user with old password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        oldPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      toast.success(isArabic ? 'تم تغيير كلمة المرور بنجاح' : 'Mot de passe changé avec succès');
      
      // Reset form
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error(isArabic ? 'كلمة المرور القديمة غير صحيحة' : 'Ancien mot de passe incorrect');
      } else if (error.code === 'auth/weak-password') {
        toast.error(isArabic ? 'كلمة المرور ضعيفة جداً' : 'Mot de passe trop faible');
      } else {
        toast.error(isArabic ? 'خطأ في تغيير كلمة المرور' : 'Erreur lors du changement de mot de passe');
      }
    }
  };
  
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isArabic ? 'معلومات الملف الشخصي' : 'Informations du profil'}
                </h2>
              </div>
              
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition"
                >
                  {isArabic ? 'تعديل' : 'Modifier'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition flex items-center gap-1"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {isArabic ? 'حفظ' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setFullName(userProfile?.fullName || '');
                      setPhoneNumber(userProfile?.phoneNumber || '');
                      setDateOfBirth(userProfile?.dateOfBirth || '');
                      setBio(userProfile?.bio || '');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition flex items-center gap-1"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    {isArabic ? 'إلغاء' : 'Annuler'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Editable: Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isArabic ? 'الاسم الكامل' : 'Nom complet'}
                </label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditingProfile}
                  className={`w-full px-3 py-2 border rounded-lg transition ${
                    isEditingProfile
                      ? 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Entrez votre nom complet'}
                />
              </div>
              
              {/* Read-only: Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                  <span className="text-xs text-gray-500 ml-2">{isArabic ? '(غير قابل للتعديل)' : '(non modifiable)'}</span>
                </label>
                <input 
                  type="email" 
                  value={currentUser?.email || ''} 
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              
              {/* Editable: Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isArabic ? 'رقم الهاتف' : 'Numéro de téléphone'}
                </label>
                <input 
                  type="tel" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!isEditingProfile}
                  className={`w-full px-3 py-2 border rounded-lg transition ${
                    isEditingProfile
                      ? 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  placeholder={isArabic ? 'أدخل رقم هاتفك' : 'Entrez votre numéro'}
                />
              </div>
              
              {/* Editable: Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isArabic ? 'تاريخ الميلاد' : 'Date de naissance'}
                </label>
                <input 
                  type="date" 
                  value={dateOfBirth} 
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={!isEditingProfile}
                  className={`w-full px-3 py-2 border rounded-lg transition ${
                    isEditingProfile
                      ? 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                  }`}
                />
              </div>
              
              {/* Editable: Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isArabic ? 'نبذة عنك' : 'Bio'}
                </label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditingProfile}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-lg transition resize-none ${
                    isEditingProfile
                      ? 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  placeholder={isArabic ? 'أخبرنا عن نفسك' : 'Parlez-nous de vous'}
                />
              </div>
              
              {/* Read-only: Level/Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isArabic ? 'المستوى' : 'Niveau'}
                    <span className="text-xs text-gray-500 ml-2">{isArabic ? '(غير قابل للتعديل)' : '(non modifiable)'}</span>
                  </label>
                  <input 
                    type="text" 
                    value={userProfile?.level || userProfile?.class || '-'} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isArabic ? 'النقاط' : 'Points'}
                    <span className="text-xs text-gray-500 ml-2">{isArabic ? '(غير قابل للتعديل)' : '(non modifiable)'}</span>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {userProfile?.points || 0}
                    </span>
                    <span className="text-yellow-500">★</span>
                  </div>
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

          {/* Security Section - Password Change */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isArabic ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}
                </h2>
              </div>
              
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg font-medium transition"
                >
                  {isArabic ? 'تغيير' : 'Modifier'}
                </button>
              )}
            </div>
            
            {isChangingPassword ? (
              <div className="space-y-4">
                {/* Old Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isArabic ? 'كلمة المرور القديمة' : 'Ancien mot de passe'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                      placeholder={isArabic ? 'أدخل كلمة المرور القديمة' : 'Entrez l\'ancien mot de passe'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showOldPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isArabic ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                      placeholder={isArabic ? 'أدخل كلمة المرور الجديدة' : 'Entrez le nouveau mot de passe'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {isArabic ? 'يجب أن تكون 6 أحرف على الأقل' : 'Doit contenir au moins 6 caractères'}
                  </p>
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isArabic ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                      placeholder={isArabic ? 'أعد إدخال كلمة المرور الجديدة' : 'Retapez le nouveau mot de passe'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    {isArabic ? 'تأكيد التغيير' : 'Confirmer le changement'}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    {isArabic ? 'إلغاء' : 'Annuler'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic 
                  ? 'احمِ حسابك بتغيير كلمة المرور بانتظام. ستحتاج إلى إدخال كلمة المرور القديمة أولاً.'
                  : 'Protégez votre compte en changeant régulièrement votre mot de passe. Vous devrez d\'abord entrer votre ancien mot de passe.'}
              </p>
            )}
          </div>
          
          {/* Security Section - Logout */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'الجلسة' : 'Session'}
              </h2>
            </div>
            
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
            >
              {isArabic ? 'تسجيل الخروج' : 'Se déconnecter'}
            </button>
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
