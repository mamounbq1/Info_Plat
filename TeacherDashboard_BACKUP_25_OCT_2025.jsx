import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentIcon, 
  PencilIcon,
  FolderIcon,
  AcademicCapIcon,
  UsersIcon,
  ChartBarIcon,
  BookOpenIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUpload from '../components/FileUpload';
import Sidebar from '../components/Sidebar';

const CATEGORIES = [
  { id: 'mathematics', fr: 'Mathématiques', ar: 'الرياضيات' },
  { id: 'physics', fr: 'Physique', ar: 'الفيزياء' },
  { id: 'chemistry', fr: 'Chimie', ar: 'الكيمياء' },
  { id: 'biology', fr: 'Biologie', ar: 'الأحياء' },
  { id: 'computer', fr: 'Informatique', ar: 'علوم الحاسوب' },
  { id: 'languages', fr: 'Langues', ar: 'اللغات' },
  { id: 'history', fr: 'Histoire', ar: 'التاريخ' },
  { id: 'geography', fr: 'Géographie', ar: 'الجغرافيا' },
  { id: 'philosophy', fr: 'Philosophie', ar: 'الفلسفة' },
  { id: 'other', fr: 'Autre', ar: 'أخرى' }
];

const LEVELS = [
  { id: 'beginner', fr: 'Débutant', ar: 'مبتدئ' },
  { id: 'intermediate', fr: 'Intermédiaire', ar: 'متوسط' },
  { id: 'advanced', fr: 'Avancé', ar: 'متقدم' }
];

export default function TeacherDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  
  // State
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'students', 'stats'
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [courseForm, setCourseForm] = useState({
    titleFr: '',
    titleAr: '',
    descriptionFr: '',
    descriptionAr: '',
    category: 'mathematics',
    level: 'beginner',
    duration: '',
    files: [],
    videoUrl: '',
    thumbnail: '',
    published: false,
    tags: []
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Teachers only see their own courses
      const coursesQuery = query(
        collection(db, 'courses'), 
        where('createdBy', '==', userProfile?.fullName || currentUser?.email),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(coursesQuery);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // If index doesn't exist, fetch all and filter manually
      if (error.code === 'failed-precondition' || error.message?.includes('requires an index')) {
        try {
          console.log('⚠️ Index not found, using fallback: fetching all courses and filtering locally');
          const allCoursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(allCoursesQuery);
          const coursesData = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(course => course.createdBy === (userProfile?.fullName || currentUser?.email));
          setCourses(coursesData);
          console.log(`✅ Loaded ${coursesData.length} courses for teacher`);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          // Last resort: try without orderBy
          try {
            const simpleQuery = collection(db, 'courses');
            const snapshot = await getDocs(simpleQuery);
            const coursesData = snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(course => course.createdBy === (userProfile?.fullName || currentUser?.email))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setCourses(coursesData);
            console.log(`✅ Loaded ${coursesData.length} courses (simple query)`);
          } catch (finalError) {
            console.error('Final fallback error:', finalError);
            toast.error(isArabic ? 'خطأ في تحميل الدروس' : 'Erreur lors du chargement des cours');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Fetch all students
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
      const snapshot = await getDocs(studentsQuery);
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      // If index doesn't exist, just set empty array
      setStudents([]);
    }
  };

  const handleFilesUploaded = (uploadedFiles) => {
    setCourseForm({ ...courseForm, files: uploadedFiles });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !courseForm.tags.includes(newTag.trim())) {
      setCourseForm({
        ...courseForm,
        tags: [...courseForm.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCourseForm({
      ...courseForm,
      tags: courseForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (courseForm.files.length === 0 && !courseForm.videoUrl) {
      toast.error(
        isArabic
          ? 'يرجى إضافة ملفات أو رابط فيديو'
          : 'Veuillez ajouter des fichiers ou un lien vidéo'
      );
      return;
    }

    try {
      setLoading(true);
      
      const courseData = {
        ...courseForm,
        updatedAt: new Date().toISOString(),
        createdBy: userProfile?.fullName || currentUser?.email,
        teacherId: currentUser?.uid
      };

      if (editingCourse) {
        // Update existing course
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
        toast.success(isArabic ? 'تم تحديث الدرس بنجاح' : 'Cours mis à jour avec succès');
      } else {
        // Create new course
        courseData.createdAt = new Date().toISOString();
        courseData.enrollmentCount = 0;
        await addDoc(collection(db, 'courses'), courseData);
        toast.success(isArabic ? 'تم إضافة الدرس بنجاح' : 'Cours ajouté avec succès');
      }
      
      closeModal();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(isArabic ? 'خطأ في حفظ الدرس' : 'Erreur lors de l\'enregistrement du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setCourseForm({
      titleFr: course.titleFr || '',
      titleAr: course.titleAr || '',
      descriptionFr: course.descriptionFr || '',
      descriptionAr: course.descriptionAr || '',
      category: course.category || 'mathematics',
      level: course.level || 'beginner',
      duration: course.duration || '',
      files: course.files || [],
      videoUrl: course.videoUrl || '',
      thumbnail: course.thumbnail || '',
      published: course.published || false,
      tags: course.tags || []
    });
    setShowCourseModal(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الدرس؟' : 'Êtes-vous sûr de vouloir supprimer ce cours?')) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        toast.success(isArabic ? 'تم حذف الدرس بنجاح' : 'Cours supprimé avec succès');
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error(isArabic ? 'خطأ في حذف الدرس' : 'Erreur lors de la suppression');
      }
    }
  };

  const togglePublished = async (course) => {
    try {
      await updateDoc(doc(db, 'courses', course.id), {
        published: !course.published
      });
      toast.success(
        course.published
          ? (isArabic ? 'تم إخفاء الدرس' : 'Cours masqué')
          : (isArabic ? 'تم نشر الدرس' : 'Cours publié')
      );
      fetchCourses();
    } catch (error) {
      console.error('Error toggling published:', error);
      toast.error(isArabic ? 'خطأ في تحديث حالة النشر' : 'Erreur lors de la mise à jour');
    }
  };

  const handleDuplicate = async (course) => {
    try {
      setLoading(true);
      const duplicatedCourse = {
        ...course,
        titleFr: `${course.titleFr} (Copie)`,
        titleAr: `${course.titleAr} (نسخة)`,
        published: false,
        createdAt: new Date().toISOString(),
        createdBy: userProfile?.fullName || currentUser?.email,
        teacherId: currentUser?.uid,
        enrollmentCount: 0
      };
      delete duplicatedCourse.id;
      await addDoc(collection(db, 'courses'), duplicatedCourse);
      toast.success(isArabic ? 'تم تكرار الدرس بنجاح' : 'Cours dupliqué avec succès');
      fetchCourses();
    } catch (error) {
      console.error('Error duplicating course:', error);
      toast.error(isArabic ? 'خطأ في التكرار' : 'Erreur lors de la duplication');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCourses.length === 0) {
      toast.error(isArabic ? 'الرجاء اختيار دروس' : 'Veuillez sélectionner des cours');
      return;
    }

    if (action === 'delete') {
      if (!window.confirm(isArabic ? `حذف ${selectedCourses.length} دروس؟` : `Supprimer ${selectedCourses.length} cours?`)) {
        return;
      }
    }

    try {
      setLoading(true);
      
      for (const courseId of selectedCourses) {
        if (action === 'delete') {
          await deleteDoc(doc(db, 'courses', courseId));
        } else if (action === 'publish') {
          await updateDoc(doc(db, 'courses', courseId), { published: true });
        } else if (action === 'unpublish') {
          await updateDoc(doc(db, 'courses', courseId), { published: false });
        }
      }
      
      const actionMessages = {
        delete: isArabic ? 'تم حذف الدروس' : 'Cours supprimés',
        publish: isArabic ? 'تم نشر الدروس' : 'Cours publiés',
        unpublish: isArabic ? 'تم إلغاء نشر الدروس' : 'Cours dépubliés'
      };
      
      toast.success(actionMessages[action]);
      setSelectedCourses([]);
      fetchCourses();
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      toast.error(isArabic ? 'خطأ في العملية' : 'Erreur dans l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(c => c.id));
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.titleFr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.titleAr?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && course.published) ||
      (filterStatus === 'draft' && !course.published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const closeModal = () => {
    setShowCourseModal(false);
    setEditingCourse(null);
    setCourseForm({
      titleFr: '',
      titleAr: '',
      descriptionFr: '',
      descriptionAr: '',
      category: 'mathematics',
      level: 'beginner',
      duration: '',
      files: [],
      videoUrl: '',
      thumbnail: '',
      published: false,
      tags: []
    });
  };

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.published).length,
    totalStudents: students.length,
    totalEnrollments: courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isArabic ? 'لوحة تحكم المعلم' : 'Tableau de bord Enseignant'}
                </h1>
                <p className="text-indigo-100">
                  {isArabic 
                    ? `مرحباً ${userProfile?.fullName || 'معلم'}` 
                    : `Bienvenue ${userProfile?.fullName || 'Enseignant'}`
                  }
                </p>
              </div>
              <button
                onClick={() => setShowCourseModal(true)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition flex items-center gap-2 shadow-md"
              >
                <PlusIcon className="w-5 h-5" />
                {isArabic ? 'درس جديد' : 'Nouveau Cours'}
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<BookOpenIcon className="w-8 h-8" />}
              title={isArabic ? 'إجمالي الدروس' : 'Total Cours'}
              value={stats.totalCourses}
              color="blue"
            />
            <StatCard
              icon={<AcademicCapIcon className="w-8 h-8" />}
              title={isArabic ? 'دروس منشورة' : 'Cours Publiés'}
              value={stats.publishedCourses}
              color="green"
            />
            <StatCard
              icon={<UsersIcon className="w-8 h-8" />}
              title={isArabic ? 'الطلاب' : 'Étudiants'}
              value={stats.totalStudents}
              color="purple"
            />
            <StatCard
              icon={<ChartBarIcon className="w-8 h-8" />}
              title={isArabic ? 'التسجيلات' : 'Inscriptions'}
              value={stats.totalEnrollments}
              color="orange"
            />
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition ${
                  activeTab === 'courses'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600'
                }`}
              >
                <BookOpenIcon className="w-5 h-5 inline-block mr-2" />
                {isArabic ? 'دروسي' : 'Mes Cours'}
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition ${
                  activeTab === 'students'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600'
                }`}
              >
                <UsersIcon className="w-5 h-5 inline-block mr-2" />
                {isArabic ? 'الطلاب' : 'Étudiants'}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={isArabic ? 'بحث عن درس...' : 'Rechercher un cours...'}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">{isArabic ? 'كل الفئات' : 'Toutes catégories'}</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{isArabic ? cat.ar : cat.fr}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">{isArabic ? 'كل الحالات' : 'Tous statuts'}</option>
                    <option value="published">{isArabic ? 'منشور' : 'Publié'}</option>
                    <option value="draft">{isArabic ? 'مسودة' : 'Brouillon'}</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedCourses.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                      {selectedCourses.length} {isArabic ? 'درس محدد' : 'cours sélectionné(s)'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBulkAction('publish')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        {isArabic ? 'نشر' : 'Publier'}
                      </button>
                      <button
                        onClick={() => handleBulkAction('unpublish')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        {isArabic ? 'إلغاء النشر' : 'Dépublier'}
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        {isArabic ? 'حذف' : 'Supprimer'}
                      </button>
                      <button
                        onClick={() => setSelectedCourses([])}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition"
                      >
                        {isArabic ? 'إلغاء' : 'Annuler'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    {isArabic ? 'جاري التحميل...' : 'Chargement...'}
                  </p>
                </div>
              ) : filteredCourses.length === 0 && courses.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                  <FolderIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {isArabic ? 'لا توجد نتائج' : 'Aucun résultat'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'جرب معايير بحث مختلفة' : 'Essayez différents critères de recherche'}
                  </p>
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                  <FolderIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {isArabic ? 'لا توجد دروس بعد' : 'Aucun cours encore'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {isArabic ? 'ابدأ بإنشاء أول درس لك' : 'Commencez par créer votre premier cours'}
                  </p>
                  <button
                    onClick={() => setShowCourseModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    {isArabic ? 'إنشاء درس' : 'Créer un cours'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  {filteredCourses.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {isArabic ? 'تحديد الكل' : 'Sélectionner tout'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isArabic={isArabic}
                        isSelected={selectedCourses.includes(course.id)}
                        onSelect={toggleCourseSelection}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTogglePublish={togglePublished}
                        onDuplicate={handleDuplicate}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'قائمة الطلاب' : 'Liste des Étudiants'}
              </h3>
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'لا يوجد طلاب مسجلون بعد' : 'Aucun étudiant inscrit pour le moment'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'الاسم' : 'Nom'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'البريد الإلكتروني' : 'Email'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'تاريخ التسجيل' : 'Date d\'inscription'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {student.fullName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {student.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <CourseModal
          courseForm={courseForm}
          setCourseForm={setCourseForm}
          editingCourse={editingCourse}
          isArabic={isArabic}
          loading={loading}
          categories={CATEGORIES}
          levels={LEVELS}
          newTag={newTag}
          setNewTag={setNewTag}
          onFilesUploaded={handleFilesUploaded}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-xl p-6 shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, isArabic, isSelected, onSelect, onEdit, onDelete, onTogglePublish, onDuplicate }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition ${
      isSelected 
        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {course.thumbnail && (
        <img 
          src={course.thumbnail} 
          alt={isArabic ? course.titleAr : course.titleFr}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(course.id)}
            className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {isArabic ? course.titleAr : course.titleFr}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {isArabic ? course.descriptionAr : course.descriptionFr}
            </p>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            course.published 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {course.published 
              ? (isArabic ? 'منشور' : 'Publié')
              : (isArabic ? 'مسودة' : 'Brouillon')
            }
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
            {course.category}
          </span>
          <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded">
            {course.level}
          </span>
          {course.duration && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {course.duration}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <UsersIcon className="w-4 h-4" />
          <span>{course.enrollmentCount || 0} {isArabic ? 'طالب' : 'étudiants'}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(course)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            {isArabic ? 'تعديل' : 'Modifier'}
          </button>
          <button
            onClick={() => onTogglePublish(course)}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition"
          >
            {course.published 
              ? (isArabic ? 'إخفاء' : 'Masquer')
              : (isArabic ? 'نشر' : 'Publier')
            }
          </button>
          <button
            onClick={() => onDuplicate(course)}
            className="bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-2 rounded-lg transition"
            title={isArabic ? 'تكرار' : 'Dupliquer'}
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(course.id)}
            className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 p-2 rounded-lg transition"
            title={isArabic ? 'حذف' : 'Supprimer'}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Course Modal Component
function CourseModal({ 
  courseForm, 
  setCourseForm, 
  editingCourse, 
  isArabic, 
  loading,
  categories,
  levels,
  newTag,
  setNewTag,
  onFilesUploaded,
  onAddTag,
  onRemoveTag,
  onSubmit,
  onClose
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingCourse 
              ? (isArabic ? 'تعديل الدرس' : 'Modifier le Cours')
              : (isArabic ? 'درس جديد' : 'Nouveau Cours')
            }
          </h2>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Title French */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
            </label>
            <input
              type="text"
              value={courseForm.titleFr}
              onChange={(e) => setCourseForm({ ...courseForm, titleFr: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ex: Introduction aux Mathématiques"
            />
          </div>

          {/* Title Arabic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
            </label>
            <input
              type="text"
              value={courseForm.titleAr}
              onChange={(e) => setCourseForm({ ...courseForm, titleAr: e.target.value })}
              required
              dir="rtl"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="مثال: مقدمة في الرياضيات"
            />
          </div>

          {/* Description French */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
            </label>
            <textarea
              value={courseForm.descriptionFr}
              onChange={(e) => setCourseForm({ ...courseForm, descriptionFr: e.target.value })}
              required
              rows="3"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Description du cours..."
            />
          </div>

          {/* Description Arabic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
            </label>
            <textarea
              value={courseForm.descriptionAr}
              onChange={(e) => setCourseForm({ ...courseForm, descriptionAr: e.target.value })}
              required
              rows="3"
              dir="rtl"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="وصف الدرس..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الفئة' : 'Catégorie'}
              </label>
              <select
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {isArabic ? cat.ar : cat.fr}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المستوى' : 'Niveau'}
              </label>
              <select
                value={courseForm.level}
                onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {isArabic ? level.ar : level.fr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'المدة' : 'Durée'} ({isArabic ? 'اختياري' : 'optionnel'})
            </label>
            <input
              type="text"
              value={courseForm.duration}
              onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={isArabic ? "مثال: 2 ساعات" : "Ex: 2 heures"}
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'رابط الصورة المصغرة' : 'URL de l\'image de couverture'} ({isArabic ? 'اختياري' : 'optionnel'})
            </label>
            <input
              type="url"
              value={courseForm.thumbnail}
              onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'رابط الفيديو (YouTube/Vimeo)' : 'URL Vidéo (YouTube/Vimeo)'}
            </label>
            <input
              type="url"
              value={courseForm.videoUrl}
              onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الملفات (PDF، صور، إلخ)' : 'Fichiers (PDF, images, etc.)'}
            </label>
            <FileUpload onFilesUploaded={onFilesUploaded} existingFiles={courseForm.files} />
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
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={isArabic ? "أضف وسماً..." : "Ajouter un tag..."}
              />
              <button
                type="button"
                onClick={onAddTag}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {isArabic ? 'إضافة' : 'Ajouter'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {courseForm.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <input
              type="checkbox"
              id="published"
              checked={courseForm.published}
              onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'نشر الدرس (جعله مرئياً للطلاب)' : 'Publier le cours (le rendre visible aux étudiants)'}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading 
                ? (isArabic ? 'جاري الحفظ...' : 'Enregistrement...')
                : editingCourse
                  ? (isArabic ? 'تحديث' : 'Mettre à jour')
                  : (isArabic ? 'إنشاء' : 'Créer')
              }
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
