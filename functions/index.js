/**
 * Cloud Functions for Firebase
 * 
 * Professional Security: Set Custom Claims on User Creation/Update
 * This allows Storage Rules to check roles directly from the token (fast & secure)
 */

const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

/**
 * 🔥 TRIGGER: Firestore Document Change
 * Automatically sets custom claims when /users/{uid} is created or updated
 * 
 * Triggers on: Create, Update
 * Path: /users/{uid}
 * 
 * This ensures the user's role is ALWAYS in sync with their Firestore document
 */
exports.setUserClaims = onDocumentWritten('users/{uid}', async (event) => {
  const uid = event.params.uid;
  const data = event.data?.after?.data();
  
  // If document was deleted, remove all custom claims
  if (!data) {
    console.log(`User ${uid} deleted, removing custom claims`);
    try {
      await admin.auth().setCustomUserClaims(uid, {});
    } catch (error) {
      console.error(`Error removing claims for ${uid}:`, error);
    }
    return;
  }

  // Extract role and other important fields
  const role = data.role || 'student'; // Default to student
  const approved = data.approved === true;
  const status = data.status || 'pending';

  // Set custom claims
  const customClaims = {
    role: role,
    approved: approved,
    status: status
  };

  try {
    await admin.auth().setCustomUserClaims(uid, customClaims);
    console.log(`✅ Custom claims set for user ${uid}:`, customClaims);
  } catch (error) {
    console.error(`❌ Error setting custom claims for user ${uid}:`, error);
    throw error;
  }

  // Optional: Update Firestore to trigger token refresh on client
  // This is useful to let the client know they need to refresh their token
  try {
    await event.data.after.ref.update({
      claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.log('Could not update claimsUpdatedAt (non-critical):', error.message);
  }
});

/**
 * 🔥 CALLABLE FUNCTION: Manual Refresh Claims
 * Allows admins to manually refresh user claims
 * 
 * Usage from client:
 * const functions = getFunctions();
 * const refreshClaims = httpsCallable(functions, 'refreshUserClaims');
 * await refreshClaims({ uid: 'someUserId' });
 * 
 * @param {string} data.uid - The user ID to refresh claims for
 */
exports.refreshUserClaims = onCall(async (request) => {
  // Check if caller is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerUid = request.auth.uid;
  const targetUid = request.data.uid || callerUid; // Default to self

  try {
    // Check if caller is admin (only admins can refresh other users' claims)
    if (targetUid !== callerUid) {
      const callerToken = request.auth.token;
      if (callerToken.role !== 'admin') {
        throw new HttpsError(
          'permission-denied',
          'Only admins can refresh claims for other users'
        );
      }
    }

    // Get user document from Firestore
    const userDoc = await admin.firestore().collection('users').doc(targetUid).get();
    
    if (!userDoc.exists) {
      throw new HttpsError('not-found', `User ${targetUid} not found`);
    }

    const userData = userDoc.data();
    const role = userData.role || 'student';
    const approved = userData.approved === true;
    const status = userData.status || 'pending';

    // Set custom claims
    const customClaims = {
      role: role,
      approved: approved,
      status: status
    };

    await admin.auth().setCustomUserClaims(targetUid, customClaims);

    console.log(`✅ Claims refreshed for user ${targetUid}:`, customClaims);

    return {
      success: true,
      message: 'Claims refreshed successfully',
      claims: customClaims
    };
  } catch (error) {
    console.error(`❌ Error refreshing claims for ${targetUid}:`, error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * 🔥 CALLABLE FUNCTION: Get Current User Claims
 * Returns the current custom claims for the authenticated user
 * Useful for debugging
 */
exports.getMyCustomClaims = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const user = await admin.auth().getUser(request.auth.uid);
    return {
      success: true,
      claims: user.customClaims || {},
      uid: request.auth.uid
    };
  } catch (error) {
    console.error('Error getting custom claims:', error);
    throw new HttpsError('internal', error.message);
  }
});
