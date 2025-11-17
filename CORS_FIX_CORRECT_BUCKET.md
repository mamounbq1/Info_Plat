# 🔧 Fix CORS: Bucket Name Correct

## ❌ Erreur Rencontrée

```
BucketNotFoundException: 404 gs://eduinfor-fff3d.appspot.com bucket does not exist.
```

## 🔍 Bucket Firebase Storage Identifié

Selon votre configuration `.env`:
```
VITE_FIREBASE_STORAGE_BUCKET=eduinfor-fff3d.firebasestorage.app
```

---

## ✅ Solution: Trouver et Utiliser le Bon Bucket

### Étape 1: Lister les Buckets Disponibles

Dans **Google Cloud Shell**, exécutez:

```bash
# Lister TOUS les buckets du projet
gsutil ls

# Ou avec plus de détails
gsutil ls -L
```

Vous verrez probablement quelque chose comme:
```
gs://eduinfor-fff3d.appspot.com/
gs://eduinfor-fff3d.firebasestorage.app/
```

---

### Étape 2: Identifier le Bucket Utilisé par Firebase Storage

Firebase Storage moderne utilise généralement:
- **Nouveau format:** `gs://PROJECT_ID.firebasestorage.app`
- **Ancien format:** `gs://PROJECT_ID.appspot.com`

Pour votre projet, essayez:
```bash
# Vérifier le nouveau format
gsutil ls gs://eduinfor-fff3d.firebasestorage.app

# Si ça ne marche pas, essayer sans le .firebasestorage.app
gsutil ls gs://eduinfor-fff3d

# Ou lister avec le domain complet
gsutil ls -p eduinfor-fff3d
```

---

### Étape 3: Déployer CORS sur le BON Bucket

Une fois le bucket identifié, utilisez UNE de ces commandes:

#### **Option A: Bucket Default (ancien format)**
```bash
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://eduinfor-fff3d.appspot.com
```

#### **Option B: Bucket Firebase Storage (nouveau format)**
```bash
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Essayer avec le domain complet
gsutil cors set cors.json gs://eduinfor-fff3d.firebasestorage.app
```

#### **Option C: Si le bucket n'a pas d'extension**
```bash
gsutil cors set cors.json gs://eduinfor-fff3d
```

---

## 🔍 Alternative: Vérifier dans Firebase Console

### Méthode 1: Firebase Console (Plus Facile)

1. **Allez sur:** https://console.firebase.google.com/
2. **Sélectionnez:** Projet `eduinfor-fff3d`
3. **Menu:** Build → Storage
4. **En haut:** Vous verrez le bucket name exact
   - Format: `gs://...` ou URL complète
5. **Notez** le nom exact du bucket

### Méthode 2: Google Cloud Console

1. **Allez sur:** https://console.cloud.google.com/storage/browser
2. **Sélectionnez:** Projet `eduinfor-fff3d`
3. **Liste des buckets:** Vous verrez tous les buckets
4. **Identifiez** celui contenant vos images (dossiers `gallery/`, etc.)

---

## 🎯 Commande Complète pour Trouver et Fixer

Exécutez cette séquence dans Cloud Shell:

```bash
# 1. Lister tous les buckets
echo "=== BUCKETS DISPONIBLES ==="
gsutil ls

# 2. Créer le fichier CORS
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF

# 3. Essayer chaque bucket possible
echo ""
echo "=== TENTATIVE 1: Bucket default ==="
gsutil cors set cors.json gs://eduinfor-fff3d.appspot.com 2>&1

echo ""
echo "=== TENTATIVE 2: Bucket Firebase Storage ==="
gsutil cors set cors.json gs://eduinfor-fff3d.firebasestorage.app 2>&1

echo ""
echo "=== TENTATIVE 3: Sans extension ==="
gsutil cors set cors.json gs://eduinfor-fff3d 2>&1

echo ""
echo "=== VÉRIFICATION ==="
echo "Si une des tentatives a réussi, vérifiez avec:"
echo "gsutil cors get gs://BUCKET_NAME"
```

---

## 🔧 Alternative: Configuration CORS via Console

Si `gsutil` ne fonctionne pas, vous pouvez configurer CORS manuellement:

### Via Google Cloud Console:

1. **Allez sur:** https://console.cloud.google.com/storage/browser
2. **Sélectionnez** votre bucket
3. **Onglet:** "Permissions" ou "Configuration"
4. **Section:** "CORS"
5. **Cliquez:** "Edit CORS configuration"
6. **Collez:**
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
7. **Sauvegardez**

---

## 📊 Diagnostic: Pourquoi le Bucket N'existe Pas?

### Raisons Possibles:

1. **Bucket pas encore créé**
   - Firebase Storage initialise le bucket au premier upload
   - Solution: Uploadez une image via l'admin d'abord

2. **Nom de projet différent**
   - Le project ID Firebase peut être différent du bucket name
   - Solution: Vérifiez dans Firebase Console

3. **Bucket dans une autre région/projet**
   - Le bucket existe mais pas dans ce projet
   - Solution: Vérifiez que vous êtes dans le bon projet GCP

4. **Permissions insuffisantes**
   - Votre compte n'a pas accès au bucket
   - Solution: Ajoutez le rôle "Storage Admin"

---

## ✅ Après Avoir Trouvé le Bon Bucket

Une fois CORS déployé avec succès:

```bash
# Vérifier la configuration
gsutil cors get gs://BUCKET_NAME_CORRECT

# Vous devriez voir:
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Puis:
1. **Rechargez** votre site (F5)
2. **Ouvrez** la console navigateur (F12)
3. **Vérifiez** qu'il n'y a plus d'erreurs CORS

---

## 🆘 Si Rien Ne Fonctionne

Partagez le résultat de ces commandes:

```bash
# Informations projet
gcloud config get-value project

# Liste des buckets
gsutil ls

# Détails du projet Firebase
gcloud projects describe eduinfor-fff3d

# Configuration Firebase actuelle
cat .env | grep FIREBASE
```

---

**Date:** 2025-11-01  
**Status:** Recherche du bucket name correct en cours
