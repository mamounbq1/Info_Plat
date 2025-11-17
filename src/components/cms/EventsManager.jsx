import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PlusIcon, TrashIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { uploadImage } from '../../utils/fileUpload';
import ImageUploadField from '../ImageUploadField';

/**
 * EventsManager - Gestionnaire CRUD pour les événements
 * 
 * Collection Firestore: homepage-events
 * Utilisé dans: EventsPage.jsx
 */

export default function EventsManager({ isArabic }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titleFr: '',
    titleAr: '',
    descriptionFr: '',
    descriptionAr: '',
    dateFr: '',
    dateAr: '',
    timeFr: '',
    timeAr: '',
    locationFr: '',
    locationAr: '',
    imageUrl: '',
    featured: false,
    enabled: true,
    order: 0
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'homepage-events'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(isArabic ? 'خطأ في تحميل الأحداث' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingItem) {
        await updateDoc(doc(db, 'homepage-events', editingItem.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم تحديث الحدث' : 'Événement mis à jour');
      } else {
        await addDoc(collection(db, 'homepage-events'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم إضافة الحدث' : 'Événement ajouté');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الحدث؟' : 'Êtes-vous sûr de supprimer cet événement?')) {
      try {
        await deleteDoc(doc(db, 'homepage-events', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titleFr: '',
      titleAr: '',
      descriptionFr: '',
      descriptionAr: '',
      dateFr: '',
      dateAr: '',
      timeFr: '',
      timeAr: '',
      locationFr: '',
      locationAr: '',
      imageUrl: '',
      featured: false,
      enabled: true,
      order: 0
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setFormData(prev => ({ ...prev, order: events.length }));
    setShowModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-blue-600" />
            {isArabic ? 'إدارة الأحداث' : 'Gérer les Événements'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isArabic ? 'الأحداث المعروضة في صفحة الأحداث' : 'Événements affichés sur la page Événements'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة حدث' : 'Ajouter Événement'}
        </button>
      </div>

      {loading && events.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{isArabic ? 'لا توجد أحداث بعد' : 'Aucun événement pour le moment'}</p>
              <button onClick={openAddModal} className="text-blue-600 hover:underline mt-2">
                {isArabic ? 'أضف أول حدث' : 'Ajouter le premier événement'}
              </button>
            </div>
          ) : (
            events.map((item) => (
              <div 
                key={item.id} 
                className={`border dark:border-gray-700 rounded-lg p-4 flex items-start justify-between ${
                  item.featured ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'bg-gray-50 dark:bg-gray-700/30'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.featured ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <CalendarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {isArabic ? item.titleAr : item.titleFr}
                        </h3>
                        {item.featured && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                            {isArabic ? 'مميز' : 'À la une'}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          item.enabled 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {item.enabled ? (isArabic ? 'مفعل' : 'Actif') : (isArabic ? 'معطل' : 'Désactivé')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {isArabic ? item.descriptionAr : item.descriptionFr}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span>📅 {isArabic ? item.dateAr : item.dateFr}</span>
                        <span>🕐 {isArabic ? item.timeAr : item.timeFr}</span>
                        <span>📍 {isArabic ? item.locationAr : item.locationFr}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {isArabic ? 'الترتيب' : 'Ordre'}: {item.order}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                    title={isArabic ? 'تعديل' : 'Modifier'}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                    title={isArabic ? 'حذف' : 'Supprimer'}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingItem 
                ? (isArabic ? 'تعديل الحدث' : 'Modifier l\'Événement')
                : (isArabic ? 'إضافة حدث جديد' : 'Nouvel Événement')
              }
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
                  </label>
                  <input
                    type="text"
                    value={formData.titleFr}
                    onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Journée Portes Ouvertes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                    placeholder="مثال: يوم الأبواب المفتوحة"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
                  </label>
                  <textarea
                    value={formData.descriptionFr}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Venez découvrir notre établissement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                    placeholder="تعال واكتشف مؤسستنا"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'التاريخ (فرنسي)' : 'Date (Français)'}
                  </label>
                  <input
                    type="text"
                    value={formData.dateFr}
                    onChange={(e) => setFormData({ ...formData, dateFr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 15 Nov 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'التاريخ (عربي)' : 'Date (Arabe)'}
                  </label>
                  <input
                    type="text"
                    value={formData.dateAr}
                    onChange={(e) => setFormData({ ...formData, dateAr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                    placeholder="مثال: 15 نوفمبر 2025"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الوقت (فرنسي)' : 'Heure (Français)'}
                  </label>
                  <input
                    type="text"
                    value={formData.timeFr}
                    onChange={(e) => setFormData({ ...formData, timeFr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 09:00 - 16:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الوقت (عربي)' : 'Heure (Arabe)'}
                  </label>
                  <input
                    type="text"
                    value={formData.timeAr}
                    onChange={(e) => setFormData({ ...formData, timeAr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                    placeholder="مثال: 09:00 - 16:00"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الموقع (فرنسي)' : 'Lieu (Français)'}
                  </label>
                  <input
                    type="text"
                    value={formData.locationFr}
                    onChange={(e) => setFormData({ ...formData, locationFr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Campus Principal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الموقع (عربي)' : 'Lieu (Arabe)'}
                  </label>
                  <input
                    type="text"
                    value={formData.locationAr}
                    onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                    placeholder="مثال: الحرم الرئيسي"
                  />
                </div>
              </div>

              <ImageUploadField
                label={isArabic ? 'صورة الغلاف (اختياري)' : 'Image de couverture (optionnel)'}
                value={formData.imageUrl}
                onChange={async (file) => {
                  if (file) {
                    setUploadingImage(true);
                    try {
                      const url = await uploadImage(file, 'events', formData.imageUrl);
                      setFormData({ ...formData, imageUrl: url });
                      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image téléchargée avec succès');
                    } catch (error) {
                      console.error('Error uploading event image:', error);
                      toast.error(isArabic ? 'فشل رفع الصورة' : 'Échec du téléchargement');
                    } finally {
                      setUploadingImage(false);
                    }
                  }
                }}
                folder="events"
                disabled={uploadingImage}
                required={false}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الترتيب' : 'Ordre d\'affichage'}
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isArabic ? 'الأرقام الأصغر تظهر أولاً' : 'Les nombres plus petits apparaissent en premier'}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ⭐ {isArabic ? 'حدث مميز (يظهر في الأعلى)' : 'Événement à la une (apparaît en haut)'}
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isArabic ? 'تفعيل هذا الحدث' : 'Activer cet événement'}
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ' : 'Sauvegarder')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
                >
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
