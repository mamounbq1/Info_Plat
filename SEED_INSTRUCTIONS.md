# Database Seeding Instructions

## Problem
The seed scripts require authentication to write to Firestore due to security rules.

## Solution Options

### Option 1: Temporarily Open Firestore Rules (Recommended for Development)

1. **Backup current rules**:
   ```bash
   cp firestore.rules firestore.rules.backup
   ```

2. **Deploy temporary open rules**:
   Edit `firestore.rules` and replace with:
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

3. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Run the seed script**:
   ```bash
   node comprehensive-seed.js
   ```

5. **Restore secure rules**:
   ```bash
   cp firestore.rules.backup firestore.rules
   firebase deploy --only firestore:rules
   ```

### Option 2: Use Firebase Console (Manual Seeding)

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Manually add collections and documents using the provided data in `comprehensive-seed.js`

### Option 3: Create Admin User and Use Authentication

1. Create an admin user through your app's signup
2. Update the seed script to authenticate with that user
3. Run the seed script

### Option 4: Use Firebase CLI Service Account

1. Download service account key from Firebase Console
2. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
   ```
3. Run `admin-seed.js`

## Recommended Approach for Quick Seeding

The fastest way is Option 1 - temporarily opening the rules. This is safe for development environments.

**⚠️ WARNING**: Never deploy open rules to production!

## Current Data to be Seeded

The comprehensive seed script will add:

- **Homepage Content**: Hero, Stats, Contact, Features, News, Testimonials, Announcements, Clubs, Gallery, Quick Links
- **Academic Hierarchy**: Levels (TC, 1BAC, 2BAC), Branches, Subjects
- **Educational Content**: Courses, Exercises, Quizzes
- **Total**: ~50+ documents across all collections

## After Seeding

Remember to:
1. Restore secure Firestore rules
2. Test the application
3. Verify all data appears correctly
