import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentIcon, 
  PencilIcon,
  FolderIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUpload from '../components/FileUpload';

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

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  
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
    published: false,
    tags: []
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(coursesQuery);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(isArabic ? 'خطأ في تحميل الدروس' : 'Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
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
        createdBy: userProfile?.fullName || 'Admin'
      };

      if (editingCourse) {
        // Update existing course
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
        toast.success(isArabic ? 'تم تحديث الدرس بنجاح' : 'Cours mis à jour avec succès');
      } else {
        // Create new course
        courseData.createdAt = new Date().toISOString();
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
      titleFr: course.titleFr,
      titleAr: course.titleAr,
      descriptionFr: course.descriptionFr,
      descriptionAr: course.descriptionAr,
      category: course.category || 'mathematics',
      level: course.level || 'beginner',
      duration: course.duration || '',
      files: course.files || [],
      videoUrl: course.videoUrl || '',
      published: course.published,
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
      published: false,
      tags: []
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isArabic ? 'لوحة تحكم المدرس' : 'Tableau de bord Enseignant'}
              </h1>
              <p className="text-gray-600">
                {isArabic ? 'إدارة الدروس والمواد التعليمية' : 'Gérez vos cours et matériels pédagogiques'}
              </p>
            </div>
            <button
              onClick={() => setShowCourseModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              {isArabic ? 'إضافة درس جديد' : 'Nouveau cours'}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md p-6">
            <FolderIcon className="w-10 h-10 mb-3 opacity-80" />
            <h3 className="text-3xl font-bold mb-1">{courses.length}</h3>
            <p className="text-blue-100">{isArabic ? 'إجمالي الدروس' : 'Total des cours'}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-md p-6">
            <AcademicCapIcon className="w-10 h-10 mb-3 opacity-80" />
            <h3 className="text-3xl font-bold mb-1">{courses.filter(c => c.published).length}</h3>
            <p className="text-green-100">{isArabic ? 'الدروس المنشورة' : 'Cours publiés'}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-md p-6">
            <DocumentIcon className="w-10 h-10 mb-3 opacity-80" />
            <h3 className="text-3xl font-bold mb-1">
              {courses.reduce((acc, course) => acc + (course.files?.length || 0), 0)}
            </h3>
            <p className="text-purple-100">{isArabic ? 'الملفات المرفوعة' : 'Fichiers téléchargés'}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-md p-6">
            <PencilIcon className="w-10 h-10 mb-3 opacity-80" />
            <h3 className="text-3xl font-bold mb-1">{courses.filter(c => !c.published).length}</h3>
            <p className="text-orange-100">{isArabic ? 'المسودات' : 'Brouillons'}</p>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isArabic ? 'جميع الدروس' : 'Tous les cours'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {isArabic ? 'لا توجد دروس. أضف أول درس!' : 'Aucun cours. Ajoutez votre premier cours!'}
              </p>
              <button
                onClick={() => setShowCourseModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {isArabic ? 'إضافة درس' : 'Ajouter un cours'}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 flex-1">
                      {isArabic ? course.titleAr : course.titleFr}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      course.published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.published 
                        ? (isArabic ? 'منشور' : 'Publié')
                        : (isArabic ? 'مسودة' : 'Brouillon')
                      }
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {isArabic ? course.descriptionAr : course.descriptionFr}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {CATEGORIES.find(c => c.id === course.category)?.[isArabic ? 'ar' : 'fr']}
                      </span>
                    )}
                    {course.files && course.files.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {course.files.length} {isArabic ? 'ملف' : 'fichier(s)'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(course)}
                      className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-medium hover:bg-blue-100 transition text-sm"
                    >
                      <PencilIcon className="w-4 h-4 inline mr-1" />
                      {isArabic ? 'تعديل' : 'Modifier'}
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg font-medium hover:bg-red-100 transition text-sm"
                    >
                      <TrashIcon className="w-4 h-4 inline mr-1" />
                      {isArabic ? 'حذف' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCourse
                ? (isArabic ? 'تعديل الدرس' : 'Modifier le cours')
                : (isArabic ? 'إضافة درس جديد' : 'Nouveau cours')
              }
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'العنوان (فرنسي) *' : 'Titre (Français) *'}
                  </label>
                  <input
                    type="text"
                    value={courseForm.titleFr}
                    onChange={(e) => setCourseForm({ ...courseForm, titleFr: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Introduction aux mathématiques"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'العنوان (عربي) *' : 'Titre (Arabe) *'}
                  </label>
                  <input
                    type="text"
                    value={courseForm.titleAr}
                    onChange={(e) => setCourseForm({ ...courseForm, titleAr: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    dir="rtl"
                    placeholder="مقدمة في الرياضيات"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الوصف (فرنسي) *' : 'Description (Français) *'}
                  </label>
                  <textarea
                    value={courseForm.descriptionFr}
                    onChange={(e) => setCourseForm({ ...courseForm, descriptionFr: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez votre cours..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الوصف (عربي) *' : 'Description (Arabe) *'}
                  </label>
                  <textarea
                    value={courseForm.descriptionAr}
                    onChange={(e) => setCourseForm({ ...courseForm, descriptionAr: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    dir="rtl"
                    placeholder="صف درسك..."
                  />
                </div>
              </div>

              {/* Category, Level, Duration */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الفئة *' : 'Catégorie *'}
                  </label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {isArabic ? cat.ar : cat.fr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'المستوى' : 'Niveau'}
                  </label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">{isArabic ? 'مبتدئ' : 'Débutant'}</option>
                    <option value="intermediate">{isArabic ? 'متوسط' : 'Intermédiaire'}</option>
                    <option value="advanced">{isArabic ? 'متقدم' : 'Avancé'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'المدة (بالساعات)' : 'Durée (heures)'}
                  </label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={isArabic ? '10 ساعات' : '10 heures'}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الوسوم' : 'Tags'}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={isArabic ? 'أضف وسم...' : 'Ajouter un tag...'}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {isArabic ? 'إضافة' : 'Ajouter'}
                  </button>
                </div>
                {courseForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {courseForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Video URL (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'رابط فيديو YouTube (اختياري)' : 'Lien vidéo YouTube (optionnel)'}
                </label>
                <input
                  type="url"
                  value={courseForm.videoUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {isArabic ? 'المواد التعليمية *' : 'Matériels pédagogiques *'}
                </label>
                <FileUpload
                  onFilesUploaded={handleFilesUploaded}
                  isArabic={isArabic}
                  maxFiles={15}
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="published"
                  checked={courseForm.published}
                  onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  {isArabic ? 'نشر الدرس مباشرة (سيكون مرئيًا للطلاب)' : 'Publier le cours immédiatement (visible aux étudiants)'}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      {isArabic ? 'جاري الحفظ...' : 'Enregistrement...'}
                    </span>
                  ) : (
                    editingCourse
                      ? (isArabic ? 'تحديث الدرس' : 'Mettre à jour')
                      : (isArabic ? 'إضافة الدرس' : 'Ajouter le cours')
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
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
