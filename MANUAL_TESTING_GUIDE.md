# 🧪 MANUAL TESTING GUIDE - IMAGE UPLOADS

**Test URL**: https://5173-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai

**Test Admin Credentials**:
- Email: `temp-admin@test.com`
- Password: `TempAdmin123!`

---

## 📋 TESTING CHECKLIST

### ✅ PHASE 1: LOGIN & VERIFY ACCESS (5 min)

1. **Open browser and navigate to**:
   ```
   https://5173-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai/login
   ```

2. **Login with temp-admin**:
   - Email: `temp-admin@test.com`
   - Password: `TempAdmin123!`
   - Click "Se connecter" / "Login"

3. **Verify admin dashboard loads**:
   - ✅ Should redirect to `/admin` or `/dashboard`
   - ✅ Should see admin navigation menu
   - ✅ Should see "Admin" or "Administrateur" section

---

### ✅ PHASE 2: TEST GALLERY MANAGER (Already Tested ✅)

**Status**: Previously tested by user - WORKING

**Navigation**: Admin Dashboard → Gallery / Galerie

**What to test**:
- ✅ Drag & drop image upload
- ✅ Image preview displays
- ✅ Upload success toast
- ✅ Image appears in gallery list
- ✅ Old image deleted on replacement

**Result**: ✅ **WORKING** (confirmed by user)

---

### ✅ PHASE 3: TEST HOME CONTENT MANAGER - NEWS (10 min)

**Navigation**: Admin Dashboard → Home Content / Contenu d'accueil → News/Actualités

**Test Steps**:

1. **Click "Ajouter une actualité" / "Add News"**

2. **Fill the form**:
   - Titre (FR): `Test Article - Upload d'image`
   - عنوان (AR): `مقال تجريبي - رفع صورة`
   - Contenu: `Ceci est un article de test pour vérifier le téléchargement d'images.`
   - المحتوى: `هذا مقال تجريبي للتحقق من رفع الصور.`

3. **Upload Image**:
   - Look for "Image de l'article" field with ImageUploadField
   - You should see:
     - Gray dashed border area
     - "Glisser-déposer une image" text
     - File input button
   - Either:
     - **Drag & drop** an image (PNG, JPG, max 5MB)
     - **Or click** the area to browse files
   
4. **Verify Upload**:
   - ✅ Image preview should appear immediately
   - ✅ Toast message: "Image téléchargée avec succès" / "تم رفع الصورة بنجاح"
   - ✅ Hover over preview → see "Changer" / "Supprimer" buttons

5. **Save the article**:
   - Click "Enregistrer" / "Save"
   - ✅ Success toast should appear
   - ✅ Article should appear in list with image thumbnail

6. **Test Replacement**:
   - Edit the same article
   - Upload a different image
   - ✅ Old image should be deleted automatically
   - ✅ New image should display

**Expected Result**: ✅ Image uploads successfully, displays in admin, old image deleted on replacement

---

### ✅ PHASE 4: TEST HOME CONTENT MANAGER - TESTIMONIALS (10 min)

**Navigation**: Admin Dashboard → Home Content → Testimonials/Témoignages

**Test Steps**:

1. **Click "Ajouter un témoignage" / "Add Testimonial"**

2. **Fill the form**:
   - Nom: `Ahmed Mansouri`
   - الاسم: `أحمد منصوري`
   - Témoignage: `Excellent lycée avec des enseignants dévoués.`
   - الشهادة: `ثانوية ممتازة مع معلمين مخلصين.`

3. **Upload Avatar Image**:
   - Look for "Avatar (optionnel)" field
   - Upload a small image (PNG, JPG, max 2MB)
   - ✅ Preview should show circular avatar
   - ✅ Toast: "Image téléchargée avec succès"

4. **Save testimonial**:
   - Click "Enregistrer"
   - ✅ Testimonial appears with avatar

**Expected Result**: ✅ Avatar uploads and displays correctly

---

### ✅ PHASE 5: TEST ABOUT MANAGER (10 min)

**Navigation**: Admin Dashboard → About / À propos

**Test Steps**:

1. **Locate the About section editor**

2. **Find ImageUploadField for section image**:
   - Should be labeled "Image de section" / "صورة القسم"

3. **Upload an image**:
   - Drag & drop or browse (max 5MB)
   - ✅ Preview displays
   - ✅ Success toast appears

4. **Save changes**:
   - Click "Enregistrer les modifications"
   - ✅ Image should persist after page reload

**Expected Result**: ✅ About section image uploads successfully

---

### ✅ PHASE 6: TEST EVENTS MANAGER (10 min)

**Navigation**: Admin Dashboard → Events / Événements

**Test Steps**:

1. **Click "Ajouter un événement" / "Add Event"**

2. **Fill event form**:
   - Titre: `Journée Portes Ouvertes`
   - العنوان: `يوم الأبواب المفتوحة`
   - Description: `Venez découvrir notre établissement`
   - الوصف: `تعال لاكتشاف مؤسستنا`
   - Date: Select a future date

3. **Upload Event Cover Image**:
   - Look for "Image de couverture" / "صورة الغلاف"
   - Upload image (max 5MB)
   - ✅ Preview displays
   - ✅ Success toast

4. **Save event**:
   - Click "Enregistrer"
   - ✅ Event appears with cover image

**Expected Result**: ✅ Event cover image uploads and displays

---

### ✅ PHASE 7: TEST SITE SETTINGS MANAGER (10 min)

**Navigation**: Admin Dashboard → Settings / Paramètres

**Test Steps**:

1. **Locate "Logo du site" / "شعار الموقع" section**

2. **Upload new logo**:
   - Look for ImageUploadField
   - Upload small PNG/JPG (max 2MB)
   - ✅ Logo preview displays
   - ✅ Success toast

3. **Save settings**:
   - Click "Enregistrer les paramètres"
   - ✅ Logo persists

4. **Verify logo in header**:
   - Reload page
   - ✅ New logo should appear in site header

**Expected Result**: ✅ Logo uploads and displays in header

---

### ✅ PHASE 8: VIEW AS VISITOR (10 min)

**Test Steps**:

1. **Logout from admin**:
   - Click "Déconnexion" / "Logout" in top menu
   - ✅ Redirects to homepage

2. **Navigate to homepage**:
   ```
   https://5173-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai
   ```

3. **Check sections for uploaded images**:

   **a) Gallery Section**:
   - Scroll to "Galerie" / "المعرض"
   - ✅ Gallery photos should display
   - ✅ Click on photo → lightbox opens

   **b) News Section**:
   - Scroll to "Actualités" / "الأخبار"
   - ✅ Test article should display with image
   - ✅ Image loads without errors

   **c) Testimonials Section**:
   - Scroll to "Témoignages" / "الشهادات"
   - ✅ Test testimonial should show with avatar
   - ✅ Avatar displays in circular frame

   **d) Events Section**:
   - Scroll to "Événements" / "الأحداث"
   - ✅ Test event should display with cover image
   - ✅ Image loads correctly

   **e) Header Logo**:
   - ✅ New logo displays in site header
   - ✅ Logo is not broken/missing

4. **Open Browser Console** (F12):
   - ✅ No CORS errors for uploaded images
   - ✅ No 403 Forbidden errors
   - ✅ All images load with status 200

**Expected Result**: ✅ All uploaded images display correctly for visitors

---

### ✅ PHASE 9: TEST IMAGE REPLACEMENT & DELETION (10 min)

**Test Steps**:

1. **Login again as temp-admin**

2. **Edit existing news article**:
   - Go to Home Content → News
   - Click "Modifier" on test article
   - Upload a DIFFERENT image
   - Save
   - ✅ Old image should be deleted from Firebase Storage
   - ✅ New image should display

3. **Check Firebase Console** (optional):
   - Go to Firebase Console → Storage
   - Check `/news/` folder
   - ✅ Should only have the NEW image
   - ✅ Old image should be gone

**Expected Result**: ✅ Old images automatically deleted on replacement

---

### ✅ PHASE 10: TEST ERROR HANDLING (5 min)

**Test Steps**:

1. **Try uploading invalid file**:
   - Try to upload a .txt file or .exe file
   - ✅ Should show error: "Le fichier doit être une image"

2. **Try uploading too large file**:
   - Try to upload image > 5MB
   - ✅ Should show error: "L'image ne doit pas dépasser 5MB"

3. **Try removing image**:
   - Upload an image
   - Hover over preview
   - Click "Supprimer" / "Remove"
   - ✅ Preview should clear
   - ✅ Image should be removed

**Expected Result**: ✅ Proper validation and error messages

---

## 📊 TESTING SUMMARY TABLE

| Component | Status | Notes |
|-----------|--------|-------|
| **GalleryManager** | ✅ TESTED | Previously confirmed by user |
| **HomeContentManager - News** | ⏳ PENDING | Test image upload in news articles |
| **HomeContentManager - Testimonials** | ⏳ PENDING | Test avatar upload |
| **AboutManager** | ⏳ PENDING | Test section image |
| **EventsManager** | ⏳ PENDING | Test event cover image |
| **SiteSettingsManager** | ⏳ PENDING | Test logo upload |
| **Visitor View** | ⏳ PENDING | Verify public display |
| **Image Replacement** | ⏳ PENDING | Test old image deletion |
| **Error Handling** | ⏳ PENDING | Test validation |

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Upload button doesn't appear
**Solution**: Make sure you're logged in as admin and have proper permissions

### Issue 2: Image preview doesn't show
**Solution**: Check browser console for errors, verify Firebase Storage Rules are deployed

### Issue 3: Success toast doesn't appear
**Solution**: Check Network tab in DevTools for upload status, verify no 403 errors

### Issue 4: Old image not deleted
**Solution**: Verify Storage Rules have separate `allow delete` permission (not just `allow write`)

### Issue 5: Images don't display for visitors
**Solution**: Check CORS configuration in Firebase Storage

---

## 📸 SCREENSHOTS TO CAPTURE

For documentation, capture screenshots of:

1. ✅ ImageUploadField empty state (dashed border)
2. ✅ ImageUploadField with image preview
3. ✅ Success toast notification
4. ✅ Admin panel with uploaded image
5. ✅ Public site with uploaded image displaying
6. ✅ Error validation messages

---

## 🔍 DEBUGGING CHECKLIST

If something doesn't work:

1. **Check Browser Console** (F12):
   - Look for red error messages
   - Look for 403 Forbidden errors
   - Look for CORS errors

2. **Check Network Tab**:
   - Filter by "Images" or "Media"
   - Check status codes (should be 200)
   - Check for failed requests

3. **Check Firebase Console**:
   - Go to Storage
   - Verify files are uploading
   - Check Security Rules are active

4. **Check Custom Claims**:
   - Go to `/diagnostic-user` page
   - Verify your token has `role: "admin"`
   - If missing, logout and login again

5. **Check Firestore**:
   - Go to Firestore Database
   - Check document has correct imageUrl
   - Verify URL format is correct

---

## ✅ FINAL VERIFICATION

Before marking test as complete:

- [ ] All 6 components tested
- [ ] All uploads successful
- [ ] All images display in admin
- [ ] All images display for visitors
- [ ] Old images deleted on replacement
- [ ] Error validation works
- [ ] No console errors
- [ ] No CORS errors
- [ ] Logo displays in header
- [ ] Gallery lightbox works

---

## 📝 TESTING NOTES TEMPLATE

Use this template to document your test results:

```
Date: ___________
Tester: ___________
Browser: ___________

Component: ___________
Result: ✅ PASS / ❌ FAIL / ⚠️ WARNING
Notes: ___________________________________________
Screenshot: [ Attached / Not Attached ]

Issues Found:
1. ___________
2. ___________

Fixes Applied:
1. ___________
2. ___________
```

---

## 🎯 SUCCESS CRITERIA

Test is considered **SUCCESSFUL** when:

1. ✅ All 6 components accept file uploads
2. ✅ Drag & drop works in all components
3. ✅ Image previews display correctly
4. ✅ Success toasts appear after upload
5. ✅ Images persist after page reload
6. ✅ Images display for public visitors
7. ✅ Old images are automatically deleted
8. ✅ Error validation works correctly
9. ✅ No 403 or CORS errors in console
10. ✅ Logo displays in site header

---

## 📞 SUPPORT

If you encounter issues:

1. Check `/SUMMARY.md` - Complete project overview
2. Check `/TEST_GUIDE.md` - Additional testing info
3. Check `/SECURITY_ARCHITECTURE.md` - How permissions work
4. Visit `/diagnostic-user` - Debug permissions
5. Check Firebase Console - Storage & Firestore

---

**Good luck with testing! 🚀**
