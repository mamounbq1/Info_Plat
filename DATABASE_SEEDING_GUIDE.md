# 📊 Comprehensive Database Seeding Guide

## 🚨 Current Issue
The database seeding script requires **admin authentication** due to Firestore security rules.

## ✅ Solution Options

### Option 1: Temporary Test Mode Rules (RECOMMENDED FOR DEVELOPMENT)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Navigate to**: Firestore Database → Rules
3. **Temporarily set test mode** (⚠️ ONLY for seeding, revert immediately after):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ TEST MODE - REVERT AFTER SEEDING
    }
  }
}
```

4. **Click "Publish"**
5. **Run the seed script**: `node seed-database.js`
6. **IMMEDIATELY REVERT** to production rules: `firebase deploy --only firestore:rules`

### Option 2: Use Firebase Admin SDK with Service Account

1. **Download Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in project root
   
2. **Use the admin seed script** (see below)

### Option 3: Manual Seeding via Firebase Console

Use the Firebase Console to manually add documents to each collection.

---

## 📋 Collections to Seed

### Homepage Collections
- ✅ `homepage` (documents: hero, stats, contact)
- ✅ `homepage-features` (6+ items)
- ✅ `homepage-news` (5+ items)  
- ✅ `homepage-testimonials` (3+ items)
- ✅ `homepage-announcements` (3+ items)
- ✅ `homepage-clubs` (3+ items)
- ✅ `homepage-gallery` (3+ images)
- ✅ `homepage-quicklinks` (3+ links)

### Academic Hierarchy
- ✅ `academicLevels` (Tronc Commun, 1BAC, 2BAC)
- ✅ `branches` (Sciences, Lettres, etc.)
- ✅ `subjects` (Math, Physics, French, etc.)

### Educational Content
- ✅ `courses` (10+ courses across subjects)
- ✅ `exercises` (5+ exercise sets)
- ✅ `quizzes` (5+ quizzes with questions)
- ✅ `notifications` (3+ sample notifications)

---

## 🔧 Quick Seeding Commands

### Clear and Refill Homepage Data
```bash
node seed-database.js
```

### Clear Specific Collection
```bash
node clear-collection.js homepage-features
```

---

## 📊 Sample Data Overview

The seed script includes:
- **Homepage**: Hero, Stats, 6 Features, 5 News, 3 Testimonials
- **Academics**: 3 Levels, 3 Branches, 9 Subjects
- **Content**: 10 Courses, 5 Exercises, 5 Quizzes
- **Total Documents**: ~50+ comprehensive test documents

