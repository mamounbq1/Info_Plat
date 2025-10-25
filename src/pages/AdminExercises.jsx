import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';
import Pagination from '../components/Pagination';
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  XMarkIcon,
  AcademicCapIcon,
  LinkIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminExercises() {
  const { userProfile } = useAuth();
  const { isArabic } = useLanguage();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data state
  const [exercises, setExercises] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [deletingExercise, setDeletingExercise] = useState(null);

  useEffect(() => {
    fetchExercises();
    fetchCourses();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'exercises'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error(isArabic ? 'خطأ في تحميل التمارين' : 'Erreur de chargement des exercices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setShowModal(true);
  };

  const handleDelete = (exercise) => {
    setDeletingExercise(exercise);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'exercises', deletingExercise.id));
      toast.success(isArabic ? 'تم حذف التمرين بنجاح' : 'Exercice supprimé avec succès');
      fetchExercises();
      setShowDeleteModal(false);
      setDeletingExercise(null);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error(isArabic ? 'خطأ في حذف التمرين' : 'Erreur lors de la suppression');
    }
  };

  const handleSave = async (exerciseData) => {
    if (!exerciseData.title) {
      toast.error(isArabic ? 'الرجاء إدخال العنوان' : 'Veuillez entrer le titre');
      return;
    }

    try {
      setLoading(true);
      const saveData = {
        ...exerciseData,
        updatedAt: new Date().toISOString(),
        updatedBy: userProfile?.uid || 'admin'
      };

      if (editingExercise) {
        await updateDoc(doc(db, 'exercises', editingExercise.id), saveData);
        toast.success(isArabic ? 'تم تحديث التمرين بنجاح' : 'Exercice mis à jour avec succès');
      }

      setShowModal(false);
      setEditingExercise(null);
      fetchExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error(isArabic ? 'خطأ في حفظ التمرين' : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || exercise.courseId === filterCourse;
    const matchesDifficulty = filterDifficulty === 'all' || exercise.difficulty === filterDifficulty;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && exercise.published) ||
      (filterStatus === 'draft' && !exercise.published);
    return matchesSearch && matchesCourse && matchesDifficulty && matchesStatus;
  });

  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
  const paginatedExercises = filteredExercises.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'
        } transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isArabic ? 'إدارة التمارين' : 'Gestion des Exercices'}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {isArabic
                  ? `${filteredExercises.length} تمرين`
                  : `${filteredExercises.length} exercices`}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Search and Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={isArabic ? 'بحث...' : 'Rechercher...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Course Filter */}
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{isArabic ? 'كل الدروس' : 'Tous les cours'}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {isArabic ? course.titleAr || course.titleFr : course.titleFr}
                  </option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{isArabic ? 'كل المستويات' : 'Toutes les difficultés'}</option>
                <option value="easy">{isArabic ? 'سهل' : 'Facile'}</option>
                <option value="medium">{isArabic ? 'متوسط' : 'Moyen'}</option>
                <option value="hard">{isArabic ? 'صعب' : 'Difficile'}</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{isArabic ? 'كل الحالات' : 'Tous les statuts'}</option>
                <option value="published">{isArabic ? 'منشور' : 'Publié'}</option>
                <option value="draft">{isArabic ? 'مسودة' : 'Brouillon'}</option>
              </select>
            </div>

            {/* Exercises Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {isArabic ? 'جاري التحميل...' : 'Chargement...'}
                  </p>
                </div>
              ) : paginatedExercises.length === 0 ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  {isArabic ? 'لا توجد تمارين' : 'Aucun exercice trouvé'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {paginatedExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {exercise.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            exercise.published
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {exercise.published
                            ? isArabic
                              ? 'منشور'
                              : 'Publié'
                            : isArabic
                            ? 'مسودة'
                            : 'Brouillon'}
                        </span>
                      </div>

                      {exercise.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {exercise.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded">
                          {exercise.type || 'file'}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded">
                          {exercise.difficulty || 'medium'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(exercise)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          <PencilIcon className="w-4 h-4" />
                          {isArabic ? 'تعديل' : 'Modifier'}
                        </button>
                        <button
                          onClick={() => handleDelete(exercise)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <TrashIcon className="w-4 h-4" />
                          {isArabic ? 'حذف' : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && filteredExercises.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredExercises.length}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Exercise Modal - EXACT fields from TeacherDashboard */}
      {showModal && editingExercise && (
        <ExerciseEditModal
          exercise={editingExercise}
          onSave={handleSave}
          onCancel={() => {
            setShowModal(false);
            setEditingExercise(null);
          }}
          courses={courses}
          isArabic={isArabic}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'تأكيد الحذف' : 'Confirmer la suppression'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isArabic
                ? `هل أنت متأكد من حذف التمرين "${deletingExercise?.title}"؟`
                : `Êtes-vous sûr de vouloir supprimer l'exercice "${deletingExercise?.title}" ?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {isArabic ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                {isArabic ? 'حذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ExerciseEditModal Component - Uses EXACT same fields as TeacherDashboard exerciseForm
function ExerciseEditModal({ exercise, onSave, onCancel, courses, isArabic }) {
  const [formData, setFormData] = useState({
    title: exercise?.title || '',
    description: exercise?.description || '',
    courseId: exercise?.courseId || '',
    type: exercise?.type || 'file',
    fileUrl: exercise?.fileUrl || '',
    files: exercise?.files || [],
    content: exercise?.content || '',
    externalLink: exercise?.externalLink || '',
    difficulty: exercise?.difficulty || 'medium',
    targetLevels: exercise?.targetLevels || [],
    published: exercise?.published || false
  });

  const [newFileUrl, setNewFileUrl] = useState('');

  const handleAddFile = () => {
    if (newFileUrl.trim() && !formData.files.includes(newFileUrl.trim())) {
      setFormData({ ...formData, files: [...formData.files, newFileUrl.trim()] });
      setNewFileUrl('');
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    setFormData({ ...formData, files: formData.files.filter(file => file !== fileToRemove) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'تعديل التمرين' : 'Modifier l\'exercice'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان' : 'Titre'} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الوصف' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الدرس' : 'Cours'} *
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                disabled
              >
                <option value="">{isArabic ? 'اختر درس' : 'Sélectionner un cours'}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {isArabic ? course.titleAr || course.titleFr : course.titleFr}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {isArabic ? '(لا يمكن تغيير الدرس)' : '(Cours non modifiable)'}
              </p>
            </div>

            {/* Type and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'النوع' : 'Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="file">{isArabic ? 'ملف' : 'Fichier'}</option>
                  <option value="content">{isArabic ? 'محتوى نصي' : 'Contenu texte'}</option>
                  <option value="externalLink">{isArabic ? 'رابط خارجي' : 'Lien externe'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الصعوبة' : 'Difficulté'}
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="easy">{isArabic ? 'سهل' : 'Facile'}</option>
                  <option value="medium">{isArabic ? 'متوسط' : 'Moyen'}</option>
                  <option value="hard">{isArabic ? 'صعب' : 'Difficile'}</option>
                </select>
              </div>
            </div>

            {/* Conditional Fields based on type */}
            {formData.type === 'file' && (
              <>
                {/* File URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DocumentIcon className="w-4 h-4 inline mr-1" />
                    {isArabic ? 'رابط الملف الرئيسي' : 'URL du fichier principal'}
                  </label>
                  <input
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Additional Files */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'ملفات إضافية' : 'Fichiers additionnels'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                      placeholder={isArabic ? 'رابط ملف إضافي' : 'URL fichier additionnel'}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddFile}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      {isArabic ? 'إضافة' : 'Ajouter'}
                    </button>
                  </div>
                  {formData.files.length > 0 && (
                    <div className="space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                          <DocumentIcon className="w-4 h-4 text-gray-500" />
                          <span className="flex-1 text-sm truncate">{file}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {formData.type === 'content' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                  {isArabic ? 'المحتوى' : 'Contenu'}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="8"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder={isArabic ? 'أدخل المحتوى هنا...' : 'Entrez le contenu ici...'}
                />
              </div>
            )}

            {formData.type === 'externalLink' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  {isArabic ? 'الرابط الخارجي' : 'Lien externe'}
                </label>
                <input
                  type="url"
                  value={formData.externalLink}
                  onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Course Info (read-only) */}
            {selectedCourse && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  {isArabic ? 'معلومات الدرس المرتبط' : 'Informations du cours associé'}
                </h4>
                <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <p><strong>{isArabic ? 'المادة:' : 'Matière:'}</strong> {selectedCourse.subject}</p>
                  <p><strong>{isArabic ? 'الفصول المستهدفة:' : 'Classes cibles:'}</strong> {selectedCourse.targetClasses?.join(', ') || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Published */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <label htmlFor="published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {isArabic ? 'نشر التمرين' : 'Publier l\'exercice'}
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {isArabic ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                {isArabic ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
