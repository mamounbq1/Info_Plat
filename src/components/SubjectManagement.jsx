import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  BookOpenIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SubjectManagement() {
  const { isArabic } = useLanguage();
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  
  const [subjectForm, setSubjectForm] = useState({
    nameFr: '',
    nameAr: '',
    code: '',
    levelCode: '',
    branchCode: '',
    coefficient: 1,
    hoursPerWeek: 1,
    order: 0,
    enabled: true
  });

  useEffect(() => {
    fetchSubjects();
    fetchLevels();
    fetchBranches();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const subjectsQuery = query(collection(db, 'subjects'), orderBy('order', 'asc'));
      const snapshot = await getDocs(subjectsQuery);
      const subjectsData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error(isArabic ? 'خطأ في تحميل المواد' : 'Erreur lors du chargement des matières');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const levelsQuery = query(collection(db, 'academicLevels'), orderBy('order', 'asc'));
      const snapshot = await getDocs(levelsQuery);
      const levelsData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setLevels(levelsData);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const branchesQuery = query(collection(db, 'branches'), orderBy('order', 'asc'));
      const snapshot = await getDocs(branchesQuery);
      const branchesData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subjectForm.nameFr || !subjectForm.nameAr || !subjectForm.code) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis');
      return;
    }

    if (!subjectForm.levelCode || !subjectForm.branchCode) {
      toast.error(isArabic ? 'يرجى تحديد المستوى والشعبة' : 'Veuillez sélectionner le niveau et la filière');
      return;
    }

    try {
      setLoading(true);
      
      const subjectData = {
        nameFr: subjectForm.nameFr,
        nameAr: subjectForm.nameAr,
        code: subjectForm.code.toUpperCase(),
        levelCode: subjectForm.levelCode,
        branchCode: subjectForm.branchCode,
        coefficient: parseFloat(subjectForm.coefficient) || 1,
        hoursPerWeek: parseFloat(subjectForm.hoursPerWeek) || 1,
        order: parseInt(subjectForm.order) || 0,
        enabled: subjectForm.enabled,
        updatedAt: new Date().toISOString()
      };

      if (editingSubject) {
        // Update existing subject
        await updateDoc(doc(db, 'subjects', editingSubject.docId), subjectData);
        toast.success(isArabic ? 'تم تحديث المادة بنجاح' : 'Matière mise à jour avec succès');
      } else {
        // Create new subject
        subjectData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'subjects'), subjectData);
        toast.success(isArabic ? 'تم إضافة المادة بنجاح' : 'Matière ajoutée avec succès');
      }
      
      fetchSubjects();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error(isArabic ? 'خطأ في حفظ المادة' : 'Erreur lors de la sauvegarde de la matière');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      nameFr: subject.nameFr,
      nameAr: subject.nameAr,
      code: subject.code,
      levelCode: subject.levelCode,
      branchCode: subject.branchCode,
      coefficient: subject.coefficient || 1,
      hoursPerWeek: subject.hoursPerWeek || 1,
      order: subject.order || 0,
      enabled: subject.enabled !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (subject) => {
    if (!confirm(isArabic 
      ? `هل أنت متأكد من حذف المادة "${isArabic ? subject.nameAr : subject.nameFr}"?`
      : `Êtes-vous sûr de supprimer la matière "${subject.nameFr}" ?`
    )) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'subjects', subject.docId));
      toast.success(isArabic ? 'تم حذف المادة بنجاح' : 'Matière supprimée avec succès');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error(isArabic ? 'خطأ في حذف المادة' : 'Erreur lors de la suppression de la matière');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubjectForm({
      nameFr: '',
      nameAr: '',
      code: '',
      levelCode: '',
      branchCode: '',
      coefficient: 1,
      hoursPerWeek: 1,
      order: 0,
      enabled: true
    });
    setEditingSubject(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !searchTerm || 
      subject.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.nameAr.includes(searchTerm) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'all' || subject.levelCode === filterLevel;
    const matchesBranch = filterBranch === 'all' || subject.branchCode === filterBranch;
    
    return matchesSearch && matchesLevel && matchesBranch;
  });

  // Get available branches for selected level
  const availableBranches = subjectForm.levelCode 
    ? branches.filter(b => b.levelCode === subjectForm.levelCode)
    : [];

  // Group subjects by level and branch
  const groupedSubjects = levels.map(level => {
    const levelBranches = branches.filter(b => b.levelCode === level.id);
    return {
      level,
      branches: levelBranches.map(branch => ({
        branch,
        subjects: filteredSubjects.filter(
          s => s.levelCode === level.id && s.branchCode === branch.code
        )
      })).filter(item => item.subjects.length > 0)
    };
  }).filter(item => item.branches.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpenIcon className="w-7 h-7 text-purple-600" />
              {isArabic ? 'إدارة المواد الدراسية' : 'Gestion des Matières Enseignées'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic 
                ? 'إدارة المواد الدراسية لكل مستوى وشعبة'
                : 'Gestion des matières enseignées pour chaque niveau et filière'
              }
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2 shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            {isArabic ? 'إضافة مادة' : 'Ajouter une matière'}
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{isArabic ? 'جميع المستويات' : 'Tous les niveaux'}</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>
                {isArabic ? level.ar : level.fr}
              </option>
            ))}
          </select>

          {/* Branch Filter */}
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{isArabic ? 'جميع الشعب' : 'Toutes les filières'}</option>
            {branches.map(branch => (
              <option key={branch.code} value={branch.code}>
                {isArabic ? branch.nameAr : branch.nameFr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{subjects.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isArabic ? 'إجمالي المواد' : 'Total matières'}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {subjects.filter(s => s.enabled !== false).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isArabic ? 'المواد النشطة' : 'Matières actives'}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {levels.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isArabic ? 'المستويات' : 'Niveaux'}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {branches.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isArabic ? 'الشعب' : 'Filières'}
          </div>
        </div>
      </div>

      {/* Subjects List */}
      {loading && !subjects.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {isArabic ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isArabic ? 'لا توجد مواد' : 'Aucune matière trouvée'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isArabic 
              ? 'ابدأ بإضافة مادة دراسية جديدة'
              : 'Commencez par ajouter une nouvelle matière'
            }
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            {isArabic ? 'إضافة مادة' : 'Ajouter une matière'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSubjects.map(({ level, branches }) => (
            <div key={level.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5" />
                  {isArabic ? level.ar : level.fr}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {branches.map(({ branch, subjects }) => (
                  <div key={branch.code} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {isArabic ? branch.nameAr : branch.nameFr} ({branch.code})
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {subjects.map(subject => (
                        <div 
                          key={subject.docId}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                  {subject.code}
                                </span>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {isArabic ? subject.nameAr : subject.nameFr}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {isArabic ? subject.nameFr : subject.nameAr}
                                  </div>
                                  <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                      {isArabic ? 'المعامل:' : 'Coefficient:'} {subject.coefficient}
                                    </span>
                                    <span>
                                      {isArabic ? 'الساعات:' : 'Heures:'} {subject.hoursPerWeek}h/{isArabic ? 'أسبوع' : 'semaine'}
                                    </span>
                                    <span>
                                      {isArabic ? 'الترتيب:' : 'Ordre:'} {subject.order}
                                    </span>
                                  </div>
                                </div>
                                {subject.enabled === false && (
                                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                                    {isArabic ? 'معطلة' : 'Désactivée'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(subject)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                title={isArabic ? 'تعديل' : 'Modifier'}
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(subject)}
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingSubject 
                  ? (isArabic ? 'تعديل المادة' : 'Modifier la matière')
                  : (isArabic ? 'إضافة مادة جديدة' : 'Ajouter une nouvelle matière')
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
              {/* Subject Names */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'اسم المادة بالفرنسية' : 'Nom de la matière (Français)'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subjectForm.nameFr}
                    onChange={(e) => setSubjectForm({ ...subjectForm, nameFr: e.target.value })}
                    required
                    placeholder="Ex: Mathématiques"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'اسم المادة بالعربية' : 'Nom de la matière (Arabe)'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subjectForm.nameAr}
                    onChange={(e) => setSubjectForm({ ...subjectForm, nameAr: e.target.value })}
                    required
                    placeholder="مثال: الرياضيات"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'رمز المادة' : 'Code de la matière'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="Ex: MATH, PC, SVT, FR, AR"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isArabic ? 'استخدم حروف كبيرة فقط' : 'Utilisez uniquement des majuscules'}
                </p>
              </div>

              {/* Level and Branch */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'المستوى الدراسي' : 'Niveau scolaire'}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subjectForm.levelCode}
                    onChange={(e) => setSubjectForm({ ...subjectForm, levelCode: e.target.value, branchCode: '' })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">{isArabic ? 'اختر المستوى' : 'Sélectionner un niveau'}</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {isArabic ? level.ar : level.fr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الشعبة' : 'Filière'}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subjectForm.branchCode}
                    onChange={(e) => setSubjectForm({ ...subjectForm, branchCode: e.target.value })}
                    required
                    disabled={!subjectForm.levelCode || availableBranches.length === 0}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{isArabic ? 'اختر الشعبة' : 'Sélectionner une filière'}</option>
                    {availableBranches.map(branch => (
                      <option key={branch.code} value={branch.code}>
                        {isArabic ? branch.nameAr : branch.nameFr} ({branch.code})
                      </option>
                    ))}
                  </select>
                  {subjectForm.levelCode && availableBranches.length === 0 && (
                    <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                      {isArabic ? 'لا توجد شعب لهذا المستوى' : 'Aucune filière disponible pour ce niveau'}
                    </p>
                  )}
                </div>
              </div>

              {/* Coefficient and Hours */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'المعامل' : 'Coefficient'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={subjectForm.coefficient}
                    onChange={(e) => setSubjectForm({ ...subjectForm, coefficient: e.target.value })}
                    required
                    min="0.5"
                    step="0.5"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الساعات/الأسبوع' : 'Heures/Semaine'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={subjectForm.hoursPerWeek}
                    onChange={(e) => setSubjectForm({ ...subjectForm, hoursPerWeek: e.target.value })}
                    required
                    min="0.5"
                    step="0.5"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الترتيب' : 'Ordre'}
                  </label>
                  <input
                    type="number"
                    value={subjectForm.order}
                    onChange={(e) => setSubjectForm({ ...subjectForm, order: e.target.value })}
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={subjectForm.enabled}
                  onChange={(e) => setSubjectForm({ ...subjectForm, enabled: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isArabic ? 'المادة نشطة (مرئية للطلاب)' : 'Matière active (visible aux étudiants)'}
                </label>
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
