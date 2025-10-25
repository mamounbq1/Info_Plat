# 🔧 TROUBLESHOOTING 404 - VERCEL

**Date**: 2025-10-25  
**Problème**: 404 persiste malgré vercel.json  
**Status**: EN COURS DE RÉSOLUTION

---

## ✅ CE QUI A ÉTÉ FAIT

### 1. Simplifié vercel.json (Commit: 0404ec0)

**AVANT** (trop complexe):
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [...],
  "routes": [...],
  "headers": [...]
}
```

**APRÈS** (minimal et fiable):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Ajouté public/_redirects (Commit: baf03e5)

```
/* /index.html 200
```

---

## 🎯 VÉRIFICATIONS CRITIQUES DANS VERCEL DASHBOARD

### Étape 1: Framework Preset

1. **Aller dans**: Settings → General
2. **Vérifier**: Framework Preset = **Vite** ✅
3. **Si différent**: Changer manuellement à "Vite"

### Étape 2: Build & Output Settings

**Dans Settings → General:**

```
Framework Preset: Vite ✅
Build Command: (laisser vide - auto-détecté)
Output Directory: (laisser vide - auto-détecté)
Install Command: npm install ✅
```

⚠️ **IMPORTANT**: Ne PAS mettre de Build Command ni Output Directory manuellement!

### Étape 3: Root Directory

**Dans Settings → General:**

```
Root Directory: ./ (ou laisser vide)
```

### Étape 4: Node.js Version

**Dans Settings → General:**

```
Node.js Version: 18.x (ou plus récent)
```

---

## 🔄 FORCER UN NOUVEAU DÉPLOIEMENT

### Méthode 1: Via Dashboard (Recommandé)

1. Aller dans **Deployments**
2. Trouver le dernier déploiement
3. Cliquer sur **⋮** (trois points)
4. Cliquer sur **Redeploy**
5. **IMPORTANT**: Décocher "Use existing Build Cache"
6. Cliquer sur **Redeploy**

### Méthode 2: Via CLI

```bash
npm install -g vercel
vercel --prod --force
```

### Méthode 3: Trigger via Git

```bash
# Faire un commit vide pour trigger le redéploiement
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

---

## 🧪 TESTS APRÈS REDÉPLOIEMENT

### Test 1: Hard Refresh du Navigateur

```bash
# Windows/Linux
Ctrl + Shift + R

# Mac
Cmd + Shift + R
```

### Test 2: Mode Incognito

```bash
# Chrome
Ctrl + Shift + N

# Safari
Cmd + Shift + N
```

### Test 3: Vider Tout le Cache

```bash
# Chrome/Edge
1. Ctrl + Shift + Delete
2. Sélectionner "All time"
3. Cocher "Cached images and files"
4. Cliquer "Clear data"
```

### Test 4: Tester avec cURL

```bash
# Tester directement depuis terminal
curl -I https://votre-domaine.com/about

# Résultat attendu:
# HTTP/2 200 OK
# content-type: text/html
```

---

## 🔍 VÉRIFIER SI LE FIX EST APPLIQUÉ

### Dans Vercel Dashboard

1. **Aller dans**: Deployments → Latest
2. **Cliquer sur**: Source
3. **Vérifier**:
   ```
   ✓ vercel.json présent
   ✓ Contenu: seulement "rewrites"
   ✓ public/_redirects présent
   ```

### Dans Build Logs

1. **Aller dans**: Deployments → Latest → Build Logs
2. **Chercher**:
   ```
   ✓ "Building..."
   ✓ "vite build"
   ✓ "dist/index.html" créé
   ✓ "Build Completed"
   ```

### Dans Function Logs

Si vous voyez des 404 ici, c'est que le rewrite ne fonctionne pas.

---

## 🐛 SI LE PROBLÈME PERSISTE ENCORE

### Option 1: Supprimer et Recréer le Projet Vercel

**Parfois, Vercel cache la configuration:**

1. Settings → Advanced → Delete Project
2. Recréer le projet depuis GitHub
3. Reconnecter le domaine

⚠️ **ATTENTION**: Vous perdrez l'historique des déploiements

### Option 2: Vérifier les Variables d'Environnement

**Le problème peut venir de Firebase non initialisé:**

Dans Settings → Environment Variables:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Option 3: Vérifier le Routing React

**Le problème peut venir du code React lui-même:**

Dans `src/App.jsx`, vérifier:

```jsx
<BrowserRouter>  {/* Pas HashRouter! */}
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/about" element={<AboutPage />} />
    {/* ... */}
  </Routes>
</BrowserRouter>
```

### Option 4: Ajouter un Fichier 404.html Personnalisé

Créer `public/404.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Redirect 404 to index.html with path preserved
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
<body>Redirecting...</body>
</html>
```

---

## 🎯 CONFIGURATION VERCEL.JSON ALTERNATIVES

### Option A: Avec Wildcards Explicites

```json
{
  "rewrites": [
    { "source": "/about", "destination": "/index.html" },
    { "source": "/privacy", "destination": "/index.html" },
    { "source": "/terms", "destination": "/index.html" },
    { "source": "/login", "destination": "/index.html" },
    { "source": "/signup", "destination": "/index.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option B: Avec Headers

```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Option C: Routes Style (Legacy)

```json
{
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 📞 CONTACT SUPPORT VERCEL

Si rien ne fonctionne:

1. **Ouvrir un ticket**: https://vercel.com/support
2. **Inclure**:
   - URL du projet
   - Screenshot de l'erreur 404
   - Logs du déploiement
   - Contenu de vercel.json
3. **Demander**: "SPA routing not working despite vercel.json configuration"

---

## ✅ CHECKLIST DE DIAGNOSTIC

### Configuration Vercel
- [ ] Framework Preset = Vite
- [ ] Build Command = (vide/auto)
- [ ] Output Directory = (vide/auto)
- [ ] Node.js Version ≥ 18.x
- [ ] Variables d'environnement configurées

### Fichiers Projet
- [ ] vercel.json existe et est simplifié
- [ ] public/_redirects existe
- [ ] dist/index.html créé après build
- [ ] src/App.jsx utilise BrowserRouter

### Déploiement
- [ ] Dernier déploiement = Ready
- [ ] Build logs sans erreurs
- [ ] vercel.json présent dans Source
- [ ] Cache navigateur vidé

### Tests
- [ ] Mode incognito testé
- [ ] Hard refresh (Ctrl+Shift+R) testé
- [ ] cURL retourne 200 OK
- [ ] Routes principales testées

---

## 🎊 SI ÇA MARCHE MAINTENANT

Confirmez que:
- [ ] ✅ Accès direct aux routes fonctionne
- [ ] ✅ F5 sur les pages ne donne pas 404
- [ ] ✅ Navigation fonctionne
- [ ] ✅ Bouton retour fonctionne

---

**Status**: EN ATTENTE DU NOUVEAU DÉPLOIEMENT  
**Fichiers Modifiés**: 
- ✅ vercel.json (simplifié)
- ✅ public/_redirects (ajouté)

**Prochaine Étape**: Attendre 2-5 minutes et tester!
