# Vercel Deployment Verification Checklist

## ✅ Step 1: Verify Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Verify these 10 variables exist:

### Firebase Variables (6):
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

### EmailJS Variables (4):
- [ ] `VITE_EMAILJS_PUBLIC_KEY`
- [ ] `VITE_EMAILJS_SERVICE_ID`
- [ ] `VITE_EMAILJS_TEMPLATE_ID`
- [ ] `VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID`

---

## ✅ Step 2: Trigger Redeployment

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **three dots (⋯)** menu
4. Select **"Redeploy"**
5. Confirm by clicking **"Redeploy"** again
6. Wait for deployment to complete (2-5 minutes)

---

## ✅ Step 3: Check Build Logs

1. Click on the new deployment
2. Click **"View Build Logs"**
3. Look for any errors related to:
   - Missing environment variables
   - Build failures
   - Module resolution issues

### Expected Success Messages:
```
✓ Building production bundle
✓ Build completed successfully
✓ Deployment ready
```

### Red Flags (Report These):
```
❌ Error: Missing environment variable
❌ Build failed
❌ Module not found
```

---

## ✅ Step 4: Test Production URL

1. Get your production URL from deployment
2. Open in browser
3. Press **F12** to open Developer Tools
4. Click **Console** tab
5. Look for these messages:

### Expected (Good):
```
✅ Firebase initialized successfully
📧 [Approval] EmailJS configured: true
```

### Problematic (Needs Fix):
```
❌ Email service not configured
❌ Firebase initialization error
❌ Missing or insufficient permissions
```

---

## ✅ Step 5: Test Email Functionality

### Test User Approval Email:
1. Login as admin on production site
2. Go to User Management
3. Approve a test user
4. Check browser console for:
   ```
   ✅ Email sent successfully to user@example.com
   ```

### Test Contact Reply:
1. Go to Admin Dashboard → Messages
2. Reply to a contact message
3. Check console for email confirmation

---

## 📊 Report Back:

After completing these steps, report:

1. **Deployment Status:**
   - [ ] Deployment successful (green checkmark)
   - [ ] Deployment failed (red X)

2. **Console Messages:**
   - [ ] "Firebase initialized successfully"
   - [ ] "EmailJS configured: true"
   - [ ] "Email service not configured" (BAD)

3. **Email Test Results:**
   - [ ] User approval email sent
   - [ ] Contact reply email sent
   - [ ] Emails not working

4. **Any Error Messages:**
   ```
   (Copy error messages from console here)
   ```

---

## 🚨 Common Issues & Solutions:

### Issue 1: "Email service not configured" still shows
**Solution:** Environment variables not loaded. Redeploy again.

### Issue 2: Build fails
**Solution:** Check build logs for specific error, may need to fix package.json

### Issue 3: Firebase errors
**Solution:** Verify Firebase credentials are correct in Vercel

### Issue 4: "Missing or insufficient permissions"
**Solution:** Need to deploy updated Firestore rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📞 Need Help?

If you encounter issues:
1. Take screenshots of error messages
2. Copy console logs
3. Share deployment URL (if public)
4. Report specific step where you're stuck

---

**Created:** November 17, 2025
**Purpose:** Guide Vercel deployment verification
