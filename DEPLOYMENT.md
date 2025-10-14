# 🚀 Deployment Guide

Complete guide to deploy your Moroccan Educational Platform to production.

## 📋 Pre-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set correctly
- [ ] Security rules deployed to Firestore and Storage
- [ ] Application tested locally
- [ ] Admin account created for testing
- [ ] All dependencies installed and up to date

## 🔥 Option 1: Firebase Hosting (Recommended)

Firebase Hosting provides fast, secure hosting with SSL certificates and CDN.

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Hosting

```bash
cd moroccan-edu-platform
firebase init hosting
```

When prompted:
- **Project setup**: Select your existing Firebase project
- **Public directory**: Enter `dist`
- **Single-page app**: Yes
- **Automatic builds with GitHub**: No (for now)
- **Overwrite index.html**: No

### Step 4: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Step 5: Deploy to Firebase

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### Step 6: Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS setup instructions
4. Wait for SSL certificate provisioning (up to 24 hours)

### Continuous Deployment with GitHub Actions

Create `.github/workflows/firebase-hosting.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

Add secrets in GitHub: Settings → Secrets → Actions

## 🌐 Option 2: Vercel

Fast deployment with automatic HTTPS and global CDN.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy: Yes
- Scope: Your account
- Link to existing project: No
- Project name: moroccan-edu-platform
- Directory: ./
- Override settings: No

### Step 4: Add Environment Variables

```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

Or add them in Vercel Dashboard → Project → Settings → Environment Variables

### Step 5: Deploy to Production

```bash
vercel --prod
```

Your app will be live at: `https://your-project.vercel.app`

## 📦 Option 3: Netlify

Simple drag-and-drop deployment with instant rollbacks.

### Method A: Drag and Drop

1. Build the project:
   ```bash
   npm run build
   ```

2. Go to [Netlify](https://app.netlify.com/)
3. Drag the `dist` folder to the upload area
4. Your site is live!

### Method B: CLI Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### Add Environment Variables

1. Go to Site settings → Build & deploy → Environment
2. Add all `VITE_*` variables
3. Redeploy the site

### Configure Redirects

Create `public/_redirects`:

```
/*    /index.html   200
```

This ensures client-side routing works correctly.

## 🐳 Option 4: Docker Deployment

For containerized deployment on any platform.

### Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Build and Run

```bash
# Build image
docker build -t moroccan-edu-platform .

# Run container
docker run -p 8080:80 moroccan-edu-platform
```

### Deploy to Cloud Run (Google Cloud)

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/moroccan-edu-platform

# Deploy to Cloud Run
gcloud run deploy moroccan-edu-platform \
  --image gcr.io/YOUR_PROJECT_ID/moroccan-edu-platform \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

## 🔒 Post-Deployment Security

### 1. Update Firebase Security Rules

Ensure your Firestore and Storage rules are properly configured:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 2. Configure CORS for Storage

In Firebase Console → Storage → Rules, add CORS configuration:

```json
[
  {
    "origin": ["https://your-domain.com"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

### 3. Enable Firebase App Check

Protect your Firebase resources from abuse:

1. Go to Firebase Console → App Check
2. Register your web app
3. Enable reCAPTCHA v3
4. Add enforcement for Firestore and Storage

### 4. Set Up Authentication Domain

In Firebase Console → Authentication → Settings:
- Add your production domain to Authorized domains

### 5. Environment Variables Security

- Never commit `.env` to Git
- Use different Firebase projects for development/production
- Rotate API keys regularly
- Enable Firebase security monitoring

## 📊 Monitoring and Analytics

### Firebase Analytics

Add to `src/config/firebase.js`:

```javascript
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

### Error Tracking with Sentry

```bash
npm install @sentry/react
```

Initialize in `src/main.jsx`:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

### Performance Monitoring

Enable Firebase Performance Monitoring:

```bash
npm install firebase/performance
```

Add to Firebase config:

```javascript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

## 🚦 Testing in Production

### Create Test Accounts

1. Create admin test account
2. Create student test account
3. Test all features:
   - Login/Signup
   - Course upload (PDF, video, link)
   - Course viewing
   - Progress tracking
   - Language switching
   - Mobile responsiveness

### Load Testing

Use tools like:
- [Apache Bench](https://httpd.apache.org/docs/2.4/programs/ab.html)
- [Artillery](https://www.artillery.io/)
- [k6](https://k6.io/)

### Lighthouse Audit

Run in Chrome DevTools:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Generate report
4. Optimize based on recommendations

## 🔄 Updates and Rollbacks

### Firebase Hosting Rollbacks

```bash
# List deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL DEST_SITE_ID:live
```

### Vercel Rollbacks

1. Go to Deployments in Vercel Dashboard
2. Click on previous deployment
3. Click "Promote to Production"

### Netlify Rollbacks

1. Go to Deploys tab
2. Find previous deploy
3. Click "Publish deploy"

## 📈 Scaling Considerations

### Firebase Quotas

Monitor usage in Firebase Console:
- Firestore: 1 million reads/day (free tier)
- Storage: 5GB (free tier)
- Authentication: 50,000 MAU (free tier)

### Upgrade to Blaze Plan

When you need more:
```bash
firebase projects:set-billing YOUR_PROJECT_ID
```

### CDN and Caching

- Firebase Hosting includes CDN automatically
- Set cache headers for static assets
- Use Firebase Hosting rewrites for API calls

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

- Ensure all variables start with `VITE_`
- Restart dev server after changing `.env`
- Check deployment platform has all variables set

### Firebase Connection Issues

- Verify Firebase config in production
- Check browser console for errors
- Ensure Firebase services are enabled
- Verify security rules allow access

## 📞 Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deployment)

---

**🎉 Congratulations on deploying your platform!**
