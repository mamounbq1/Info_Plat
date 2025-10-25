# 🔍 Analyse : Sélection de Classe pour les Élèves

## 📊 État Actuel vs État Souhaité

### ❌ État Actuel (Incomplet)

#### 1. Inscription des Élèves
**Ce qui existe** :
- ✅ Sélection du **niveau** (ex: "Tronc Commun Sciences", "1BAC Sciences", "2BAC Sciences")
- ❌ **PAS de sélection de classe spécifique** (ex: "2BAC-SC-1", "2BAC-SC-2")

**Code actuel - Signup.jsx** :
```javascript
// L'élève choisit uniquement son NIVEAU
formData = {
  fullName: '',
  email: '',
  password: '',
  role: 'student',
  level: '',  // ← Ex: "1BAC-SC", "2BAC-SC" (pas de classe spécifique)
  agreeToTerms: false
}
```

#### 2. Profil Utilisateur Stocké
**Structure Firestore - users/{userId}** :
```javascript
{
  email: "student@example.com",
  fullName: "Ahmed El Amrani",
  role: "student",
  level: "2BAC-SC",      // ← Seulement le niveau
  // ❌ Pas de champ "class" ou "classCode"
  approved: true,
  status: "active",
  progress: {},
  enrolledCourses: []
}
```

#### 3. Filtrage des Cours dans StudentDashboard
**Code actuel - StudentDashboard.jsx (ligne 38-48)** :
```javascript
// Filtrage par NIVEAU uniquement
if (userProfile?.level) {
  coursesData = coursesData.filter(course => {
    if (!course.targetLevels || course.targetLevels.length === 0) {
      return true;  // Afficher à tout le monde
    }
    // ❌ Compare le NIVEAU de l'élève avec targetLevels du cours
    return course.targetLevels.includes(userProfile.level);
  });
}
```

#### 4. Création de Cours par les Enseignants
**Code actuel - TeacherDashboard.jsx** :
```javascript
courseForm = {
  titleFr: '',
  titleAr: '',
  descriptionFr: '',
  descriptionAr: '',
  duration: '',
  subject: userProfile?.subject || '',
  targetClasses: [],  // ✅ Enseignant sélectionne des CLASSES spécifiques
  published: false
}
```

**⚠️ PROBLÈME IDENTIFIÉ** :
- Les **enseignants** créent des cours pour des **CLASSES spécifiques** (`targetClasses`)
- Les **élèves** ne choisissent qu'un **NIVEAU** (`level`)
- Le **filtrage** dans StudentDashboard utilise `targetLevels` au lieu de `targetClasses`
- **RÉSULTAT** : Les élèves voient tous les cours de leur niveau, pas uniquement ceux de leur classe !

---

## ✅ État Souhaité (À Implémenter)

### 1. Inscription : Sélection de Classe Hiérarchique

**Processus en 3 étapes** :

#### Étape 1 : Sélectionner le Niveau
```
┌─────────────────────────────────────────┐
│ Niveau Scolaire *                       │
│ ┌─────────────────────────────────────┐ │
│ │ Sélectionnez votre niveau          ▼│ │
│ └─────────────────────────────────────┘ │
│   - Tronc Commun                        │
│   - 1ère Bac                            │
│   - 2ème Bac                            │
└─────────────────────────────────────────┘
```

#### Étape 2 : Sélectionner le Type/Filière (conditionnel)
```
┌─────────────────────────────────────────┐
│ Type/Filière *                          │
│ ┌─────────────────────────────────────┐ │
│ │ Sélectionnez votre filière         ▼│ │
│ └─────────────────────────────────────┘ │
│   - Sciences                            │
│   - Sciences Mathématiques              │
│   - Lettres                             │
│   - etc.                                │
└─────────────────────────────────────────┘
```

#### Étape 3 : Sélectionner la Classe Spécifique
```
┌─────────────────────────────────────────┐
│ Classe *                                │
│ ┌─────────────────────────────────────┐ │
│ │ Sélectionnez votre classe          ▼│ │
│ └─────────────────────────────────────┘ │
│   - 2BAC-SC-1                           │
│   - 2BAC-SC-2                           │
│   - 2BAC-SC-3                           │
└─────────────────────────────────────────┘
```

### 2. Profil Utilisateur Enrichi

**Nouvelle structure Firestore - users/{userId}** :
```javascript
{
  email: "student@example.com",
  fullName: "Ahmed El Amrani",
  role: "student",
  
  // ✅ NOUVEAU : Informations de classe complètes
  class: "2BAC-SC-1",           // Code de la classe (unique)
  classNameFr: "2ème Bac Sciences - Classe 1",
  classNameAr: "الثانية باكالوريا علوم - الفصل 1",
  
  // ✅ Hiérarchie complète pour faciliter les requêtes
  levelCode: "2BAC",            // Niveau
  branchCode: "SC",             // Type/Filière
  
  // Ancien champ (optionnel, pour compatibilité)
  level: "2BAC-SC",             // Peut être gardé pour rétrocompatibilité
  
  approved: true,
  status: "active",
  progress: {},
  enrolledCourses: []
}
```

### 3. Filtrage Précis dans StudentDashboard

**Nouveau code - StudentDashboard.jsx** :
```javascript
const fetchData = async () => {
  try {
    const coursesQuery = query(
      collection(db, 'courses'),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    let coursesData = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // ✅ NOUVEAU : Filtrage par CLASSE spécifique
    if (userProfile?.class) {
      coursesData = coursesData.filter(course => {
        // Si le cours n'a pas de targetClasses, afficher à tout le monde (rétrocompatibilité)
        if (!course.targetClasses || course.targetClasses.length === 0) {
          return true;
        }
        
        // ✅ Vérifier si la classe de l'élève est dans targetClasses du cours
        return course.targetClasses.includes(userProfile.class);
      });
      
      console.log(`✅ Courses filtered for class ${userProfile.class}:`, coursesData.length);
    } else {
      console.warn('⚠️ Student has no class assigned');
    }
    
    setCourses(coursesData);
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};
```

---

## 🛠️ Fichiers à Modifier

### 1. `/src/pages/Signup.jsx`

**Modifications requises** :

#### A. Ajouter les états pour la sélection hiérarchique
```javascript
const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  
  // ✅ NOUVEAU : Hiérarchie complète
  levelCode: '',      // Ex: "2BAC"
  branchCode: '',     // Ex: "SC"
  classCode: '',      // Ex: "2BAC-SC-1"
  
  agreeToTerms: false
});

// ✅ NOUVEAU : États pour stocker les listes
const [levels, setLevels] = useState([]);
const [branches, setBranches] = useState([]);
const [classes, setClasses] = useState([]);
const [levelsLoading, setLevelsLoading] = useState(true);
```

#### B. Ajouter les fonctions de chargement
```javascript
// Charger les niveaux depuis Firestore
const fetchLevels = async () => {
  try {
    const levelsQuery = query(
      collection(db, 'academicLevels'),
      where('enabled', '==', true),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(levelsQuery);
    const levelsData = snapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));
    setLevels(levelsData);
  } catch (error) {
    console.error('Error fetching levels:', error);
  }
};

// Charger les types/filières selon le niveau choisi
const fetchBranches = async (levelCode) => {
  try {
    setBranches([]);
    setClasses([]);
    setFormData(prev => ({ ...prev, branchCode: '', classCode: '' }));
    
    const branchesQuery = query(
      collection(db, 'branches'),
      where('levelCode', '==', levelCode),
      where('enabled', '==', true),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(branchesQuery);
    const branchesData = snapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));
    setBranches(branchesData);
  } catch (error) {
    console.error('Error fetching branches:', error);
  }
};

// Charger les classes selon le niveau et le type/filière
const fetchClasses = async (levelCode, branchCode) => {
  try {
    setClasses([]);
    setFormData(prev => ({ ...prev, classCode: '' }));
    
    const classesQuery = query(
      collection(db, 'classes'),
      where('levelCode', '==', levelCode),
      where('branchCode', '==', branchCode),
      where('enabled', '==', true),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(classesQuery);
    const classesData = snapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));
    setClasses(classesData);
  } catch (error) {
    console.error('Error fetching classes:', error);
  }
};
```

#### C. Ajouter les gestionnaires de changement
```javascript
const handleLevelChange = (e) => {
  const levelCode = e.target.value;
  setFormData(prev => ({ ...prev, levelCode, branchCode: '', classCode: '' }));
  
  if (levelCode) {
    fetchBranches(levelCode);
  } else {
    setBranches([]);
    setClasses([]);
  }
};

const handleBranchChange = (e) => {
  const branchCode = e.target.value;
  setFormData(prev => ({ ...prev, branchCode, classCode: '' }));
  
  if (branchCode && formData.levelCode) {
    fetchClasses(formData.levelCode, branchCode);
  } else {
    setClasses([]);
  }
};

const handleClassChange = (e) => {
  const classCode = e.target.value;
  setFormData(prev => ({ ...prev, classCode }));
};
```

#### D. Modifier la validation dans handleSubmit
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // ✅ NOUVEAU : Validation incluant la classe
  if (!formData.fullName || !formData.email || !formData.password || 
      !formData.confirmPassword || !formData.classCode) {
    toast.error(isArabic 
      ? 'يرجى ملء جميع الحقول بما في ذلك اختيار الفصل' 
      : 'Veuillez remplir tous les champs incluant la sélection de classe'
    );
    return;
  }
  
  // ... reste de la validation
  
  try {
    // Créer le compte Firebase Auth
    const userCredential = await signup(formData.email, formData.password);
    
    // ✅ Récupérer les informations complètes de la classe
    const selectedClass = classes.find(c => c.code === formData.classCode);
    
    // ✅ Créer le profil utilisateur enrichi
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: formData.email,
      fullName: formData.fullName,
      role: 'student',
      
      // ✅ NOUVEAU : Informations de classe complètes
      class: formData.classCode,
      classNameFr: selectedClass?.nameFr || '',
      classNameAr: selectedClass?.nameAr || '',
      levelCode: formData.levelCode,
      branchCode: formData.branchCode,
      
      // Ancien champ pour compatibilité
      level: `${formData.levelCode}-${formData.branchCode}`,
      
      approved: false,
      status: 'pending',
      createdAt: new Date().toISOString(),
      progress: {},
      enrolledCourses: []
    });
    
    toast.success(isArabic 
      ? 'تم إنشاء الحساب بنجاح! في انتظار موافقة الإدارة.' 
      : 'Compte créé avec succès! En attente de validation.'
    );
    
    navigate('/login');
  } catch (error) {
    console.error('Signup error:', error);
    toast.error(error.message);
  }
};
```

#### E. Modifier le JSX - remplacer le select de niveau unique
```jsx
{/* Niveau (Level) Selection */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {isArabic ? 'المستوى الدراسي' : 'Niveau Scolaire'} <span className="text-red-500">*</span>
  </label>
  <select
    name="levelCode"
    value={formData.levelCode}
    onChange={handleLevelChange}
    required
    disabled={levelsLoading}
    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
  >
    <option value="">
      {levelsLoading 
        ? (isArabic ? 'جاري التحميل...' : 'Chargement...') 
        : (isArabic ? 'اختر المستوى' : 'Sélectionnez le niveau')
      }
    </option>
    {levels.map(level => (
      <option key={level.code} value={level.code}>
        {isArabic ? level.nameAr : level.nameFr}
      </option>
    ))}
  </select>
</div>

{/* Type/Filière (Branch) Selection - Conditionnel */}
{formData.levelCode && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {isArabic ? 'الشعبة' : 'Type/Filière'} <span className="text-red-500">*</span>
    </label>
    <select
      name="branchCode"
      value={formData.branchCode}
      onChange={handleBranchChange}
      required
      disabled={branches.length === 0}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
    >
      <option value="">
        {branches.length === 0 
          ? (isArabic ? 'لا توجد شعب متاحة' : 'Aucune filière disponible')
          : (isArabic ? 'اختر الشعبة' : 'Sélectionnez la filière')
        }
      </option>
      {branches.map(branch => (
        <option key={branch.code} value={branch.code}>
          {isArabic ? branch.nameAr : branch.nameFr}
        </option>
      ))}
    </select>
  </div>
)}

{/* Classe Selection - Conditionnel */}
{formData.branchCode && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {isArabic ? 'الفصل' : 'Classe'} <span className="text-red-500">*</span>
    </label>
    <select
      name="classCode"
      value={formData.classCode}
      onChange={handleClassChange}
      required
      disabled={classes.length === 0}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
    >
      <option value="">
        {classes.length === 0 
          ? (isArabic ? 'لا توجد فصول متاحة' : 'Aucune classe disponible')
          : (isArabic ? 'اختر الفصل' : 'Sélectionnez votre classe')
        }
      </option>
      {classes.map(classItem => (
        <option key={classItem.code} value={classItem.code}>
          {isArabic ? classItem.nameAr : classItem.nameFr}
        </option>
      ))}
    </select>
    {classes.length > 0 && (
      <p className="text-xs text-gray-500 mt-1">
        {isArabic 
          ? 'اختر الفصل الذي تدرس فيه' 
          : 'Choisissez la classe dans laquelle vous étudiez'
        }
      </p>
    )}
  </div>
)}
```

---

### 2. `/src/pages/StudentDashboard.jsx`

**Modifications requises** :

```javascript
// Ligne ~38-48 : Remplacer le filtrage par niveau par filtrage par classe
const fetchData = async () => {
  try {
    setLoading(true);
    
    const coursesQuery = query(
      collection(db, 'courses'),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    let coursesData = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // ✅ NOUVEAU : Filtrage par CLASSE de l'élève
    if (userProfile?.class) {
      coursesData = coursesData.filter(course => {
        // Rétrocompatibilité : si pas de targetClasses, afficher à tout le monde
        if (!course.targetClasses || course.targetClasses.length === 0) {
          // Fallback sur l'ancien système targetLevels si disponible
          if (course.targetLevels && course.targetLevels.length > 0 && userProfile.level) {
            return course.targetLevels.includes(userProfile.level);
          }
          return true;
        }
        
        // ✅ Filtrage principal : par classe spécifique
        return course.targetClasses.includes(userProfile.class);
      });
      
      console.log(`✅ Courses filtered for class ${userProfile.class}:`, coursesData.length);
    } else if (userProfile?.level) {
      // Fallback sur l'ancien système si pas de classe définie
      coursesData = coursesData.filter(course => {
        if (!course.targetLevels || course.targetLevels.length === 0) {
          return true;
        }
        return course.targetLevels.includes(userProfile.level);
      });
      console.log(`⚠️ Fallback: Courses filtered by level ${userProfile.level}`);
    } else {
      console.warn('⚠️ Student has no class or level assigned - showing all courses');
    }
    
    setCourses(coursesData);
  } catch (error) {
    console.error('Error fetching courses:', error);
    toast.error(isArabic ? 'خطأ في تحميل الدروس' : 'Erreur lors du chargement des cours');
  } finally {
    setLoading(false);
  }
};
```

**Ajouter affichage de la classe dans le profil** :
```jsx
{/* Welcome Section */}
<div className="bg-white rounded-xl shadow-md p-6 mb-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-2">
    {t('welcome')}, {userProfile?.fullName}!
  </h1>
  
  {/* ✅ NOUVEAU : Afficher la classe de l'élève */}
  {userProfile?.class && (
    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
      <AcademicCapIcon className="w-4 h-4 mr-1" />
      {isArabic ? userProfile.classNameAr : userProfile.classNameFr}
    </div>
  )}
  
  <p className="text-gray-600 mt-2">
    {isArabic 
      ? 'استكشف الدروس الخاصة بفصلك'
      : 'Explorez les cours de votre classe'
    }
  </p>
</div>
```

---

### 3. `/src/contexts/AuthContext.jsx`

**Modifications pour Google Sign-In** :

```javascript
// Ligne ~140-162 : Mise à jour de la création de profil pour Google Sign-In
async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      // ✅ NOUVEAU : Créer profil avec champs de classe vides (à remplir plus tard)
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        fullName: result.user.displayName || 'User',
        role: 'student',
        
        // ✅ NOUVEAU : Champs de classe (vides initialement)
        class: '',
        classNameFr: '',
        classNameAr: '',
        levelCode: '',
        branchCode: '',
        level: '',  // Ancien champ pour compatibilité
        
        approved: false,
        status: 'pending',
        createdAt: new Date().toISOString(),
        progress: {},
        enrolledCourses: [],
        photoURL: result.user.photoURL
      });
      
      // ⚠️ TODO : Rediriger vers une page de "Compléter le profil" 
      // pour choisir la classe après connexion Google
    }
    
    toast.success('Connexion Google réussie!');
    return result;
  } catch (error) {
    toast.error('Erreur lors de la connexion Google');
    throw error;
  }
}
```

---

## 🧪 Tests à Effectuer

### Test 1 : Inscription Complète avec Classe
1. Aller sur `/signup`
2. Remplir nom, email, mot de passe
3. **Sélectionner niveau** (ex: "2ème Bac")
4. **Sélectionner filière** (ex: "Sciences")
5. **Sélectionner classe** (ex: "2BAC-SC-1")
6. Soumettre le formulaire
7. **Vérifier dans Firestore** :
   ```javascript
   users/{userId} {
     class: "2BAC-SC-1",
     classNameFr: "2ème Bac Sciences - Classe 1",
     levelCode: "2BAC",
     branchCode: "SC"
   }
   ```

### Test 2 : Filtrage des Cours
1. **Admin** : Créer un cours avec `targetClasses: ["2BAC-SC-1"]`
2. **Élève 1** (classe "2BAC-SC-1") : Se connecter
3. **Vérifier** : Élève 1 voit le cours
4. **Élève 2** (classe "2BAC-SC-2") : Se connecter
5. **Vérifier** : Élève 2 ne voit PAS le cours

### Test 3 : Rétrocompatibilité
1. Élève avec ancien profil (seulement `level: "2BAC-SC"`, pas de `class`)
2. **Vérifier** : L'élève voit les cours avec `targetLevels: ["2BAC-SC"]`
3. Pas d'erreurs dans la console

---

## 📋 Checklist d'Implémentation

- [ ] Modifier `Signup.jsx` - Sélection hiérarchique (niveau → filière → classe)
- [ ] Ajouter fetchLevels(), fetchBranches(), fetchClasses()
- [ ] Ajouter handlers: handleLevelChange, handleBranchChange, handleClassChange
- [ ] Modifier le JSX avec 3 selects conditionnels
- [ ] Enrichir la création du profil utilisateur avec champs de classe
- [ ] Modifier `StudentDashboard.jsx` - Filtrage par `targetClasses`
- [ ] Ajouter fallback sur `targetLevels` pour rétrocompatibilité
- [ ] Afficher la classe dans le profil de l'élève
- [ ] Mettre à jour `AuthContext.jsx` - Google Sign-In avec champs classe
- [ ] Tester l'inscription complète
- [ ] Tester le filtrage des cours
- [ ] Tester la rétrocompatibilité

---

## 🎯 Résultat Final

Après implémentation :

1. ✅ Élèves sélectionnent leur **classe spécifique** à l'inscription
2. ✅ Profil utilisateur contient **class**, **levelCode**, **branchCode**
3. ✅ StudentDashboard filtre les cours par **targetClasses**
4. ✅ Chaque élève ne voit **QUE les cours de sa classe**
5. ✅ Rétrocompatibilité avec ancien système (targetLevels)

**STATUT ACTUEL** : ❌ **NON IMPLÉMENTÉ - À FAIRE**
