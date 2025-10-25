import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * useSiteSettings - Hook to manage site-wide settings
 * 
 * Manages settings like:
 * - School name (French & Arabic)
 * - Logo URL
 * - Contact information
 * - etc.
 * 
 * @returns {Object} { settings, loading, updateSettings, refreshSettings }
 */
const CACHE_KEY = 'siteSettings_cache';
const CACHE_TIMESTAMP_KEY = 'siteSettings_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useSiteSettings() {
  // Try to load cached settings from localStorage immediately
  const getCachedSettings = () => {
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
      console.warn('Failed to read cached settings:', error);
    }
    return null;
  };

  const cachedSettings = getCachedSettings();
  
  const [settings, setSettings] = useState(cachedSettings || {
    schoolNameFr: 'EduPlatform',
    schoolNameAr: 'منصة التعليم',
    logoUrl: '',
    phone: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(!cachedSettings); // If we have cache, we're not loading

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('⚙️ [useSiteSettings] Fetching site settings...');
      
      const settingsDoc = await getDoc(doc(db, 'siteSettings', 'general'));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings(data);
        
        // Cache the settings in localStorage
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
          console.warn('Failed to cache settings:', error);
        }
        
        console.log('✅ [useSiteSettings] Settings loaded:', data);
      } else {
        console.log('⚠️ [useSiteSettings] No settings found, using defaults');
        // Create default settings
        await setDoc(doc(db, 'siteSettings', 'general'), settings);
        console.log('✅ [useSiteSettings] Default settings created');
      }
    } catch (error) {
      console.error('❌ [useSiteSettings] Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      console.log('💾 [useSiteSettings] Updating settings:', newSettings);
      
      await setDoc(doc(db, 'siteSettings', 'general'), {
        ...newSettings,
        updatedAt: new Date().toISOString()
      });
      
      setSettings(newSettings);
      
      // Update cache immediately
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newSettings));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (error) {
        console.warn('Failed to update cache:', error);
      }
      
      console.log('✅ [useSiteSettings] Settings updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ [useSiteSettings] Error updating settings:', error);
      return { success: false, error };
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings
  };
}
