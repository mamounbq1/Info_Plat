# 📚 Complete Database Seeding Guide - seed-all-data.js

## 🎯 Purpose

This script (`seed-all-data.js`) provides **comprehensive database seeding** for the Moroccan Educational Platform, including:
- ✅ **Academic Hierarchy** (Levels, Branches, Subjects)
- ✅ **Educational Content** (Courses, Quizzes, Exercises)
- ✅ **Users** (Admins, Teachers, Students)

This is different from `seed-database.js` which only seeds the **homepage data** (hero, stats, features, news, etc.).

---

## 📊 What Gets Seeded

### 🎓 Academic Hierarchy (13 documents)
1. **3 Academic Levels**:
   - Tronc Commun (TC)
   - 1ère Baccalauréat (1BAC)
   - 2ème Baccalauréat (2BAC)

2. **4 Branches**:
   - Sciences Expérimentales (SVT)
   - Sciences Mathématiques (SM)
   - Lettres et Sciences Humaines (LH)
   - Sciences Économiques (ECO)

3. **10 Subjects** across all branches:
   - Mathématiques
   - Physique-Chimie
   - Sciences de la Vie et de la Terre (SVT)
   - Français
   - Arabe
   - Anglais
   - Histoire-Géographie
   - Éducation Islamique
   - Informatique
   - Philosophie

### 📖 Educational Content (45 documents)

#### 📝 20 Courses
Bilingual courses (French/Arabic) covering:
- **Mathematics** (3): Équations du Second Degré, Fonctions, Suites Numériques
- **Physics-Chemistry** (3): Cinématique, Électricité, Réactions Chimiques
- **Biology (SVT)** (2): Biologie Cellulaire, Génétique
- **French** (3): Grammaire, Littérature, Expression Écrite
- **English** (2): Grammar, Speaking & Writing
- **Arabic** (1): النحو والصرف
- **History-Geography** (2): Histoire du Maroc, Géographie Humaine
- **Computer Science** (2): Algorithmique, Python
- **Philosophy** (1): Introduction à la Philosophie

Each course includes:
- Bilingual titles and descriptions (French/Arabic)
- Subject and target levels
- Content type (PDF, video, link)
- Difficulty level
- Duration estimate
- Thumbnails from Unsplash
- Creator info, views, likes
- Tags for searchability

#### 🎯 15 Quizzes
Interactive quizzes with full question sets:
- **Mathematics**: Équations, Fonctions, Suites
- **Physics**: Cinématique, Électricité
- **Biology**: Cellule, ADN, Écosystèmes
- **French**: Grammaire, Conjugaison
- **English**: Grammar, Vocabulary
- **History**: Histoire du Maroc
- **Computer Science**: Algorithmique

Each quiz includes:
- Multiple-choice questions (4 options each)
- Correct answers marked
- Points per question
- Total points and passing score
- Duration in minutes
- Subject and level targeting

#### 💪 10 Exercises
Practice exercises with solutions:
- **Mathematics**: Équations, Fonctions, Suites
- **Physics-Chemistry**: Cinématique, Réactions Chimiques
- **Biology**: Biologie Cellulaire, Génétique
- **French**: Exercices de Rédaction
- **Computer Science**: Python Débutant

Each exercise includes:
- Question count
- Estimated completion time
- Difficulty level
- PDF file URLs
- Creator information

### 👥 Users (22 documents)

#### 🔐 2 Admin Users
- **Administrateur Principal** (admin001)
  - Full system access
  - Permissions: manage_users, manage_content, manage_settings, view_analytics
  
- **Super Admin** (admin002)
  - All permissions (*)
  - Ultimate system control

#### 👨‍🏫 8 Teacher Users
- **Prof. Ahmed Benjelloun** - Mathématiques (TC, 1BAC, 2BAC)
- **Prof. Fatima Zahrae** - Mathématiques, Physique-Chimie (1BAC, 2BAC)
- **Prof. Mohammed Tazi** - Physique-Chimie (TC, 1BAC)
- **Prof. Samira Idrissi** - SVT (TC, 1BAC, 2BAC)
- **Prof. Karim Alaoui** - Français (TC, 1BAC, 2BAC)
- **Prof. Laila Benchekroun** - English, Français (TC, 1BAC)
- **Prof. Youssef Amrani** - Histoire-Géographie (TC, 1BAC, 2BAC)
- **Prof. Amine Benslimane** - Informatique (TC, 1BAC, 2BAC)

Each teacher profile includes:
- Bilingual names (French/Arabic)
- Subject specializations
- Levels and branches taught
- Bio and qualifications
- Courses created count
- Total students
- Rating (4.7-4.9 stars)
- Profile photo from pravatar.cc

#### 👨‍🎓 12 Student Users
Diverse student profiles across:
- **2BAC Students** (4): Salma, Ayoub, Hamza, Sofia
- **1BAC Students** (4): Omar, Imane, Mariam, Mehdi
- **TC Students** (4): Yassine, Nour, Anas, Yasmine

Each student profile includes:
- Bilingual names (French/Arabic)
- Current level and branch
- Enrolled courses count
- Completed courses count
- Total points earned
- Average score percentage
- Achievement badges
- Profile photo from pravatar.cc
- Realistic activity timestamps

---

## 🚀 How to Run

### Prerequisites
1. **Node.js installed** (v14 or higher)
2. **Firebase project configured** (firestore.rules set to test mode temporarily)
3. **Repository cloned** to your local machine

### Step-by-Step Instructions

#### 1. Clone the Repository (if not already done)
```bash
git clone https://github.com/mamounbq1/Info_Plat.git
cd Info_Plat
```

#### 2. Switch to the Development Branch
```bash
git checkout genspark_ai_developer
```

#### 3. Verify the Script Exists
```bash
ls -lh seed-all-data.js
```
You should see the file (~60KB).

#### 4. Set Firebase to Test Mode (IMPORTANT!)
⚠️ **This is critical** - your current security rules block unauthenticated writes.

**Option A: Via Firebase Console (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `eduinfor-fff3d`
3. Navigate to **Firestore Database** → **Rules**
4. Temporarily replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
5. Click **Publish**

**Option B: Use the Provided Test Mode File**
```bash
# The repository includes firestore.rules.testmode
# Copy its contents to Firebase Console Rules tab
cat firestore.rules.testmode
```

#### 5. Run the Seeding Script
```bash
node seed-all-data.js
```

#### 6. Watch the Output
You'll see detailed progress:
```
╔═══════════════════════════════════════════════════════════════╗
║     🎓 COMPREHENSIVE DATABASE SEEDING - ALL DATA TYPES       ║
╚═══════════════════════════════════════════════════════════════╝

📦 PHASE 1: CLEARING COLLECTIONS (Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   🗑️  Clearing academicLevels...
   ✅ Deleted 3 documents from academicLevels
   ...

╔═══════════════════════════════════════════════════════════════╗
║           🎓 PHASE 2: SEEDING ACADEMIC HIERARCHY              ║
╚═══════════════════════════════════════════════════════════════╝

1️⃣  Adding Academic Levels (3 items)...
   ✅ 3 Academic Levels added
   ...

╔═══════════════════════════════════════════════════════════════╗
║              📖 PHASE 3: SEEDING COURSES                       ║
╚═══════════════════════════════════════════════════════════════╝

📝 Adding Courses (20 items)...
   ✅ 20 Courses added
   ...

╔═══════════════════════════════════════════════════════════════╗
║          🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!          ║
╚═══════════════════════════════════════════════════════════════╝

📊 SUMMARY OF SEEDED DATA:

🎓 ACADEMIC HIERARCHY:
   • Academic Levels: 3 documents
   • Branches: 4 documents
   • Subjects: 10 documents

📚 EDUCATIONAL CONTENT:
   • Courses: 20 documents
   • Quizzes: 15 documents (with questions)
   • Exercises: 10 documents

👥 USERS:
   • Admin Users: 2 documents
   • Teacher Users: 8 documents
   • Student Users: 12 documents

   ═══════════════════════════════════════════
   📊 TOTAL DOCUMENTS CREATED: 80
   ═══════════════════════════════════════════

✨ Your database is now fully populated!
🌐 Visit your application to see all the content!
```

#### 7. Restore Production Security Rules
⚠️ **IMPORTANT:** After seeding, restore your production rules!

Go back to Firebase Console → Firestore → Rules and restore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Homepage sections - public read
    match /homepage/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections follow existing rules...
  }
}
```

---

## 🔍 Verifying the Data

### Via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `eduinfor-fff3d`
3. Navigate to **Firestore Database**
4. Check these collections:
   - `academicLevels` (3 docs)
   - `branches` (4 docs)
   - `subjects` (10 docs)
   - `courses` (20 docs)
   - `quizzes` (15 docs)
   - `exercises` (10 docs)
   - `users` (22 docs)

### Via Your Application
1. Open your web application
2. Navigate to:
   - **Courses page** → Should show 20 courses across all subjects
   - **Quizzes page** → Should show 15 quizzes with questions
   - **Exercises page** → Should show 10 exercises
   - **Users/Teachers page** → Should show 8 teacher profiles
   - **Students page** → Should show 12 student profiles

---

## 📝 What's Different from seed-database.js?

| Feature | `seed-database.js` | `seed-all-data.js` |
|---------|-------------------|-------------------|
| **Purpose** | Homepage data only | Complete educational platform |
| **Collections** | 1 collection (`homepage`) | 7 collections |
| **Documents** | 65+ homepage sections | 80 documents total |
| **Users** | ❌ No | ✅ Yes (22 users) |
| **Courses** | ❌ No | ✅ Yes (20 courses) |
| **Quizzes** | ❌ No | ✅ Yes (15 quizzes) |
| **Exercises** | ❌ No | ✅ Yes (10 exercises) |
| **Academic Hierarchy** | ❌ No | ✅ Yes (17 docs) |
| **Bilingual Content** | Partial | ✅ Full (French/Arabic) |
| **When to Use** | Initial homepage setup | Complete platform reset |

---

## ⚠️ Important Notes

### 🔒 Security
- **Test mode is insecure** - Only use temporarily during seeding
- **Restore production rules** immediately after seeding
- **Never leave test mode enabled** in production

### 🗑️ Data Clearing
The script automatically clears these collections before seeding:
- `academicLevels`
- `branches`
- `subjects`
- `courses`
- `quizzes`
- `exercises`
- `users`

⚠️ **All existing data in these collections will be deleted!**

If you want to preserve existing data, comment out the clearing phase:
```javascript
// PHASE 1: Clear all data collections (optional)
// Uncomment the lines below if you want to keep existing data
// console.log("📦 PHASE 1: CLEARING COLLECTIONS (Optional)");
// for (const collectionName of collectionsToClean) {
//   await clearCollection(collectionName);
// }
```

### 📊 Document Counts
Total documents created: **80**
- Academic Hierarchy: 17 docs
- Educational Content: 45 docs
- Users: 22 docs

---

## 🆘 Troubleshooting

### Error: "Missing or insufficient permissions"
**Solution:** Set Firestore rules to test mode (see Step 4)

### Error: "Module not found: firebase"
**Solution:** The script uses ES6 imports. Make sure you're using Node.js v14+ and have `type: "module"` in package.json, or run with:
```bash
node --experimental-modules seed-all-data.js
```

### Script runs but no data appears
**Solution:** 
1. Check Firebase Console → Firestore Database
2. Verify the collections exist
3. Check browser console for errors
4. Ensure your app is pointing to the correct Firebase project

### Want to seed only specific collections?
Edit the `seedAllData()` function and comment out phases you don't need:
```javascript
// Skip users seeding
// await seedUsers();
```

---

## 🎉 Success!

After running this script successfully, your database will have:
- ✅ Complete academic structure for Moroccan education system
- ✅ 20 bilingual courses across 10 subjects
- ✅ 15 interactive quizzes with questions
- ✅ 10 practice exercises
- ✅ 8 teacher profiles with specializations
- ✅ 12 student profiles with progress tracking
- ✅ 2 admin accounts for system management

Your Moroccan Educational Platform is now fully populated and ready to use! 🇲🇦📚

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify Firebase security rules are in test mode
3. Review the [Firebase Console](https://console.firebase.google.com/)
4. Refer to the main guides:
   - `FOR_GITHUB_USERS.md` - General GitHub access guide
   - `HOW_TO_PULL_AND_SEED.md` - Clone and setup instructions
   - `MANUAL_SEEDING_FIREBASE_CONSOLE.md` - No-code manual seeding
   - `SEEDING_INSTRUCTIONS.md` - Automated seeding overview

Good luck! 🚀
