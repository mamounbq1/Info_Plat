# 🧪 Guide de Test - Conversion URL → File Upload

## 📋 Compte de test

```
Email: temp-admin@test.com
Password: TempAdmin123!
URL: https://5173-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai/login
```

---

## ✅ Composants à tester (6/9 convertis)

### **1. GalleryManager** ✅
- **Accès**: Admin Dashboard → (chercher Gallery)
- **Test**: Ajouter une photo de galerie
- **Dossier Storage**: `/gallery/`
- **Validation**: Image, max 10MB

### **2. HomeContentManager - News** ✅
- **Accès**: Admin Dashboard → Gestion du Contenu → News
- **Test**: Créer un article avec image
- **Dossier Storage**: `/news/`
- **Validation**: Image, max 5MB

### **3. HomeContentManager - Testimonials** ✅
- **Accès**: Admin Dashboard → Gestion du Contenu → Testimonials
- **Test**: Ajouter un témoignage avec avatar
- **Dossier Storage**: `/testimonials/`
- **Validation**: Image, max 2MB

### **4. AboutManager** ✅
- **Accès**: Admin Dashboard → (chercher About)
- **Test**: Modifier l'image de la section À Propos
- **Dossier Storage**: `/about/`
- **Validation**: Image, max 5MB

### **5. EventsManager** ✅
- **Accès**: Admin Dashboard → (chercher Events)
- **Test**: Créer un événement avec image de couverture
- **Dossier Storage**: `/events/`
- **Validation**: Image, max 5MB

### **6. SiteSettingsManager** ✅
- **Accès**: Admin Dashboard → Paramètres du Site
- **Test**: Uploader un logo
- **Dossier Storage**: `/site-settings/`
- **Validation**: Image, max 2MB

### **7. AdminCourses** ✅ (Déjà testé)
- **Accès**: Admin Dashboard → Cours
- **Test**: Créer un cours avec miniature
- **Dossier Storage**: `/courses/`
- **Validation**: Image, max 5MB

---

## 📝 Checklist de test

Pour chaque composant:

- [ ] Ouvrir le composant
- [ ] Cliquer sur "Ajouter" ou "Modifier"
- [ ] Trouver le champ d'upload d'image
- [ ] Drag & drop une image OU cliquer pour sélectionner
- [ ] Vérifier que l'upload fonctionne (toast success)
- [ ] Vérifier l'aperçu de l'image
- [ ] Sauvegarder
- [ ] Recharger la page
- [ ] Vérifier que l'image est bien affichée
- [ ] Remplacer l'image (test de suppression de l'ancienne)
- [ ] Vérifier que l'ancienne image est supprimée

---

## 🌐 Vérification en tant que visiteur

Après avoir ajouté du contenu:

1. **Se déconnecter**
2. **Aller sur la page d'accueil**: `/`
3. **Vérifier les sections**:
   - [ ] Gallery (si galerie affichée sur la page)
   - [ ] News articles avec images
   - [ ] Testimonials avec avatars
   - [ ] Section About avec image
   - [ ] Events avec images de couverture
   - [ ] Logo dans la navbar

---

## 🐛 Bugs à surveiller

### **Erreurs possibles**:
- ❌ 403 Forbidden → Custom claims pas encore dans le token (se déconnecter/reconnecter)
- ❌ CORS error → Images ne s'affichent pas (problème CORS Storage)
- ❌ Validation error → Type de fichier incorrect ou taille trop grande
- ❌ Old image not deleted → Erreur DELETE (vérifier règles Storage)

### **UI Issues**:
- ⚠️ Drag & drop ne fonctionne pas
- ⚠️ Preview ne s'affiche pas
- ⚠️ Bouton disabled même après upload
- ⚠️ Image ne s'affiche pas après save

---

## 📊 Résultats attendus

### ✅ **Succès**:
- Upload fonctionne sans erreur
- Toast de succès affiché
- Image preview visible
- Image sauvegardée dans Firestore
- Image accessible en tant que visiteur
- Ancienne image supprimée lors du remplacement

### ❌ **Échec**:
- Erreur 403 ou autre
- Pas de preview
- Image non sauvegardée
- Image non visible sur le site public

---

## 🔧 Actions de correction

Si un test échoue:

1. **Vérifier les logs console** (F12)
2. **Vérifier les Storage Rules** dans Firebase Console
3. **Vérifier les custom claims** sur `/diagnostic-user`
4. **Re-tester après déconnexion/reconnexion**
5. **Corriger le code si nécessaire**
6. **Re-déployer**

---

**Date**: 2025-11-01  
**Status**: Prêt pour les tests  
**Testeur**: AI Assistant
