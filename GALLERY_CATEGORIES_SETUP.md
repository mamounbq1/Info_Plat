# Gallery Categories Setup Guide

## 🎯 Overview

This guide explains how to add category filtering to the Gallery page and how to categorize existing images.

## ✅ What's Already Done

1. ✅ **Gallery categories configuration** created (`src/constants/galleryCategories.js`)
2. ✅ **Gallery page filter** restored with 7 categories
3. ✅ **Admin form structure** updated to include category field in state

## 📋 Categories Available

The following 7 categories are available for gallery images:

| Category | FR | AR | Color |
|----------|----|----|-------|
| **campus** | Campus | الحرم الجامعي | Blue |
| **events** | Événements | أحداث | Orange |
| **sports** | Sports | رياضة | Green |
| **activities** | Activités | أنشطة | Purple |
| **ceremonies** | Cérémonies | حفلات | Pink |
| **facilities** | Installations | المرافق | Teal |
| **academic** | Académique | أكاديمي | Indigo |

## 🔧 Adding Categories to Existing Images

### Option 1: Via Firebase Console (Manual)

1. Go to **Firebase Console** → **Firestore Database**
2. Navigate to `homepage-gallery` collection
3. For each image document:
   - Click on the document
   - Click **"Add field"**
   - Field name: `category`
   - Field type: `string`
   - Value: One of `campus`, `events`, `sports`, `activities`, `ceremonies`, `facilities`, `academic`
   - Click **Save**

### Option 2: Suggested Category Assignment

Based on existing image captions, here's a suggested category for each:

| Caption | Suggested Category |
|---------|-------------------|
| Campus principal / الحرم الرئيسي | `campus` |
| Laboratoire de chimie / مختبر الكيمياء | `facilities` |
| Bibliothèque moderne / المكتبة الحديثة | `facilities` |
| Salle informatique / قاعة الحاسوب | `academic` |
| Terrain de sport / الملعب الرياضي | `sports` |
| Amphithéâtre / المدرج | `academic` |
| Salle de classe / قاعة الدراسة | `academic` |
| Laboratoire de physique / مختبر الفيزياء | `facilities` |
| Cafétéria / الكافتيريا | `facilities` |
| Activités parascolaires / الأنشطة اللاصفية | `activities` |
| Festival culturel / المهرجان الثقافي | `ceremonies` |

### Option 3: Automated Script (Requires Admin Authentication)

A script `add-gallery-categories.js` is available but requires running from an authenticated admin context within the React app. External scripts cannot write to Firebase due to security rules.

## 🛠️ TODO: Add Category Dropdown to Admin Form

The gallery form modal needs to be updated to include a category dropdown. The form state already includes the category field, but the UI needs to be modified.

### Steps to Add Category Dropdown in Admin Panel

1. **Locate the Gallery Modal Component**
   - File: `src/components/HomeContentManagerExtended.jsx`
   - The modal is either inline or in a separate component

2. **Add Category Select Field**
   ```jsx
   import { GALLERY_CATEGORIES } from '../constants/galleryCategories';
   
   // In the form:
   <div>
     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
       {isArabic ? 'الفئة' : 'Catégorie'}
     </label>
     <select
       value={galleryForm.category}
       onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
       className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
     >
       {GALLERY_CATEGORIES.filter(cat => cat.value !== 'all').map(cat => (
         <option key={cat.value} value={cat.value}>
           {isArabic ? cat.label.ar : cat.label.fr}
         </option>
       ))}
     </select>
   </div>
   ```

3. **Test**
   - Add a new image via admin panel
   - Verify category is saved to Firebase
   - Check that filter works on Gallery page

## ✅ Current Status

- ✅ Gallery categories configuration created
- ✅ Gallery page filter UI restored
- ✅ Admin form state includes category field
- ⏳ **PENDING**: Add category dropdown to admin form modal
- ⏳ **PENDING**: Add category to 12 existing images in Firebase

## 🎯 Benefits

Once categories are added to all images:
- Users can filter gallery by category
- Better organization of gallery images
- Improved user experience
- Easier to find specific types of images

## 📝 Notes

- Default category is set to `campus` in the form
- All 12 existing images currently lack the `category` field
- Filter will show empty results until images have categories
- The filter works correctly; it's just waiting for data
