# 🧪 Tests de Vérification - Système de Statistiques

**Date**: 31 Octobre 2025  
**But**: Vérifier que le tracking et les statistiques fonctionnent correctement

---

## ✅ Checklist de Vérification

### Étape 1: Vérifier les Règles Firestore ⚠️ CRITIQUE

- [ ] **1.1** Ouvrir Firebase Console: https://console.firebase.google.com/
- [ ] **1.2** Aller dans Firestore Database → Rules
- [ ] **1.3** Vérifier que les règles contiennent:
  ```javascript
  // Doit être hasValidTargetClasses() et NON hasValidTargetLevels()
  function hasValidTargetClasses() {
    return request.resource.data.targetClasses is list && 
           request.resource.data.targetClasses.size() > 0;
  }
  ```
- [ ] **1.4** Vérifier que les 3 collections stats sont présentes:
  ```javascript
  match /courseViews/{viewId} { ... }
  match /quizSubmissions/{submissionId} { ... }
  match /exerciseSubmissions/{submissionId} { ... }
  ```

**Si les règles ne sont pas à jour**: Copier-coller `FIRESTORE_RULES_FINAL_COMPLETE.txt` et publier!

---

### Étape 2: Créer les Indexes Firestore

- [ ] **2.1** Ouvrir l'application en tant qu'enseignant
- [ ] **2.2** Cliquer sur un bouton de statistiques (📊)
- [ ] **2.3** Ouvrir la console du navigateur (F12)
- [ ] **2.4** Si erreur "requires an index", cliquer sur le lien fourni
- [ ] **2.5** Cliquer "Create Index" dans Firebase Console
- [ ] **2.6** Attendre que l'index passe de "Building" à "Enabled" (1-5 min)
- [ ] **2.7** Répéter pour les 3 collections si nécessaire

**Indexes requis**:
1. `courseViews`: courseId (Ascending) + viewedAt (Descending)
2. `quizSubmissions`: quizId (Ascending) + submittedAt (Descending)
3. `exerciseSubmissions`: exerciseId (Ascending) + submittedAt (Descending)

---

## 🧪 Test 1: Tracking des Vues de Cours

### But
Vérifier que les consultations de cours sont enregistrées correctement.

### Compte Requis
- 1 compte **étudiant**
- 1 compte **enseignant** (avec au moins 1 cours publié)

### Procédure

#### A. Côté Étudiant

1. **Se connecter** en tant qu'étudiant
2. **Naviguer** vers le tableau de bord
3. **Cliquer** sur un cours pour l'ouvrir
4. **Attendre** au moins 30 secondes sur la page du cours
5. **Consulter** les fichiers/contenu du cours
6. **Quitter** le cours (retour au dashboard ou fermer l'onglet)

#### B. Vérification Console (Optionnel)

1. Ouvrir la **console navigateur** (F12)
2. Chercher le message: `✅ Course view tracked: [courseId] [duration] seconds`
3. Noter la durée affichée

#### C. Côté Enseignant

1. **Se déconnecter** de l'étudiant
2. **Se connecter** en tant qu'enseignant
3. **Naviguer** vers Teacher Dashboard
4. **Cliquer** sur le bouton **bleu 📊** du cours consulté
5. **Vérifier** dans le modal CourseStats:
   - [ ] **Total vues**: Devrait être ≥ 1
   - [ ] **Étudiants uniques**: Devrait montrer 1 étudiant
   - [ ] **Temps moyen**: Devrait être ~30 secondes
6. **Vérifier** l'historique:
   - [ ] Nom de l'étudiant affiché
   - [ ] Date et heure correctes
   - [ ] Durée affichée (~30s ou plus)

### Résultat Attendu

✅ **SUCCÈS** si:
- La vue apparaît dans les statistiques
- Le nom de l'étudiant est correct
- La durée est approximativement correcte (±5 secondes)

❌ **ÉCHEC** si:
- Aucune vue n'apparaît
- Erreur dans la console
- Durée = 0 ou incorrect

---

## 🧪 Test 2: Tracking des Soumissions de Quiz

### But
Vérifier que les réponses aux quiz sont enregistrées avec détails.

### Compte Requis
- 1 compte **étudiant**
- 1 compte **enseignant** (avec au moins 1 quiz publié avec questions)

### Procédure

#### A. Côté Étudiant

1. **Se connecter** en tant qu'étudiant
2. **Naviguer** vers le quiz
3. **Répondre** à TOUTES les questions:
   - Faire au moins 1 réponse correcte
   - Faire au moins 1 réponse incorrecte (pour test)
4. **Soumettre** le quiz
5. **Noter** le score obtenu

#### B. Vérification Console (Optionnel)

1. Ouvrir la **console navigateur** (F12)
2. Chercher: `✅ Quiz submission tracked for teacher stats`
3. Si erreur, noter le message d'erreur

#### C. Côté Enseignant

1. **Se connecter** en tant qu'enseignant
2. **Naviguer** vers Teacher Dashboard
3. **Cliquer** sur le bouton **vert 📊** du quiz
4. **Vérifier** le modal QuizResults:

   **Statistiques Générales**:
   - [ ] **Tentatives totales**: ≥ 1
   - [ ] **Score moyen**: Devrait correspondre au score de l'étudiant
   - [ ] **Taux de réussite**: Calculé correctement
   - [ ] **Nombre de questions**: Correct

   **Statistiques par Question**:
   - [ ] Chaque question listée
   - [ ] Taux de succès affiché (0-100%)
   - [ ] Nombre de réponses correctes/incorrectes
   - [ ] Badge de difficulté (Facile/Moyen/Difficile)

   **Liste des Résultats**:
   - [ ] Nom de l'étudiant affiché
   - [ ] Score affiché (ex: 15/20)
   - [ ] Pourcentage affiché (ex: 75%)
   - [ ] Date de soumission correcte

5. **Cliquer** sur "Voir Détails" pour le résultat de l'étudiant
6. **Vérifier** dans le modal détaillé:
   - [ ] Chaque question affichée
   - [ ] Type de question (badge: QCU, QCM, V/F, Texte à trou)
   - [ ] Réponse de l'étudiant affichée
   - [ ] **Réponse correcte**: Badge vert + icône ✅
   - [ ] **Réponse incorrecte**: Badge rouge + icône ❌
   - [ ] Bonne réponse montrée pour les incorrectes

### Test Spécifique par Type de Question

#### QCU (Choix Unique)
- [ ] Réponse sélectionnée affichée
- [ ] Couleur correcte (vert si bon, rouge si faux)

#### QCM (Choix Multiples)
- [ ] Toutes les réponses sélectionnées affichées en liste
- [ ] Couleur correcte

#### Vrai/Faux
- [ ] "Vrai" ou "Faux" affiché
- [ ] Couleur correcte

#### Texte à Trou
- [ ] Phrase avec blanks (___1___, ___2___, etc.)
- [ ] Mots remplis affichés
- [ ] Couleur correcte

### Résultat Attendu

✅ **SUCCÈS** si:
- Toutes les statistiques s'affichent correctement
- Les réponses de l'étudiant sont visibles
- Les couleurs (vert/rouge) sont correctes
- Tous les types de questions fonctionnent

❌ **ÉCHEC** si:
- Aucune soumission n'apparaît
- Statistiques incorrectes
- Réponses non affichées
- Erreur dans la console

---

## 🧪 Test 3: Soumission et Notation d'Exercices

### But
Vérifier le flux complet: soumission étudiant → notation enseignant → feedback étudiant.

### Compte Requis
- 1 compte **étudiant**
- 1 compte **enseignant** (avec au moins 1 exercice publié)

### Procédure

#### A. Création d'Exercice (Enseignant)

1. **Se connecter** en tant qu'enseignant
2. **Créer** un exercice de type "texte":
   - Titre: "Test Exercise"
   - Contenu: "Expliquez le concept X"
   - Publier l'exercice

#### B. Soumission (Étudiant)

1. **Se connecter** en tant qu'étudiant
2. **Naviguer** vers le dashboard
3. **Trouver** l'exercice "Test Exercise"
4. **Cliquer** sur le bouton **violet "Passer l'exercice"** / **"بدء التمرين"**
5. **Vérifier** que la page ExerciseTaking s'ouvre:
   - [ ] URL = `/exercise/[exerciseId]`
   - [ ] Titre de l'exercice affiché
   - [ ] Contenu de l'exercice visible
   - [ ] Zone de texte pour réponse présente
   - [ ] Compteur de caractères visible
6. **Écrire** une réponse de test (minimum 10 caractères):
   ```
   Ceci est ma réponse à l'exercice. Le concept X est important car...
   ```
7. **Vérifier** le compteur:
   - [ ] Nombre de caractères affiché
   - [ ] Avertissement si < 10 caractères
8. **Cliquer** "Soumettre la réponse" / "إرسال الإجابة"
9. **Vérifier**:
   - [ ] Toast de succès apparaît
   - [ ] Zone de texte se vide
   - [ ] Section "Soumissions précédentes" apparaît en bas
   - [ ] Soumission affichée avec badge **jaune "En attente d'évaluation"**

#### C. Notation (Enseignant)

1. **Se déconnecter** de l'étudiant
2. **Se connecter** en tant qu'enseignant
3. **Naviguer** vers Teacher Dashboard → Exercices
4. **Cliquer** sur le bouton **vert 📊** de l'exercice
5. **Vérifier** le modal ExerciseSubmissions:

   **Stats Dashboard**:
   - [ ] **Total**: 1 soumission
   - [ ] **Évaluées**: 0
   - [ ] **En attente**: 1 (badge jaune)
   - [ ] **Note moyenne**: N/A ou 0

   **Liste des Soumissions**:
   - [ ] Nom de l'étudiant affiché
   - [ ] Date de soumission correcte
   - [ ] Badge **jaune "En attente"**
   - [ ] Bouton "Voir Détails"

6. **Cliquer** "Voir Détails" sur la soumission
7. **Vérifier** le modal détaillé:
   - [ ] Titre de l'exercice
   - [ ] Section "Réponse de l'étudiant"
   - [ ] Réponse complète de l'étudiant visible
   - [ ] Section "Évaluation"
   - [ ] Input de note (0-20 par pas de 0.5)
   - [ ] Zone de commentaires
   - [ ] Bouton "Enregistrer la Note"

8. **Noter** l'exercice:
   - Entrer une note: **15.5**
   - Écrire un feedback:
     ```
     Bonne réponse! Vous avez bien compris le concept.
     Continuez ainsi.
     ```
   - Cliquer "Enregistrer la Note"

9. **Vérifier**:
   - [ ] Toast de succès: "Réponse évaluée"
   - [ ] Modal se ferme automatiquement
   - [ ] Retour à la liste des soumissions
   - [ ] Badge passe de **jaune** à **vert "Évaluée 15.5/20"**
   - [ ] Stats mises à jour:
     * Évaluées: 1
     * En attente: 0
     * Note moyenne: 15.5/20

#### D. Vérification Feedback (Étudiant)

1. **Se déconnecter** de l'enseignant
2. **Se connecter** en tant qu'étudiant
3. **Naviguer** vers `/exercise/[exerciseId]` (même URL qu'avant)
4. **Vérifier** la section "Soumissions précédentes":
   - [ ] Soumission affichée
   - [ ] Badge **vert avec note**: "15.5/20"
   - [ ] Icône ✅ CheckCircle verte
   - [ ] Date de soumission
   - [ ] Réponse (tronquée à 3 lignes)
   - [ ] Section "Commentaire du professeur" visible
   - [ ] Feedback de l'enseignant affiché
   - [ ] Date d'évaluation: "Évalué le: [date]"

#### E. Re-Notation (Optionnel)

1. **Retourner** en tant qu'enseignant
2. **Ouvrir** à nouveau les détails de la soumission
3. **Vérifier**:
   - [ ] Note actuelle affichée: 15.5
   - [ ] Feedback actuel affiché
   - [ ] Date d'évaluation affichée
   - [ ] Possibilité de modifier la note
4. **Modifier** la note à **17**
5. **Modifier** le feedback
6. **Enregistrer**
7. **Vérifier** que l'étudiant voit la nouvelle note

### Résultat Attendu

✅ **SUCCÈS** si:
- Bouton "Passer l'exercice" fonctionne
- Page ExerciseTaking s'affiche correctement
- Soumission enregistrée avec succès
- Enseignant peut noter avec interface complète
- Note et feedback sauvegardés dans Firestore
- Étudiant voit sa note et feedback
- Re-notation possible

❌ **ÉCHEC** si:
- Bouton ne navigue pas
- Page ExerciseTaking ne charge pas
- Erreur lors de la soumission
- Enseignant ne voit pas la soumission
- Note ne se sauvegarde pas
- Étudiant ne voit pas le feedback

---

## 🧪 Test 4: Vérification Console & Firestore

### But
Vérifier directement dans Firestore que les données sont correctement enregistrées.

### Procédure

1. **Ouvrir** Firebase Console: https://console.firebase.google.com/
2. **Naviguer** vers Firestore Database → Data
3. **Vérifier** la collection **courseViews**:
   - [ ] Collection existe
   - [ ] Documents présents après test 1
   - [ ] Structure correcte:
     * courseId (string)
     * userId (string)
     * studentName (string)
     * viewedAt (timestamp)
     * duration (number)

4. **Vérifier** la collection **quizSubmissions**:
   - [ ] Collection existe
   - [ ] Documents présents après test 2
   - [ ] Structure correcte:
     * quizId (string)
     * userId (string)
     * studentName (string)
     * answers (array)
     * score (number)
     * submittedAt (timestamp)

5. **Vérifier** la collection **exerciseSubmissions**:
   - [ ] Collection existe
   - [ ] Documents présents après test 3
   - [ ] Structure correcte:
     * exerciseId (string)
     * userId (string)
     * studentName (string)
     * answer (string)
     * submittedAt (timestamp)
     * grade (number) - après notation
     * feedback (string) - après notation
     * gradedAt (timestamp) - après notation
     * gradedBy (string) - après notation

### Résultat Attendu

✅ **SUCCÈS** si:
- Toutes les collections existent
- Les documents ont la structure correcte
- Les données correspondent aux tests effectués

❌ **ÉCHEC** si:
- Collections manquantes
- Structure de données incorrecte
- Données manquantes

---

## 🧪 Test 5: Test de Performance

### But
Vérifier que le système fonctionne avec plusieurs utilisateurs.

### Procédure

1. **Créer** 3 comptes étudiants
2. **Faire consulter** le même cours par les 3 étudiants
3. **Vérifier** dans CourseStats:
   - [ ] Total vues: 3
   - [ ] Étudiants uniques: 3
   - [ ] 3 entrées dans l'historique

4. **Faire passer** le même quiz par les 3 étudiants (scores différents)
5. **Vérifier** dans QuizResults:
   - [ ] Total tentatives: 3
   - [ ] Score moyen calculé correctement
   - [ ] Taux de réussite correct
   - [ ] 3 résultats dans la liste

6. **Faire soumettre** le même exercice par les 3 étudiants
7. **Vérifier** dans ExerciseSubmissions:
   - [ ] Total: 3
   - [ ] Toutes en attente: 3
8. **Noter** les 3 exercices avec notes différentes (12, 15, 18)
9. **Vérifier**:
   - [ ] Note moyenne: 15/20
   - [ ] Toutes évaluées: 3

### Résultat Attendu

✅ **SUCCÈS** si:
- Le système gère plusieurs utilisateurs
- Les statistiques agrégées sont correctes
- Pas de perte de données

❌ **ÉCHEC** si:
- Données manquantes
- Calculs incorrects
- Erreurs de performance

---

## 📊 Résumé des Tests

| Test | Composant | Statut | Notes |
|------|-----------|--------|-------|
| 1 | CourseView → CourseStats | ⬜ | Tracking des vues |
| 2 | QuizTaking → QuizResults | ⬜ | Tracking des quiz |
| 3 | ExerciseTaking → ExerciseSubmissions | ⬜ | Soumission et notation |
| 4 | Firestore Direct | ⬜ | Vérification données |
| 5 | Performance Multi-Users | ⬜ | Test de charge |

**Légende**:
- ⬜ Non testé
- ✅ Réussi
- ❌ Échec
- ⚠️ Partiel

---

## 🐛 Troubleshooting

### Problème: Permission Denied

**Symptôme**: Erreur "Missing or insufficient permissions"

**Solutions**:
1. Vérifier que les règles Firestore sont déployées (FIRESTORE_RULES_FINAL_COMPLETE.txt)
2. Vérifier que l'utilisateur est connecté
3. Vérifier que l'utilisateur a le bon rôle (teacher/student)
4. Vérifier que les règles incluent les 3 collections stats

### Problème: Index Required

**Symptôme**: "The query requires an index"

**Solution**:
1. Cliquer sur le lien fourni dans l'erreur
2. Cliquer "Create Index" dans Firebase Console
3. Attendre que l'index soit "Enabled" (1-5 min)

### Problème: Aucune Donnée N'Apparaît

**Symptôme**: Modal de statistiques vide

**Solutions**:
1. Vérifier dans Firestore que les documents existent
2. Vérifier la console pour erreurs JavaScript
3. Vérifier que courseId/quizId/exerciseId correspond
4. Hard refresh (Ctrl+Shift+R)

### Problème: Tracking Ne Fonctionne Pas

**Symptôme**: courseViews vide après consultation

**Solutions**:
1. Vérifier console pour message: "✅ Course view tracked"
2. Vérifier que l'étudiant est resté au moins quelques secondes
3. Vérifier que la page a été fermée correctement
4. Vérifier que currentUser et userProfile sont définis

### Problème: Bouton "Passer l'exercice" Ne Fonctionne Pas

**Symptôme**: Clic ne fait rien ou erreur 404

**Solutions**:
1. Vérifier que la route /exercise/:id existe dans App.jsx
2. Vérifier que ExerciseTaking est importé
3. Vérifier l'ID de l'exercice dans l'URL
4. Hard refresh

---

## ✅ Critères de Succès Global

Le système est considéré comme **FONCTIONNEL** si:

1. ✅ **Règles Firestore** déployées avec succès
2. ✅ **3 Indexes** créés et activés
3. ✅ **Test 1** réussi (tracking cours)
4. ✅ **Test 2** réussi (quiz avec détails)
5. ✅ **Test 3** réussi (exercices avec notation)
6. ✅ **Firestore** contient les bonnes données
7. ✅ **Aucune erreur** dans la console

---

**Prêt pour production si tous les tests passent !** 🚀

**Date de vérification**: __________________  
**Vérifié par**: __________________  
**Résultat global**: ⬜ Réussi / ⬜ Partiel / ⬜ Échec
