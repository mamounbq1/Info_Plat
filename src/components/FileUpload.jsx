import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { 
  DocumentIcon, 
  PhotoIcon, 
  MusicalNoteIcon, 
  VideoCameraIcon,
  XMarkIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function FileUpload({ onFilesUploaded, existingFiles = [], isArabic, maxFiles = 10 }) {
  const [files, setFiles] = useState(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Update files when existingFiles prop changes
  useEffect(() => {
    setFiles(existingFiles);
  }, [existingFiles]);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <PhotoIcon className="w-6 h-6" />;
    if (fileType.startsWith('audio/')) return <MusicalNoteIcon className="w-6 h-6" />;
    if (fileType.startsWith('video/')) return <VideoCameraIcon className="w-6 h-6" />;
    return <DocumentIcon className="w-6 h-6" />;
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

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(
        isArabic 
          ? `يمكنك رفع ${maxFiles} ملفات كحد أقصى` 
          : `Vous pouvez télécharger maximum ${maxFiles} fichiers`
      );
      return;
    }

    // Validate file sizes (max 50MB per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(
        isArabic
          ? 'بعض الملفات أكبر من 50 ميجابايت'
          : 'Certains fichiers dépassent 50MB'
      );
      return;
    }

    setUploading(true);

    try {
      const uploadedFiles = [];

      for (const file of selectedFiles) {
        try {
          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const storageRef = ref(storage, `course-materials/${fileName}`);
          
          // Create upload task with resumable upload
          const uploadTask = uploadBytesResumable(storageRef, file);

          // Track upload progress
          await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
              },
              (error) => {
                console.error('Upload error for file:', file.name, error);
                reject(error);
              },
              async () => {
                try {
                  const downloadURL = await getDownloadURL(storageRef);
                  uploadedFiles.push({
                    id: fileName,
                    name: file.name,
                    url: downloadURL,
                    type: file.type,
                    size: file.size,
                    storagePath: `course-materials/${fileName}`
                  });
                  resolve();
                } catch (urlError) {
                  console.error('Error getting download URL:', urlError);
                  reject(urlError);
                }
              }
            );
          });
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          toast.error(
            isArabic
              ? `خطأ في رفع ${file.name}: ${fileError.message}`
              : `Erreur pour ${file.name}: ${fileError.message}`
          );
        }
      }

      if (uploadedFiles.length > 0) {
        setFiles(prev => [...prev, ...uploadedFiles]);
        onFilesUploaded([...files, ...uploadedFiles]);
        setUploadProgress({});
        
        toast.success(
          isArabic
            ? `تم رفع ${uploadedFiles.length} ملف بنجاح`
            : `${uploadedFiles.length} fichier(s) téléchargé(s) avec succès`
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        isArabic
          ? `خطأ في رفع الملفات: ${error.message}`
          : `Erreur lors du téléchargement: ${error.message}`
      );
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleRemoveFile = async (file) => {
    try {
      // Delete from Firebase Storage
      const fileRef = ref(storage, file.storagePath);
      await deleteObject(fileRef);

      // Remove from state
      const updatedFiles = files.filter(f => f.id !== file.id);
      setFiles(updatedFiles);
      onFilesUploaded(updatedFiles);

      toast.success(
        isArabic
          ? 'تم حذف الملف'
          : 'Fichier supprimé'
      );
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        isArabic
          ? 'خطأ في حذف الملف'
          : 'Erreur lors de la suppression'
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || files.length >= maxFiles}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${(uploading || files.length >= maxFiles) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isArabic
              ? 'اضغط لرفع الملفات أو اسحب وأفلت'
              : 'Cliquez pour télécharger ou glissez-déposez'}
          </p>
          <p className="text-sm text-gray-500">
            {isArabic
              ? 'صور، فيديوهات، ملفات PDF، Word، PowerPoint، Excel، صوت (حتى 50 ميجابايت)'
              : 'Images, Vidéos, PDF, Word, PowerPoint, Excel, Audio (jusqu\'à 50MB)'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {files.length} / {maxFiles} {isArabic ? 'ملفات' : 'fichiers'}
          </p>
        </label>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-blue-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{fileName}</span>
                <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">
            {isArabic ? 'الملفات المرفوعة:' : 'Fichiers téléchargés:'}
          </h3>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-blue-600 flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {getFileTypeName(file.type)}
                    </span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFile(file)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                title={isArabic ? 'حذف' : 'Supprimer'}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
