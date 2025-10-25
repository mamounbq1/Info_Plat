import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';

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

console.log('🏫 RECRÉATION COMPLÈTE DE LA STRUCTURE DU LYCÉE\n');
console.log('='.repeat(80));
console.log('Ce script va:');
console.log('1. Supprimer TOUTES les classes existantes (incorrectes)');
console.log('2. Supprimer TOUTES les filières existantes (incorrectes)');
console.log('3. Créer les 8 BONNES filières avec les BONS codes');
console.log('4. Créer les 22 classes correctement organisées');
console.log('='.repeat(80) + '\n');

// Structure CORRECTE du lycée
const correctStructure = {
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
    // Tronc Commun - SF (6 classes)
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
    
    // Tronc Commun - LSHF (2 classes)
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
    
    // 1ère BAC - SCEX (2 classes)
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

async function recreateStructure() {
  try {
    // ÉTAPE 1: Supprimer toutes les classes existantes
    console.log('🗑️  ÉTAPE 1: Suppression de toutes les classes existantes...');
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    console.log(`   Trouvées: ${classesSnapshot.size} classes à supprimer`);
    
    for (const docSnapshot of classesSnapshot.docs) {
      const data = docSnapshot.data();
      await deleteDoc(doc(db, 'classes', docSnapshot.id));
      console.log(`   ❌ Supprimé: ${data.code || docSnapshot.id}`);
    }
    console.log('   ✅ Toutes les classes supprimées\n');
    
    // ÉTAPE 2: Supprimer toutes les filières existantes
    console.log('🗑️  ÉTAPE 2: Suppression de toutes les filières existantes...');
    const branchesSnapshot = await getDocs(collection(db, 'branches'));
    console.log(`   Trouvées: ${branchesSnapshot.size} filières à supprimer`);
    
    for (const docSnapshot of branchesSnapshot.docs) {
      const data = docSnapshot.data();
      await deleteDoc(doc(db, 'branches', docSnapshot.id));
      console.log(`   ❌ Supprimé: ${data.levelCode}-${data.code} (${data.nameFr})`);
    }
    console.log('   ✅ Toutes les filières supprimées\n');
    
    console.log('⏳ Pause de 2 secondes pour s\'assurer que Firestore est synchronisé...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ÉTAPE 3: Créer les BONNES filières
    console.log('🌿 ÉTAPE 3: Création des 8 filières CORRECTES...');
    console.log('-'.repeat(80));
    
    for (const branch of correctStructure.branches) {
      const docRef = await addDoc(collection(db, 'branches'), {
        ...branch,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ ${branch.levelCode}-${branch.code}: ${branch.nameFr}`);
      console.log(`   ${branch.nameAr}`);
      console.log(`   Document ID: ${docRef.id}`);
    }
    console.log('\n✅ 8 filières créées avec succès\n');
    
    // ÉTAPE 4: Créer les 22 classes CORRECTES
    console.log('🏫 ÉTAPE 4: Création des 22 classes CORRECTES...');
    console.log('-'.repeat(80));
    
    const classesByLevel = {
      'TC': [],
      '1BAC': [],
      '2BAC': []
    };
    
    for (const classItem of correctStructure.classes) {
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
      const levelNames = {
        'TC': 'Tronc Commun',
        '1BAC': '1ère Baccalauréat',
        '2BAC': '2ème Baccalauréat'
      };
      console.log(`\n📌 ${levelNames[levelCode]} (${levelCode}) - ${classes.length} classes:`);
      
      // Grouper par filière
      const classesByBranch = {};
      classes.forEach(cls => {
        if (!classesByBranch[cls.branchCode]) {
          classesByBranch[cls.branchCode] = [];
        }
        classesByBranch[cls.branchCode].push(cls);
      });
      
      for (const [branchCode, branchClasses] of Object.entries(classesByBranch)) {
        const branchName = correctStructure.branches.find(b => 
          b.code === branchCode && b.levelCode === levelCode
        ).nameFr;
        console.log(`\n   🌿 ${branchName} (${branchCode}):`);
        branchClasses.forEach(cls => {
          console.log(`      ✅ ${cls.code}: ${cls.nameFr}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 STRUCTURE COMPLÈTE RECRÉÉE AVEC SUCCÈS!\n');
    
    // Statistiques finales
    console.log('📊 STATISTIQUES FINALES:');
    console.log(`   • Niveaux: 3 (TC, 1BAC, 2BAC)`);
    console.log(`   • Filières: 8`);
    console.log(`   • Classes: 22`);
    console.log('');
    
    console.log('📋 RÉPARTITION:');
    console.log(`   • Tronc Commun: 8 classes`);
    console.log(`     - SF (Sciences et Technologie): 6 classes`);
    console.log(`     - LSHF (Lettres et Sciences Humaines): 2 classes`);
    console.log(`   • 1ère BAC: 6 classes`);
    console.log(`     - SCEX (Sciences Expérimentales): 2 classes`);
    console.log(`     - LET (Lettres): 2 classes`);
    console.log(`     - MATH (Mathématiques): 2 classes`);
    console.log(`   • 2ème BAC: 8 classes`);
    console.log(`     - MATH (Mathématiques): 2 classes`);
    console.log(`     - PC (Physique-Chimie): 2 classes`);
    console.log(`     - LET (Lettres): 2 classes`);
    console.log('');
    
    console.log('✅ PROCHAINES ÉTAPES:');
    console.log('   1. Rafraîchir l\'Admin Panel (Ctrl+F5)');
    console.log('   2. Vérifier que toutes les filières et classes apparaissent');
    console.log('   3. Tester le formulaire d\'inscription');
    console.log('   4. Exécuter: node verify-lycee-structure.js pour confirmer');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    console.error('\nSi l\'erreur est "PERMISSION_DENIED":');
    console.error('1. Assurez-vous que les règles Firestore permettent les écritures');
    console.error('2. Ou connectez-vous en tant qu\'admin d\'abord');
    console.error('');
    process.exit(1);
  }
}

recreateStructure();
