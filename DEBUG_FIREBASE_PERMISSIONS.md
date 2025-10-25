# 🔍 Diagnostic Firebase Storage Permissions

## Problème
Erreur 403 (Forbidden) lors de l'upload d'images malgré la publication des règles Storage.

---

## ✅ Checklist de Diagnostic

### 1️⃣ **Vérifier que vous êtes connecté en tant qu'Admin**

#### Dans la console du navigateur (F12) :
```javascript
// 1. Vérifier l'utilisateur connecté
firebase.auth().currentUser.uid

// 2. Copier cet UID et cherchez-le dans Firestore
```

#### Dans Firebase Console → Firestore Database :
1. Ouvrez la collection **`users`**
2. Trouvez le document avec l'UID de votre utilisateur
3. **VÉRIFIEZ** que le champ **`role`** = `"admin"` (en minuscules)

⚠️ **Points critiques** :
- Le rôle doit être EXACTEMENT `"admin"` (pas `"Admin"`, pas `"ADMIN"`)
- Le champ doit s'appeler EXACTEMENT `"role"` (pas `"userRole"`, pas `"type"`)

---

### 2️⃣ **Vérifier les règles Storage publiées**

#### Dans Firebase Console → Storage → Rules :
Vérifiez que vous voyez bien ceci :

```javascript
match /hero-images/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && 
                  get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

⚠️ **Points critiques** :
- `/databases/(default)/documents/` est correct (pas `/databases/$(database)/documents/`)
- `role == 'admin'` (pas `role == "Admin"`)
- Les règles sont bien **PUBLIÉES** (bouton bleu "Publish")

---

### 3️⃣ **Vérifier le nom du bucket Storage**

Le bucket doit être : `eduinfor-fff3d.appspot.com` ou `eduinfor-fff3d.firebasestorage.app`

Dans l'erreur, on voit : `eduinfor-fff3d.firebasestorage.app`

Vérifiez dans `.env` :
```bash
VITE_FIREBASE_STORAGE_BUCKET=eduinfor-fff3d.appspot.com
```

---

## 🔧 Solutions Possibles

### Solution 1 : Règles simplifiées pour tester

**Remplacez temporairement** les règles Storage par ceci (POUR TESTER UNIQUEMENT) :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // TEMPORAIRE : Tous les utilisateurs authentifiés peuvent uploader
    match /hero-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // N'importe quel utilisateur authentifié
    }
    
    match /news-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /clubs-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /gallery-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Règles existantes
    match /courses/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /course-materials/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /quizzes/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

**Testez l'upload**. Si ça marche, le problème vient de la vérification du rôle admin.

---

### Solution 2 : Vérifier que le document utilisateur existe

Les règles Storage font un `get()` vers Firestore pour vérifier le rôle.

**Test dans la console navigateur** :
```javascript
// Vérifier que le document user existe
firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
  .then(doc => {
    if (doc.exists) {
      console.log('✅ User document exists:', doc.data());
      console.log('Role:', doc.data().role);
    } else {
      console.log('❌ User document does NOT exist');
    }
  });
```

Si le document n'existe pas ou n'a pas de champ `role`, **créez-le manuellement** :

1. Firebase Console → Firestore Database
2. Collection `users` → Ajouter un document
3. ID du document : Votre UID utilisateur
4. Champs :
   - `role` (string) = `"admin"`
   - `email` (string) = votre email
   - `fullName` (string) = votre nom

---

### Solution 3 : Utiliser les règles sans vérification Firestore

Si les règles avec `get()` ne marchent pas, utilisez des Custom Claims (plus complexe) ou des règles basées uniquement sur l'email :

```javascript
// Règles basées sur l'email (temporaire)
match /hero-images/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && 
                  request.auth.token.email.matches('.*@.*'); // Tous les emails authentifiés
}
```

---

## 🧪 Script de Test Complet

Ajoutez ce bouton de test dans votre interface admin :

```javascript
const testStoragePermissions = async () => {
  console.log('🧪 Testing Storage Permissions...');
  
  // 1. Vérifier l'authentification
  const user = auth.currentUser;
  console.log('1. User UID:', user?.uid);
  console.log('   Email:', user?.email);
  
  // 2. Vérifier le document Firestore
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    console.log('2. Firestore user doc exists:', userDoc.exists());
    if (userDoc.exists()) {
      console.log('   User data:', userDoc.data());
      console.log('   Role:', userDoc.data().role);
    }
  }
  
  // 3. Tester l'upload
  try {
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testRef = ref(storage, `hero-images/test-${Date.now()}.txt`);
    await uploadBytes(testRef, testFile);
    console.log('3. ✅ Upload SUCCESS!');
    
    // Nettoyage
    await deleteObject(testRef);
  } catch (error) {
    console.error('3. ❌ Upload FAILED:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
  }
};
```

---

## 📋 Étapes à suivre MAINTENANT

1. ✅ **Ouvrez la console navigateur** (F12)
2. ✅ **Vérifiez votre UID** : `firebase.auth().currentUser.uid`
3. ✅ **Vérifiez dans Firestore** : Collection `users` → Votre UID → Champ `role` = `"admin"`
4. ✅ **Utilisez les règles simplifiées** (Solution 1) pour tester
5. ✅ **Essayez d'uploader** une image

**Confirmez-moi** :
- ✅ Quelle est votre UID ?
- ✅ Le document existe-t-il dans Firestore `users` ?
- ✅ Quel est le contenu du champ `role` ?
- ✅ Les règles simplifiées (Solution 1) fonctionnent-elles ?

---

**Une fois ces infos obtenues, je pourrai vous donner la solution exacte !** 🎯
