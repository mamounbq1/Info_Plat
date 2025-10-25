/**
 * CMSPageRenderer - Composant pour afficher le contenu géré par le CMS
 * 
 * Ce composant:
 * 1. Récupère le contenu depuis pageContents
 * 2. Affiche les sections selon leur type (text, image, list)
 * 3. Supporte le bilinguisme (FR/AR)
 * 4. Gère le dark mode
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import SharedLayout from './SharedLayout';

export default function CMSPageRenderer({ 
  pageId, 
  defaultTitle,
  defaultSubtitle,
  fallbackContent = null,
  showBackButton = true 
}) {
  const { isArabic } = useLanguage();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [pageId]);

  const loadContent = async () => {
    setLoading(true);
    try {
      // Essayer de charger depuis pageContents
      const pageDocRef = doc(db, 'pageContents', pageId);
      const pageSnapshot = await getDoc(pageDocRef);
      
      if (pageSnapshot.exists() && pageSnapshot.data().isPublished) {
        setContent(pageSnapshot.data());
        console.log(`✅ [CMSPageRenderer] Loaded '${pageId}' from CMS`);
      } else if (fallbackContent) {
        setContent(fallbackContent);
        console.log(`⚠️ [CMSPageRenderer] Using fallback content for '${pageId}'`);
      } else {
        // Créer un contenu par défaut minimal
        setContent({
          title: defaultTitle || { fr: 'Page', ar: 'صفحة' },
          subtitle: defaultSubtitle || { fr: '', ar: '' },
          sections: [],
          isPublished: false
        });
        console.log(`⚠️ [CMSPageRenderer] Using default content for '${pageId}'`);
      }
    } catch (error) {
      console.error(`❌ [CMSPageRenderer] Error loading '${pageId}':`, error);
      setContent({
        title: defaultTitle || { fr: 'Erreur', ar: 'خطأ' },
        subtitle: { fr: 'Impossible de charger le contenu', ar: 'تعذر تحميل المحتوى' },
        sections: [],
        isPublished: false
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section, index) => {
    switch (section.type) {
      case 'text':
        return (
          <div key={section.id || index} className="mb-8">
            {section.heading && (section.heading.fr || section.heading.ar) && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? section.heading.ar : section.heading.fr}
              </h2>
            )}
            {section.content && (section.content.fr || section.content.ar) && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {isArabic ? section.content.ar : section.content.fr}
                </p>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div key={section.id || index} className="mb-8">
            {section.heading && (section.heading.fr || section.heading.ar) && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? section.heading.ar : section.heading.fr}
              </h2>
            )}
            {section.imageUrl && (
              <img
                src={section.imageUrl}
                alt={section.alt ? (isArabic ? section.alt.ar : section.alt.fr) : ''}
                className="w-full rounded-lg shadow-lg"
              />
            )}
          </div>
        );

      case 'list':
        return (
          <div key={section.id || index} className="mb-8">
            {section.heading && (section.heading.fr || section.heading.ar) && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? section.heading.ar : section.heading.fr}
              </h2>
            )}
            {section.items && section.items.length > 0 && (
              <ul className="list-disc list-inside space-y-2">
                {section.items.map((item, idx) => (
                  <li key={item.id || idx} className="text-gray-700 dark:text-gray-300">
                    {isArabic ? item.text.ar : item.text.fr}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4">
            {showBackButton && (
              <button
                onClick={() => window.history.back()}
                className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {isArabic ? 'رجوع' : 'Retour'}
              </button>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {content.title ? (isArabic ? content.title.ar : content.title.fr) : (isArabic ? defaultTitle?.ar : defaultTitle?.fr)}
            </h1>
            
            {content.subtitle && (content.subtitle.fr || content.subtitle.ar) && (
              <p className="text-xl text-purple-100">
                {isArabic ? content.subtitle.ar : content.subtitle.fr}
              </p>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {content.sections && content.sections.length > 0 ? (
              content.sections.map((section, index) => renderSection(section, index))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'لا يوجد محتوى' : 'Aucun contenu'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isArabic 
                    ? 'سيتم إضافة المحتوى قريباً من قبل المسؤولين'
                    : 'Le contenu sera ajouté prochainement par les administrateurs'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Meta Description (for SEO) */}
        {content.metaDescription && content.metaDescription.fr && (
          <div className="hidden">
            {isArabic ? content.metaDescription.ar : content.metaDescription.fr}
          </div>
        )}
      </div>
    </SharedLayout>
  );
}
