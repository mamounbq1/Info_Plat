# 📋 Structure Complète des Champs - Base de Données Firestore

Ce document détaille **tous les champs requis** pour chaque section de la page d'accueil, garantissant que les données enregistrées dans Firestore correspondent exactement à ce qui est attendu par la LandingPage.

---

## 🎯 Collection: `homepage`

### Document: `hero`

**Structure Firestore (Format attendu par LandingPage):**
```javascript
{
  title: {
    fr: "Bienvenue au Lycée Excellence",
    ar: "مرحبا بكم في ثانوية التميز"
  },
  subtitle: {
    fr: "Former les Leaders de Demain",
    ar: "تكوين قادة الغد"
  },
  description: {
    fr: "Un établissement d'excellence dédié à l'épanouissement académique",
    ar: "مؤسسة متميزة مكرسة للازدهار الأكاديمي"
  },
  badge: {
    fr: "Bienvenue au",
    ar: "مرحبا بكم في"
  },
  primaryButtonText: {
    fr: "Découvrir le Lycée",
    ar: "اكتشف الثانوية"
  },
  secondaryButtonText: {
    fr: "Nous Contacter",
    ar: "اتصل بنا"
  },
  backgroundImage: "https://...",
  enabled: true,
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `title.fr` + `title.ar` - Titre principal
- ✅ `subtitle.fr` + `subtitle.ar` - Sous-titre
- ✅ `description.fr` + `description.ar` - Description complète
- ✅ `badge.fr` + `badge.ar` - Petit badge au-dessus du titre
- ✅ `primaryButtonText.fr` + `primaryButtonText.ar` - Texte du bouton principal
- ✅ `secondaryButtonText.fr` + `secondaryButtonText.ar` - Texte du bouton secondaire
- ✅ `enabled` - Boolean pour activer/désactiver

**Champs Optionnels:**
- `backgroundImage` - URL de l'image de fond

---

### Document: `stats`

**Structure Firestore (Format attendu par LandingPage):**
```javascript
{
  stats0: {
    value: "1200",
    labelFr: "Élèves",
    labelAr: "طلاب",
    icon: "👨‍🎓"
  },
  stats1: {
    value: "80",
    labelFr: "Enseignants",
    labelAr: "أساتذة",
    icon: "👨‍🏫"
  },
  stats2: {
    value: "95%",
    labelFr: "Taux de Réussite",
    labelAr: "معدل النجاح",
    icon: "🎓"
  },
  stats3: {
    value: "15",
    labelFr: "Clubs",
    labelAr: "أندية",
    icon: "🏆"
  },
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires (pour chaque stats0-3):**
- ✅ `value` - Valeur de la statistique (string)
- ✅ `labelFr` - Label en français
- ✅ `labelAr` - Label en arabe
- ✅ `icon` - Emoji représentatif

**Notes:**
- Exactement 4 statistiques (stats0 à stats3)
- Les clés doivent être nommées `stats0`, `stats1`, `stats2`, `stats3`

---

### Document: `about`

**Structure Firestore:**
```javascript
{
  titleFr: "À Propos du Lycée",
  titleAr: "عن الثانوية",
  subtitleFr: "Excellence Académique & Épanouissement Personnel",
  subtitleAr: "التميز الأكاديمي والازدهار الشخصي",
  descriptionFr: "Le Lycée Excellence est un établissement...",
  descriptionAr: "ثانوية التميز هي مؤسسة...",
  imageUrl: "https://...",
  yearsOfExperience: 15,
  features: [
    {
      titleFr: "Programmes Excellents",
      titleAr: "برامج متميزة",
      descriptionFr: "Curriculums modernes",
      descriptionAr: "مناهج حديثة"
    },
    // ... 3 autres features
  ],
  enabled: true,
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `titleFr` + `titleAr` - Titre de la section
- ✅ `subtitleFr` + `subtitleAr` - Sous-titre
- ✅ `descriptionFr` + `descriptionAr` - Description complète
- ✅ `imageUrl` - URL de l'image de la section
- ✅ `yearsOfExperience` - Nombre d'années d'expérience (number)
- ✅ `features` - Array de 4 caractéristiques
- ✅ `enabled` - Boolean

**Structure de chaque feature:**
- `titleFr` + `titleAr`
- `descriptionFr` + `descriptionAr`

---

### Document: `contact`

**Structure Firestore:**
```javascript
{
  phoneFr: "+212 5XX-XXXXXX",
  phoneAr: "+212 5XX-XXXXXX",
  emailFr: "contact@lycee.ma",
  emailAr: "contact@lycee.ma",
  addressFr: "123 Rue Example, Ville",
  addressAr: "123 شارع المثال، المدينة",
  hoursFr: "Lun-Ven: 8h-17h",
  hoursAr: "الاثنين-الجمعة: 8-17",
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `phoneFr` + `phoneAr` - Numéro de téléphone
- ✅ `emailFr` + `emailAr` - Adresse email
- ✅ `addressFr` + `addressAr` - Adresse physique
- ✅ `hoursFr` + `hoursAr` - Horaires d'ouverture

---

### Document: `section-visibility`

**Structure Firestore:**
```javascript
{
  sections: [
    {
      id: "hero",
      nameFr: "Hero Section",
      nameAr: "القسم الرئيسي",
      enabled: true,
      order: 1
    },
    {
      id: "announcements",
      nameFr: "Annonces Urgentes",
      nameAr: "الإعلانات العاجلة",
      enabled: true,
      order: 2
    },
    // ... 8 autres sections
  ],
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires (pour chaque section):**
- ✅ `id` - Identifiant unique de la section
- ✅ `nameFr` + `nameAr` - Nom de la section
- ✅ `enabled` - Boolean pour activer/désactiver
- ✅ `order` - Ordre d'affichage (number)

**Sections disponibles (IDs):**
1. `hero`
2. `announcements`
3. `stats`
4. `about`
5. `news`
6. `clubs`
7. `gallery`
8. `testimonials`
9. `quicklinks`
10. `contact`

---

## 📚 Collection: `homepage-features`

**Structure de chaque document:**
```javascript
{
  titleFr: "Programme d'Excellence",
  titleAr: "برنامج التميز",
  descriptionFr: "Des programmes académiques de haute qualité",
  descriptionAr: "برامج أكاديمية عالية الجودة",
  icon: "BookOpenIcon",
  order: 0,
  enabled: true,
  createdAt: "2024-10-23T...",
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `titleFr` + `titleAr` - Titre de la fonctionnalité
- ✅ `descriptionFr` + `descriptionAr` - Description
- ✅ `icon` - Nom de l'icône Heroicons
- ✅ `order` - Ordre d'affichage (number)
- ✅ `enabled` - Boolean

**Icônes disponibles:**
- `BookOpenIcon`
- `AcademicCapIcon`
- `ClipboardDocumentCheckIcon`
- `UserGroupIcon`
- `ChartBarIcon`
- `CpuChipIcon`
- `GlobeAltIcon`
- `LightBulbIcon`
- `RocketLaunchIcon`
- `SparklesIcon`

---

## 📰 Collection: `homepage-news`

**Structure de chaque document:**
```javascript
{
  titleFr: "Rentrée Scolaire 2024",
  titleAr: "العودة المدرسية 2024",
  excerptFr: "Résumé court de l'article...",
  excerptAr: "ملخص قصير للمقال...",
  contentFr: "Contenu complet de l'article...",
  contentAr: "المحتوى الكامل للمقال...",
  dateFr: "23 Oct 2024",
  dateAr: "23 أكتوبر 2024",
  image: "https://...",
  category: "announcement",
  enabled: true,
  publishDate: "2024-10-23",
  createdAt: "2024-10-23T...",
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `titleFr` + `titleAr` - Titre de l'actualité
- ✅ `excerptFr` + `excerptAr` - Résumé court (affiché sur la carte)
- ✅ `contentFr` + `contentAr` - Contenu complet
- ✅ `dateFr` + `dateAr` - Date formatée pour l'affichage
- ✅ `image` - URL de l'image
- ✅ `category` - Catégorie de l'actualité
- ✅ `enabled` - Boolean
- ✅ `publishDate` - Date de publication (format: YYYY-MM-DD)

**Catégories possibles:**
- `announcement` - Annonce
- `event` - Événement
- `success` - Succès/Réussite
- `general` - Général

---

## 💬 Collection: `homepage-testimonials`

**Structure de chaque document:**
```javascript
{
  nameFr: "Ahmed Benani",
  nameAr: "أحمد بناني",
  roleFr: "Étudiant, Terminale",
  roleAr: "طالب، النهائية",
  quoteFr: "Le meilleur lycée de la région...",
  quoteAr: "أفضل ثانوية في المنطقة...",
  avatarUrl: "https://...",
  rating: 5,
  enabled: true,
  createdAt: "2024-10-23T...",
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `nameFr` + `nameAr` - Nom de la personne
- ✅ `roleFr` + `roleAr` - Rôle/Titre
- ✅ `quoteFr` + `quoteAr` - Citation/Témoignage
- ✅ `rating` - Note sur 5 (number: 1-5)
- ✅ `enabled` - Boolean

**Champs Optionnels:**
- `avatarUrl` - URL de la photo de profil

---

## 🔔 Collection: `homepage-announcements`

**Structure de chaque document:**
```javascript
{
  titleFr: "Fermeture Exceptionnelle",
  titleAr: "إغلاق استثنائي",
  dateFr: "23 Oct 2024",
  dateAr: "23 أكتوبر 2024",
  urgent: true,
  order: 0,
  enabled: true,
  createdAt: "2024-10-23T...",
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `titleFr` + `titleAr` - Titre de l'annonce
- ✅ `dateFr` + `dateAr` - Date de l'annonce
- ✅ `urgent` - Boolean (true = apparaît dans la barre d'urgence)
- ✅ `order` - Ordre d'affichage (number)
- ✅ `enabled` - Boolean

---

## 🏆 Collection: `homepage-clubs`

**Structure de chaque document:**
```javascript
{
  nameFr: "Club de Robotique",
  nameAr: "نادي الروبوتات",
  descriptionFr: "Apprenez à construire des robots",
  descriptionAr: "تعلم بناء الروبوتات",
  icon: "🤖",
  color: "from-blue-500 to-violet-600",
  order: 0,
  enabled: true,
  createdAt: "2024-10-23T...",
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `nameFr` + `nameAr` - Nom du club
- ✅ `descriptionFr` + `descriptionAr` - Description
- ✅ `icon` - Emoji représentatif
- ✅ `color` - Classes Tailwind pour le gradient (ex: "from-blue-500 to-violet-600")
- ✅ `order` - Ordre d'affichage (number)
- ✅ `enabled` - Boolean

**Couleurs suggérées (gradients Tailwind):**
- `from-blue-500 to-violet-600`
- `from-violet-500 to-purple-600`
- `from-amber-500 to-orange-600`
- `from-green-500 to-teal-600`
- `from-pink-500 to-rose-600`
- `from-indigo-500 to-blue-600`

---

## 📸 Collection: `homepage-gallery`

**Structure de chaque document:**
```javascript
{
  titleFr: "Cérémonie de Remise des Diplômes",
  titleAr: "حفل تسليم الشهادات",
  descriptionFr: "Promotion 2024",
  descriptionAr: "دفعة 2024",
  imageUrl: "https://...",
  order: 0,
  enabled: true,
  createdAt: "2024-10-23T...",
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `titleFr` + `titleAr` - Titre de l'image
- ✅ `imageUrl` - URL de l'image
- ✅ `order` - Ordre d'affichage (number)
- ✅ `enabled` - Boolean

**Champs Optionnels:**
- `descriptionFr` + `descriptionAr` - Description de l'image

---

## 🔗 Collection: `homepage-quicklinks`

**Structure de chaque document:**
```javascript
{
  titleFr: "Calendrier Scolaire",
  titleAr: "التقويم المدرسي",
  descriptionFr: "Consultez les dates importantes",
  descriptionAr: "راجع التواريخ المهمة",
  url: "/calendar",
  icon: "CalendarDaysIcon",
  order: 0,
  enabled: true,
  createdAt: "2024-10-23T...",
  updatedAt: "2024-10-23T..."
}
```

**Champs Obligatoires:**
- ✅ `titleFr` + `titleAr` - Titre du lien
- ✅ `descriptionFr` + `descriptionAr` - Description
- ✅ `url` - URL du lien (peut être interne /page ou externe https://...)
- ✅ `icon` - Nom de l'icône Heroicons
- ✅ `order` - Ordre d'affichage (number)
- ✅ `enabled` - Boolean

**Icônes disponibles pour Quick Links:**
- `AcademicCapIcon`
- `NewspaperIcon`
- `CalendarDaysIcon`
- `DocumentTextIcon`
- `BookOpenIcon`
- `TrophyIcon`
- `UserGroupIcon`
- `PhoneIcon`

---

## ✅ Checklist de Vérification

### Avant de sauvegarder dans l'admin:

**Section Hero:**
- [ ] Tous les champs bilingues (FR + AR) sont remplis
- [ ] Badge, description, boutons primaire et secondaire sont présents
- [ ] Structure nested {fr: "...", ar: "..."} est utilisée

**Section Stats:**
- [ ] Exactement 4 statistiques (stats0-3)
- [ ] Chaque stat a: value, labelFr, labelAr, icon
- [ ] Les valeurs sont pertinentes et à jour

**Section News:**
- [ ] TitleFr/Ar + excerptFr/Ar + contentFr/Ar présents
- [ ] DateFr/Ar formatées correctement
- [ ] Image URL valide
- [ ] PublishDate au format YYYY-MM-DD

**Section Testimonials:**
- [ ] NameFr/Ar + roleFr/Ar + quoteFr/Ar présents
- [ ] Rating entre 1 et 5
- [ ] Quote assez longue (min 50 caractères)

**Section Announcements:**
- [ ] TitleFr/Ar + dateFr/Ar présents
- [ ] Flag `urgent` défini correctement
- [ ] Ordre logique pour les annonces multiples

**Section Clubs:**
- [ ] NameFr/Ar + descriptionFr/Ar présents
- [ ] Icon emoji approprié
- [ ] Couleur gradient valide (classes Tailwind)

**Section Gallery:**
- [ ] TitleFr/Ar présents
- [ ] ImageUrl valide et accessible
- [ ] Images en haute résolution (min 800x600)

**Section Quick Links:**
- [ ] TitleFr/Ar + descriptionFr/Ar présents
- [ ] URL valide (interne ou externe)
- [ ] Icon Heroicons approprié

**Section Contact:**
- [ ] Phone, email, address, hours - tous bilingues
- [ ] Formats corrects (téléphone, email)
- [ ] Horaires clairs et précis

**Section About:**
- [ ] TitleFr/Ar + subtitleFr/Ar + descriptionFr/Ar présents
- [ ] ImageUrl valide
- [ ] YearsOfExperience est un nombre
- [ ] Array de 4 features avec titre/description bilingues

---

## 🔄 Workflow de Mise à Jour

### Pour l'Admin:

1. **Naviguer vers Dashboard → Homepage**
2. **Sélectionner la section à modifier**
3. **Remplir TOUS les champs obligatoires**
4. **Vérifier la prévisualisation (si disponible)**
5. **Cliquer sur "Enregistrer les modifications"**
6. **Attendre la confirmation de succès**
7. **Visiter la Landing Page pour vérifier**

### Vérification Post-Sauvegarde:

1. **Ouvrir la Landing Page dans un nouvel onglet**
2. **Vérifier que les modifications apparaissent**
3. **Tester en français ET en arabe**
4. **Vérifier sur mobile et desktop**
5. **Confirmer que les images se chargent**

---

## 🐛 Dépannage

### Problème: Les modifications n'apparaissent pas

**Solution:**
1. Vider le cache du navigateur (Ctrl+Shift+R)
2. Vérifier que `enabled: true` est défini
3. Vérifier la console du navigateur pour erreurs
4. Confirmer que tous les champs obligatoires sont remplis

### Problème: Les images ne s'affichent pas

**Solution:**
1. Vérifier que l'URL est accessible publiquement
2. Utiliser HTTPS (pas HTTP)
3. Vérifier que le CORS est configuré correctement
4. Tester l'URL dans un nouvel onglet

### Problème: Le texte arabe ne s'affiche pas correctement

**Solution:**
1. Vérifier que l'attribut `dir="rtl"` est présent
2. Utiliser une police qui supporte l'arabe
3. Vérifier l'encodage UTF-8
4. S'assurer que les champs `*Ar` sont remplis

---

## 📝 Notes Importantes

1. **Tous les champs bilingues sont OBLIGATOIRES** - Ne jamais laisser FR ou AR vide
2. **Les URLs doivent être complètes** - Inclure https:// pour les liens externes
3. **Les images doivent être optimisées** - Taille maximale recommandée: 500KB
4. **Les emojis sont acceptés** - Utilisez-les pour les icons quand approprié
5. **Le champ `enabled`** contrôle la visibilité globale de l'élément
6. **Le champ `order`** contrôle l'ordre d'affichage (0 = premier)

---

## 🎯 Résumé par Priorité

### Critique (Doit être 100% correct):
- ✅ Hero Section - Première impression
- ✅ Contact - Informations essentielles
- ✅ Stats - Crédibilité

### Important (Doit être à jour):
- ✅ News - Actualités récentes
- ✅ Announcements - Informations urgentes
- ✅ About - Présentation du lycée

### Recommandé (Améliore l'expérience):
- ✅ Testimonials - Preuve sociale
- ✅ Gallery - Visuel attrayant
- ✅ Clubs - Engagement étudiant
- ✅ Quick Links - Navigation facilitée

---

**Document créé le:** 23 Octobre 2024  
**Dernière mise à jour:** 23 Octobre 2024  
**Version:** 1.0  
**Statut:** ✅ Complet et Vérifié
