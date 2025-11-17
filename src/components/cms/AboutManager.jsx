/**
 * AboutManager.jsx - Gestionnaire CMS pour la section "À Propos"
 * 
 * Permet aux administrateurs de modifier le contenu de la section About:
 * - Titre (FR/AR)
 * - Sous-titre (FR/AR)
 * - Description (FR/AR)
 * - URL de l'image
 * - Années d'expérience
 * - Points forts (4 items avec titres/descriptions FR/AR)
 * - Activation/Désactivation de la section
 * 
 * Document Firestore: homepage/about
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { uploadImage } from '../../utils/fileUpload';
import ImageUploadField from '../ImageUploadField';

export default function AboutManager({ isArabic }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aboutContent, setAboutContent] = useState({
    titleFr: '',
    titleAr: '',
    subtitleFr: '',
    subtitleAr: '',
    descriptionFr: '',
    descriptionAr: '',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
    yearsOfExperience: 15,
    enabled: true,
    // Points forts (4 items)
    features: [
      {
        titleFr: 'Programmes Excellents',
        titleAr: 'برامج متميزة',
        descriptionFr: 'Curriculums modernes',
        descriptionAr: 'مناهج حديثة ومتطورة'
      },
      {
        titleFr: 'Activités Variées',
        titleAr: 'أنشطة متنوعة',
        descriptionFr: 'Sport, Art, Culture',
        descriptionAr: 'رياضة، فن، ثقافة'
      },
      {
        titleFr: 'Équipe Dédiée',
        titleAr: 'فريق متميز',
        descriptionFr: 'Enseignants qualifiés',
        descriptionAr: 'أساتذة مؤهلون'
      },
      {
        titleFr: 'Infrastructure Moderne',
        titleAr: 'بيئة حديثة',
        descriptionFr: 'Équipements modernes',
        descriptionAr: 'تجهيزات متطورة'
      }
    ]
  });

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'homepage', 'about');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Assurer que features existe toujours (fallback)
        if (!data.features || data.features.length === 0) {
          data.features = aboutContent.features;
        }
        setAboutContent(data);
        console.log('✅ [AboutManager] Loaded about content');
      } else {
        console.log('⚠️ [AboutManager] No about content found, using defaults');
      }
    } catch (error) {
      console.error('❌ [AboutManager] Error fetching about:', error);
      toast.error(isArabic ? 'خطأ في تحميل المحتوى' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await setDoc(doc(db, 'homepage', 'about'), {
        ...aboutContent,
        updatedAt: new Date().toISOString()
      });
      toast.success(isArabic ? 'تم حفظ قسم "عن الثانوية"' : 'Section "À Propos" sauvegardée');
      console.log('✅ [AboutManager] About content saved successfully');
    } catch (error) {
      console.error('❌ [AboutManager] Error saving about:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const updateFeature = (index, field, value) => {
    const newFeatures = [...aboutContent.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setAboutContent({ ...aboutContent, features: newFeatures });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isArabic ? 'تحرير قسم "عن الثانوية"' : 'Éditer la Section "À Propos"'}
      </h2>

      <form onSubmit={handleSaveAbout} className="space-y-6">
        {/* Titre */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
            </label>
            <input
              type="text"
              value={aboutContent.titleFr}
              onChange={(e) => setAboutContent({ ...aboutContent, titleFr: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Ex: Excellence Éducative Depuis 2009"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
            </label>
            <input
              type="text"
              value={aboutContent.titleAr}
              onChange={(e) => setAboutContent({ ...aboutContent, titleAr: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
              dir="rtl"
              placeholder="مثال: التميز التعليمي منذ 2009"
            />
          </div>
        </div>

        {/* Sous-titre */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان الفرعي (فرنسي)' : 'Sous-titre (Français)'}
            </label>
            <input
              type="text"
              value={aboutContent.subtitleFr}
              onChange={(e) => setAboutContent({ ...aboutContent, subtitleFr: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Ex: Former les leaders de demain"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'العنوان الفرعي (عربي)' : 'Sous-titre (Arabe)'}
            </label>
            <input
              type="text"
              value={aboutContent.subtitleAr}
              onChange={(e) => setAboutContent({ ...aboutContent, subtitleAr: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
              dir="rtl"
              placeholder="مثال: تكوين قادة المستقبل"
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
            </label>
            <textarea
              value={aboutContent.descriptionFr}
              onChange={(e) => setAboutContent({ ...aboutContent, descriptionFr: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Décrivez votre établissement..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
            </label>
            <textarea
              value={aboutContent.descriptionAr}
              onChange={(e) => setAboutContent({ ...aboutContent, descriptionAr: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
              dir="rtl"
              placeholder="اكتب وصف المؤسسة..."
            />
          </div>
        </div>

        {/* Image URL & Years */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ImageUploadField
              label={isArabic ? 'صورة القسم' : 'Image de la section'}
              value={aboutContent.imageUrl}
              onChange={async (file) => {
                if (file) {
                  setUploadingImage(true);
                  try {
                    const url = await uploadImage(file, 'about', aboutContent.imageUrl);
                    setAboutContent({ ...aboutContent, imageUrl: url });
                    toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image téléchargée avec succès');
                  } catch (error) {
                    console.error('Error uploading about image:', error);
                    toast.error(isArabic ? 'فشل رفع الصورة' : 'Échec du téléchargement');
                  } finally {
                    setUploadingImage(false);
                  }
                }
              }}
              folder="about"
              disabled={uploadingImage}
              required={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'سنوات الخبرة' : 'Années d\'Expérience'}
            </label>
            <input
              type="number"
              value={aboutContent.yearsOfExperience}
              onChange={(e) => setAboutContent({ ...aboutContent, yearsOfExperience: parseInt(e.target.value) || 0 })}
              min="0"
              max="100"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Points Forts (4 Features) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            {isArabic ? 'النقاط القوية (4 عناصر)' : 'Points Forts (4 éléments)'}
          </h3>
          <div className="space-y-6">
            {aboutContent.features.map((feature, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {isArabic ? `العنصر ${index + 1}` : `Élément ${index + 1}`}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
                    </label>
                    <input
                      type="text"
                      value={feature.titleFr}
                      onChange={(e) => updateFeature(index, 'titleFr', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
                    </label>
                    <input
                      type="text"
                      value={feature.titleAr}
                      onChange={(e) => updateFeature(index, 'titleAr', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
                    </label>
                    <input
                      type="text"
                      value={feature.descriptionFr}
                      onChange={(e) => updateFeature(index, 'descriptionFr', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
                    </label>
                    <input
                      type="text"
                      value={feature.descriptionAr}
                      onChange={(e) => updateFeature(index, 'descriptionAr', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activation Toggle */}
        <div className="flex items-center gap-3 pt-4">
          <input
            type="checkbox"
            id="aboutEnabled"
            checked={aboutContent.enabled}
            onChange={(e) => setAboutContent({ ...aboutContent, enabled: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <label htmlFor="aboutEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isArabic ? 'تفعيل قسم "عن الثانوية"' : 'Activer la section "À Propos"'}
          </label>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ التغييرات' : 'Sauvegarder les modifications')}
        </button>
      </form>
    </div>
  );
}
