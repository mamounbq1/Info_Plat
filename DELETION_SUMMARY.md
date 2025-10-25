# 🔥 Firebase Database Deletion Summary

## Current Database Status

**Database:** eduinfor-fff3d  
**Total Documents:** 79  
**Collections with Data:** 6

### Data Breakdown:
```
✅ users     : 24 documents
✅ courses   : 19 documents
✅ quizzes   : 11 documents
✅ exercises : 10 documents
✅ branches  : 4 documents
✅ subjects  : 11 documents
```

---

## ⚠️ RECOMMENDED METHOD: Firebase Console

Since we're encountering permission issues with scripts, the **easiest and most reliable** method is to use the Firebase Console directly.

### Step-by-Step Instructions:

#### 1. Delete Firestore Collections

Go to your Firestore Database:
🔗 https://console.firebase.google.com/project/eduinfor-fff3d/firestore/data

For each collection with data, follow these steps:

**Users Collection (24 documents):**
1. Click on "users" in the left sidebar
2. Click the three dots (⋮) next to "users" 
3. Select "Delete collection"
4. Type the collection name to confirm
5. Click "Delete"

**Courses Collection (19 documents):**
1. Click on "courses"
2. Click the three dots (⋮)
3. Select "Delete collection"
4. Confirm deletion

**Quizzes Collection (11 documents):**
1. Click on "quizzes"
2. Click the three dots (⋮)
3. Select "Delete collection"
4. Confirm deletion

**Exercises Collection (10 documents):**
1. Click on "exercises"
2. Click the three dots (⋮)
3. Select "Delete collection"
4. Confirm deletion

**Branches Collection (4 documents):**
1. Click on "branches"
2. Click the three dots (⋮)
3. Select "Delete collection"
4. Confirm deletion

**Subjects Collection (11 documents):**
1. Click on "subjects"
2. Click the three dots (⋮)
3. Select "Delete collection"
4. Confirm deletion

#### 2. Delete Authentication Users (Optional)

If you also want to delete all authentication users:

Go to Firebase Authentication:
🔗 https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users

1. Check the box at the top to select all users
2. Click the "Delete" button (trash icon)
3. Confirm the deletion

#### 3. Delete Storage Files (Optional)

If you want to delete uploaded files:

Go to Firebase Storage:
🔗 https://console.firebase.google.com/project/eduinfor-fff3d/storage

1. Select all folders/files
2. Click the delete icon
3. Confirm deletion

---

## Alternative: Using Scripts (Requires Firebase CLI)

If you want to use scripts instead:

### Option A: Install Firebase CLI and deploy open rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy the open rules
firebase deploy --only firestore:rules --project eduinfor-fff3d

# Wait 60 seconds for rules to propagate
sleep 60

# Run the deletion script
node delete-all-simple.js
```

### Option B: Use Firebase Admin SDK

1. Download Service Account Key:
   - Go to: https://console.firebase.google.com/project/eduinfor-fff3d/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root
   - **⚠️ NEVER commit this to git!**

2. Run the admin script:
```bash
node delete-all-data-admin.js
```

---

## Verification

After deletion, run this to verify:

```bash
node check-database-contents.js
```

You should see:
```
✨ Database is empty!
```

---

## Important Notes

1. **⚠️ This action is IRREVERSIBLE!**
   - There is no undo
   - All data will be permanently deleted
   - Make backups if you need the data later

2. **📦 Firestore Export (Backup)**
   - If you want to backup data first:
   - Go to: https://console.firebase.google.com/project/eduinfor-fff3d/firestore/data
   - Click "Import/Export" at the top
   - Export to Cloud Storage bucket

3. **🔒 Security Rules**
   - After deletion, deploy secure rules again
   - Don't leave rules open in production

4. **🔄 Re-seeding**
   - If you want fresh sample data after deletion:
   ```bash
   node seed-all-data.js
   ```

---

## Why Scripts Aren't Working

The scripts are failing with "Missing or insufficient permissions" because:

1. The Firestore security rules currently deployed on Firebase are more restrictive than the local `firestore.rules` file
2. The local rules file says `allow read, write: if true` (open), but the deployed rules require authentication
3. To fix this, you need to either:
   - Use Firebase Console (no authentication needed, you're the owner)
   - Deploy open rules using Firebase CLI
   - Use Firebase Admin SDK with service account key

---

## Quick Links

- **Firebase Console:** https://console.firebase.google.com/project/eduinfor-fff3d
- **Firestore Data:** https://console.firebase.google.com/project/eduinfor-fff3d/firestore/data
- **Authentication:** https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users
- **Storage:** https://console.firebase.google.com/project/eduinfor-fff3d/storage
- **Service Accounts:** https://console.firebase.google.com/project/eduinfor-fff3d/settings/serviceaccounts/adminsdk

---

## Next Steps

**Choose one method:**

1. ✅ **EASIEST:** Use Firebase Console (recommended above)
2. 🔧 Install Firebase CLI and use scripts
3. 🔑 Use Admin SDK with service account

**After deletion:**
- [ ] Verify database is empty
- [ ] Deploy secure Firestore rules
- [ ] Optionally re-seed with fresh data
- [ ] Test your application

---

Generated: $(date)
Project: eduinfor-fff3d (Moroccan Educational Platform)
