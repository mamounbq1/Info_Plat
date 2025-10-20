import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * useHomeContent - Hook personnalisé pour charger le contenu dynamique de la page d'accueil
 * 
 * 📍 Utilisé par: LandingPage.jsx (page d'accueil officielle)
 * 🎯 Objectif: Charger le contenu depuis Firestore géré par Admin Dashboard → Homepage
 * 
 * Collections Firestore chargées:
 * - homepage/hero: Titre, sous-titre, boutons de la section hero
 * - homepage/stats: 4 statistiques (étudiants, professeurs, taux de réussite, années)
 * - homepage-features: Fonctionnalités du lycée avec icônes
 * - homepage-news: Actualités/annonces (3 plus récentes)
 * - homepage-testimonials: Témoignages d'étudiants (3 maximum)
 * - homepage-announcements: Annonces avec badge urgent ✨ NOUVEAU
 * - homepage-clubs: Clubs du lycée avec emojis et couleurs ✨ NOUVEAU
 * - homepage-gallery: Images de la galerie photos ✨ NOUVEAU
 * - homepage-quicklinks: Liens rapides dans la sidebar ✨ NOUVEAU
 * - homepage/contact: Informations de contact (adresse, téléphone, email, horaires) ✨ NOUVEAU
 * 
 * Fonctionnalités:
 * - ✅ Chargement automatique au montage du composant
 * - ✅ Système de fallback pour requêtes sans index Firestore
 * - ✅ Gestion d'erreurs avec logs détaillés
 * - ✅ Support complet bilinguisme FR/AR
 * - ✅ Fonction refresh() pour recharger manuellement
 * 
 * @returns {Object} { heroContent, features, news, testimonials, stats, announcements, clubs, gallery, quickLinks, contactInfo, loading, refresh }
 */
export function useHomeContent() {
  const [heroContent, setHeroContent] = useState(null);
  const [features, setFeatures] = useState([]);
  const [news, setNews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
  
  // ✨ NOUVEAU: États pour les 5 nouvelles sections
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      setLoading(true);
      console.log('🏠 [useHomeContent] Starting to fetch homepage content...');
      
      // Fetch hero content
      try {
        const heroDoc = await getDoc(doc(db, 'homepage', 'hero'));
        console.log('🎯 [Hero] Document exists:', heroDoc.exists());
        if (heroDoc.exists() && heroDoc.data().enabled) {
          setHeroContent(heroDoc.data());
          console.log('✅ [Hero] Content loaded and enabled');
        } else {
          console.log('⚠️ [Hero] No hero content or disabled, using defaults');
        }
      } catch (error) {
        console.log('⚠️ [Hero] Error:', error.message);
      }

      // Fetch features with fallback for missing index
      try {
        const featuresQuery = query(
          collection(db, 'homepage-features'),
          where('enabled', '==', true),
          orderBy('order', 'asc')
        );
        const featuresSnapshot = await getDocs(featuresQuery);
        const featuresData = featuresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeatures(featuresData);
        console.log(`✅ [Features] Loaded ${featuresData.length} features with index`);
      } catch (error) {
        console.log('⚠️ [Features] Index not found, using fallback query');
        try {
          // Fallback: fetch all and filter/sort locally
          const allFeaturesSnapshot = await getDocs(collection(db, 'homepage-features'));
          const featuresData = allFeaturesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(f => f.enabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setFeatures(featuresData);
          console.log(`✅ [Features] Loaded ${featuresData.length} features with fallback`);
        } catch (fallbackError) {
          console.log('❌ [Features] Fallback failed:', fallbackError.message);
        }
      }

      // Fetch news with fallback for missing index
      try {
        const newsQuery = query(
          collection(db, 'homepage-news'),
          where('enabled', '==', true),
          orderBy('publishDate', 'desc'),
          limit(3)
        );
        const newsSnapshot = await getDocs(newsQuery);
        const newsData = newsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNews(newsData);
        console.log(`✅ [News] Loaded ${newsData.length} news items with index`);
      } catch (error) {
        console.log('⚠️ [News] Index not found, using fallback query');
        try {
          // Fallback: fetch all and filter/sort locally
          const allNewsSnapshot = await getDocs(collection(db, 'homepage-news'));
          const newsData = allNewsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(n => n.enabled)
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
            .slice(0, 3);
          setNews(newsData);
          console.log(`✅ [News] Loaded ${newsData.length} news items with fallback`);
        } catch (fallbackError) {
          console.log('❌ [News] Fallback failed:', fallbackError.message);
        }
      }

      // Fetch testimonials with fallback
      try {
        const testimonialsQuery = query(
          collection(db, 'homepage-testimonials'),
          where('enabled', '==', true),
          limit(3)
        );
        const testimonialsSnapshot = await getDocs(testimonialsQuery);
        const testimonialsData = testimonialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTestimonials(testimonialsData);
        console.log(`✅ [Testimonials] Loaded ${testimonialsData.length} testimonials`);
      } catch (error) {
        console.log('⚠️ [Testimonials] Error, using fallback query');
        try {
          // Fallback: fetch all and filter locally
          const allTestimonialsSnapshot = await getDocs(collection(db, 'homepage-testimonials'));
          const testimonialsData = allTestimonialsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(t => t.enabled)
            .slice(0, 3);
          setTestimonials(testimonialsData);
          console.log(`✅ [Testimonials] Loaded ${testimonialsData.length} with fallback`);
        } catch (fallbackError) {
          console.log('❌ [Testimonials] Fallback failed:', fallbackError.message);
        }
      }

      // Fetch stats
      try {
        const statsDoc = await getDoc(doc(db, 'homepage', 'stats'));
        console.log('📊 [Stats] Document exists:', statsDoc.exists());
        if (statsDoc.exists()) {
          setStats(statsDoc.data());
          console.log('✅ [Stats] Stats loaded');
        } else {
          console.log('⚠️ [Stats] No stats document found');
        }
      } catch (error) {
        console.log('❌ [Stats] Error:', error.message);
      }

      // ✨ NOUVEAU: Fetch Announcements (Annonces)
      try {
        const announcementsQuery = query(
          collection(db, 'homepage-announcements'),
          where('enabled', '==', true),
          orderBy('order', 'asc')
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const announcementsData = announcementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnnouncements(announcementsData);
        console.log(`✅ [Announcements] Loaded ${announcementsData.length} announcements with index`);
      } catch (error) {
        console.log('⚠️ [Announcements] Index not found, using fallback query');
        try {
          const allAnnouncementsSnapshot = await getDocs(collection(db, 'homepage-announcements'));
          const announcementsData = allAnnouncementsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(a => a.enabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setAnnouncements(announcementsData);
          console.log(`✅ [Announcements] Loaded ${announcementsData.length} with fallback`);
        } catch (fallbackError) {
          console.log('❌ [Announcements] Fallback failed:', fallbackError.message);
        }
      }

      // ✨ NOUVEAU: Fetch Clubs
      try {
        const clubsQuery = query(
          collection(db, 'homepage-clubs'),
          where('enabled', '==', true),
          orderBy('order', 'asc')
        );
        const clubsSnapshot = await getDocs(clubsQuery);
        const clubsData = clubsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClubs(clubsData);
        console.log(`✅ [Clubs] Loaded ${clubsData.length} clubs with index`);
      } catch (error) {
        console.log('⚠️ [Clubs] Index not found, using fallback query');
        try {
          const allClubsSnapshot = await getDocs(collection(db, 'homepage-clubs'));
          const clubsData = allClubsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(c => c.enabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setClubs(clubsData);
          console.log(`✅ [Clubs] Loaded ${clubsData.length} with fallback`);
        } catch (fallbackError) {
          console.log('❌ [Clubs] Fallback failed:', fallbackError.message);
        }
      }

      // ✨ NOUVEAU: Fetch Gallery
      try {
        const galleryQuery = query(
          collection(db, 'homepage-gallery'),
          where('enabled', '==', true),
          orderBy('order', 'asc')
        );
        const gallerySnapshot = await getDocs(galleryQuery);
        const galleryData = gallerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGallery(galleryData);
        console.log(`✅ [Gallery] Loaded ${galleryData.length} images with index`);
      } catch (error) {
        console.log('⚠️ [Gallery] Index not found, using fallback query');
        try {
          const allGallerySnapshot = await getDocs(collection(db, 'homepage-gallery'));
          const galleryData = allGallerySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(g => g.enabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setGallery(galleryData);
          console.log(`✅ [Gallery] Loaded ${galleryData.length} with fallback`);
        } catch (fallbackError) {
          console.log('❌ [Gallery] Fallback failed:', fallbackError.message);
        }
      }

      // ✨ NOUVEAU: Fetch Quick Links
      try {
        const quickLinksQuery = query(
          collection(db, 'homepage-quicklinks'),
          where('enabled', '==', true),
          orderBy('order', 'asc')
        );
        const quickLinksSnapshot = await getDocs(quickLinksQuery);
        const quickLinksData = quickLinksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuickLinks(quickLinksData);
        console.log(`✅ [QuickLinks] Loaded ${quickLinksData.length} links with index`);
      } catch (error) {
        console.log('⚠️ [QuickLinks] Index not found, using fallback query');
        try {
          const allQuickLinksSnapshot = await getDocs(collection(db, 'homepage-quicklinks'));
          const quickLinksData = allQuickLinksSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(q => q.enabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setQuickLinks(quickLinksData);
          console.log(`✅ [QuickLinks] Loaded ${quickLinksData.length} with fallback`);
        } catch (fallbackError) {
          console.log('❌ [QuickLinks] Fallback failed:', fallbackError.message);
        }
      }

      // ✨ NOUVEAU: Fetch Contact Info
      try {
        const contactDoc = await getDoc(doc(db, 'homepage', 'contact'));
        console.log('📞 [Contact] Document exists:', contactDoc.exists());
        if (contactDoc.exists()) {
          setContactInfo(contactDoc.data());
          console.log('✅ [Contact] Contact info loaded');
        } else {
          console.log('⚠️ [Contact] No contact info found');
        }
      } catch (error) {
        console.log('❌ [Contact] Error:', error.message);
      }
      
      console.log('🏁 [useHomeContent] Finished loading all homepage content (10 sections)');
    } catch (error) {
      console.error('❌ [useHomeContent] Error fetching home content:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    heroContent,
    features,
    news,
    testimonials,
    stats,
    // ✨ NOUVEAU: Retourner les 5 nouvelles sections
    announcements,
    clubs,
    gallery,
    quickLinks,
    contactInfo,
    loading,
    refresh: fetchHomeContent
  };
}
