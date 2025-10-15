import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeftIcon, DocumentArrowDownIcon, PlayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { t, isArabic } = useLanguage();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      
      if (courseDoc.exists()) {
        setCourse({ id: courseDoc.id, ...courseDoc.data() });
      } else {
        toast.error(isArabic ? 'الدرس غير موجود' : 'Cours introuvable');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error(isArabic ? 'خطأ في تحميل الدرس' : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const progress = userProfile?.progress || {};
      progress[courseId] = 100;
      
      await updateDoc(userRef, { progress });
      toast.success(isArabic ? 'تم وضع علامة مكتمل' : 'Marqué comme terminé');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(isArabic ? 'خطأ في التحديث' : 'Erreur de mise à jour');
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          {isArabic ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isArabic ? course.titleAr : course.titleFr}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {isArabic ? course.descriptionAr : course.descriptionFr}
          </p>
          
          <div className="flex gap-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              {course.type.toUpperCase()}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
              {isArabic ? 'أضيف في' : 'Ajouté le'}: {new Date(course.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isArabic ? 'محتوى الدرس' : 'Contenu du cours'}
          </h2>

          {/* PDF Viewer */}
          {course.type === 'pdf' && course.fileUrl && (
            <div className="space-y-4">
              <iframe
                src={`${course.fileUrl}#toolbar=1`}
                className="w-full h-[800px] border rounded-lg"
                title="PDF Viewer"
              />
              <a
                href={course.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                {t('downloadPdf')}
              </a>
            </div>
          )}

          {/* YouTube Video */}
          {course.type === 'video' && course.videoUrl && (
            <div className="space-y-4">
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(course.videoUrl)}
                  className="w-full h-full rounded-lg"
                  title="YouTube Video"
                  allowFullScreen
                />
              </div>
              <a
                href={course.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                <PlayIcon className="w-5 h-5" />
                {isArabic ? 'مشاهدة على YouTube' : 'Regarder sur YouTube'}
              </a>
            </div>
          )}

          {/* Google Docs Link */}
          {course.type === 'link' && course.fileUrl && (
            <div className="space-y-4">
              <iframe
                src={course.fileUrl}
                className="w-full h-[800px] border rounded-lg"
                title="Google Docs"
              />
              <a
                href={course.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                {isArabic ? 'فتح في نافذة جديدة' : 'Ouvrir dans une nouvelle fenêtre'}
              </a>
            </div>
          )}

          {/* Mark as Complete Button */}
          <div className="mt-8 pt-8 border-t">
            <button
              onClick={markAsCompleted}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {isArabic ? 'وضع علامة كمكتمل' : 'Marquer comme terminé'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
