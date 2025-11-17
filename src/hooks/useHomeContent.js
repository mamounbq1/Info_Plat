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
 * - homepage/about: Contenu de la section "À propos" ✨ NOUVEAU
 * - homepage/section-visibility: Paramètres de visibilité et ordre des sections ✨ NOUVEAU
 * 
 * Fonctionnalités:
 * - ✅ Chargement automatique au montage du composant
 * - ✅ Système de fallback pour requêtes sans index Firestore
 * - ✅ Gestion d'erreurs avec logs détaillés
 * - ✅ Support complet bilinguisme FR/AR
 * - ✅ Fonction refresh() pour recharger manuellement
 * - ✅ Gestion de la visibilité et de l'ordre des sections (enable/disable, reorder)
 * 
 * @returns {Object} { heroContent, features, news, testimonials, stats, announcements, clubs, gallery, quickLinks, contactInfo, aboutContent, sectionVisibility, loading, refresh }
 */
const CACHE_KEY = 'homeContent_cache';
const CACHE_TIMESTAMP_KEY = 'homeContent_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useHomeContent() {
  // Try to load cached content immediately
  const getCachedContent = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.warn('Failed to read cached home content:', error);
    }
    return null;
  };

  const cachedContent = getCachedContent();
  
  const [heroContent, setHeroContent] = useState(cachedContent?.heroContent || null);
  const [features, setFeatures] = useState(cachedContent?.features || []);
  const [news, setNews] = useState(cachedContent?.news || []);
  const [testimonials, setTestimonials] = useState(cachedContent?.testimonials || []);
  const [stats, setStats] = useState(cachedContent?.stats || null);
  
  // ✨ NOUVEAU: États pour les nouvelles sections
  const [announcements, setAnnouncements] = useState(cachedContent?.announcements || []);
  const [events, setEvents] = useState(cachedContent?.events || []);
  const [clubs, setClubs] = useState(cachedContent?.clubs || []);
  const [gallery, setGallery] = useState(cachedContent?.gallery || []);
  const [quickLinks, setQuickLinks] = useState(cachedContent?.quickLinks || []);
  const [contactInfo, setContactInfo] = useState(cachedContent?.contactInfo || null);
  
  // ✨ NOUVEAU: État pour la section About
  const [aboutContent, setAboutContent] = useState(cachedContent?.aboutContent || null);
  
  // ✨ NOUVEAU: État pour le footer
  const [footerContent, setFooterContent] = useState(cachedContent?.footerContent || null);
  
  // ✨ NOUVEAU: État pour la visibilité des sections
  const [sectionVisibility, setSectionVisibility] = useState(cachedContent?.sectionVisibility || []);
  
  const [loading, setLoading] = useState(!cachedContent); // If we have cache, we're not loading

  useEffect(() => {
    fetchHomeContent();
  }, []);

  // Cache content whenever it changes
  useEffect(() => {
    if (!loading && heroContent) {
      try {
        const contentToCache = {
          heroContent,
          features,
          news,
          testimonials,
          stats,
          announcements,
          events,
          clubs,
          gallery,
          quickLinks,
          contactInfo,
          aboutContent,
          footerContent,
          sectionVisibility
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(contentToCache));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (error) {
        console.warn('Failed to cache home content:', error);
      }
    }
  }, [heroContent, features, news, testimonials, stats, announcements, events, clubs, gallery, quickLinks, contactInfo, aboutContent, footerContent, sectionVisibility, loading]);

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
          const statsData = statsDoc.data();
          // Convert object {stats0, stats1, stats2, stats3} to array
          const statsArray = Object.keys(statsData)
            .filter(key => key.startsWith('stats'))
            .sort() // stats0, stats1, stats2, stats3
            .map(key => statsData[key]);
          setStats(statsArray);
          console.log(`✅ [Stats] Loaded ${statsArray.length} stats`);
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

      // ✨ NOUVEAU: Fetch Events
      try {
        const eventsQuery = query(
          collection(db, 'homepage-events'),
          where('enabled', '==', true),
          orderBy('order', 'asc')
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);
        console.log(`✅ [Events] Loaded ${eventsData.length} events with index`);
      } catch (error) {
        console.log('⚠️ [Events] Index not found, using fallback query');
        try {
          const allEventsSnapshot = await getDocs(collection(db, 'homepage-events'));
          const eventsData = allEventsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(e => e.enabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setEvents(eventsData);
          console.log(`✅ [Events] Loaded ${eventsData.length} with fallback`);
        } catch (fallbackError) {
          console.log('❌ [Events] Fallback failed:', fallbackError.message);
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

      // ✨ NOUVEAU: Fetch About Content
      try {
        const aboutDoc = await getDoc(doc(db, 'homepage', 'about'));
        console.log('ℹ️ [About] Document exists:', aboutDoc.exists());
        if (aboutDoc.exists() && aboutDoc.data().enabled) {
          setAboutContent(aboutDoc.data());
          console.log('✅ [About] About content loaded and enabled');
        } else {
          console.log('⚠️ [About] No about content or disabled, using defaults');
        }
      } catch (error) {
        console.log('❌ [About] Error:', error.message);
      }

      // ✨ NOUVEAU: Fetch Footer Content
      try {
        const footerDoc = await getDoc(doc(db, 'homepage', 'footer'));
        console.log('👟 [Footer] Document exists:', footerDoc.exists());
        if (footerDoc.exists()) {
          setFooterContent(footerDoc.data());
          console.log('✅ [Footer] Footer content loaded');
        } else {
          console.log('⚠️ [Footer] No footer content found, using defaults');
        }
      } catch (error) {
        console.log('❌ [Footer] Error:', error.message);
      }

      // ✨ NOUVEAU: Fetch Section Visibility Settings
      try {
        const visibilityDoc = await getDoc(doc(db, 'homepage', 'section-visibility'));
        console.log('👁️ [Visibility] Document exists:', visibilityDoc.exists());
        if (visibilityDoc.exists() && visibilityDoc.data().sections) {
          const sections = visibilityDoc.data().sections;
          // Sort sections by order
          const sortedSections = sections.sort((a, b) => (a.order || 0) - (b.order || 0));
          setSectionVisibility(sortedSections);
          console.log('✅ [Visibility] Loaded section visibility settings:', sortedSections.length, 'sections');
        } else {
          console.log('⚠️ [Visibility] No section visibility settings found, using defaults (all enabled)');
          // Set default visibility (all enabled)
          setSectionVisibility([
            { id: 'hero', enabled: true, order: 1 },
            { id: 'announcements', enabled: true, order: 2 },
            { id: 'stats', enabled: true, order: 3 },
            { id: 'about', enabled: true, order: 4 },
            { id: 'news', enabled: true, order: 5 },
            { id: 'clubs', enabled: true, order: 6 },
            { id: 'gallery', enabled: true, order: 7 },
            { id: 'testimonials', enabled: true, order: 8 },
            { id: 'quicklinks', enabled: true, order: 9 },
            { id: 'contact', enabled: true, order: 10 },
          ]);
        }
      } catch (error) {
        console.log('❌ [Visibility] Error:', error.message);
        // Fallback to all enabled
        setSectionVisibility([
          { id: 'hero', enabled: true, order: 1 },
          { id: 'announcements', enabled: true, order: 2 },
          { id: 'stats', enabled: true, order: 3 },
          { id: 'about', enabled: true, order: 4 },
          { id: 'news', enabled: true, order: 5 },
          { id: 'clubs', enabled: true, order: 6 },
          { id: 'gallery', enabled: true, order: 7 },
          { id: 'testimonials', enabled: true, order: 8 },
          { id: 'quicklinks', enabled: true, order: 9 },
          { id: 'contact', enabled: true, order: 10 },
        ]);
      }
      
      console.log('🏁 [useHomeContent] Finished loading all homepage content (11 sections + visibility settings)');
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
    // ✨ NOUVEAU: Retourner les nouvelles sections
    announcements,
    events,
    clubs,
    gallery,
    quickLinks,
    contactInfo,
    aboutContent,
    footerContent,
    // ✨ NOUVEAU: Retourner les paramètres de visibilité
    sectionVisibility,
    loading,
    refresh: fetchHomeContent
  };
}
