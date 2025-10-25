# 🏫 Structure Complète du Lycée - Guide de Configuration

## 📋 Vue d'Ensemble

**Total**: 3 Niveaux → 8 Filières → 22 Classes

---

## 🎓 Structure Détaillée

### 1️⃣ **Tronc Commun (TC)** - 8 Classes

#### Type 1: **Sciences et Technologie (SF)** - 6 Classes
```
✅ TC-SF-1: Tronc Commun Sciences et Technologie - Classe 1
✅ TC-SF-2: Tronc Commun Sciences et Technologie - Classe 2
✅ TC-SF-3: Tronc Commun Sciences et Technologie - Classe 3
✅ TC-SF-4: Tronc Commun Sciences et Technologie - Classe 4
✅ TC-SF-5: Tronc Commun Sciences et Technologie - Classe 5
✅ TC-SF-6: Tronc Commun Sciences et Technologie - Classe 6
```

#### Type 2: **Lettres et Sciences Humaines (LSHF)** - 2 Classes
```
✅ TC-LSHF-1: Tronc Commun Lettres et Sciences Humaines - Classe 1
✅ TC-LSHF-2: Tronc Commun Lettres et Sciences Humaines - Classe 2
```

---

### 2️⃣ **1ère Baccalauréat (1BAC)** - 6 Classes

#### Type 1: **Sciences Expérimentales (SCEX)** - 2 Classes
```
✅ 1BAC-SCEX-1: 1ère Bac Sciences Expérimentales - Classe 1
✅ 1BAC-SCEX-2: 1ère Bac Sciences Expérimentales - Classe 2
```

#### Type 2: **Lettres (LET)** - 2 Classes
```
✅ 1BAC-LET-1: 1ère Bac Lettres - Classe 1
✅ 1BAC-LET-2: 1ère Bac Lettres - Classe 2
```

#### Type 3: **Mathématiques (MATH)** - 2 Classes
```
✅ 1BAC-MATH-1: 1ère Bac Mathématiques - Classe 1
✅ 1BAC-MATH-2: 1ère Bac Mathématiques - Classe 2
```

---

### 3️⃣ **2ème Baccalauréat (2BAC)** - 6 Classes

#### Type 1: **Mathématiques (MATH)** - 2 Classes
```
✅ 2BAC-MATH-1: 2ème Bac Mathématiques - Classe 1
✅ 2BAC-MATH-2: 2ème Bac Mathématiques - Classe 2
```

#### Type 2: **Physique-Chimie (PC)** - 2 Classes
```
✅ 2BAC-PC-1: 2ème Bac Physique-Chimie - Classe 1
✅ 2BAC-PC-2: 2ème Bac Physique-Chimie - Classe 2
```

#### Type 3: **Lettres (LET)** - 2 Classes
```
✅ 2BAC-LET-1: 2ème Bac Lettres - Classe 1
✅ 2BAC-LET-2: 2ème Bac Lettres - Classe 2
```

---

## 🛠️ MÉTHODE 1: Configuration Manuelle (Admin Panel)

### Étape 1: Créer les Filières Manquantes

Votre admin panel a déjà certaines filières, mais il manque:

#### Pour Tronc Commun (TC):
1. **SF (Sciences et Technologie)**
   - Nom FR: `Sciences et Technologie`
   - Nom AR: `علوم وتكنولوجيا`
   - Code: `SF`
   
2. **LSHF (Lettres et Sciences Humaines)**
   - Nom FR: `Lettres et Sciences Humaines`
   - Nom AR: `آداب وعلوم إنسانية`
   - Code: `LSHF`

#### Pour 1ère BAC:
3. **SCEX (Sciences Expérimentales)**
   - Nom FR: `Sciences Expérimentales`
   - Nom AR: `علوم تجريبية`
   - Code: `SCEX`

4. **LET (Lettres)**
   - Nom FR: `Lettres`
   - Nom AR: `آداب`
   - Code: `LET`

5. **MATH (Mathématiques)**
   - Nom FR: `Mathématiques`
   - Nom AR: `رياضيات`
   - Code: `MATH`

#### Pour 2ème BAC:
6. **MATH (Mathématiques)**
   - Nom FR: `Mathématiques`
   - Nom AR: `رياضيات`
   - Code: `MATH`

7. **PC (Physique-Chimie)**
   - Nom FR: `Physique-Chimie`
   - Nom AR: `فيزياء وكيمياء`
   - Code: `PC`

8. **LET (Lettres)**
   - Nom FR: `Lettres`
   - Nom AR: `آداب`
   - Code: `LET`

### Étape 2: Créer Toutes les Classes

Pour chaque filière ci-dessus, créer les classes correspondantes en utilisant le bouton "➕ Ajouter Classe".

**Important**: Avec le bug corrigé, les classes seront maintenant créées avec le bon `levelCode` en MAJUSCULES ✅

---

## 🤖 MÉTHODE 2: Script Automatique (Recommandé)

### Option A: Via Firebase Console (Plus Sûr)

1. **Aller sur Firebase Console**: https://console.firebase.google.com
2. **Sélectionner votre projet**: `eduinfor-fff3d`
3. **Aller dans Firestore Database**
4. **Importer les données**:
   - Utilisez l'option d'import/export
   - Ou copiez-collez manuellement depuis le script

### Option B: Déployer les Règles Temporaires

Je peux créer des règles Firestore temporaires qui permettent les écritures publiques pendant 1 heure pour exécuter le script, puis les révoquer.

**Voulez-vous que je fasse cela?**

---

## 📊 Statistiques de la Structure

```
📚 Niveaux:           3
🌿 Filières:          8
🏫 Classes:          22

Détails:
• Tronc Commun:      8 classes (SF: 6, LSHF: 2)
• 1ère BAC:          6 classes (SCEX: 2, LET: 2, MATH: 2)
• 2ème BAC:          6 classes (MATH: 2, PC: 2, LET: 2)
```

---

## ✅ Vérification de la Synchronisation

### Comment Vérifier que Tout Fonctionne:

1. **Admin Panel**:
   ```
   ✅ Tous les niveaux visibles
   ✅ Toutes les filières sous leurs niveaux
   ✅ Toutes les classes sous leurs filières
   ✅ Possibilité de modifier/désactiver
   ```

2. **Page Signup**:
   ```
   ✅ Sélection de niveau → filières apparaissent
   ✅ Sélection de filière → classes apparaissent
   ✅ Total de 22 classes disponibles
   ```

3. **Base de Données (Firestore)**:
   ```
   ✅ Collection academicLevels: 3 documents
   ✅ Collection branches: 8 documents
   ✅ Collection classes: 22 documents
   ✅ Tous avec levelCode en MAJUSCULES
   ```

---

## 🔧 Dépannage

### Si les Classes n'Apparaissent Pas dans Signup:

1. **Vérifier le levelCode**:
   - Dans Firestore, ouvrir une classe
   - Vérifier que `levelCode` est en MAJUSCULES (ex: "2BAC", pas "2bac")

2. **Vérifier le branchCode**:
   - Doit correspondre exactement au code de la filière
   - Exemple: "SF", "LSHF", "SCEX", "LET", "MATH", "PC"

3. **Vérifier enabled**:
   - Doit être `true` pour que la classe soit visible

4. **Rafraîchir le Cache**:
   - Appuyer sur Ctrl+F5 ou Cmd+Shift+R
   - Ou utiliser le mode navigation privée

---

## 🚀 Prochaines Étapes

Après avoir configuré la structure:

1. **Tester le Signup**:
   - Ouvrir /signup
   - Essayer de sélectionner chaque combinaison niveau → filière → classe

2. **Créer des Cours**:
   - Les professeurs peuvent cibler des classes spécifiques
   - Les étudiants verront uniquement les cours de leur classe

3. **Assigner des Matières**:
   - Chaque professeur doit avoir UNE matière
   - Les cours héritent automatiquement de cette matière

---

## 📝 Notes Importantes

### ⚠️ Bug Corrigé
Le bug de case mismatch (level.id vs level.code) a été corrigé dans:
- `AcademicStructureManagement.jsx` ligne 801
- `AcademicStructureManagement.jsx` ligne 872

**Résultat**: Toutes les NOUVELLES classes créées auront le bon `levelCode` en MAJUSCULES ✅

### 🔄 Migration des Anciennes Données
Si vous aviez déjà des classes avec `levelCode` en minuscules:
1. Les supprimer manuellement via l'admin panel
2. Les recréer (elles auront maintenant le bon format)

---

## 💡 Besoin d'Aide?

Si vous avez besoin que je:
- ✅ Crée un script d'import automatique
- ✅ Déploie des règles temporaires
- ✅ Vérifie la structure actuelle
- ✅ Corrige des données existantes

**Dites-moi et je le ferai immédiatement!** 🚀

---

**Date de Création**: 23 Octobre 2025  
**Status**: Prêt pour Configuration  
**Bug de Case**: ✅ Corrigé
