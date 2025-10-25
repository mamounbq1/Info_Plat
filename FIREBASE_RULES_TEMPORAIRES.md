# 🔥 RÈGLES FIREBASE TEMPORAIRES POUR LE SEEDING

**Date**: 22 octobre 2025  
**Objectif**: Permettre l'écriture dans Firestore pour le seeding de la base de données

---

## ⚠️ IMPORTANT - RÈGLES TEMPORAIRES UNIQUEMENT

Ces règles sont **DANGEREUSES** et ne doivent être utilisées que **TEMPORAIREMENT** pendant le seeding de la base de données. Une fois le seeding terminé, vous DEVEZ les remplacer par des règles sécurisées.

---

## 📝 ÉTAPES À SUIVRE

### 1️⃣ Aller dans la Console Firebase

1. Ouvrez [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet: **eduinfor-fff3d**
3. Dans le menu latéral, allez dans: **Build** → **Firestore Database**
4. Cliquez sur l'onglet **Rules** (Règles)

### 2️⃣ Remplacer les règles actuelles

Copiez-collez ces règles **TEMPORAIRES** (⏰ pendant 10 minutes maximum):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ⚠️ ATTENTION: Règles temporaires pour le seeding UNIQUEMENT
    // À SUPPRIMER immédiatement après le seeding!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**OU** si vous voulez limiter par temps (recommandé):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ⚠️ ATTENTION: Règles temporaires valides jusqu'au 22 Oct 2025 23:59
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 10, 23);
    }
  }
}
```

### 3️⃣ Cliquer sur "Publish" (Publier)

Les règles seront actives immédiatement (en quelques secondes).

### 4️⃣ Exécuter le script de seeding

Dans votre terminal, exécutez:

```bash
# Option 1: Script complet avec tous les 72 utilisateurs
npm run seed:comprehensive

# Option 2: Script original (22 utilisateurs + cours, quiz, exercices)
npm run seed:all
```

### 5️⃣ Vérifier dans Firestore

1. Retournez dans **Firestore Database** → Onglet **Data**
2. Vérifiez que les collections sont remplies:
   - ✅ `academicLevels` (3 documents)
   - ✅ `branches` (4 documents)
   - ✅ `subjects` (10 documents)
   - ✅ `users` (72 documents pour seed:comprehensive, 22 pour seed:all)
   - ✅ `courses` (20+ documents si seed:all)
   - ✅ `quizzes` (10+ documents si seed:all)
   - ✅ `exercises` (10+ documents si seed:all)

### 6️⃣ 🔒 IMMÉDIATEMENT après le seeding: Remettre les règles sécurisées

**CRITIQUE**: Remplacez les règles par des règles de sécurité appropriées:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isTeacher() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    function isStudent() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Academic Levels - Read: all authenticated, Write: admin only
    match /academicLevels/{levelId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Branches - Read: all authenticated, Write: admin only
    match /branches/{branchId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Subjects - Read: all authenticated, Write: admin only
    match /subjects/{subjectId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Users - Read: self or admin, Write: admin or self (limited fields)
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow create: if isAdmin();
      allow update: if isAdmin() || (isOwner(userId) && 
                                     !request.resource.data.diff(resource.data).affectedKeys()
                                       .hasAny(['role', 'permissions', 'email']));
      allow delete: if isAdmin();
    }

    // Courses - Read: authenticated, Write: teacher/admin
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow create: if isTeacher() || isAdmin();
      allow update: if isAdmin() || (isTeacher() && 
                                     resource.data.createdBy == request.auth.token.name);
      allow delete: if isAdmin();
    }

    // Quizzes - Read: authenticated, Write: teacher/admin
    match /quizzes/{quizId} {
      allow read: if isAuthenticated();
      allow create: if isTeacher() || isAdmin();
      allow update: if isAdmin() || (isTeacher() && 
                                     resource.data.createdBy == request.auth.token.name);
      allow delete: if isAdmin();
    }

    // Exercises - Read: authenticated, Write: teacher/admin
    match /exercises/{exerciseId} {
      allow read: if isAuthenticated();
      allow create: if isTeacher() || isAdmin();
      allow update: if isAdmin() || (isTeacher() && 
                                     resource.data.createdBy == request.auth.token.name);
      allow delete: if isAdmin();
    }

    // Student Progress - Read: self or admin, Write: self or teacher/admin
    match /studentProgress/{progressId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.studentId) || isAdmin() || isTeacher());
      allow create, update: if isAuthenticated() && (isOwner(request.resource.data.studentId) || isAdmin() || isTeacher());
      allow delete: if isAdmin();
    }

    // Quiz Results - Read: self or admin, Write: self
    match /quizResults/{resultId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.studentId) || isAdmin() || isTeacher());
      allow create: if isAuthenticated() && isOwner(request.resource.data.studentId);
      allow update: if false; // Results are immutable
      allow delete: if isAdmin();
    }
  }
}
```

---

## 🔐 FIREBASE AUTHENTICATION

**IMPORTANT**: Les utilisateurs doivent également être créés dans **Firebase Authentication**.

### Option A: Création manuelle via Console Firebase

1. Allez dans **Build** → **Authentication**
2. Cliquez sur **Add user** pour chaque utilisateur
3. Utilisez les emails et mots de passe du fichier `IDENTIFIANTS_CONNEXION.md`

### Option B: Utiliser un script d'import (recommandé)

Créez un fichier `create-firebase-users.js` avec Firebase Admin SDK:

```javascript
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Initialiser Firebase Admin
const serviceAccount = JSON.parse(
  await readFile('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

// Liste des utilisateurs à créer
const users = [
  // Admins
  { email: "admin@eduplatform.ma", password: "Admin2025!", displayName: "Administrateur Principal" },
  { email: "superadmin@eduplatform.ma", password: "SuperAdmin2025!", displayName: "Super Admin" },
  
  // Teachers (20 comptes)
  { email: "ahmed.benjelloun@eduplatform.ma", password: "Prof2025!", displayName: "Prof. Ahmed Benjelloun" },
  // ... (ajouter tous les 20 professeurs)
  
  // Students (50 comptes)
  { email: "ayoub.mansouri@student.eduplatform.ma", password: "Student2025!", displayName: "Ayoub Mansouri" },
  // ... (ajouter tous les 50 étudiants)
];

async function createUsers() {
  console.log('🔐 Création des utilisateurs Firebase Authentication...\n');
  
  for (const user of users) {
    try {
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true
      });
      console.log(`✅ Créé: ${user.email} (UID: ${userRecord.uid})`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  Existe déjà: ${user.email}`);
      } else {
        console.error(`❌ Erreur pour ${user.email}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Création des utilisateurs terminée!');
  process.exit(0);
}

createUsers();
```

**Note**: Vous devez télécharger votre clé de service Firebase Admin depuis la console Firebase.

---

## ✅ CHECKLIST DE SÉCURITÉ

Avant de passer en production, assurez-vous de:

- [ ] Règles Firebase sécurisées activées
- [ ] Tous les utilisateurs ont des mots de passe uniques (pas les mots de passe par défaut!)
- [ ] Authentification à deux facteurs activée pour les admins
- [ ] Sauvegarde de la base de données effectuée
- [ ] Tests de sécurité effectués
- [ ] Fichier `IDENTIFIANTS_CONNEXION.md` supprimé ou sécurisé
- [ ] Clés API Firebase restreintes par domaine
- [ ] Logs d'audit activés

---

## 📞 SUPPORT

Si vous rencontrez des erreurs pendant le seeding:

1. **Erreur de permission**: Vérifiez que les règles temporaires sont bien actives
2. **Erreur de réseau**: Vérifiez votre connexion internet
3. **Erreur de quota**: Vérifiez votre quota Firebase (plan gratuit limité)
4. **Timeout**: Réduisez le nombre de documents à créer en une seule fois

---

**Date de création**: 22 octobre 2025  
**Auteur**: Assistant IA  
**Version**: 1.0.0  
**Statut**: ⚠️ RÈGLES TEMPORAIRES - À REMPLACER IMMÉDIATEMENT APRÈS LE SEEDING
