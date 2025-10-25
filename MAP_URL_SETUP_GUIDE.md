# 🗺️ Guide: How to Add Custom Map to Contact Page

This guide shows administrators how to add a custom Google Maps location to the Contact page.

## ✨ Overview

The Contact page now supports **admin-editable map locations**! You can change the map location anytime without touching code.

---

## 📝 Step-by-Step Instructions

### Step 1: Open Google Maps

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for your school's location or any address
3. Make sure the map is centered on the correct location

### Step 2: Get the Embed Code

1. Click the **"Share"** button (usually in the left sidebar or near the search box)
2. In the Share dialog, click on the **"Embed a map"** tab
3. You'll see an iframe code that looks like this:

```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12..." width="600" height="450"></iframe>
```

4. **Copy ONLY the URL** inside the `src="..."` part
   - It should start with: `https://www.google.com/maps/embed?pb=...`
   - It will be quite long (that's normal!)

### Step 3: Add to Admin Panel

1. **Login to your Admin Panel**
2. **Navigate to: Admin Panel → Contact Section**
   - French: "Panneau d'administration → Informations de Contact"
   - Arabic: "لوحة التحكم → قسم الاتصال"

3. **Scroll down to "URL de la carte" / "رابط الخريطة" field**

4. **Paste the URL** you copied from Google Maps

5. **Click "Save" / "Sauvegarder" / "حفظ"**

### Step 4: Verify

1. Go to your public **Contact page** (`/contact`)
2. You should see the interactive map with your location!

---

## 🎯 Example

### Valid Map URL Format:
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106364.27598770895!2d-6.9357142!3d33.9715904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76b871f50c5c1%3A0x7ac946ed7408076b!2sRabat%2C%20Morocco!5e0!3m2!1sen!2s!4v1234567890
```

### What NOT to paste:
❌ Don't paste the entire `<iframe>` HTML code  
❌ Don't paste regular Google Maps URLs (like `https://www.google.com/maps/place/...`)  
✅ Only paste the embed URL starting with `https://www.google.com/maps/embed?pb=...`

---

## 🖼️ Visual Guide

### Finding the Share Button:

**On Desktop:**
```
Google Maps Interface:
┌─────────────────────────────────────┐
│  [Search box]                       │
│                                     │
│  📍 Your Location                   │
│  ├─ Directions                      │
│  ├─ Save                            │
│  └─ 🔗 Share  ← Click here!        │
│                                     │
│         [Map View]                  │
└─────────────────────────────────────┘
```

**Share Dialog:**
```
┌─────────────────────────────────────┐
│  Share                              │
│  ┌──────────┬──────────┐           │
│  │ Send Link│Embed map │           │  ← Click "Embed a map"
│  └──────────┴──────────┘           │
│                                     │
│  <iframe src="https://www.go...    │  ← Copy this URL
│  ...maps/embed?pb=!1m18..."        │
│                                     │
│  [COPY HTML]                        │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Problem: Map doesn't show up

**Check 1:** Make sure you copied the EMBED URL, not a regular Google Maps link
- ✅ Correct: `https://www.google.com/maps/embed?pb=...`
- ❌ Wrong: `https://www.google.com/maps/place/...`
- ❌ Wrong: `https://goo.gl/maps/...`

**Check 2:** Make sure you saved the changes in the admin panel

**Check 3:** Refresh your Contact page (hard refresh: Ctrl+F5 or Cmd+Shift+R)

### Problem: "Carte non configurée" / "لم يتم تعيين الخريطة" shows

This means no map URL is configured yet. Follow the steps above to add one!

### Problem: Map shows wrong location

1. Go back to Google Maps
2. Search for the CORRECT location
3. Get a new embed URL from the correct location
4. Update it in the admin panel

---

## 🌍 Language Support

The map feature works in:
- 🇫🇷 **French** (Français)
- 🇸🇦 **Arabic** (العربية)

All instructions and placeholders automatically adapt to the selected language.

---

## 💡 Tips

- **Test different zoom levels** in Google Maps before copying the embed URL
- **Use Street View** for better location accuracy
- **Add a marker** in Google Maps to highlight your exact building
- **Update seasonally** if your school has different campuses

---

## 🆘 Need Help?

If you're having trouble:
1. Check the Troubleshooting section above
2. Make sure you're logged in as an admin
3. Verify your Firebase permissions are correct
4. Contact your technical support team

---

## 📚 Technical Notes

**For Developers:**

- Map URL is stored in: `Firestore → homepage → contact → mapUrl`
- Field type: `string`
- Fallback: Shows placeholder when `mapUrl` is empty or undefined
- Component files:
  - Admin: `src/components/cms/ContactManager.jsx`
  - Public: `src/pages/ContactPage.jsx`

---

**Last Updated:** October 25, 2025  
**Feature Version:** 1.0.0
