import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { GALLERY_CATEGORIES } from '../../constants/galleryCategories';

/**
 * GalleryCategoryBatchUpdate - Temporary Component for Batch Assigning Categories
 * 
 * This component helps admin users assign categories to existing gallery images
 * that don't have a category field yet.
 * 
 * USAGE:
 * 1. Temporarily add this component to AdminDashboard.jsx
 * 2. Run the batch update to assign categories to all images
 * 3. Remove this component after use
 */

export default function GalleryCategoryBatchUpdate({ isArabic }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'homepage-gallery'));
      const imagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setImages(imagesList);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error(isArabic ? 'خطأ في التحميل' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Intelligently assign category based on image title/caption keywords
   */
  const assignCategory = (titleFr, titleAr) => {
    const text = `${titleFr || ''} ${titleAr || ''}`.toLowerCase();

    // Campus keywords
    if (text.includes('campus') || text.includes('الحرم') || text.includes('établissement') || text.includes('école') || text.includes('مدرسة')) {
      return 'campus';
    }

    // Sports keywords
    if (text.includes('sport') || text.includes('رياض') || text.includes('football') || text.includes('basketball') || text.includes('athlétisme')) {
      return 'sports';
    }

    // Facilities keywords
    if (text.includes('laboratoire') || text.includes('مختبر') || text.includes('bibliothèque') || text.includes('مكتبة') || text.includes('salle') || text.includes('قاعة')) {
      return 'facilities';
    }

    // Events keywords
    if (text.includes('événement') || text.includes('حدث') || text.includes('festival') || text.includes('مهرجان') || text.includes('journée') || text.includes('يوم')) {
      return 'events';
    }

    // Ceremonies keywords
    if (text.includes('cérémonie') || text.includes('حفل') || text.includes('remise') || text.includes('تخرج') || text.includes('diplôme')) {
      return 'ceremonies';
    }

    // Activities keywords
    if (text.includes('activité') || text.includes('نشاط') || text.includes('atelier') || text.includes('ورشة') || text.includes('club')) {
      return 'activities';
    }

    // Academic keywords
    if (text.includes('cours') || text.includes('درس') || text.includes('classe') || text.includes('صف') || text.includes('étudiant') || text.includes('طالب')) {
      return 'academic';
    }

    // Default to campus if no match
    return 'campus';
  };

  const handleBatchUpdate = async () => {
    if (!window.confirm(isArabic ? 
      `هل تريد تحديث ${images.length} صورة؟ سيتم تعيين الفئات تلقائيًا بناءً على العناوين.` :
      `Mettre à jour ${images.length} images? Les catégories seront assignées automatiquement basé sur les titres.`
    )) {
      return;
    }

    try {
      setUpdating(true);
      setProgress({ current: 0, total: images.length });

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const category = image.category || assignCategory(image.titleFr, image.titleAr);

        await updateDoc(doc(db, 'homepage-gallery', image.id), {
          category: category,
          updatedAt: new Date().toISOString()
        });

        setProgress({ current: i + 1, total: images.length });
      }

      setCompleted(true);
      toast.success(isArabic ? 
        `تم تحديث ${images.length} صورة بنجاح!` :
        `${images.length} images mises à jour avec succès!`
      );

      // Refresh images list
      await fetchImages();
    } catch (error) {
      console.error('Error updating images:', error);
      toast.error(isArabic ? 'خطأ في التحديث' : 'Erreur de mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const imagesWithoutCategory = images.filter(img => !img.category);
  const imagesWithCategory = images.filter(img => img.category);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <PhotoIcon className="w-7 h-7 text-blue-600" />
          {isArabic ? 'تحديث فئات الصور بالجملة' : 'Mise à Jour des Catégories en Lot'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isArabic ? 
            'أداة لإضافة فئات إلى الصور الموجودة. استخدم هذا مرة واحدة ثم احذف المكون.' :
            'Outil pour ajouter des catégories aux images existantes. Utilisez une fois puis supprimez ce composant.'
          }
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{images.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? 'إجمالي الصور' : 'Total Images'}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{imagesWithoutCategory.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? 'بدون فئة' : 'Sans Catégorie'}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{imagesWithCategory.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? 'مع فئة' : 'Avec Catégorie'}
              </p>
            </div>
          </div>

          {updating && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {isArabic ? 'جاري التحديث...' : 'Mise à jour en cours...'}
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {completed && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200 font-medium">
                {isArabic ? 
                  'تم! تم تحديث جميع الصور بنجاح. يمكنك الآن حذف هذا المكون.' :
                  'Terminé! Toutes les images ont été mises à jour. Vous pouvez maintenant supprimer ce composant.'
                }
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleBatchUpdate}
              disabled={updating || images.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <PhotoIcon className="w-5 h-5" />
              {updating ? 
                (isArabic ? 'جاري التحديث...' : 'Mise à jour...') :
                (isArabic ? 'تحديث جميع الصور' : 'Mettre à Jour Toutes les Images')
              }
            </button>

            <div className="border dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {isArabic ? 'الفئات المتاحة:' : 'Catégories Disponibles:'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GALLERY_CATEGORIES.filter(cat => cat.value !== 'all').map((cat) => (
                  <div key={cat.value} className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    cat.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    cat.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    cat.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    cat.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    cat.color === 'pink' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                    cat.color === 'teal' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                  }`}>
                    {isArabic ? cat.label.ar : cat.label.fr}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {imagesWithoutCategory.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {isArabic ? 'صور بدون فئة:' : 'Images Sans Catégorie:'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imagesWithoutCategory.map((img) => (
                  <div key={img.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={img.imageUrl} 
                      alt={isArabic ? img.titleAr : img.titleFr}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                        {isArabic ? img.titleAr : img.titleFr}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        → {assignCategory(img.titleFr, img.titleAr)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
