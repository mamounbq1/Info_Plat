import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { PlusIcon, TrashIcon, PencilIcon, MegaphoneIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * AnnouncementsManager - Gestionnaire CRUD pour les annonces de la page d'accueil
 * 
 * Collection Firestore: homepage-announcements
 * Utilisé dans: LandingPage.jsx section #announcements
 */

export default function AnnouncementsManager({ isArabic }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titleFr: '',
    titleAr: '',
    contentFr: '',
    contentAr: '',
    dateFr: '',
    dateAr: '',
    imageUrl: '',
    urgent: false,
    enabled: true,
    order: 0
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'homepage-announcements'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error(isArabic ? 'خطأ في تحميل الإعلانات' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let finalImageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (imageFile) {
        setUploadingImage(true);
        const timestamp = Date.now();
        const storageRef = ref(storage, `announcements/${timestamp}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
        setUploadingImage(false);
      }
      
      const dataToSave = {
        ...formData,
        imageUrl: finalImageUrl
      };
      
      if (editingItem) {
        await updateDoc(doc(db, 'homepage-announcements', editingItem.id), {
          ...dataToSave,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم تحديث الإعلان' : 'Annonce mise à jour');
      } else {
        await addDoc(collection(db, 'homepage-announcements'), {
          ...dataToSave,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم إضافة الإعلان' : 'Annonce ajoutée');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Êtes-vous sûr de supprimer cette annonce?')) {
      try {
        await deleteDoc(doc(db, 'homepage-announcements', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titleFr: '',
      titleAr: '',
      contentFr: '',
      contentAr: '',
      dateFr: '',
      dateAr: '',
      imageUrl: '',
      urgent: false,
      enabled: true,
      order: 0
    });
    setImageFile(null);
    setImagePreview('');
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData(item);
    setImagePreview(item.imageUrl || '');
    setShowModal(true);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(isArabic ? 'حجم الصورة كبير جداً (أقصى 5MB)' : 'Image trop grande (max 5MB)');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '' });
  };

  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setFormData(prev => ({ ...prev, order: announcements.length }));
    setShowModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MegaphoneIcon className="w-7 h-7 text-primary-600" />
            {isArabic ? 'إدارة الإعلانات' : 'Gérer les Annonces'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isArabic ? 'الإعلانات المعروضة في الصفحة الرئيسية' : 'Annonces affichées sur la page d\'accueil'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة إعلان' : 'Ajouter Annonce'}
        </button>
      </div>

      {loading && announcements.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MegaphoneIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{isArabic ? 'لا توجد إعلانات بعد' : 'Aucune annonce pour le moment'}</p>
              <button onClick={openAddModal} className="text-primary-600 hover:underline mt-2">
                {isArabic ? 'أضف أول إعلان' : 'Ajouter la première annonce'}
              </button>
            </div>
          ) : (
            announcements.map((item) => (
              <div 
                key={item.id} 
                className={`border dark:border-gray-700 rounded-lg p-4 flex items-start justify-between ${
                  item.urgent ? 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-gray-700/30'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.urgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-100 dark:bg-primary-900/30'
                    }`}>
                      <MegaphoneIcon className={`w-6 h-6 ${item.urgent ? 'text-red-600' : 'text-primary-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {isArabic ? item.titleAr : item.titleFr}
                        </h3>
                        {item.urgent && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                            {isArabic ? 'عاجل' : 'Urgent'}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📅 {isArabic ? item.dateAr : item.dateFr}
                      </p>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingItem 
                ? (isArabic ? 'تعديل الإعلان' : 'Modifier l\'Annonce')
                : (isArabic ? 'إضافة إعلان جديد' : 'Nouvelle Annonce')
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
                    placeholder="Ex: Inscription aux clubs sportifs"
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
                    placeholder="مثال: التسجيل في النوادي الرياضية"
                  />
                </div>
              </div>

              {/* Content Text Areas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'المحتوى التفصيلي (فرنسي)' : 'Contenu Détaillé (Français)'}
                  </label>
                  <textarea
                    value={formData.contentFr}
                    onChange={(e) => setFormData({ ...formData, contentFr: e.target.value })}
                    required
                    rows="5"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Décrivez l'annonce en détail..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'المحتوى التفصيلي (عربي)' : 'Contenu Détaillé (Arabe)'}
                  </label>
                  <textarea
                    value={formData.contentAr}
                    onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                    required
                    rows="5"
                    dir="rtl"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="صف الإعلان بالتفصيل..."
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
                    placeholder="Ex: 10 Sept"
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
                    placeholder="مثال: 10 شتنبر"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'صورة توضيحية (اختياري)' : 'Image Illustrative (Facultatif)'}
                </label>
                
                {imagePreview || formData.imageUrl ? (
                  <div className="relative">
                    <img 
                      src={imagePreview || formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        {isArabic ? 'اختر صورة' : 'Choisir une image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {isArabic ? 'PNG, JPG, GIF (أقصى 5MB)' : 'PNG, JPG, GIF (max 5MB)'}
                    </p>
                  </div>
                )}
              </div>

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
                    checked={formData.urgent}
                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ⚠️ {isArabic ? 'إعلان عاجل (يظهر بعلامة حمراء)' : 'Annonce urgente (badge rouge)'}
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
                    {isArabic ? 'تفعيل هذا الإعلان' : 'Activer cette annonce'}
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
