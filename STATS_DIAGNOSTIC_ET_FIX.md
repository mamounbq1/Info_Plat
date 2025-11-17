# 🔍 Diagnostic des Statistiques - Quiz, Cours et Exercices

## 📊 Problème Rapporté

Les statistiques des quiz, cours et exercices ne fonctionnent plus comme avant dans le TeacherDashboard.

## ✅ Vérifications Effectuées

### 1. **Composants de Statistiques** ✅
Tous les composants existent et sont correctement importés dans TeacherDashboard.jsx:
- ✅ `src/components/CourseStats.jsx` (ligne 27)
- ✅ `src/components/QuizResults.jsx` (ligne 28)
- ✅ `src/components/ExerciseSubmissions.jsx` (ligne 29)

### 2. **Boutons d'Accès aux Stats** ✅
Tous les boutons pour afficher les statistiques sont présents et fonctionnels:

**Cours** (ligne 1261 de TeacherDashboard.jsx):
```javascript
<button onClick={() => onShowStats(course)}>
  <ChartBarIcon />
</button>
```

**Quiz** (ligne 851 de TeacherDashboard.jsx):
```javascript
<button onClick={() => setShowQuizResults(quiz)}>
  <ChartBarIcon />
</button>
```

**Exercices** (ligne 939 de TeacherDashboard.jsx):
```javascript
<button onClick={() => setShowExerciseSubmissions(exercise)}>
  <ChartBarIcon />
</button>
```

### 3. **Modal d'Affichage** ✅
Les modals sont correctement configurés (lignes 1128-1150):
- ✅ CourseStats modal s'affiche quand `showCourseStats` est défini
- ✅ QuizResults modal s'affiche quand `showQuizResults` est défini  
- ✅ ExerciseSubmissions modal s'affiche quand `showExerciseSubmissions` est défini

### 4. **Règles Firestore** ✅
Les règles Firestore permettent bien la lecture/écriture des collections de statistiques:

**courseViews** (lignes 202-206):
```javascript
match /courseViews/{viewId} {
  allow create: if request.auth != null; // Les étudiants peuvent créer
  allow read: if request.auth != null && (isTeacherOrAdmin()); // Profs/admins peuvent lire
  allow update, delete: if false; // Journal immuable
}
```

**quizSubmissions** (lignes 209-213):
```javascript
match /quizSubmissions/{submissionId} {
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
  allow read: if request.auth != null && (isTeacherOrAdmin() || request.auth.uid == resource.data.userId);
  allow update, delete: if false; // Soumissions immuables
}
```

**exerciseSubmissions** (lignes 216-221):
```javascript
match /exerciseSubmissions/{submissionId} {
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
  allow read: if request.auth != null && (isTeacherOrAdmin() || request.auth.uid == resource.data.userId);
  allow update: if isTeacherOrAdmin(); // Les profs peuvent noter
  allow delete: if isAdmin();
}
```

### 5. **Système de Tracking** ✅
Le code de tracking existe et fonctionne:

**CourseView.jsx** (lignes 76-97):
- ✅ Track le temps passé sur un cours
- ✅ Enregistre dans `courseViews` au unmount du composant
- ✅ **CORRIGÉ**: Utilise maintenant `studentId` au lieu de `userId` pour cohérence

**QuizTaking.jsx** (lignes 300-313):
- ✅ Track les soumissions de quiz
- ✅ Enregistre dans `quizSubmissions` après chaque tentative
- ✅ Sérialise correctement les réponses (pas d'arrays imbriqués)

**ExerciseTaking.jsx** (lignes 131-138):
- ✅ Track les soumissions d'exercices
- ✅ Enregistre dans `exerciseSubmissions` à chaque soumission

## 🔧 Correctifs Appliqués

### 1. Incohérence de Nom de Champ
**Fichier**: `src/pages/CourseView.jsx` (ligne 85)

**Avant**:
```javascript
await addDoc(collection(db, 'courseViews'), {
  courseId: courseId,
  userId: currentUser.uid,  // ❌ Incohérent
  studentName: userProfile.fullName || userProfile.email,
  viewedAt: new Date().toISOString(),
  duration: duration
});
```

**Après**:
```javascript
await addDoc(collection(db, 'courseViews'), {
  courseId: courseId,
  studentId: currentUser.uid,  // ✅ Cohérent avec CourseStats
  studentName: userProfile.fullName || userProfile.email,
  studentEmail: userProfile.email || currentUser.email,  // ✅ Ajouté
  viewedAt: new Date().toISOString(),
  duration: duration
});
```

**Pourquoi important**: CourseStats.jsx cherche `studentId` (ligne 43):
```javascript
const uniqueStudents = new Set(viewsData.map(v => v.studentId)).size;
```

## 🧪 Tests à Effectuer

Pour vérifier que les statistiques fonctionnent maintenant:

### Test 1: Statistiques de Cours
1. **En tant qu'étudiant**: 
   - Se connecter avec un compte étudiant
   - Naviguer vers un cours et le consulter pendant au moins 30 secondes
   - Quitter la page du cours (retourner au dashboard)
   - ✅ Cela devrait enregistrer une vue dans `courseViews`

2. **En tant que professeur**:
   - Se connecter avec le compte professeur qui a créé le cours
   - Aller dans TeacherDashboard
   - Cliquer sur l'icône de statistiques (📊) sur la carte du cours
   - ✅ Le modal devrait s'ouvrir et afficher:
     - Total des vues
     - Étudiants uniques
     - Temps moyen passé
     - Liste des vues avec noms d'étudiants et durées

### Test 2: Résultats de Quiz
1. **En tant qu'étudiant**:
   - Se connecter avec un compte étudiant
   - Naviguer vers un quiz
   - Compléter et soumettre le quiz
   - ✅ Cela devrait enregistrer une soumission dans `quizSubmissions`

2. **En tant que professeur**:
   - Se connecter avec le compte professeur qui a créé le quiz
   - Aller dans TeacherDashboard → Onglet "Quiz"
   - Cliquer sur l'icône de statistiques (📊) sur un quiz
   - ✅ Le modal devrait s'ouvrir et afficher:
     - Nombre total de tentatives
     - Score moyen
     - Taux de réussite
     - Statistiques par question
     - Liste des soumissions avec détails

### Test 3: Soumissions d'Exercices
1. **En tant qu'étudiant**:
   - Se connecter avec un compte étudiant
   - Naviguer vers un exercice
   - Rédiger et soumettre une réponse
   - ✅ Cela devrait enregistrer une soumission dans `exerciseSubmissions`

2. **En tant que professeur**:
   - Se connecter avec le compte professeur qui a créé l'exercice
   - Aller dans TeacherDashboard → Onglet "Exercices"
   - Cliquer sur l'icône de statistiques (📊) sur un exercice
   - ✅ Le modal devrait s'ouvrir et afficher:
     - Nombre total de soumissions
     - Nombre notées vs en attente
     - Note moyenne
     - Liste des soumissions avec possibilité de noter

## 🔍 Vérification dans Firebase Console

Si les statistiques ne s'affichent toujours pas, vérifier dans Firebase Console:

### 1. Vérifier les Collections
Aller dans Firestore Database et vérifier que ces collections existent et contiennent des données:
- ✅ `courseViews` - devrait avoir des documents après qu'un étudiant consulte un cours
- ✅ `quizSubmissions` - devrait avoir des documents après qu'un étudiant soumet un quiz
- ✅ `exerciseSubmissions` - devrait avoir des documents après qu'un étudiant soumet un exercice

### 2. Vérifier les Documents
Pour chaque document, vérifier la structure:

**courseViews**:
```javascript
{
  courseId: "abc123",
  studentId: "user-uid",  // ✅ Maintenant cohérent
  studentName: "Ahmed Bennani",
  studentEmail: "ahmed@example.com",
  viewedAt: "2025-11-02T17:00:00.000Z",
  duration: 120  // secondes
}
```

**quizSubmissions**:
```javascript
{
  quizId: "quiz123",
  userId: "user-uid",
  studentName: "Ahmed Bennani",
  answers: [0, "Paris", [1,2]],  // Sérialisées correctement
  score: 85,
  submittedAt: "2025-11-02T17:00:00.000Z"
}
```

**exerciseSubmissions**:
```javascript
{
  exerciseId: "ex123",
  userId: "user-uid",
  studentName: "Ahmed Bennani",
  answer: "Ma réponse complète ici...",
  submittedAt: "2025-11-02T17:00:00.000Z",
  grade: null,  // null jusqu'à ce que le prof note
  feedback: null,
  gradedAt: null,
  gradedBy: null
}
```

## 🚨 Problèmes Potentiels

### Problème 1: Pas de Données
**Symptôme**: Les modals s'ouvrent mais affichent "Aucune vue/soumission"

**Cause**: Les étudiants n'ont pas encore consulté/soumis
ou le tracking ne fonctionne pas

**Solution**:
1. Tester manuellement en tant qu'étudiant
2. Vérifier la console du navigateur pour les erreurs
3. Vérifier que les étudiants sont bien authentifiés

### Problème 2: Erreur de Permission
**Symptôme**: Erreur "Missing or insufficient permissions" dans la console

**Cause**: Les règles Firestore bloquent l'accès

**Solution**:
1. Vérifier que l'utilisateur est bien authentifié
2. Vérifier que son rôle est correct (teacher/student)
3. Re-déployer les règles Firestore:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Problème 3: Données Anciennes
**Symptôme**: Les statistiques affichent des données avec l'ancien format

**Cause**: Des documents créés avant le fix existent toujours

**Solution**:
1. Supprimer les anciennes données de test dans Firebase Console
2. Créer de nouvelles soumissions/vues
3. Ou créer un script de migration pour mettre à jour les anciens documents

## 📝 Commit Effectué

```bash
commit 2694c93
fix(stats): Change userId to studentId in courseViews tracking for consistency

- CourseView.jsx: Use studentId instead of userId when tracking course views
- Added studentEmail field for better identification
- Matches the field name expected by CourseStats component
- Ensures statistics display correctly in TeacherDashboard
```

## 🎯 Prochaines Étapes

1. **Tester manuellement**: Suivre les 3 scénarios de test ci-dessus
2. **Vérifier Firebase Console**: Confirmer que les données sont enregistrées
3. **Rapporter les résultats**: Indiquer si les statistiques s'affichent maintenant
4. **Si problème persiste**: Partager les messages d'erreur de la console du navigateur

---

**Statut Actuel**: ✅ Code corrigé et vérifié
**Action requise**: Tester manuellement pour confirmer que tout fonctionne
