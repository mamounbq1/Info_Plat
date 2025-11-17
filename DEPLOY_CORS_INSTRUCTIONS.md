# 🚀 Instructions de Déploiement CORS pour Firebase Storage

## 📋 Problème Actuel
Les images de Firebase Storage sont bloquées par la politique CORS depuis l'URL sandbox:
```
https://5173-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai
```

**Erreur Console:**
```
Access to image at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## ✅ Solution: Déployer la Configuration CORS

Le fichier `cors.json` a été mis à jour pour autoriser **toutes les origines** (`"*"`) pendant le développement.

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

## 🛠️ Méthode 1: Déploiement via Google Cloud Console (Plus Simple)

### Étape 1: Accéder à Google Cloud Console
1. Allez sur: https://console.cloud.google.com/
2. Connectez-vous avec votre compte Firebase
3. Sélectionnez le projet **eduinfor-fff3d**

### Étape 2: Activer Cloud Shell
1. En haut à droite, cliquez sur l'icône **Cloud Shell** (>_)
2. Attendez que le terminal s'ouvre

### Étape 3: Créer le Fichier CORS
Dans Cloud Shell, exécutez:

```bash
# Créer le fichier cors.json
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF
```

### Étape 4: Déployer la Configuration
```bash
# Nom du bucket (remplacez si différent)
BUCKET_NAME="eduinfor-fff3d.appspot.com"

# Déployer CORS
gsutil cors set cors.json gs://${BUCKET_NAME}

# Vérifier la configuration
gsutil cors get gs://${BUCKET_NAME}
```

### Étape 5: Vérifier
- Rechargez la page de la galerie
- Les images devraient maintenant se charger sans erreur CORS

---

## 🛠️ Méthode 2: Déploiement via Firebase CLI (Avancé)

### Prérequis
- Firebase CLI installé: `npm install -g firebase-tools`
- Authentifié: `firebase login`

### Commandes
```bash
# Installer Google Cloud SDK si nécessaire
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialiser gcloud
gcloud init

# Déployer CORS
gsutil cors set cors.json gs://eduinfor-fff3d.appspot.com

# Vérifier
gsutil cors get gs://eduinfor-fff3d.appspot.com
```

---

## 📝 Note de Sécurité

⚠️ **Configuration Actuelle: `"origin": ["*"]`**

Cette configuration autorise **TOUTES** les origines. C'est pratique pour le développement mais **PAS recommandé en production**.

### Pour la Production, Mettez à Jour vers:
```json
[
  {
    "origin": [
      "https://www.lyceealmarinyine.com",
      "https://lyceealmarinyine.com",
      "http://localhost:5173"
    ],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

Puis redéployez avec `gsutil cors set cors.json gs://eduinfor-fff3d.appspot.com`

---

## 🧪 Test après Déploiement

1. **Ouvrir la Console Développeur** (F12)
2. **Aller sur l'onglet Réseau** (Network)
3. **Recharger la page** (F5)
4. **Vérifier les headers** des images Firebase Storage:
   - Chercher `Access-Control-Allow-Origin: *`
   - Plus d'erreurs CORS dans la console

5. **Tester les Pages:**
   - Landing Page: http://localhost:5173/
   - Gallery Page: http://localhost:5173/gallery
   - Admin Gallery: http://localhost:5173/admin

---

## 🔧 Dépannage

### Problème: Erreurs CORS persistent
**Solution:**
```bash
# Vider le cache du bucket
gsutil -m rm gs://eduinfor-fff3d.appspot.com/.corsCache

# Redéployer
gsutil cors set cors.json gs://eduinfor-fff3d.appspot.com
```

### Problème: Permission Denied
**Solution:**
- Vérifiez que vous êtes propriétaire du projet Firebase
- Ajoutez le rôle "Storage Admin" à votre compte:
  ```bash
  gcloud projects add-iam-policy-binding eduinfor-fff3d \
    --member="user:votre-email@gmail.com" \
    --role="roles/storage.admin"
  ```

### Problème: Bucket Name Incorrect
**Solution:**
- Vérifiez le nom du bucket dans Firebase Console:
  - Allez sur Firebase Console → Storage
  - Le nom apparaît en haut (format: `project-id.appspot.com`)

---

## 📊 Résultat Attendu

### Avant CORS Déployé ❌
```
❌ Console Error: CORS policy blocked
❌ Images n'apparaissent pas
❌ Icônes cassées 🖼️
```

### Après CORS Déployé ✅
```
✅ Aucune erreur CORS
✅ Images se chargent normalement
✅ Gallery Page fonctionnelle
✅ Landing Page gallery visible
```

---

## 📞 Contact

Si vous rencontrez des problèmes, partagez:
1. Le message d'erreur exact de Cloud Shell
2. Le résultat de `gsutil cors get gs://BUCKET_NAME`
3. Les erreurs de la console navigateur (F12)

---

**Date de Création:** 2025-11-01  
**Fichier:** `/home/user/webapp/DEPLOY_CORS_INSTRUCTIONS.md`  
**Status:** ⚠️ CORS Non Déployé - Action Requise
