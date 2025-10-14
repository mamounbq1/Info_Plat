# 🚀 Quick Setup Guide

## Step-by-Step Installation

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it (e.g., "moroccan-edu-platform")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 3️⃣ Enable Firebase Services

#### Authentication
1. Go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Enable it and Save

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose **Production mode**
4. Select nearest location (europe-west for Morocco)
5. Click **Enable**

#### Cloud Storage
1. Go to **Storage**
2. Click **Get Started**
3. Use default security rules
4. Click **Done**

### 4️⃣ Configure Security Rules

#### Firestore Rules
Go to **Firestore Database** → **Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### Storage Rules
Go to **Storage** → **Rules** tab:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 5️⃣ Get Firebase Configuration

1. Go to **Project Settings** (⚙️ icon)
2. Scroll to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app name: "moroccan-edu-web"
5. Copy the configuration object

### 6️⃣ Create Environment File

Create `.env` file in project root:

```bash
cp .env.example .env
```

Paste your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 7️⃣ Update Firebase Config File

Edit `src/config/firebase.js`:

Replace the placeholder config with:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### 8️⃣ Start Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

### 9️⃣ Create First Admin Account

1. Click **Inscription** (Sign Up)
2. Fill in details
3. Select **Enseignant / Admin** as account type
4. Click **Inscription**

### 🎉 You're Ready!

Now you can:
- ✅ Login as admin
- ✅ Add courses with PDFs, videos, or links
- ✅ Create student accounts
- ✅ Share courses with students

## 🐛 Common Issues

### Firebase Connection Error
- Check if `.env` file exists
- Verify all environment variables are set
- Restart development server after changing `.env`

### Authentication Not Working
- Ensure Email/Password is enabled in Firebase
- Check browser console for errors
- Clear browser cache

### File Upload Fails
- Verify Storage is enabled in Firebase
- Check Storage security rules
- Ensure file size is under 10MB

### Firestore Permission Denied
- Copy the Firestore rules exactly as shown above
- Wait 1-2 minutes for rules to propagate
- Refresh the page

## 📞 Need Help?

Check the main README.md for detailed documentation.
