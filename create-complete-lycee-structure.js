import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhp2UOv8m9y0ZW1XFRw4nBt-n-l9guedc",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "960025808439",
  appId: "1:960025808439:web:5aad744488b9a855da79b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Structure complète du lycée
const lyceeStructure = {
  levels: [
    {
      code: 'TC',
      nameFr: 'Tronc Commun',
      nameAr: 'الجذع المشترك',
      order: 1,
      enabled: true
    },
    {
      code: '1BAC',
      nameFr: '1ère Baccalauréat',
      nameAr: 'الأولى باكالوريا',
      order: 2,
      enabled: true
    },
    {
      code: '2BAC',
      nameFr: '2ème Baccalauréat',
      nameAr: 'الثانية باكالوريا',
      order: 3,
      enabled: true
    }
  ],
  
  branches: [
    // Tronc Commun
    {
      code: 'SF',
      levelCode: 'TC',
      nameFr: 'Sciences et Technologie',
      nameAr: 'علوم وتكنولوجيا',
      order: 1,
      enabled: true
    },
    {
      code: 'LSHF',
      levelCode: 'TC',
      nameFr: 'Lettres et Sciences Humaines',
      nameAr: 'آداب وعلوم إنسانية',
      order: 2,
      enabled: true
    },
    // 1ère BAC
    {
      code: 'SCEX',
      levelCode: '1BAC',
      nameFr: 'Sciences Expérimentales',
      nameAr: 'علوم تجريبية',
      order: 1,
      enabled: true
    },
    {
      code: 'LET',
      levelCode: '1BAC',
      nameFr: 'Lettres',
      nameAr: 'آداب',
      order: 2,
      enabled: true
    },
    {
      code: 'MATH',
      levelCode: '1BAC',
      nameFr: 'Mathématiques',
      nameAr: 'رياضيات',
      order: 3,
      enabled: true
    },
    // 2ème BAC
    {
      code: 'MATH',
      levelCode: '2BAC',
      nameFr: 'Mathématiques',
      nameAr: 'رياضيات',
      order: 1,
      enabled: true
    },
    {
      code: 'PC',
      levelCode: '2BAC',
      nameFr: 'Physique-Chimie',
      nameAr: 'فيزياء وكيمياء',
      order: 2,
      enabled: true
    },
    {
      code: 'LET',
      levelCode: '2BAC',
      nameFr: 'Lettres',
      nameAr: 'آداب',
      order: 3,
      enabled: true
    }
  ],
  
  classes: [
    // Tronc Commun - Sciences et Technologie (6 classes)
    {
      code: 'TC-SF-1',
      levelCode: 'TC',
      branchCode: 'SF',
      nameFr: 'Tronc Commun Sciences et Technologie - Classe 1',
      nameAr: 'الجذع المشترك علوم وتكنولوجيا - القسم 1',
      order: 1,
      enabled: true
    },
    {
      code: 'TC-SF-2',
      levelCode: 'TC',
      branchCode: 'SF',
      nameFr: 'Tronc Commun Sciences et Technologie - Classe 2',
      nameAr: 'الجذع المشترك علوم وتكنولوجيا - القسم 2',
      order: 2,
      enabled: true
    },
    {
      code: 'TC-SF-3',
      levelCode: 'TC',
      branchCode: 'SF',
      nameFr: 'Tronc Commun Sciences et Technologie - Classe 3',
      nameAr: 'الجذع المشترك علوم وتكنولوجيا - القسم 3',
      order: 3,
      enabled: true
    },
    {
      code: 'TC-SF-4',
      levelCode: 'TC',
      branchCode: 'SF',
      nameFr: 'Tronc Commun Sciences et Technologie - Classe 4',
      nameAr: 'الجذع المشترك علوم وتكنولوجيا - القسم 4',
      order: 4,
      enabled: true
    },
    {
      code: 'TC-SF-5',
      levelCode: 'TC',
      branchCode: 'SF',
      nameFr: 'Tronc Commun Sciences et Technologie - Classe 5',
      nameAr: 'الجذع المشترك علوم وتكنولوجيا - القسم 5',
      order: 5,
      enabled: true
    },
    {
      code: 'TC-SF-6',
      levelCode: 'TC',
      branchCode: 'SF',
      nameFr: 'Tronc Commun Sciences et Technologie - Classe 6',
      nameAr: 'الجذع المشترك علوم وتكنولوجيا - القسم 6',
      order: 6,
      enabled: true
    },
    
    // Tronc Commun - Lettres et Sciences Humaines (2 classes)
    {
      code: 'TC-LSHF-1',
      levelCode: 'TC',
      branchCode: 'LSHF',
      nameFr: 'Tronc Commun Lettres et Sciences Humaines - Classe 1',
      nameAr: 'الجذع المشترك آداب وعلوم إنسانية - القسم 1',
      order: 1,
      enabled: true
    },
    {
      code: 'TC-LSHF-2',
      levelCode: 'TC',
      branchCode: 'LSHF',
      nameFr: 'Tronc Commun Lettres et Sciences Humaines - Classe 2',
      nameAr: 'الجذع المشترك آداب وعلوم إنسانية - القسم 2',
      order: 2,
      enabled: true
    },
    
    // 1ère BAC - Sciences Expérimentales (2 classes)
    {
      code: '1BAC-SCEX-1',
      levelCode: '1BAC',
      branchCode: 'SCEX',
      nameFr: '1ère Bac Sciences Expérimentales - Classe 1',
      nameAr: 'الأولى باكالوريا علوم تجريبية - القسم 1',
      order: 1,
      enabled: true
    },
    {
      code: '1BAC-SCEX-2',
      levelCode: '1BAC',
      branchCode: 'SCEX',
      nameFr: '1ère Bac Sciences Expérimentales - Classe 2',
      nameAr: 'الأولى باكالوريا علوم تجريبية - القسم 2',
      order: 2,
      enabled: true
    },
    
    // 1ère BAC - Lettres (2 classes)
    {
      code: '1BAC-LET-1',
      levelCode: '1BAC',
      branchCode: 'LET',
      nameFr: '1ère Bac Lettres - Classe 1',
      nameAr: 'الأولى باكالوريا آداب - القسم 1',
      order: 1,
      enabled: true
    },
    {
      code: '1BAC-LET-2',
      levelCode: '1BAC',
      branchCode: 'LET',
      nameFr: '1ère Bac Lettres - Classe 2',
      nameAr: 'الأولى باكالوريا آداب - القسم 2',
      order: 2,
      enabled: true
    },
    
    // 1ère BAC - Mathématiques (2 classes)
    {
      code: '1BAC-MATH-1',
      levelCode: '1BAC',
      branchCode: 'MATH',
      nameFr: '1ère Bac Mathématiques - Classe 1',
      nameAr: 'الأولى باكالوريا رياضيات - القسم 1',
      order: 1,
      enabled: true
    },
    {
      code: '1BAC-MATH-2',
      levelCode: '1BAC',
      branchCode: 'MATH',
      nameFr: '1ère Bac Mathématiques - Classe 2',
      nameAr: 'الأولى باكالوريا رياضيات - القسم 2',
      order: 2,
      enabled: true
    },
    
    // 2ème BAC - Mathématiques (2 classes)
    {
      code: '2BAC-MATH-1',
      levelCode: '2BAC',
      branchCode: 'MATH',
      nameFr: '2ème Bac Mathématiques - Classe 1',
      nameAr: 'الثانية باكالوريا رياضيات - القسم 1',
      order: 1,
      enabled: true
    },
    {
      code: '2BAC-MATH-2',
      levelCode: '2BAC',
      branchCode: 'MATH',
      nameFr: '2ème Bac Mathématiques - Classe 2',
      nameAr: 'الثانية باكالوريا رياضيات - القسم 2',
      order: 2,
      enabled: true
    },
    
    // 2ème BAC - Physique-Chimie (2 classes)
    {
      code: '2BAC-PC-1',
      levelCode: '2BAC',
      branchCode: 'PC',
      nameFr: '2ème Bac Physique-Chimie - Classe 1',
      nameAr: 'الثانية باكالوريا فيزياء وكيمياء - القسم 1',
      order: 1,
      enabled: true
    },
    {
      code: '2BAC-PC-2',
      levelCode: '2BAC',
      branchCode: 'PC',
      nameFr: '2ème Bac Physique-Chimie - Classe 2',
      nameAr: 'الثانية باكالوريا فيزياء وكيمياء - القسم 2',
      order: 2,
      enabled: true
    },
    
    // 2ème BAC - Lettres (2 classes)
    {
      code: '2BAC-LET-1',
      levelCode: '2BAC',
      branchCode: 'LET',
      nameFr: '2ème Bac Lettres - Classe 1',
      nameAr: 'الثانية باكالوريا آداب - القسم 1',
      order: 1,
      enabled: true
    },
    {
      code: '2BAC-LET-2',
      levelCode: '2BAC',
      branchCode: 'LET',
      nameFr: '2ème Bac Lettres - Classe 2',
      nameAr: 'الثانية باكالوريا آداب - القسم 2',
      order: 2,
      enabled: true
    }
  ]
};

async function deleteAllExistingData() {
  console.log('🗑️  Suppression de toutes les données existantes...\n');
  
  // Delete all classes
  const classesSnapshot = await getDocs(collection(db, 'classes'));
  console.log(`   Suppression de ${classesSnapshot.size} classes...`);
  for (const docSnapshot of classesSnapshot.docs) {
    await deleteDoc(doc(db, 'classes', docSnapshot.id));
  }
  
  // Delete all branches
  const branchesSnapshot = await getDocs(collection(db, 'branches'));
  console.log(`   Suppression de ${branchesSnapshot.size} filières...`);
  for (const docSnapshot of branchesSnapshot.docs) {
    await deleteDoc(doc(db, 'branches', docSnapshot.id));
  }
  
  // Delete all levels
  const levelsSnapshot = await getDocs(collection(db, 'academicLevels'));
  console.log(`   Suppression de ${levelsSnapshot.size} niveaux...`);
  for (const docSnapshot of levelsSnapshot.docs) {
    await deleteDoc(doc(db, 'academicLevels', docSnapshot.id));
  }
  
  console.log('✅ Toutes les données existantes supprimées\n');
}

async function createCompleteStructure() {
  console.log('🎓 CRÉATION DE LA STRUCTURE COMPLÈTE DU LYCÉE\n');
  console.log('='.repeat(80) + '\n');
  
  try {
    // Supprimer les anciennes données
    await deleteAllExistingData();
    
    // 1. Créer les niveaux
    console.log('📚 ÉTAPE 1: Création des Niveaux');
    console.log('-'.repeat(80));
    for (const level of lyceeStructure.levels) {
      const docRef = await addDoc(collection(db, 'academicLevels'), {
        ...level,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ ${level.nameFr} (${level.nameAr})`);
      console.log(`   Code: ${level.code} | ID: ${docRef.id}`);
    }
    console.log('');
    
    // 2. Créer les filières/types
    console.log('🌿 ÉTAPE 2: Création des Filières/Types');
    console.log('-'.repeat(80));
    for (const branch of lyceeStructure.branches) {
      const docRef = await addDoc(collection(db, 'branches'), {
        ...branch,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ ${branch.nameFr} (${branch.nameAr})`);
      console.log(`   Niveau: ${branch.levelCode} | Code: ${branch.code} | ID: ${docRef.id}`);
    }
    console.log('');
    
    // 3. Créer les classes
    console.log('🏫 ÉTAPE 3: Création des Classes');
    console.log('-'.repeat(80));
    
    // Grouper par niveau pour affichage
    const classesByLevel = {
      'TC': [],
      '1BAC': [],
      '2BAC': []
    };
    
    for (const classItem of lyceeStructure.classes) {
      const docRef = await addDoc(collection(db, 'classes'), {
        ...classItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      classesByLevel[classItem.levelCode].push({
        ...classItem,
        id: docRef.id
      });
    }
    
    // Afficher les classes par niveau
    for (const [levelCode, classes] of Object.entries(classesByLevel)) {
      const levelName = lyceeStructure.levels.find(l => l.code === levelCode).nameFr;
      console.log(`\n📌 ${levelName} (${levelCode}) - ${classes.length} classes:`);
      
      // Grouper par filière
      const classesByBranch = {};
      classes.forEach(cls => {
        if (!classesByBranch[cls.branchCode]) {
          classesByBranch[cls.branchCode] = [];
        }
        classesByBranch[cls.branchCode].push(cls);
      });
      
      for (const [branchCode, branchClasses] of Object.entries(classesByBranch)) {
        const branchName = lyceeStructure.branches.find(b => 
          b.code === branchCode && b.levelCode === levelCode
        ).nameFr;
        console.log(`\n   🌿 ${branchName} (${branchCode}):`);
        branchClasses.forEach(cls => {
          console.log(`      ✅ ${cls.code}: ${cls.nameFr}`);
          console.log(`         ${cls.nameAr}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 STRUCTURE COMPLÈTE CRÉÉE AVEC SUCCÈS!\n');
    
    // Statistiques finales
    console.log('📊 STATISTIQUES:');
    console.log(`   • Niveaux: ${lyceeStructure.levels.length}`);
    console.log(`   • Filières: ${lyceeStructure.branches.length}`);
    console.log(`   • Classes: ${lyceeStructure.classes.length}`);
    console.log('');
    
    // Détails par niveau
    console.log('📋 DÉTAILS PAR NIVEAU:');
    console.log(`   • Tronc Commun: ${classesByLevel.TC.length} classes`);
    console.log(`     - SF (Sciences et Technologie): 6 classes`);
    console.log(`     - LSHF (Lettres et Sciences Humaines): 2 classes`);
    console.log(`   • 1ère BAC: ${classesByLevel['1BAC'].length} classes`);
    console.log(`     - SCEX (Sciences Expérimentales): 2 classes`);
    console.log(`     - LET (Lettres): 2 classes`);
    console.log(`     - MATH (Mathématiques): 2 classes`);
    console.log(`   • 2ème BAC: ${classesByLevel['2BAC'].length} classes`);
    console.log(`     - MATH (Mathématiques): 2 classes`);
    console.log(`     - PC (Physique-Chimie): 2 classes`);
    console.log(`     - LET (Lettres): 2 classes`);
    console.log('');
    
    console.log('✅ Vous pouvez maintenant:');
    console.log('   1. Voir toutes les classes dans l\'Admin Panel');
    console.log('   2. Tester le signup avec la sélection hiérarchique');
    console.log('   3. Les étudiants peuvent choisir leur classe');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createCompleteStructure();
