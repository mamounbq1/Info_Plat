# 🔑 Configuration du Service Account Firebase

Pour exécuter le script `refresh-all-claims.js`, vous avez besoin d'une **clé de service account** Firebase Admin.

---

## 📥 Étapes pour télécharger la clé

### 1. Accéder à la Firebase Console

Allez sur: [https://console.firebase.google.com](https://console.firebase.google.com)

### 2. Sélectionner votre projet

Cliquez sur votre projet (ex: "eduinfor-fff3d")

### 3. Accéder aux paramètres du projet

- Cliquez sur l'**icône d'engrenage** ⚙️ à côté de "Project Overview"
- Sélectionnez **"Project settings"** (Paramètres du projet)

### 4. Aller dans "Service accounts"

- Dans le menu du haut, cliquez sur **"Service accounts"** (Comptes de service)

### 5. Générer une nouvelle clé privée

- Scrollez jusqu'à la section **"Firebase Admin SDK"**
- Cliquez sur le bouton **"Generate new private key"** (Générer une nouvelle clé privée)
- Une fenêtre de confirmation s'ouvre
- Cliquez sur **"Generate key"** (Générer la clé)

### 6. Télécharger le fichier JSON

- Un fichier JSON sera automatiquement téléchargé
- Il s'appelle quelque chose comme: `eduinfor-fff3d-firebase-adminsdk-xxxxx.json`

### 7. Placer le fichier dans le projet

- **Renommez** le fichier en: `serviceAccountKey.json`
- **Déplacez-le** à la racine du projet: `/home/user/webapp/serviceAccountKey.json`

### 8. Sécuriser le fichier

**⚠️ IMPORTANT**: Ce fichier contient des credentials sensibles!

```bash
# Ajouter au .gitignore pour ne JAMAIS le commit
echo "serviceAccountKey.json" >> .gitignore
```

---

## 🛡️ Sécurité

### ❌ NE JAMAIS faire:

- ❌ Committer `serviceAccountKey.json` dans Git
- ❌ Partager ce fichier publiquement
- ❌ L'uploader sur un serveur non sécurisé
- ❌ Le copier dans `/dist` ou un dossier public

### ✅ À FAIRE:

- ✅ Ajouter au `.gitignore`
- ✅ Le stocker dans un endroit sécurisé (ex: 1Password, Vault)
- ✅ Utiliser des variables d'environnement en production
- ✅ Limiter les permissions du service account si possible

---

## 🔒 Vérifier que le fichier est protégé

```bash
# Vérifier que le fichier est dans .gitignore
cat .gitignore | grep serviceAccountKey.json

# Si la commande ne retourne rien, ajoutez-le:
echo "serviceAccountKey.json" >> .gitignore
```

---

## 🚀 Utilisation

Une fois le fichier en place:

```bash
# Installer firebase-admin si ce n'est pas déjà fait
npm install firebase-admin

# Exécuter le script
node refresh-all-claims.js
```

---

## 🔄 Alternative: Variables d'environnement

Pour une meilleure sécurité en production, utilisez des variables d'environnement:

### 1. Convertir le JSON en variable d'environnement

```bash
# Sur Linux/Mac
export FIREBASE_SERVICE_ACCOUNT=$(cat serviceAccountKey.json)

# Sur Windows PowerShell
$env:FIREBASE_SERVICE_ACCOUNT = Get-Content serviceAccountKey.json -Raw
```

### 2. Modifier le script pour utiliser la variable

```javascript
// Au lieu de require()
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### 3. Utiliser un fichier .env (développement local)

```bash
# Créer .env
echo 'FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}' > .env

# Ajouter au .gitignore
echo ".env" >> .gitignore

# Utiliser dotenv
npm install dotenv
```

```javascript
// Dans le script
require('dotenv').config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
```

---

## 🆘 Dépannage

### Erreur: "Cannot find module './serviceAccountKey.json'"

**Solution**: Le fichier n'est pas au bon endroit ou n'a pas le bon nom.

```bash
# Vérifier que le fichier existe
ls -la serviceAccountKey.json

# S'assurer qu'il est à la racine du projet
pwd
# Doit afficher: /home/user/webapp
```

### Erreur: "Credential implementation provided to initializeApp() via the 'credential' property failed"

**Solution**: Le fichier JSON est corrompu ou invalide.

- Re-téléchargez une nouvelle clé depuis Firebase Console
- Vérifiez que c'est bien un fichier JSON valide (pas de caractères bizarres)

### Erreur: "Permission denied"

**Solution**: Le service account n'a pas les bonnes permissions.

- Dans Firebase Console → IAM & Admin
- Vérifiez que le service account a le rôle: **"Firebase Admin SDK Administrator Service Agent"**

---

## 📚 Documentation officielle

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Service Account Credentials](https://cloud.google.com/iam/docs/service-accounts)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/security)

---

**Créé le**: 2025-11-01  
**Dernière mise à jour**: 2025-11-01
