# 🔥 Complete Guide to Delete All Data from Firebase

## Overview
This guide provides multiple methods to delete ALL data from your Firebase project (eduinfor-fff3d).

⚠️ **WARNING: ALL METHODS ARE IRREVERSIBLE!**

---

## Method 1: Firebase Console (RECOMMENDED - Easiest)

This is the most reliable method and doesn't require any code or authentication issues.

### Steps:

1. **Go to Firestore Database:**
   - Open: https://console.firebase.google.com/project/eduinfor-fff3d/firestore

2. **Delete Collections One by One:**
   
   For each collection listed below:
   - Click on the collection name
   - Click the three dots menu (⋮) at the top
   - Select "Delete collection"
   - Confirm the deletion
   
   **Collections to delete:**
   - ✅ users
   - ✅ courses
   - ✅ quizzes
   - ✅ exercises
   - ✅ levels
   - ✅ branches
   - ✅ subjects
   - ✅ progress
   - ✅ userProgress
   - ✅ quizResults
   - ✅ exerciseResults
   - ✅ notifications
   - ✅ settings
   - ✅ stats
   - ✅ courseStats
   - ✅ userStats
   - ✅ systemStats
   - ✅ achievements
   - ✅ badges
   - ✅ leaderboard
   - ✅ announcements
   - ✅ feedback
   - ✅ comments

3. **Delete Authentication Users (Optional):**
   - Go to: https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users
   - Select all users (checkbox at top)
   - Click "Delete" button
   - Confirm deletion

4. **Delete Storage Files (Optional):**
   - Go to: https://console.firebase.google.com/project/eduinfor-fff3d/storage
   - Select all folders/files
   - Click delete icon
   - Confirm deletion

---

## Method 2: Firebase CLI (Automated)

### Prerequisites:
```bash
npm install -g firebase-tools
firebase login
```

### Deploy Open Rules First:
```bash
# 1. Deploy open Firestore rules
firebase deploy --only firestore:rules --project eduinfor-fff3d

# 2. Wait 1 minute for rules to propagate

# 3. Run deletion script
node delete-all-simple.js
```

---

## Method 3: Firebase Admin SDK (Best for Scripts)

### Prerequisites:

1. **Download Service Account Key:**
   - Go to: https://console.firebase.google.com/project/eduinfor-fff3d/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root
   - **⚠️ NEVER commit this file to git!**

2. **Run the admin deletion script:**
```bash
node delete-all-data-admin.js
```

This will:
- Delete all Firestore collections and documents
- Optionally delete all Authentication users
- Works regardless of security rules

---

## Method 4: Manual Script with Authentication

If you have admin credentials and rules allow authenticated deletion:

```bash
# Run the authenticated deletion script
node delete-all-with-auth.js
```

---

## Method 5: Complete Project Reset

If you want to start completely fresh:

1. **Delete the entire Firebase project:**
   - Go to: https://console.firebase.google.com/project/eduinfor-fff3d/settings/general
   - Scroll down to "Delete project"
   - Follow the prompts

2. **Create a new Firebase project:**
   - Go to: https://console.firebase.google.com/
   - Click "Add project"
   - Follow setup wizard

3. **Update your `.env` file** with new project credentials

---

## Quick Check: What Data Exists?

### Check Firestore:
```bash
node check-database-contents.js
```

### Check Authentication Users:
- Go to: https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users

---

## Troubleshooting

### "Missing or insufficient permissions" Error

**Cause:** Firestore security rules are blocking the deletion.

**Solutions:**

1. **Option A: Use Firebase Console** (Method 1 above)
   - No code needed, works always

2. **Option B: Deploy open rules temporarily:**
   ```bash
   # Edit firestore.rules to:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   
   # Deploy
   firebase deploy --only firestore:rules
   
   # Wait 1 minute, then run script
   node delete-all-simple.js
   ```

3. **Option C: Use Firebase Admin SDK** (Method 3 above)
   - Admin SDK bypasses security rules

### Script Won't Run

**Check Node.js version:**
```bash
node --version  # Should be v16 or higher
```

**Reinstall dependencies:**
```bash
npm install
```

---

## Post-Deletion Checklist

After deleting all data:

- [ ] All Firestore collections are empty
- [ ] All Authentication users are deleted (if desired)
- [ ] All Storage files are deleted (if desired)
- [ ] Deploy secure Firestore rules again
- [ ] Update your application code if needed
- [ ] Re-seed database if you want fresh data

---

## Re-seeding After Deletion

If you want to start fresh with sample data:

```bash
# Re-seed the database with sample data
node seed-all-data.js
```

---

## Important Notes

1. **⚠️ BACKUP BEFORE DELETION**
   - If you might need the data later, export it first
   - Go to Firestore Console → Export data

2. **🔒 Security Rules**
   - After deletion, make sure to deploy secure rules
   - Don't leave rules open in production

3. **👥 Authentication Users**
   - Deleting Firestore data doesn't delete Auth users
   - Delete Auth users separately if needed

4. **📦 Storage Files**
   - Deleting Firestore data doesn't delete Storage files
   - Clean up Storage separately if needed

5. **⏱️ Rule Propagation**
   - After deploying rules, wait 1-2 minutes
   - Rules need time to propagate globally

---

## Quick Links

- **Firebase Console:** https://console.firebase.google.com/project/eduinfor-fff3d
- **Firestore Database:** https://console.firebase.google.com/project/eduinfor-fff3d/firestore
- **Authentication:** https://console.firebase.google.com/project/eduinfor-fff3d/authentication
- **Storage:** https://console.firebase.google.com/project/eduinfor-fff3d/storage
- **Project Settings:** https://console.firebase.google.com/project/eduinfor-fff3d/settings/general

---

## Need Help?

If you encounter issues:

1. Check the error message carefully
2. Verify you're logged into the correct Firebase account
3. Confirm you have Owner/Editor permissions on the project
4. Try Method 1 (Firebase Console) - it always works!

---

Generated: $(date)
Project: eduinfor-fff3d
