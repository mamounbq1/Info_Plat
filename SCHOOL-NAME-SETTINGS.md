# School Name Settings - Guide de Configuration

## 🎯 Problème Résolu

Avant cette mise à jour, le nom de l'école affiché dans la barre de navigation (Navbar) était **codé en dur** dans le code source. Même si un administrateur modifiait des paramètres dans le panneau d'administration, le nom ne changeait pas sur le site web officiel.

**Maintenant résolu ! ✅**

## 🚀 Nouvelle Fonctionnalité

### Paramètres du Site Dynamiques

Le nom de l'école et d'autres paramètres globaux du site peuvent maintenant être modifiés directement depuis le **Panneau d'Administration** :

#### 📍 Accès aux Paramètres
1. Connectez-vous en tant qu'Admin
2. Allez dans **Admin Dashboard**
3. Cliquez sur l'onglet **"Paramètres"** (⚙️)

### 🎨 Paramètres Configurables

#### 1. **Nom de l'École / Plateforme** ⭐
- **Français** : Le nom affiché quand l'utilisateur est en mode Français
- **Arabe** : Le nom affiché quand l'utilisateur est en mode Arabe
- **Affiché dans** : Barre de navigation (Navbar) en haut du site

#### 2. **Logo de l'École** 🖼️
- URL d'une image de logo personnalisée
- Si vide, l'icône par défaut (🎓) sera utilisée

#### 3. **Informations de Contact** 📞
- Numéro de téléphone
- Adresse email
- Adresse physique de l'établissement

## 🔧 Architecture Technique

### Composants Créés

#### 1. `useSiteSettings.js` - Hook React
```javascript
// Hook personnalisé pour gérer les paramètres du site
// Charge depuis: Firestore > siteSettings > general
const { settings, loading, updateSettings } = useSiteSettings();
```

#### 2. `SiteSettingsManager.jsx` - Composant Admin
- Interface graphique pour modifier les paramètres
- Formulaire bilingue (FR/AR)
- Sauvegarde dans Firestore
- Recharge automatique de la page après sauvegarde

#### 3. `Navbar.jsx` - Mise à Jour
```javascript
// Avant (codé en dur):
{language === 'ar' ? 'منصة التعليم' : 'EduPlatform'}

// Après (dynamique):
{language === 'ar' ? settings.schoolNameAr : settings.schoolNameFr}
```

### Structure Firestore

**Collection : `siteSettings`**
**Document : `general`**

```json
{
  "schoolNameFr": "Lycée Mohammed V",
  "schoolNameAr": "ثانوية محمد الخامس",
  "logoUrl": "https://example.com/logo.png",
  "phone": "+212 6XX-XXXXXX",
  "email": "contact@lycee.ma",
  "address": "123 Rue Example, Casablanca, Maroc",
  "updatedAt": "2025-10-24T..."
}
```

## 📝 Instructions d'Utilisation

### Pour les Administrateurs

#### Première Configuration

1. **Accéder aux Paramètres**
   - Tableau de bord Admin → Onglet "Paramètres"

2. **Remplir les Informations**
   - ⚠️ **Champs obligatoires** : Nom de l'école (FR & AR)
   - Optionnel : Logo, téléphone, email, adresse

3. **Sauvegarder**
   - Cliquez sur "Sauvegarder les Modifications"
   - La page se rechargera automatiquement
   - Le nouveau nom apparaîtra immédiatement dans la Navbar

#### Modifier les Paramètres

1. Retournez dans **Admin Dashboard → Paramètres**
2. Modifiez les champs désirés
3. Cliquez sur "Sauvegarder"
4. ✅ Changements appliqués instantanément

### Comportement par Défaut

Si aucun paramètre n'est configuré dans Firestore :
- **Nom par défaut (FR)** : "EduPlatform"
- **Nom par défaut (AR)** : "منصة التعليم"
- **Logo** : Icône académique 🎓

## 🔐 Sécurité Firestore

### Règles de Sécurité Recommandées

Ajoutez ces règles dans **Firestore → Rules** :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Site Settings - Lecture publique, écriture admin uniquement
    match /siteSettings/{document=**} {
      allow read: if true; // Tout le monde peut lire
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ... autres règles ...
  }
}
```

## 🧪 Test de la Fonctionnalité

### Checklist de Test

- [ ] **Login Admin** : Se connecter en tant qu'admin
- [ ] **Accéder aux Paramètres** : Tableau de bord → Paramètres
- [ ] **Modifier le nom (FR)** : Changer "EduPlatform" → "Mon Lycée"
- [ ] **Modifier le nom (AR)** : Changer "منصة التعليم" → "ثانويتي"
- [ ] **Sauvegarder** : Cliquer sur "Sauvegarder les Modifications"
- [ ] **Vérifier la Navbar** : Le nouveau nom doit apparaître
- [ ] **Tester le changement de langue** : FR ↔ AR
- [ ] **Tester avec Logo** : Ajouter une URL de logo
- [ ] **Vérifier la persistance** : Recharger la page manuellement

## 🐛 Dépannage

### Problème : Le nom ne change pas
**Solution** :
1. Vérifiez que vous êtes bien admin
2. Vérifiez que Firestore est bien configuré
3. Regardez la console du navigateur (F12) pour des erreurs
4. Vérifiez les règles de sécurité Firestore

### Problème : "Erreur lors de la sauvegarde"
**Solution** :
1. Vérifiez votre connexion Internet
2. Vérifiez les règles Firestore (`siteSettings` doit permettre l'écriture admin)
3. Vérifiez la console pour les détails de l'erreur

### Problème : Le logo ne s'affiche pas
**Solution** :
1. Vérifiez que l'URL du logo est valide et accessible
2. Vérifiez que l'image est hébergée sur un serveur HTTPS
3. Testez l'URL du logo dans un nouvel onglet

## 📊 Logs de Débogage

Le hook `useSiteSettings` affiche des logs détaillés dans la console :

```
⚙️ [useSiteSettings] Fetching site settings...
✅ [useSiteSettings] Settings loaded: {...}
💾 [useSiteSettings] Updating settings: {...}
✅ [useSiteSettings] Settings updated successfully
```

Pour voir ces logs :
1. Ouvrez la Console du Navigateur (F12)
2. Rechargez la page
3. Recherchez les messages préfixés par `[useSiteSettings]`

## 🎓 Exemples d'Utilisation

### Exemple 1 : Lycée Mohammed V

```
Nom (FR): Lycée Mohammed V - Tronc Commun
Nom (AR): ثانوية محمد الخامس - الجذع المشترك
Logo: https://lycee-mv.ma/logo.png
Téléphone: +212 522-123456
Email: contact@lycee-mv.ma
Adresse: Avenue Hassan II, Casablanca, Maroc
```

### Exemple 2 : Plateforme Éducative Nationale

```
Nom (FR): Plateforme Éducative Marocaine
Nom (AR): المنصة التعليمية المغربية
Logo: [laisser vide pour icône par défaut]
Email: support@education.ma
```

## 🔄 Migration depuis l'Ancien Système

Si votre site utilisait l'ancien système avec le nom codé en dur :

1. Les changements sont **rétrocompatibles**
2. Les valeurs par défaut ("EduPlatform" / "منصة التعليم") restent actives
3. Dès que vous configurez les paramètres, ils remplacent les valeurs par défaut
4. Aucune migration de données nécessaire

## 📚 Ressources Supplémentaires

- **Code Source** :
  - `src/hooks/useSiteSettings.js`
  - `src/components/SiteSettingsManager.jsx`
  - `src/components/Navbar.jsx`
  
- **Collections Firestore** :
  - `siteSettings` → `general`

## ✅ Résumé

Cette fonctionnalité permet de :
- ✅ Modifier le nom de l'école depuis l'interface admin
- ✅ Support bilingue (FR/AR) automatique
- ✅ Personnaliser le logo
- ✅ Ajouter des informations de contact
- ✅ Changements instantanés sur le site
- ✅ Interface intuitive et facile à utiliser

---

**Version** : 1.0.0  
**Date** : 24 Octobre 2025  
**Auteur** : Claude AI Assistant  
**Status** : ✅ Prêt pour Production
