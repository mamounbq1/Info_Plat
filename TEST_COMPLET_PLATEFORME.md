# 🧪 TEST COMPLET DE LA PLATEFORME ÉDUCATIVE

## 📋 Plan de Test Global

Date: 27 Octobre 2025  
Testeur: GenSpark AI Developer  
Environnement: Development (Vite + Firebase)

---

## 🎯 PARTIE 1: GESTION DES UTILISATEURS

### 1.1 Inscription Admin
- [ ] Créer compte admin
- [ ] Vérifier rôle = 'admin' dans Firestore
- [ ] Vérifier status = 'active'
- [ ] Vérifier redirection vers AdminDashboard

### 1.2 Inscription Professeur
- [ ] Créer compte professeur
- [ ] Remplir champ 'subject' (ex: INFO, MATH, PHY)
- [ ] Remplir 'subjectNameFr' et 'subjectNameAr'
- [ ] Vérifier status = 'pending' (en attente d'approbation)
- [ ] Vérifier redirection vers page d'attente

### 1.3 Approbation Professeur (Admin)
- [ ] Admin se connecte
- [ ] Voir notification de nouveau professeur (badge rouge)
- [ ] Ouvrir panel de notifications (bouton cloche)
- [ ] Cliquer "Approuver"
- [ ] Vérifier status passe à 'active'
- [ ] Vérifier notification disparaît

### 1.4 Inscription Étudiant
- [ ] Créer compte étudiant
- [ ] Sélectionner niveau (ex: 1BAC)
- [ ] Sélectionner branche (ex: Sciences Expérimentales)
- [ ] Sélectionner classe (ex: 1BAC-SE-A)
- [ ] Vérifier auto-approbation (status = 'active')
- [ ] Vérifier redirection vers StudentDashboard

---

## 🎓 PARTIE 2: CRÉATION DE CONTENU (PROFESSEUR)

### 2.1 Connexion Professeur
- [ ] Se connecter avec compte professeur approuvé
- [ ] Vérifier redirection vers TeacherDashboard
- [ ] Vérifier affichage du nom et matière dans la sidebar

### 2.2 Création de Cours

#### 2.2.1 Interface de Création
- [ ] Cliquer sur "Nouveau Cours" (bouton +)
- [ ] Vérifier modal s'ouvre
- [ ] Vérifier champs présents:
  - [ ] Titre (Français) *
  - [ ] Titre (Arabe) *
  - [ ] Description (Français) *
  - [ ] Description (Arabe) *
  - [ ] Matière (auto-rempli, grisé) ✅
  - [ ] Classes concernées (multi-select) *
  - [ ] Durée (optionnel)
  - [ ] URL Vidéo (optionnel)
  - [ ] Vignette (optionnel)
  - [ ] Tags (optionnel)
  - [ ] Fichiers (upload)
  - [ ] Publier (checkbox)

#### 2.2.2 Validation des Champs
- [ ] Essayer soumettre sans titre → Erreur
- [ ] Essayer soumettre sans description → Erreur
- [ ] Essayer soumettre sans classes → Erreur
- [ ] Vérifier matière est automatiquement celle du prof
- [ ] Vérifier impossible de modifier la matière

#### 2.2.3 Sélection des Classes
- [ ] Ouvrir la liste des classes
- [ ] Vérifier toutes les classes sont affichées
- [ ] Sélectionner multiple classes (ex: 1BAC-SE-A, 1BAC-SE-B)
- [ ] Vérifier checkboxes fonctionnent
- [ ] Vérifier badges des classes sélectionnées

#### 2.2.4 Upload de Fichiers
- [ ] Cliquer "Ajouter des fichiers"
- [ ] Sélectionner PDF
- [ ] Vérifier progression de l'upload
- [ ] Vérifier fichier apparaît dans la liste
- [ ] Tester suppression de fichier
- [ ] Tester upload de multiple fichiers

#### 2.2.5 Ajout de Tags
- [ ] Taper un tag dans le champ
- [ ] Appuyer sur Entrée
- [ ] Vérifier tag apparaît
- [ ] Tester suppression de tag
- [ ] Ajouter plusieurs tags

#### 2.2.6 Sauvegarde du Cours
- [ ] Remplir tous les champs obligatoires
- [ ] Cocher "Publier" ou laisser en brouillon
- [ ] Cliquer "Créer le Cours"
- [ ] Vérifier toast de succès
- [ ] Vérifier modal se ferme
- [ ] Vérifier cours apparaît dans la liste

#### 2.2.7 Affichage du Cours dans la Liste
- [ ] Vérifier carte de cours affiche:
  - [ ] Titre (dans la langue actuelle)
  - [ ] Description tronquée
  - [ ] Badge de matière (ex: "Informatique")
  - [ ] Badge de statut (Publié/Brouillon)
  - [ ] Durée si présente
  - [ ] Nombre d'étudiants inscrits (0)
  - [ ] Boutons Éditer/Supprimer

### 2.3 Édition de Cours
- [ ] Cliquer sur bouton "Éditer" d'un cours
- [ ] Vérifier modal s'ouvre avec données pré-remplies
- [ ] Modifier le titre
- [ ] Ajouter une classe
- [ ] Supprimer un fichier
- [ ] Ajouter un nouveau fichier
- [ ] Cliquer "Mettre à jour"
- [ ] Vérifier modifications sont sauvegardées

### 2.4 Suppression de Cours
- [ ] Cliquer sur bouton "Supprimer"
- [ ] Vérifier popup de confirmation
- [ ] Confirmer suppression
- [ ] Vérifier cours disparaît de la liste
- [ ] Vérifier toast de succès

### 2.5 Publication/Dépublication
- [ ] Éditer un cours en brouillon
- [ ] Cocher "Publier"
- [ ] Sauvegarder
- [ ] Vérifier badge passe à "Publié"
- [ ] Répéter pour dépublier

### 2.6 Filtres et Recherche
- [ ] Utiliser barre de recherche
- [ ] Chercher par titre
- [ ] Vérifier filtrage en temps réel
- [ ] Utiliser filtre de statut (Tous/Publié/Brouillon)
- [ ] Vérifier résultats corrects

### 2.7 Sélection Multiple (Bulk Actions)
- [ ] Cocher plusieurs cours
- [ ] Vérifier barre d'actions apparaît
- [ ] Cliquer "Publier" en masse
- [ ] Vérifier tous les cours sélectionnés sont publiés
- [ ] Cliquer "Dépublier" en masse
- [ ] Cliquer "Supprimer" en masse
- [ ] Confirmer suppression

---

## 📝 PARTIE 3: QUIZ ET EXERCICES (PROFESSEUR)

### 3.1 Création de Quiz
- [ ] Aller dans l'onglet "Quiz"
- [ ] Cliquer "Nouveau Quiz"
- [ ] Remplir:
  - [ ] Titre (FR/AR)
  - [ ] Description (FR/AR)
  - [ ] Matière (auto-rempli)
  - [ ] Durée limite
  - [ ] Note totale
- [ ] Ajouter des questions:
  - [ ] Question à choix multiples
  - [ ] Question vrai/faux
  - [ ] Question ouverte
- [ ] Définir réponses correctes
- [ ] Définir points par question
- [ ] Publier le quiz
- [ ] Vérifier sauvegarde

### 3.2 Création d'Exercices
- [ ] Aller dans l'onglet "Exercices"
- [ ] Cliquer "Nouvel Exercice"
- [ ] Remplir informations
- [ ] Upload fichiers (énoncé PDF)
- [ ] Upload correction (optionnel)
- [ ] Définir date limite
- [ ] Publier
- [ ] Vérifier apparaît dans la liste

---

## 👨‍🎓 PARTIE 4: EXPÉRIENCE ÉTUDIANT

### 4.1 Connexion Étudiant
- [ ] Se connecter avec compte étudiant
- [ ] Vérifier redirection vers StudentDashboard
- [ ] Vérifier informations profil (nom, classe, niveau)

### 4.2 Navigation et Découverte

#### 4.2.1 Page d'Accueil Étudiant
- [ ] Vérifier sections:
  - [ ] Statistiques personnelles
  - [ ] Cours récents
  - [ ] Prochains quiz
  - [ ] Exercices à faire
- [ ] Vérifier responsive design

#### 4.2.2 Navigation Sidebar
- [ ] Tester tous les liens du menu
- [ ] Vérifier icônes et labels
- [ ] Tester mode collapse (réduire/étendre)
- [ ] Vérifier dark mode toggle

### 4.3 Consultation des Cours

#### 4.3.1 Liste des Cours
- [ ] Aller dans "Mes Cours" ou "Explorer"
- [ ] Vérifier SEULS les cours de sa classe sont visibles
- [ ] Vérifier filtrage automatique par:
  - [ ] Classe de l'étudiant
  - [ ] Statut publié uniquement
- [ ] Vérifier cartes de cours affichent:
  - [ ] Titre
  - [ ] Description
  - [ ] Matière
  - [ ] Professeur
  - [ ] Nombre d'étudiants
  - [ ] Durée

#### 4.3.2 Détails d'un Cours
- [ ] Cliquer sur un cours
- [ ] Vérifier page de détails affiche:
  - [ ] Titre complet
  - [ ] Description complète
  - [ ] Vidéo (si présente)
  - [ ] Liste des fichiers téléchargeables
  - [ ] Tags
  - [ ] Informations du professeur
  - [ ] Bouton "S'inscrire" ou "Déjà inscrit"

#### 4.3.3 Inscription à un Cours
- [ ] Cliquer "S'inscrire"
- [ ] Vérifier confirmation
- [ ] Vérifier cours ajouté à "Mes Cours"
- [ ] Vérifier compteur d'étudiants +1

### 4.4 Téléchargement de Fichiers

#### 4.4.1 Téléchargement Simple
- [ ] Ouvrir un cours avec fichiers
- [ ] Cliquer sur lien de téléchargement d'un PDF
- [ ] Vérifier fichier se télécharge
- [ ] Ouvrir le fichier téléchargé
- [ ] Vérifier contenu correct

#### 4.4.2 Téléchargement Multiple
- [ ] Cours avec plusieurs fichiers
- [ ] Télécharger fichier 1
- [ ] Télécharger fichier 2
- [ ] Vérifier tous téléchargements réussis

#### 4.4.3 Types de Fichiers
- [ ] Télécharger PDF
- [ ] Télécharger DOCX
- [ ] Télécharger PPTX
- [ ] Télécharger images
- [ ] Vérifier tous types supportés

### 4.5 Passage de Quiz
- [ ] Aller dans section "Quiz"
- [ ] Sélectionner un quiz disponible
- [ ] Démarrer le quiz
- [ ] Répondre aux questions
- [ ] Vérifier timer (si présent)
- [ ] Soumettre les réponses
- [ ] Vérifier note calculée
- [ ] Vérifier correction affichée
- [ ] Vérifier sauvegarde dans l'historique

### 4.6 Soumission d'Exercices
- [ ] Aller dans "Exercices"
- [ ] Télécharger énoncé
- [ ] Upload solution (fichier)
- [ ] Ajouter commentaire
- [ ] Soumettre
- [ ] Vérifier confirmation
- [ ] Vérifier statut "En attente de correction"

---

## 👨‍💼 PARTIE 5: FONCTIONNALITÉS ADMIN

### 5.1 Tableau de Bord Admin
- [ ] Se connecter en admin
- [ ] Vérifier sections:
  - [ ] Contenu du Site
  - [ ] Structure de l'École
  - [ ] Pages
  - [ ] Analytics (sidebar)

### 5.2 Gestion des Utilisateurs
- [ ] Liste de tous les utilisateurs
- [ ] Filtrer par rôle (admin/teacher/student)
- [ ] Modifier rôle d'un utilisateur
- [ ] Désactiver un compte
- [ ] Réactiver un compte
- [ ] Voir statistiques utilisateurs

### 5.3 Gestion de la Structure Académique

#### 5.3.1 Matières (Subjects)
- [ ] Créer nouvelle matière
- [ ] Définir code (ex: INFO)
- [ ] Définir nom FR et AR
- [ ] Sauvegarder
- [ ] Éditer matière existante
- [ ] Supprimer matière (si non utilisée)

#### 5.3.2 Niveaux (Levels)
- [ ] Créer nouveau niveau (ex: 1BAC)
- [ ] Définir nom FR et AR
- [ ] Définir ordre
- [ ] Sauvegarder
- [ ] Éditer/Supprimer

#### 5.3.3 Branches (Types)
- [ ] Créer nouvelle branche
- [ ] Associer à un niveau
- [ ] Définir nom FR et AR
- [ ] Sauvegarder
- [ ] Gérer branches existantes

#### 5.3.4 Classes
- [ ] Créer nouvelle classe
- [ ] Définir code unique (ex: 1BAC-SE-A)
- [ ] Associer niveau et branche
- [ ] Définir capacité
- [ ] Sauvegarder
- [ ] Éditer/Supprimer

### 5.4 Gestion du Contenu du Site

#### 5.4.1 Page d'Accueil
- [ ] Modifier slogan principal
- [ ] Modifier description
- [ ] Upload nouveau logo
- [ ] Changer couleurs du thème
- [ ] Sauvegarder modifications
- [ ] Prévisualiser

#### 5.4.2 Features/Services
- [ ] Ajouter nouvelle feature
- [ ] Upload icône
- [ ] Définir titre FR/AR
- [ ] Définir description FR/AR
- [ ] Réordonner features
- [ ] Supprimer feature

#### 5.4.3 Actualités
- [ ] Créer nouvelle actualité
- [ ] Upload image
- [ ] Rédiger contenu FR/AR
- [ ] Publier/Dépublier
- [ ] Modifier date
- [ ] Supprimer

#### 5.4.4 Témoignages
- [ ] Ajouter témoignage
- [ ] Upload photo étudiant
- [ ] Texte FR/AR
- [ ] Définir note (étoiles)
- [ ] Publier

#### 5.4.5 Galerie
- [ ] Upload images
- [ ] Ajouter légendes FR/AR
- [ ] Organiser par catégorie
- [ ] Supprimer images

#### 5.4.6 Événements
- [ ] Créer événement
- [ ] Définir date et heure
- [ ] Lieu
- [ ] Description FR/AR
- [ ] Publier

### 5.5 Analytics & Statistiques

#### 5.5.1 Accès Analytics
- [ ] Cliquer "Analytics" dans sidebar
- [ ] Vérifier dashboard s'affiche
- [ ] Vérifier pas d'erreurs de permissions

#### 5.5.2 Statistiques Globales
- [ ] Card "Visiteurs Totaux"
  - [ ] Vérifier nombre affiché
  - [ ] Vérifier mise à jour en temps réel
- [ ] Card "Pages Vues"
  - [ ] Vérifier compteur
  - [ ] Vérifier augmente à chaque page
- [ ] Card "Utilisateurs Actifs"
  - [ ] Vérifier nombre correct
- [ ] Card "Taux de Rebond"
  - [ ] Vérifier calcul

#### 5.5.3 Auto-Refresh (30s)
- [ ] Attendre 30 secondes
- [ ] Vérifier icône de refresh clignote
- [ ] Vérifier données se mettent à jour
- [ ] Vérifier "Dernière mise à jour" change

#### 5.5.4 Pages les Plus Visitées
- [ ] Vérifier liste affichée
- [ ] Vérifier ordre décroissant
- [ ] Vérifier compteurs corrects
- [ ] Naviguer vers une page
- [ ] Revenir et vérifier compteur +1

#### 5.5.5 Statistiques Navigateurs
- [ ] Vérifier graphique affiché
- [ ] Vérifier pourcentages
- [ ] Vérifier détection correcte (Chrome, Firefox, etc.)

#### 5.5.6 Activités Récentes (Pagination)
- [ ] Vérifier tableau affiché
- [ ] Vérifier colonnes:
  - [ ] Visiteur (ID ou nom)
  - [ ] Page
  - [ ] Date/Heure
  - [ ] Navigateur
  - [ ] Appareil
- [ ] Tester pagination:
  - [ ] Page 1 → 10 éléments
  - [ ] Cliquer "Suivant"
  - [ ] Vérifier Page 2 s'affiche
  - [ ] Cliquer "Précédent"
  - [ ] Aller à page spécifique

#### 5.5.7 Graphique Quotidien
- [ ] Vérifier graphique en ligne
- [ ] Vérifier données des 7 derniers jours
- [ ] Vérifier légende
- [ ] Hover sur point → voir détails

#### 5.5.8 Tracking Anonyme
- [ ] Ouvrir mode navigation privée
- [ ] Visiter site sans connexion
- [ ] Naviguer 3-4 pages
- [ ] Retourner en admin
- [ ] Vérifier analytics
- [ ] Vérifier visiteur anonyme enregistré
- [ ] Vérifier toutes ses pages trackées

### 5.6 Notifications

#### 5.6.1 Badge de Notifications
- [ ] Avoir notifications non lues
- [ ] Vérifier badge rouge avec nombre
- [ ] Vérifier animation pulse

#### 5.6.2 Panel de Notifications
- [ ] Cliquer sur bouton cloche
- [ ] Vérifier panel s'ouvre
- [ ] Vérifier position correcte (gauche en FR, droite en AR)
- [ ] Vérifier largeur 480px
- [ ] Vérifier z-index (au-dessus de tout)

#### 5.6.3 Types de Notifications
- [ ] Notification "Nouveau professeur"
  - [ ] Vérifier nom affiché
  - [ ] Vérifier email affiché
  - [ ] Vérifier temps relatif (ex: "5 min")
  - [ ] Boutons "Approuver" et "Refuser"
- [ ] Notification "Nouveau message"
  - [ ] Vérifier nom expéditeur
  - [ ] Vérifier email
  - [ ] Vérifier aperçu du message
  - [ ] Bouton "Marquer lu"

#### 5.6.4 Actions sur Notifications
- [ ] Approuver un professeur
  - [ ] Vérifier notification disparaît
  - [ ] Vérifier badge diminue
  - [ ] Vérifier prof devient actif
- [ ] Refuser un professeur
  - [ ] Vérifier notification disparaît
  - [ ] Vérifier compte désactivé
- [ ] Marquer message lu
  - [ ] Vérifier notification disparaît
  - [ ] Vérifier message marqué dans DB

#### 5.6.5 Tout Marquer Lu
- [ ] Avoir plusieurs notifications
- [ ] Cliquer "Tout marquer lu"
- [ ] Vérifier toutes disparaissent
- [ ] Vérifier badge passe à 0

#### 5.6.6 Clic en Dehors
- [ ] Ouvrir panel
- [ ] Cliquer ailleurs sur la page
- [ ] Vérifier panel se ferme

### 5.7 Messages Contact

#### 5.7.1 Réception de Messages
- [ ] Visiteur remplit formulaire contact
- [ ] Admin voit notification (badge)
- [ ] Admin ouvre notifications
- [ ] Vérifier message affiché
- [ ] Vérifier statut "pending"

#### 5.7.2 Gestion des Messages
- [ ] Aller dans section Messages
- [ ] Voir liste de tous les messages
- [ ] Filtrer par statut (pending/replied)
- [ ] Ouvrir un message
- [ ] Lire détails complets
- [ ] Marquer comme traité
- [ ] Répondre (si fonctionnalité existe)

---

## 🌐 PARTIE 6: EXPÉRIENCE UTILISATEUR & INTERFACE

### 6.1 Bilinguisme (FR/AR)

#### 6.1.1 Switch de Langue
- [ ] Cliquer sur sélecteur de langue
- [ ] Changer FR → AR
- [ ] Vérifier:
  - [ ] Tous les textes changent
  - [ ] Direction RTL appliquée
  - [ ] Layout s'adapte
  - [ ] Sidebar se déplace à droite
- [ ] Changer AR → FR
- [ ] Vérifier retour LTR

#### 6.1.2 Persistance
- [ ] Changer langue
- [ ] Recharger page
- [ ] Vérifier langue conservée
- [ ] Se déconnecter/reconnecter
- [ ] Vérifier préférence sauvegardée

#### 6.1.3 Contenu Bilingue
- [ ] Créer cours avec titre FR et AR
- [ ] Switch langue
- [ ] Vérifier bon titre affiché
- [ ] Répéter pour description
- [ ] Répéter pour tous les champs bilingues

### 6.2 Dark Mode

#### 6.2.1 Toggle Dark Mode
- [ ] Cliquer sur icône soleil/lune
- [ ] Vérifier:
  - [ ] Fond devient sombre
  - [ ] Texte devient clair
  - [ ] Cartes changent de couleur
  - [ ] Contrastes corrects
- [ ] Re-cliquer pour light mode
- [ ] Vérifier retour normal

#### 6.2.2 Persistance Dark Mode
- [ ] Activer dark mode
- [ ] Recharger page
- [ ] Vérifier mode conservé
- [ ] Tester sur différentes pages

#### 6.2.3 Dark Mode + Bilinguisme
- [ ] Activer dark mode
- [ ] Changer langue
- [ ] Vérifier compatibilité
- [ ] Vérifier pas de bugs visuels

### 6.3 Responsive Design

#### 6.3.1 Desktop (1920x1080)
- [ ] Tester toutes les pages
- [ ] Vérifier layout utilise bien l'espace
- [ ] Vérifier sidebar fixe
- [ ] Vérifier grilles de cartes

#### 6.3.2 Laptop (1366x768)
- [ ] Tester toutes les pages
- [ ] Vérifier adaptation
- [ ] Vérifier scrolling

#### 6.3.3 Tablette (768x1024)
- [ ] Sidebar devient overlay
- [ ] Burger menu apparaît
- [ ] Cartes s'empilent
- [ ] Tableaux scrollent horizontalement

#### 6.3.4 Mobile (375x667)
- [ ] Menu hamburger
- [ ] Cartes en colonne unique
- [ ] Boutons adaptés au touch
- [ ] Formulaires utilisables
- [ ] Pas de débordement horizontal

### 6.4 Navigation

#### 6.4.1 Sidebar Navigation
- [ ] Tous les liens fonctionnent
- [ ] Active item highlighted
- [ ] Icônes alignées
- [ ] Tooltips (si collapsed)
- [ ] Smooth transitions

#### 6.4.2 Breadcrumbs
- [ ] Vérifier présence sur pages profondes
- [ ] Cliquer sur breadcrumb
- [ ] Vérifier navigation fonctionne

#### 6.4.3 Back/Forward Navigateur
- [ ] Utiliser bouton retour navigateur
- [ ] Vérifier historique fonctionne
- [ ] Vérifier état préservé

### 6.5 Performance

#### 6.5.1 Temps de Chargement
- [ ] Mesurer page d'accueil
- [ ] Mesurer dashboard
- [ ] Mesurer liste de cours
- [ ] Vérifier < 3 secondes

#### 6.5.2 Interactions
- [ ] Cliquer sur bouton
- [ ] Vérifier réponse immédiate
- [ ] Loading states visibles
- [ ] Pas de freeze

#### 6.5.3 Images
- [ ] Vérifier lazy loading
- [ ] Vérifier placeholders
- [ ] Vérifier optimisation

---

## 🔒 PARTIE 7: SÉCURITÉ & PERMISSIONS

### 7.1 Authentification

#### 7.1.1 Connexion
- [ ] Connexion avec email/password
- [ ] Vérifier token généré
- [ ] Vérifier session persistante

#### 7.1.2 Déconnexion
- [ ] Cliquer déconnexion
- [ ] Vérifier redirection vers login
- [ ] Vérifier session effacée
- [ ] Essayer accéder page protégée
- [ ] Vérifier redirection vers login

#### 7.1.3 Routes Protégées
- [ ] Sans connexion, accéder /admin
  - [ ] Vérifier redirection
- [ ] Sans connexion, accéder /teacher
  - [ ] Vérifier redirection
- [ ] Avec compte student, accéder /admin
  - [ ] Vérifier accès refusé
- [ ] Avec compte teacher, accéder /admin
  - [ ] Vérifier accès refusé

### 7.2 Firestore Permissions

#### 7.2.1 Analytics (Anonyme)
- [ ] Mode navigation privée
- [ ] Visiter pages
- [ ] Vérifier tracking fonctionne
- [ ] Vérifier écriture dans analytics
- [ ] Vérifier écriture dans visitorStats
- [ ] Vérifier écriture dans dailyStats

#### 7.2.2 Messages (Public Create)
- [ ] Sans connexion
- [ ] Remplir formulaire contact
- [ ] Soumettre
- [ ] Vérifier message sauvegardé
- [ ] Vérifier notification admin

#### 7.2.3 Courses (Teacher Create/Update)
- [ ] Compte teacher
- [ ] Créer cours
- [ ] Vérifier sauvegarde réussie
- [ ] Vérifier subject match
- [ ] Vérifier targetClasses requis
- [ ] Essayer créer cours d'autre matière
  - [ ] Vérifier blocage

#### 7.2.4 Courses (Student Read Only)
- [ ] Compte student
- [ ] Voir liste cours
- [ ] Vérifier filtrage par classe
- [ ] Essayer modifier cours (devtools)
  - [ ] Vérifier échec permission

#### 7.2.5 Users (Self Update)
- [ ] Modifier son propre profil
  - [ ] Vérifier réussite
- [ ] Essayer modifier profil autre user
  - [ ] Vérifier échec

#### 7.2.6 Admin Full Access
- [ ] Compte admin
- [ ] Lire toutes collections
- [ ] Modifier toutes collections
- [ ] Supprimer documents
- [ ] Vérifier tout fonctionne

---

## 📊 PARTIE 8: FONCTIONNALITÉS AVANCÉES

### 8.1 Recherche

#### 8.1.1 Recherche Globale
- [ ] Barre de recherche principale
- [ ] Taper terme de recherche
- [ ] Vérifier résultats instantanés
- [ ] Vérifier types de résultats:
  - [ ] Cours
  - [ ] Professeurs
  - [ ] Pages

#### 8.1.2 Recherche dans Cours
- [ ] Filtrer par matière
- [ ] Filtrer par niveau
- [ ] Filtrer par professeur
- [ ] Combiner filtres
- [ ] Vérifier résultats corrects

### 8.2 Upload de Fichiers

#### 8.2.1 Firebase Storage
- [ ] Upload fichier < 10MB
  - [ ] Vérifier réussite
- [ ] Upload fichier > 50MB
  - [ ] Vérifier erreur ou limite
- [ ] Upload types supportés
  - [ ] PDF ✅
  - [ ] DOCX ✅
  - [ ] PPTX ✅
  - [ ] Images ✅
- [ ] Upload types non supportés
  - [ ] EXE ❌
  - [ ] Vérifier rejet

#### 8.2.2 Barre de Progression
- [ ] Upload gros fichier
- [ ] Vérifier barre de progression
- [ ] Vérifier pourcentage
- [ ] Annuler upload
- [ ] Vérifier annulation fonctionne

### 8.3 Notifications Temps Réel

#### 8.3.1 onSnapshot Listeners
- [ ] Admin connecté
- [ ] Autre onglet: nouveau prof s'inscrit
- [ ] Vérifier notification apparaît automatiquement
- [ ] Vérifier pas besoin de refresh

#### 8.3.2 Badge Update
- [ ] Badge à 0
- [ ] Nouveau message arrive
- [ ] Vérifier badge passe à 1
- [ ] Vérifier animation pulse

---

## 🐛 PARTIE 9: TESTS DE BUGS CONNUS

### 9.1 Bugs Résolus à Vérifier

#### 9.1.1 Vercel 404 (RÉSOLU)
- [ ] Deploy sur Vercel
- [ ] Naviguer vers /about
- [ ] Refresh la page (F5)
- [ ] Vérifier pas de 404
- [ ] Répéter sur /courses
- [ ] Répéter sur /contact

#### 9.1.2 Notification Panel Cut-off (RÉSOLU)
- [ ] Ouvrir notifications
- [ ] Vérifier panel entièrement visible
- [ ] Vérifier pas de débordement
- [ ] Vérifier position FR (gauche)
- [ ] Vérifier position AR (droite)
- [ ] Vérifier z-index (au-dessus)

#### 9.1.3 CATEGORIES Undefined (RÉSOLU)
- [ ] Ouvrir TeacherDashboard
- [ ] Créer nouveau cours
- [ ] Vérifier pas d'erreur console
- [ ] Vérifier formulaire s'affiche

#### 9.1.4 Subject Field Mismatch (RÉSOLU)
- [ ] Professeur avec subject dans profil
- [ ] Créer cours
- [ ] Vérifier matière auto-remplie
- [ ] Vérifier utilise 'subject' (pas subjectCode)

### 9.2 Tests de Régression

#### 9.2.1 Après Changement de Langue
- [ ] Changer langue
- [ ] Tester navigation
- [ ] Tester formulaires
- [ ] Vérifier pas de crash

#### 9.2.2 Après Toggle Dark Mode
- [ ] Activer dark mode
- [ ] Tester toutes fonctionnalités
- [ ] Vérifier lisibilité
- [ ] Vérifier pas de texte invisible

#### 9.2.3 Après Déconnexion/Reconnexion
- [ ] Se déconnecter
- [ ] Se reconnecter
- [ ] Vérifier état restauré
- [ ] Vérifier préférences conservées

---

## ✅ CRITÈRES DE SUCCÈS GLOBAL

### Fonctionnalité
- [ ] 100% des features fonctionnent comme prévu
- [ ] Aucun bug bloquant
- [ ] Aucune erreur console critique

### Performance
- [ ] Chargement pages < 3s
- [ ] Interactions < 100ms
- [ ] Pas de freeze ou lag

### Sécurité
- [ ] Authentification fonctionne
- [ ] Permissions Firestore correctes
- [ ] Données utilisateurs protégées
- [ ] Pas de fuite d'informations

### UX/UI
- [ ] Interface intuitive
- [ ] Design cohérent
- [ ] Responsive sur tous devices
- [ ] Bilinguisme complet
- [ ] Dark mode complet

### Accessibilité
- [ ] Navigation au clavier
- [ ] Contraste suffisant
- [ ] Tailles de texte lisibles
- [ ] Labels sur boutons

---

## 📝 RAPPORT DE TEST

### Résumé Exécutif
**Date**: 27 Octobre 2025  
**Testeur**: _______  
**Environnement**: Development/Production  
**Statut Global**: ✅ PASS / ⚠️ PASS WITH ISSUES / ❌ FAIL

### Statistiques
- Total Tests: _____ / _____
- Réussis: _____ (___%)
- Échecs: _____ (___%)
- Bloqués: _____ (___%)

### Bugs Trouvés
1. **[CRITICAL/HIGH/MEDIUM/LOW]** Description du bug
   - Étapes pour reproduire
   - Résultat attendu
   - Résultat actuel
   - Screenshot/Video

### Recommandations
1. 
2. 
3. 

---

**FIN DU PLAN DE TEST** 🎉
