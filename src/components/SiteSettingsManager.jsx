import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { 
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { uploadImage } from '../utils/fileUpload';
import ImageUploadField from './ImageUploadField';

/**
 * SiteSettingsManager - Component for managing site-wide settings
 * 
 * Allows admins to configure:
 * - School name (French & Arabic) - Displayed in Navbar
 * - Logo URL
 * - Contact information
 */
export default function SiteSettingsManager() {
  const { isArabic } = useLanguage();
  const { settings: initialSettings, loading: loadingSettings, updateSettings } = useSiteSettings();
  const [formData, setFormData] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Update form when settings are loaded
  useEffect(() => {
    setFormData(initialSettings);
  }, [initialSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const result = await updateSettings(formData);
      
      if (result.success) {
        toast.success(isArabic ? 'تم حفظ الإعدادات بنجاح!' : 'Paramètres enregistrés avec succès!');
        
        // Reload page to update navbar
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(isArabic ? 'خطأ في حفظ الإعدادات' : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isArabic ? 'إعدادات الموقع' : 'Paramètres du Site'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Name Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'اسم المدرسة / المنصة' : 'Nom de l\'École / Plateforme'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {isArabic 
                ? 'سيظهر هذا الاسم في شريط التنقل (Navbar) في أعلى الموقع'
                : 'Ce nom apparaîtra dans la barre de navigation (Navbar) en haut du site'
              }
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'اسم المدرسة (فرنسي)' : 'Nom de l\'École (Français)'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.schoolNameFr}
                  onChange={(e) => setFormData({ ...formData, schoolNameFr: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Lycée Mohammed V"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'اسم المدرسة (عربي)' : 'Nom de l\'École (Arabe)'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.schoolNameAr}
                  onChange={(e) => setFormData({ ...formData, schoolNameAr: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: ثانوية محمد الخامس"
                  dir="rtl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PhotoIcon className="w-5 h-5" />
              {isArabic ? 'شعار المدرسة' : 'Logo de l\'École'}
            </h3>
            
            <ImageUploadField
              label={isArabic ? 'شعار المدرسة' : 'Logo de l\'école'}
              value={formData.logoUrl}
              onChange={async (file) => {
                if (file) {
                  setUploadingLogo(true);
                  try {
                    const url = await uploadImage(file, 'site-settings', formData.logoUrl);
                    setFormData({ ...formData, logoUrl: url });
                    toast.success(isArabic ? 'تم رفع الشعار بنجاح' : 'Logo téléchargé avec succès');
                  } catch (error) {
                    console.error('Error uploading logo:', error);
                    toast.error(isArabic ? 'فشل رفع الشعار' : 'Échec du téléchargement');
                  } finally {
                    setUploadingLogo(false);
                  }
                }
              }}
              folder="site-settings"
              disabled={uploadingLogo}
              required={false}
            />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isArabic 
                  ? 'اتركه فارغًا لاستخدام الأيقونة الافتراضية'
                  : 'Laisser vide pour utiliser l\'icône par défaut'
                }
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'معلومات الاتصال' : 'Informations de Contact'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  {isArabic ? 'رقم الهاتف' : 'Numéro de Téléphone'}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="+212 6XX-XXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  {isArabic ? 'العنوان' : 'Adresse'}
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={isArabic ? 'أدخل العنوان الكامل...' : 'Entrez l\'adresse complète...'}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving 
                ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') 
                : (isArabic ? 'حفظ التغييرات' : 'Sauvegarder les Modifications')
              }
            </button>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{isArabic ? 'ملاحظة:' : 'Note:'}</strong>{' '}
              {isArabic 
                ? 'بعد حفظ التغييرات، سيتم إعادة تحميل الصفحة لتطبيق الإعدادات الجديدة.'
                : 'Après sauvegarde, la page sera rechargée pour appliquer les nouveaux paramètres.'
              }
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
