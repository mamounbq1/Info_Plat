# 🚀 Guide de Déploiement Vercel

## 🎯 Problème Résolu

**Erreur**: `404 NOT_FOUND` lors de l'actualisation des pages ou accès direct aux routes

**Solution**: Configuration `vercel.json` pour le routing SPA (Single Page Application)

---

## 📋 Fichiers Ajoutés

### 1. `vercel.json` - Configuration Vercel

Ce fichier configure:
- ✅ **Rewrites**: Redirige toutes les routes vers `/index.html`
- ✅ **Routes**: Gère le routing côté client
- ✅ **Headers**: Cache optimisé pour les assets statiques
- ✅ **Build**: Configuration du build command et output directory

### 2. `.vercelignore` - Fichiers à Exclure

Exclut du déploiement:
- Scripts de seeding
- Tests
- Documentation markdown
- Fichiers de développement

---

## 🔧 Configuration Vercel

### Étape 1: Connecter le Repository

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New Project"
3. Importer votre repository GitHub `mamounbq1/Info_Plat`
4. Sélectionner la branche `main` (ou `genspark_ai_developer`)

### Étape 2: Configuration du Projet

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Étape 3: Variables d'Environnement

Ajouter dans Vercel Dashboard → Settings → Environment Variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

⚠️ **Important**: Copier les valeurs depuis votre fichier `.env` local

### Étape 4: Configuration du Domaine GoDaddy

#### Dans Vercel:

1. Aller dans **Settings → Domains**
2. Ajouter votre domaine GoDaddy: `votre-domaine.com`
3. Vercel vous donnera des enregistrements DNS à configurer

#### Dans GoDaddy:

1. Aller dans **DNS Management** de votre domaine
2. Ajouter les enregistrements fournis par Vercel:

**Type A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600
```

**Type CNAME Record (pour www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 600
```

**Attendre 24-48h** pour la propagation DNS (généralement 1-2 heures)

---

## 🔄 Redéploiement après Changements

### Option 1: Automatic (Recommandé)

Vercel redéploie automatiquement à chaque push sur la branche configurée:

```bash
git add .
git commit -m "fix: Your changes"
git push origin main
```

### Option 2: Manual

1. Aller dans Vercel Dashboard
2. Cliquer sur votre projet
3. Aller dans **Deployments**
4. Cliquer sur **Redeploy**

---

## 🐛 Résolution de Problèmes

### Erreur 404 Persiste

**Vérifier**:
1. ✅ Le fichier `vercel.json` existe à la racine
2. ✅ Le build s'est terminé avec succès
3. ✅ Le dossier `dist` contient `index.html`
4. ✅ Les rewrites sont correctement configurés

**Solution**:
```bash
# Forcer un nouveau déploiement
vercel --prod --force
```

### Variables d'Environnement Manquantes

**Symptômes**:
- Firebase errors
- "apiKey is not defined"
- Auth not working

**Solution**:
1. Vérifier dans Vercel Dashboard → Settings → Environment Variables
2. S'assurer que tous les `VITE_*` variables sont définies
3. Redéployer après ajout des variables

### Domaine GoDaddy ne Fonctionne Pas

**Vérifier**:
1. DNS propagation: https://dnschecker.org
2. Enregistrements DNS corrects dans GoDaddy
3. Domaine vérifié dans Vercel

**Solution**:
```bash
# Vérifier les DNS
nslookup votre-domaine.com

# Attendre la propagation (peut prendre jusqu'à 48h)
```

### Build Failed

**Erreurs Communes**:

1. **Missing dependencies**:
```bash
npm install
npm run build
```

2. **Syntax errors**:
```bash
npm run lint
# Corriger les erreurs
```

3. **Memory issues**:
Dans `vercel.json`, ajouter:
```json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max_old_space_size=4096"
    }
  }
}
```

---

## 📊 Performance après Déploiement

### Vérifications Post-Déploiement

1. **Routing**: Tester toutes les routes principales
   - `/` (Homepage)
   - `/about`
   - `/privacy`
   - `/terms`
   - `/login`
   - `/signup`

2. **Actualisation**: F5 sur chaque page → Doit fonctionner sans 404

3. **Navigation**: Tester la navigation entre pages

4. **Firebase**: Tester connexion/inscription

5. **Mobile**: Tester sur mobile

### Optimisations

```bash
# Analyser la taille du bundle
npm run build
npx vite-bundle-visualizer

# Lighthouse audit
lighthouse https://votre-domaine.com --view
```

---

## 🎯 Checklist de Déploiement

### Avant Déploiement

- [ ] Fichier `vercel.json` créé
- [ ] Fichier `.vercelignore` créé
- [ ] Variables d'environnement préparées
- [ ] Build local réussi (`npm run build`)
- [ ] Tests passés
- [ ] Code committé et poussé

### Configuration Vercel

- [ ] Projet créé sur Vercel
- [ ] Repository connecté
- [ ] Branche sélectionnée (main/genspark_ai_developer)
- [ ] Build command configuré: `npm run build`
- [ ] Output directory configuré: `dist`
- [ ] Variables d'environnement ajoutées

### Configuration Domaine

- [ ] Domaine ajouté dans Vercel
- [ ] Enregistrements DNS configurés dans GoDaddy
- [ ] DNS propagation vérifiée
- [ ] HTTPS activé automatiquement

### Vérification Post-Déploiement

- [ ] Homepage accessible
- [ ] Toutes les routes fonctionnent
- [ ] Actualisation des pages OK (pas de 404)
- [ ] Firebase connexion fonctionne
- [ ] Mobile responsive
- [ ] Performance satisfaisante

---

## 🔗 Liens Utiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentation Vercel**: https://vercel.com/docs
- **DNS Checker**: https://dnschecker.org
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse

---

## 📞 Support

### Erreur Persiste?

1. **Vérifier les logs Vercel**:
   - Dashboard → Project → Deployments → View Logs

2. **Vérifier la console navigateur**:
   - F12 → Console

3. **Contacter le support Vercel**:
   - https://vercel.com/support

---

## ✅ Configuration Actuelle

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Cette configuration:
- ✅ Redirige toutes les routes vers index.html
- ✅ Gère le routing côté client
- ✅ Cache les assets pour de meilleures performances
- ✅ Résout le problème 404 NOT_FOUND

---

**Date**: 2025-10-25  
**Status**: ✅ Configuration Vercel Complète  
**Next**: Merger PR #3 et redéployer sur Vercel 🚀
