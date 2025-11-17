# 🚀 Guide de Migration - Règles Storage Professionnelles

## 📊 Situation Actuelle vs Objectif

### ❌ Avant (Règles basiques)

```javascript
match /gallery/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null; // ❌ Trop permissif
}
```

**Problèmes**:
- N'importe quel utilisateur authentifié peut uploader
- Pas de contrôle par rôle (admin/teacher/student)
- Pas de validation de type de fichier
- Pas de limite de taille

---

### ✅ Après (Règles professionnelles)

```javascript
match /gallery/{allPaths=**} {
  allow read: if true;
  allow write: if isAdmin() &&         // ✅ Admins seulement
                 isImage() &&          // ✅ Images uniquement
                 isUnderSize(10);      // ✅ Max 10MB
}

function isAdmin() {
  return request.auth != null && 
         request.auth.token.role == 'admin'; // ✅ Lecture du token (rapide!)
}
```

**Avantages**:
- ✅ Contrôle par rôle (custom claims)
- ✅ Validation de fichier
- ✅ Limites de taille
- ✅ Rapide (pas d'appel DB)
- ✅ Fiable (token signé)

---

## 📋 Plan de Migration (45 minutes)

```
┌──────────────────────────────────────────────────────────┐
│  PHASE 1: Préparation (10 min)                           │
├──────────────────────────────────────────────────────────┤
│  ✅ Installer dépendances Cloud Functions                │
│  ✅ Télécharger service account key                      │
│  ✅ Sauvegarder les règles actuelles                     │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  PHASE 2: Déploiement (15 min)                           │
├──────────────────────────────────────────────────────────┤
│  ✅ Déployer Cloud Functions                             │
│  ✅ Déployer Storage Rules                               │
│  ✅ Vérifier les logs                                    │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  PHASE 3: Migration des users (10 min)                   │
├──────────────────────────────────────────────────────────┤
│  ✅ Exécuter refresh-all-claims.js                       │
│  ✅ Vérifier custom claims dans Firebase Console         │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  PHASE 4: Tests & Validation (10 min)                    │
├──────────────────────────────────────────────────────────┤
│  ✅ Tester /diagnostic-user                              │
│  ✅ Tester upload admin (doit marcher)                   │
│  ✅ Tester upload student (doit échouer)                 │
│  ✅ Vérifier les logs Cloud Functions                    │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 PHASE 1: Préparation (10 min)

### Étape 1.1: Installer les dépendances

```bash
cd /home/user/webapp/functions
npm install
cd ..
```

### Étape 1.2: Télécharger la clé de service account

**Suivez le guide**: [`SERVICE_ACCOUNT_SETUP.md`](./SERVICE_ACCOUNT_SETUP.md)

1. Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Télécharger le JSON
4. Renommer en `serviceAccountKey.json`
5. Placer à la racine: `/home/user/webapp/serviceAccountKey.json`
6. Ajouter au `.gitignore`

```bash
echo "serviceAccountKey.json" >> .gitignore
```

### Étape 1.3: Sauvegarder les règles actuelles

```bash
# Sauvegarder l'ancien fichier
cp storage.rules storage.rules.backup

# Vous pourrez revenir en arrière avec:
# cp storage.rules.backup storage.rules
```

---

## 🚀 PHASE 2: Déploiement (15 min)

### Étape 2.1: Déployer les Cloud Functions

```bash
# S'assurer d'être connecté à Firebase
firebase login

# Vérifier le projet actif
firebase projects:list
firebase use eduinfor-fff3d  # Remplacer par votre project ID

# Déployer les fonctions
firebase deploy --only functions
```

**Résultat attendu**:
```
✔  functions[setUserClaims(us-central1)] Successful create operation.
✔  functions[refreshUserClaims(us-central1)] Successful create operation.
✔  functions[getMyCustomClaims(us-central1)] Successful create operation.

✔  Deploy complete!
```

### Étape 2.2: Vérifier que les fonctions sont déployées

```bash
firebase functions:list
```

Vous devriez voir:
- ✅ `setUserClaims` (Firestore trigger)
- ✅ `refreshUserClaims` (Callable)
- ✅ `getMyCustomClaims` (Callable)

### Étape 2.3: Déployer les Storage Rules

```bash
# Utiliser les nouvelles règles professionnelles
cp storage.rules.professional storage.rules

# Déployer
firebase deploy --only storage
```

**Résultat attendu**:
```
✔  storage: rules file storage.rules compiled successfully

✔  Deploy complete!
```

### Étape 2.4: Vérifier les logs

```bash
# Voir les logs en temps réel
firebase functions:log
```

---

## 👥 PHASE 3: Migration des users (10 min)

### Étape 3.1: Exécuter le script de refresh

```bash
# S'assurer que serviceAccountKey.json existe
ls -la serviceAccountKey.json

# Installer firebase-admin si nécessaire
npm install firebase-admin

# Exécuter le script
node refresh-all-claims.js
```

**Résultat attendu**:
```
🔄 Début du refresh des custom claims...

📊 5 utilisateurs trouvés

📝 Traitement: lmuA1p1kiDbcIGqYLIZgkP1YBuW2
   Email: adm@gmail.fr
   Nom: adm
   Rôle: admin
   Approuvé: true
   ✅ Claims définis: { role: 'admin', approved: true, status: 'active' }

...

═══════════════════════════════════════════
📊 RÉSUMÉ
═══════════════════════════════════════════
✅ Succès: 5
❌ Erreurs: 0
📈 Total: 5

✅ Refresh terminé!
```

### Étape 3.2: Vérifier dans Firebase Console

1. Firebase Console → Authentication → Users
2. Cliquer sur un utilisateur
3. Dans l'onglet "Custom claims", vous devriez voir:
```json
{
  "role": "admin",
  "approved": true,
  "status": "active"
}
```

---

## ✅ PHASE 4: Tests & Validation (10 min)

### Test 1: Page de diagnostic

1. Allez sur: `https://votre-app.com/diagnostic-user`
2. **Vérifiez**:
   - ✅ Section 1: Authentifié
   - ✅ Section 2: Document Firestore trouvé avec `role: "admin"`
   - ✅ **Section 3: Custom Claims présents dans le token**
     - Doit afficher: ✅ "Rôle présent dans le token: admin"
     - Si ❌ "Le token ne contient pas de custom claim":
       - Cliquez sur "Actualiser le token"
       - Ou déconnectez-vous et reconnectez-vous

### Test 2: Upload admin (doit marcher)

1. Connectez-vous en tant qu'**admin**
2. Allez dans **GalleryManager**
3. Essayez d'uploader une image
4. ✅ **Résultat attendu**: Upload réussi

### Test 3: Upload non-admin (doit échouer)

1. Créez un compte **student** (ou utilisez un compte existant)
2. Allez dans **GalleryManager**
3. Essayez d'uploader une image
4. ❌ **Résultat attendu**: Erreur 403 "storage/unauthorized"

### Test 4: Vérifier les logs

```bash
firebase functions:log --only setUserClaims
```

Vous devriez voir:
```
✅ Custom claims set for user lmuA1p1kiDbcIGqYLIZgkP1YBuW2: { role: 'admin', ... }
```

### Test 5: Tester la validation de fichier

1. Essayez d'uploader un **PDF** dans Gallery (doit échouer)
2. Essayez d'uploader une **image de 15MB** (doit échouer, limite 10MB)
3. ✅ Les règles bloquent les mauvais types/tailles

---

## 🔄 Rollback (si problème)

Si quelque chose ne marche pas, vous pouvez revenir aux anciennes règles:

```bash
# Restaurer les anciennes règles Storage
cp storage.rules.backup storage.rules
firebase deploy --only storage

# Les Cloud Functions ne causent pas de problème, pas besoin de les supprimer
```

---

## 📊 Monitoring post-migration

### Vérifier les logs régulièrement

```bash
# Logs des Cloud Functions
firebase functions:log

# Logs d'une fonction spécifique
firebase functions:log --only setUserClaims
```

### Ajouter des alertes (optionnel)

1. Firebase Console → Functions → Click sur une fonction
2. "Logs" → "Create metric"
3. Configurer des alertes pour les erreurs

---

## 🎯 Checklist finale

```
PRÉPARATION
[ ] Dépendances installées (cd functions && npm install)
[ ] Service account téléchargé et placé
[ ] Ajouté au .gitignore
[ ] Règles sauvegardées (storage.rules.backup)

DÉPLOIEMENT
[ ] Cloud Functions déployées (firebase deploy --only functions)
[ ] Fonctions visibles dans console (firebase functions:list)
[ ] Storage Rules déployées (firebase deploy --only storage)
[ ] Logs vérifiés (firebase functions:log)

MIGRATION USERS
[ ] Script exécuté (node refresh-all-claims.js)
[ ] Custom claims vérifiés dans Firebase Console
[ ] Aucune erreur dans le script

TESTS
[ ] /diagnostic-user → Claims présents ✅
[ ] Upload admin → Fonctionne ✅
[ ] Upload student → Bloqué ❌ (normal)
[ ] Validation fichier → Bloque PDF/grandes images ✅
[ ] Logs propres (pas d'erreurs)

POST-MIGRATION
[ ] Équipe informée de se déconnecter/reconnecter
[ ] Documentation partagée
[ ] Monitoring configuré
```

---

## 🆘 Aide & Support

### Problèmes courants

| Problème | Solution |
|----------|----------|
| "Claims not found" | Se déconnecter/reconnecter |
| "403 Unauthorized" | Vérifier le rôle dans Firestore + Claims dans token |
| "Function not found" | Vérifier que les fonctions sont déployées |
| "Invalid file type" | Vérifier que c'est bien une image pour Gallery |

### Ressources

- [`SECURITY_ARCHITECTURE.md`](./SECURITY_ARCHITECTURE.md) - Architecture détaillée
- [`DEPLOY_CLOUD_FUNCTIONS.md`](./DEPLOY_CLOUD_FUNCTIONS.md) - Guide de déploiement
- [`SERVICE_ACCOUNT_SETUP.md`](./SERVICE_ACCOUNT_SETUP.md) - Configuration du service account

---

## 🎉 Félicitations!

Vous avez maintenant une architecture de sécurité **professionnelle**, **scalable** et **performante**! 🚀

**Prochaines étapes**:
1. Documenter pour l'équipe
2. Former les admins
3. Monitorer les logs pendant quelques jours
4. Profiter des uploads sécurisés! 🎊

---

**Version**: 1.0.0  
**Date**: 2025-11-01  
**Status**: Production-ready ✅
