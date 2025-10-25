# 🎯 Comprehensive Database Seeding Guide

## Current Situation

Your database needs to be cleared and refilled with comprehensive test data. Due to Firestore security rules, we need authentication to perform these operations.

## 📊 Data to be Seeded

The seed script will add **50+ documents** including:

### 📝 Homepage Content (30+ documents)
- **Hero Section**: Welcome banner with bilingual content
- **Statistics**: Students, teachers, success rate, years established
- **Contact Information**: Address, phone, email, hours
- **Features (8)**: Excellence, Labs, Activities, Library, Orientation, E-Learning, Infrastructure, Support
- **News (6)**: Latest news articles with images
- **Testimonials (4)**: Student success stories
- **Announcements (4)**: Important dates and events
- **Clubs (5)**: Theater, Sciences, Football, Music, Environment
- **Gallery (4)**: Campus photos
- **Quick Links (4)**: Calendar, Results, Schedule, Library

### 🎓 Academic Hierarchy (10+ documents)
- **Academic Levels (3)**: Tronc Commun, 1ère Bac, 2ème Bac
- **Branches (3)**: Sciences Expérimentales, Sciences Math, Sciences Économiques
- **Subjects (5)**: Math, Physics-Chemistry, SVT, French, Arabic

### 📚 Educational Content (8+ documents)
- **Courses (3)**: Math equations, Physics motion, Biology cells
- **Exercises (2)**: Practice problems with solutions
- **Quizzes (2)**: Interactive assessments

## ✅ Solution: Use Firebase Console (Manual Method)

Since automated seeding requires authentication, here's the **easiest approach**:

### Step 1: Open Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select project: **eduinfor-fff3d**
3. Navigate to **Firestore Database**

### Step 2: Clear Existing Data (Optional)

If you want to start fresh:
1. Click on each collection
2. Select all documents
3. Click Delete

Collections to clear:
- `homepage-features`
- `homepage-news`
- `homepage-testimonials`
- `homepage-announcements`
- `homepage-clubs`
- `homepage-gallery`
- `homepage-quicklinks`
- `academicLevels`
- `branches`
- `subjects`
- `courses`
- `exercises`
- `quizzes`

### Step 3: Import Data Using Firebase Console

#### Method A: Manual Entry
Use the Firebase Console interface to add documents from `authenticated-seed.js` file.

#### Method B: Firebase CLI Import
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Temporarily open rules
cp firestore.rules.open firestore.rules
firebase deploy --only firestore:rules

# Run seed script
node authenticated-seed.js admin@edu.com YourPassword123

# Restore secure rules
cp firestore.rules.secure firestore.rules
firebase deploy --only firestore:rules
```

## 🔐 Alternative: Create Admin User First

If you don't have an admin user yet:

### Option 1: Via Application
1. Go to your app: `/signup`
2. Create account with:
   - Email: `admin@edu.com`
   - Password: `Admin@123!`
   - Role: **Teacher/Admin**
   - Full Name: `System Administrator`
3. After signup, run:
   ```bash
   node authenticated-seed.js admin@edu.com Admin@123!
   ```

### Option 2: Via Firebase Console
1. Go to Firebase Console → Authentication
2. Add user manually:
   - Email: `admin@edu.com`
   - Password: `Admin@123!`
3. Go to Firestore → `users` collection
4. Create document with UID from Auth:
   ```json
   {
     "email": "admin@edu.com",
     "fullName": "System Administrator",
     "role": "admin",
     "status": "approved",
     "createdAt": "2024-10-21T00:00:00Z"
   }
   ```
5. Run the seed script:
   ```bash
   node authenticated-seed.js admin@edu.com Admin@123!
   ```

## 🚀 Quick Start (Recommended Path)

### If You Can Access Firebase CLI:

```bash
# 1. Backup current rules
cp firestore.rules firestore.rules.backup

# 2. Deploy open rules temporarily
cat > firestore.rules.temp << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF

# 3. Deploy temporary rules
firebase deploy --only firestore:rules --config firestore.rules.temp

# 4. Run seed script (no auth needed with open rules)
node comprehensive-seed.js

# 5. Restore secure rules
firebase deploy --only firestore:rules --config firestore.rules.backup
```

### If Firebase CLI is Not Available:

1. **Create admin user** through the app at `/signup`
2. **Run authenticated seed**:
   ```bash
   node authenticated-seed.js your-admin@email.com YourPassword
   ```

## 📋 Verification

After seeding, verify the data:

1. **Check Firestore Console**:
   - Count documents in each collection
   - Verify data structure matches expectations

2. **Check Application**:
   - Visit homepage - should show all content
   - Login as admin - should see dashboard
   - Check courses page - should show sample courses

## ⚠️ Troubleshooting

### Error: "Missing or insufficient permissions"
- **Cause**: Firestore security rules blocking writes
- **Solution**: Use authenticated seeding OR temporarily open rules

### Error: "No admin user found"
- **Cause**: No admin account exists
- **Solution**: Create admin user via signup or Firebase Console

### Error: "Firebase CLI not found"
- **Cause**: Firebase tools not installed globally
- **Solution**: `npm install -g firebase-tools`

### Error: "Authentication failed"
- **Cause**: Wrong email/password
- **Solution**: Double-check credentials or reset password

## 📞 Need Help?

If seeding fails:
1. Check error messages carefully
2. Verify Firebase project is accessible
3. Ensure internet connection is stable
4. Try manual data entry via Firebase Console as fallback

## 🎉 Success Indicators

After successful seeding, you should see:
- ✅ 50+ documents created across all collections
- ✅ Homepage displays features, news, testimonials
- ✅ Admin dashboard shows academic hierarchy
- ✅ Students can browse courses
- ✅ No console errors in application

---

**Files Available:**
- `authenticated-seed.js` - Seed with admin authentication (recommended)
- `comprehensive-seed.js` - Seed without auth (requires open rules)
- `admin-seed.js` - Seed with Admin SDK (requires service account)
- `SEED_INSTRUCTIONS.md` - Brief instructions
- `firestore.rules.open` - Temporary open rules for seeding
- `firestore.rules.secure` - Original secure rules (backup)

Choose the method that works best for your environment!
