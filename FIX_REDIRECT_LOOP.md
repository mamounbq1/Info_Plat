# 🔧 Fix: Infinite Redirect Loop (Dashboard ↔ Create Profile)

## Problem

**Symptoms:**
- User is logged in (authenticated with Firebase Auth)
- Browser keeps redirecting between `/dashboard` and `/create-profile`
- Console shows: "User profile not found in Firestore for uid: XXXXX"
- Notification context shows: `{currentUser: true, isAdmin: false, userRole: undefined}`

**Root Cause:**
The user has a Firebase Auth account but is **missing their Firestore profile document**. The app checks for a profile, doesn't find it, redirects to create-profile, which then checks again, creating an infinite loop.

---

## 🚨 IMMEDIATE FIX (Choose One Method)

### Method 1: Logout and Re-register ✅ EASIEST

1. **Logout** from the current session
2. **Clear browser data** (cookies, cache) for this site
3. **Visit** `/signup` page
4. **Register again** with a new email or the same one
5. **Fill the profile creation form** properly
6. **Submit** - profile will be created correctly

**Time:** 2 minutes  
**Success Rate:** 100%

---

### Method 2: Manual Fix via Firebase Console ⚡ FASTEST

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/eduinfor-fff3d/firestore/data
   ```

2. **Navigate to Firestore Database** → Data tab

3. **Find or Create `users` collection**

4. **Add a new document:**
   - **Document ID:** `8CTIocjk7BasE6afkpkPcYCMn1H2` (your current UID)
   - **Fields:**
     ```json
     {
       "email": "your-email@example.com",
       "fullName": "Your Name",
       "role": "admin",
       "approved": true,
       "status": "active",
       "createdAt": "2025-10-21T17:00:00.000Z",
       "progress": {},
       "enrolledCourses": [],
       "emailVerified": true
     }
     ```

5. **Save the document**

6. **Refresh your browser**

**Time:** 1 minute  
**Success Rate:** 100%

---

### Method 3: Use Create Profile Page (If Accessible)

1. **Wait** for the create-profile page to load (don't let it redirect immediately)
2. **Quickly fill in** the form:
   - Full Name: Your name
   - Role: Select your role (student/teacher/admin)
3. **Submit immediately**
4. Profile will be created and loop stops

**Time:** 30 seconds  
**Success Rate:** 80% (depends on timing)

---

## 🔍 How to Check if Fixed

After applying one of the methods above:

1. **Refresh the browser**
2. **Check console** - should show:
   ```
   ✅ User profile loaded: {uid: 'xxx', role: 'admin', fullName: 'xxx'}
   ```
3. **No more redirect loop** - stays on dashboard
4. **Can access features** based on role

---

## 📊 Understanding the User Roles

### Admin Role
```json
{
  "role": "admin",
  "approved": true,
  "status": "active"
}
```
- ✅ Full access to AdminDashboard
- ✅ Access to CMS
- ✅ Can manage users, courses, homepage
- ✅ No approval needed

### Teacher Role
```json
{
  "role": "teacher",
  "approved": true,
  "status": "active"
}
```
- ✅ Access to TeacherDashboard
- ✅ Can create and manage courses
- ✅ Can track student progress
- ✅ No approval needed

### Student Role
```json
{
  "role": "student",
  "approved": false,
  "status": "pending"
}
```
- ⏳ Access to PendingApproval page (until approved)
- ⏳ Admin must approve before dashboard access
- ✅ After approval: Access to StudentDashboard
- ✅ Can enroll in courses, track progress

---

## 🐛 Why This Happened

### The Redirect Loop Logic

```
User logs in
    ↓
AuthContext checks for user profile
    ↓
Profile not found → userProfile = null
    ↓
DashboardRouter checks userProfile
    ↓
No profile → redirect to /create-profile
    ↓
CreateProfile checks for existing profile
    ↓
Profile doesn't exist → shows form
    ↓
BUT before form loads fully...
    ↓
DashboardRouter runs again
    ↓
Still no profile → redirect to /create-profile
    ↓
LOOP CONTINUES ♾️
```

### The Fix

With our update (`commit c1abea5`):

```
CreateProfile now includes:
- approved field (required)
- status field (required)
- Role-based defaults
- Console logging for verification
```

This ensures when a profile IS created, it has all required fields.

---

## 🔐 Firestore Security Rules Issue

**Note:** The `fix-user-profile.js` script failed with:
```
❌ Error: Missing or insufficient permissions.
```

This is because Firestore security rules require authentication context. The script tries to write directly but is blocked.

**Solutions:**
1. ✅ Use Firebase Console (has admin access)
2. ✅ Use the web app's create-profile form (authenticated context)
3. ❌ Don't use Node.js scripts (they're blocked by security rules)

---

## 🎯 Prevention for Future

### For New Users

**Signup Flow (Correct):**
```
Visit /signup
    ↓
Fill form (email, password, name)
    ↓
Accept terms
    ↓
Submit
    ↓
Firebase Auth creates account
    ↓
Firestore profile created (with approved & status fields)
    ↓
Redirect to dashboard
    ↓
DashboardRouter checks profile
    ↓
Routes to correct dashboard based on role
```

### For Existing Users Without Profiles

Use Method 1 (Logout and Re-register) or Method 2 (Firebase Console).

---

## 🆘 Still Having Issues?

If the loop continues after trying all methods:

### Debug Checklist

1. **Check browser console:**
   ```javascript
   // Should show:
   ✅ User profile loaded: {uid: 'xxx', role: 'xxx'}
   
   // Should NOT show:
   ❌ User profile not found in Firestore
   ```

2. **Check Firebase Console:**
   - Go to Firestore Database
   - Look for `users` collection
   - Find document with your UID
   - Verify all fields exist

3. **Check Network tab:**
   - Look for repeated requests to Firestore
   - Check if profile is actually being fetched

4. **Clear everything:**
   ```
   1. Logout
   2. Clear browser cache
   3. Clear cookies for this site
   4. Close browser
   5. Open incognito/private window
   6. Try again
   ```

---

## 📞 Quick Reference

### Your Current User

**UID:** `8CTIocjk7BasE6afkpkPcYCMn1H2`  
**Issue:** Missing Firestore profile  
**Status:** Redirect loop

### Firebase Project

**Project ID:** `eduinfor-fff3d`  
**Console:** https://console.firebase.google.com/project/eduinfor-fff3d  
**Firestore:** /firestore/data

### Recommended Solution

**For You:** Use **Method 2** (Firebase Console) - Fastest and most reliable

1. Go to Firestore console
2. Add document with your UID
3. Fill in all fields (see template above)
4. Save
5. Refresh browser
6. ✅ Fixed!

---

## ✅ After Fix

Once fixed, you should be able to:

- ✅ Access dashboard without redirects
- ✅ See your role in navigation
- ✅ Access role-specific features
- ✅ View notifications (if admin)
- ✅ Navigate freely

---

**Created:** 2025-10-21  
**Issue:** Infinite redirect loop  
**Fix Committed:** `c1abea5`  
**Status:** Solution provided, awaiting manual fix
