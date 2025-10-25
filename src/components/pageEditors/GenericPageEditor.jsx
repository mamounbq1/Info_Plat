import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { db, storage } from '../../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function GenericPageEditor({ pageId, pageName, onBack }) {
  const { isArabic } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [content, setContent] = useState({
    title: { fr: '', ar: '' },
    subtitle: { fr: '', ar: '' },
    sections: [],
    metaDescription: { fr: '', ar: '' },
    isPublished: true,
  });

  useEffect(() => {
    loadPageContent();
  }, [pageId]);

  const loadPageContent = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'pageContents', pageId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setContent(docSnap.data());
      } else {
        // Set default content
        setContent({
          title: { fr: pageName, ar: pageName },
          subtitle: { fr: '', ar: '' },
          sections: [
            {
              id: Date.now().toString(),
              type: 'text',
              heading: { fr: '', ar: '' },
              content: { fr: '', ar: '' },
            }
          ],
          metaDescription: { fr: '', ar: '' },
          isPublished: false,
        });
      }
    } catch (error) {
      console.error('Error loading page content:', error);
      alert(isArabic ? 'خطأ في تحميل المحتوى' : 'Erreur de chargement du contenu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const docRef = doc(db, 'pageContents', pageId);
      await setDoc(docRef, {
        ...content,
        lastModified: serverTimestamp(),
        pageId,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert(isArabic ? 'تم حفظ التغييرات بنجاح' : 'Modifications enregistrées avec succès');
    } catch (error) {
      console.error('Error saving page content:', error);
      alert(isArabic ? 'خطأ في حفظ التغييرات' : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type = 'text') => {
    const newSection = {
      id: Date.now().toString(),
      type,
      heading: { fr: '', ar: '' },
      content: { fr: '', ar: '' },
      ...(type === 'image' && { imageUrl: '', alt: { fr: '', ar: '' } }),
      ...(type === 'list' && { items: [] }),
    };
    setContent({ ...content, sections: [...content.sections, newSection] });
  };

  const updateSection = (sectionId, updates) => {
    setContent({
      ...content,
      sections: content.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    });
  };

  const deleteSection = (sectionId) => {
    setContent({
      ...content,
      sections: content.sections.filter(section => section.id !== sectionId),
    });
  };

  const handleImageUpload = async (sectionId, file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const storageRef = ref(storage, `pages/${pageId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      
      updateSection(sectionId, { imageUrl });
      alert(isArabic ? 'تم رفع الصورة بنجاح' : 'Image téléchargée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(isArabic ? 'خطأ في رفع الصورة' : 'Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const addListItem = (sectionId) => {
    const section = content.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: { fr: '', ar: '' },
    };
    
    updateSection(sectionId, {
      items: [...(section.items || []), newItem],
    });
  };

  const updateListItem = (sectionId, itemId, lang, value) => {
    const section = content.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const updatedItems = section.items.map(item =>
      item.id === itemId ? { ...item, text: { ...item.text, [lang]: value } } : item
    );
    
    updateSection(sectionId, { items: updatedItems });
  };

  const deleteListItem = (sectionId, itemId) => {
    const section = content.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    updateSection(sectionId, {
      items: section.items.filter(item => item.id !== itemId),
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {isArabic ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>{isArabic ? 'رجوع' : 'Retour'}</span>
          </button>
          
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircleIcon className="w-5 h-5" />
                {isArabic ? 'تم الحفظ' : 'Enregistré'}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? (isArabic ? 'جاري الحفظ...' : 'Enregistrement...') : (isArabic ? 'حفظ' : 'Enregistrer')}
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'تحرير الصفحة: ' : 'Modifier la page: '}{pageName}
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        {/* Title */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'العنوان' : 'Titre'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Français
              </label>
              <input
                type="text"
                value={content.title.fr}
                onChange={(e) => setContent({ ...content, title: { ...content.title, fr: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Titre de la page"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                العربية
              </label>
              <input
                type="text"
                value={content.title.ar}
                onChange={(e) => setContent({ ...content, title: { ...content.title, ar: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                placeholder="عنوان الصفحة"
              />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'العنوان الفرعي' : 'Sous-titre'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Français
              </label>
              <input
                type="text"
                value={content.subtitle.fr}
                onChange={(e) => setContent({ ...content, subtitle: { ...content.subtitle, fr: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Sous-titre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                العربية
              </label>
              <input
                type="text"
                value={content.subtitle.ar}
                onChange={(e) => setContent({ ...content, subtitle: { ...content.subtitle, ar: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                placeholder="العنوان الفرعي"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'الأقسام' : 'Sections'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => addSection('text')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                {isArabic ? 'نص' : 'Texte'}
              </button>
              <button
                onClick={() => addSection('image')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                {isArabic ? 'صورة' : 'Image'}
              </button>
              <button
                onClick={() => addSection('list')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                {isArabic ? 'قائمة' : 'Liste'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {content.sections.map((section, index) => (
              <div key={section.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isArabic ? 'القسم' : 'Section'} #{index + 1} - {
                      section.type === 'text' ? (isArabic ? 'نص' : 'Texte') :
                      section.type === 'image' ? (isArabic ? 'صورة' : 'Image') :
                      (isArabic ? 'قائمة' : 'Liste')
                    }
                  </span>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Heading */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
                    </label>
                    <input
                      type="text"
                      value={section.heading.fr}
                      onChange={(e) => updateSection(section.id, { heading: { ...section.heading, fr: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
                    </label>
                    <input
                      type="text"
                      value={section.heading.ar}
                      onChange={(e) => updateSection(section.id, { heading: { ...section.heading, ar: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-right
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Content based on type */}
                {section.type === 'text' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isArabic ? 'المحتوى (فرنسي)' : 'Contenu (Français)'}
                      </label>
                      <textarea
                        value={section.content.fr}
                        onChange={(e) => updateSection(section.id, { content: { ...section.content, fr: e.target.value } })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isArabic ? 'المحتوى (عربي)' : 'Contenu (Arabe)'}
                      </label>
                      <textarea
                        value={section.content.ar}
                        onChange={(e) => updateSection(section.id, { content: { ...section.content, ar: e.target.value } })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-right
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {section.type === 'image' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isArabic ? 'رفع الصورة' : 'Télécharger l\'image'}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(section.id, e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      {uploading && (
                        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                          {isArabic ? 'جاري الرفع...' : 'Téléchargement...'}
                        </p>
                      )}
                    </div>
                    {section.imageUrl && (
                      <img
                        src={section.imageUrl}
                        alt=""
                        className="w-full max-w-md rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Alt Text (Français)
                        </label>
                        <input
                          type="text"
                          value={section.alt?.fr || ''}
                          onChange={(e) => updateSection(section.id, { alt: { ...section.alt, fr: e.target.value } })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                                   focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Alt Text (العربية)
                        </label>
                        <input
                          type="text"
                          value={section.alt?.ar || ''}
                          onChange={(e) => updateSection(section.id, { alt: { ...section.alt, ar: e.target.value } })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-right
                                   focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {section.type === 'list' && (
                  <div className="space-y-3">
                    {section.items?.map((item) => (
                      <div key={item.id} className="flex items-start gap-2 bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                          <input
                            type="text"
                            value={item.text.fr}
                            onChange={(e) => updateListItem(section.id, item.id, 'fr', e.target.value)}
                            placeholder="Élément (Français)"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={item.text.ar}
                            onChange={(e) => updateListItem(section.id, item.id, 'ar', e.target.value)}
                            placeholder="عنصر (العربية)"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-right
                                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => deleteListItem(section.id, item.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-1"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(section.id)}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600
                               rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 
                               hover:text-purple-600 dark:hover:text-purple-400 transition text-sm flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      {isArabic ? 'إضافة عنصر' : 'Ajouter un élément'}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {content.sections.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {isArabic ? 'لا توجد أقسام. أضف قسمًا للبدء.' : 'Aucune section. Ajoutez une section pour commencer.'}
              </div>
            )}
          </div>
        </div>

        {/* Meta Description */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'وصف ميتا (SEO)' : 'Meta Description (SEO)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Français
              </label>
              <textarea
                value={content.metaDescription.fr}
                onChange={(e) => setContent({ ...content, metaDescription: { ...content.metaDescription, fr: e.target.value } })}
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Description courte pour les moteurs de recherche (max 160 caractères)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {content.metaDescription.fr.length}/160 caractères
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                العربية
              </label>
              <textarea
                value={content.metaDescription.ar}
                onChange={(e) => setContent({ ...content, metaDescription: { ...content.metaDescription, ar: e.target.value } })}
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-right
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="وصف قصير لمحركات البحث (أقصى 160 حرفاً)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {content.metaDescription.ar.length}/160 حرفاً
              </p>
            </div>
          </div>
        </div>

        {/* Publish Status */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={content.isPublished}
              onChange={(e) => setContent({ ...content, isPublished: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'نشر هذه الصفحة' : 'Publier cette page'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
