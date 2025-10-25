# 🎓 Student Dashboard Access Guide

## 📍 Your Development Server

**Public URL:** https://5174-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai

**Status:** ✅ Running (Fixed AboutPage error)

---

## 🔐 Demo Student Account

**Email:** `student@example.com`  
**UID:** `LWEXbr9LI8TadxhY9SwRbn2xqHA2`  
**Role:** Student  

> **Note:** You'll need to create a password for this account in Firebase Authentication Console or register a new student account.

---

## 🚀 Quick Access Methods

### Method 1: Login with Existing Account (If Password Set)

1. **Visit Login Page:**
   ```
   https://5174-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/login
   ```

2. **Enter Credentials:**
   - Email: `student@example.com`
   - Password: Your password (if set in Firebase Console)

3. **Dashboard Access:**
   - After login, you'll be redirected to `/dashboard`
   - The system will check your role and show the Student Dashboard

---

### Method 2: Create New Student Account

1. **Visit Signup Page:**
   ```
   https://5174-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/signup
   ```

2. **Register as Student:**
   - Full Name: Your name
   - Email: Your email address
   - Password: Choose a password
   - Confirm password
   - Select Role: **Student**

3. **Approval Process:**
   - New student accounts require admin approval
   - You'll see a "Pending Approval" page
   - An admin needs to approve your account first

4. **After Approval:**
   - Login and access your student dashboard

---

### Method 3: Set Password for Demo Account (Firebase Console)

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users
   ```

2. **Find Demo Student:**
   - Look for `student@example.com` or UID `LWEXbr9LI8TadxhY9SwRbn2xqHA2`

3. **Set Password:**
   - Click on the user
   - Select "Reset password" or "Set password"
   - Enter a new password
   - Save

4. **Login:**
   - Now you can login with `student@example.com` and your new password

---

## 🎯 Student Dashboard Features

Once logged in as a student, you'll have access to:

### 📚 Main Features
- **Dashboard Home:** Overview of your progress and enrolled courses
- **My Courses:** Browse and access all available courses
- **Course View:** Read PDFs, watch videos, access study materials
- **Progress Tracking:** Track your learning progress
- **Bookmarks:** Save important content for quick access
- **Achievements:** View your earned badges and achievements
- **Settings:** Update profile, change language (FR/AR), theme preferences

### 🌐 Public Pages (No Login Required)
- **Homepage:** https://[URL]/
- **About:** https://[URL]/about
- **News:** https://[URL]/news
- **Gallery:** https://[URL]/gallery
- **Clubs:** https://[URL]/clubs
- **Contact:** https://[URL]/contact
- **Events:** https://[URL]/events
- **Teachers:** https://[URL]/teachers

---

## 🔄 User Roles & Routes

The application has a smart routing system:

### Student Routes
- `/dashboard` → Student Dashboard (after login)
- `/courses` → Browse available courses
- `/course/:id` → View specific course
- `/my-courses` → Your enrolled courses
- `/achievements` → Your achievements
- `/bookmarks` → Saved content
- `/settings` → Profile settings

### Admin Routes (Teachers)
- `/admin` → Admin Dashboard
- Full CMS access for managing content

### Public Routes (Everyone)
- `/` → Homepage
- `/about` → About page
- `/news` → News page
- `/gallery` → Gallery page
- `/clubs` → Clubs page
- `/contact` → Contact page

---

## 🐛 Recent Bug Fix

### Issue Resolved ✅
**Error:** "Cannot read properties of undefined (reading 'fr')" in AboutPage

**Solution Applied:**
- Added validation for content structure
- Implemented safe merging with default content
- Added enabled flag check for fetched data
- Improved error handling

**Status:** Fixed and deployed (Commit: `cda3f16`)

---

## 🆘 Troubleshooting

### Can't Login?
1. Check if password is set for demo account in Firebase Console
2. Try creating a new student account via signup
3. Clear browser cache and cookies
4. Check browser console for errors (F12)

### Stuck on "Pending Approval"?
1. Login as admin account: `teacher@example.com`
2. Go to Admin Dashboard → Users
3. Find your student account
4. Click "Approve"

### Page Not Loading?
1. Check dev server is running (see URL above)
2. Clear browser cache
3. Check for console errors
4. Ensure Firebase is properly configured

### Features Not Working?
1. Check internet connection (Firebase requires internet)
2. Verify Firebase configuration in `.env`
3. Check browser console for errors
4. Try different browser

---

## 📊 Account Status

### Demo Accounts Available

| Email | Role | UID | Status |
|-------|------|-----|--------|
| `student@example.com` | Student | `LWEXbr9LI8TadxhY9SwRbn2xqHA2` | Needs password |
| `teacher@example.com` | Admin/Teacher | `dbt1SnmRoHQJqWU8LpeWlvl4R0W2` | Needs password |

**To Set Passwords:**
Visit Firebase Console → Authentication → Users → Click user → Set password

---

## 🎨 Interface Features

### Language Support
- **French (Français):** Default language
- **Arabic (العربية):** Full RTL support
- Toggle in top navigation bar

### Theme Support
- **Light Mode:** Default theme
- **Dark Mode:** Toggle in navigation
- Preference saved in browser

### Mobile Responsive
- ✅ Fully responsive design
- ✅ Works on all screen sizes
- ✅ Touch-friendly navigation

---

## 🔐 Security Notes

### Student Account Permissions
Students can:
- ✅ View public pages
- ✅ Access enrolled courses
- ✅ Track their progress
- ✅ Update their own profile
- ✅ Bookmark content

Students cannot:
- ❌ Access admin dashboard
- ❌ Create/edit courses
- ❌ Manage other users
- ❌ Access admin CMS
- ❌ Modify system settings

### Approval System
- New student registrations require admin approval
- This prevents unauthorized access
- Admins can approve/reject from Admin Dashboard

---

## 📞 Support

### Need Help?
- **Firebase Console:** https://console.firebase.google.com/project/eduinfor-fff3d
- **GitHub Repository:** https://github.com/mamounbq1/Info_Plat
- **Pull Request (Latest):** https://github.com/mamounbq1/Info_Plat/pull/2

### Documentation
- `README.md` - General documentation
- `QUICK_START.md` - Quick launch guide
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `GETTING_STARTED.md` - Getting started guide

---

## ✅ Quick Checklist

Before accessing student dashboard:

- [ ] Dev server is running
- [ ] Firebase is configured (check `.env`)
- [ ] Password is set for demo account OR new account created
- [ ] For new accounts: Admin approval obtained
- [ ] Browser cache cleared if issues persist
- [ ] Internet connection active

---

**Last Updated:** 2025-10-21  
**Status:** ✅ AboutPage Error Fixed  
**Dev Server:** Running on Port 5174  
**Branch:** genspark_ai_developer
