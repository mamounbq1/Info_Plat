/**
 * Token Refresh Utility
 * 
 * Forces Firebase to reload the user's ID token to get updated custom claims
 */

import { auth } from '../config/firebase';

/**
 * Force refresh the current user's ID token
 * This is necessary after custom claims are updated on the backend
 * 
 * @returns {Promise<string>} The new ID token
 */
export const forceRefreshToken = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  try {
    // Force refresh the ID token (don't use cached version)
    const newToken = await user.getIdToken(true);
    console.log('✅ Token refreshed successfully');
    return newToken;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    throw error;
  }
};

/**
 * Get the current user's custom claims
 * 
 * @param {boolean} forceRefresh - Whether to force refresh the token first
 * @returns {Promise<object>} The custom claims object
 */
export const getCustomClaims = async (forceRefresh = false) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  try {
    const idTokenResult = await user.getIdTokenResult(forceRefresh);
    return idTokenResult.claims;
  } catch (error) {
    console.error('❌ Error getting custom claims:', error);
    throw error;
  }
};

/**
 * Check if the current user has a specific role
 * 
 * @param {string} role - The role to check for ('admin', 'teacher', 'student')
 * @param {boolean} forceRefresh - Whether to force refresh the token first
 * @returns {Promise<boolean>} True if user has the role
 */
export const hasRole = async (role, forceRefresh = false) => {
  try {
    const claims = await getCustomClaims(forceRefresh);
    return claims.role === role;
  } catch (error) {
    console.error('❌ Error checking role:', error);
    return false;
  }
};

/**
 * Check if the current user is approved
 * 
 * @param {boolean} forceRefresh - Whether to force refresh the token first
 * @returns {Promise<boolean>} True if user is approved
 */
export const isApproved = async (forceRefresh = false) => {
  try {
    const claims = await getCustomClaims(forceRefresh);
    return claims.approved === true;
  } catch (error) {
    console.error('❌ Error checking approval status:', error);
    return false;
  }
};

/**
 * Wait for custom claims to be set (polling mechanism)
 * Useful after user creation/update to wait for Cloud Function to set claims
 * 
 * @param {number} maxAttempts - Maximum number of attempts (default: 10)
 * @param {number} delayMs - Delay between attempts in milliseconds (default: 1000)
 * @returns {Promise<object>} The custom claims object
 */
export const waitForClaims = async (maxAttempts = 10, delayMs = 1000) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Force refresh to get latest claims
      const idTokenResult = await user.getIdTokenResult(true);
      const claims = idTokenResult.claims;
      
      // Check if custom claims are set (has 'role' property)
      if (claims.role) {
        console.log(`✅ Custom claims found after ${i + 1} attempt(s):`, claims);
        return claims;
      }
      
      console.log(`⏳ Waiting for custom claims... (attempt ${i + 1}/${maxAttempts})`);
      
      // Wait before next attempt
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`❌ Error on attempt ${i + 1}:`, error);
    }
  }
  
  throw new Error(`Custom claims not set after ${maxAttempts} attempts`);
};
