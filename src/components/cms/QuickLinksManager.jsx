import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PlusIcon, TrashIcon, PencilIcon, LinkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ICON_OPTIONS = [
  'DocumentTextIcon', 'CalendarDaysIcon', 'AcademicCapIcon', 'TrophyIcon',
  'BookOpenIcon', 'ClipboardDocumentCheckIcon', 'UserGroupIcon', 'ChartBarIcon',
  'CogIcon', 'GlobeAltIcon', 'LightBulbIcon', 'ShieldCheckIcon',
  'VideoCameraIcon', 'BeakerIcon', 'CalculatorIcon', 'CpuChipIcon',
  'StarIcon', 'NewspaperIcon', 'MegaphoneIcon', 'PhotoIcon'
];

export default function QuickLinksManager({ isArabic }) {
  const [quickLinks, setQuickLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titleFr: '',
    titleAr: '',
    url: '#',
    icon: 'DocumentTextIcon',
    enabled: true,
    order: 0
  });

  useEffect(() => {
    fetchQuickLinks();
  }, []);

  const fetchQuickLinks = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'homepage-quicklinks'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setQuickLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      if (editingItem) {
        await updateDoc(doc(db, 'homepage-quicklinks', editingItem.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم التحديث' : 'Mis à jour');
      } else {
        await addDoc(collection(db, 'homepage-quicklinks'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم الإضافة' : 'Ajouté');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchQuickLinks();
    } catch (error) {
      console.error('Error:', error);
      toast.error(isArabic ? 'خطأ' : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(isArabic ? 'حذف الرابط؟' : 'Supprimer le lien?')) {
      try {
        await deleteDoc(doc(db, 'homepage-quicklinks', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchQuickLinks();
      } catch (error) {
        console.error('Error:', error);
        toast.error(isArabic ? 'خطأ' : 'Erreur');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titleFr: '',
      titleAr: '',
      url: '#',
      icon: 'DocumentTextIcon',
      enabled: true,
      order: 0
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LinkIcon className="w-7 h-7 text-primary-600" />
            {isArabic ? 'إدارة الروابط السريعة' : 'Gérer les Liens Rapides'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isArabic ? 'الروابط المعروضة في sidebar الإعلانات' : 'Liens affichés dans la sidebar des annonces'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setFormData(prev => ({ ...prev, order: quickLinks.length }));
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة رابط' : 'Ajouter Lien'}
        </button>
      </div>

      <div className="space-y-2">
        {quickLinks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <LinkIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{isArabic ? 'لا توجد روابط' : 'Aucun lien'}</p>
          </div>
        ) : (
          quickLinks.map((link) => (
            <div key={link.id} className="border dark:border-gray-700 rounded-lg p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {isArabic ? link.titleAr : link.titleFr}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    🔗 {link.url}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isArabic ? 'الأيقونة' : 'Icône'}: {link.icon} | {isArabic ? 'الترتيب' : 'Ordre'}: {link.order}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  link.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {link.enabled ? (isArabic ? 'مفعل' : 'Actif') : (isArabic ? 'معطل' : 'Inactif')}
                </span>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingItem(link);
                    setFormData(link);
                    setShowModal(true);
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingItem ? (isArabic ? 'تعديل الرابط' : 'Modifier le Lien') : (isArabic ? 'رابط جديد' : 'Nouveau Lien')}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'العنوان (فرنسي)' : 'Titre (FR)'}</label>
                  <input
                    type="text"
                    value={formData.titleFr}
                    onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Inscription"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'العنوان (عربي)' : 'Titre (AR)'}</label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    required
                    dir="rtl"
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                    placeholder="مثال: التسجيل"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{isArabic ? 'الرابط (URL)' : 'URL du lien'}</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                  placeholder="#inscriptions ou https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isArabic ? 'استخدم # للروابط الداخلية أو URL كامل' : 'Utilisez # pour liens internes ou URL complète'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'الأيقونة' : 'Icône'}</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon.replace('Icon', '')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'الترتيب' : 'Ordre'}</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>{isArabic ? 'تفعيل الرابط' : 'Activer ce lien'}</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">
                  {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ' : 'Sauvegarder')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
