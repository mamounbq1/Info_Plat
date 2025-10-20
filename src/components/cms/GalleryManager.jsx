import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PlusIcon, TrashIcon, PencilIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function GalleryManager({ isArabic }) {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titleFr: '',
    titleAr: '',
    imageUrl: '',
    enabled: true,
    order: 0
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'homepage-gallery'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        await updateDoc(doc(db, 'homepage-gallery', editingItem.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم التحديث' : 'Mis à jour');
      } else {
        await addDoc(collection(db, 'homepage-gallery'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم الإضافة' : 'Ajouté');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchGallery();
    } catch (error) {
      console.error('Error:', error);
      toast.error(isArabic ? 'خطأ' : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(isArabic ? 'حذف الصورة؟' : 'Supprimer l\'image?')) {
      try {
        await deleteDoc(doc(db, 'homepage-gallery', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchGallery();
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
      imageUrl: '',
      enabled: true,
      order: 0
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PhotoIcon className="w-7 h-7 text-primary-600" />
            {isArabic ? 'إدارة معرض الصور' : 'Gérer la Galerie'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isArabic ? 'صور المعرض المعروضة في الصفحة الرئيسية' : 'Images de la galerie affichées sur la page d\'accueil'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setFormData(prev => ({ ...prev, order: gallery.length }));
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة صورة' : 'Ajouter Image'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{isArabic ? 'لا توجد صور' : 'Aucune image'}</p>
          </div>
        ) : (
          gallery.map((item) => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden border dark:border-gray-700">
              <img
                src={item.imageUrl}
                alt={isArabic ? item.titleAr : item.titleFr}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                    {isArabic ? item.titleAr : item.titleFr}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setFormData(item);
                        setShowModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-sm font-medium"
                    >
                      <PencilIcon className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-sm font-medium"
                    >
                      <TrashIcon className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              </div>
              {!item.enabled && (
                <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  {isArabic ? 'معطل' : 'Désactivé'}
                </div>
              )}
              <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded font-medium">
                #{item.order}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingItem ? (isArabic ? 'تعديل الصورة' : 'Modifier l\'Image') : (isArabic ? 'صورة جديدة' : 'Nouvelle Image')}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{isArabic ? 'رابط الصورة (URL)' : 'URL de l\'image'}</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                  placeholder="https://images.unsplash.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isArabic ? 'استخدم رابط صورة من الإنترنت' : 'Utilisez une URL d\'image externe'}
                </p>
              </div>

              {formData.imageUrl && (
                <div className="border rounded-lg p-2">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded" />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'العنوان (فرنسي)' : 'Titre (FR)'}</label>
                  <input
                    type="text"
                    value={formData.titleFr}
                    onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Activités scolaires"
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
                    placeholder="مثال: أنشطة مدرسية"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                <div className="flex items-end">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>{isArabic ? 'تفعيل الصورة' : 'Activer cette image'}</span>
                  </label>
                </div>
              </div>

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
