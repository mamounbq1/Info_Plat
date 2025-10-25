# 🔧 FIX: Branches Invisibles dans le Panel Admin

## 🐛 Problème Identifié

**Symptôme**: Les niveaux s'affichent dans le panel admin mais **aucune branche** n'apparaît dessous. Le message "Aucun type dans ce niveau. Ajouter un type" s'affiche pour tous les niveaux.

**Capture d'écran du problème**: Les 3 niveaux (TC, 1bac, 2BAC) affichent tous "Aucun type dans ce niveau".

## 🔍 Cause Racine

**Problème de correspondance de casse (majuscule/minuscule)**:

| Élément | Champ | Valeur | Casse |
|---------|-------|--------|-------|
| **Level** dans Firestore | `id` | "tc", "1bac", "2bac" | minuscule |
| **Level** dans Firestore | `code` | "TC", "1BAC", "2BAC" | MAJUSCULE |
| **Branch** dans Firestore | `levelCode` | "TC", "1BAC", "2BAC" | MAJUSCULE |

**Le bug**: Le composant appelait `getBranchesForLevel(level.id)` avec l'ID en minuscule ("tc"), mais les branches cherchent à correspondre avec `levelCode` en MAJUSCULE ("TC").

### Exemple du Bug

```javascript
// ❌ AVANT (bugué)
levels.map((level) => {
  const levelBranches = getBranchesForLevel(level.id);  // level.id = "tc" (minuscule)
  // ...
})

// Dans Firestore:
branches: [
  { levelCode: "TC", nameFr: "Sciences" },  // levelCode = "TC" (majuscule)
  { levelCode: "TC", nameFr: "Lettres" }
]

// Résultat: Aucune correspondance! "tc" !== "TC"
```

## ✅ Solution Appliquée

### Changement 1: Utiliser `level.code` au lieu de `level.id`

**Fichier**: `src/components/AcademicStructureManagement.jsx`

```javascript
// ✅ APRÈS (corrigé)
levels.map((level) => {
  const levelBranches = getBranchesForLevel(level.code || level.id);
  // level.code = "TC" (majuscule) → correspond à levelCode
  // ...
})
```

**Ligne modifiée**: 682

### Changement 2: Corriger les appels à `handleAddBranch`

```javascript
// ❌ AVANT
onClick={() => handleAddBranch(level.id)}  // passe "tc"

// ✅ APRÈS
onClick={() => handleAddBranch(level.code || level.id)}  // passe "TC"
```

**Lignes modifiées**: 720, 879

### Changement 3: Améliorer la fonction `getBranchesForLevel`

```javascript
const getBranchesForLevel = (levelId) => {
  // levelId peut être soit level.id (minuscule) soit level.code (majuscule)
  // branches.levelCode est toujours en majuscule (TC, 1BAC, 2BAC)
  const filtered = branches.filter(b => {
    // Correspondance directe avec levelCode
    if (b.levelCode === levelId) return true;
    // Correspondance avec level.code si levelId est level.id
    const level = levels.find(l => l.id === levelId || l.code === levelId);
    return b.levelCode === level?.code;
  });
  console.log(`📊 getBranchesForLevel(${levelId}): found ${filtered.length} branches`, 
              filtered.map(b => b.nameFr));
  return filtered;
};
```

**Améliorations**:
- Support pour les deux formats (minuscule et majuscule)
- Logging pour le débogage
- Recherche plus robuste

## 🧪 Test de la Correction

### 1. Actualiser la Page Admin

Le serveur Vite devrait avoir automatiquement rechargé la page avec HMR (Hot Module Replacement).

**Si ce n'est pas le cas**:
- Rafraîchissez manuellement la page (Ctrl+F5 ou Cmd+Shift+R)

### 2. Vérifier les Branches Apparaissent

Après actualisation, vous devriez maintenant voir:

```
TC [🔽]
  🌿 Sciences (SC) [✏️] [🗑️]
  🌿 Lettres (LET) [✏️] [🗑️]

1bac [🔽]
  🌿 Sciences Expérimentales (SC) [✏️] [🗑️]
  🌿 Sciences Mathématiques (MATH) [✏️] [🗑️]
  🌿 Sciences Économiques (ECO) [✏️] [🗑️]
  🌿 Lettres (LET) [✏️] [🗑️]

2BAC [🔽]
  🌿 Sciences Expérimentales (SC) [✏️] [🗑️]
  🌿 Sciences Mathématiques (MATH) [✏️] [🗑️]
  🌿 Sciences Économiques (ECO) [✏️] [🗑️]
  🌿 Lettres (LET) [✏️] [🗑️]
```

### 3. Vérifier la Console

Ouvrez la console du navigateur (F12) et vous devriez voir:

```javascript
📊 getBranchesForLevel(TC): found 2 branches ["Sciences", "Lettres"]
📊 getBranchesForLevel(1BAC): found 4 branches ["Sciences Expérimentales", "Sciences Mathématiques", "Sciences Économiques", "Lettres"]
📊 getBranchesForLevel(2BAC): found 4 branches ["Sciences Expérimentales", "Sciences Mathématiques", "Sciences Économiques", "Lettres"]
```

### 4. Tester l'Édition

1. Cliquez sur **✏️** à côté d'une branche
2. Le modal devrait s'ouvrir avec les données de la branche
3. Modifiez le nom
4. Sauvegardez
5. ✅ La modification devrait être visible

### 5. Tester l'Ajout

1. Cliquez sur **"Ajouter type"** sous un niveau
2. Le modal devrait s'ouvrir avec `levelCode` pré-rempli en MAJUSCULE
3. Remplissez les champs
4. Sauvegardez
5. ✅ La nouvelle branche devrait apparaître

## 📊 Résultats Attendus

### Statistiques en Haut

Les cartes statistiques devraient afficher:

| Niveaux | Types | Classes | Matières |
|---------|-------|---------|----------|
| 3 | **10** | 10 | 12 |

### Structure Hiérarchique

Chaque niveau devrait avoir ses branches:
- **TC**: 2 branches
- **1BAC**: 4 branches
- **2BAC**: 4 branches

**Total**: 10 branches visibles

## 🔄 Si le Problème Persiste

### Solution 1: Rafraîchissement Forcé
```bash
Ctrl + F5 (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Solution 2: Vider le Cache du Navigateur
1. Ouvrir DevTools (F12)
2. Clic droit sur le bouton Actualiser
3. Sélectionner "Vider le cache et actualiser"

### Solution 3: Redémarrer le Serveur
```bash
# Arrêter le serveur actuel
# Puis redémarrer
cd /home/user/webapp && npm run dev
```

### Solution 4: Vérifier les Données Firestore
```bash
cd /home/user/webapp
node check-level-branch-match.js
```

Doit afficher:
```
✅ All branches match their levels correctly!
```

## 📝 Fichiers Modifiés

| Fichier | Lignes Modifiées | Changement |
|---------|------------------|------------|
| `src/components/AcademicStructureManagement.jsx` | 682 | `level.id` → `level.code \|\| level.id` |
| `src/components/AcademicStructureManagement.jsx` | 720 | `level.id` → `level.code \|\| level.id` |
| `src/components/AcademicStructureManagement.jsx` | 879 | `level.id` → `level.code \|\| level.id` |
| `src/components/AcademicStructureManagement.jsx` | 556-565 | Fonction `getBranchesForLevel` améliorée |

## 🎯 Vérification Finale

### Checklist
- [ ] Rafraîchir la page admin (Ctrl+F5)
- [ ] Développer chaque niveau (cliquer sur la flèche)
- [ ] Vérifier que les branches apparaissent
- [ ] Vérifier la console pour les logs de débogage
- [ ] Tester l'édition d'une branche
- [ ] Tester l'ajout d'une nouvelle branche
- [ ] Vérifier que la statistique "Types" affiche 10

### Si Tout Fonctionne ✅

Vous devriez maintenant pouvoir:
- ✅ Voir les 10 branches réparties sous leurs niveaux
- ✅ Éditer les branches existantes
- ✅ Ajouter de nouvelles branches
- ✅ Supprimer des branches
- ✅ Développer/Replier les niveaux et branches

## 🚀 Prochaines Étapes

Après confirmation que les branches apparaissent:

1. **Tester le formulaire d'inscription**:
   - Les niveaux devraient apparaître
   - Les branches devraient se charger après sélection du niveau
   - Les classes devraient se charger après sélection de la branche

2. **Ajouter plus de branches** si nécessaire via l'interface admin

3. **Créer des cours** avec ciblage par classes

---

**Date**: 2025-10-22
**Statut**: ✅ FIX APPLIQUÉ
**Action requise**: Rafraîchir la page admin pour voir les changements
