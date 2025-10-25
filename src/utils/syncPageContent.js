/**
 * syncPageContent.js - Utilitaire pour synchroniser le contenu entre les anciennes collections et pageContents
 * 
 * Ce module fournit des fonctions pour:
 * 1. Lire le contenu depuis les collections existantes (homepage, homepage-*)
 * 2. Le convertir au format pageContents
 * 3. Gérer la lecture avec fallback automatique
 */

import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Récupère le contenu d'une page avec fallback automatique
 * Essaie d'abord pageContents, puis les anciennes collections
 * 
 * @param {string} pageId - ID de la page (ex: 'about', 'contact')
 * @param {string} fallbackCollection - Collection de fallback (ex: 'homepage')
 * @param {string} fallbackDoc - Document de fallback (ex: 'about')
 * @returns {Object|null} Contenu de la page ou null
 */
export async function getPageContent(pageId, fallbackCollection = null, fallbackDoc = null) {
  try {
    // 1. Essayer pageContents d'abord (nouveau système CMS)
    const pageDocRef = doc(db, 'pageContents', pageId);
    const pageSnapshot = await getDoc(pageDocRef);
    
    if (pageSnapshot.exists() && pageSnapshot.data().isPublished) {
      console.log(`✅ [PageContent] Loaded '${pageId}' from pageContents (CMS)`);
      return {
        source: 'cms',
        data: pageSnapshot.data()
      };
    }

    // 2. Fallback: essayer l'ancienne collection
    if (fallbackCollection && fallbackDoc) {
      const fallbackDocRef = doc(db, fallbackCollection, fallbackDoc);
      const fallbackSnapshot = await getDoc(fallbackDocRef);
      
      if (fallbackSnapshot.exists()) {
        console.log(`⚠️ [PageContent] Loaded '${pageId}' from legacy (${fallbackCollection}/${fallbackDoc})`);
        return {
          source: 'legacy',
          data: fallbackSnapshot.data()
        };
      }
    }

    console.log(`❌ [PageContent] No content found for '${pageId}'`);
    return null;
  } catch (error) {
    console.error(`❌ [PageContent] Error loading '${pageId}':`, error);
    return null;
  }
}

/**
 * Récupère une collection avec fallback
 * 
 * @param {string} cmsCollection - Collection CMS (ex: 'pageContents')
 * @param {string} legacyCollection - Collection legacy (ex: 'homepage-news')
 * @param {Object} queryOptions - Options de requête (where, orderBy, limit)
 * @returns {Array} Tableau de documents
 */
export async function getCollectionContent(cmsCollection, legacyCollection, queryOptions = {}) {
  try {
    // 1. Essayer la collection CMS d'abord
    let q = collection(db, cmsCollection);
    
    if (queryOptions.where) {
      q = query(q, where(queryOptions.where.field, queryOptions.where.op, queryOptions.where.value));
    }
    if (queryOptions.orderBy) {
      q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction));
    }
    if (queryOptions.limit) {
      q = query(q, limit(queryOptions.limit));
    }

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (data.length > 0) {
      console.log(`✅ [CollectionContent] Loaded ${data.length} items from CMS (${cmsCollection})`);
      return {
        source: 'cms',
        data
      };
    }

    // 2. Fallback: collection legacy
    const legacySnapshot = await getDocs(collection(db, legacyCollection));
    const legacyData = legacySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`⚠️ [CollectionContent] Loaded ${legacyData.length} items from legacy (${legacyCollection})`);
    return {
      source: 'legacy',
      data: legacyData
    };
  } catch (error) {
    console.error(`❌ [CollectionContent] Error loading collection:`, error);
    return {
      source: 'error',
      data: []
    };
  }
}

/**
 * Convertit le contenu About depuis le format legacy vers le format CMS
 */
export function convertAboutContentToCMS(legacyData) {
  if (!legacyData) return null;

  return {
    hero: {
      title: legacyData.title || { fr: '', ar: '' },
      subtitle: legacyData.subtitle || { fr: '', ar: '' },
      imageUrl: legacyData.imageUrl || ''
    },
    mission: {
      title: { fr: 'Notre Mission', ar: 'مهمتنا' },
      content: legacyData.description || { fr: '', ar: '' }
    },
    vision: {
      title: { fr: 'Notre Vision', ar: 'رؤيتنا' },
      content: { fr: '', ar: '' }
    },
    values: {
      title: { fr: 'Nos Valeurs', ar: 'قيمنا' },
      items: []
    },
    isPublished: legacyData.enabled || true
  };
}

/**
 * Convertit le contenu Contact depuis le format legacy vers le format CMS
 */
export function convertContactContentToCMS(legacyData) {
  if (!legacyData) return null;

  return {
    title: { fr: 'Contactez-nous', ar: 'اتصل بنا' },
    subtitle: { fr: 'Nous sommes à votre écoute', ar: 'نحن في خدمتكم' },
    sections: [
      {
        id: 'address',
        type: 'text',
        heading: { fr: 'Adresse', ar: 'العنوان' },
        content: {
          fr: legacyData.address?.fr || '',
          ar: legacyData.address?.ar || ''
        }
      },
      {
        id: 'phone',
        type: 'text',
        heading: { fr: 'Téléphone', ar: 'الهاتف' },
        content: {
          fr: legacyData.phone || '',
          ar: legacyData.phone || ''
        }
      },
      {
        id: 'email',
        type: 'text',
        heading: { fr: 'Email', ar: 'البريد الإلكتروني' },
        content: {
          fr: legacyData.email || '',
          ar: legacyData.email || ''
        }
      }
    ],
    isPublished: true
  };
}

/**
 * Hook personnalisé pour récupérer le contenu d'une page avec fallback automatique
 */
export function usePageContentWithFallback(pageId, fallbackCollection, fallbackDoc) {
  const [content, setContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState(null);

  React.useEffect(() => {
    async function loadContent() {
      setLoading(true);
      const result = await getPageContent(pageId, fallbackCollection, fallbackDoc);
      if (result) {
        setContent(result.data);
        setSource(result.source);
      }
      setLoading(false);
    }

    loadContent();
  }, [pageId, fallbackCollection, fallbackDoc]);

  return { content, loading, source };
}

export default {
  getPageContent,
  getCollectionContent,
  convertAboutContentToCMS,
  convertContactContentToCMS
};
