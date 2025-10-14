# ⚡ Quick Start Guide - 5 Minutes to Running!

Get your Moroccan Educational Platform running in 5 minutes.

## 🚀 Prerequisites

- Node.js 16+ installed
- A Firebase account (free)

## 📝 Step 1: Clone and Install (1 min)

```bash
git clone https://github.com/mamounbq1/Info_Plat.git
cd Info_Plat
npm install
```

## 🔥 Step 2: Firebase Setup (2 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** → Name it → **"Create Project"**

3. **Enable Authentication:**
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password** → **Save**

4. **Enable Firestore:**
   - Go to **Firestore Database**
   - **Create Database** → **Production mode** → **Enable**
   - Go to **Rules** tab → Copy rules from `firestore.rules` → **Publish**

5. **Enable Storage:**
   - Go to **Storage**
   - **Get Started** → **Done**
   - Go to **Rules** tab → Copy rules from `storage.rules` → **Publish**

6. **Get Config:**
   - Click ⚙️ **Project Settings**
   - Scroll to "Your apps" → Click Web icon `</>`
   - Register app → Copy the config values

## 🔧 Step 3: Configure Environment (1 min)

```bash
cp .env.example .env
```

Edit `.env` and paste your Firebase values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## ▶️ Step 4: Run! (1 min)

```bash
npm run dev
```

Open: http://localhost:5173

## 👤 Step 5: Create Admin Account

1. Click **"Inscription"** (Sign Up)
2. Fill in your details
3. Select **"Enseignant / Admin"**
4. Click **"Inscription"**

## 🎉 Done! Now you can:

- ✅ Add courses (PDF, videos, links)
- ✅ Create student accounts
- ✅ Switch between French/Arabic
- ✅ Track student progress

## 📚 Need More Details?

- Full setup: See `SETUP_GUIDE.md`
- Deployment: See `DEPLOYMENT.md`
- All features: See `README.md`
- Overview: See `PROJECT_SUMMARY.md`

## 🆘 Quick Troubleshooting

**Firebase connection error?**
- Check your `.env` file has all values
- Restart the dev server: `Ctrl+C` then `npm run dev`

**Can't login?**
- Make sure Email/Password auth is enabled in Firebase
- Check browser console for errors

**File upload not working?**
- Verify Storage is enabled in Firebase
- Check Storage rules are published

---

**Happy Teaching! 🎓**

French: *Bon enseignement!*  
Arabic: *!تدريس سعيد*
