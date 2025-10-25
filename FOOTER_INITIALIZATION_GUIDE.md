# 📝 Guide d'initialisation du Footer

Ce guide explique comment initialiser le contenu du footer dans Firebase pour qu'il soit éditable depuis le panneau d'administration.

## 🎯 Objectif

Uploader les informations existantes du footer vers l'éditeur admin pour permettre leur modification sans toucher au code.

---

## 📍 Méthode 1: Via le Panneau Admin (RECOMMANDÉ)

C'est la méthode la plus simple et la plus sûre.

### Étapes:

1. **Connectez-vous au panneau admin**
   - URL: Votre domaine + `/admin`
   - Utilisez vos identifiants admin

2. **Naviguez vers la section Footer**
   - Cliquez sur l'onglet **"Contact & Liens"** (Tab 3)
   - Cliquez sur **"Footer"** dans la liste

3. **Remplissez les champs avec les valeurs par défaut**

   **Section 1 - À Propos:**
   ```
   Nom (FR): Lycée d'Excellence
   Nom (AR): ثانوية التميز
   Description (FR): Établissement d'excellence dédié à former les leaders de demain
   Description (AR): مؤسسة تعليمية متميزة مكرسة لتكوين قادة الغد
   ```

   **Section 2 - Liens Rapides:**
   ```
   Titre (FR): Liens Rapides
   Titre (AR): روابط سريعة
   ```

   **Section 3 - Contact:**
   ```
   Titre (FR): Contact
   Titre (AR): اتصل بنا
   ```

   **Section 4 - Réseaux Sociaux:**
   ```
   Titre (FR): Suivez-nous
   Titre (AR): تابعنا
   
   Facebook: (laissez vide ou ajoutez votre URL)
   Twitter: (laissez vide ou ajoutez votre URL)
   Instagram: (laissez vide ou ajoutez votre URL)
   YouTube: (laissez vide ou ajoutez votre URL)
   LinkedIn: (laissez vide ou ajoutez votre URL)
   ```

   **Section 5 - Copyright:**
   ```
   Texte (FR): © 2025 Lycée d'Excellence. Tous droits réservés.
   Texte (AR): © 2025 ثانوية التميز. جميع الحقوق محفوظة.
   ```

4. **Cliquez sur "Sauvegarder"**

5. **Vérifiez le footer sur la page d'accueil**
   - Le footer devrait maintenant afficher vos textes personnalisés
   - Les icônes des réseaux sociaux n'apparaissent que si vous avez rempli les URLs

---

## 📍 Méthode 2: Via la Console Firebase

Si vous avez accès à la console Firebase, vous pouvez créer le document manuellement.

### Étapes:

1. **Ouvrez la Console Firebase**
   - Allez sur https://console.firebase.google.com
   - Sélectionnez votre projet

2. **Accédez à Firestore Database**
   - Dans le menu latéral: Firestore Database
   - Cliquez sur l'onglet "Data"

3. **Naviguez vers la collection `homepage`**
   - Si elle n'existe pas, créez-la
   - Cliquez sur "homepage"

4. **Créez le document `footer`**
   - Cliquez sur "Add document"
   - Document ID: `footer`

5. **Ajoutez les champs suivants:**

   ```
   Field                    Type      Value
   ───────────────────────────────────────────────────────────
   schoolNameFr            string    Lycée d'Excellence
   schoolNameAr            string    ثانوية التميز
   descriptionFr           string    Établissement d'excellence dédié à former les leaders de demain
   descriptionAr           string    مؤسسة تعليمية متميزة مكرسة لتكوين قادة الغد
   linksColumnTitleFr      string    Liens Rapides
   linksColumnTitleAr      string    روابط سريعة
   contactColumnTitleFr    string    Contact
   contactColumnTitleAr    string    اتصل بنا
   socialTitleFr           string    Suivez-nous
   socialTitleAr           string    تابعنا
   facebookUrl             string    (laisser vide ou ajouter URL)
   twitterUrl              string    (laisser vide ou ajouter URL)
   instagramUrl            string    (laisser vide ou ajouter URL)
   youtubeUrl              string    (laisser vide ou ajouter URL)
   linkedinUrl             string    (laisser vide ou ajouter URL)
   copyrightTextFr         string    © 2025 Lycée d'Excellence. Tous droits réservés.
   copyrightTextAr         string    © 2025 ثانوية التميز. جميع الحقوق محفوظة.
   createdAt               string    2025-10-25T03:30:00.000Z
   updatedAt               string    2025-10-25T03:30:00.000Z
   ```

6. **Cliquez sur "Save"**

7. **Actualisez votre page d'accueil**
   - Le footer devrait maintenant utiliser le contenu de Firebase

---

## 📍 Méthode 3: Script d'initialisation (Nécessite Firebase Admin)

⚠️ **Note:** Cette méthode nécessite des credentials Firebase Admin et n'est pas disponible avec les règles de sécurité actuelles.

Si vous avez un compte de service Firebase Admin:

1. Téléchargez votre clé de compte de service depuis Firebase Console
2. Placez-la dans le projet (par exemple: `service-account-key.json`)
3. Modifiez le script `seed-footer.cjs` pour utiliser ce fichier
4. Exécutez: `node seed-footer.cjs`

---

## ✅ Vérification

Après avoir initialisé le footer, vérifiez que tout fonctionne:

### 1. **Dans le Panneau Admin**
- Allez dans Contact & Liens → Footer
- Vérifiez que tous les champs sont remplis
- La prévisualisation devrait afficher votre contenu

### 2. **Sur la Page d'Accueil**
- Scrollez vers le bas jusqu'au footer
- Vérifiez que les textes correspondent
- Si vous avez ajouté des URLs de réseaux sociaux, vérifiez que les icônes s'affichent
- Cliquez sur les icônes pour vérifier que les liens fonctionnent

### 3. **Test Bilingue**
- Changez la langue (FR ↔ AR)
- Vérifiez que le footer affiche les bonnes traductions

---

## 🔧 Personnalisation

Une fois initialisé, vous pouvez personnaliser le footer à tout moment:

### 1. **Modifier les textes**
   - Admin Panel → Contact & Liens → Footer
   - Changez les textes que vous voulez
   - Cliquez sur "Sauvegarder"

### 2. **Ajouter des réseaux sociaux**
   - Remplissez les champs URL (Facebook, Twitter, etc.)
   - Format: `https://facebook.com/votrepage`
   - Les icônes apparaîtront automatiquement

### 3. **Supprimer des réseaux sociaux**
   - Videz simplement le champ URL
   - L'icône disparaîtra automatiquement du footer

---

## 🆘 Dépannage

### Le footer n'affiche pas mes changements

**Solution 1:** Videz le cache du navigateur
- Ctrl + Shift + R (Windows/Linux)
- Cmd + Shift + R (Mac)

**Solution 2:** Vérifiez Firebase
- Console Firebase → Firestore Database
- Collection: `homepage`, Document: `footer`
- Vérifiez que les champs sont bien remplis

**Solution 3:** Vérifiez les logs
- Ouvrez la console du navigateur (F12)
- Onglet "Console"
- Cherchez des erreurs liées à Firestore

### Les icônes des réseaux sociaux ne s'affichent pas

**Cause probable:** Les champs URL sont vides

**Solution:** Remplissez les URLs des réseaux sociaux dans l'admin panel

**Format correct:**
- ✅ `https://facebook.com/votrepage`
- ✅ `https://twitter.com/votrepage`
- ❌ `facebook.com/votrepage` (manque https://)
- ❌ `www.facebook.com/votrepage` (manque https://)

### Le texte arabe s'affiche mal

**Cause:** Problème d'encodage ou de direction du texte

**Solution:**
- Vérifiez que vous avez copié-collé correctement le texte arabe
- La direction RTL est gérée automatiquement
- Si le problème persiste, ressaisissez le texte directement dans l'admin panel

---

## 📚 Structure Firebase

Pour référence, voici la structure complète du document `homepage/footer`:

```javascript
{
  // Section À Propos (Colonne 1)
  schoolNameFr: string,      // Nom de l'école en français
  schoolNameAr: string,      // Nom de l'école en arabe
  descriptionFr: string,     // Description en français
  descriptionAr: string,     // Description en arabe
  
  // Section Liens Rapides (Colonne 2)
  linksColumnTitleFr: string,   // Titre de la colonne en français
  linksColumnTitleAr: string,   // Titre de la colonne en arabe
  
  // Section Contact (Colonne 3)
  contactColumnTitleFr: string, // Titre de la colonne en français
  contactColumnTitleAr: string, // Titre de la colonne en arabe
  
  // Section Réseaux Sociaux (Colonne 4)
  socialTitleFr: string,     // Titre en français
  socialTitleAr: string,     // Titre en arabe
  facebookUrl: string,       // URL Facebook (optionnel)
  twitterUrl: string,        // URL Twitter (optionnel)
  instagramUrl: string,      // URL Instagram (optionnel)
  youtubeUrl: string,        // URL YouTube (optionnel)
  linkedinUrl: string,       // URL LinkedIn (optionnel)
  
  // Section Copyright
  copyrightTextFr: string,   // Texte de copyright en français
  copyrightTextAr: string,   // Texte de copyright en arabe
  
  // Métadonnées
  createdAt: string,         // Date de création (ISO 8601)
  updatedAt: string          // Date de dernière modification (ISO 8601)
}
```

---

## 💡 Conseils

1. **Sauvegardez régulièrement**
   - Exportez votre configuration Firestore régulièrement
   - Gardez une copie de vos textes personnalisés

2. **Testez avant de déployer**
   - Vérifiez toujours dans l'environnement de développement
   - Testez les deux langues (FR et AR)

3. **URLs de réseaux sociaux**
   - Utilisez toujours des URLs complètes avec `https://`
   - Vérifiez que les liens fonctionnent avant de sauvegarder

4. **Copyright**
   - Pensez à mettre à jour l'année chaque début d'année
   - Utilisez le panneau admin pour changer facilement

---

**Dernière mise à jour:** 25 octobre 2025  
**Version:** 1.0.0
