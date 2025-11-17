# ⚡ Quick Fix: CORS Errors - Firebase Storage

## 🎯 ONE-MINUTE FIX

### Step 1: Open Google Cloud Console
Go to: **https://console.cloud.google.com/**

### Step 2: Open Cloud Shell (Top Right Icon: `>_`)

### Step 3: Copy-Paste This (ONE command):
```bash
cat > cors.json << 'EOF' && gsutil cors set cors.json gs://eduinfor-fff3d.appspot.com && gsutil cors get gs://eduinfor-fff3d.appspot.com
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF
```

### Step 4: Reload Your Site (F5)
✅ Images should now load!

---

## 🔍 Quick Verification

Open Browser Console (F12), you should see:
- ✅ No more CORS errors
- ✅ Images loading from `firebasestorage.googleapis.com`
- ✅ Status 200 for all images

---

## 📋 Alternative: Manual Steps

If the one-command doesn't work:

```bash
# Step A: Create file
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Step B: Deploy
gsutil cors set cors.json gs://eduinfor-fff3d.appspot.com

# Step C: Verify
gsutil cors get gs://eduinfor-fff3d.appspot.com
```

---

## ✅ Expected Output

After running `gsutil cors get`:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 🚨 If You Get Permission Error

Run this first:
```bash
gcloud auth login
gcloud config set project eduinfor-fff3d
```

Then retry the deployment command.

---

**Time Required:** ~60 seconds  
**Difficulty:** ⭐ Easy  
**Impact:** 🎯 Fixes ALL image loading issues
