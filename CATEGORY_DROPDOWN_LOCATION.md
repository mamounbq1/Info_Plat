# 📍 Where to Find the Category Dropdown

## Admin Panel Navigation

```
Admin Dashboard
    └── Content Tab (at top)
        └── Scroll down to "Gallery Manager" section
            └── Click "Ajouter Image" button
                └── MODAL OPENS ← The form appears here
```

---

## Form Layout (What You Should See)

```
┌─────────────────────────────────────────────────┐
│  🖼️ Nouvelle Image / تعديل الصورة              │
├─────────────────────────────────────────────────┤
│                                                 │
│  📷 URL de l'image / رابط الصورة (URL)         │
│  ┌───────────────────────────────────────────┐ │
│  │ https://images.unsplash.com/...           │ │
│  └───────────────────────────────────────────┘ │
│  [Image Preview Shows Here if URL valid]       │
│                                                 │
│  ┌─────────────────────┬───────────────────┐   │
│  │ Titre (FR)          │ Titre (AR)        │   │
│  │ ┌─────────────────┐ │ ┌───────────────┐ │   │
│  │ │ Campus principal│ │ │ الحرم الرئيسي │ │   │
│  │ └─────────────────┘ │ └───────────────┘ │   │
│  └─────────────────────┴───────────────────┘   │
│                                                 │
│  ✨ Catégorie / الفئة ← THIS IS THE NEW FIELD  │
│  ┌───────────────────────────────────────────┐ │
│  │ Campus ▼                                  │ │  ← DROPDOWN
│  └───────────────────────────────────────────┘ │
│  Choose a category to organize gallery images  │
│                                                 │
│  ┌─────────────────────┬───────────────────┐   │
│  │ Ordre / الترتيب     │ ☑ Activer         │   │
│  │ ┌─────────────────┐ │   cette image     │   │
│  │ │ 0               │ │                   │   │
│  │ └─────────────────┘ │                   │   │
│  └─────────────────────┴───────────────────┘   │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Sauvegarder  │  │   Annuler    │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

---

## Category Dropdown Options

When you click the "Catégorie" dropdown, you should see:

```
┌─────────────────────────────┐
│ Campus (الحرم الجامعي)      │ ← Default
├─────────────────────────────┤
│ Events (أحداث)              │
├─────────────────────────────┤
│ Sports (رياضة)              │
├─────────────────────────────┤
│ Activities (أنشطة)          │
├─────────────────────────────┤
│ Ceremonies (حفلات)          │
├─────────────────────────────┤
│ Facilities (المرافق)        │
├─────────────────────────────┤
│ Academic (أكاديمي)          │
└─────────────────────────────┘
```

---

## Visual Markers to Look For

### ✅ If Dropdown is Visible:
- Label says "Catégorie" (FR) or "الفئة" (AR)
- Dropdown shows "Campus" or another category as selected
- Helper text below: "Choisissez une catégorie..." or "اختر فئة..."
- Located BETWEEN title fields and order field

### ❌ If Dropdown is Missing:
- You only see: Title FR, Title AR, Image URL, Order, Enable
- NO "Catégorie" label
- Form jumps directly from Title fields to Order field
- **SOLUTION**: Hard refresh browser (Ctrl+Shift+R)

---

## Screenshot Comparison

### OLD FORM (Before Changes):
```
Title (FR)
Title (AR)
Image URL
─────────────── (no category field)
Order | Enable
```

### NEW FORM (After Changes):
```
Title (FR)
Title (AR)
Image URL
───────────────
✨ CATÉGORIE ✨  ← NEW!
───────────────
Order | Enable
```

---

## How to Access

1. **Login** to admin panel
2. Click **"Content"** tab at the top
3. Scroll down past Hero, News, etc.
4. Find **"Galerie Photos"** or **"Gallery Manager"** section
5. Click blue **"Ajouter Image"** button (has + icon)
6. Modal pops up → Look for "Catégorie" field

---

## Still Can't See It?

### Try This:
```bash
# 1. Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# 2. Clear browser cache
F12 → Application → Clear site data

# 3. Try incognito mode
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)

# 4. Check browser console
F12 → Console tab → Look for errors
```

---

## Code Verification

The dropdown IS in the code. You can verify by:

```bash
cd /home/user/webapp
grep -A 10 "Category Dropdown" src/components/cms/GalleryManager.jsx
```

Output should show:
```jsx
{/* Category Dropdown */}
<div>
  <label className="block text-sm font-medium mb-2">
    {isArabic ? 'الفئة' : 'Catégorie'}
  </label>
  <select
    value={formData.category}
    ...
```

If this shows up in the code but not in your browser, it's a **caching issue**.

---

**Last Updated**: 2025-10-25  
**Commit**: 0f98950 (pushed to remote)  
**File**: `src/components/cms/GalleryManager.jsx`
