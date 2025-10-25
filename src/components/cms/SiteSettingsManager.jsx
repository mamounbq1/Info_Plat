import { useState, useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useLanguage } from '../../contexts/LanguageContext';
import { storage } from '../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  Cog6ToothIcon,
  CheckCircleIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SiteSettingsManager() {
  const { isArabic } = useLanguage();
  const { settings, loading, updateSettings, refreshSettings } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [faviconUploadProgress, setFaviconUploadProgress] = useState(0);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    schoolNameFr: '',
    schoolNameAr: '',
    pageTitleFr: '',
    pageTitleAr: '',
    taglineFr: '',
    taglineAr: '',
    logoUrl: '',
    faviconUrl: '',
    phone: '',
    email: '',
    address: ''
  });

  // Update form when settings load
  useEffect(() => {
    if (!loading) {
      setFormData({
        schoolNameFr: settings.schoolNameFr || '',
        schoolNameAr: settings.schoolNameAr || '',
        pageTitleFr: settings.pageTitleFr || '',
        pageTitleAr: settings.pageTitleAr || '',
        taglineFr: settings.taglineFr || '',
        taglineAr: settings.taglineAr || '',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || ''
      });
    }
  }, [settings, loading]);

  // Update favicon in browser when faviconUrl changes
  useEffect(() => {
    if (settings.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings.faviconUrl]);

  // Update page title when settings change
  useEffect(() => {
    const pageTitle = isArabic ? settings.pageTitleAr : settings.pageTitleFr;
    if (pageTitle) {
      document.title = pageTitle;
    }
  }, [settings.pageTitleFr, settings.pageTitleAr, isArabic]);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(isArabic 
        ? 'يرجى تحميل ملف صورة صالح (.png, .jpg, .svg, .webp)' 
        : 'Veuillez télécharger un fichier image valide (.png, .jpg, .svg, .webp)'
      );
      return;
    }

    // Validate file size (max 2MB for logo)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(isArabic 
        ? 'حجم الملف يجب أن يكون أقل من 2 ميغابايت' 
        : 'La taille du fichier doit être inférieure à 2 Mo'
      );
      return;
    }

    try {
      setUploadingLogo(true);
      setLogoUploadProgress(0);

      // Create a reference to the file in Firebase Storage
      const fileExtension = file.name.split('.').pop();
      const storageRef = ref(storage, `site-assets/logo.${fileExtension}`);

      // Delete old logo if it exists
      if (formData.logoUrl) {
        try {
          const oldLogoRef = ref(storage, formData.logoUrl);
          await deleteObject(oldLogoRef);
        } catch (error) {
          // Ignore errors if file doesn't exist
          console.log('No old logo to delete or error deleting:', error);
        }
      }

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setLogoUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error(isArabic ? 'فشل تحميل الشعار' : 'Échec du téléchargement du logo');
          setUploadingLogo(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData({ ...formData, logoUrl: downloadURL });
          toast.success(isArabic ? 'تم تحميل الشعار بنجاح' : 'Logo téléchargé avec succès');
          setUploadingLogo(false);
          setLogoUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(isArabic ? 'حدث خطأ أثناء التحميل' : 'Erreur lors du téléchargement');
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logoUrl: '' });
    toast.success(isArabic ? 'تمت إزالة الشعار' : 'Logo supprimé');
  };

  const handleFaviconUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error(isArabic 
        ? 'يرجى تحميل ملف صورة صالح (.ico, .png, .jpg, .svg)' 
        : 'Veuillez télécharger un fichier image valide (.ico, .png, .jpg, .svg)'
      );
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error(isArabic 
        ? 'حجم الملف يجب أن يكون أقل من 1 ميغابايت' 
        : 'La taille du fichier doit être inférieure à 1 Mo'
      );
      return;
    }

    try {
      setUploadingFavicon(true);
      setFaviconUploadProgress(0);

      // Create a reference to the file in Firebase Storage
      const fileExtension = file.name.split('.').pop();
      const storageRef = ref(storage, `site-assets/favicon.${fileExtension}`);

      // Delete old favicon if it exists
      if (formData.faviconUrl) {
        try {
          const oldFaviconRef = ref(storage, formData.faviconUrl);
          await deleteObject(oldFaviconRef);
        } catch (error) {
          // Ignore errors if file doesn't exist
          console.log('No old favicon to delete or error deleting:', error);
        }
      }

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFaviconUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error(isArabic ? 'فشل تحميل الأيقونة' : 'Échec du téléchargement');
          setUploadingFavicon(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData({ ...formData, faviconUrl: downloadURL });
          toast.success(isArabic ? 'تم تحميل الأيقونة بنجاح' : 'Favicon téléchargé avec succès');
          setUploadingFavicon(false);
          setFaviconUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast.error(isArabic ? 'حدث خطأ أثناء التحميل' : 'Erreur lors du téléchargement');
      setUploadingFavicon(false);
    }
  };

  const handleRemoveFavicon = () => {
    setFormData({ ...formData, faviconUrl: '' });
    toast.success(isArabic ? 'تمت إزالة الأيقونة' : 'Favicon supprimé');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await updateSettings(formData);
      
      if (result.success) {
        toast.success(isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Paramètres enregistrés avec succès');
        // Trigger page refresh to update navbar
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast.error(isArabic ? 'فشل حفظ الإعدادات' : 'Échec de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      schoolNameFr: settings.schoolNameFr || '',
      schoolNameAr: settings.schoolNameAr || '',
      pageTitleFr: settings.pageTitleFr || '',
      pageTitleAr: settings.pageTitleAr || '',
      taglineFr: settings.taglineFr || '',
      taglineAr: settings.taglineAr || '',
      logoUrl: settings.logoUrl || '',
      faviconUrl: settings.faviconUrl || '',
      phone: settings.phone || '',
      email: settings.email || '',
      address: settings.address || ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Cog6ToothIcon className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          {isArabic ? 'إعدادات الموقع العامة' : 'Paramètres Généraux du Site'}
        </h2>
      </div>

      <div className="space-y-6">
        {/* French School Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isArabic ? 'اسم المدرسة (بالفرنسية)' : 'Nom de l\'école (Français)'}
          </label>
          <input
            type="text"
            value={formData.schoolNameFr}
            onChange={(e) => setFormData({ ...formData, schoolNameFr: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="EduPlatform"
            dir="ltr"
          />
        </div>

        {/* Arabic School Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isArabic ? 'اسم المدرسة (بالعربية)' : 'Nom de l\'école (Arabe)'}
          </label>
          <input
            type="text"
            value={formData.schoolNameAr}
            onChange={(e) => setFormData({ ...formData, schoolNameAr: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="منصة التعليم"
            dir="rtl"
          />
        </div>

        {/* French Page Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isArabic ? 'عنوان الصفحة في المتصفح (بالفرنسية)' : 'Titre de la page (Français)'}
          </label>
          <input
            type="text"
            value={formData.pageTitleFr}
            onChange={(e) => setFormData({ ...formData, pageTitleFr: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="moroccan-edu"
            dir="ltr"
          />
          <p className="mt-1 text-xs text-gray-500">
            {isArabic ? 'النص الذي يظهر في علامة تبويب المتصفح' : 'Texte affiché dans l\'onglet du navigateur'}
          </p>
        </div>

        {/* Arabic Page Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isArabic ? 'عنوان الصفحة في المتصفح (بالعربية)' : 'Titre de la page (Arabe)'}
          </label>
          <input
            type="text"
            value={formData.pageTitleAr}
            onChange={(e) => setFormData({ ...formData, pageTitleAr: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="التعليم المغربي"
            dir="rtl"
          />
          <p className="mt-1 text-xs text-gray-500">
            {isArabic ? 'النص الذي يظهر في علامة تبويب المتصفح' : 'Texte affiché dans l\'onglet du navigateur'}
          </p>
        </div>

        {/* French Tagline */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isArabic ? 'الشعار (بالفرنسية)' : 'Slogan / Devise (Français)'}
          </label>
          <input
            type="text"
            value={formData.taglineFr}
            onChange={(e) => setFormData({ ...formData, taglineFr: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Savoir et Innovation"
            dir="ltr"
          />
        </div>

        {/* Arabic Tagline */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isArabic ? 'الشعار (بالعربية)' : 'Slogan / Devise (Arabe)'}
          </label>
          <input
            type="text"
            value={formData.taglineAr}
            onChange={(e) => setFormData({ ...formData, taglineAr: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="المعرفة والإبداع"
            dir="rtl"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isArabic ? 'شعار الموقع (Logo)' : 'Logo du Site'}
          </label>
          
          {/* Current Logo Preview */}
          {formData.logoUrl && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={formData.logoUrl} 
                  alt="Current logo" 
                  className="w-12 h-12 object-contain border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {isArabic ? 'الشعار الحالي' : 'Logo actuel'}
                </span>
              </div>
              <button
                onClick={handleRemoveLogo}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <TrashIcon className="w-4 h-4" />
                {isArabic ? 'إزالة' : 'Supprimer'}
              </button>
            </div>
          )}

          {/* File Upload Input */}
          <div className="relative">
            <input
              type="file"
              id="logo-upload"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="hidden"
            />
            <label
              htmlFor="logo-upload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition ${
                uploadingLogo
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <CloudArrowUpIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {uploadingLogo
                  ? (isArabic ? 'جاري التحميل...' : 'Téléchargement...')
                  : (isArabic ? 'انقر لتحميل شعار جديد' : 'Cliquez pour télécharger un nouveau logo')
                }
              </span>
            </label>
          </div>

          {/* Upload Progress Bar */}
          {uploadingLogo && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300"
                  style={{ width: `${logoUploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                {Math.round(logoUploadProgress)}%
              </p>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500">
            {isArabic 
              ? 'الشعار الذي سيظهر في شريط التنقل. الأحجام المدعومة: .png, .jpg, .svg, .webp (بحد أقصى 2 ميغابايت)' 
              : 'Logo affiché dans la barre de navigation. Formats acceptés : .png, .jpg, .svg, .webp (max 2 Mo)'
            }
          </p>
        </div>

        {/* Favicon Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isArabic ? 'أيقونة المتصفح (Favicon)' : 'Favicon (Icône du navigateur)'}
          </label>
          
          {/* Current Favicon Preview */}
          {formData.faviconUrl && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={formData.faviconUrl} 
                  alt="Current favicon" 
                  className="w-8 h-8 object-contain border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {isArabic ? 'الأيقونة الحالية' : 'Favicon actuel'}
                </span>
              </div>
              <button
                onClick={handleRemoveFavicon}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <TrashIcon className="w-4 h-4" />
                {isArabic ? 'إزالة' : 'Supprimer'}
              </button>
            </div>
          )}

          {/* File Upload Input */}
          <div className="relative">
            <input
              type="file"
              id="favicon-upload"
              accept=".ico,.png,.jpg,.jpeg,.svg"
              onChange={handleFaviconUpload}
              disabled={uploadingFavicon}
              className="hidden"
            />
            <label
              htmlFor="favicon-upload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition ${
                uploadingFavicon
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <CloudArrowUpIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {uploadingFavicon
                  ? (isArabic ? 'جاري التحميل...' : 'Téléchargement...')
                  : (isArabic ? 'انقر لتحميل أيقونة جديدة' : 'Cliquez pour télécharger une nouvelle icône')
                }
              </span>
            </label>
          </div>

          {/* Upload Progress Bar */}
          {uploadingFavicon && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300"
                  style={{ width: `${faviconUploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                {Math.round(faviconUploadProgress)}%
              </p>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500">
            {isArabic 
              ? 'الأيقونة التي تظهر في علامة تبويب المتصفح. الأحجام المدعومة: .ico, .png, .jpg, .svg (يُفضل 32x32px أو 16x16px، بحد أقصى 1 ميغابايت)' 
              : 'Icône affichée dans l\'onglet du navigateur. Formats acceptés : .ico, .png, .jpg, .svg (préférablement 32x32px ou 16x16px, max 1 Mo)'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircleIcon className="w-5 h-5" />
            {saving 
              ? (isArabic ? 'جاري الحفظ...' : 'Enregistrement...') 
              : (isArabic ? 'حفظ التغييرات' : 'Enregistrer les modifications')
            }
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <XMarkIcon className="w-5 h-5" />
            {isArabic ? 'إلغاء' : 'Annuler'}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {isArabic ? 'معاينة شريط التنقل' : 'Aperçu de la barre de navigation'}
        </h3>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                {formData.faviconUrl ? (
                  <img src={formData.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                ) : (
                  'A'
                )}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                {isArabic ? (formData.schoolNameAr || 'منصة التعليم') : (formData.schoolNameFr || 'EduPlatform')}
              </span>
              {(formData.taglineFr || formData.taglineAr) && (
                <span className="text-xs text-gray-600">
                  {isArabic ? (formData.taglineAr || 'المعرفة والإبداع') : (formData.taglineFr || 'Savoir et Innovation')}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Browser Tab Preview */}
        <div className="mt-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            {isArabic ? 'معاينة علامة تبويب المتصفح' : 'Aperçu de l\'onglet du navigateur'}
          </p>
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
            {formData.faviconUrl ? (
              <img src={formData.faviconUrl} alt="Favicon" className="w-4 h-4 object-contain" />
            ) : (
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
            )}
            <span className="text-sm text-gray-700 font-medium">
              {isArabic 
                ? (formData.pageTitleAr || formData.schoolNameAr || 'منصة التعليم') 
                : (formData.pageTitleFr || formData.schoolNameFr || 'moroccan-edu')
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
