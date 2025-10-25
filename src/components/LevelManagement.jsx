import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  AcademicCapIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { migrateLevelsToFirestore, checkMigrationStatus } from '../utils/migrateLevelsToFirestore';

const CATEGORIES = [
  { id: 'tc', fr: 'Tronc Commun', ar: 'الجذع المشترك' },
  { id: '1bac', fr: '1ère Année Bac', ar: 'الأولى باكالوريا' },
  { id: '2bac', fr: '2ème Année Bac', ar: 'الثانية باكالوريا' }
];

export default function LevelManagement() {
  const { isArabic } = useLanguage();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);
  
  const [levelForm, setLevelForm] = useState({
    id: '',
    fr: '',
    ar: '',
    category: 'tc',
    order: 0
  });

  useEffect(() => {
    fetchLevels();
    checkMigration();
  }, []);

  const checkMigration = async () => {
    const status = await checkMigrationStatus();
    setMigrationStatus(status);
  };

  const handleMigration = async () => {
    if (!confirm(isArabic 
      ? 'هل تريد استيراد المستويات الدراسية الافتراضية؟'
      : 'Voulez-vous importer les niveaux scolaires par défaut ?'
    )) {
      return;
    }

    try {
      setMigrating(true);
      const result = await migrateLevelsToFirestore();
      
      if (result.success) {
        toast.success(isArabic 
          ? `تم استيراد ${result.migratedCount} مستوى بنجاح`
          : `${result.migratedCount} niveaux importés avec succès`
        );
        fetchLevels();
        checkMigration();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error(isArabic ? 'خطأ في الاستيراد' : 'Erreur lors de l\'importation');
    } finally {
      setMigrating(false);
    }
  };

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const levelsQuery = query(collection(db, 'academicLevels'), orderBy('order', 'asc'));
      const snapshot = await getDocs(levelsQuery);
      const levelsData = snapshot.docs.map(doc => ({
        docId: doc.id, // Firestore document ID
        ...doc.data()
      }));
      setLevels(levelsData);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error(isArabic ? 'خطأ في تحميل المستويات' : 'Erreur lors du chargement des niveaux');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!levelForm.id || !levelForm.fr || !levelForm.ar) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      
      const levelData = {
        id: levelForm.id,
        fr: levelForm.fr,
        ar: levelForm.ar,
        category: levelForm.category,
        order: parseInt(levelForm.order) || 0,
        updatedAt: new Date().toISOString()
      };

      if (editingLevel) {
        // Update existing level
        await updateDoc(doc(db, 'academicLevels', editingLevel.docId), levelData);
        toast.success(isArabic ? 'تم تحديث المستوى بنجاح' : 'Niveau mis à jour avec succès');
      } else {
        // Create new level
        levelData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'academicLevels'), levelData);
        toast.success(isArabic ? 'تم إضافة المستوى بنجاح' : 'Niveau ajouté avec succès');
      }
      
      fetchLevels();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving level:', error);
      toast.error(isArabic ? 'خطأ في حفظ المستوى' : 'Erreur lors de la sauvegarde du niveau');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (level) => {
    setEditingLevel(level);
    setLevelForm({
      id: level.id,
      fr: level.fr,
      ar: level.ar,
      category: level.category,
      order: level.order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (level) => {
    if (!confirm(isArabic 
      ? `هل أنت متأكد من حذف المستوى "${isArabic ? level.ar : level.fr}"?`
      : `Êtes-vous sûr de supprimer le niveau "${level.fr}" ?`
    )) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'academicLevels', level.docId));
      toast.success(isArabic ? 'تم حذف المستوى بنجاح' : 'Niveau supprimé avec succès');
      fetchLevels();
    } catch (error) {
      console.error('Error deleting level:', error);
      toast.error(isArabic ? 'خطأ في حذف المستوى' : 'Erreur lors de la suppression du niveau');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLevelForm({
      id: '',
      fr: '',
      ar: '',
      category: 'tc',
      order: 0
    });
    setEditingLevel(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Filter levels
  const filteredLevels = levels.filter(level => {
    const matchesSearch = !searchTerm || 
      level.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.ar.includes(searchTerm) ||
      level.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || level.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group levels by category
  const groupedLevels = CATEGORIES.map(cat => ({
    ...cat,
    levels: filteredLevels.filter(level => level.category === cat.id)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AcademicCapIcon className="w-7 h-7 text-purple-600" />
              {isArabic ? 'إدارة المستويات الدراسية' : 'Gestion des Niveaux Scolaires'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic 
                ? 'إدارة مستويات الثانوية (الجذع المشترك، الأولى باك، الثانية باك)'
                : 'Gestion des niveaux du lycée (Tronc Commun, 1ère Bac, 2ème Bac)'
              }
            </p>
          </div>
          <div className="flex gap-2">
            {migrationStatus?.needsMigration && (
              <button
                onClick={handleMigration}
                disabled={migrating}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-5 h-5 ${migrating ? 'animate-spin' : ''}`} />
                {isArabic ? 'استيراد المستويات الافتراضية' : 'Importer niveaux par défaut'}
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2 shadow-md"
            >
              <PlusIcon className="w-5 h-5" />
              {isArabic ? 'إضافة مستوى' : 'Ajouter un niveau'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isArabic ? 'بحث...' : 'Rechercher...'}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{isArabic ? 'جميع الفئات' : 'Toutes les catégories'}</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {isArabic ? cat.ar : cat.fr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{levels.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isArabic ? 'إجمالي المستويات' : 'Total niveaux'}
          </div>
        </div>
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {levels.filter(l => l.category === cat.id).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isArabic ? cat.ar : cat.fr}
            </div>
          </div>
        ))}
      </div>

      {/* Levels List */}
      {loading && !levels.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {isArabic ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      ) : filteredLevels.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isArabic ? 'لا توجد مستويات' : 'Aucun niveau trouvé'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic 
              ? 'ابدأ بإضافة مستوى دراسي جديد'
              : 'Commencez par ajouter un nouveau niveau scolaire'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedLevels.map(group => (
            group.levels.length > 0 && (
              <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3">
                  <h3 className="text-lg font-semibold text-white">
                    {isArabic ? group.ar : group.fr}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {group.levels.map(level => (
                    <div 
                      key={level.docId}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              {level.id}
                            </span>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {isArabic ? level.ar : level.fr}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {isArabic ? level.fr : level.ar}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {isArabic ? 'الترتيب:' : 'Ordre:'} {level.order}
                          </span>
                          <button
                            onClick={() => handleEdit(level)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            title={isArabic ? 'تعديل' : 'Modifier'}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(level)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title={isArabic ? 'حذف' : 'Supprimer'}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingLevel 
                  ? (isArabic ? 'تعديل المستوى' : 'Modifier le niveau')
                  : (isArabic ? 'إضافة مستوى جديد' : 'Ajouter un nouveau niveau')
                }
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* ID Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'المعرف (ID)' : 'Identifiant (ID)'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={levelForm.id}
                  onChange={(e) => setLevelForm({ ...levelForm, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                  placeholder="cp, 1ac, 2bac-pc, etc."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isArabic ? 'استخدم حروف صغيرة وشرطات فقط' : 'Utilisez uniquement des minuscules et des tirets'}
                </p>
              </div>

              {/* French Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التسمية بالفرنسية' : 'Libellé en français'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={levelForm.fr}
                  onChange={(e) => setLevelForm({ ...levelForm, fr: e.target.value })}
                  required
                  placeholder="Ex: 1ère année collège"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Arabic Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التسمية بالعربية' : 'Libellé en arabe'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={levelForm.ar}
                  onChange={(e) => setLevelForm({ ...levelForm, ar: e.target.value })}
                  required
                  placeholder="مثال: الأولى إعدادي"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                  dir="rtl"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الفئة' : 'Catégorie'}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={levelForm.category}
                  onChange={(e) => setLevelForm({ ...levelForm, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {isArabic ? cat.ar : cat.fr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الترتيب' : 'Ordre d\'affichage'}
                </label>
                <input
                  type="number"
                  value={levelForm.order}
                  onChange={(e) => setLevelForm({ ...levelForm, order: e.target.value })}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isArabic ? 'يحدد ترتيب ظهور المستوى' : 'Détermine l\'ordre d\'affichage du niveau'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {isArabic ? 'جاري الحفظ...' : 'Enregistrement...'}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      {isArabic ? 'حفظ' : 'Enregistrer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
