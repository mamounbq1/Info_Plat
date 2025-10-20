import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PlusIcon, TrashIcon, PencilIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * ClubsManager - Gestionnaire CRUD pour les clubs de la page d'accueil
 * Collection: homepage-clubs
 */

const CLUB_GRADIENTS = [
  'from-purple-600 to-pink-600',
  'from-blue-600 to-cyan-600',
  'from-green-600 to-teal-600',
  'from-orange-600 to-red-600',
  'from-indigo-600 to-purple-600',
  'from-cyan-600 to-blue-600',
  'from-pink-600 to-rose-600',
  'from-yellow-600 to-orange-600'
];

export default function ClubsManager({ isArabic }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nameFr: '',
    nameAr: '',
    descriptionFr: '',
    descriptionAr: '',
    icon: '🎭',
    colorGradient: 'from-purple-600 to-pink-600',
    enabled: true,
    order: 0
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'homepage-clubs'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setClubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        await updateDoc(doc(db, 'homepage-clubs', editingItem.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم التحديث' : 'Mis à jour');
      } else {
        await addDoc(collection(db, 'homepage-clubs'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم الإضافة' : 'Ajouté');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchClubs();
    } catch (error) {
      console.error('Error:', error);
      toast.error(isArabic ? 'خطأ' : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(isArabic ? 'حذف النادي؟' : 'Supprimer le club?')) {
      try {
        await deleteDoc(doc(db, 'homepage-clubs', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchClubs();
      } catch (error) {
        console.error('Error:', error);
        toast.error(isArabic ? 'خطأ' : 'Erreur');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nameFr: '',
      nameAr: '',
      descriptionFr: '',
      descriptionAr: '',
      icon: '🎭',
      colorGradient: 'from-purple-600 to-pink-600',
      enabled: true,
      order: 0
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserGroupIcon className="w-7 h-7 text-primary-600" />
            {isArabic ? 'إدارة النوادي' : 'Gérer les Clubs'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isArabic ? 'نوادي الثانوية المعروضة في الصفحة الرئيسية' : 'Clubs du lycée affichés sur la page d\'accueil'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setFormData(prev => ({ ...prev, order: clubs.length }));
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة نادي' : 'Ajouter Club'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <UserGroupIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{isArabic ? 'لا توجد نوادي' : 'Aucun club'}</p>
          </div>
        ) : (
          clubs.map((club) => (
            <div key={club.id} className="border dark:border-gray-700 rounded-lg p-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${club.colorGradient} flex items-center justify-center text-3xl mb-3`}>
                {club.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {isArabic ? club.nameAr : club.nameFr}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {isArabic ? club.descriptionAr : club.descriptionFr}
              </p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  club.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {club.enabled ? (isArabic ? 'مفعل' : 'Actif') : (isArabic ? 'معطل' : 'Inactif')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(club);
                      setFormData(club);
                      setShowModal(true);
                    }}
                    className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(club.id)}
                    className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingItem ? (isArabic ? 'تعديل النادي' : 'Modifier le Club') : (isArabic ? 'نادي جديد' : 'Nouveau Club')}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'الاسم (فرنسي)' : 'Nom (FR)'}</label>
                  <input
                    type="text"
                    value={formData.nameFr}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Club Théâtre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'الاسم (عربي)' : 'Nom (AR)'}</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    required
                    dir="rtl"
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                    placeholder="مثال: نادي المسرح"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'الوصف (فرنسي)' : 'Description (FR)'}</label>
                  <textarea
                    value={formData.descriptionFr}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'الوصف (عربي)' : 'Description (AR)'}</label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    rows={3}
                    dir="rtl"
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'الرمز' : 'Emoji'}</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white text-2xl text-center"
                    placeholder="🎭"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isArabic ? 'استخدم إيموجي واحد' : 'Utilisez un emoji'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'اللون' : 'Couleur'}</label>
                  <select
                    value={formData.colorGradient}
                    onChange={(e) => setFormData({ ...formData, colorGradient: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                  >
                    {CLUB_GRADIENTS.map(gradient => (
                      <option key={gradient} value={gradient}>
                        {gradient.split(' ')[0].replace('from-', '').replace('-600', '')}
                      </option>
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
                <span>{isArabic ? 'تفعيل النادي' : 'Activer ce club'}</span>
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
