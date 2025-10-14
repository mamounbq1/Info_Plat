# 🔧 Troubleshooting Guide

Common issues and their solutions for the Moroccan Educational Platform.

## 🚨 CSS @import Order Error

### Problem
You get this error when running `npm run dev`:

```
[vite:css][postcss] @import must precede all other statements (besides @charset or empty @layer)
```

### Root Cause
The `@import` statement in `src/index.css` comes **after** the `@tailwind` directives. CSS requires `@import` to be at the top of the file.

### ✅ Solution

**Pull the latest fix:**
```bash
git pull origin main
npm run dev
```

**Or manually fix** `src/index.css`:

Move the Google Fonts import to the **top** of the file, before `@tailwind`:

```css
/* CORRECT ORDER */
/* Arabic Font Support */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Rest of your CSS... */
```

---

## 🚨 Tailwind CSS / PostCSS Error

### Problem
You get this error when running `npm run dev`:

```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. 
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS 
with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

### Root Cause
This error occurs when **Tailwind CSS v4** is installed instead of v3. The project was built with Tailwind CSS v3, which has different PostCSS integration.

### ✅ Solution

**Step 1: Uninstall Tailwind v4**
```bash
npm uninstall tailwindcss
```

**Step 2: Install Correct Versions (Tailwind v3)**
```bash
npm install -D tailwindcss@^3.4.17 postcss@^8.4.38 autoprefixer@^10.4.19
```

**Step 3: Verify Configuration Files**

Ensure `postcss.config.js` looks like this:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Ensure `tailwind.config.js` looks like this:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
```

**Step 4: Run Dev Server**
```bash
npm run dev
```

### Expected Result
✅ Server starts successfully at `http://localhost:5173`

---

## 🔥 Firebase Connection Issues

### Problem
Error: "Firebase: Error (auth/invalid-api-key)" or similar

### Solution

**Step 1: Check `.env` file exists**
```bash
ls -la .env
```

If it doesn't exist:
```bash
cp .env.example .env
```

**Step 2: Add Your Firebase Credentials**
Edit `.env` and replace with your actual Firebase values:
```env
VITE_FIREBASE_API_KEY=AIzaSy...your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Step 3: Restart Dev Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🔐 Authentication Not Working

### Problem
Can't login or signup, or getting "permission denied" errors

### Solutions

**1. Check Email/Password Auth is Enabled**
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project
- Go to **Authentication** → **Sign-in method**
- Ensure **Email/Password** is enabled (toggle should be green)

**2. Verify Firestore Rules**
- Go to **Firestore Database** → **Rules** tab
- Copy the rules from `firestore.rules` file
- Click **Publish**
- Wait 1-2 minutes for rules to propagate

**3. Check Storage Rules**
- Go to **Storage** → **Rules** tab
- Copy the rules from `storage.rules` file
- Click **Publish**

**4. Clear Browser Cache**
- Open browser DevTools (F12)
- Go to Application/Storage tab
- Click "Clear site data"
- Refresh page

---

## 📦 NPM Install Errors

### Problem
`npm install` fails with errors

### Solutions

**Option 1: Clear Cache and Reinstall**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Option 2: Use Specific Node Version**
Ensure you're using Node.js v16 or higher:
```bash
node --version  # Should be v16.x or higher
```

If not, install Node.js from https://nodejs.org/

**Option 3: Use npm ci (Clean Install)**
```bash
rm -rf node_modules
npm ci
```

---

## 🖼️ File Upload Not Working

### Problem
PDF upload fails or shows error

### Solutions

**1. Verify Storage is Enabled**
- Go to Firebase Console → **Storage**
- If not enabled, click **Get Started**

**2. Check Storage Rules**
- Go to Storage → **Rules** tab
- Should allow authenticated users to read/write:
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

**3. Check File Size**
- Firebase free tier has 5GB storage limit
- Individual files should be under 10MB for best performance

**4. Check CORS Configuration**
- Ensure Storage CORS is configured in Firebase Console
- Should allow your domain

---

## 📱 Can't See Courses

### Problem
Courses don't appear in dashboard

### Solutions

**1. Verify User Role**
- Students can only see **published** courses
- Admins can see all courses
- Check your role in Firebase Console → Authentication → Users

**2. Check if Courses are Published**
- Login as admin
- Go to admin dashboard
- Ensure courses have "published" status (green badge)
- Toggle "Publish immediately" when creating courses

**3. Check Firestore Rules**
- Ensure rules allow reading courses:
```javascript
match /courses/{courseId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

**4. Check Browser Console**
- Open DevTools (F12)
- Look for error messages
- Common issues: permission denied, network errors

---

## 🌐 Language Switching Not Working

### Problem
Language doesn't change or resets on refresh

### Solution

**1. Clear localStorage**
```javascript
// In browser console (F12)
localStorage.clear()
```

**2. Check for JavaScript Errors**
- Open DevTools (F12) → Console
- Look for errors related to LanguageContext

**3. Verify Language Context**
- Ensure `src/contexts/LanguageContext.jsx` exists
- Check browser localStorage has 'language' key

---

## 🏗️ Build Errors

### Problem
`npm run build` fails

### Solutions

**1. Check for TypeScript Errors**
```bash
npm run lint
```
Fix any errors shown

**2. Verify All Imports**
- Ensure all imports use correct paths
- Check for missing dependencies

**3. Clear Build Cache**
```bash
rm -rf dist
npm run build
```

**4. Check Environment Variables**
- Ensure `.env` has all required variables
- Variables must start with `VITE_`

---

## 🔄 Hot Reload Not Working

### Problem
Changes don't appear without manual refresh

### Solutions

**1. Restart Dev Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

**2. Clear Browser Cache**
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

**3. Check Vite Config**
Ensure `vite.config.js` has HMR enabled (default)

---

## 📊 Slow Performance

### Problem
App loads slowly or lags

### Solutions

**1. Check Network Tab**
- Open DevTools (F12) → Network
- Look for slow requests
- Large files should be optimized

**2. Optimize Images**
- Compress images before upload
- Use appropriate formats (WebP recommended)

**3. Check Firebase Quotas**
- Go to Firebase Console → Usage
- Ensure you're not hitting limits

**4. Enable Caching**
- In production, ensure Firebase Hosting cache is enabled

---

## 🔍 Debugging Tips

### View Logs in Browser
```javascript
// Open DevTools (F12) → Console
// Check for errors (red) and warnings (yellow)
```

### Check Firebase Status
- Visit [Firebase Status Page](https://status.firebase.google.com/)
- Ensure all services are operational

### View Network Requests
- Open DevTools (F12) → Network tab
- Filter by "Fetch/XHR"
- Look for failed requests (red)

### Check React DevTools
- Install React DevTools extension
- View component tree and props
- Check context values

---

## 📞 Still Having Issues?

### Before Asking for Help

1. ✅ Read relevant documentation:
   - [QUICKSTART.md](./QUICKSTART.md)
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md)
   - [README.md](./README.md)

2. ✅ Check browser console for errors (F12)

3. ✅ Verify Firebase configuration:
   - Auth enabled
   - Firestore rules published
   - Storage enabled and rules published

4. ✅ Try clearing cache:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

5. ✅ Restart everything:
   - Close terminal
   - Close browser
   - Restart dev server
   - Open fresh browser window

### Getting Support

If issues persist:

1. Check the [GitHub Issues](https://github.com/mamounbq1/Info_Plat/issues)
2. Search for similar problems
3. Create new issue with:
   - Error message (full text)
   - Steps to reproduce
   - Your Node.js version (`node --version`)
   - Your OS (Windows, Mac, Linux)
   - Screenshots if relevant

---

## 📋 Quick Checklist

Before reporting a bug, verify:

- [ ] Node.js v16+ installed
- [ ] `npm install` completed successfully
- [ ] `.env` file exists with correct values
- [ ] Firebase project created
- [ ] Authentication enabled in Firebase
- [ ] Firestore database created
- [ ] Firestore rules published
- [ ] Storage enabled
- [ ] Storage rules published
- [ ] Browser cache cleared
- [ ] Dev server restarted
- [ ] No errors in browser console (F12)

---

**Most issues can be resolved by:**
1. Ensuring Tailwind CSS v3 is installed (not v4)
2. Verifying Firebase configuration
3. Publishing security rules
4. Clearing cache and restarting

**Happy debugging! 🐛🔧**
