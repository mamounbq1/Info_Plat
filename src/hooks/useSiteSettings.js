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
export function useSiteSettings() {
  const [settings, setSettings] = useState({
    schoolNameFr: 'EduPlatform',
    schoolNameAr: 'منصة التعليم',
    logoUrl: '',
    phone: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);

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
