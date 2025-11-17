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
  XMarkIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUpload from '../components/FileUpload';
import Sidebar from '../components/Sidebar';
import CourseStats from '../components/CourseStats';
import QuizResults from '../components/QuizResults';
import ExerciseSubmissions from '../components/ExerciseSubmissions';
import ImageUploadField from '../components/ImageUploadField';
import { uploadImage } from '../utils/fileUpload';

// Category and Level constants removed - using subject from teacher profile instead

export default function TeacherDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  
  // State
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]); // Available classes from Firestore
  const [quizzes, setQuizzes] = useState([]); // NEW: Quizzes
  const [exercises, setExercises] = useState([]); // NEW: Exercises
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false); // NEW
  const [showExerciseModal, setShowExerciseModal] = useState(false); // NEW
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null); // NEW
  const [editingExercise, setEditingExercise] = useState(null); // NEW
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'students', 'quizzes', 'exercises'
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClass, setFilterClass] = useState('all'); // NEW: Filter students by class
  
  // NEW: Stats modals
  const [showCourseStats, setShowCourseStats] = useState(null);
  const [showQuizResults, setShowQuizResults] = useState(null);
  const [showExerciseSubmissions, setShowExerciseSubmissions] = useState(null);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [courseForm, setCourseForm] = useState({
    titleFr: '',
    titleAr: '',
    descriptionFr: '',
    descriptionAr: '',
    duration: '',
    files: [],
    videoUrl: '',
    thumbnail: '',
    published: false,
    tags: [],
    targetClasses: [], // Array of class codes that this course is for
    subject: '', // Auto-filled from teacher's profile (replaces category)
    subjectNameFr: '', // Auto-filled from teacher's profile
    subjectNameAr: '' // Auto-filled from teacher's profile
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchStudents();
    fetchClasses();
    fetchQuizzes();
    fetchExercises();
    
    // Auto-fill subject from teacher's profile
    if (userProfile?.subject) {
      setCourseForm(prev => ({
        ...prev,
        subject: userProfile.subject || '',
        subjectNameFr: userProfile.subjectNameFr || '',
        subjectNameAr: userProfile.subjectNameAr || ''
      }));
    }
  }, [userProfile]);

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

  const fetchClasses = async () => {
    try {
      const classesQuery = query(
        collection(db, 'classes'),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(classesQuery);
      const classesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Only show enabled classes
      setClasses(classesData.filter(c => c.enabled !== false));
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Try without orderBy if index doesn't exist
      try {
        const simpleQuery = collection(db, 'classes');
        const snapshot = await getDocs(simpleQuery);
        const classesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClasses(classesData.filter(c => c.enabled !== false));
      } catch (finalError) {
        console.error('Final error fetching classes:', finalError);
        setClasses([]);
      }
    }
  };

  const fetchQuizzes = async () => {
    try {
      const quizzesQuery = query(
        collection(db, 'quizzes'),
        where('createdBy', '==', userProfile?.fullName || currentUser?.email),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(quizzesQuery);
      const quizzesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // Fallback without index
      try {
        const simpleQuery = collection(db, 'quizzes');
        const snapshot = await getDocs(simpleQuery);
        const quizzesData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(quiz => quiz.createdBy === (userProfile?.fullName || currentUser?.email))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setQuizzes(quizzesData);
      } catch (finalError) {
        console.error('Final error fetching quizzes:', finalError);
        setQuizzes([]);
      }
    }
  };

  const fetchExercises = async () => {
    try {
      const exercisesQuery = query(
        collection(db, 'exercises'),
        where('createdBy', '==', userProfile?.fullName || currentUser?.email),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(exercisesQuery);
      const exercisesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // Fallback without index
      try {
        const simpleQuery = collection(db, 'exercises');
        const snapshot = await getDocs(simpleQuery);
        const exercisesData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(exercise => exercise.createdBy === (userProfile?.fullName || currentUser?.email))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setExercises(exercisesData);
      } catch (finalError) {
        console.error('Final error fetching exercises:', finalError);
        setExercises([]);
      }
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
      duration: course.duration || '',
      files: course.files || [],
      videoUrl: course.videoUrl || '',
      thumbnail: course.thumbnail || '',
      published: course.published || false,
      tags: course.tags || [],
      targetClasses: course.targetClasses || [],
      subject: course.subject || userProfile?.subject || '',
      subjectNameFr: course.subjectNameFr || userProfile?.subjectNameFr || '',
      subjectNameAr: course.subjectNameAr || userProfile?.subjectNameAr || ''
    });
    setShowCourseModal(true);
  };

  const handleDelete = async (courseId) => {
    try {
      // NEW: Check if course has linked quizzes or exercises
      const linkedQuizzesQuery = query(
        collection(db, 'quizzes'),
        where('courseId', '==', courseId)
      );
      const linkedExercisesQuery = query(
        collection(db, 'exercises'),
        where('courseId', '==', courseId)
      );

      const [quizzesSnapshot, exercisesSnapshot] = await Promise.all([
        getDocs(linkedQuizzesQuery),
        getDocs(linkedExercisesQuery)
      ]);

      const quizCount = quizzesSnapshot.size;
      const exerciseCount = exercisesSnapshot.size;

      if (quizCount > 0 || exerciseCount > 0) {
        const message = isArabic
          ? `لا يمكن حذف هذا الدرس! يحتوي على:\n- ${quizCount} اختبار(ات)\n- ${exerciseCount} تمرين/تمارين\n\nاحذف الاختبارات والتمارين أولاً.`
          : `Impossible de supprimer ce cours! Il contient:\n- ${quizCount} quiz\n- ${exerciseCount} exercice(s)\n\nSupprimez d'abord les quiz et exercices.`;
        
        alert(message);
        toast.error(isArabic ? 'الدرس مرتبط بمحتوى' : 'Le cours est lié à du contenu');
        return;
      }

      // If no linked content, proceed with deletion
      if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الدرس؟' : 'Êtes-vous sûr de vouloir supprimer ce cours?')) {
        await deleteDoc(doc(db, 'courses', courseId));
        toast.success(isArabic ? 'تم حذف الدرس بنجاح' : 'Cours supprimé avec succès');
        fetchCourses();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(isArabic ? 'خطأ في حذف الدرس' : 'Erreur lors de la suppression');
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
    // Category filter removed - using subject from teacher profile
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && course.published) ||
      (filterStatus === 'draft' && !course.published);
    return matchesSearch && matchesStatus;
  });

  const closeModal = () => {
    setShowCourseModal(false);
    setEditingCourse(null);
    setCourseForm({
      titleFr: '',
      titleAr: '',
      descriptionFr: '',
      descriptionAr: '',
      duration: '',
      files: [],
      videoUrl: '',
      thumbnail: '',
      published: false,
      tags: [],
      targetClasses: [],
      subject: userProfile?.subject || '',
      subjectNameFr: userProfile?.subjectNameFr || '',
      subjectNameAr: userProfile?.subjectNameAr || ''
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
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
                  activeTab === 'courses'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600'
                }`}
              >
                <BookOpenIcon className="w-5 h-5 inline-block mr-2" />
                {isArabic ? 'دروسي' : 'Mes Cours'}
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
                  activeTab === 'quizzes'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600'
                }`}
              >
                <ClipboardDocumentCheckIcon className="w-5 h-5 inline-block mr-2" />
                {isArabic ? 'الاختبارات' : 'Quiz'}
              </button>
              <button
                onClick={() => setActiveTab('exercises')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
                  activeTab === 'exercises'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600'
                }`}
              >
                <DocumentIcon className="w-5 h-5 inline-block mr-2" />
                {isArabic ? 'التمارين' : 'Exercices'}
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition whitespace-nowrap ${
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
                        onShowStats={(course) => setShowCourseStats(course.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isArabic ? 'اختباراتي' : 'Mes Quiz'}
                </h3>
                <button
                  onClick={() => {
                    setEditingQuiz(null);
                    setShowQuizModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <PlusIcon className="w-5 h-5" />
                  {isArabic ? 'إضافة اختبار' : 'Ajouter Quiz'}
                </button>
              </div>

              {quizzes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                  <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'لا توجد اختبارات بعد' : 'Aucun quiz pour le moment'}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {isArabic ? quiz.titleAr : quiz.titleFr}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          quiz.published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {quiz.published ? (isArabic ? 'منشور' : 'Publié') : (isArabic ? 'مسودة' : 'Brouillon')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {quiz.questions?.length || 0} {isArabic ? 'سؤال' : 'questions'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingQuiz(quiz);
                            setShowQuizModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          <PencilIcon className="w-4 h-4 inline mr-1" />
                          {isArabic ? 'تعديل' : 'Modifier'}
                        </button>
                        <button
                          onClick={() => setShowQuizResults(quiz)}
                          className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                          title={isArabic ? 'النتائج' : 'Résultats'}
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(isArabic ? 'هل تريد حذف هذا الاختبار؟' : 'Supprimer ce quiz?')) {
                              try {
                                await deleteDoc(doc(db, 'quizzes', quiz.id));
                                toast.success(isArabic ? 'تم الحذف بنجاح' : 'Supprimé avec succès');
                                fetchQuizzes();
                              } catch (error) {
                                console.error('Error deleting quiz:', error);
                                toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
                              }
                            }
                          }}
                          className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
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

          {/* EXERCISES TAB */}
          {activeTab === 'exercises' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isArabic ? 'تماريني' : 'Mes Exercices'}
                </h3>
                <button
                  onClick={() => {
                    setEditingExercise(null);
                    setShowExerciseModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <PlusIcon className="w-5 h-5" />
                  {isArabic ? 'إضافة تمرين' : 'Ajouter Exercice'}
                </button>
              </div>

              {exercises.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                  <DocumentIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'لا توجد تمارين بعد' : 'Aucun exercice pour le moment'}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {isArabic ? exercise.titleAr : exercise.titleFr}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exercise.published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {exercise.published ? (isArabic ? 'منشور' : 'Publié') : (isArabic ? 'مسودة' : 'Brouillon')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {exercise.questions?.length || 0} {isArabic ? 'سؤال' : 'questions'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingExercise(exercise);
                            setShowExerciseModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          <PencilIcon className="w-4 h-4 inline mr-1" />
                          {isArabic ? 'تعديل' : 'Modifier'}
                        </button>
                        <button
                          onClick={() => setShowExerciseSubmissions(exercise)}
                          className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                          title={isArabic ? 'الإجابات' : 'Soumissions'}
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(isArabic ? 'هل تريد حذف هذا التمرين؟' : 'Supprimer cet exercice?')) {
                              try {
                                await deleteDoc(doc(db, 'exercises', exercise.id));
                                toast.success(isArabic ? 'تم الحذف بنجاح' : 'Supprimé avec succès');
                                fetchExercises();
                              } catch (error) {
                                console.error('Error deleting exercise:', error);
                                toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
                              }
                            }
                          }}
                          className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
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

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isArabic ? 'قائمة الطلاب' : 'Liste des Étudiants'}
                </h3>
                
                {/* Class Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isArabic ? 'الفصل:' : 'Classe:'}
                  </label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{isArabic ? 'جميع الفصول' : 'Toutes les classes'}</option>
                    {classes.map(cls => (
                      <option key={cls.code} value={cls.code}>
                        {isArabic ? cls.nameAr : cls.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
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
                          {isArabic ? 'الفصل' : 'Classe'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'تاريخ التسجيل' : 'Date d\'inscription'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {students
                        .filter(student => {
                          // Filter by selected class
                          if (filterClass === 'all') return true;
                          return student.class === filterClass;
                        })
                        .map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {student.fullName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {student.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {isArabic ? student.classNameAr : student.classNameFr || student.class || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Show filtered count */}
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                    {filterClass === 'all' 
                      ? `${students.length} ${isArabic ? 'طالب' : 'étudiant(s)'}`
                      : `${students.filter(s => s.class === filterClass).length} ${isArabic ? 'طالب في هذا الفصل' : 'étudiant(s) dans cette classe'}`
                    }
                  </div>
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
          classes={classes}
          newTag={newTag}
          setNewTag={setNewTag}
          onFilesUploaded={handleFilesUploaded}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModal
          quiz={editingQuiz}
          courses={courses}
          classes={classes}
          isArabic={isArabic}
          currentUser={currentUser}
          userProfile={userProfile}
          onClose={() => {
            setShowQuizModal(false);
            setEditingQuiz(null);
          }}
          onSuccess={() => {
            setShowQuizModal(false);
            setEditingQuiz(null);
            fetchQuizzes();
          }}
        />
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <ExerciseModal
          exercise={editingExercise}
          courses={courses}
          classes={classes}
          isArabic={isArabic}
          currentUser={currentUser}
          userProfile={userProfile}
          onClose={() => {
            setShowExerciseModal(false);
            setEditingExercise(null);
          }}
          onSuccess={() => {
            setShowExerciseModal(false);
            setEditingExercise(null);
            fetchExercises();
          }}
        />
      )}

      {/* Stats Modals */}
      {showCourseStats && (
        <CourseStats 
          courseId={showCourseStats}
          isArabic={isArabic}
          onClose={() => setShowCourseStats(null)}
        />
      )}
      
      {showQuizResults && (
        <QuizResults
          quiz={showQuizResults}
          isArabic={isArabic}
          onClose={() => setShowQuizResults(null)}
        />
      )}
      
      {showExerciseSubmissions && (
        <ExerciseSubmissions
          exercise={showExerciseSubmissions}
          isArabic={isArabic}
          onClose={() => setShowExerciseSubmissions(null)}
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
function CourseCard({ course, isArabic, isSelected, onSelect, onEdit, onDelete, onTogglePublish, onDuplicate, onShowStats }) {
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
          {(course.subjectNameFr || course.subjectNameAr) && (
            <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded font-medium">
              {isArabic ? course.subjectNameAr : course.subjectNameFr}
            </span>
          )}
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
            onClick={() => onShowStats(course)}
            className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-2 rounded-lg transition"
            title={isArabic ? 'إحصائيات' : 'Statistiques'}
          >
            <ChartBarIcon className="w-5 h-5" />
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
  classes,
  newTag,
  setNewTag,
  onFilesUploaded,
  onAddTag,
  onRemoveTag,
  onSubmit,
  onClose
}) {
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  
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

          {/* Subject (Read-only - from teacher profile) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'المادة (تلقائي من ملفك الشخصي)' : 'Matière (automatique depuis votre profil)'}
            </label>
            <input
              type="text"
              value={isArabic ? courseForm.subjectNameAr : courseForm.subjectNameFr}
              readOnly
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              placeholder={isArabic ? 'لم يتم تحديد مادة في ملفك' : 'Aucune matière définie dans votre profil'}
            />
            {!courseForm.subject && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {isArabic 
                  ? '⚠️ لم يتم تعيين مادة لك. اتصل بالمسؤول لتعيين مادتك.'
                  : '⚠️ Aucune matière n\'est assignée à votre compte. Contactez l\'administrateur pour assigner votre matière.'
                }
              </p>
            )}
          </div>

          {/* Target Classes (Multi-select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الفصول المستهدفة' : 'Classes concernées'} *
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
              {classes.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isArabic ? 'لا توجد فصول متاحة' : 'Aucune classe disponible'}
                </p>
              ) : (
                classes.map((classItem) => (
                  <label
                    key={classItem.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={courseForm.targetClasses.includes(classItem.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCourseForm({
                            ...courseForm,
                            targetClasses: [...courseForm.targetClasses, classItem.code]
                          });
                        } else {
                          setCourseForm({
                            ...courseForm,
                            targetClasses: courseForm.targetClasses.filter(c => c !== classItem.code)
                          });
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {isArabic ? classItem.nameAr : classItem.nameFr}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({classItem.code})
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isArabic 
                ? `محدد: ${courseForm.targetClasses.length} فصل(فصول)`
                : `Sélectionné : ${courseForm.targetClasses.length} classe(s)`
              }
            </p>
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
          <ImageUploadField
            label={`${isArabic ? 'صورة الغلاف' : 'Image de couverture'} (${isArabic ? 'اختياري' : 'optionnel'})`}
            value={courseForm.thumbnail}
            onChange={async (file) => {
              if (file) {
                setUploadingThumbnail(true);
                try {
                  const url = await uploadImage(file, 'courses', courseForm.thumbnail);
                  setCourseForm({ ...courseForm, thumbnail: url });
                  toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image téléchargée avec succès');
                } catch (error) {
                  console.error('Error uploading thumbnail:', error);
                  toast.error(isArabic ? 'فشل رفع الصورة' : 'Échec du téléchargement');
                } finally {
                  setUploadingThumbnail(false);
                }
              }
            }}
            folder="courses"
            disabled={uploadingThumbnail}
            required={false}
          />

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

// Quiz Modal Component

// Quiz Modal Component - Updated with correct question types
function QuizModal({ quiz, courses, classes, isArabic, currentUser, userProfile, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    titleFr: quiz?.titleFr || '',
    titleAr: quiz?.titleAr || '',
    descriptionFr: quiz?.descriptionFr || '',
    descriptionAr: quiz?.descriptionAr || '',
    courseId: quiz?.courseId || '',
    targetClasses: quiz?.targetClasses || [],
    duration: quiz?.duration || 30,
    timeLimit: quiz?.timeLimit || 30,
    passingScore: quiz?.passingScore || 50,
    published: quiz?.published || false,
    questions: quiz?.questions || []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'qcu', // 'qcm', 'qcu', 'true-false', 'fill-blank'
    options: ['', '', '', ''],
    correctAnswer: null, // For QCU and True/False
    correctAnswers: [], // For QCM (multiple correct)
    points: 1,
    // For fill-blank
    questionWithBlanks: '',
    correctAnswerText: '',
    selectedWordIndices: [],
    wordSuggestions: [],
    distractorWords: [] // NEW: Trick/distractor words
  });

  const [distractorInput, setDistractorInput] = useState(''); // NEW: Input for adding distractor words

  const [loading, setLoading] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  // Helper function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAddOrUpdateQuestion = () => {
    // Validate question text for all types
    if (!currentQuestion.question || !currentQuestion.question.trim()) {
      toast.error(isArabic ? 'يرجى كتابة السؤال' : 'Veuillez écrire la question');
      return;
    }

    // Validation based on type
    if (currentQuestion.type === 'qcm') {
      const validOptions = currentQuestion.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast.error(isArabic ? 'يجب إضافة خيارين على الأقل' : 'Ajoutez au moins 2 options');
        return;
      }
      if (currentQuestion.correctAnswers.length === 0) {
        toast.error(isArabic ? 'اختر إجابة صحيحة واحدة على الأقل' : 'Sélectionnez au moins une bonne réponse');
        return;
      }
    } else if (currentQuestion.type === 'qcu') {
      const validOptions = currentQuestion.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast.error(isArabic ? 'يجب إضافة خيارين على الأقل' : 'Ajoutez au moins 2 options');
        return;
      }
      if (currentQuestion.correctAnswer === null) {
        toast.error(isArabic ? 'اختر الإجابة الصحيحة' : 'Sélectionnez la bonne réponse');
        return;
      }
    } else if (currentQuestion.type === 'true-false') {
      if (currentQuestion.correctAnswer === null) {
        toast.error(isArabic ? 'اختر الإجابة الصحيحة' : 'Sélectionnez la bonne réponse');
        return;
      }
    } else if (currentQuestion.type === 'fill-blank') {
      if (!currentQuestion.correctAnswerText || !currentQuestion.questionWithBlanks) {
        toast.error(isArabic ? 'أكمل بيانات السؤال' : 'Complétez les données de la question');
        return;
      }
    }

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...formData.questions];
      updatedQuestions[editingQuestionIndex] = { ...currentQuestion };
      setFormData({ ...formData, questions: updatedQuestions });
      toast.success(isArabic ? 'تم تحديث السؤال' : 'Question mise à jour');
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      setFormData({
        ...formData,
        questions: [...formData.questions, { ...currentQuestion }]
      });
      toast.success(isArabic ? 'تمت إضافة السؤال' : 'Question ajoutée');
    }

    // Reset form
    resetQuestionForm();
    setShowQuestionForm(false);
  };

  const resetQuestionForm = () => {
    setCurrentQuestion({
      question: '',
      type: 'qcu',
      options: ['', '', '', ''],
      correctAnswer: null,
      correctAnswers: [],
      points: 1,
      questionWithBlanks: '',
      correctAnswerText: '',
      selectedWordIndices: [],
      wordSuggestions: [],
      distractorWords: []
    });
    setDistractorInput('');
  };

  const handleRemoveQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion({ ...formData.questions[index] });
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  };

  // NEW: Toggle word selection for fill-blank
  const toggleWordSelection = (wordIndex) => {
    const selectedIndices = [...currentQuestion.selectedWordIndices];
    const index = selectedIndices.indexOf(wordIndex);
    
    if (index > -1) {
      // Remove from selection
      selectedIndices.splice(index, 1);
    } else {
      // Add to selection
      selectedIndices.push(wordIndex);
    }
    
    selectedIndices.sort((a, b) => a - b);
    
    // Update question with blanks
    const words = currentQuestion.correctAnswerText.split(' ');
    const sentenceWithBlanks = words.map((word, idx) => 
      selectedIndices.includes(idx) ? '_____' : word
    ).join(' ');
    
    // Update word suggestions (correct words + distractors) - SHUFFLED
    const correctWords = selectedIndices.map(i => words[i]);
    const wordSuggestions = shuffleArray([...correctWords, ...currentQuestion.distractorWords]);
    
    setCurrentQuestion({
      ...currentQuestion,
      selectedWordIndices: selectedIndices,
      questionWithBlanks: sentenceWithBlanks,
      wordSuggestions: wordSuggestions
    });
  };

  // NEW: Add distractor word
  const addDistractorWord = () => {
    const word = distractorInput.trim();
    if (!word) {
      toast.error(isArabic ? 'اكتب كلمة أولاً' : 'Écrivez un mot d\'abord');
      return;
    }
    
    if (currentQuestion.distractorWords.includes(word)) {
      toast.error(isArabic ? 'هذه الكلمة موجودة بالفعل' : 'Ce mot existe déjà');
      return;
    }
    
    const updatedDistractors = [...currentQuestion.distractorWords, word];
    
    // Update word suggestions with new distractor - SHUFFLED
    const words = currentQuestion.correctAnswerText.split(' ');
    const correctWords = currentQuestion.selectedWordIndices.map(i => words[i]);
    const wordSuggestions = shuffleArray([...correctWords, ...updatedDistractors]);
    
    setCurrentQuestion({
      ...currentQuestion,
      distractorWords: updatedDistractors,
      wordSuggestions: wordSuggestions
    });
    
    setDistractorInput('');
    toast.success(isArabic ? 'تمت إضافة الكلمة' : 'Mot ajouté');
  };

  // NEW: Remove distractor word
  const removeDistractorWord = (word) => {
    const updatedDistractors = currentQuestion.distractorWords.filter(w => w !== word);
    
    // Update word suggestions - SHUFFLED
    const words = currentQuestion.correctAnswerText.split(' ');
    const correctWords = currentQuestion.selectedWordIndices.map(i => words[i]);
    const wordSuggestions = shuffleArray([...correctWords, ...updatedDistractors]);
    
    setCurrentQuestion({
      ...currentQuestion,
      distractorWords: updatedDistractors,
      wordSuggestions: wordSuggestions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NEW: Course is REQUIRED
    if (!formData.courseId) {
      toast.error(isArabic ? 'يجب اختيار درس' : 'Vous devez sélectionner un cours');
      return;
    }

    if (formData.questions.length === 0) {
      toast.error(isArabic ? 'يجب إضافة سؤال واحد على الأقل' : 'Ajoutez au moins une question');
      return;
    }

    try {
      setLoading(true);

      const quizData = {
        ...formData,
        updatedAt: new Date().toISOString(),
        createdBy: userProfile?.fullName || currentUser?.email,
        teacherId: currentUser?.uid
      };

      if (quiz) {
        await updateDoc(doc(db, 'quizzes', quiz.id), quizData);
        toast.success(isArabic ? 'تم تحديث الاختبار' : 'Quiz mis à jour');
      } else {
        quizData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'quizzes'), quizData);
        toast.success(isArabic ? 'تم إنشاء الاختبار' : 'Quiz créé');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur d\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl my-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {quiz ? (isArabic ? 'تعديل الاختبار' : 'Modifier le Quiz') : (isArabic ? 'إنشاء اختبار جديد' : 'Créer un Quiz')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
              </label>
              <input
                type="text"
                value={formData.titleFr}
                onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
                dir="rtl"
              />
            </div>
          </div>

          {/* Course and Duration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الدرس *' : 'Cours *'}
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">{isArabic ? 'اختر درساً' : 'Sélectionnez un cours'}</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {isArabic ? course.titleAr : course.titleFr}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isArabic ? 'إلزامي: يجب ربط الاختبار بدرس' : 'Obligatoire: le quiz doit être lié à un cours'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المدة (دقائق)' : 'Durée (minutes)'}
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value), timeLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                min="1"
                required
              />
            </div>
          </div>

          {/* Target Classes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الفصول المستهدفة' : 'Classes Cibles'}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {classes.map(cls => (
                <label key={cls.code} className="flex items-center gap-2 p-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.targetClasses.includes(cls.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, targetClasses: [...formData.targetClasses, cls.code] });
                      } else {
                        setFormData({ ...formData, targetClasses: formData.targetClasses.filter(c => c !== cls.code) });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-xs">{isArabic ? cls.nameAr : cls.nameFr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{isArabic ? 'الأسئلة' : 'Questions'} ({formData.questions.length})</h3>
              <button
                type="button"
                onClick={() => {
                  resetQuestionForm();
                  setEditingQuestionIndex(null);
                  setShowQuestionForm(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <PlusIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'إضافة سؤال' : 'Ajouter Question'}
              </button>
            </div>

            {/* Questions Preview */}
            <div className="space-y-2 mb-4">
              {formData.questions.map((q, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{index + 1}. {q.question || (q.type === 'fill-blank' ? q.questionWithBlanks : '')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {q.type === 'qcm' ? (isArabic ? 'اختيار متعدد' : 'Choix Multiple') :
                         q.type === 'qcu' ? (isArabic ? 'اختيار واحد' : 'Choix Unique') :
                         q.type === 'true-false' ? (isArabic ? 'صح/خطأ' : 'Vrai/Faux') :
                         (isArabic ? 'ملء فراغ' : 'Remplir')}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{q.points || 1} pts</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditQuestion(index)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Question Form */}
            {showQuestionForm && (
              <div className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/10">
                <h4 className="font-semibold mb-3">
                  {editingQuestionIndex !== null 
                    ? (isArabic ? 'تعديل السؤال' : 'Modifier la Question')
                    : (isArabic ? 'سؤال جديد' : 'Nouvelle Question')}
                </h4>
                
                <div className="space-y-3">
                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{isArabic ? 'نوع السؤال' : 'Type de Question'}</label>
                    <select
                      value={currentQuestion.type}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value, options: ['', '', '', ''], correctAnswer: null, correctAnswers: [] })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="qcu">{isArabic ? 'اختيار واحد (QCU)' : 'Choix Unique (QCU)'}</option>
                      <option value="qcm">{isArabic ? 'اختيار متعدد (QCM)' : 'Choix Multiple (QCM)'}</option>
                      <option value="true-false">{isArabic ? 'صح/خطأ' : 'Vrai/Faux'}</option>
                      <option value="fill-blank">{isArabic ? 'ملء الفراغات' : 'Remplir les Blancs'}</option>
                    </select>
                  </div>

                  {/* Question Text (for QCU, QCM, True/False) */}
                  {currentQuestion.type !== 'fill-blank' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">{isArabic ? 'نص السؤال' : 'Texte de la Question'}</label>
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        rows="2"
                        placeholder={isArabic ? 'اكتب السؤال...' : 'Écrivez la question...'}
                      />
                    </div>
                  )}

                  {/* Options for QCU and QCM */}
                  {(currentQuestion.type === 'qcu' || currentQuestion.type === 'qcm') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">{isArabic ? 'الخيارات' : 'Options'}</label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            {currentQuestion.type === 'qcm' ? (
                              <input
                                type="checkbox"
                                checked={currentQuestion.correctAnswers.includes(i)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCurrentQuestion({ ...currentQuestion, correctAnswers: [...currentQuestion.correctAnswers, i] });
                                  } else {
                                    setCurrentQuestion({ ...currentQuestion, correctAnswers: currentQuestion.correctAnswers.filter(idx => idx !== i) });
                                  }
                                }}
                                className="w-5 h-5"
                              />
                            ) : (
                              <input
                                type="radio"
                                name="correct"
                                checked={currentQuestion.correctAnswer === i}
                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: i })}
                                className="w-5 h-5"
                              />
                            )}
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[i] = e.target.value;
                                setCurrentQuestion({ ...currentQuestion, options: newOptions });
                              }}
                              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              placeholder={`${isArabic ? 'الخيار' : 'Option'} ${i + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        {currentQuestion.type === 'qcm' 
                          ? (isArabic ? 'اختر الإجابات الصحيحة (يمكن أكثر من واحدة)' : 'Cochez les bonnes réponses (plusieurs possibles)')
                          : (isArabic ? 'اختر الإجابة الصحيحة' : 'Cochez la bonne réponse')}
                      </p>
                    </div>
                  )}

                  {/* True/False */}
                  {currentQuestion.type === 'true-false' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">{isArabic ? 'الإجابة الصحيحة' : 'Bonne Réponse'}</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tf-correct"
                            checked={currentQuestion.correctAnswer === 1}
                            onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 1 })}
                            className="w-5 h-5"
                          />
                          <span>{isArabic ? 'صح' : 'Vrai'}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tf-correct"
                            checked={currentQuestion.correctAnswer === 0}
                            onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 0 })}
                            className="w-5 h-5"
                          />
                          <span>{isArabic ? 'خطأ' : 'Faux'}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Fill-Blank */}
                  {currentQuestion.type === 'fill-blank' && (
                    <div className="space-y-4">
                      {/* Question/Instruction */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {isArabic ? 'السؤال / التعليمات' : 'Question / Instructions'}
                        </label>
                        <textarea
                          value={currentQuestion.question}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          rows="2"
                          placeholder={isArabic ? 'مثال: أكمل الجملة التالية بالكلمات المناسبة' : 'Ex: Complétez la phrase suivante avec les mots appropriés'}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {isArabic 
                            ? '💡 هذا هو السؤال الذي سيراه الطالب قبل الجملة'
                            : '💡 C\'est la question que l\'étudiant verra avant la phrase'
                          }
                        </p>
                      </div>

                      {/* Step 1: Enter complete sentence */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {isArabic ? '١. الجملة الكاملة' : '1. Phrase Complète'}
                        </label>
                        <textarea
                          value={currentQuestion.correctAnswerText}
                          onChange={(e) => setCurrentQuestion({ 
                            ...currentQuestion, 
                            correctAnswerText: e.target.value,
                            selectedWordIndices: [],
                            questionWithBlanks: '',
                            wordSuggestions: []
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          rows="2"
                          placeholder={isArabic ? 'اكتب الجملة الكاملة...' : 'Écrivez la phrase complète...'}
                        />
                      </div>

                      {/* Step 2: Manual word selection */}
                      {currentQuestion.correctAnswerText.trim() && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {isArabic ? '٢. انقر على الكلمات لتصبح فراغات:' : '2. Cliquez sur les mots pour les sélectionner comme blancs:'}
                          </label>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-wrap gap-2">
                              {currentQuestion.correctAnswerText.split(' ').map((word, idx) => {
                                const isSelected = currentQuestion.selectedWordIndices.includes(idx);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleWordSelection(idx)}
                                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-500 hover:border-indigo-400 dark:hover:border-indigo-500'
                                    }`}
                                  >
                                    {word}
                                    {isSelected && (
                                      <span className="ml-2">✓</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {currentQuestion.selectedWordIndices.length > 0 && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                                {isArabic 
                                  ? `✓ تم اختيار ${currentQuestion.selectedWordIndices.length} كلمة`
                                  : `✓ ${currentQuestion.selectedWordIndices.length} mot(s) sélectionné(s)`
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Preview with blanks */}
                      {currentQuestion.questionWithBlanks && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                          <p className="text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
                            {isArabic ? '📝 معاينة مع الفراغات:' : '📝 Aperçu avec les blancs:'}
                          </p>
                          <p className="text-lg font-medium">{currentQuestion.questionWithBlanks}</p>
                        </div>
                      )}

                      {/* Step 3: Add distractor words */}
                      {currentQuestion.selectedWordIndices.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {isArabic ? '٣. كلمات التشتيت (اختياري)' : '3. Mots Pièges (Optionnel)'}
                          </label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={distractorInput}
                                onChange={(e) => setDistractorInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDistractorWord())}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder={isArabic ? 'أضف كلمة خاطئة...' : 'Ajouter un mot piège...'}
                              />
                              <button
                                type="button"
                                onClick={addDistractorWord}
                                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
                              >
                                <PlusIcon className="w-5 h-5 inline mr-1" />
                                {isArabic ? 'إضافة' : 'Ajouter'}
                              </button>
                            </div>
                            
                            {/* List of distractor words */}
                            {currentQuestion.distractorWords.length > 0 && (
                              <div className="flex flex-wrap gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                {currentQuestion.distractorWords.map((word, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium"
                                  >
                                    {word}
                                    <button
                                      type="button"
                                      onClick={() => removeDistractorWord(word)}
                                      className="hover:text-orange-900 dark:hover:text-orange-100"
                                    >
                                      <XMarkIcon className="w-4 h-4" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {isArabic 
                                ? '💡 الكلمات ستُعرض بترتيب عشوائي للطالب'
                                : '💡 Les mots seront mélangés aléatoirement pour l\'étudiant'
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Summary of word suggestions */}
                      {currentQuestion.wordSuggestions.length > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">
                            {isArabic ? '💡 الكلمات المتاحة للطالب (مُخلّطة):' : '💡 Mots disponibles pour l\'étudiant (mélangés):'}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {currentQuestion.wordSuggestions.map((word, idx) => {
                              const isDistractor = currentQuestion.distractorWords.includes(word);
                              return (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 rounded text-sm font-medium ${
                                    isDistractor
                                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  }`}
                                >
                                  {word}
                                  {isDistractor && ' ⚠️'}
                                </span>
                              );
                            })}
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            🔀 {isArabic 
                              ? 'الترتيب عشوائي - يتغير في كل محاولة'
                              : 'Ordre aléatoire - change à chaque tentative'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Points */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{isArabic ? 'النقاط' : 'Points'}</label>
                    <input
                      type="number"
                      value={currentQuestion.points}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleAddOrUpdateQuestion}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {editingQuestionIndex !== null 
                        ? (isArabic ? 'تحديث' : 'Mettre à Jour')
                        : (isArabic ? 'إضافة' : 'Ajouter')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuestionForm(false);
                        setEditingQuestionIndex(null);
                        resetQuestionForm();
                      }}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      {isArabic ? 'إلغاء' : 'Annuler'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Published Toggle */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm font-medium">{isArabic ? 'نشر الاختبار' : 'Publier le quiz'}</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Enregistrement...') : (quiz ? (isArabic ? 'تحديث' : 'Mettre à jour') : (isArabic ? 'إنشاء' : 'Créer'))}
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

// Exercise Modal Component - NEW: Text/File-based exercises
function ExerciseModal({ exercise, courses, classes, isArabic, currentUser, userProfile, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    titleFr: exercise?.titleFr || '',
    titleAr: exercise?.titleAr || '',
    descriptionFr: exercise?.descriptionFr || '',
    descriptionAr: exercise?.descriptionAr || '',
    courseId: exercise?.courseId || '', // Will be REQUIRED
    targetClasses: exercise?.targetClasses || [],
    published: exercise?.published || false,
    // NEW: Text or file-based content
    contentType: exercise?.contentType || 'text', // 'text' or 'file'
    textContent: exercise?.textContent || '',
    files: exercise?.files || []
  });

  const [loading, setLoading] = useState(false);

  const handleFilesUploaded = (uploadedFiles) => {
    setFormData({ ...formData, files: uploadedFiles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NEW: Course is REQUIRED
    if (!formData.courseId) {
      toast.error(isArabic ? 'يجب اختيار درس' : 'Vous devez sélectionner un cours');
      return;
    }

    // NEW: Validate content based on type
    if (formData.contentType === 'text' && !formData.textContent.trim()) {
      toast.error(isArabic ? 'يرجى كتابة محتوى التمرين' : 'Veuillez écrire le contenu de l\'exercice');
      return;
    }
    if (formData.contentType === 'file' && formData.files.length === 0) {
      toast.error(isArabic ? 'يرجى إضافة ملف واحد على الأقل' : 'Ajoutez au moins un fichier');
      return;
    }

    try {
      setLoading(true);

      const exerciseData = {
        ...formData,
        updatedAt: new Date().toISOString(),
        createdBy: userProfile?.fullName || currentUser?.email,
        teacherId: currentUser?.uid
      };

      if (exercise) {
        await updateDoc(doc(db, 'exercises', exercise.id), exerciseData);
        toast.success(isArabic ? 'تم تحديث التمرين' : 'Exercice mis à jour');
      } else {
        exerciseData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'exercises'), exerciseData);
        toast.success(isArabic ? 'تم إنشاء التمرين' : 'Exercice créé');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur d\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl my-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {exercise ? (isArabic ? 'تعديل التمرين' : 'Modifier l\'Exercice') : (isArabic ? 'إنشاء تمرين جديد' : 'Créer un Exercice')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
              </label>
              <input
                type="text"
                value={formData.titleFr}
                onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
                dir="rtl"
              />
            </div>
          </div>

          {/* Course - NOW REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الدرس *' : 'Cours *'}
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">{isArabic ? 'اختر درساً' : 'Sélectionnez un cours'}</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {isArabic ? course.titleAr : course.titleFr}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isArabic ? 'إلزامي: يجب ربط التمرين بدرس' : 'Obligatoire: l\'exercice doit être lié à un cours'}
            </p>
          </div>

          {/* Target Classes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الفصول المستهدفة' : 'Classes Cibles'}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {classes.map(cls => (
                <label key={cls.code} className="flex items-center gap-2 p-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.targetClasses.includes(cls.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, targetClasses: [...formData.targetClasses, cls.code] });
                      } else {
                        setFormData({ ...formData, targetClasses: formData.targetClasses.filter(c => c !== cls.code) });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-xs">{isArabic ? cls.nameAr : cls.nameFr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* NEW: Content Type Selection */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {isArabic ? 'نوع المحتوى' : 'Type de Contenu'}
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contentType"
                  value="text"
                  checked={formData.contentType === 'text'}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                  className="w-4 h-4"
                />
                <span>{isArabic ? 'نص' : 'Texte'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contentType"
                  value="file"
                  checked={formData.contentType === 'file'}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                  className="w-4 h-4"
                />
                <span>{isArabic ? 'ملفات' : 'Fichiers'}</span>
              </label>
            </div>

            {/* Text Content */}
            {formData.contentType === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'محتوى التمرين (الأسئلة)' : 'Contenu de l\'Exercice (Questions)'}
                </label>
                <textarea
                  value={formData.textContent}
                  onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                  rows="12"
                  placeholder={isArabic 
                    ? 'اكتب أسئلة التمرين هنا...\n\nمثال:\n1. ما هي عاصمة فرنسا؟\n2. أذكر ثلاثة أنواع من الحيوانات...\n3. اشرح مفهوم...' 
                    : 'Écrivez les questions de l\'exercice ici...\n\nExemple:\n1. Quelle est la capitale de la France?\n2. Nommez trois types d\'animaux...\n3. Expliquez le concept de...'
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {isArabic 
                    ? '💡 سيرى الطلاب هذا النص ويجيبون في نموذج'
                    : '💡 Les étudiants verront ce texte et répondront dans un formulaire'
                  }
                </p>
              </div>
            )}

            {/* File Upload */}
            {formData.contentType === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'ملفات التمرين' : 'Fichiers de l\'Exercice'}
                </label>
                <FileUpload onFilesUploaded={handleFilesUploaded} existingFiles={formData.files} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {isArabic 
                    ? '💡 يمكن للطلاب تحميل وعرض الملفات ثم الإجابة'
                    : '💡 Les étudiants peuvent télécharger et consulter les fichiers puis répondre'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Published Toggle */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm font-medium">{isArabic ? 'نشر التمرين' : 'Publier l\'exercice'}</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Enregistrement...') : (exercise ? (isArabic ? 'تحديث' : 'Mettre à jour') : (isArabic ? 'إنشاء' : 'Créer'))}
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
