# 🎯 Getting Started - Choose Your Path

Welcome to the Moroccan Educational Platform! Choose the guide that best fits your needs.

## 📚 Documentation Overview

We've created multiple guides to help you get started quickly:

### ⚡ [QUICKSTART.md](./QUICKSTART.md) - 5 Minutes
**Best for**: Getting up and running ASAP  
**You'll learn**: Minimal setup to see the platform working  
**Time**: 5 minutes

```bash
# Quick commands
git clone https://github.com/mamounbq1/Info_Plat.git
cd Info_Plat
npm install
# Configure Firebase (see QUICKSTART.md)
npm run dev
```

---

### 🔧 [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Step by Step
**Best for**: First-time users, detailed setup  
**You'll learn**: Complete Firebase configuration, security rules, troubleshooting  
**Time**: 15-20 minutes

**Covers**:
- ✅ Firebase project creation
- ✅ Authentication setup
- ✅ Firestore configuration
- ✅ Storage setup
- ✅ Security rules
- ✅ Environment variables
- ✅ Common issues

---

### 📖 [README.md](./README.md) - Complete Documentation
**Best for**: Understanding all features  
**You'll learn**: Every feature, customization options, usage patterns  
**Time**: 30-45 minutes read

**Covers**:
- ✅ All features explained
- ✅ Project structure
- ✅ Usage guide for teachers and students
- ✅ Bilingual support details
- ✅ Security implementation
- ✅ Customization options
- ✅ Browser support

---

### 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Production Ready
**Best for**: Deploying to production  
**You'll learn**: Multiple deployment options, monitoring, scaling  
**Time**: 20-30 minutes

**Deployment Options**:
- 🔥 Firebase Hosting (Recommended)
- ⚡ Vercel
- 📦 Netlify
- 🐳 Docker + Cloud Run

**Also Covers**:
- ✅ CI/CD setup
- ✅ Environment configuration
- ✅ Security hardening
- ✅ Monitoring and analytics
- ✅ Performance optimization

---

### 📊 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Technical Overview
**Best for**: Understanding the architecture  
**You'll learn**: Tech stack, database schema, project decisions  
**Time**: 15-20 minutes read

**Covers**:
- ✅ Technical stack details
- ✅ Project structure
- ✅ Database schema
- ✅ Security implementation
- ✅ Development commands
- ✅ Future enhancements

---

## 🎓 Recommended Learning Path

### For Beginners
1. Start with **QUICKSTART.md** (5 min)
2. If issues arise, check **SETUP_GUIDE.md**
3. Explore features in **README.md**
4. When ready to deploy, see **DEPLOYMENT.md**

### For Experienced Developers
1. Skim **PROJECT_SUMMARY.md** (architecture)
2. Follow **QUICKSTART.md** (5 min setup)
3. Jump to **DEPLOYMENT.md** (production)
4. Reference **README.md** as needed

### For Students/Teachers (Users)
1. Ask your admin to set up the platform
2. Read the "Usage Guide" section in **README.md**
3. Start using the platform!

---

## 🎯 Quick Decision Guide

**I want to...**

### See it working NOW
→ Go to **QUICKSTART.md**

### Understand how to set up Firebase properly
→ Go to **SETUP_GUIDE.md**

### Learn about all features
→ Go to **README.md**

### Deploy to production
→ Go to **DEPLOYMENT.md**

### Understand the technical architecture
→ Go to **PROJECT_SUMMARY.md**

### Fix a specific issue
→ Check troubleshooting sections in **SETUP_GUIDE.md** or **DEPLOYMENT.md**

---

## 🌟 Platform Features at a Glance

### 👥 Two User Roles
- **Admin (Teachers)**: Upload content, manage courses
- **Students**: Access courses, track progress

### 📚 Content Types Supported
- 📄 PDF documents
- 🎥 YouTube videos
- 🔗 Google Docs/Drive links

### 🌍 Bilingual Interface
- 🇫🇷 French (Français)
- 🇸🇦 Arabic (العربية) with RTL support

### 📱 Modern Features
- ✅ Mobile responsive
- ✅ Real-time sync
- ✅ Progress tracking
- ✅ Toast notifications
- ✅ Secure authentication

---

## 🔧 Tech Stack Summary

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router DOM v6
- **Icons**: Heroicons

---

## 📞 Need Help?

### During Setup
1. Check the specific guide you're following
2. Look for troubleshooting sections
3. Verify Firebase configuration
4. Check browser console for errors

### Common Issues

**Firebase connection error**
- Verify `.env` file exists and has all values
- Restart dev server after changing `.env`

**Authentication not working**
- Enable Email/Password in Firebase Console
- Check Firestore security rules are published

**File upload failing**
- Enable Storage in Firebase Console
- Verify Storage security rules

**Can't see courses**
- Check user role (admin vs student)
- Verify courses are published
- Check Firestore rules allow read access

---

## 📂 Project Files Quick Reference

```
📁 Documentation Files
├── QUICKSTART.md          ⚡ 5-minute setup
├── SETUP_GUIDE.md         🔧 Detailed setup
├── README.md              📖 Complete docs
├── DEPLOYMENT.md          🚀 Production guide
├── PROJECT_SUMMARY.md     📊 Technical overview
└── GETTING_STARTED.md     🎯 This file

📁 Configuration Files
├── .env.example           🔐 Environment template
├── firestore.rules        🔒 Database rules
├── storage.rules          🔒 Storage rules
├── tailwind.config.js     🎨 Styling config
└── vite.config.js         ⚙️ Build config

📁 Source Code
├── src/
│   ├── components/        🧩 Reusable components
│   ├── contexts/          🔄 State management
│   ├── pages/             📄 Page components
│   ├── config/            ⚙️ Configuration
│   └── App.jsx            🏠 Main app
```

---

## 🎉 Ready to Start?

Choose your path above and let's get started!

### Quick Links
- [⚡ 5-Minute Setup](./QUICKSTART.md)
- [🔧 Detailed Setup](./SETUP_GUIDE.md)
- [📖 Full Documentation](./README.md)
- [🚀 Deploy to Production](./DEPLOYMENT.md)
- [📊 Technical Details](./PROJECT_SUMMARY.md)

### Repository
🔗 **GitHub**: https://github.com/mamounbq1/Info_Plat

---

**Happy Learning! / Bon apprentissage! / !تعلم سعيد**

🎓 Built for Moroccan Tronc Commun Students 🇲🇦
