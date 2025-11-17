# ✅ CORS Deployment - Bucket Correct Identifié

## 🎯 Bucket Name Correct

```
gs://eduinfor-fff3d.firebasestorage.app
```

---

## ⚡ Commande Finale à Exécuter

Dans **Google Cloud Shell**, copiez-collez cette commande:

```bash
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://eduinfor-fff3d.firebasestorage.app
gsutil cors get gs://eduinfor-fff3d.firebasestorage.app
```

---

## ✅ Résultat Attendu

Vous devriez voir:

```
Setting CORS on gs://eduinfor-fff3d.firebasestorage.app/...
```

Suivi de:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 🧪 Vérification Après Déploiement

1. **Rechargez votre site** (F5 ou Ctrl+Shift+R)
2. **Ouvrez Console Développeur** (F12)
3. **Vérifiez:**
   - ✅ Plus d'erreurs CORS
   - ✅ Images se chargent correctement
   - ✅ Network tab montre Status 200 pour les images

4. **Testez les pages:**
   - Landing Page: http://localhost:5173/
   - Gallery Page: http://localhost:5173/gallery

---

## 🔧 Si Problème Persiste

```bash
# Vider le cache du bucket
gsutil -m setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" \
  gs://eduinfor-fff3d.firebasestorage.app/**

# Redéployer CORS
gsutil cors set cors.json gs://eduinfor-fff3d.firebasestorage.app
```

Puis dans votre navigateur:
1. Ctrl+Shift+R (vider cache navigateur)
2. Dans Admin Gallery, cliquer "Vider Cache"
3. Recharger F5

---

**Status:** Prêt à déployer sur le bucket correct  
**Date:** 2025-11-01
