# 🧪 Guide de Test: Système de Prérequis Quiz/Exercices

## 📋 Vue d'ensemble

Ce guide fournit des instructions détaillées pour tester le nouveau système de prérequis qui exige que les étudiants terminent un cours à 100% avant d'accéder aux quiz et exercices associés.

---

## 🎯 Objectifs de Test

1. ✅ Vérifier que les quiz sont verrouillés quand le cours n'est pas terminé
2. ✅ Vérifier que les quiz sont déverrouillés quand le cours est terminé (100%)
3. ✅ Vérifier que l'accès direct par URL est bloqué
4. ✅ Vérifier que les exercices suivent la même logique
5. ✅ Vérifier que les messages sont corrects en français et en arabe
6. ✅ Vérifier que les indicateurs visuels sont corrects

---

## 📦 Prérequis pour les Tests

### Données Nécessaires

1. **Compte Enseignant**
   - Email: `superadmin@eduplatform.ma`
   - Mot de passe: `SuperAdmin@2025!Secure`
   - Rôle: teacher/admin

2. **Compte Étudiant de Test** (à créer)
   - Email: `test.student@example.com`
   - Nom: Test Student
   - Classe: n'importe quelle classe existante

### Environnement

- **Application URL**: Vérifier l'URL de déploiement actuelle
- **Firebase Console**: Accès pour vérifier les données Firestore
- **Navigateur**: Chrome ou Firefox (mode développeur disponible)

---

## 🧪 Scénarios de Test

### Test 1: Création du Cours et du Quiz (Enseignant)

#### Étapes
1. Connexion en tant qu'enseignant
2. Aller dans l'onglet "Cours"
3. Créer un nouveau cours:
   - Titre (FR): "Test Mathématiques"
   - Titre (AR): "اختبار الرياضيات"
   - Sélectionner les classes cibles
   - Ajouter du contenu (vidéos, texte, etc.)
   - Publier le cours
4. Noter le `courseId` (visible dans l'URL ou Firestore)
5. Aller dans l'onglet "Quiz"
6. Créer un nouveau quiz:
   - Titre (FR): "Quiz Test Prérequis"
   - Titre (AR): "اختبار المتطلبات"
   - **IMPORTANT**: Sélectionner "Test Mathématiques" dans le champ "Cours"
   - Ajouter des questions
   - Publier le quiz
7. Créer un exercice:
   - Titre (FR): "Exercice Test Prérequis"
   - Type: Fichier ou Lien
   - **IMPORTANT**: Sélectionner "Test Mathématiques" dans le champ "Cours"
   - Publier l'exercice

#### Résultat Attendu
✅ Cours, quiz et exercice créés avec succès  
✅ Quiz et exercice ont le champ `courseId` rempli

---

### Test 2: Quiz Verrouillé (Cours Non Terminé)

#### Étapes
1. Se déconnecter
2. Se connecter avec le compte étudiant test
3. Aller sur le Dashboard étudiant
4. Localiser le quiz "Quiz Test Prérequis"

#### Résultat Attendu

**Interface Française**:
- ✅ Card du quiz affichée avec **opacité 60%**
- ✅ **Badge rouge** 🔒 avec texte "Verrouillé"
- ✅ **Icône de cadenas** rouge en haut à droite
- ✅ Message sous le titre: "🔒 Verrouillé - Terminez le cours d'abord (0%)"
- ✅ Bouton "Verrouillé" **grisé et désactivé**
- ✅ Cursor change en "not-allowed" au survol

**Interface Arabe** (si applicable):
- ✅ Badge "مغلق" 🔒
- ✅ Message "يجب إكمال الدرس أولاً (0%)"
- ✅ Bouton "مغلق" désactivé

#### Screenshot Attendu
```
┌────────────────────────────────────┐
│ Quiz Test Prérequis          🔒    │
│ ────────────────────────────────── │
│ 🔒 Verrouillé                      │
│ Terminez le cours d'abord (0%)     │
│ ────────────────────────────────── │
│ [    VERROUILLÉ (gris)    ]        │
└────────────────────────────────────┘
      (Opacité 60%)
```

---

### Test 3: Tentative d'Accès Direct par URL

#### Étapes
1. Toujours connecté en tant qu'étudiant
2. Noter l'ID du quiz (ex: `abc123`)
3. Dans la barre d'adresse, aller directement à: `/quiz/abc123`

#### Résultat Attendu
- ✅ **Redirection automatique** vers `/dashboard`
- ✅ **Toast d'erreur** affiché en rouge
- ✅ Message en français: "🔒 Vous devez terminer le cours d'abord (progression: 0%)"
- ✅ Message en arabe: "🔒 يجب إكمال الدرس أولاً (التقدم: 0%)"
- ✅ Quiz ne se charge jamais

#### Screenshot Attendu
```
┌─────────────────────────────────────────┐
│ 🔒 Vous devez terminer le cours        │
│    d'abord (progression: 0%)            │
└─────────────────────────────────────────┘
         (Toast rouge en haut)
```

---

### Test 4: Progression Partielle du Cours

#### Étapes
1. Aller dans la liste des cours disponibles
2. Cliquer sur "Test Mathématiques"
3. Regarder une vidéo ou lire du contenu
4. **NE PAS** cliquer sur "Marquer comme terminé"
5. Utiliser Firebase Console pour mettre à jour manuellement:
   ```
   Collection: users
   Document: {studentUid}
   Champ: progress.{courseId} = 50
   ```
6. Rafraîchir le dashboard étudiant

#### Résultat Attendu
- ✅ Badge toujours rouge 🔒
- ✅ Message mis à jour: "Terminez le cours d'abord (50%)"
- ✅ Bouton toujours désactivé

#### Screenshot Attendu
```
┌────────────────────────────────────┐
│ Quiz Test Prérequis          🔒    │
│ ────────────────────────────────── │
│ 🔒 Verrouillé                      │
│ Terminez le cours d'abord (50%)    │
│ ────────────────────────────────── │
│ [    VERROUILLÉ (gris)    ]        │
└────────────────────────────────────┘
      (Opacité 60%)
```

---

### Test 5: Cours Complété (Quiz Déverrouillé)

#### Étapes
1. Aller sur la page du cours "Test Mathématiques"
2. Cliquer sur le bouton "Marquer comme terminé"
3. Vérifier le toast de confirmation
4. Retourner au dashboard

#### Résultat Attendu

**Interface Française**:
- ✅ Card du quiz affichée avec **opacité 100%** (normale)
- ✅ **Badge vert** ✅ avec texte "Disponible"
- ✅ **Icône de validation** verte (CheckCircleIcon)
- ✅ Message sous le titre: "✅ Disponible"
- ✅ Bouton "Commencer le quiz" **actif et vert**
- ✅ Hover effect sur le bouton (assombrissement)

**Interface Arabe** (si applicable):
- ✅ Badge "متاح" ✅
- ✅ Bouton "بدء الاختبار" actif

#### Screenshot Attendu
```
┌────────────────────────────────────┐
│ Quiz Test Prérequis          ✅    │
│ ────────────────────────────────── │
│ ✅ Disponible                      │
│ ────────────────────────────────── │
│ [  COMMENCER LE QUIZ (vert)  ]     │
└────────────────────────────────────┘
      (Opacité 100%)
```

---

### Test 6: Accès au Quiz Déverrouillé

#### Étapes
1. Sur le dashboard, cliquer sur "Commencer le quiz"
2. Vérifier que la page du quiz se charge

#### Résultat Attendu
- ✅ Navigation vers `/quiz/abc123` fonctionne
- ✅ Page du quiz se charge normalement
- ✅ Questions affichées
- ✅ Aucun message d'erreur

---

### Test 7: Exercice Verrouillé

#### Étapes
1. Retourner au dashboard
2. Scroller jusqu'à la section "Exercices Disponibles"
3. Localiser "Exercice Test Prérequis"

#### Résultat Attendu

**Vue Grille**:
- ✅ Card affichée avec **opacité 60%**
- ✅ Badge rouge 🔒 "Verrouillé" dans le header
- ✅ Message: "🔒 Verrouillé" avec "Progression: 100%" (car cours terminé)
  - **ATTENTION**: Dans ce test, le cours est terminé, donc l'exercice devrait être **DÉVERROUILLÉ** ✅
  - Si vous voulez tester le verrouillage, créez un NOUVEAU cours non terminé et liez l'exercice à celui-ci

**Vue Liste**:
- ✅ Ligne affichée avec opacité 60% (si verrouillé)
- ✅ Icône de cadenas dans le titre
- ✅ Badge de statut rouge
- ✅ Bouton "Verrouillé" désactivé

#### Screenshot Attendu (Si verrouillé)
```
┌────────────────────────────────────┐
│ 📄 Exercice Test Prérequis   🔒   │
│ ────────────────────────────────── │
│ 🔒 Verrouillé                      │
│ Progression: 0%                    │
│ ────────────────────────────────── │
│ [    VERROUILLÉ (gris)    ]        │
└────────────────────────────────────┘
```

---

### Test 8: Exercice Déverrouillé

#### Étapes
1. Si l'exercice est lié au cours "Test Mathématiques" (déjà terminé)
2. L'exercice devrait être automatiquement déverrouillé

#### Résultat Attendu

**Vue Grille**:
- ✅ Card avec opacité 100%
- ✅ Badge vert ✅ "Disponible"
- ✅ Bouton actif:
  - Fichier: "Télécharger" (violet)
  - Lien: "Ouvrir le lien" (bleu)
  - Texte: "Voir le texte" (vert)

**Vue Liste**:
- ✅ Ligne normale sans opacité
- ✅ Icône de validation verte
- ✅ Badge vert "Disponible"
- ✅ Bouton d'action actif

#### Screenshot Attendu
```
┌────────────────────────────────────┐
│ 📄 Exercice Test Prérequis   ✅   │
│ ────────────────────────────────── │
│ ✅ Disponible                      │
│ ────────────────────────────────── │
│ [   TÉLÉCHARGER (violet)   ]       │
└────────────────────────────────────┘
```

---

### Test 9: Clic sur Exercice Déverrouillé

#### Étapes
1. Cliquer sur "Télécharger" (si type = fichier)
2. OU cliquer sur "Ouvrir le lien" (si type = lien)

#### Résultat Attendu
- ✅ **Type Fichier**: Téléchargement commence ou nouvel onglet s'ouvre
- ✅ **Type Lien**: Lien externe s'ouvre dans nouvel onglet
- ✅ **Type Texte**: Modal ou section affiche le texte

---

### Test 10: Quiz Sans Prérequis

#### Étapes
1. En tant qu'enseignant, créer un nouveau quiz
2. **NE PAS** sélectionner de cours dans le champ "Cours"
3. Publier le quiz
4. Se connecter en tant qu'étudiant
5. Vérifier le nouveau quiz

#### Résultat Attendu
- ✅ Quiz affiché normalement (opacité 100%)
- ✅ **Aucun badge** (ni rouge ni vert)
- ✅ Bouton "Commencer le quiz" actif
- ✅ Accès libre immédiat

#### Screenshot Attendu
```
┌────────────────────────────────────┐
│ Quiz Sans Prérequis               │
│ ────────────────────────────────── │
│ (Pas de badge de statut)           │
│ ────────────────────────────────── │
│ [ COMMENCER LE QUIZ (vert) ]       │
└────────────────────────────────────┘
```

---

### Test 11: Mode Sombre (Dark Mode)

#### Étapes
1. Activer le mode sombre dans l'application
2. Vérifier l'affichage des badges et messages

#### Résultat Attendu

**Quiz Verrouillé**:
- ✅ Badge: `bg-red-900/20 border-red-800 text-red-400`
- ✅ Texte lisible sur fond sombre
- ✅ Icônes visibles

**Quiz Disponible**:
- ✅ Badge: `bg-green-900/20 border-green-800 text-green-400`
- ✅ Couleurs adaptées au thème sombre

---

### Test 12: Bilinguisme (FR ↔ AR)

#### Étapes
1. Changer la langue de l'interface en arabe
2. Vérifier tous les messages de prérequis

#### Résultat Attendu

| État | Français | Arabe |
|------|----------|-------|
| Verrouillé | 🔒 Verrouillé | 🔒 مغلق |
| Raison | Terminez le cours d'abord (XX%) | يجب إكمال الدرس أولاً (XX%) |
| Disponible | ✅ Disponible | ✅ متاح |
| Bouton Lock | Verrouillé | مغلق |
| Bouton Start | Commencer le quiz | بدء الاختبار |

---

## 🐛 Cas de Test d'Erreur

### Erreur 1: CourseId Invalide

**Test**:
1. Manuellement dans Firestore, mettre `courseId = "INVALID_ID"` sur un quiz
2. Charger le dashboard étudiant

**Résultat Attendu**:
- ✅ Quiz affiché comme verrouillé (par sécurité)
- ✅ Ou badge non affiché si course inexistant

---

### Erreur 2: UserProfile Sans Champ Progress

**Test**:
1. Créer un nouvel étudiant
2. Vérifier dans Firestore que le champ `progress` n'existe pas
3. Afficher un quiz avec prérequis

**Résultat Attendu**:
- ✅ Quiz verrouillé (progress considéré comme 0%)
- ✅ Aucune erreur console
- ✅ Message "Terminez le cours d'abord (0%)"

---

### Erreur 3: Connexion Internet Perdue

**Test**:
1. Commencer un quiz avec cours terminé
2. Couper la connexion internet
3. Tenter de recharger la page

**Résultat Attendu**:
- ✅ Message d'erreur Firebase standard
- ✅ Pas de crash de l'application
- ✅ Gestion gracieuse de l'erreur

---

## 📊 Checklist de Test

### Tests Fonctionnels
- [ ] Test 1: Création cours + quiz + exercice
- [ ] Test 2: Quiz verrouillé (cours non terminé)
- [ ] Test 3: Accès direct par URL bloqué
- [ ] Test 4: Progression partielle affichée
- [ ] Test 5: Quiz déverrouillé après complétion
- [ ] Test 6: Navigation vers quiz fonctionne
- [ ] Test 7: Exercice verrouillé
- [ ] Test 8: Exercice déverrouillé
- [ ] Test 9: Action sur exercice fonctionne
- [ ] Test 10: Quiz sans prérequis accessible

### Tests Visuels
- [ ] Test 11: Mode sombre correct
- [ ] Test 12: Bilinguisme FR/AR correct
- [ ] Badges bien alignés
- [ ] Icônes de bonne taille
- [ ] Opacité 60% visible
- [ ] Hover effects fonctionnels

### Tests de Sécurité
- [ ] Accès direct par URL bloqué
- [ ] Toast d'erreur affiché
- [ ] Redirection fonctionne
- [ ] Messages bilingues corrects

### Tests d'Erreur
- [ ] CourseId invalide géré
- [ ] UserProfile sans progress géré
- [ ] Perte de connexion gérée

---

## 📸 Captures d'Écran Requises

Pour la validation complète, prendre des screenshots de:

1. **Quiz Verrouillé (0%)**
   - Vue desktop
   - Vue mobile

2. **Quiz Verrouillé (50%)**
   - Message avec progression

3. **Quiz Déverrouillé**
   - Badge vert visible

4. **Toast d'Erreur (Accès Refusé)**
   - Message complet

5. **Exercice Verrouillé (Grille)**
   - Badge et bouton désactivé

6. **Exercice Déverrouillé (Liste)**
   - Bouton actif

7. **Mode Sombre**
   - Quiz verrouillé
   - Quiz disponible

8. **Interface Arabe**
   - Quiz avec messages en arabe

---

## 🔍 Vérification Console Développeur

### Console Logs Attendus
```javascript
// Aucune erreur ne devrait apparaître
// Messages de debug possibles:
"Course progress for courseId: 50%"
"Access check result: { canAccess: false, reason: 'course_not_completed' }"
```

### Firestore Queries Attendues
```
GET /quizzes/{quizId}
GET /users/{studentUid}
GET /courses/{courseId} (si nécessaire)
```

---

## ✅ Critères de Réussite Globaux

Le système de prérequis est considéré comme **fonctionnel** si:

1. ✅ Tous les quiz liés à un cours non terminé sont verrouillés
2. ✅ Tous les quiz liés à un cours terminé sont déverrouillés
3. ✅ L'accès direct par URL est bloqué avec redirection
4. ✅ Les messages de progression sont corrects
5. ✅ Les indicateurs visuels sont clairs et cohérents
6. ✅ Le système fonctionne en français et en arabe
7. ✅ Les exercices suivent la même logique que les quiz
8. ✅ Les quiz sans prérequis restent accessibles
9. ✅ Aucune erreur console
10. ✅ Performance acceptable (pas de lag)

---

## 📝 Rapport de Test (Template)

```markdown
# Rapport de Test: Système de Prérequis

**Date**: _______________
**Testeur**: _______________
**Environnement**: _______________

## Résultats

| Test | Status | Notes |
|------|--------|-------|
| Test 1 | ✅ / ❌ | |
| Test 2 | ✅ / ❌ | |
| Test 3 | ✅ / ❌ | |
| ... | ... | |

## Bugs Trouvés

1. **Bug 1**: Description
   - Sévérité: Critique / Majeur / Mineur
   - Reproduction: ...
   - Screenshot: ...

## Suggestions d'Amélioration

1. ...
2. ...

## Conclusion

- [ ] Tous les tests passent
- [ ] Prêt pour production
- [ ] Nécessite des corrections
```

---

## 🚀 Prochaines Étapes Après Tests

1. **Si tests OK**:
   - Valider avec le client
   - Merger la PR vers main
   - Déployer en production

2. **Si bugs trouvés**:
   - Créer des issues GitHub
   - Prioriser les corrections
   - Retester après fixes

---

**📅 Date de Création**: 18 Janvier 2024  
**👤 Auteur**: GenSpark AI Developer  
**📄 Version**: 1.0
