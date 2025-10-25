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
  ChevronDownIcon,
  ChevronRightIcon,
  BookOpenIcon,
  FolderIcon,
  BuildingLibraryIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AcademicStructureManagement() {
  const { isArabic } = useLanguage();
  
  // State for all collections
  const [levels, setLevels] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState({});
  const [expandedBranches, setExpandedBranches] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState(true); // Subjects section expanded by default
  
  // Modal states
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  // Editing states
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Context for adding
  const [selectedLevelForBranch, setSelectedLevelForBranch] = useState(null);
  const [selectedBranchForClass, setSelectedBranchForClass] = useState(null);
  
  // Forms
  const [levelForm, setLevelForm] = useState({
    id: '',
    fr: '',
    ar: '',
    code: '',
    order: 0,
    enabled: true
  });
  
  const [branchForm, setBranchForm] = useState({
    nameFr: '',
    nameAr: '',
    code: '',
    levelCode: '',
    order: 0,
    enabled: true,
    description: ''
  });
  
  const [classForm, setClassForm] = useState({
    nameFr: '',
    nameAr: '',
    code: '',
    levelCode: '',
    branchCode: '',
    order: 0,
    enabled: true
  });
  
  const [subjectForm, setSubjectForm] = useState({
    nameFr: '',
    nameAr: '',
    code: '',
    description: '',
    order: 0,
    enabled: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchLevels(),
      fetchBranches(),
      fetchClasses(),
      fetchSubjects()
    ]);
    setLoading(false);
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
      toast.error(isArabic ? 'خطأ في تحميل المستويات' : 'Erreur lors du chargement des niveaux');
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
      toast.error(isArabic ? 'خطأ في تحميل الشعب' : 'Erreur lors du chargement des types');
    }
  };

  const fetchClasses = async () => {
    try {
      const classesQuery = query(collection(db, 'classes'), orderBy('order', 'asc'));
      const snapshot = await getDocs(classesQuery);
      const classesData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(isArabic ? 'خطأ في تحميل الفصول' : 'Erreur lors du chargement des classes');
    }
  };

  const fetchSubjects = async () => {
    try {
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
    }
  };

  // Toggle expand/collapse
  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };

  const toggleBranch = (branchId) => {
    setExpandedBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };

  // LEVEL OPERATIONS
  const handleAddLevel = () => {
    setEditingLevel(null);
    setLevelForm({
      id: '',
      fr: '',
      ar: '',
      code: '',
      order: levels.length,
      enabled: true
    });
    setShowLevelModal(true);
  };

  const handleEditLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({
      id: level.id,
      fr: level.fr,
      ar: level.ar,
      code: level.code || level.id.toUpperCase(),
      order: level.order || 0,
      enabled: level.enabled !== false
    });
    setShowLevelModal(true);
  };

  const handleSaveLevel = async (e) => {
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
        code: levelForm.code || levelForm.id.toUpperCase(),
        order: parseInt(levelForm.order) || 0,
        enabled: levelForm.enabled,
        updatedAt: new Date().toISOString()
      };

      if (editingLevel) {
        await updateDoc(doc(db, 'academicLevels', editingLevel.docId), levelData);
        toast.success(isArabic ? 'تم تحديث المستوى' : 'Niveau mis à jour');
      } else {
        levelData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'academicLevels'), levelData);
        toast.success(isArabic ? 'تم إضافة المستوى' : 'Niveau ajouté');
      }
      
      await fetchLevels();
      setShowLevelModal(false);
    } catch (error) {
      console.error('Error saving level:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLevel = async (level) => {
    const levelBranches = branches.filter(b => b.levelCode === level.id || b.levelCode === level.code);
    if (levelBranches.length > 0) {
      toast.error(isArabic 
        ? `لا يمكن حذف المستوى لأنه يحتوي على ${levelBranches.length} نوع`
        : `Impossible de supprimer: ${levelBranches.length} type(s) attaché(s)`
      );
      return;
    }

    if (!confirm(isArabic 
      ? `هل أنت متأكد من حذف المستوى "${isArabic ? level.ar : level.fr}"?`
      : `Confirmer la suppression du niveau "${level.fr}" ?`
    )) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'academicLevels', level.docId));
      toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
      await fetchLevels();
    } catch (error) {
      console.error('Error deleting level:', error);
      toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
    } finally {
      setLoading(false);
    }
  };

  // BRANCH OPERATIONS (Types: Sciences, Lettres)
  const handleAddBranch = (levelId) => {
    setEditingBranch(null);
    setSelectedLevelForBranch(levelId);
    setBranchForm({
      nameFr: '',
      nameAr: '',
      code: '',
      levelCode: levelId,
      order: branches.filter(b => b.levelCode === levelId).length,
      enabled: true,
      description: ''
    });
    setShowBranchModal(true);
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      nameFr: branch.nameFr,
      nameAr: branch.nameAr,
      code: branch.code,
      levelCode: branch.levelCode,
      order: branch.order || 0,
      enabled: branch.enabled !== false,
      description: branch.description || ''
    });
    setShowBranchModal(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    
    if (!branchForm.nameFr || !branchForm.nameAr || !branchForm.code || !branchForm.levelCode) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const branchData = {
        nameFr: branchForm.nameFr,
        nameAr: branchForm.nameAr,
        code: branchForm.code.toUpperCase(),
        levelCode: branchForm.levelCode,
        order: parseInt(branchForm.order) || 0,
        enabled: branchForm.enabled,
        description: branchForm.description,
        updatedAt: new Date().toISOString()
      };

      if (editingBranch) {
        await updateDoc(doc(db, 'branches', editingBranch.docId), branchData);
        toast.success(isArabic ? 'تم تحديث النوع' : 'Type mis à jour');
      } else {
        branchData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'branches'), branchData);
        toast.success(isArabic ? 'تم إضافة النوع' : 'Type ajouté');
      }
      
      await fetchBranches();
      setShowBranchModal(false);
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = async (branch) => {
    const branchClasses = classes.filter(c => c.branchCode === branch.code);
    if (branchClasses.length > 0) {
      toast.error(isArabic 
        ? `لا يمكن حذف النوع لأنه يحتوي على ${branchClasses.length} فصل`
        : `Impossible de supprimer: ${branchClasses.length} classe(s) attachée(s)`
      );
      return;
    }

    if (!confirm(isArabic 
      ? `هل أنت متأكد من حذف النوع "${isArabic ? branch.nameAr : branch.nameFr}"?`
      : `Confirmer la suppression du type "${branch.nameFr}" ?`
    )) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'branches', branch.docId));
      toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
      await fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
    } finally {
      setLoading(false);
    }
  };

  // CLASS OPERATIONS (TCSF1, TCSF2, etc.)
  const handleAddClass = (branchCode, levelCode) => {
    setEditingClass(null);
    setSelectedBranchForClass(branchCode);
    setClassForm({
      nameFr: '',
      nameAr: '',
      code: '',
      levelCode: levelCode,
      branchCode: branchCode,
      order: classes.filter(c => c.branchCode === branchCode).length,
      enabled: true
    });
    setShowClassModal(true);
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setClassForm({
      nameFr: classItem.nameFr,
      nameAr: classItem.nameAr,
      code: classItem.code,
      levelCode: classItem.levelCode,
      branchCode: classItem.branchCode,
      order: classItem.order || 0,
      enabled: classItem.enabled !== false
    });
    setShowClassModal(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    
    if (!classForm.code || !classForm.levelCode || !classForm.branchCode) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const classData = {
        nameFr: classForm.nameFr || classForm.code,
        nameAr: classForm.nameAr || classForm.code,
        code: classForm.code.toUpperCase(),
        // Both naming conventions for maximum compatibility
        levelCode: classForm.levelCode,
        branchCode: classForm.branchCode,
        level: classForm.levelCode,      // For general use and TestStudentClass
        branch: classForm.branchCode,    // For general use and TestStudentClass
        order: parseInt(classForm.order) || 0,
        enabled: classForm.enabled,
        updatedAt: new Date().toISOString()
      };

      if (editingClass) {
        await updateDoc(doc(db, 'classes', editingClass.docId), classData);
        toast.success(isArabic ? 'تم تحديث الفصل' : 'Classe mise à jour');
      } else {
        classData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'classes'), classData);
        toast.success(isArabic ? 'تم إضافة الفصل' : 'Classe ajoutée');
      }
      
      await fetchClasses();
      setShowClassModal(false);
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classItem) => {
    if (!confirm(isArabic 
      ? `هل أنت متأكد من حذف الفصل "${classItem.code}"?`
      : `Confirmer la suppression de la classe "${classItem.code}" ?`
    )) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'classes', classItem.docId));
      toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
    } finally {
      setLoading(false);
    }
  };

  // SUBJECT OPERATIONS (Separate section)
  const handleAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({
      nameFr: '',
      nameAr: '',
      code: '',
      description: '',
      order: subjects.length,
      enabled: true
    });
    setShowSubjectModal(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      nameFr: subject.nameFr,
      nameAr: subject.nameAr,
      code: subject.code,
      description: subject.description || '',
      order: subject.order || 0,
      enabled: subject.enabled !== false
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    
    if (!subjectForm.nameFr || !subjectForm.nameAr || !subjectForm.code) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const subjectData = {
        nameFr: subjectForm.nameFr,
        nameAr: subjectForm.nameAr,
        code: subjectForm.code.toUpperCase(),
        description: subjectForm.description,
        order: parseInt(subjectForm.order) || 0,
        enabled: subjectForm.enabled,
        updatedAt: new Date().toISOString()
      };

      if (editingSubject) {
        await updateDoc(doc(db, 'subjects', editingSubject.docId), subjectData);
        toast.success(isArabic ? 'تم تحديث المادة' : 'Matière mise à jour');
      } else {
        subjectData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'subjects'), subjectData);
        toast.success(isArabic ? 'تم إضافة المادة' : 'Matière ajoutée');
      }
      
      await fetchSubjects();
      setShowSubjectModal(false);
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subject) => {
    if (!confirm(isArabic 
      ? `هل أنت متأكد من حذف المادة "${isArabic ? subject.nameAr : subject.nameFr}"?`
      : `Confirmer la suppression de la matière "${subject.nameFr}" ?`
    )) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'subjects', subject.docId));
      toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
      await fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
    } finally {
      setLoading(false);
    }
  };

  // Get branches for a level
  const getBranchesForLevel = (levelId) => {
    // levelId can be either level.id (lowercase) or level.code (uppercase)
    // branches.levelCode is always uppercase (TC, 1BAC, 2BAC)
    const filtered = branches.filter(b => {
      // Direct match with levelCode
      if (b.levelCode === levelId) return true;
      // Match with level.code if levelId is level.id
      const level = levels.find(l => l.id === levelId || l.code === levelId);
      return b.levelCode === level?.code;
    });
    console.log(`📊 getBranchesForLevel(${levelId}): found ${filtered.length} branches`, filtered.map(b => b.nameFr));
    return filtered;
  };

  // Get classes for a branch
  const getClassesForBranch = (branchCode) => {
    return classes.filter(c => c.branchCode === branchCode);
  };



  if (loading && levels.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BuildingLibraryIcon className="w-7 h-7 text-purple-600" />
              {isArabic ? 'الهيكل الأكاديمي' : 'Structure Académique'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic 
                ? 'إدارة المستويات والأنواع والفصول والمواد'
                : 'Gestion des niveaux, types, classes et matières'
              }
            </p>
          </div>
          <button
            onClick={handleAddLevel}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2 shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            {isArabic ? 'إضافة مستوى' : 'Ajouter un niveau'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{levels.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'المستويات' : 'Niveaux'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{branches.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'الأنواع' : 'Types'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{classes.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'الفصول' : 'Classes'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{subjects.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'المواد' : 'Matières'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchical Structure: Levels → Types → Classes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3">
          <h3 className="text-lg font-semibold text-white">
            {isArabic ? 'الهيكل الهرمي: المستويات والأنواع والفصول' : 'Structure Hiérarchique: Niveaux, Types et Classes'}
          </h3>
        </div>

        {levels.length === 0 ? (
          <div className="p-12 text-center">
            <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isArabic ? 'لا توجد مستويات' : 'Aucun niveau'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isArabic ? 'ابدأ بإضافة مستوى دراسي' : 'Commencez par ajouter un niveau scolaire'}
            </p>
            <button
              onClick={handleAddLevel}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              {isArabic ? 'إضافة مستوى' : 'Ajouter un niveau'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {levels.map((level) => {
              const levelBranches = getBranchesForLevel(level.code || level.id);
              const isLevelExpanded = expandedLevels[level.id];
              
              return (
                <div key={level.docId} className="border-l-4 border-blue-500">
                  {/* LEVEL */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleLevel(level.id)}
                          className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
                        >
                          {isLevelExpanded ? (
                            <ChevronDownIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronRightIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                        <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                              {isArabic ? level.ar : level.fr}
                            </span>
                            <span className="text-xs font-mono bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
                              {level.code || level.id}
                            </span>
                            {levelBranches.length > 0 && (
                              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                                {levelBranches.length} {isArabic ? 'نوع' : 'type(s)'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddBranch(level.code || level.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                          title={isArabic ? 'إضافة نوع' : 'Ajouter type'}
                        >
                          <PlusIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditLevel(level)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition"
                          title={isArabic ? 'تعديل' : 'Modifier'}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLevel(level)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title={isArabic ? 'حذف' : 'Supprimer'}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TYPES/BRANCHES */}
                  {isLevelExpanded && levelBranches.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900/50">
                      {levelBranches.map((branch) => {
                        const branchClasses = getClassesForBranch(branch.code);
                        const isBranchExpanded = expandedBranches[branch.docId];
                        
                        return (
                          <div key={branch.docId} className="border-l-4 border-purple-500 ml-8">
                            {/* TYPE/BRANCH */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    onClick={() => toggleBranch(branch.docId)}
                                    className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded"
                                  >
                                    {isBranchExpanded ? (
                                      <ChevronDownIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    ) : (
                                      <ChevronRightIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    )}
                                  </button>
                                  <FolderIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {isArabic ? branch.nameAr : branch.nameFr}
                                      </span>
                                      <span className="text-xs font-mono bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">
                                        {branch.code}
                                      </span>
                                      {branchClasses.length > 0 && (
                                        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded">
                                          {branchClasses.length} {isArabic ? 'فصل' : 'classe(s)'}
                                        </span>
                                      )}
                                    </div>
                                    {branch.description && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {branch.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAddClass(branch.code, level.code || level.id)}
                                    className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition"
                                    title={isArabic ? 'إضافة فصل' : 'Ajouter classe'}
                                  >
                                    <PlusIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleEditBranch(branch)}
                                    className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition"
                                    title={isArabic ? 'تعديل' : 'Modifier'}
                                  >
                                    <PencilIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBranch(branch)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                    title={isArabic ? 'حذف' : 'Supprimer'}
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* CLASSES */}
                            {isBranchExpanded && branchClasses.length > 0 && (
                              <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {branchClasses.map((classItem) => (
                                  <div key={classItem.docId} className="p-3 ml-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 flex-1">
                                        <UserGroupIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                              {classItem.code}
                                            </span>
                                            {classItem.enabled === false && (
                                              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                                                {isArabic ? 'معطل' : 'Désactivé'}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleEditClass(classItem)}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                          title={isArabic ? 'تعديل' : 'Modifier'}
                                        >
                                          <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteClass(classItem)}
                                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                          title={isArabic ? 'حذف' : 'Supprimer'}
                                        >
                                          <TrashIcon className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {isBranchExpanded && branchClasses.length === 0 && (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm ml-8 bg-white dark:bg-gray-800">
                                {isArabic ? 'لا توجد فصول في هذا النوع' : 'Aucune classe dans ce type'}
                                <button
                                  onClick={() => handleAddClass(branch.code, level.code || level.id)}
                                  className="ml-2 text-orange-600 hover:underline"
                                >
                                  {isArabic ? 'إضافة فصل' : 'Ajouter une classe'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {isLevelExpanded && levelBranches.length === 0 && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-900/50">
                      {isArabic ? 'لا توجد أنواع في هذا المستوى' : 'Aucun type dans ce niveau'}
                      <button
                        onClick={() => handleAddBranch(level.code || level.id)}
                        className="ml-2 text-purple-600 hover:underline"
                      >
                        {isArabic ? 'إضافة نوع' : 'Ajouter un type'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SUBJECTS SECTION (Separate) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 flex justify-between items-center cursor-pointer"
             onClick={() => setExpandedSubjects(!expandedSubjects)}>
          <div className="flex items-center gap-2">
            {expandedSubjects ? (
              <ChevronDownIcon className="w-5 h-5 text-white" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-white" />
            )}
            <BookOpenIcon className="w-6 h-6 text-white" />
            <h3 className="text-lg font-semibold text-white">
              {isArabic ? 'المواد الدراسية (مستقلة تماماً)' : 'Matières (Indépendantes)'}
            </h3>
            <span className="text-sm bg-white/20 px-2 py-1 rounded text-white">
              {subjects.length} {isArabic ? 'مادة' : 'matière(s)'}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddSubject();
            }}
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            {isArabic ? 'إضافة مادة' : 'Ajouter matière'}
          </button>
        </div>

        {expandedSubjects && (
          <div className="p-6">
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isArabic ? 'لا توجد مواد دراسية' : 'Aucune matière'}
                </p>
                <button
                  onClick={handleAddSubject}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {isArabic ? 'إضافة مادة' : 'Ajouter une matière'}
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(subject => (
                  <div key={subject.docId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {isArabic ? subject.nameAr : subject.nameFr}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {isArabic ? subject.nameFr : subject.nameAr}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-green-200 dark:bg-green-800 px-2 py-1 rounded">
                        {subject.code}
                      </span>
                    </div>
                    
                    {subject.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {subject.enabled === false && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded flex-1">
                          {isArabic ? 'معطلة' : 'Désactivée'}
                        </span>
                      )}
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title={isArabic ? 'تعديل' : 'Modifier'}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title={isArabic ? 'حذف' : 'Supprimer'}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LEVEL MODAL */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {editingLevel ? (isArabic ? 'تعديل المستوى' : 'Modifier le niveau') : (isArabic ? 'مستوى جديد' : 'Nouveau niveau')}
              </h3>
              <button onClick={() => setShowLevelModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveLevel} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={levelForm.id} onChange={(e) => setLevelForm({ ...levelForm, id: e.target.value.toLowerCase() })} required placeholder="tc, 1bac" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
                  <input type="text" value={levelForm.code} onChange={(e) => setLevelForm({ ...levelForm, code: e.target.value.toUpperCase() })} placeholder="TC, 1BAC" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'بالفرنسية' : 'Français'} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={levelForm.fr} onChange={(e) => setLevelForm({ ...levelForm, fr: e.target.value })} required className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'بالعربية' : 'Arabe'} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={levelForm.ar} onChange={(e) => setLevelForm({ ...levelForm, ar: e.target.value })} required dir="rtl" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input type="checkbox" id="levelEnabled" checked={levelForm.enabled} onChange={(e) => setLevelForm({ ...levelForm, enabled: e.target.checked })} className="w-5 h-5" />
                <label htmlFor="levelEnabled" className="text-sm font-medium">{isArabic ? 'نشط' : 'Actif'}</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowLevelModal(false)} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <CheckIcon className="w-5 h-5" />}
                  {isArabic ? 'حفظ' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRANCH MODAL */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-white">
                {editingBranch ? (isArabic ? 'تعديل النوع' : 'Modifier le type') : (isArabic ? 'نوع جديد' : 'Nouveau type')}
              </h3>
              <button onClick={() => setShowBranchModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveBranch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{isArabic ? 'المستوى' : 'Niveau'} <span className="text-red-500">*</span></label>
                <select value={branchForm.levelCode} onChange={(e) => setBranchForm({ ...branchForm, levelCode: e.target.value })} required disabled={!!editingBranch} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50">
                  <option value="">{isArabic ? 'اختر' : 'Sélectionner'}</option>
                  {levels.map(level => (<option key={level.id} value={level.id}>{isArabic ? level.ar : level.fr}</option>))}
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'بالفرنسية' : 'Français'} <span className="text-red-500">*</span></label>
                  <input type="text" value={branchForm.nameFr} onChange={(e) => setBranchForm({ ...branchForm, nameFr: e.target.value })} required placeholder="Sciences" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'بالعربية' : 'Arabe'} <span className="text-red-500">*</span></label>
                  <input type="text" value={branchForm.nameAr} onChange={(e) => setBranchForm({ ...branchForm, nameAr: e.target.value })} required dir="rtl" placeholder="العلوم" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Code <span className="text-red-500">*</span></label>
                <input type="text" value={branchForm.code} onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })} required placeholder="SCI, LET" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{isArabic ? 'الوصف' : 'Description'}</label>
                <textarea value={branchForm.description} onChange={(e) => setBranchForm({ ...branchForm, description: e.target.value })} rows={2} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input type="checkbox" id="branchEnabled" checked={branchForm.enabled} onChange={(e) => setBranchForm({ ...branchForm, enabled: e.target.checked })} className="w-5 h-5" />
                <label htmlFor="branchEnabled" className="text-sm font-medium">{isArabic ? 'نشط' : 'Actif'}</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowBranchModal(false)} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <CheckIcon className="w-5 h-5" />}
                  {isArabic ? 'حفظ' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASS MODAL */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {editingClass ? (isArabic ? 'تعديل الفصل' : 'Modifier la classe') : (isArabic ? 'فصل جديد' : 'Nouvelle classe')}
              </h3>
              <button onClick={() => setShowClassModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveClass} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code <span className="text-red-500">*</span></label>
                <input type="text" value={classForm.code} onChange={(e) => setClassForm({ ...classForm, code: e.target.value.toUpperCase() })} required placeholder="TCSF1, 1BACSM2" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500" />
                <p className="mt-1 text-xs text-gray-500">{isArabic ? 'مثال: TCSF1, TCSF2, TCLSH1' : 'Ex: TCSF1, TCSF2, TCLSH1'}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'بالفرنسية' : 'Nom (Français)'}</label>
                  <input type="text" value={classForm.nameFr} onChange={(e) => setClassForm({ ...classForm, nameFr: e.target.value })} placeholder={classForm.code} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'بالعربية' : 'Nom (Arabe)'}</label>
                  <input type="text" value={classForm.nameAr} onChange={(e) => setClassForm({ ...classForm, nameAr: e.target.value })} dir="rtl" placeholder={classForm.code} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input type="checkbox" id="classEnabled" checked={classForm.enabled} onChange={(e) => setClassForm({ ...classForm, enabled: e.target.checked })} className="w-5 h-5" />
                <label htmlFor="classEnabled" className="text-sm font-medium">{isArabic ? 'نشط' : 'Actif'}</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <CheckIcon className="w-5 h-5" />}
                  {isArabic ? 'حفظ' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-white">
                {editingSubject ? (isArabic ? 'تعديل المادة' : 'Modifier la matière') : (isArabic ? 'مادة جديدة' : 'Nouvelle matière')}
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'بالفرنسية' : 'Français'} <span className="text-red-500">*</span></label>
                  <input type="text" value={subjectForm.nameFr} onChange={(e) => setSubjectForm({ ...subjectForm, nameFr: e.target.value })} required placeholder="Mathématiques" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isArabic ? 'بالعربية' : 'Arabe'} <span className="text-red-500">*</span></label>
                  <input type="text" value={subjectForm.nameAr} onChange={(e) => setSubjectForm({ ...subjectForm, nameAr: e.target.value })} required dir="rtl" placeholder="الرياضيات" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Code <span className="text-red-500">*</span></label>
                <input type="text" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })} required placeholder="MATH, PC, SVT, FR, AR, PHILO" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{isArabic ? 'الوصف' : 'Description'}</label>
                <textarea value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} rows={3} placeholder={isArabic ? 'وصف المادة (اختياري)' : 'Description de la matière (optionnel)'} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{isArabic ? 'الترتيب' : 'Ordre d\'affichage'}</label>
                <input type="number" value={subjectForm.order} onChange={(e) => setSubjectForm({ ...subjectForm, order: e.target.value })} min="0" placeholder="0" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input type="checkbox" id="subjectEnabled" checked={subjectForm.enabled} onChange={(e) => setSubjectForm({ ...subjectForm, enabled: e.target.checked })} className="w-5 h-5" />
                <label htmlFor="subjectEnabled" className="text-sm font-medium">{isArabic ? 'نشطة (مرئية للاستخدام)' : 'Active (visible pour utilisation)'}</label>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {isArabic 
                    ? '💡 هذه المادة مستقلة تماماً. يمكن استخدامها في أي مستوى أو نوع أو فصل.'
                    : '💡 Cette matière est totalement indépendante. Elle peut être utilisée dans n\'importe quel niveau, type ou classe.'
                  }
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <CheckIcon className="w-5 h-5" />}
                  {isArabic ? 'حفظ' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
