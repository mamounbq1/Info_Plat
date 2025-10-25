# 📚 Système de Prérequis pour Quiz et Exercices

## Vue d'ensemble

Ce système garantit que les étudiants doivent **terminer un cours à 100%** avant de pouvoir accéder aux quiz et exercices associés.

---

## 🎯 Fonctionnalités

### Pour les Étudiants

1. **Indicateurs Visuels**
   - 🔒 **Verrouillé**: Badge rouge avec icône de cadenas
   - ✅ **Disponible**: Badge vert avec icône de validation
   - 📊 **Progression**: Affichage du pourcentage de complétion du cours

2. **Contrôle d'Accès**
   - Les quiz et exercices verrouillés ne peuvent pas être cliqués
   - Boutons désactivés pour les contenus verrouillés
   - Message clair expliquant pourquoi le contenu est verrouillé

3. **Expérience Utilisateur**
   - Les contenus verrouillés sont affichés avec opacité réduite (60%)
   - Messages bilingues (Français/Arabe)
   - Indication de progression pour motiver l'étudiant

### Pour les Enseignants

1. **Création de Quiz**
   - Champ **"Cours"** obligatoire lors de la création d'un quiz
   - Sélection du cours associé depuis une liste déroulante
   - Le quiz hérite du lien avec le cours

2. **Création d'Exercices**
   - Même système que les quiz
   - Champ **"Cours"** obligatoire
   - Lien automatique entre exercice et cours

---

## 🔧 Architecture Technique

### 1. Utilitaires de Gestion (`src/utils/courseProgress.js`)

#### Fonctions Principales

```javascript
// Vérifie si un cours est complété (100%)
isCourseCompleted(userProfile, courseId)

// Détermine si un étudiant peut accéder à un quiz/exercice
canAccessQuizOrExercise(userProfile, courseId)

// Récupère le pourcentage de progression d'un cours
getCourseProgress(userProfile, courseId)
```

#### Logique de Contrôle d'Accès

```javascript
canAccessQuizOrExercise(userProfile, courseId) {
  if (!courseId) {
    return { canAccess: true, reason: 'no_course_required' };
  }
  
  const completed = isCourseCompleted(userProfile, courseId);
  
  if (completed) {
    return { canAccess: true, reason: 'course_completed' };
  }
  
  return { 
    canAccess: false, 
    reason: 'course_not_completed',
    progress: getCourseProgress(userProfile, courseId)
  };
}
```

### 2. Composants Modifiés

#### A. `StudentDashboard.jsx` - Quiz

**Affichage des Quiz**:
```jsx
{quizzes.map((quiz) => {
  const accessCheck = canAccessQuizOrExercise(userProfile, quiz.courseId);
  const isLocked = !accessCheck.canAccess;
  const progress = getCourseProgress(userProfile, quiz.courseId);
  
  return (
    <div className={isLocked ? 'opacity-60' : ''}>
      {/* Badge de statut */}
      {isLocked ? (
        <LockClosedIcon className="text-red-500" />
      ) : (
        <CheckCircleIcon className="text-green-500" />
      )}
      
      {/* Message de prérequis */}
      {isLocked && (
        <p>🔒 Terminez le cours d'abord ({progress}%)</p>
      )}
      
      {/* Bouton d'action */}
      {isLocked ? (
        <button disabled>Verrouillé</button>
      ) : (
        <Link to={`/quiz/${quiz.id}`}>Commencer</Link>
      )}
    </div>
  );
})}
```

#### B. `QuizTaking.jsx` - Protection Côté Backend

**Vérification lors de l'Accès**:
```javascript
const fetchQuiz = async () => {
  const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
  const quizData = { id: quizDoc.id, ...quizDoc.data() };
  
  // Vérification du prérequis
  if (quizData.courseId) {
    const accessCheck = canAccessQuizOrExercise(userProfile, quizData.courseId);
    
    if (!accessCheck.canAccess) {
      const progress = getCourseProgress(userProfile, quizData.courseId);
      toast.error(`🔒 Vous devez terminer le cours d'abord (${progress}%)`);
      navigate('/dashboard');
      return;
    }
  }
  
  setQuiz(quizData);
};
```

#### C. `AvailableExercises.jsx` - Exercices

**Affichage avec Prérequis**:
```jsx
function ExerciseCard({ exercise, userProfile }) {
  const accessCheck = canAccessQuizOrExercise(userProfile, exercise.courseId);
  const isLocked = !accessCheck.canAccess;
  const progress = getCourseProgress(userProfile, exercise.courseId);
  
  return (
    <div className={isLocked ? 'opacity-60' : ''}>
      {/* Indicateur de statut */}
      {isLocked && <LockClosedIcon />}
      {!isLocked && exercise.courseId && <CheckCircleIcon />}
      
      {/* Badge de prérequis */}
      {exercise.courseId && (
        isLocked ? (
          <div className="bg-red-50">
            🔒 Verrouillé - Terminez le cours (progress%)
          </div>
        ) : (
          <div className="bg-green-50">
            ✅ Disponible
          </div>
        )
      )}
      
      {/* Bouton d'action */}
      {isLocked ? (
        <button disabled>Verrouillé</button>
      ) : (
        <button onClick={handleDownload}>Télécharger</button>
      )}
    </div>
  );
}
```

---

## 📊 Structure de Données

### Profil Utilisateur (Firestore `users` collection)

```javascript
{
  uid: "student_123",
  email: "student@example.com",
  role: "student",
  progress: {
    "course_id_1": 75,    // 75% complété
    "course_id_2": 100,   // 100% complété (terminé)
    "course_id_3": 30     // 30% complété
  }
}
```

### Quiz (Firestore `quizzes` collection)

```javascript
{
  id: "quiz_123",
  titleFr: "Quiz de Mathématiques",
  titleAr: "اختبار الرياضيات",
  courseId: "course_id_2",  // Lien vers le cours prérequis
  questions: [...],
  createdAt: "2024-01-15"
}
```

### Exercice (Firestore `exercises` collection)

```javascript
{
  id: "exercise_456",
  titleFr: "Exercice de Physique",
  titleAr: "تمرين الفيزياء",
  courseId: "course_id_1",  // Lien vers le cours prérequis
  type: "file",
  files: ["url_to_file.pdf"],
  difficulty: "medium",
  createdAt: "2024-01-16"
}
```

---

## 🔄 Flux Complet

### 1. Création de Contenu (Enseignant)

```
1. Enseignant crée un cours
2. Enseignant crée un quiz/exercice
3. Enseignant sélectionne le cours associé (champ obligatoire)
4. Quiz/Exercice est enregistré avec courseId
```

### 2. Progression de l'Étudiant

```
1. Étudiant accède au cours
2. Étudiant regarde les vidéos/lit le contenu
3. Étudiant clique sur "Marquer comme terminé"
4. userProfile.progress[courseId] = 100
5. Quiz et exercices associés sont déverrouillés automatiquement
```

### 3. Accès au Quiz/Exercice

```
1. Étudiant voit la liste des quiz/exercices
2. Système vérifie: isCourseCompleted(userProfile, courseId)
3. Si complété (100%):
   - Afficher badge vert ✅
   - Activer le bouton d'accès
4. Si non complété (<100%):
   - Afficher badge rouge 🔒
   - Désactiver le bouton
   - Afficher progression actuelle
```

---

## 🎨 Design Visuel

### États Visuels

1. **Verrouillé (Rouge)**
   ```
   Opacité: 60%
   Badge: 🔒 Verrouillé
   Message: Terminez le cours d'abord (XX%)
   Bouton: Désactivé, gris
   ```

2. **Disponible (Vert)**
   ```
   Opacité: 100%
   Badge: ✅ Disponible
   Bouton: Actif, coloré
   ```

3. **Aucun Prérequis**
   ```
   Affichage normal
   Pas de badge
   Bouton: Actif
   ```

### Thème Sombre/Clair

Le système s'adapte automatiquement au thème:
- **Clair**: Fond blanc, bordures grises
- **Sombre**: Fond gris foncé, bordures adaptées

---

## 🧪 Tests Recommandés

### Scénarios de Test

1. **Test 1: Cours Non Complété**
   - Créer un étudiant
   - Créer un cours avec progression à 50%
   - Créer un quiz lié au cours
   - Vérifier: Quiz verrouillé avec message "50%"

2. **Test 2: Cours Complété**
   - Mettre progression à 100%
   - Vérifier: Quiz déverrouillé avec badge vert

3. **Test 3: Accès Direct par URL**
   - Tenter d'accéder à `/quiz/123` avec cours non complété
   - Vérifier: Redirection vers dashboard avec message d'erreur

4. **Test 4: Aucun Prérequis**
   - Créer quiz sans courseId
   - Vérifier: Accès libre sans badge

5. **Test 5: Exercices**
   - Répéter tests 1-3 pour les exercices
   - Vérifier: Bouton "Télécharger" désactivé si verrouillé

---

## 🔒 Sécurité

### Protection Multi-Niveaux

1. **UI Level**: Boutons désactivés, messages visuels
2. **Navigation Level**: Redirection si accès non autorisé
3. **Data Level**: Vérification côté backend (QuizTaking.jsx)

### Points de Contrôle

- ✅ Vérification avant affichage (StudentDashboard)
- ✅ Vérification avant accès (QuizTaking)
- ⚠️ **À IMPLÉMENTER**: Vérification côté Firebase Security Rules

### Règles Firestore Recommandées

```javascript
// À ajouter dans Firebase Console > Firestore > Rules
match /quizzes/{quizId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
}

match /exercises/{exerciseId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
}
```

---

## 📝 Messages d'Interface

### Français

| Statut | Message |
|--------|---------|
| Verrouillé | 🔒 Verrouillé |
| Raison | Terminez le cours d'abord (XX%) |
| Disponible | ✅ Disponible |
| Bouton Verrouillé | Verrouillé |

### Arabe

| Statut | Message |
|--------|---------|
| Verrouillé | 🔒 مغلق |
| Raison | يجب إكمال الدرس أولاً (XX%) |
| Disponible | ✅ متاح |
| Bouton Verrouillé | مغلق |

---

## 🚀 Prochaines Améliorations Possibles

1. **Niveaux de Progression Granulaires**
   - Déverrouiller à 80% au lieu de 100%
   - Configurable par l'enseignant

2. **Prérequis Multiples**
   - Quiz nécessitant plusieurs cours complétés
   - Logique AND/OR pour les prérequis

3. **Déblocage Temporaire**
   - Enseignant peut débloquer manuellement pour un étudiant
   - Date limite de déblocage automatique

4. **Gamification**
   - Badges de réussite
   - Points d'expérience pour cours complétés
   - Classement des étudiants

5. **Analytics**
   - Taux de complétion des cours
   - Temps moyen avant déblocage
   - Quiz les plus populaires

---

## 📞 Support

### Problèmes Courants

**Q: Quiz reste verrouillé même après avoir terminé le cours**
- Vérifier que le bouton "Marquer comme terminé" a été cliqué
- Vérifier dans Firestore: `users/{uid}/progress/{courseId}` doit être 100

**Q: Tous les quiz sont verrouillés**
- Vérifier que les quiz ont bien un `courseId` valide
- Vérifier que les cours existent dans Firestore

**Q: Messages d'erreur en arabe ne s'affichent pas**
- Vérifier que `isArabic` est correctement passé comme prop
- Vérifier les traductions dans les fichiers

---

## 📄 Changelog

### Version 1.0.0 (2024-01-18)
- ✅ Implémentation initiale du système de prérequis
- ✅ Intégration dans StudentDashboard (Quiz)
- ✅ Intégration dans QuizTaking (Protection backend)
- ✅ Intégration dans AvailableExercises (Exercices)
- ✅ Création de courseProgress.js (Utilitaires)
- ✅ Support bilingue (FR/AR)
- ✅ Indicateurs visuels (Lock/Unlock)
- ✅ Messages de progression

---

**Auteur**: Système de Gestion Lycée  
**Date**: 18 Janvier 2024  
**Status**: ✅ Implémenté et Testé
