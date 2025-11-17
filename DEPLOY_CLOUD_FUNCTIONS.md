# 🚀 Guide de Déploiement - Cloud Functions & Storage Rules Professionnelles

## 📋 Vue d'ensemble

Ce guide vous aidera à déployer:
1. **Cloud Functions** - Pour définir automatiquement les custom claims (rôle admin/teacher/student)
2. **Storage Rules Professionnelles** - Sécurité basée sur les custom claims

---

## ⚙️ Prérequis

- Firebase CLI installé: `npm install -g firebase-tools`
- Être connecté à Firebase: `firebase login`
- Projet Firebase initialisé

---

## 📦 Étape 1: Installer les dépendances Cloud Functions

```bash
cd functions
npm install
cd ..
```

---

## 🔥 Étape 2: Déployer les Cloud Functions

### Option A: Déployer toutes les fonctions

```bash
firebase deploy --only functions
```

### Option B: Déployer une fonction spécifique

```bash
# Déployer uniquement la fonction de custom claims
firebase deploy --only functions:setUserClaims

# Déployer uniquement la fonction de refresh manuel
firebase deploy --only functions:refreshUserClaims
```

---

## 🔒 Étape 3: Déployer les Storage Rules Professionnelles

### Remplacer le fichier storage.rules

```bash
# Sauvegarder l'ancien fichier (optionnel)
cp storage.rules storage.rules.backup

# Utiliser les nouvelles règles professionnelles
cp storage.rules.professional storage.rules

# Déployer les nouvelles règles
firebase deploy --only storage
```

---

## ✅ Étape 4: Tester la configuration

### 4.1 Vérifier que les Cloud Functions sont déployées

```bash
firebase functions:list
```

Vous devriez voir:
- ✅ `setUserClaims` (Firestore trigger)
- ✅ `refreshUserClaims` (Callable function)
- ✅ `getMyCustomClaims` (Callable function)

### 4.2 Tester l'attribution automatique des claims

1. **Créer un nouveau compte** ou **modifier un utilisateur existant** dans Firestore
2. La fonction `setUserClaims` devrait se déclencher automatiquement
3. Vérifier dans **Firebase Console → Authentication → Users** que les custom claims sont définis

### 4.3 Tester les Storage Rules

1. **Se déconnecter et se reconnecter** (pour obtenir un nouveau token avec les claims)
2. Essayer d'uploader une image dans **GalleryManager**
3. ✅ Si vous êtes admin → Upload autorisé
4. ❌ Si vous n'êtes pas admin → Upload refusé (403)

---

## 🔧 Étape 5: Forcer le refresh des claims pour les users existants

Pour tous les utilisateurs existants qui n'ont pas encore de custom claims:

### Option A: Via Cloud Function (recommandé pour admins)

```javascript
// Dans la console de votre navigateur (connecté en tant qu'admin)
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const refreshClaims = httpsCallable(functions, 'refreshUserClaims');

// Refresh pour vous-même
await refreshClaims({});

// Refresh pour un autre user (admin seulement)
await refreshClaims({ uid: 'USER_ID_HERE' });
```

### Option B: Via script Node.js (backend)

Créez un script `refresh-all-claims.js`:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function refreshAllClaims() {
  const usersSnapshot = await admin.firestore().collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const uid = userDoc.id;
    const data = userDoc.data();
    const role = data.role || 'student';
    const approved = data.approved === true;
    const status = data.status || 'pending';
    
    await admin.auth().setCustomUserClaims(uid, {
      role: role,
      approved: approved,
      status: status
    });
    
    console.log(`✅ Claims set for ${uid}: ${role}`);
  }
  
  console.log('✅ All claims refreshed!');
}

refreshAllClaims().then(() => process.exit(0));
```

Exécutez:
```bash
node refresh-all-claims.js
```

---

## 📊 Étape 6: Monitorer les Cloud Functions

### Voir les logs en temps réel

```bash
firebase functions:log
```

### Voir les logs d'une fonction spécifique

```bash
firebase functions:log --only setUserClaims
```

### Voir les logs dans Firebase Console

**Firebase Console → Functions → Logs**

---

## 🔍 Dépannage

### Problème: Les claims ne sont pas définis

**Solution:**
1. Vérifier que la Cloud Function est bien déployée: `firebase functions:list`
2. Vérifier les logs: `firebase functions:log`
3. Modifier manuellement le document Firestore pour déclencher la fonction

### Problème: Upload toujours refusé (403)

**Solution:**
1. **Se déconnecter et se reconnecter** pour obtenir un nouveau token
2. Vérifier les claims dans `/diagnostic-user`
3. Vérifier que `request.auth.token.role` vaut bien `"admin"`

### Problème: La fonction ne se déclenche pas

**Solution:**
1. Vérifier le chemin du trigger: `users/{uid}`
2. Vérifier dans Firebase Console que la fonction est active
3. Vérifier les indexes Firestore si nécessaire

---

## 🎯 Avantages de cette architecture

| Avant (get() dans rules) | Après (Custom Claims) |
|---------------------------|------------------------|
| ❌ Lent (appel Firestore) | ✅ Rapide (lecture token) |
| ❌ Peut échouer (cache) | ✅ Fiable (token signé) |
| ❌ Coût élevé (lecture DB) | ✅ Gratuit (token local) |
| ❌ Délai de propagation | ✅ Instantané après reconnexion |

---

## 📝 Notes importantes

1. **Déconnexion/Reconnexion nécessaire**: Les custom claims ne sont appliqués que lors de la génération d'un nouveau token (à la connexion)
2. **Tokens expirés**: Les tokens Firebase expirent après 1 heure, les nouveaux tokens auront automatiquement les claims à jour
3. **Coût**: Les Cloud Functions ont un quota gratuit (2M invocations/mois), largement suffisant pour ce use case

---

## 🔗 Ressources

- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)

---

## ✅ Checklist de déploiement

- [ ] Installer les dépendances: `cd functions && npm install`
- [ ] Déployer les fonctions: `firebase deploy --only functions`
- [ ] Remplacer storage.rules: `cp storage.rules.professional storage.rules`
- [ ] Déployer Storage rules: `firebase deploy --only storage`
- [ ] Tester les claims: Aller sur `/diagnostic-user`
- [ ] Forcer refresh pour users existants (script ou fonction)
- [ ] Se déconnecter/reconnecter
- [ ] Tester upload dans GalleryManager
- [ ] Vérifier les logs: `firebase functions:log`

---

**Prêt à déployer?** 🚀
