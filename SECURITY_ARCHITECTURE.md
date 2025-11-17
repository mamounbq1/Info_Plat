# 🔒 Architecture de Sécurité Professionnelle - Firebase

## 📋 Vue d'ensemble

Cette application utilise une **architecture de sécurité professionnelle** basée sur les **Custom Claims Firebase** pour gérer les permissions Storage de manière rapide, fiable et économique.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX DE SÉCURITÉ                          │
└─────────────────────────────────────────────────────────────┘

1. USER CREATION/UPDATE
   ↓
   Firestore: /users/{uid}
   { role: "admin", approved: true, ... }
   ↓
2. CLOUD FUNCTION TRIGGER (setUserClaims)
   ↓
   Firebase Auth: Set Custom Claims
   { role: "admin", approved: true, ... }
   ↓
3. USER LOGIN/TOKEN REFRESH
   ↓
   Firebase Token (JWT)
   { ..., role: "admin", approved: true }
   ↓
4. STORAGE UPLOAD REQUEST
   ↓
   Storage Rules: Check token.role
   if (request.auth.token.role == "admin") → ✅ ALLOW
   else → ❌ DENY
```

---

## 🔑 Composants

### 1. **Cloud Functions** (`/functions/index.js`)

#### `setUserClaims` (Firestore Trigger)
- **Déclencheur**: Création/modification d'un document `/users/{uid}`
- **Action**: Définit automatiquement les custom claims dans Firebase Auth
- **Claims définis**:
  - `role`: "admin" | "teacher" | "student"
  - `approved`: boolean
  - `status`: "active" | "pending" | "suspended"

```javascript
// Exemple de custom claims définis
{
  role: "admin",
  approved: true,
  status: "active"
}
```

#### `refreshUserClaims` (Callable Function)
- **Usage**: Refresh manuel des claims pour un utilisateur
- **Permissions**: 
  - User peut refresh ses propres claims
  - Admin peut refresh n'importe quel user
- **Appel depuis le client**:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const refreshClaims = httpsCallable(functions, 'refreshUserClaims');

// Refresh pour soi-même
await refreshClaims({});

// Refresh pour un autre user (admin seulement)
await refreshClaims({ uid: 'USER_ID' });
```

#### `getMyCustomClaims` (Callable Function)
- **Usage**: Récupérer ses propres custom claims (debug)
- **Permissions**: User authentifié
- **Retour**: Object avec les custom claims

---

### 2. **Storage Rules** (`/storage.rules.professional`)

#### Fonctions Helper

```javascript
// Authentification
function isAuthenticated() {
  return request.auth != null;
}

// Vérification des rôles (depuis le token)
function isAdmin() {
  return isAuthenticated() && request.auth.token.role == 'admin';
}

function isTeacher() {
  return isAuthenticated() && request.auth.token.role == 'teacher';
}

function isTeacherOrAdmin() {
  return isAdmin() || isTeacher();
}

// Vérification d'approbation
function isApproved() {
  return isAuthenticated() && request.auth.token.approved == true;
}
```

#### Règles par Dossier

| Dossier | Lecture | Écriture | Taille Max | Type | Notes |
|---------|---------|----------|------------|------|-------|
| `/courses/` | Auth | Teacher/Admin + Approved | 5MB | Images | Miniatures de cours |
| `/course-materials/` | Auth | Teacher/Admin + Approved | 20MB | Documents | PDFs, DOCs, etc. |
| `/gallery/` | Public | Admin | 10MB | Images | Photos de l'école |
| `/news/` | Public | Admin | 5MB | Images | Images d'articles |
| `/events/` | Public | Admin | 5MB | Images | Couvertures d'événements |
| `/clubs/` | Public | Admin | 5MB | Images | Photos de clubs |
| `/hero/` | Public | Admin | 10MB | Images | Backgrounds homepage |
| `/about/` | Public | Admin | 5MB | Images | Page À propos |
| `/profiles/` | Auth | Propriétaire ou Admin | 2MB | Images | Photos de profil |
| `/submissions/` | Auth (filtré) | Propriétaire | 10MB | Docs/Images | Devoirs étudiants |

---

### 3. **Utilitaires Client** (`/src/utils/refreshToken.js`)

#### `forceRefreshToken()`
Force Firebase à régénérer le token (obtient les derniers custom claims)

```javascript
import { forceRefreshToken } from '@/utils/refreshToken';

await forceRefreshToken();
// ✅ Token actualisé avec les nouveaux claims
```

#### `getCustomClaims(forceRefresh)`
Récupère les custom claims de l'utilisateur actuel

```javascript
import { getCustomClaims } from '@/utils/refreshToken';

const claims = await getCustomClaims(true); // Force refresh
console.log(claims.role); // "admin"
```

#### `hasRole(role, forceRefresh)`
Vérifie si l'utilisateur a un rôle spécifique

```javascript
import { hasRole } from '@/utils/refreshToken';

const isAdmin = await hasRole('admin', true);
if (isAdmin) {
  // Afficher le panel admin
}
```

#### `waitForClaims(maxAttempts, delayMs)`
Attend que les custom claims soient définis (après création de compte)

```javascript
import { waitForClaims } from '@/utils/refreshToken';

// Après création de compte
const claims = await waitForClaims(10, 1000); // 10 tentatives, 1s de délai
console.log('Claims définis:', claims);
```

---

### 4. **Page de Diagnostic** (`/diagnostic-user`)

Interface web pour diagnostiquer les problèmes de permissions:
- ✅ Statut d'authentification
- ✅ Contenu du document Firestore
- ✅ Custom claims dans le token
- ✅ Bouton de refresh du token
- ✅ Guide de résolution de problèmes

**Accès**: `https://votre-app.com/diagnostic-user`

---

## 🚀 Déploiement

### Étape 1: Installer les dépendances

```bash
cd functions
npm install
cd ..
```

### Étape 2: Déployer les Cloud Functions

```bash
# Toutes les fonctions
firebase deploy --only functions

# Ou une par une
firebase deploy --only functions:setUserClaims
firebase deploy --only functions:refreshUserClaims
firebase deploy --only functions:getMyCustomClaims
```

### Étape 3: Déployer les Storage Rules

```bash
# Sauvegarder l'ancien fichier (optionnel)
cp storage.rules storage.rules.backup

# Utiliser les nouvelles règles
cp storage.rules.professional storage.rules

# Déployer
firebase deploy --only storage
```

### Étape 4: Refresh des claims pour les users existants

**Option A**: Via script Node.js (recommandé)

```bash
node refresh-all-claims.js
```

**Option B**: Via la Cloud Function callable

```javascript
// Pour chaque user existant
await refreshClaims({ uid: 'USER_ID' });
```

### Étape 5: Tester

1. **Se déconnecter et se reconnecter** (pour obtenir un nouveau token)
2. Aller sur `/diagnostic-user` → Vérifier que les claims sont présents
3. Tester un upload dans **GalleryManager**
4. ✅ Si admin → Upload autorisé
5. ❌ Si non-admin → Upload refusé (403)

---

## 🔍 Dépannage

### Problème: Upload refusé malgré rôle admin dans Firestore

**Cause**: Le token ne contient pas encore les custom claims

**Solutions**:
1. **Déconnexion/Reconnexion** (méthode garantie)
2. **Bouton "Actualiser le token"** dans `/diagnostic-user`
3. **Attendre 1h** (les tokens expirent automatiquement)
4. **Appeler la Cloud Function** `refreshUserClaims`

### Problème: Cloud Function ne se déclenche pas

**Diagnostic**:
```bash
# Vérifier que la fonction est déployée
firebase functions:list

# Voir les logs
firebase functions:log --only setUserClaims
```

**Solutions**:
- Vérifier que le chemin du trigger est correct: `users/{uid}`
- Vérifier les permissions IAM dans Google Cloud Console
- Tester manuellement en modifiant un document Firestore

### Problème: Claims présents mais upload toujours refusé

**Diagnostic**:
```javascript
// Dans la console du navigateur
const user = firebase.auth().currentUser;
const token = await user.getIdTokenResult(true);
console.log(token.claims.role); // Doit afficher "admin"
```

**Solutions**:
- Vérifier que `request.auth.token.role` est bien utilisé dans Storage Rules
- Vérifier que les Storage Rules sont déployées
- Vérifier la syntaxe des règles (pas d'erreurs)

---

## 📊 Avantages de cette Architecture

| Critère | get() dans Rules | Custom Claims |
|---------|------------------|---------------|
| **Vitesse** | ❌ Lent (appel DB) | ✅ Instant (token local) |
| **Fiabilité** | ❌ Peut échouer (cache) | ✅ Très fiable |
| **Coût** | ❌ 1 lecture/upload | ✅ Gratuit |
| **Latence** | ❌ 100-500ms | ✅ 0ms |
| **Scalabilité** | ❌ Limite Firestore | ✅ Illimité |
| **Complexité** | ✅ Simple (1 règle) | ⚠️ Nécessite Cloud Function |

---

## 💡 Best Practices

### 1. Toujours forcer le refresh après modification de rôle

```javascript
// Après modification du rôle dans Firestore
await updateDoc(userRef, { role: 'admin' });

// Force refresh du token
await forceRefreshToken();

// Ou redemander la connexion
await signOut(auth);
```

### 2. Utiliser `waitForClaims()` après création de compte

```javascript
// Après signup
await createUserWithEmailAndPassword(auth, email, password);

// Créer le document Firestore
await setDoc(doc(db, 'users', user.uid), {
  role: 'student',
  email: email,
  ...
});

// Attendre que la Cloud Function définisse les claims
const claims = await waitForClaims();
console.log('Claims prêts:', claims);
```

### 3. Monitorer les logs Cloud Functions

```bash
# Temps réel
firebase functions:log

# Ou dans Firebase Console → Functions → Logs
```

### 4. Tester avec `/diagnostic-user` en cas de problème

Toujours aller sur `/diagnostic-user` pour diagnostiquer:
- ✅ Token valide?
- ✅ Claims présents?
- ✅ Rôle correct?

---

## 🔗 Ressources

- [Firebase Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## ✅ Checklist de Migration

- [ ] Créer le dossier `/functions`
- [ ] Installer les dépendances: `cd functions && npm install`
- [ ] Déployer les Cloud Functions: `firebase deploy --only functions`
- [ ] Sauvegarder les anciennes règles: `cp storage.rules storage.rules.backup`
- [ ] Déployer les nouvelles règles: `cp storage.rules.professional storage.rules && firebase deploy --only storage`
- [ ] Refresh des claims pour users existants (script)
- [ ] Se déconnecter/reconnecter
- [ ] Tester sur `/diagnostic-user`
- [ ] Tester un upload
- [ ] Vérifier les logs: `firebase functions:log`
- [ ] Documenter pour l'équipe

---

**Architecture créée le**: 2025-11-01  
**Version**: 1.0.0  
**Status**: Production-ready 🚀
