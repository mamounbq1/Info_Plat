import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusIcon, TrashIcon, DocumentIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [courseForm, setCourseForm] = useState({
    titleFr: '',
    titleAr: '',
    descriptionFr: '',
    descriptionAr: '',
    type: 'pdf',
    fileUrl: '',
    videoUrl: '',
    published: true
  });

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

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `courses/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setCourseForm({ ...courseForm, fileUrl: downloadURL });
      toast.success(isArabic ? 'تم رفع الملف بنجاح' : 'Fichier téléchargé avec succès');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(isArabic ? 'خطأ في رفع الملف' : 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await addDoc(collection(db, 'courses'), {
        ...courseForm,
        createdAt: new Date().toISOString(),
        createdBy: userProfile?.fullName
      });
      
      toast.success(isArabic ? 'تم إضافة الدرس بنجاح' : 'Cours ajouté avec succès');
      setShowAddCourse(false);
      setCourseForm({
        titleFr: '',
        titleAr: '',
        descriptionFr: '',
        descriptionAr: '',
        type: 'pdf',
        fileUrl: '',
        videoUrl: '',
        published: true
      });
      fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error(isArabic ? 'خطأ في إضافة الدرس' : 'Erreur lors de l\'ajout du cours');
    } finally {
      setLoading(false);
    }
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
                {isArabic ? 'إدارة الدروس والاختبارات' : 'Gérez vos cours et quiz'}
              </p>
            </div>
            <button
              onClick={() => setShowAddCourse(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              {isArabic ? 'إضافة درس' : 'Ajouter un cours'}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-500 text-white rounded-xl shadow-md p-6">
            <h3 className="text-3xl font-bold mb-1">{courses.length}</h3>
            <p className="text-blue-100">{isArabic ? 'إجمالي الدروس' : 'Total des cours'}</p>
          </div>
          <div className="bg-green-500 text-white rounded-xl shadow-md p-6">
            <h3 className="text-3xl font-bold mb-1">{courses.filter(c => c.published).length}</h3>
            <p className="text-green-100">{isArabic ? 'الدروس المنشورة' : 'Cours publiés'}</p>
          </div>
          <div className="bg-purple-500 text-white rounded-xl shadow-md p-6">
            <h3 className="text-3xl font-bold mb-1">0</h3>
            <p className="text-purple-100">{isArabic ? 'عدد الطلاب' : 'Nombre d\'étudiants'}</p>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isArabic ? 'جميع الدروس' : 'Tous les cours'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isArabic ? 'لا توجد دروس. أضف أول درس!' : 'Aucun cours. Ajoutez votre premier cours!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      {isArabic ? 'العنوان' : 'Titre'}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      {isArabic ? 'النوع' : 'Type'}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      {isArabic ? 'الحالة' : 'Statut'}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      {isArabic ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {isArabic ? course.titleAr : course.titleFr}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                          {course.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          course.published 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {course.published 
                            ? (isArabic ? 'منشور' : 'Publié')
                            : (isArabic ? 'مسودة' : 'Brouillon')
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isArabic ? 'إضافة درس جديد' : 'Ajouter un nouveau cours'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
                  </label>
                  <input
                    type="text"
                    value={courseForm.titleFr}
                    onChange={(e) => setCourseForm({ ...courseForm, titleFr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
                  </label>
                  <input
                    type="text"
                    value={courseForm.titleAr}
                    onChange={(e) => setCourseForm({ ...courseForm, titleAr: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
                </label>
                <textarea
                  value={courseForm.descriptionFr}
                  onChange={(e) => setCourseForm({ ...courseForm, descriptionFr: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
                </label>
                <textarea
                  value={courseForm.descriptionAr}
                  onChange={(e) => setCourseForm({ ...courseForm, descriptionAr: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'نوع المحتوى' : 'Type de contenu'}
                </label>
                <select
                  value={courseForm.type}
                  onChange={(e) => setCourseForm({ ...courseForm, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Vidéo YouTube</option>
                  <option value="link">Lien Google Docs</option>
                </select>
              </div>

              {courseForm.type === 'pdf' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'رفع ملف PDF' : 'Télécharger PDF'}
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  />
                  {uploading && <p className="text-sm text-blue-600 mt-2">{t('loading')}</p>}
                  {courseForm.fileUrl && (
                    <p className="text-sm text-green-600 mt-2">✓ {isArabic ? 'تم الرفع' : 'Téléchargé'}</p>
                  )}
                </div>
              )}

              {courseForm.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'رابط فيديو YouTube' : 'Lien vidéo YouTube'}
                  </label>
                  <input
                    type="url"
                    value={courseForm.videoUrl}
                    onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {courseForm.type === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'رابط Google Docs' : 'Lien Google Docs'}
                  </label>
                  <input
                    type="url"
                    value={courseForm.fileUrl}
                    onChange={(e) => setCourseForm({ ...courseForm, fileUrl: e.target.value })}
                    placeholder="https://docs.google.com/..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={courseForm.published}
                  onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'نشر الدرس مباشرة' : 'Publier le cours immédiatement'}
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? t('loading') : t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
