# 🔥 Cloud Functions - Custom Claims Management

## 📋 Vue d'ensemble

Ce dossier contient les **Cloud Functions Firebase** pour gérer automatiquement les **custom claims** des utilisateurs.

---

## 📦 Fonctions Disponibles

### 1. `setUserClaims` (Firestore Trigger)

**Type**: Trigger automatique  
**Déclencheur**: Modification de `/users/{uid}`  
**Action**: Définit automatiquement les custom claims dans Firebase Auth

```javascript
// Custom claims définis:
{
  role: "admin" | "teacher" | "student",
  approved: boolean,
  status: "active" | "pending" | "suspended"
}
```

**Exemple d'utilisation**:
```javascript
// Côté client - Modifier un document Firestore
await updateDoc(doc(db, 'users', userId), {
  role: 'admin',
  approved: true
});

// → La Cloud Function se déclenche automatiquement
// → Les custom claims sont mis à jour dans Firebase Auth
```

---

### 2. `refreshUserClaims` (Callable Function)

**Type**: Fonction appelable depuis le client  
**Permissions**: User peut refresh ses propres claims, Admin peut refresh n'importe qui  
**Action**: Force le refresh des custom claims

**Exemple d'utilisation**:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const refreshClaims = httpsCallable(functions, 'refreshUserClaims');

// Refresh pour soi-même
const result = await refreshClaims({});
console.log(result.data.claims); // { role: 'admin', ... }

// Refresh pour un autre user (admin seulement)
const result = await refreshClaims({ uid: 'USER_ID' });
```

---

### 3. `getMyCustomClaims` (Callable Function)

**Type**: Fonction appelable depuis le client  
**Permissions**: User authentifié  
**Action**: Retourne les custom claims actuels (debug)

**Exemple d'utilisation**:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const getClaims = httpsCallable(functions, 'getMyCustomClaims');

const result = await getClaims();
console.log(result.data.claims); // { role: 'admin', approved: true, ... }
```

---

## 🚀 Déploiement

### Installation des dépendances

```bash
cd functions
npm install
cd ..
```

### Déployer toutes les fonctions

```bash
firebase deploy --only functions
```

### Déployer une fonction spécifique

```bash
firebase deploy --only functions:setUserClaims
firebase deploy --only functions:refreshUserClaims
firebase deploy --only functions:getMyCustomClaims
```

---

## 📊 Monitoring

### Voir les logs en temps réel

```bash
firebase functions:log
```

### Voir les logs d'une fonction spécifique

```bash
firebase functions:log --only setUserClaims
```

### Voir les logs dans Firebase Console

Firebase Console → Functions → Logs

---

## 🔧 Développement Local

### Émuler les fonctions localement

```bash
firebase emulators:start --only functions
```

### Tester les fonctions locales

```javascript
// Dans votre code client, pointer vers l'émulateur
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const functions = getFunctions();
if (location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

---

## 🐛 Dépannage

### Fonction ne se déclenche pas

**Solution**:
1. Vérifier que la fonction est déployée: `firebase functions:list`
2. Vérifier le chemin du trigger: `users/{uid}`
3. Vérifier les logs: `firebase functions:log`

### Erreur de permissions

**Solution**:
1. Vérifier que le service account a les bonnes permissions dans IAM
2. Role nécessaire: "Firebase Admin SDK Administrator Service Agent"

### Claims non définis

**Solution**:
1. Vérifier que le document Firestore existe: `/users/{uid}`
2. Vérifier que le champ `role` existe dans le document
3. Exécuter manuellement: `node ../refresh-all-claims.js`

---

## 📝 Structure du Code

```
functions/
├── index.js                 # Toutes les Cloud Functions
├── package.json             # Dépendances
├── .gitignore              # Ignore node_modules
└── README.md               # Ce fichier
```

---

## 🔗 Ressources

- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)

---

## ✅ Checklist de Déploiement

- [ ] Installer les dépendances: `npm install`
- [ ] Se connecter à Firebase: `firebase login`
- [ ] Sélectionner le projet: `firebase use PROJECT_ID`
- [ ] Déployer: `firebase deploy --only functions`
- [ ] Vérifier: `firebase functions:list`
- [ ] Tester: Modifier un document `/users/{uid}` et vérifier les logs

---

**Version**: 1.0.0  
**Date**: 2025-11-01  
**Runtime**: Node.js 18
