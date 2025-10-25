# 🌱 GUIDE COMPLET DE SEEDING - PLATEFORME ÉDUCATIVE MAROCAINE

**Date**: 22 octobre 2025  
**Objectif**: Remplir la base de données Firebase avec toutes les données de test

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Scripts disponibles](#scripts-disponibles)
4. [Données incluses](#données-incluses)
5. [Instructions pas à pas](#instructions-pas-à-pas)
6. [Identifiants de connexion](#identifiants-de-connexion)
7. [Dépannage](#dépannage)
8. [Après le seeding](#après-le-seeding)

---

## 🎯 Vue d'ensemble

Ce guide vous permet de remplir votre base de données Firebase Firestore avec:

- ✅ **72 utilisateurs complets** (2 admins, 20 professeurs, 50 étudiants)
- ✅ **3 niveaux académiques** (TC, 1BAC, 2BAC)
- ✅ **4 branches** (Sciences Mathématiques, Sciences Expérimentales, Lettres, Économie)
- ✅ **10 matières** (Math, Physique, SVT, Français, Anglais, Arabe, Histoire-Géo, Informatique, Philosophie)
- ✅ **50+ cours** (optionnel avec seed:all)
- ✅ **40+ quiz** (optionnel avec seed:all)
- ✅ **40+ exercices** (optionnel avec seed:all)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir:

1. ✅ Node.js installé (version 16 ou supérieure)
2. ✅ Accès à la console Firebase
3. ✅ Connexion internet stable
4. ✅ Droits d'administration sur le projet Firebase

---

## 📦 Scripts disponibles

### Option 1: Seeding complet avec 72 utilisateurs seulement (RECOMMANDÉ)

```bash
npm run seed:comprehensive
```

**Contenu:**
- 2 administrateurs
- 20 professeurs
- 50 étudiants
- Hiérarchie académique (niveaux, branches, matières)

**Temps d'exécution:** ~30 secondes  
**Documents créés:** ~89 documents

### Option 2: Seeding avec cours, quiz et exercices

```bash
npm run seed:all
```

**Contenu:**
- 2 administrateurs
- 8 professeurs
- 12 étudiants
- 20+ cours
- 10+ quiz
- 10+ exercices
- Hiérarchie académique

**Temps d'exécution:** ~2 minutes  
**Documents créés:** ~70+ documents

---

## 📊 Données incluses

### 👨‍💼 Administrateurs (2)

| Email | Mot de passe | Nom |
|-------|--------------|-----|
| admin@eduplatform.ma | Admin2025! | Administrateur Principal |
| superadmin@eduplatform.ma | SuperAdmin2025! | Super Admin |

### 👨‍🏫 Professeurs (20)

Tous utilisent le mot de passe: **Prof2025!**

**Matières:**
- 3 professeurs de Mathématiques
- 3 professeurs de Physique-Chimie
- 2 professeurs de SVT
- 4 professeurs de Français
- 2 professeurs d'Anglais
- 1 professeur d'Arabe
- 2 professeurs d'Histoire-Géographie
- 2 professeurs d'Informatique
- 1 professeur de Philosophie

**Voir le fichier complet:** `IDENTIFIANTS_CONNEXION.md`

### 👨‍🎓 Étudiants (50)

Tous utilisent le mot de passe: **Student2025!**

**Répartition par niveau:**
- 20 étudiants en 2BAC (10 SM + 10 SE)
- 20 étudiants en 1BAC (10 SM + 10 SE)
- 10 étudiants en TC (5 scientifique + 5 littéraire)

**Voir le fichier complet:** `IDENTIFIANTS_CONNEXION.md`

---

## 🚀 Instructions pas à pas

### Étape 1: Changer les règles Firebase (OBLIGATOIRE)

1. Ouvrez la console Firebase: https://console.firebase.google.com
2. Sélectionnez votre projet: **eduinfor-fff3d**
3. Allez dans: **Build** → **Firestore Database** → **Rules**
4. Remplacez par ces règles temporaires:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Cliquez sur **"Publish"**

⚠️ **ATTENTION**: Ces règles sont dangereuses! À remplacer immédiatement après le seeding.

### Étape 2: Exécuter le script de seeding

Dans votre terminal, exécutez:

```bash
# Pour 72 utilisateurs complets
npm run seed:comprehensive

# OU pour inclure aussi les cours, quiz, exercices
npm run seed:all
```

### Étape 3: Vérifier les données dans Firestore

1. Retournez dans Firebase Console
2. **Firestore Database** → Onglet **Data**
3. Vérifiez les collections:
   - `academicLevels` → 3 documents
   - `branches` → 4 documents
   - `subjects` → 10 documents
   - `users` → 72 documents (ou 22 si seed:all)
   - `courses` → 20+ documents (si seed:all)
   - `quizzes` → 10+ documents (si seed:all)
   - `exercises` → 10+ documents (si seed:all)

### Étape 4: Créer les utilisateurs dans Firebase Authentication

Les utilisateurs doivent AUSSI être créés dans **Firebase Authentication**.

#### Option A: Création manuelle (pour test rapide)

1. **Build** → **Authentication** → **Add user**
2. Créez au moins 2-3 comptes pour tester:
   - 1 admin: admin@eduplatform.ma / Admin2025!
   - 1 prof: ahmed.benjelloun@eduplatform.ma / Prof2025!
   - 1 étudiant: ayoub.mansouri@student.eduplatform.ma / Student2025!

#### Option B: Import en masse (recommandé)

Utilisez Firebase CLI pour importer tous les utilisateurs:

```bash
# Créer un fichier CSV avec format:
# email,password,displayName,emailVerified
# admin@eduplatform.ma,Admin2025!,Administrateur Principal,true
# ...

firebase auth:import users.csv --hash-algo=BCRYPT
```

### Étape 5: Remettre les règles sécurisées (OBLIGATOIRE!)

🔒 **CRITIQUE**: Remplacez immédiatement les règles par des règles sécurisées.

Voir le fichier complet: `FIREBASE_RULES_TEMPORAIRES.md`

---

## 🔐 Identifiants de connexion

### Mots de passe par défaut

- **Admins**: `Admin2025!` ou `SuperAdmin2025!`
- **Professeurs**: `Prof2025!`
- **Étudiants**: `Student2025!`

### Fichier complet des identifiants

Consultez le fichier `IDENTIFIANTS_CONNEXION.md` pour la liste complète des 72 comptes avec:
- Emails
- Mots de passe
- Noms complets
- Matières enseignées (professeurs)
- Niveaux et branches (étudiants)

---

## 🔧 Dépannage

### Erreur: "Permission denied"

**Cause**: Les règles Firebase ne sont pas en mode ouvert.

**Solution**:
1. Vérifiez que vous avez bien changé les règles Firebase
2. Attendez 10 secondes que les règles se propagent
3. Relancez le script

### Erreur: "Firebase not initialized"

**Cause**: Configuration Firebase manquante ou incorrecte.

**Solution**:
1. Vérifiez le fichier `src/config/firebase.js`
2. Assurez-vous que les clés API sont correctes
3. Vérifiez votre connexion internet

### Erreur: "Quota exceeded"

**Cause**: Dépassement du quota gratuit Firebase.

**Solution**:
1. Attendez 24h (quota se renouvelle)
2. OU passez au plan Blaze (paiement à l'usage)
3. OU réduisez le nombre de documents à créer

### Le script se bloque

**Cause**: Réseau lent ou timeout.

**Solution**:
1. Vérifiez votre connexion internet
2. Relancez le script
3. Utilisez `seed:comprehensive` plutôt que `seed:all` (plus rapide)

### Les utilisateurs ne peuvent pas se connecter

**Cause**: Les utilisateurs n'existent pas dans Firebase Authentication.

**Solution**:
1. Créez les utilisateurs dans Firebase Authentication (voir Étape 4)
2. Assurez-vous que les emails et mots de passe correspondent exactement

---

## ✨ Après le seeding

### Checklist de sécurité

Une fois le seeding terminé:

- [ ] ✅ Règles Firebase sécurisées réactivées
- [ ] ✅ Tous les utilisateurs créés dans Authentication
- [ ] ✅ Tests de connexion effectués
- [ ] ✅ Mots de passe par défaut changés (en production)
- [ ] ✅ 2FA activé pour les admins (en production)
- [ ] ✅ Sauvegarde de la base effectuée
- [ ] ✅ Fichier `IDENTIFIANTS_CONNEXION.md` sécurisé ou supprimé

### Tester l'application

1. Lancez l'application: `npm run dev`
2. Testez la connexion avec différents rôles:
   - Admin: admin@eduplatform.ma / Admin2025!
   - Professeur: ahmed.benjelloun@eduplatform.ma / Prof2025!
   - Étudiant: ayoub.mansouri@student.eduplatform.ma / Student2025!
3. Vérifiez que chaque rôle a les bonnes permissions

### Prochaines étapes

1. **Personnaliser les données**:
   - Ajouter de vrais cours avec contenu
   - Créer des quiz interactifs
   - Ajouter des exercices pratiques

2. **Configurer l'authentification**:
   - Activer la vérification d'email
   - Configurer la récupération de mot de passe
   - Ajouter l'authentification Google/Facebook (optionnel)

3. **Configurer Firebase Storage**:
   - Pour les photos de profil
   - Pour les documents PDF des cours
   - Pour les images des quiz

4. **Activer Firebase Analytics**:
   - Suivre l'utilisation de l'application
   - Analyser le comportement des utilisateurs

---

## 📞 Support

Si vous avez des questions ou des problèmes:

1. Consultez la documentation Firebase: https://firebase.google.com/docs
2. Vérifiez les logs dans la console
3. Cherchez l'erreur spécifique dans Stack Overflow
4. Contactez le support Firebase (plan payant uniquement)

---

## 📝 Notes importantes

### Limitations du plan gratuit Firebase

- **Firestore**: 50,000 lectures/jour, 20,000 écritures/jour
- **Authentication**: Utilisateurs illimités
- **Storage**: 5 GB de stockage
- **Bandwidth**: 360 MB/jour

Si vous dépassez ces limites, passez au plan Blaze (paiement à l'usage).

### Performance

Le seeding peut prendre du temps selon:
- Votre connexion internet
- Le nombre de documents à créer
- Le quota Firebase disponible

**Conseils**:
- Utilisez `seed:comprehensive` pour un seeding rapide
- Utilisez `seed:all` seulement si vous avez besoin des cours/quiz/exercices
- Évitez de lancer le script plusieurs fois de suite (quota)

---

## 🎉 Félicitations!

Une fois le seeding terminé, vous avez une base de données complète avec 72 utilisateurs prêts à être testés!

**Prochaine étape**: Lancez l'application avec `npm run dev` et commencez à explorer! 🚀

---

**Date de dernière mise à jour**: 22 octobre 2025  
**Version**: 1.0.0  
**Auteur**: Équipe de développement
