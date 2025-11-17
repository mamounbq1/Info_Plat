/**
 * Script pour refresh les custom claims de TOUS les utilisateurs
 * 
 * Usage: node refresh-all-claims.js
 * 
 * Ce script doit être exécuté UNE FOIS après le déploiement des Cloud Functions
 * pour s'assurer que tous les users existants ont leurs custom claims définis
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
// IMPORTANT: Remplacez ce chemin par le chemin vers votre service account JSON
// Téléchargez-le depuis: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialisé avec succès');
} catch (error) {
  console.error('❌ ERREUR: Impossible de charger le service account');
  console.error('   Téléchargez votre clé depuis:');
  console.error('   Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
  console.error('   Et placez-la dans:', serviceAccountPath);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Refresh les custom claims pour un utilisateur
 */
async function refreshUserClaims(uid, data) {
  const role = data.role || 'student';
  const approved = data.approved === true;
  const status = data.status || 'pending';

  const customClaims = {
    role: role,
    approved: approved,
    status: status
  };

  try {
    await auth.setCustomUserClaims(uid, customClaims);
    return { success: true, claims: customClaims };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Script principal
 */
async function refreshAllClaims() {
  console.log('🔄 Début du refresh des custom claims...\n');

  try {
    // Récupérer tous les documents de la collection /users
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('⚠️  Aucun utilisateur trouvé dans Firestore');
      return;
    }

    console.log(`📊 ${usersSnapshot.size} utilisateurs trouvés\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Traiter chaque utilisateur
    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      const data = userDoc.data();
      
      console.log(`📝 Traitement: ${uid}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Nom: ${data.fullName || 'N/A'}`);
      console.log(`   Rôle: ${data.role || 'student'}`);
      console.log(`   Approuvé: ${data.approved || false}`);
      
      const result = await refreshUserClaims(uid, data);
      
      if (result.success) {
        console.log(`   ✅ Claims définis:`, result.claims);
        successCount++;
      } else {
        console.log(`   ❌ ERREUR:`, result.error);
        errorCount++;
        errors.push({ uid, email: data.email, error: result.error });
      }
      
      console.log(''); // Ligne vide pour lisibilité
    }

    // Résumé final
    console.log('═══════════════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📈 Total: ${usersSnapshot.size}`);
    
    if (errors.length > 0) {
      console.log('\n❌ DÉTAILS DES ERREURS:');
      errors.forEach(({ uid, email, error }) => {
        console.log(`   - ${email} (${uid}): ${error}`);
      });
    }
    
    console.log('\n✅ Refresh terminé!');
    console.log('\n💡 PROCHAINES ÉTAPES:');
    console.log('   1. Les utilisateurs doivent se déconnecter et se reconnecter');
    console.log('   2. Ou utiliser le bouton "Actualiser le token" sur /diagnostic-user');
    console.log('   3. Les nouveaux tokens auront les custom claims à jour');

  } catch (error) {
    console.error('❌ ERREUR FATALE:', error);
    process.exit(1);
  }
}

// Exécuter le script
refreshAllClaims()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Le script a échoué:', error);
    process.exit(1);
  });
