import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, addDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';
import Pagination from '../components/Pagination';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon,
  DocumentIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const { userProfile } = useAuth();
  const { isArabic } = useLanguage();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data state
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(isArabic ? 'خطأ في تحميل الدروس' : 'Erreur de chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'subjects'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'classes'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(data.filter(c => c.enabled));
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDelete = (course) => {
    setDeletingCourse(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'courses', deletingCourse.id));
      toast.success(isArabic ? 'تم حذف الدرس بنجاح' : 'Cours supprimé avec succès');
      fetchCourses();
      setShowDeleteModal(false);
      setDeletingCourse(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(isArabic ? 'خطأ في حذف الدرس' : 'Erreur lors de la suppression');
    }
  };

  const handleSave = async (courseData) => {
    if (!courseData.titleFr || !courseData.titleAr) {
      toast.error(isArabic ? 'الرجاء إدخال العنوان' : 'Veuillez entrer le titre');
      return;
    }

    try {
      setLoading(true);
      const saveData = {
        ...courseData,
        updatedAt: new Date().toISOString(),
        updatedBy: userProfile?.uid || 'admin'
      };

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), saveData);
        toast.success(isArabic ? 'تم تحديث الدرس بنجاح' : 'Cours mis à jour avec succès');
      }

      setShowModal(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(isArabic ? 'خطأ في حفظ الدرس' : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate
  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.titleFr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.titleAr?.includes(searchTerm);
    const matchesSubject = filterSubject === 'all' || course.subject === filterSubject;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && course.published) ||
      (filterStatus === 'draft' && !course.published);
    return matchesSearch && matchesSubject && matchesLevel && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
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
                {isArabic ? 'إدارة الدروس' : 'Gestion des Cours'}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {isArabic
                  ? `${filteredCourses.length} درس`
                  : `${filteredCourses.length} cours`}
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

              {/* Subject Filter */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{isArabic ? 'كل المواد' : 'Toutes les matières'}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.code}>
                    {isArabic ? subject.nameAr : subject.nameFr}
                  </option>
                ))}
              </select>

              {/* Level Filter */}
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{isArabic ? 'كل المستويات' : 'Tous les niveaux'}</option>
                <option value="TC">TC</option>
                <option value="1BAC">1BAC</option>
                <option value="2BAC">2BAC</option>
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

            {/* Courses Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {isArabic ? 'جاري التحميل...' : 'Chargement...'}
                  </p>
                </div>
              ) : paginatedCourses.length === 0 ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  {isArabic ? 'لا توجد دروس' : 'Aucun cours trouvé'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {paginatedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {isArabic ? course.titleAr || course.titleFr : course.titleFr}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            course.published
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {course.published
                            ? isArabic
                              ? 'منشور'
                              : 'Publié'
                            : isArabic
                            ? 'مسودة'
                            : 'Brouillon'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {isArabic ? course.descriptionAr || course.descriptionFr : course.descriptionFr}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                          {course.subject || 'N/A'}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded">
                          {course.level || 'N/A'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          <PencilIcon className="w-4 h-4" />
                          {isArabic ? 'تعديل' : 'Modifier'}
                        </button>
                        <button
                          onClick={() => handleDelete(course)}
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
              {!loading && filteredCourses.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredCourses.length}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Course Modal - EXACT fields from TeacherDashboard */}
      {showModal && editingCourse && (
        <CourseEditModal
          course={editingCourse}
          onSave={handleSave}
          onCancel={() => {
            setShowModal(false);
            setEditingCourse(null);
          }}
          subjects={subjects}
          classes={classes}
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
                ? `هل أنت متأكد من حذف الدرس "${deletingCourse?.titleAr || deletingCourse?.titleFr}"؟`
                : `Êtes-vous sûr de vouloir supprimer le cours "${deletingCourse?.titleFr}" ?`}
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

// CourseEditModal Component - Uses EXACT same fields as TeacherDashboard
function CourseEditModal({ course, onSave, onCancel, subjects, classes, isArabic }) {
  const [formData, setFormData] = useState({
    titleFr: course?.titleFr || '',
    titleAr: course?.titleAr || '',
    descriptionFr: course?.descriptionFr || '',
    descriptionAr: course?.descriptionAr || '',
    duration: course?.duration || '',
    files: course?.files || [],
    videoUrl: course?.videoUrl || '',
    thumbnail: course?.thumbnail || '',
    published: course?.published || false,
    tags: course?.tags || [],
    subject: course?.subject || '',
    targetClasses: course?.targetClasses || []
  });

  const [newTag, setNewTag] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleAddFile = () => {
    if (newFileUrl.trim() && !formData.files.includes(newFileUrl.trim())) {
      setFormData({ ...formData, files: [...formData.files, newFileUrl.trim()] });
      setNewFileUrl('');
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    setFormData({ ...formData, files: formData.files.filter(file => file !== fileToRemove) });
  };

  const handleClassToggle = (classCode) => {
    const isSelected = formData.targetClasses.includes(classCode);
    if (isSelected) {
      setFormData({
        ...formData,
        targetClasses: formData.targetClasses.filter(c => c !== classCode)
      });
    } else {
      setFormData({
        ...formData,
        targetClasses: [...formData.targetClasses, classCode]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'تعديل الدرس' : 'Modifier le cours'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'} *
                </label>
                <input
                  type="text"
                  value={formData.titleFr}
                  onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'} *
                </label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                  dir="rtl"
                  required
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
                </label>
                <textarea
                  value={formData.descriptionFr}
                  onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Subject, Duration, Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'المادة' : 'Matière'}
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled
                >
                  <option value="">{isArabic ? 'اختر المادة' : 'Sélectionner'}</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.code}>
                      {isArabic ? subject.nameAr : subject.nameFr}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {isArabic ? '(لا يمكن تغيير المادة)' : '(Matière non modifiable)'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'المدة' : 'Durée'}
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder={isArabic ? 'مثال: 2 ساعة' : 'Ex: 2h'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'صورة الغلاف' : 'Image de couverture'}
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="URL"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'رابط الفيديو' : 'Lien vidéo'}
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder={isArabic ? 'رابط فيديو يوتيوب أو آخر' : 'Lien YouTube ou autre'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DocumentIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'الملفات' : 'Fichiers'}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder={isArabic ? 'رابط الملف' : 'URL du fichier'}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isArabic ? 'إضافة' : 'Ajouter'}
                </button>
              </div>
              {formData.files.length > 0 && (
                <div className="space-y-2">
                  {formData.files.map((file, index) => {
                    // Handle both string URLs and file objects
                    const displayText = typeof file === 'string' ? file : (file?.url || file?.name || JSON.stringify(file));
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <DocumentIcon className="w-4 h-4 text-gray-500" />
                        <span className="flex-1 text-sm truncate">{displayText}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الوسوم' : 'Tags'}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder={isArabic ? 'أضف وسم' : 'Ajouter un tag'}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isArabic ? 'إضافة' : 'Ajouter'}
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Target Classes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الفصول المستهدفة' : 'Classes cibles'} *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {classes.map((classItem) => (
                  <label
                    key={classItem.id}
                    className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={formData.targetClasses.includes(classItem.code)}
                      onChange={() => handleClassToggle(classItem.code)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {isArabic ? classItem.nameAr : classItem.nameFr}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Published */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {isArabic ? 'نشر الدرس' : 'Publier le cours'}
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
