import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Squares2X2Icon, LinkIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function FooterManager({ isArabic }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // About section
    schoolNameFr: '',
    schoolNameAr: '',
    descriptionFr: '',
    descriptionAr: '',
    
    // Social section
    socialTitleFr: '',
    socialTitleAr: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    linkedinUrl: '',
    
    // Copyright
    copyrightTextFr: '',
    copyrightTextAr: ''
  });

  useEffect(() => {
    fetchFooterContent();
  }, []);

  const fetchFooterContent = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'homepage', 'footer');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(isArabic ? 'خطأ في التحميل' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await setDoc(doc(db, 'homepage', 'footer'), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      toast.success(isArabic ? 'تم حفظ محتوى التذييل' : 'Contenu du footer sauvegardé');
    } catch (error) {
      console.error('Error:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Squares2X2Icon className="w-7 h-7 text-primary-600" />
          {isArabic ? 'محتوى التذييل (Footer)' : 'Contenu du Footer'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isArabic ? 'تحرير محتوى التذييل (الأقسام: عن المدرسة وجهات الاتصال فقط)' : 'Modifier le contenu du footer (Sections: À Propos et Contact uniquement)'}
        </p>
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            ℹ️ {isArabic ? 'ملاحظة: أقسام "الروابط السريعة"، "الموارد" و "الاتصال" ثابتة ولا يمكن تعديلها من هنا' : 'Note: Les sections "Liens Rapides", "Ressources" et "Contact" sont fixes et ne peuvent pas être modifiées ici'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* About Section */}
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center gap-2 mb-4">
            <Squares2X2Icon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isArabic ? 'القسم الأول: عن الثانوية' : 'Section 1: À Propos de l\'École'}
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'اسم المدرسة (فرنسي)' : 'Nom de l\'école (Français)'}
              </label>
              <input
                type="text"
                value={formData.schoolNameFr}
                onChange={(e) => setFormData({ ...formData, schoolNameFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="Lycée d'Excellence"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'اسم المدرسة (عربي)' : 'Nom de l\'école (Arabe)'}
              </label>
              <input
                type="text"
                value={formData.schoolNameAr}
                onChange={(e) => setFormData({ ...formData, schoolNameAr: e.target.value })}
                required
                dir="rtl"
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="ثانوية التميز"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
              </label>
              <textarea
                value={formData.descriptionFr}
                onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="Établissement d'excellence dédié à former les leaders de demain"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                required
                rows={3}
                dir="rtl"
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="مؤسسة تعليمية متميزة مكرسة لتكوين قادة الغد"
              />
            </div>
          </div>
        </div>

        {/* Static Sections Info */}
        <div className="border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isArabic ? '🔒 الأقسام الثابتة (غير قابلة للتعديل)' : '🔒 Sections Statiques (Non modifiables)'}
            </h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {isArabic ? '📌 القسم الثاني: الروابط السريعة' : '📌 Section 2: Liens Rapides'}
              </h4>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <div>• {isArabic ? 'العنوان: "روابط سريعة" / "Liens Rapides"' : 'Titre: "Liens Rapides" / "روابط سريعة"'}</div>
                <div>• {isArabic ? 'الروابط: من نحن، الأخبار، الأحداث، الأندية' : 'Liens: À Propos, Actualités, Événements, Clubs'}</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {isArabic ? '📌 القسم الثالث: الموارد' : '📌 Section 3: Ressources'}
              </h4>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <div>• {isArabic ? 'العنوان: "موارد" / "Ressources"' : 'Titre: "Ressources" / "موارد"'}</div>
                <div>• {isArabic ? 'الروابط: المعرض، الإعلانات، تسجيل الدخول، إنشاء حساب' : 'Liens: Galerie, Annonces, Connexion, Inscription'}</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {isArabic ? '📌 القسم الرابع: معلومات الاتصال' : '📌 Section 4: Informations de Contact'}
              </h4>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <div>• {isArabic ? 'العنوان: "اتصل بنا" / "Contact"' : 'Titre: "Contact" / "اتصل بنا"'}</div>
                <div>• {isArabic ? 'البيانات: الهاتف، البريد الإلكتروني، العنوان' : 'Données: Téléphone, Email, Adresse'}</div>
                <div className="text-xs mt-1 italic">
                  🔗 {isArabic ? 'تُدار من: CMS > معلومات الاتصال' : 'Géré depuis: CMS > Informations de Contact'}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 italic">
            {isArabic 
              ? '💡 هذه الأقسام محددة مباشرة في الكود أو تُدار من صفحات CMS أخرى لضمان الاتساق'
              : '💡 Ces sections sont définies directement dans le code ou gérées depuis d\'autres pages du CMS pour garantir la cohérence'}
          </p>
        </div>

        {/* Social Section */}
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center gap-2 mb-4">
            <GlobeAltIcon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isArabic ? 'القسم الخامس: الشبكات الاجتماعية' : 'Section 5: Réseaux Sociaux'}
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
              </label>
              <input
                type="text"
                value={formData.socialTitleFr}
                onChange={(e) => setFormData({ ...formData, socialTitleFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="Suivez-nous"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
              </label>
              <input
                type="text"
                value={formData.socialTitleAr}
                onChange={(e) => setFormData({ ...formData, socialTitleAr: e.target.value })}
                required
                dir="rtl"
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="تابعنا"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'رابط Facebook' : 'Lien Facebook'}
              </label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="https://facebook.com/votrepage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'رابط Twitter' : 'Lien Twitter'}
              </label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="https://twitter.com/votrepage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'رابط Instagram' : 'Lien Instagram'}
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="https://instagram.com/votrepage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'رابط YouTube' : 'Lien YouTube'}
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="https://youtube.com/@votrepage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'رابط LinkedIn' : 'Lien LinkedIn'}
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="https://linkedin.com/company/votrepage"
              />
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center gap-2 mb-4">
            <Squares2X2Icon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isArabic ? 'نص حقوق النشر' : 'Texte de Copyright'}
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'النص (فرنسي)' : 'Texte (Français)'}
              </label>
              <input
                type="text"
                value={formData.copyrightTextFr}
                onChange={(e) => setFormData({ ...formData, copyrightTextFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="© 2025 Lycée d'Excellence. Tous droits réservés."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'النص (عربي)' : 'Texte (Arabe)'}
              </label>
              <input
                type="text"
                value={formData.copyrightTextAr}
                onChange={(e) => setFormData({ ...formData, copyrightTextAr: e.target.value })}
                required
                dir="rtl"
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="© 2025 ثانوية التميز. جميع الحقوق محفوظة."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isArabic ? 'جاري الحفظ...' : 'Sauvegarde...'}
              </>
            ) : (
              <>
                <Squares2X2Icon className="w-5 h-5" />
                {isArabic ? 'حفظ محتوى التذييل' : 'Sauvegarder le Footer'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="mt-8 border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {isArabic ? 'معاينة' : 'Aperçu'}
        </h3>
        <div className="bg-gray-900 text-gray-300 p-6 rounded-xl">
          <div className="grid grid-cols-5 gap-3 text-sm">
            {/* About Preview */}
            <div>
              <h4 className="text-white font-bold mb-2">
                {isArabic ? formData.schoolNameAr : formData.schoolNameFr}
              </h4>
              <p className="text-xs text-gray-400">
                {isArabic ? formData.descriptionAr : formData.descriptionFr}
              </p>
            </div>
            
            {/* Links Preview - STATIC */}
            <div>
              <h4 className="text-white font-bold mb-2">
                {isArabic ? 'روابط سريعة' : 'Liens Rapides'}
              </h4>
              <div className="text-xs text-gray-400">
                <div>{isArabic ? 'من نحن' : 'À Propos'}</div>
                <div>{isArabic ? 'الأخبار' : 'Actualités'}</div>
                <div>{isArabic ? 'الأحداث' : 'Événements'}</div>
                <div>{isArabic ? 'الأندية' : 'Clubs'}</div>
              </div>
            </div>
            
            {/* Resources Preview - STATIC */}
            <div>
              <h4 className="text-white font-bold mb-2">
                {isArabic ? 'موارد' : 'Ressources'}
              </h4>
              <div className="text-xs text-gray-400">
                <div>{isArabic ? 'المعرض' : 'Galerie'}</div>
                <div>{isArabic ? 'الإعلانات' : 'Annonces'}</div>
                <div>{isArabic ? 'تسجيل الدخول' : 'Connexion'}</div>
                <div>{isArabic ? 'إنشاء حساب' : 'Inscription'}</div>
              </div>
            </div>
            
            {/* Contact Preview - STATIC (from ContactManager) */}
            <div>
              <h4 className="text-white font-bold mb-2">
                {isArabic ? 'اتصل بنا' : 'Contact'}
              </h4>
              <div className="text-xs text-gray-400">
                <div>📞 +212 5XX-XXXXXX</div>
                <div>✉️ contact@lycee.ma</div>
                <div>📍 {isArabic ? 'العنوان' : 'Adresse'}</div>
              </div>
              <div className="text-xs text-yellow-400 mt-2">
                🔗 {isArabic ? 'يُدار من معلومات الاتصال' : 'Géré via Informations Contact'}
              </div>
            </div>
            
            {/* Social Preview */}
            <div>
              <h4 className="text-white font-bold mb-2">
                {isArabic ? formData.socialTitleAr : formData.socialTitleFr}
              </h4>
              <div className="flex gap-2">
                {formData.facebookUrl && (
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs">FB</span>
                  </div>
                )}
                {formData.twitterUrl && (
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs">TW</span>
                  </div>
                )}
                {formData.instagramUrl && (
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs">IG</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-4 pt-4 text-center text-xs">
            {isArabic ? formData.copyrightTextAr : formData.copyrightTextFr}
          </div>
        </div>
      </div>
    </div>
  );
}
