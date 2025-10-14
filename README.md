# 🎓 Moroccan Educational Platform for Tronc Commun

A modern, bilingual (French/Arabic) educational platform designed for Moroccan high school students in Tronc Commun. Features include course management, interactive quizzes, progress tracking, and a clean mobile-friendly interface.

## ✨ Features

### 👥 User Roles
- **Admin (Teachers)**: Upload content, create quizzes, manage courses
- **Students**: Access courses, take quizzes, track progress

### 📚 Content Management
- **Multiple Content Types**:
  - PDF documents with in-browser viewer
  - YouTube video integration
  - Google Docs/Drive links
- **Easy Upload**: Drag-and-drop file upload to Firebase Storage
- **Rich Course Information**: Bilingual titles and descriptions

### 🎯 Key Features
- ✅ User Authentication (Firebase Auth)
- ✅ Role-based Access Control
- ✅ Bilingual Interface (French & Arabic with RTL support)
- ✅ Mobile-Responsive Design
- ✅ Progress Tracking
- ✅ Real-time Data Sync (Firestore)
- ✅ Modern UI with Tailwind CSS
- ✅ Toast Notifications
- ✅ Protected Routes

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v16 or higher)
- npm or yarn
- A Firebase account (free tier works)
- Git (for version control)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd moroccan-edu-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard
4. Enable the following services:

#### Enable Firebase Authentication
1. Go to Authentication → Sign-in method
2. Enable "Email/Password" authentication

#### Create Firestore Database
1. Go to Firestore Database
2. Click "Create Database"
3. Start in **Production Mode**
4. Choose your preferred location

#### Set Up Firestore Security Rules
Go to Firestore → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Courses collection
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Quizzes collection
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### Enable Cloud Storage
1. Go to Storage
2. Click "Get Started"
3. Use default security rules initially

#### Set Up Storage Security Rules
Go to Storage → Rules and paste:

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

### 4. Configure Environment Variables

1. In Firebase Console, go to Project Settings → General
2. Scroll to "Your apps" and click the web icon (</>)
3. Register your app
4. Copy the Firebase configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Update Firebase Configuration

Edit `src/config/firebase.js`:

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

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📱 Usage Guide

### For Teachers (Admin)

1. **Register as Admin**:
   - Go to signup page
   - Select "Enseignant / Admin" as account type
   - Complete registration

2. **Add Course**:
   - Navigate to Admin Dashboard
   - Click "Ajouter un cours"
   - Fill in bilingual course information
   - Choose content type (PDF, Video, or Link)
   - Upload or paste URL
   - Toggle "Publish immediately" if ready
   - Click "Enregistrer"

3. **Manage Courses**:
   - View all courses in the dashboard table
   - Delete courses with the trash icon
   - Monitor course statistics

### For Students

1. **Register as Student**:
   - Go to signup page
   - Select "Étudiant" as account type
   - Complete registration

2. **Browse Courses**:
   - View all available courses on Student Dashboard
   - See progress for each course
   - Click "Voir le cours" to access content

3. **Access Course Content**:
   - View PDFs in-browser or download
   - Watch YouTube videos embedded
   - Access Google Docs links
   - Mark courses as completed

4. **Track Progress**:
   - View overall progress percentage
   - See individual course progress
   - Monitor quiz scores

## 🌐 Bilingual Support

The platform supports both French and Arabic:

- **Language Toggle**: Click the language icon in navbar
- **RTL Support**: Automatic right-to-left layout for Arabic
- **Bilingual Content**: All courses have both French and Arabic titles/descriptions
- **Persistent Preference**: Language choice saved in localStorage

## 📁 Project Structure

```
moroccan-edu-platform/
├── src/
│   ├── components/         # Reusable UI components
│   │   └── Navbar.jsx     # Navigation bar
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.jsx      # Authentication state
│   │   └── LanguageContext.jsx  # Language/i18n state
│   ├── pages/             # Page components
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # Login page
│   │   ├── Signup.jsx            # Registration page
│   │   ├── StudentDashboard.jsx  # Student interface
│   │   ├── AdminDashboard.jsx    # Teacher interface
│   │   └── CourseView.jsx        # Course viewer
│   ├── config/            # Configuration files
│   │   └── firebase.js           # Firebase config
│   ├── App.jsx            # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── README.md           # This file
```

## 🔒 Security

- **Authentication Required**: All routes protected
- **Role-Based Access**: Admin-only features restricted
- **Firestore Rules**: Server-side security rules
- **Storage Rules**: Authenticated access only
- **Environment Variables**: Sensitive data in `.env`

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the primary color:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Translations
Add more translations in `src/contexts/LanguageContext.jsx`:

```javascript
const translations = {
  fr: {
    newKey: 'Nouveau texte'
  },
  ar: {
    newKey: 'نص جديد'
  }
}
```

## 🚀 Deployment

### Firebase Hosting (Recommended)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase Hosting:
```bash
firebase init hosting
```

4. Build the project:
```bash
npm run build
```

5. Deploy:
```bash
firebase deploy --only hosting
```

### Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify `.env` file has correct values
- Check Firebase project settings
- Ensure Firebase services are enabled

### Authentication Errors
- Verify Email/Password auth is enabled
- Check Firestore security rules
- Clear browser cache and cookies

### File Upload Issues
- Verify Storage is enabled
- Check Storage security rules
- Ensure file size is under 10MB

## 📝 Future Enhancements

- [ ] Quiz creation and taking system
- [ ] Comment section under courses
- [ ] Email notifications
- [ ] Progress analytics dashboard
- [ ] Student management for admins
- [ ] Discussion forums
- [ ] Live chat support
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Advanced search and filters

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created for Moroccan high school students (Tronc Commun)

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Tailwind CSS for styling
- Heroicons for icons
- React team for the framework

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

**Happy Learning! 🎓 / !تعلم سعيد 📚**
