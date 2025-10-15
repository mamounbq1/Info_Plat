# 🔥 Configuration Firebase Storage - Guide Complet

## ⚠️ IMPORTANT: Déploiement des Règles de Sécurité

Pour que le téléchargement de fichiers fonctionne, vous devez déployer les règles de sécurité Firebase Storage.

---

## 📋 Étape 1: Vérifier le fichier `storage.rules`

Le fichier `storage.rules` à la racine du projet contient les règles de sécurité:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Course materials folder
    match /course-materials/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Courses folder
    match /courses/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🚀 Méthode 1: Déploiement via Firebase Console (Recommandé)

### Option A: Copier-Coller dans la Console

1. **Ouvrir Firebase Console:**
   - Aller sur: https://console.firebase.google.com/
   - Sélectionner votre projet: `eduinfor-fff3d`

2. **Accéder aux règles Storage:**
   - Dans le menu latéral, cliquer sur **"Storage"**
   - Cliquer sur l'onglet **"Rules"** (Règles)

3. **Remplacer les règles:**
   - Supprimer le contenu actuel
   - Copier-coller le contenu du fichier `storage.rules`
   - Cliquer sur **"Publish"** (Publier)

4. **Vérifier le déploiement:**
   - Vous devriez voir un message de confirmation
   - Les règles sont maintenant actives

---

## 🛠️ Méthode 2: Déploiement via Firebase CLI

### Prérequis:
```bash
# Installer Firebase CLI globalement
npm install -g firebase-tools

# Se connecter à Firebase
firebase login
```

### Initialiser Firebase (si pas déjà fait):
```bash
# À la racine du projet
firebase init storage

# Choisir:
# - Votre projet: eduinfor-fff3d
# - Fichier de règles: storage.rules (déjà existant)
```

### Déployer les règles:
```bash
# Déployer uniquement les règles Storage
firebase deploy --only storage

# OU déployer tout (Storage + Firestore)
firebase deploy
```

---

## ✅ Vérification du Déploiement

### 1. Via Firebase Console:
- Aller dans **Storage > Rules**
- Vérifier que les règles correspondent au fichier `storage.rules`
- La date de modification devrait être récente

### 2. Via l'Application:
1. Se connecter comme enseignant/admin
2. Créer un nouveau cours
3. Essayer de télécharger un fichier
4. **Si ça fonctionne** = ✅ Les règles sont correctes!
5. **Si erreur** = Vérifier les logs ci-dessous

---

## 🔍 Debugging: Erreurs Courantes

### Erreur: "Permission denied" ou "Unauthorized"

**Cause:** Les règles ne sont pas déployées ou incorrectes

**Solution:**
1. Vérifier que vous êtes connecté (authentifié)
2. Re-déployer les règles via console ou CLI
3. Attendre 1-2 minutes pour la propagation
4. Rafraîchir la page et réessayer

### Erreur: "storage is not defined" ou "storage is null"

**Cause:** Firebase Storage n'est pas initialisé

**Solution:**
1. Vérifier le fichier `.env` contient:
   ```
   VITE_FIREBASE_STORAGE_BUCKET=eduinfor-fff3d.firebasestorage.app
   ```
2. Redémarrer le serveur dev: `npm run dev`
3. Vérifier la console: devrait afficher "✅ Firebase initialized successfully"

### Erreur: "Quota exceeded"

**Cause:** Limite de stockage gratuite dépassée (5GB sur plan gratuit)

**Solution:**
1. Vérifier l'utilisation dans Firebase Console > Storage > Usage
2. Supprimer les fichiers inutiles
3. Ou passer au plan Blaze (payant)

---

## 📊 Règles de Sécurité Expliquées

```javascript
// Permet aux utilisateurs authentifiés de lire et écrire
match /course-materials/{allPaths=**} {
  allow read: if request.auth != null;   // Utilisateurs connectés peuvent lire
  allow write: if request.auth != null;  // Utilisateurs connectés peuvent écrire
}
```

### Règles Plus Strictes (Optionnel):

Si vous voulez que **seuls les admins** puissent télécharger:

```javascript
match /course-materials/{allPaths=**} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
               request.auth.token.admin == true;
}
```

### Règles avec Validation de Taille:

```javascript
match /course-materials/{allPaths=**} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
               request.resource.size < 50 * 1024 * 1024; // Max 50MB
}
```

---

## 🎯 Actions à Faire Maintenant:

### ✅ Liste de Vérification:

1. [ ] Ouvrir Firebase Console
2. [ ] Aller dans Storage > Rules
3. [ ] Copier le contenu de `storage.rules`
4. [ ] Coller dans l'éditeur de règles
5. [ ] Cliquer sur "Publish"
6. [ ] Attendre 1-2 minutes
7. [ ] Tester le téléchargement dans l'app
8. [ ] Si ça marche = ✅ TERMINÉ!

---

## 📞 Support

Si vous rencontrez toujours des problèmes:

1. **Vérifier les logs dans la console du navigateur** (F12)
2. **Vérifier les logs Firebase Console** (Storage > Usage)
3. **Vérifier que vous êtes bien connecté** avec un compte admin
4. **Essayer avec un petit fichier** (image < 1MB) d'abord

---

## 🚀 Une Fois les Règles Déployées:

Vous pourrez télécharger:
- ✅ Images (JPG, PNG, GIF, etc.)
- ✅ Documents (PDF, Word, PowerPoint, Excel)
- ✅ Audio (MP3, WAV, OGG, etc.)
- ✅ Vidéo (MP4, AVI, MOV, etc.)
- ✅ Jusqu'à 15 fichiers par cours
- ✅ Jusqu'à 50MB par fichier
- ✅ Stockage total: 5GB (plan gratuit)

**Les fichiers seront automatiquement téléchargés dans Firebase Storage et accessibles aux étudiants!** 🎉
