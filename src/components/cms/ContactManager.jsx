import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ContactManager({ isArabic }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    addressFr: '',
    addressAr: '',
    phone: '',
    email: '',
    hoursFr: '',
    hoursAr: '',
    mapUrl: ''
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'homepage', 'contact');
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
      await setDoc(doc(db, 'homepage', 'contact'), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      toast.success(isArabic ? 'تم حفظ معلومات الاتصال' : 'Informations de contact sauvegardées');
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
          <PhoneIcon className="w-7 h-7 text-primary-600" />
          {isArabic ? 'معلومات الاتصال' : 'Informations de Contact'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isArabic ? 'معلومات الاتصال المعروضة في صفحة الاتصال' : 'Informations affichées dans la section contact'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Address */}
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isArabic ? 'العنوان' : 'Adresse'}
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{isArabic ? 'العنوان (فرنسي)' : 'Adresse (Français)'}</label>
              <textarea
                value={formData.addressFr}
                onChange={(e) => setFormData({ ...formData, addressFr: e.target.value })}
                required
                rows={2}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="Avenue Hassan II, Oujda, Maroc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{isArabic ? 'العنوان (عربي)' : 'Adresse (Arabe)'}</label>
              <textarea
                value={formData.addressAr}
                onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                required
                rows={2}
                dir="rtl"
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="شارع الحسن الثاني، وجدة، المغرب"
              />
            </div>
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex items-center gap-2 mb-4">
              <PhoneIcon className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">
                {isArabic ? 'الهاتف' : 'Téléphone'}
              </h3>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
              placeholder="+212 5XX-XXXXXX"
            />
          </div>

          <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex items-center gap-2 mb-4">
              <EnvelopeIcon className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </h3>
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
              placeholder="contact@lyceealmarinyine.ma"
            />
          </div>
        </div>

        {/* Hours */}
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isArabic ? 'أوقات العمل' : 'Horaires d\'ouverture'}
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{isArabic ? 'الأوقات (فرنسي)' : 'Horaires (Français)'}</label>
              <input
                type="text"
                value={formData.hoursFr}
                onChange={(e) => setFormData({ ...formData, hoursFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="Lundi - Vendredi: 8h00 - 17h00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{isArabic ? 'الأوقات (عربي)' : 'Horaires (Arabe)'}</label>
              <input
                type="text"
                value={formData.hoursAr}
                onChange={(e) => setFormData({ ...formData, hoursAr: e.target.value })}
                required
                dir="rtl"
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                placeholder="الإثنين - الجمعة: 8:00 - 17:00"
              />
            </div>
          </div>
        </div>

        {/* Map URL */}
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isArabic ? 'رابط الخريطة' : 'URL de la carte'}
            </h3>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {isArabic ? 'رابط Google Maps Embed' : 'Lien d\'intégration Google Maps'}
            </label>
            <textarea
              value={formData.mapUrl}
              onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white font-mono text-sm"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {isArabic 
                ? 'للحصول على الرابط: افتح Google Maps → حدد الموقع → مشاركة → تضمين خريطة → انسخ الرابط'
                : 'Pour obtenir le lien: Ouvrez Google Maps → Sélectionnez l\'emplacement → Partager → Intégrer une carte → Copiez le lien'}
            </p>
          </div>
        </div>

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
                <PhoneIcon className="w-5 h-5" />
                {isArabic ? 'حفظ معلومات الاتصال' : 'Sauvegarder les informations'}
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
        <div className="space-y-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white p-6 rounded-xl">
          <div className="flex items-start gap-3">
            <MapPinIcon className="w-5 h-5 mt-1" />
            <p className="opacity-90">{isArabic ? formData.addressAr : formData.addressFr}</p>
          </div>
          <div className="flex items-start gap-3">
            <PhoneIcon className="w-5 h-5 mt-1" />
            <p className="opacity-90">{formData.phone}</p>
          </div>
          <div className="flex items-start gap-3">
            <EnvelopeIcon className="w-5 h-5 mt-1" />
            <p className="opacity-90">{formData.email}</p>
          </div>
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 mt-1" />
            <p className="opacity-90">{isArabic ? formData.hoursAr : formData.hoursFr}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
