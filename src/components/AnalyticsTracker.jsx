import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * AnalyticsTracker Component
 * 
 * Tracks:
 * - Page views with timestamps
 * - Unique visitors (using localStorage)
 * - Total visits
 * - User activities (for logged-in users)
 * - Session duration
 * - Referrer information
 */
export default function AnalyticsTracker() {
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    trackPageView();
  }, [location.pathname, currentUser]);

  const getOrCreateVisitorId = () => {
    // Check if visitor already has an ID
    let visitorId = localStorage.getItem('visitorId');
    
    if (!visitorId) {
      // Generate new unique visitor ID
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitorId', visitorId);
      localStorage.setItem('firstVisit', new Date().toISOString());
    }
    
    return visitorId;
  };

  const getSessionId = () => {
    // Session ID expires after 30 minutes of inactivity
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    let sessionId = sessionStorage.getItem('sessionId');
    let sessionStart = sessionStorage.getItem('sessionStart');
    
    const now = Date.now();
    
    if (!sessionId || !sessionStart || (now - parseInt(sessionStart)) > SESSION_TIMEOUT) {
      // Create new session
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
      sessionStorage.setItem('sessionStart', now.toString());
    }
    
    return sessionId;
  };

  const getBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  };

  const trackPageView = async () => {
    try {
      const visitorId = getOrCreateVisitorId();
      const sessionId = getSessionId();
      const browserInfo = getBrowserInfo();
      
      const pageViewData = {
        // Visitor Information
        visitorId,
        sessionId,
        isNewVisitor: !localStorage.getItem('hasVisitedBefore'),
        
        // User Information (if logged in)
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,
        userRole: userProfile?.role || 'visitor',
        userName: userProfile?.fullName || 'Anonymous',
        
        // Page Information
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        fullUrl: window.location.href,
        
        // Referrer Information
        referrer: document.referrer || 'direct',
        
        // Browser & Device Information
        ...browserInfo,
        
        // Timing
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        time: new Date().toLocaleTimeString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        
        // Session Information
        sessionDuration: Date.now() - parseInt(sessionStorage.getItem('sessionStart') || Date.now())
      };

      // Save page view to analytics collection
      await addDoc(collection(db, 'analytics'), pageViewData);

      // Update visitor stats
      await updateVisitorStats(visitorId, currentUser?.uid);

      // Update daily stats
      await updateDailyStats(pageViewData.date);

      // Mark that visitor has been here before
      if (!localStorage.getItem('hasVisitedBefore')) {
        localStorage.setItem('hasVisitedBefore', 'true');
      }

      // Update last activity timestamp
      sessionStorage.setItem('lastActivity', Date.now().toString());

    } catch (error) {
      console.error('Error tracking page view:', error);
      // Don't show error to user - analytics should be silent
    }
  };

  const updateVisitorStats = async (visitorId, userId) => {
    try {
      const visitorRef = doc(db, 'visitorStats', visitorId);
      const visitorDoc = await getDoc(visitorRef);

      if (visitorDoc.exists()) {
        // Update existing visitor
        await updateDoc(visitorRef, {
          totalPageViews: increment(1),
          lastVisit: new Date().toISOString(),
          userId: userId || visitorDoc.data().userId
        });
      } else {
        // Create new visitor record
        await setDoc(visitorRef, {
          visitorId,
          userId: userId || null,
          firstVisit: new Date().toISOString(),
          lastVisit: new Date().toISOString(),
          totalPageViews: 1,
          isReturningVisitor: localStorage.getItem('hasVisitedBefore') === 'true'
        });
      }
    } catch (error) {
      console.error('Error updating visitor stats:', error);
    }
  };

  const updateDailyStats = async (date) => {
    try {
      const dailyRef = doc(db, 'dailyStats', date);
      const dailyDoc = await getDoc(dailyRef);

      if (dailyDoc.exists()) {
        await updateDoc(dailyRef, {
          totalViews: increment(1),
          uniqueVisitors: increment(localStorage.getItem('hasVisitedBefore') === 'true' ? 0 : 1)
        });
      } else {
        await setDoc(dailyRef, {
          date,
          totalViews: 1,
          uniqueVisitors: localStorage.getItem('hasVisitedBefore') === 'true' ? 0 : 1,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  };

  // This component doesn't render anything
  return null;
}
