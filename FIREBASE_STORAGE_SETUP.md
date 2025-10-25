# 🔥 Firebase Storage Rules Setup

## 🐛 Problem
When trying to upload images from the admin CMS, you may encounter this error:
```
Firebase Storage: User does not have permission to access 'hero-images/...'
(storage/unauthorized)
```

This happens because Firebase Storage rules need to be configured to allow admin uploads.

---

## ✅ Solution: Update Storage Rules

### Method 1: Manual Update via Firebase Console (Recommended)

#### Step 1: Access Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select your project: **eduinfor-fff3d**

#### Step 2: Navigate to Storage Rules
1. Click **Storage** in the left sidebar
2. Click the **Rules** tab at the top

#### Step 3: Replace Rules
Copy the entire content from the `storage.rules` file in this repository and paste it into the Firebase Console rules editor.

The new rules include:
- ✅ Public read access for landing page images (`hero-images`, `news-images`, `clubs-images`, `gallery-images`)
- ✅ Admin-only write access (verified via Firestore `users` collection role field)
- ✅ Existing rules for courses, profiles, and quizzes remain unchanged

#### Step 4: Publish
1. Click the **Publish** button
2. Wait a few seconds for the rules to deploy
3. Test image upload from admin panel

---

### Method 2: Deploy via Firebase CLI (Alternative)

If you have Firebase CLI installed and authenticated:

```bash
# Ensure you're in the project directory
cd /path/to/your/project

# Deploy only storage rules
firebase deploy --only storage
```

**Note**: You need to be authenticated with Firebase CLI first:
```bash
firebase login
```

---

## 📋 New Rules Summary

### Hero Images (Landing Page)
```javascript
match /hero-images/{allPaths=**} {
  allow read: if true; // Public read for landing page
  allow write: if request.auth != null && 
                  get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### News Images
```javascript
match /news-images/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && 
                  get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Clubs Images
```javascript
match /clubs-images/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && 
                  get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Gallery Images
```javascript
match /gallery-images/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && 
                  get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 🔒 Security Features

1. **Public Read Access**: Required for landing page to display images to all visitors
2. **Admin-Only Write**: Only authenticated users with `role: 'admin'` in Firestore can upload
3. **Authentication Check**: All writes require valid Firebase Authentication
4. **Role Verification**: Queries Firestore to verify user role before allowing upload

---

## ✅ Testing After Setup

1. Log in as an **admin** user
2. Navigate to **Content Management** → **Homepage Manager**
3. Select **Hero Section** tab
4. Try uploading an image
5. Should succeed without errors! 🎉

---

## 🐛 Troubleshooting

### Still Getting 403 Errors?
- ✅ Verify rules are published in Firebase Console
- ✅ Check that logged-in user has `role: 'admin'` in Firestore `users` collection
- ✅ Clear browser cache and refresh
- ✅ Check browser console for authentication errors

### Images Upload But Don't Display?
- ✅ Verify `allow read: if true;` is present for image folders
- ✅ Check that image URLs are valid in Firestore documents
- ✅ Ensure CORS is configured properly in Firebase Storage

---

## 📚 Related Files

- `storage.rules` - Storage security rules
- `firebase.json` - Firebase configuration
- `.firebaserc` - Firebase project settings
- `src/components/HomeContentManager.jsx` - Image upload implementation
- `src/pages/LandingPage.jsx` - Image display on landing page

---

**Last Updated**: 2025-10-24
