# 🔐 Admin Authentication Setup Guide

## Overview

The `seed-all-data.js` script creates Firestore documents for users, but **does NOT create Firebase Authentication users**. This guide shows you how to create admin accounts that can actually log in.

---

## 🎯 Two Methods to Create Admin Accounts

### ✅ **Method 1: Firebase Console (Easiest - No Code)**

#### Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users

#### Step 2: Add Admin Users Manually

**Admin 1: Administrateur Principal**
1. Click **"Add user"**
2. Enter:
   - Email: `admin@eduplatform.ma`
   - Password: `Admin@2025!Secure` (or your choice)
3. Click **"Add user"**
4. User created! ✅

**Admin 2: Super Admin**
1. Click **"Add user"**
2. Enter:
   - Email: `superadmin@eduplatform.ma`
   - Password: `SuperAdmin@2025!Secure` (or your choice)
3. Click **"Add user"**
4. User created! ✅

#### Step 3: Set UIDs (Optional but Recommended)

The UIDs should match the Firestore documents:
- Admin 1: `admin001`
- Admin 2: `admin002`

**To set custom UID:**
This requires Firebase Admin SDK or can be done during creation via API.

#### Step 4: Test Login
Go to your application login page and test:
- Email: `admin@eduplatform.ma`
- Password: `Admin@2025!Secure`

---

### ✅ **Method 2: Automated Script with Admin SDK**

This method uses the `create-admin-auth-users.js` script to automatically create admin accounts with passwords.

#### Prerequisites

1. **Install Firebase Admin SDK**
```bash
npm install firebase-admin
```

2. **Download Service Account Key**
   - Go to: https://console.firebase.google.com/project/eduinfor-fff3d/settings/serviceaccounts/adminsdk
   - Click **"Generate new private key"**
   - Save as `serviceAccountKey.json` in your project root
   - ⚠️ **NEVER commit this file to Git!**

#### Step 1: Add to .gitignore
```bash
echo "serviceAccountKey.json" >> .gitignore
```

#### Step 2: Run the Script
```bash
node create-admin-auth-users.js
```

#### Expected Output
```
╔═══════════════════════════════════════════════════════════════╗
║         🔐 CREATING ADMIN AUTHENTICATION USERS               ║
╚═══════════════════════════════════════════════════════════════╝

📝 Creating admin user: admin@eduplatform.ma
   ✅ Firebase Auth user created: admin001
   ✅ Custom claims set (role: admin)
   ✅ Firestore document created
   🔑 Login Credentials:
      Email: admin@eduplatform.ma
      Password: Admin@2025!Secure

📝 Creating admin user: superadmin@eduplatform.ma
   ✅ Firebase Auth user created: admin002
   ✅ Custom claims set (role: admin)
   ✅ Firestore document created
   🔑 Login Credentials:
      Email: superadmin@eduplatform.ma
      Password: SuperAdmin@2025!Secure

╔═══════════════════════════════════════════════════════════════╗
║              ✅ ADMIN USERS CREATED SUCCESSFULLY!             ║
╚═══════════════════════════════════════════════════════════════╝

📊 ADMIN LOGIN CREDENTIALS:

👤 Administrateur Principal
   📧 Email: admin@eduplatform.ma
   🔑 Password: Admin@2025!Secure

👤 Super Admin
   📧 Email: superadmin@eduplatform.ma
   🔑 Password: SuperAdmin@2025!Secure

⚠️  IMPORTANT SECURITY NOTES:
   1. Change these passwords immediately after first login
   2. Never commit passwords to version control
   3. Use strong, unique passwords for production
   4. Enable 2FA for admin accounts
```

---

## 🔑 Default Admin Credentials

### Admin 1: Administrateur Principal
```
Email: admin@eduplatform.ma
Password: Admin@2025!Secure
Role: admin
Permissions: manage_users, manage_content, manage_settings, view_analytics
```

### Admin 2: Super Admin
```
Email: superadmin@eduplatform.ma
Password: SuperAdmin@2025!Secure
Role: admin
Permissions: * (all permissions)
```

---

## 🔐 Password Security Recommendations

### ✅ Production Passwords Should:
- Be at least 12 characters long
- Include uppercase and lowercase letters
- Include numbers and special characters
- NOT be shared or reused
- Be changed immediately after first use

### ✅ Example Strong Passwords:
```
Admin@Morocco2025!Secure#789
SuperAdmin$Platform2025@Safe!
Morocco#EducPlatform2025$Strong
```

### ⚠️ NEVER Use These in Production:
- Simple passwords like `admin123`, `password`, `123456`
- Dictionary words
- Personal information (names, birthdays)
- Default passwords from documentation

---

## 🔄 Changing Admin Passwords

### Method 1: Firebase Console
1. Go to: https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users
2. Find the admin user
3. Click **"⋮"** (three dots)
4. Select **"Reset password"**
5. Enter new password
6. Click **"Save"**

### Method 2: In Your Application
Implement a password reset feature using Firebase Auth:
```javascript
import { getAuth, updatePassword } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

updatePassword(user, 'NewStrongPassword@2025!')
  .then(() => {
    console.log('Password updated successfully');
  })
  .catch((error) => {
    console.error('Error updating password:', error);
  });
```

---

## 🧪 Testing Admin Login

### Test in Your Application

1. **Navigate to Login Page**
   - URL: `http://localhost:5173/login` (or your app URL)

2. **Enter Admin Credentials**
   - Email: `admin@eduplatform.ma`
   - Password: `Admin@2025!Secure`

3. **Verify Admin Access**
   - Should redirect to admin dashboard
   - Should see admin-only features
   - Should have full permissions

4. **Check User Profile**
   - Should show role: `admin`
   - Should show permissions array

---

## 🔍 Verifying Admin Setup

### Check Firebase Authentication
1. Go to: https://console.firebase.google.com/project/eduinfor-fff3d/authentication/users
2. You should see:
   - ✅ `admin@eduplatform.ma`
   - ✅ `superadmin@eduplatform.ma`
3. Both should be verified and enabled

### Check Firestore Documents
1. Go to: https://console.firebase.google.com/project/eduinfor-fff3d/firestore/data
2. Navigate to `users` collection
3. You should see documents with IDs:
   - ✅ `admin001`
   - ✅ `admin002`
4. Each should have:
   - `role: "admin"`
   - `email: "admin@eduplatform.ma"` (or superadmin)
   - `permissions` array
   - `active: true`

### Test Custom Claims
In your application, check if custom claims are set:
```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  user.getIdTokenResult()
    .then((idTokenResult) => {
      console.log('Role:', idTokenResult.claims.role);
      console.log('Permissions:', idTokenResult.claims.permissions);
      
      if (idTokenResult.claims.role === 'admin') {
        console.log('✅ Admin access confirmed');
      }
    });
}
```

---

## ⚠️ Troubleshooting

### Issue: "Cannot log in with admin credentials"
**Solution:**
1. Verify user exists in Firebase Authentication Console
2. Check if email is correct (no typos)
3. Verify password was set correctly
4. Check if account is enabled (not disabled)

### Issue: "User has no admin permissions"
**Solution:**
1. Check if custom claims are set (`role: "admin"`)
2. Verify Firestore document has `role: "admin"` field
3. User may need to log out and log back in for claims to refresh

### Issue: "Service account key not found"
**Solution:**
1. Download service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Verify file path in script matches actual location

### Issue: "Permission denied" when running script
**Solution:**
1. Verify service account has correct permissions
2. Check if Firebase Admin SDK is initialized correctly
3. Ensure project ID matches your Firebase project

---

## 📋 Quick Start Checklist

- [ ] Install firebase-admin: `npm install firebase-admin`
- [ ] Download service account key from Firebase Console
- [ ] Save as `serviceAccountKey.json` in project root
- [ ] Add to .gitignore: `echo "serviceAccountKey.json" >> .gitignore`
- [ ] Run script: `node create-admin-auth-users.js`
- [ ] Save admin credentials securely
- [ ] Test login in application
- [ ] Change default passwords
- [ ] Verify admin permissions work

---

## 🔒 Security Best Practices

### ✅ DO:
- Use strong, unique passwords for each admin
- Change default passwords immediately
- Store passwords in a secure password manager
- Enable 2FA for admin accounts
- Regularly audit admin access logs
- Limit admin permissions to only what's needed
- Use separate admin accounts for different purposes

### ❌ DON'T:
- Share admin passwords via email or chat
- Use the same password for multiple accounts
- Store passwords in plain text files
- Commit passwords to version control
- Leave default passwords in production
- Give admin access to everyone
- Use weak or predictable passwords

---

## 📞 Additional Resources

- **Firebase Authentication Docs:** https://firebase.google.com/docs/auth
- **Firebase Admin SDK:** https://firebase.google.com/docs/admin/setup
- **Custom Claims:** https://firebase.google.com/docs/auth/admin/custom-claims
- **Security Rules:** https://firebase.google.com/docs/rules

---

## 🎯 Summary

**Quick Setup (Console Method):**
1. Go to Firebase Console → Authentication
2. Add users with emails and passwords
3. Test login in your app

**Automated Setup (Script Method):**
1. Install firebase-admin
2. Download service account key
3. Run `create-admin-auth-users.js`
4. Test login in your app

**Default Credentials:**
- Email: `admin@eduplatform.ma`
- Password: `Admin@2025!Secure`

⚠️ **Remember to change default passwords after first login!**

---

Generated: October 21, 2025
Project: Moroccan Educational Platform
