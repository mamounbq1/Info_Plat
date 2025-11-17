# ⚡ Quick Start - Déploiement Rapide

## 🚀 Installation en 5 Minutes

```bash
# 1. Installer les dépendances Cloud Functions
cd functions && npm install && cd ..

# 2. Télécharger le service account
# → Firebase Console → Project Settings → Service Accounts → Generate Key
# → Sauvegarder comme: serviceAccountKey.json

# 3. Ajouter au .gitignore (déjà fait ✅)
echo "serviceAccountKey.json" >> .gitignore

# 4. Déployer les Cloud Functions
firebase deploy --only functions

# 5. Déployer les Storage Rules
cp storage.rules.professional storage.rules
firebase deploy --only storage

# 6. Refresh des claims pour users existants
npm install firebase-admin  # Si pas déjà installé
node refresh-all-claims.js

# 7. Se déconnecter et se reconnecter

# 8. Tester sur /diagnostic-user
```

---

## ✅ Vérification Rapide

### Test 1: Custom Claims Présents?

```
1. Aller sur: /diagnostic-user
2. Vérifier section 3: "Token Firebase"
3. Doit afficher: ✅ "Rôle présent dans le token: admin"
```

### Test 2: Upload Admin Fonctionne?

```
1. GalleryManager
2. Upload une image
3. ✅ Doit marcher
```

### Test 3: Upload Student Bloqué?

```
1. Compte student
2. GalleryManager
3. ❌ Erreur 403 (normal)
```

---

## 🔧 Rollback si Problème

```bash
# Revenir aux anciennes règles
cp storage.rules.backup storage.rules
firebase deploy --only storage
```

---

## 📚 Documentation Complète

| Fichier | Usage |
|---------|-------|
| **SUMMARY.md** | Vue d'ensemble |
| **MIGRATION_GUIDE.md** | Guide complet (45 min) |
| **SECURITY_ARCHITECTURE.md** | Architecture détaillée |
| **DEPLOY_CLOUD_FUNCTIONS.md** | Déploiement functions |
| **SERVICE_ACCOUNT_SETUP.md** | Config service account |

---

## 🆘 Problèmes Courants

| Symptôme | Solution |
|----------|----------|
| "Claims not found" | Déconnexion + Reconnexion |
| "403 Unauthorized" | Vérifier rôle admin dans Firestore |
| "Function not found" | `firebase deploy --only functions` |
| Token expiré | Bouton "Actualiser" sur /diagnostic-user |

---

## 📞 Support

1. Consulter `/diagnostic-user` pour diagnostic
2. Vérifier logs: `firebase functions:log`
3. Lire `MIGRATION_GUIDE.md` section "Dépannage"

---

**Temps total**: ~15 minutes (avec service account déjà téléchargé)  
**Status**: Production-ready ✅
