# 🔄 Batch Update Gallery Categories - Guide d'Utilisation

Ce guide explique comment utiliser le composant temporaire `GalleryCategoryBatchUpdate` pour assigner des catégories à toutes les images de galerie existantes.

---

## 📋 Situation Actuelle

- ✅ **Filter UI**: Le filtre de catégories est actif sur `/gallery`
- ✅ **Admin Form**: Le dropdown de catégories est ajouté dans le formulaire admin
- ✅ **Shared Config**: Les 7 catégories sont définies dans `galleryCategories.js`
- ❌ **Existing Images**: 0/12 images ont actuellement un champ `category`

---

## 🎯 Objectif

Assigner automatiquement des catégories aux 12 images existantes basé sur leurs titres en français et arabe.

---

## 🛠️ Instructions d'Utilisation

### Étape 1: Ajouter le Composant Temporaire

Ouvrez le fichier `/src/pages/AdminDashboard.jsx` et ajoutez l'import :

```javascript
import GalleryCategoryBatchUpdate from '../components/cms/GalleryCategoryBatchUpdate';
```

### Étape 2: Ajouter l'Onglet dans l'Interface Admin

Dans AdminDashboard.jsx, trouvez la section où les onglets de contenu sont affichés (autour de la ligne avec `contentSubTab === 'homepage'`) et ajoutez un nouvel onglet :

```javascript
{contentSubTab === 'batch-gallery-update' && (
  <GalleryCategoryBatchUpdate isArabic={language === 'ar'} />
)}
```

### Étape 3: Ajouter le Bouton d'Onglet

Ajoutez un bouton pour accéder à l'onglet batch update (dans la section des sous-onglets) :

```javascript
<button
  onClick={() => setContentSubTab('batch-gallery-update')}
  className={contentSubTab === 'batch-gallery-update' ? 'active-tab-class' : 'inactive-tab-class'}
>
  🔄 Batch Gallery Update
</button>
```

### Étape 4: Exécuter la Mise à Jour

1. **Accédez au Dashboard Admin**
2. **Cliquez sur l'onglet "🔄 Batch Gallery Update"**
3. **Vérifiez les statistiques** :
   - Total des images
   - Images sans catégorie
   - Images avec catégorie
4. **Visualisez les catégories suggérées** pour chaque image
5. **Cliquez sur "Mettre à Jour Toutes les Images"**
6. **Confirmez l'action** dans la boîte de dialogue
7. **Attendez que la barre de progression atteigne 100%**
8. **Vérifiez le message de succès** ✅

### Étape 5: Vérifier les Résultats

1. Allez dans la section **Gallery Manager**
2. Éditez quelques images pour vérifier que les catégories sont correctement assignées
3. Visitez la page **/gallery** sur le site public
4. **Testez les filtres** pour vérifier qu'ils fonctionnent

### Étape 6: Nettoyer (Important!)

Une fois la mise à jour terminée avec succès :

1. **Supprimez l'import** de `GalleryCategoryBatchUpdate` dans AdminDashboard.jsx
2. **Supprimez la condition d'affichage** du composant
3. **Supprimez le bouton d'onglet** ajouté
4. **(Optionnel)** Supprimez le fichier `/src/components/cms/GalleryCategoryBatchUpdate.jsx`

---

## 🤖 Comment les Catégories Sont Assignées

Le composant utilise une détection intelligente par mots-clés dans les titres FR/AR :

| Catégorie | Mots-Clés Français | Mots-Clés Arabes |
|-----------|-------------------|------------------|
| **campus** | campus, établissement, école | الحرم, مدرسة |
| **sports** | sport, football, basketball | رياض, كرة القدم |
| **facilities** | laboratoire, bibliothèque, salle | مختبر, مكتبة, قاعة |
| **events** | événement, festival, journée | حدث, مهرجان, يوم |
| **ceremonies** | cérémonie, remise, diplôme | حفل, تخرج |
| **activities** | activité, atelier, club | نشاط, ورشة |
| **academic** | cours, classe, étudiant | درس, صف, طالب |

**Défaut** : Si aucun mot-clé ne correspond, la catégorie `campus` est assignée par défaut.

---

## 🔍 Les 7 Catégories Disponibles

1. 🏫 **campus** (الحرم الجامعي) - Campus et bâtiments
2. 🎉 **events** (أحداث) - Événements et festivals
3. ⚽ **sports** (رياضة) - Activités sportives
4. 🎨 **activities** (أنشطة) - Activités et ateliers
5. 🎓 **ceremonies** (حفلات) - Cérémonies et remises de diplômes
6. 🏗️ **facilities** (المرافق) - Laboratoires, bibliothèques, salles
7. 📚 **academic** (أكاديمي) - Cours et vie académique

---

## ⚠️ Notes Importantes

1. **Component Temporaire** : Ce composant est conçu pour un usage unique. Supprimez-le après utilisation.
2. **Backup Recommandé** : Si vous voulez être prudent, exportez les données Firebase avant de lancer la mise à jour.
3. **Vérification Manuelle** : Après la mise à jour automatique, vérifiez manuellement quelques catégories et ajustez si nécessaire via le Gallery Manager standard.
4. **Pas de Rollback Automatique** : Il n'y a pas de fonction d'annulation. Les catégories seront écrasées.

---

## 🚨 Dépannage

### Problème : "Permission Denied"
**Solution** : Assurez-vous d'être connecté en tant qu'admin dans Firebase.

### Problème : Aucune image ne s'affiche
**Solution** : Vérifiez que la collection `homepage-gallery` existe dans Firebase et contient des documents.

### Problème : Les catégories ne correspondent pas
**Solution** : Après la mise à jour automatique, utilisez le Gallery Manager pour corriger manuellement les catégories.

### Problème : La barre de progression se bloque
**Solution** : Vérifiez la console du navigateur pour les erreurs. Rafraîchissez la page et réessayez.

---

## ✅ Checklist de Complétion

Après avoir terminé :

- [ ] Toutes les images ont une catégorie assignée
- [ ] Les filtres sur `/gallery` fonctionnent correctement
- [ ] Vous pouvez filtrer par chaque catégorie et voir les bonnes images
- [ ] Le composant batch update est supprimé du code
- [ ] Le fichier `GalleryCategoryBatchUpdate.jsx` est supprimé (optionnel)
- [ ] Le code est propre et prêt pour la production

---

## 📝 Alternative : Mise à Jour Manuelle

Si vous préférez ne pas utiliser le composant batch update, vous pouvez assigner les catégories manuellement :

1. Allez dans **Gallery Manager**
2. Pour chaque image, cliquez sur **Éditer**
3. Sélectionnez une catégorie dans le dropdown
4. Cliquez sur **Sauvegarder**
5. Répétez pour les 12 images

---

## 📚 Ressources Complémentaires

- **Category Config** : `/src/constants/galleryCategories.js`
- **Gallery Manager** : `/src/components/cms/GalleryManager.jsx`
- **Gallery Page** : `/src/pages/GalleryPage.jsx`
- **Original Documentation** : `GALLERY_CATEGORIES_SETUP.md`

---

**Date de Création** : 2025-10-25  
**Auteur** : GenSpark AI Developer  
**Version** : 1.0
