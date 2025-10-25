# 🔒 Firestore Rules Update Required

## ⚠️ Issue
The new `homepage-events` collection needs to be added to Firestore security rules to allow:
- **Public read access** (anyone can view events)
- **Admin write access** (only admins can create/edit/delete events)

---

## 🛠️ Solution: Update Firestore Rules Manually

### Step 1: Access Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: **eduinfor-fff3d**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top

### Step 2: Add the Events Collection Rule
Find this section in your rules (around line 114):

```javascript
// ✨ NEW: Homepage CMS collections - everyone can read, only admins can write
match /homepage-announcements/{announcementId} {
  allow read: if true; // Public announcements
  allow write: if isAdmin();
}
```

**Add this block right after it:**

```javascript
match /homepage-events/{eventId} {
  allow read: if true; // Public events
  allow write: if isAdmin();
}
```

### Step 3: Complete Rules Section
Your complete CMS collections section should look like this:

```javascript
// ✨ NEW: Homepage CMS collections - everyone can read, only admins can write
match /homepage-announcements/{announcementId} {
  allow read: if true; // Public announcements
  allow write: if isAdmin();
}

match /homepage-events/{eventId} {
  allow read: if true; // Public events
  allow write: if isAdmin();
}

match /homepage-clubs/{clubId} {
  allow read: if true; // Public clubs
  allow write: if isAdmin();
}

match /homepage-gallery/{imageId} {
  allow read: if true; // Public gallery
  allow write: if isAdmin();
}

match /homepage-quicklinks/{linkId} {
  allow read: if true; // Public quick links
  allow write: if isAdmin();
}
```

### Step 4: Publish Rules
1. Click **Publish** button at the top right
2. Wait for confirmation message
3. Rules are now live! ✅

---

## 🧪 Test After Update

### Option 1: Run the Seeder (Recommended)
Once rules are updated, run this command to populate sample events:

```bash
cd /home/user/webapp
node seed-events.cjs
```

This will add 8 sample events to your database.

### Option 2: Manually Add Events via Admin Panel
1. Go to your admin dashboard
2. Navigate to: **Contenu du Site → Actualités & Contenu → Événements**
3. Click **Ajouter Événement**
4. Fill in the form and save

---

## 📋 Sample Event Data (For Manual Entry)

If you prefer to add events manually, here's a sample:

**Event 1:**
- Titre (FR): Journée Portes Ouvertes
- Titre (AR): يوم الأبواب المفتوحة
- Description (FR): Venez découvrir notre établissement
- Description (AR): تعال واكتشف مؤسستنا
- Date (FR): 15 Novembre 2025
- Date (AR): 15 نوفمبر 2025
- Heure (FR): 09:00 - 16:00
- Heure (AR): 09:00 - 16:00
- Lieu (FR): Campus Principal
- Lieu (AR): الحرم الرئيسي
- Featured: ✅ Yes
- Activé: ✅ Yes
- Ordre: 0

---

## 🔍 Verify Rules Are Working

After updating rules, test in browser console (F12):

```javascript
// This should work (returns events)
firebase.firestore().collection('homepage-events').get()
  .then(snapshot => console.log('✅ Read works:', snapshot.size, 'events'))
  .catch(err => console.error('❌ Read failed:', err));
```

---

## 📝 Local Rules File

The updated rules are already saved in:
```
/home/user/webapp/firestore.rules
```

This file is ready to be deployed when you have Firebase CLI authentication set up.

To deploy later (requires `firebase login`):
```bash
firebase use eduinfor-fff3d
firebase deploy --only firestore:rules
```

---

## ✅ Checklist

- [ ] Access Firebase Console
- [ ] Navigate to Firestore Database → Rules
- [ ] Add `homepage-events` rule block
- [ ] Publish rules
- [ ] Run seeder script: `node seed-events.cjs`
- [ ] Verify events appear in admin panel
- [ ] Test public events page: `/events`

---

## 🆘 Troubleshooting

**Still getting permission errors?**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check Firebase Console → Firestore → Rules → Make sure they're published
4. Verify you're logged in as admin in the app

**Seeder still failing?**
- Double-check the rule was added correctly
- Make sure you clicked "Publish" in Firebase Console
- Wait 1-2 minutes for rules to propagate
- Try again

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console (F12) for detailed error messages
2. Verify your admin user has role: 'admin' in Firestore users collection
3. Make sure rules match exactly as shown above
