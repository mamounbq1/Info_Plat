import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ArrowLeftIcon, 
  DocumentArrowDownIcon, 
  PlayIcon,
  PhotoIcon,
  DocumentIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { isArabic } = useLanguage();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      
      if (courseDoc.exists()) {
        const courseData = { id: courseDoc.id, ...courseDoc.data() };
        setCourse(courseData);
        
        // Set first file as selected if available
        if (courseData.files && courseData.files.length > 0) {
          setSelectedFile(courseData.files[0]);
        }
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
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <PhotoIcon className="w-5 h-5" />;
    if (fileType.startsWith('audio/')) return <MusicalNoteIcon className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <VideoCameraIcon className="w-5 h-5" />;
    return <DocumentIcon className="w-5 h-5" />;
  };

  const getFileTypeName = (fileType) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType.startsWith('audio/')) return 'Audio';
    if (fileType.startsWith('video/')) return 'Video';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'Word';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PowerPoint';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel';
    return 'Document';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderFilePreview = (file) => {
    if (!file) return null;

    // Image files
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-auto rounded-lg"
        />
      );
    }

    // PDF files
    if (file.type.includes('pdf')) {
      return (
        <iframe
          src={`${file.url}#toolbar=1&view=FitH`}
          className="w-full h-[700px] border rounded-lg"
          title="PDF Viewer"
        />
      );
    }

    // Audio files
    if (file.type.startsWith('audio/')) {
      return (
        <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
          <MusicalNoteIcon className="w-20 h-20 text-purple-400 mx-auto mb-6" />
          <audio controls className="w-full">
            <source src={file.url} type={file.type} />
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
          <p className="text-center mt-4 text-gray-700 font-medium">{file.name}</p>
        </div>
      );
    }

    // Video files
    if (file.type.startsWith('video/')) {
      return (
        <video controls className="w-full h-auto rounded-lg max-h-[600px]">
          <source src={file.url} type={file.type} />
          Votre navigateur ne supporte pas l'élément vidéo.
        </video>
      );
    }

    // Office documents and other files
    return (
      <div className="p-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-center">
        <DocumentIcon className="w-24 h-24 text-blue-400 mx-auto mb-6" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">{file.name}</h3>
        <p className="text-gray-600 mb-6">
          {getFileTypeName(file.type)} • {formatFileSize(file.size)}
        </p>
        <a
          href={file.url}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          {isArabic ? 'تحميل الملف' : 'Télécharger le fichier'}
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) return null;

  const isCompleted = userProfile?.progress?.[courseId] === 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          {isArabic ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {isArabic ? course.titleAr : course.titleFr}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {isArabic ? course.descriptionAr : course.descriptionFr}
              </p>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="font-semibold">
                  {isArabic ? 'مكتمل' : 'Terminé'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {course.category && (
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                {course.category}
              </span>
            )}
            {course.level && (
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                {course.level === 'beginner' && (isArabic ? 'مبتدئ' : 'Débutant')}
                {course.level === 'intermediate' && (isArabic ? 'متوسط' : 'Intermédiaire')}
                {course.level === 'advanced' && (isArabic ? 'متقدم' : 'Avancé')}
              </span>
            )}
            {course.duration && (
              <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold">
                {course.duration}
              </span>
            )}
            {course.files && course.files.length > 0 && (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                {course.files.length} {isArabic ? 'ملف' : 'fichier(s)'}
              </span>
            )}
          </div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {course.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Files Sidebar */}
          {course.files && course.files.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
                <h3 className="font-bold text-gray-900 mb-4">
                  {isArabic ? 'المواد التعليمية' : 'Matériels'}
                </h3>
                <div className="space-y-2">
                  {course.files.map((file, index) => (
                    <button
                      key={file.id || index}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedFile?.id === file.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={selectedFile?.id === file.id ? 'text-blue-600' : 'text-gray-600'}>
                          {getFileIcon(file.type)}
                        </div>
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded ${
                          selectedFile?.id === file.id
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {getFileTypeName(file.type)}
                        </span>
                        <span className="text-gray-500">{formatFileSize(file.size)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={course.files && course.files.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isArabic ? 'محتوى الدرس' : 'Contenu du cours'}
              </h2>

              {/* YouTube Video */}
              {course.videoUrl && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    {isArabic ? 'فيديو تعليمي' : 'Vidéo pédagogique'}
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden shadow-lg mb-3">
                    <iframe
                      src={getYouTubeEmbedUrl(course.videoUrl)}
                      className="w-full h-full"
                      title="YouTube Video"
                      allowFullScreen
                    />
                  </div>
                  <a
                    href={course.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                  >
                    <PlayIcon className="w-5 h-5" />
                    {isArabic ? 'مشاهدة على YouTube' : 'Regarder sur YouTube'}
                  </a>
                </div>
              )}

              {/* Selected File Preview */}
              {selectedFile && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedFile.name}
                    </h3>
                    <a
                      href={selectedFile.url}
                      download={selectedFile.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      {isArabic ? 'تحميل' : 'Télécharger'}
                    </a>
                  </div>
                  {renderFilePreview(selectedFile)}
                </div>
              )}

              {/* No content message */}
              {!course.videoUrl && (!course.files || course.files.length === 0) && (
                <div className="text-center py-12">
                  <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {isArabic ? 'لا توجد مواد متاحة حاليًا' : 'Aucun matériel disponible pour le moment'}
                  </p>
                </div>
              )}
            </div>

            {/* Mark as Complete Button */}
            <button
              onClick={markAsCompleted}
              disabled={isCompleted}
              className={`w-full py-4 rounded-lg font-semibold transition ${
                isCompleted
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isCompleted
                ? (isArabic ? '✓ تم الإنتهاء' : '✓ Cours terminé')
                : (isArabic ? 'وضع علامة كمكتمل' : 'Marquer comme terminé')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
