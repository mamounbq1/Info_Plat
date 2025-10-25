# 📋 Section Visibility & Ordering System - User Guide

## 🎯 Overview

This guide explains how to use the new **Section Visibility & Ordering System** that allows admins to control which sections appear on the landing page and in what order.

---

## 🚀 Quick Start

### Step 1: Access the Visibility Manager

1. **Login** to the admin dashboard
2. Navigate to **Dashboard** → **Homepage** management
3. The **"Visibilité"** tab will be active by default (first tab)

### Step 2: Manage Section Visibility

You'll see a list of all 10 manageable sections:

| Section | French Name | Arabic Name |
|---------|-------------|-------------|
| Hero | Hero Section | القسم الرئيسي |
| Announcements | Annonces Urgentes | الإعلانات العاجلة |
| Stats | Statistiques | الإحصائيات |
| About | À Propos | عن الثانوية |
| News | Actualités | الأخبار |
| Clubs | Clubs & Activités | الأندية والأنشطة |
| Gallery | Galerie Photos | معرض الصور |
| Testimonials | Témoignages | الشهادات |
| Quick Links | Liens Rapides | روابط سريعة |
| Contact | Contact | اتصل بنا |

### Step 3: Enable/Disable Sections

- **Green badge** (Activée/نشط) = Section is currently visible on landing page
- **Red badge** (Désactivée/معطل) = Section is hidden on landing page
- Click the **toggle button** to enable/disable any section

### Step 4: Reorder Sections

- Use the **↑ Up arrow** to move a section higher in the display order
- Use the **↓ Down arrow** to move a section lower in the display order
- The **Order** number shows the current position (1 = first, 10 = last)

### Step 5: Save Changes

1. Click the **"Enregistrer les Modifications"** button (bottom of the page)
2. You'll see a success message when changes are saved
3. Visit the landing page to see your changes immediately reflected

---

## 🎨 Features in Detail

### Enable/Disable Toggle

**What it does:**
- When **enabled** (green), the section appears on the landing page
- When **disabled** (red), the section is completely hidden from the landing page

**Use cases:**
- Hide seasonal content (e.g., hide testimonials during vacation)
- Temporarily remove sections under construction
- Focus user attention on specific content
- A/B testing different page layouts

**Example:**
```
Before: Hero → Announcements → Stats → About → News → Clubs → Gallery → Testimonials → QuickLinks → Contact
After disabling Stats and Gallery: Hero → Announcements → About → News → Clubs → Testimonials → QuickLinks → Contact
```

### Section Reordering

**What it does:**
- Changes the display order of sections on the landing page
- Allows you to prioritize important content

**Use cases:**
- Promote news section during important announcements
- Move contact section higher during enrollment periods
- Reorder based on user engagement analytics
- Seasonal content prioritization

**Example:**
```
Default Order:
1. Hero
2. Announcements
3. Stats
4. About
5. News
...

Custom Order (News prioritized):
1. Hero
2. News          ← Moved up!
3. Announcements
4. Stats
5. About
...
```

---

## 💾 Data Storage

### Firestore Structure

Settings are saved in Firestore at:
```
Collection: homepage
Document: section-visibility
```

**Document Structure:**
```javascript
{
  sections: [
    {
      id: "hero",
      nameFr: "Hero Section",
      nameAr: "القسم الرئيسي",
      enabled: true,
      order: 1
    },
    {
      id: "announcements",
      nameFr: "Annonces Urgentes",
      nameAr: "الإعلانات العاجلة",
      enabled: true,
      order: 2
    },
    // ... 8 more sections
  ],
  updatedAt: "2024-10-23T22:00:00.000Z"
}
```

### Default Behavior

If no visibility settings exist in Firestore:
- ✅ All sections are **enabled** by default
- ✅ Sections appear in **natural order** (1-10)
- ✅ No disruption to existing functionality

---

## 🧪 Testing Checklist

### ✅ Pre-Testing

- [ ] Login as admin user
- [ ] Navigate to Dashboard → Homepage → Visibilité
- [ ] Verify all 10 sections are listed
- [ ] Check that status badges are visible (green/red)

### ✅ Enable/Disable Testing

1. **Disable a section:**
   - [ ] Click toggle button on any section
   - [ ] Badge should change from green to red
   - [ ] Click "Enregistrer"
   - [ ] Visit landing page - section should be hidden

2. **Re-enable the section:**
   - [ ] Click toggle button again
   - [ ] Badge should change from red to green
   - [ ] Click "Enregistrer"
   - [ ] Visit landing page - section should reappear

### ✅ Reordering Testing

1. **Move section up:**
   - [ ] Click ↑ arrow on any section (not first)
   - [ ] Order number should decrease by 1
   - [ ] Section below should move down
   - [ ] Click "Enregistrer"
   - [ ] Visit landing page - verify new order

2. **Move section down:**
   - [ ] Click ↓ arrow on any section (not last)
   - [ ] Order number should increase by 1
   - [ ] Section above should move up
   - [ ] Click "Enregistrer"
   - [ ] Visit landing page - verify new order

### ✅ Persistence Testing

- [ ] Make changes and save
- [ ] Logout and login again
- [ ] Return to Visibilité tab
- [ ] Verify changes are still applied

### ✅ Landing Page Verification

- [ ] Open landing page in a new tab
- [ ] Verify only enabled sections are visible
- [ ] Verify sections appear in correct order
- [ ] Check both French and Arabic language modes

---

## 🔧 Troubleshooting

### Issue: Changes not appearing on landing page

**Solution:**
1. Hard refresh the landing page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check if "Enregistrer" button was clicked
4. Verify you're logged in as admin

### Issue: Can't see Visibilité tab

**Solution:**
1. Verify you're logged in as an **admin** user
2. Navigate to **Dashboard** → **Homepage**
3. Look for the "Visibilité" tab (should be first tab)
4. Check if you have the latest code version

### Issue: Reordering doesn't work

**Solution:**
1. Ensure you clicked "Enregistrer" after reordering
2. Check that the section is not at the top (can't move up) or bottom (can't move down)
3. Refresh the page and try again

### Issue: Error when saving

**Solution:**
1. Check browser console for error messages (F12)
2. Verify Firebase/Firestore connection
3. Ensure you have write permissions to `homepage/section-visibility`
4. Check internet connection

---

## 🎯 Best Practices

### Content Management Strategy

1. **Plan before disabling:**
   - Consider user experience impact
   - Test with disabled sections before going live
   - Keep important sections (Hero, Contact) always enabled

2. **Strategic ordering:**
   - Place most important content first
   - Group related sections together
   - Consider user journey flow

3. **Seasonal adjustments:**
   - Update during holidays (hide enrollment-related sections)
   - Promote events by reordering
   - Highlight urgent announcements

### Performance Optimization

- ✅ Disabling sections **improves page load time** (less HTML rendered)
- ✅ Fewer sections = **faster First Contentful Paint (FCP)**
- ✅ Prioritize important content for **better user engagement**

### Accessibility

- ✅ Reordering affects **keyboard navigation order**
- ✅ Keep logical flow: Hero → About → Content → Contact
- ✅ Don't hide critical information (Contact, About)

---

## 📊 Analytics Integration (Future Enhancement)

Consider tracking:
- Which sections users engage with most
- Scroll depth analytics
- Time spent per section
- Conversion rates by section order

Use this data to optimize section order and visibility!

---

## 🔒 Security Considerations

### Firestore Security Rules

Ensure only admins can write to `homepage/section-visibility`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /homepage/section-visibility {
      // Allow all to read
      allow read: if true;
      
      // Only admins can write
      allow write: if request.auth != null 
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review browser console (F12) for errors
3. Check Firestore database structure
4. Verify authentication and permissions
5. Contact technical support with error details

---

## 🎉 Summary

The Section Visibility & Ordering System gives you:
- ✅ **Full control** over landing page sections
- ✅ **Dynamic content** without code changes
- ✅ **A/B testing** capabilities
- ✅ **Seasonal flexibility**
- ✅ **Performance optimization** through selective rendering

**Happy managing! 🚀**
