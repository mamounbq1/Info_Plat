import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

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

// Structure attendue
const expectedStructure = {
  branches: {
    'TC': ['SF', 'LSHF'],
    '1BAC': ['SCEX', 'LET', 'MATH'],
    '2BAC': ['MATH', 'PC', 'LET']
  },
  classesPerBranch: {
    'TC-SF': 6,
    'TC-LSHF': 2,
    '1BAC-SCEX': 2,
    '1BAC-LET': 2,
    '1BAC-MATH': 2,
    '2BAC-MATH': 2,
    '2BAC-PC': 2,
    '2BAC-LET': 2
  }
};

async function verifyStructure() {
  console.log('🔍 VÉRIFICATION DE LA STRUCTURE DU LYCÉE\n');
  console.log('='.repeat(80) + '\n');
  
  try {
    // 1. Vérifier les niveaux
    console.log('📚 ÉTAPE 1: Vérification des Niveaux');
    console.log('-'.repeat(80));
    const levelsSnapshot = await getDocs(query(collection(db, 'academicLevels'), orderBy('order')));
    const levels = levelsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Niveaux trouvés: ${levels.length}/3`);
    const expectedLevels = ['TC', '1BAC', '2BAC'];
    levels.forEach(level => {
      const status = expectedLevels.includes(level.code) ? '✅' : '⚠️';
      console.log(`${status} ${level.code}: ${level.nameFr} (${level.nameAr})`);
    });
    
    const missingLevels = expectedLevels.filter(code => 
      !levels.find(l => l.code === code)
    );
    if (missingLevels.length > 0) {
      console.log(`❌ Niveaux manquants: ${missingLevels.join(', ')}`);
    }
    console.log('');
    
    // 2. Vérifier les filières
    console.log('🌿 ÉTAPE 2: Vérification des Filières');
    console.log('-'.repeat(80));
    const branchesSnapshot = await getDocs(query(collection(db, 'branches'), orderBy('levelCode'), orderBy('order')));
    const branches = branchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Filières trouvées: ${branches.length}/8\n`);
    
    for (const [levelCode, expectedBranchCodes] of Object.entries(expectedStructure.branches)) {
      const levelName = levels.find(l => l.code === levelCode)?.nameFr || levelCode;
      console.log(`📌 ${levelName} (${levelCode}):`);
      
      const levelBranches = branches.filter(b => b.levelCode === levelCode);
      console.log(`   Trouvées: ${levelBranches.length}/${expectedBranchCodes.length}`);
      
      expectedBranchCodes.forEach(code => {
        const branch = levelBranches.find(b => b.code === code);
        if (branch) {
          console.log(`   ✅ ${code}: ${branch.nameFr} (${branch.nameAr})`);
        } else {
          console.log(`   ❌ MANQUANT: ${code}`);
        }
      });
      console.log('');
    }
    
    // 3. Vérifier les classes
    console.log('🏫 ÉTAPE 3: Vérification des Classes');
    console.log('-'.repeat(80));
    const classesSnapshot = await getDocs(query(collection(db, 'classes'), orderBy('levelCode'), orderBy('branchCode'), orderBy('order')));
    const classes = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Classes trouvées: ${classes.length}/22\n`);
    
    let totalExpected = 0;
    let totalFound = 0;
    const missingClasses = [];
    
    for (const [key, expectedCount] of Object.entries(expectedStructure.classesPerBranch)) {
      const [levelCode, branchCode] = key.split('-');
      const levelName = levels.find(l => l.code === levelCode)?.nameFr || levelCode;
      const branchName = branches.find(b => b.levelCode === levelCode && b.code === branchCode)?.nameFr || branchCode;
      
      const branchClasses = classes.filter(c => 
        c.levelCode === levelCode && c.branchCode === branchCode
      );
      
      totalExpected += expectedCount;
      totalFound += branchClasses.length;
      
      const status = branchClasses.length === expectedCount ? '✅' : '⚠️';
      console.log(`${status} ${levelName} → ${branchName}:`);
      console.log(`   Trouvées: ${branchClasses.length}/${expectedCount}`);
      
      if (branchClasses.length > 0) {
        branchClasses.forEach(cls => {
          const caseStatus = cls.levelCode === cls.levelCode.toUpperCase() ? '✅' : '❌';
          console.log(`      ${caseStatus} ${cls.code}: ${cls.nameFr}`);
          if (cls.levelCode !== cls.levelCode.toUpperCase()) {
            console.log(`         ⚠️  ATTENTION: levelCode en minuscules "${cls.levelCode}"`);
          }
        });
      }
      
      if (branchClasses.length < expectedCount) {
        const missing = expectedCount - branchClasses.length;
        console.log(`      ❌ ${missing} classe(s) manquante(s)`);
        for (let i = branchClasses.length + 1; i <= expectedCount; i++) {
          missingClasses.push(`${levelCode}-${branchCode}-${i}`);
        }
      }
      console.log('');
    }
    
    // 4. Résumé
    console.log('='.repeat(80));
    console.log('📊 RÉSUMÉ GLOBAL\n');
    
    const levelsOk = levels.length === 3;
    const branchesOk = branches.length === 8;
    const classesOk = classes.length === 22;
    
    console.log(`Niveaux:   ${levels.length}/3    ${levelsOk ? '✅' : '❌'}`);
    console.log(`Filières:  ${branches.length}/8    ${branchesOk ? '✅' : '❌'}`);
    console.log(`Classes:   ${classes.length}/22   ${classesOk ? '✅' : '❌'}`);
    console.log('');
    
    // 5. Problèmes de casse
    console.log('🔍 VÉRIFICATION DE LA CASSE (MAJUSCULES/MINUSCULES)\n');
    const caseProblemClasses = classes.filter(c => c.levelCode !== c.levelCode.toUpperCase());
    if (caseProblemClasses.length > 0) {
      console.log(`❌ ${caseProblemClasses.length} classe(s) avec levelCode en minuscules:`);
      caseProblemClasses.forEach(cls => {
        console.log(`   • ${cls.code}: levelCode="${cls.levelCode}" (devrait être "${cls.levelCode.toUpperCase()}")`);
      });
      console.log('\n⚠️  CES CLASSES NE SERONT PAS VISIBLES DANS LE SIGNUP FORM!');
      console.log('💡 Solution: Supprimer et recréer ces classes via l\'admin panel\n');
    } else {
      console.log('✅ Toutes les classes ont le bon format de levelCode\n');
    }
    
    // 6. Actions recommandées
    if (!levelsOk || !branchesOk || !classesOk || caseProblemClasses.length > 0) {
      console.log('🛠️  ACTIONS RECOMMANDÉES:\n');
      
      if (missingLevels.length > 0) {
        console.log('1. Créer les niveaux manquants via l\'admin panel:');
        missingLevels.forEach(code => {
          console.log(`   - ${code}`);
        });
        console.log('');
      }
      
      if (branches.length < 8) {
        console.log('2. Créer les filières manquantes via l\'admin panel');
        console.log('   Voir STRUCTURE_LYCEE_COMPLETE.md pour les détails\n');
      }
      
      if (classes.length < 22 || missingClasses.length > 0) {
        console.log('3. Créer les classes manquantes:');
        console.log(`   Total manquant: ${22 - classes.length} classes`);
        if (missingClasses.length > 0 && missingClasses.length <= 10) {
          missingClasses.forEach(code => {
            console.log(`   - ${code}`);
          });
        }
        console.log('');
      }
      
      if (caseProblemClasses.length > 0) {
        console.log('4. PRIORITÉ: Corriger les classes avec mauvais levelCode:');
        caseProblemClasses.forEach(cls => {
          console.log(`   - Supprimer "${cls.code}" et le recréer`);
        });
        console.log('');
      }
    } else {
      console.log('🎉 STRUCTURE COMPLÈTE ET CORRECTE!\n');
      console.log('✅ Vous pouvez maintenant:');
      console.log('   1. Tester le signup avec toutes les combinaisons');
      console.log('   2. Créer des cours ciblant des classes spécifiques');
      console.log('   3. Les étudiants peuvent s\'inscrire dans leur classe\n');
    }
    
    console.log('='.repeat(80));
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

verifyStructure();
