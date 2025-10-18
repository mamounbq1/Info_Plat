import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Custom hook to fetch dynamic homepage content from Firestore
 * Used by LandingPage to display admin-controlled content
 */
export function useHomeContent() {
  const [heroContent, setHeroContent] = useState(null);
  const [features, setFeatures] = useState([]);
  const [news, setNews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
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
      
      console.log('🏁 [useHomeContent] Finished loading all homepage content');
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
    loading,
    refresh: fetchHomeContent
  };
}
