# ✅ Vérification du Panel Admin - Structure Académique

## 🎯 Objectif
Vérifier que les filières (branches) apparaissent et sont modifiables dans le panel admin.

## 📋 Checklist de Vérification

### 1. Accès au Panel Admin

#### Se Connecter en tant qu'Admin
1. **URL**: https://5175-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/login
2. **Identifiants**:
   - Email: `superadmin@eduplatform.ma`
   - Password: `SuperAdmin@2025!Secure`
3. ✅ Vous devriez être redirigé vers `/dashboard` (Admin Dashboard)

### 2. Navigation vers Structure Académique

#### Localiser l'Onglet
- Cherchez l'onglet: **"Structure Académique"** (FR) ou **"الهيكل الأكاديمي"** (AR)
- Icône: 🎓 (Academic Cap)
- Position: Dans la barre d'onglets en haut du dashboard
- Cliquez sur cet onglet

### 3. Vérification de la Structure Hiérarchique

Le composant `AcademicStructureManagement` affiche la structure en mode hiérarchique:

```
📚 Niveaux (Levels)
  └── 🌿 Branches/Filières (Types)
       └── 🎓 Classes
  
📖 Matières (Subjects) - Section séparée
```

### 4. Vérification des Niveaux

#### Niveaux Attendus
Vous devriez voir **3 niveaux** affichés:

| Code | Nom Français | Nom Arabe | Statut |
|------|--------------|-----------|--------|
| TC | Tronc Commun | الجذع المشترك | ✅ Activé |
| 1BAC | 1ère Baccalauréat | الأولى باكالوريا | ✅ Activé |
| 2BAC | 2ème Baccalauréat | الثانية باكالوريا | ✅ Activé |

#### Actions Disponibles pour les Niveaux
- ✏️ **Éditer**: Modifier le nom, code, ordre
- 🗑️ **Supprimer**: Supprimer le niveau (si aucune branche attachée)
- ➕ **Ajouter un Niveau**: Créer un nouveau niveau
- 🔽 **Expand/Collapse**: Afficher/masquer les branches

### 5. ✅ VÉRIFICATION DES BRANCHES/FILIÈRES

C'est la partie principale à vérifier!

#### 5.1 Développer un Niveau
1. Cliquez sur **2ème Baccalauréat** (ou n'importe quel niveau)
2. Le niveau devrait se développer et afficher ses branches

#### 5.2 Branches Attendues pour 2BAC
Vous devriez voir **4 branches** sous 2BAC:

| Code | Nom Français | Nom Arabe | Ordre |
|------|--------------|-----------|-------|
| SC | Sciences Expérimentales | علوم تجريبية | 1 |
| MATH | Sciences Mathématiques | علوم رياضية | 2 |
| ECO | Sciences Économiques | علوم اقتصادية | 3 |
| LET | Lettres | آداب | 4 |

#### 5.3 Branches pour 1BAC
Développez **1ère Baccalauréat**, vous devriez voir les mêmes **4 branches**.

#### 5.4 Branches pour TC
Développez **Tronc Commun**, vous devriez voir **2 branches**:
- Sciences (SC)
- Lettres (LET)

### 6. Actions sur les Branches

#### 6.1 ✏️ Modifier une Branche
1. Cliquez sur l'icône **éditer** (✏️) à côté d'une branche
2. Un modal devrait s'ouvrir avec les champs:
   - **Nom Français**: (ex: "Sciences Expérimentales")
   - **Nom Arabe**: (ex: "علوم تجريبية")
   - **Code**: (ex: "SC")
   - **Level Code**: (ex: "2BAC") - devrait être pré-rempli
   - **Ordre**: Numéro d'ordre d'affichage
   - **Activé**: Checkbox (enabled/disabled)
   - **Description**: (optionnel)

3. **Testez une modification**:
   - Changez le nom français par: "Sciences Expérimentales Modifié"
   - Cliquez sur "Enregistrer" ou "Save"
   - ✅ La branche devrait être mise à jour immédiatement

4. **Vérification après modification**:
   - La branche devrait afficher le nouveau nom
   - Toast notification de succès devrait apparaître

#### 6.2 ➕ Ajouter une Branche
1. Sur un niveau développé, cherchez le bouton **"Ajouter Branche"** ou **"+"**
2. Cliquez dessus
3. Un modal devrait s'ouvrir
4. **Remplissez le formulaire** pour une nouvelle branche de test:
   ```
   Nom FR: Sciences de l'Ingénieur
   Nom AR: علوم المهندس
   Code: SI
   Level Code: 2BAC (pré-rempli)
   Ordre: 5
   Activé: ✅
   ```
5. Cliquez sur "Enregistrer"
6. ✅ La nouvelle branche devrait apparaître sous 2BAC

#### 6.3 🗑️ Supprimer une Branche
1. Cliquez sur l'icône **supprimer** (🗑️) à côté de la branche test créée
2. Une confirmation devrait apparaître
3. Confirmez la suppression
4. ✅ La branche devrait disparaître de la liste

**Note**: Vous ne pouvez pas supprimer une branche si elle a des classes attachées.

#### 6.4 🔽 Voir les Classes d'une Branche
1. Cliquez sur une branche pour la développer
2. Les classes associées devraient s'afficher en dessous
3. **Exemple pour 2BAC → Sciences**:
   - 2ème Bac Sciences - Classe 1
   - 2ème Bac Sciences - Classe 2

### 7. Vérification des Classes

#### 7.1 Classes Attendues
Total de **10 classes** réparties:

**Tronc Commun → Sciences**:
- TC-SC-1: Tronc Commun Sciences - Classe 1
- TC-SC-2: Tronc Commun Sciences - Classe 2

**1BAC → Sciences**:
- 1BAC-SC-1: 1ère Bac Sciences - Classe 1
- 1BAC-SC-2: 1ère Bac Sciences - Classe 2

**1BAC → Mathématiques**:
- 1BAC-MATH-1: 1ère Bac Mathématiques - Classe 1
- 1BAC-MATH-2: 1ère Bac Mathématiques - Classe 2

**2BAC → Sciences**:
- 2BAC-SC-1: 2ème Bac Sciences - Classe 1
- 2BAC-SC-2: 2ème Bac Sciences - Classe 2

**2BAC → Mathématiques**:
- 2BAC-MATH-1: 2ème Bac Mathématiques - Classe 1
- 2BAC-MATH-2: 2ème Bac Mathématiques - Classe 2

#### 7.2 Actions sur les Classes
- ✏️ **Éditer**: Modifier nom, code, ordre
- 🗑️ **Supprimer**: Supprimer la classe
- ➕ **Ajouter**: Créer une nouvelle classe

### 8. Vérification des Matières (Subjects)

En bas de la page, section séparée pour les matières:

#### Matières Attendues
Vous devriez voir **12 matières**:
- Mathématiques (MATH)
- Physique-Chimie (PC)
- Sciences de la Vie et de la Terre (SVT)
- Informatique (INFO)
- Français (FR)
- Arabe (AR)
- Anglais (EN)
- Histoire-Géographie (HG)
- Philosophie (PHILO)
- Éducation Islamique (EI)

#### Actions sur les Matières
- ✏️ Éditer
- 🗑️ Supprimer
- ➕ Ajouter une matière

### 9. Tests Fonctionnels

#### Test 1: Éditer une Branche
- [ ] Ouvrir le modal d'édition
- [ ] Modifier le nom français
- [ ] Sauvegarder
- [ ] Vérifier que le changement est visible
- [ ] Vérifier la notification de succès

#### Test 2: Ajouter une Branche
- [ ] Ouvrir le modal d'ajout
- [ ] Remplir tous les champs
- [ ] Sauvegarder
- [ ] Vérifier que la branche apparaît

#### Test 3: Supprimer une Branche
- [ ] Supprimer une branche sans classes
- [ ] Vérifier la confirmation
- [ ] Vérifier la suppression

#### Test 4: Toggle Enabled/Disabled
- [ ] Désactiver une branche
- [ ] Vérifier que l'état change
- [ ] Vérifier que la branche n'apparaît plus dans le signup

#### Test 5: Réorganiser l'Ordre
- [ ] Éditer une branche
- [ ] Changer l'ordre (ex: de 2 à 1)
- [ ] Sauvegarder
- [ ] Vérifier que l'ordre d'affichage change

### 10. Vérification Console

#### Ouvrir la Console du Navigateur
1. Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
2. Allez dans l'onglet **Console**
3. Vérifiez les messages:
   - ✅ Pas d'erreurs rouges
   - ℹ️ Messages informatifs de chargement des données

#### Messages Attendus
```javascript
✅ Loaded X academic levels
✅ Loaded 10 branches
✅ Loaded 10 classes
✅ Loaded 12 subjects
```

### 11. Vérification Firestore

#### Firebase Console
1. Ouvrez: https://console.firebase.google.com
2. Sélectionnez le projet: **eduinfor-fff3d**
3. Allez dans **Firestore Database**
4. Vérifiez les collections:

**Collection `branches`**:
- Devrait avoir **10 documents**
- Chaque document doit avoir:
  - `code`: (ex: "SC")
  - `nameFr`: (ex: "Sciences Expérimentales")
  - `nameAr`: (ex: "علوم تجريبية")
  - `levelCode`: (ex: "2BAC")
  - `order`: nombre
  - `enabled`: boolean
  - `createdAt`, `updatedAt`: timestamps

## 📊 Résultats Attendus

### ✅ Checklist Finale

- [ ] Panel admin accessible avec identifiants admin
- [ ] Onglet "Structure Académique" visible et cliquable
- [ ] 3 niveaux affichés correctement
- [ ] Chaque niveau peut être développé/replié
- [ ] **10 branches visibles** sous leurs niveaux respectifs
- [ ] Modal d'édition de branche fonctionne
- [ ] Modal d'ajout de branche fonctionne
- [ ] Suppression de branche fonctionne
- [ ] Les classes sont visibles sous les branches
- [ ] Les matières sont affichées en section séparée
- [ ] Aucune erreur dans la console
- [ ] Données correctes dans Firestore

## 🐛 Problèmes Possibles

### Branches n'apparaissent pas
**Solutions**:
1. Vérifier la console pour les erreurs
2. Vérifier que Firestore contient bien 10 documents dans `branches`
3. Vérifier les règles de sécurité Firestore
4. Rafraîchir la page (Ctrl+F5)

### Modal ne s'ouvre pas
**Solutions**:
1. Vérifier la console pour les erreurs JavaScript
2. Vérifier que le bouton "Éditer" est bien cliquable
3. Essayer avec un autre navigateur

### Erreur de permission
**Solutions**:
1. Vérifier que vous êtes bien connecté en tant qu'admin
2. Vérifier que le profil admin a `role: 'admin'` dans Firestore
3. Exécuter: `node check-admin-role.js`

## 📸 Captures d'Écran Attendues

### Vue Générale
```
┌─────────────────────────────────────────────────┐
│ Structure Académique                            │
├─────────────────────────────────────────────────┤
│ 📚 Tronc Commun                        [➕ ✏️]  │
│   🌿 Sciences (SC)                     [✏️ 🗑️] │
│     🎓 TC-SC-1: Tronc Commun...       [✏️ 🗑️] │
│     🎓 TC-SC-2: Tronc Commun...       [✏️ 🗑️] │
│   🌿 Lettres (LET)                     [✏️ 🗑️] │
│                                                  │
│ 📚 1ère Baccalauréat                   [➕ ✏️]  │
│   🌿 Sciences Expérimentales (SC)      [✏️ 🗑️] │
│   🌿 Sciences Mathématiques (MATH)     [✏️ 🗑️] │
│   🌿 Sciences Économiques (ECO)        [✏️ 🗑️] │
│   🌿 Lettres (LET)                     [✏️ 🗑️] │
│                                                  │
│ 📚 2ème Baccalauréat                   [➕ ✏️]  │
│   🌿 Sciences Expérimentales (SC)      [✏️ 🗑️] │
│   🌿 Sciences Mathématiques (MATH)     [✏️ 🗑️] │
│   🌿 Sciences Économiques (ECO)        [✏️ 🗑️] │
│   🌿 Lettres (LET)                     [✏️ 🗑️] │
└─────────────────────────────────────────────────┘
```

## 🎯 Conclusion

Si tous les tests sont ✅, alors:
- Les branches sont **visibles** dans l'admin panel
- Les branches sont **modifiables** (édition, ajout, suppression)
- La structure hiérarchique fonctionne correctement
- L'intégration Firestore est opérationnelle

---

**URL Admin**: https://5175-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/login
**Identifiants**: `superadmin@eduplatform.ma` / `SuperAdmin@2025!Secure`
**Onglet à vérifier**: "Structure Académique"
