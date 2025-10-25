/**
 * Migration Script: Populate Firestore with High School Academic Levels
 * 
 * This script migrates the high school (lycée) levels from the constants file
 * to Firestore collection 'academicLevels'.
 * 
 * Includes: Tronc Commun, 1ère Bac, and 2ème Bac levels
 * 
 * Run this once to initialize the levels in the database.
 * After running, levels can be managed through the Admin Dashboard.
 */

import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ACADEMIC_LEVELS } from '../constants/academicLevels';

export async function migrateLevelsToFirestore() {
  try {
    console.log('🚀 Starting migration of high school (lycée) levels to Firestore...');
    
    // Check if levels already exist
    const levelsQuery = query(collection(db, 'academicLevels'));
    const snapshot = await getDocs(levelsQuery);
    
    if (snapshot.size > 0) {
      console.log(`⚠️  Found ${snapshot.size} existing levels. Skipping migration.`);
      console.log('💡 To re-migrate, delete the "academicLevels" collection first.');
      return {
        success: true,
        message: `Migration skipped: ${snapshot.size} levels already exist`,
        existingCount: snapshot.size
      };
    }
    
    // Migrate levels
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < ACADEMIC_LEVELS.length; i++) {
      const level = ACADEMIC_LEVELS[i];
      try {
        await addDoc(collection(db, 'academicLevels'), {
          id: level.id,
          fr: level.fr,
          ar: level.ar,
          category: level.category,
          order: i, // Use array index as order
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        successCount++;
        console.log(`✅ Migrated: ${level.id} - ${level.fr}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating ${level.id}:`, error);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount} levels`);
    console.log(`   ❌ Errors: ${errorCount} levels`);
    console.log(`   📝 Total: ${ACADEMIC_LEVELS.length} levels`);
    
    if (successCount === ACADEMIC_LEVELS.length) {
      console.log('\n🎉 Migration completed successfully!');
      return {
        success: true,
        message: 'Migration completed successfully',
        migratedCount: successCount
      };
    } else {
      console.log('\n⚠️  Migration completed with some errors.');
      return {
        success: false,
        message: `Migration completed with ${errorCount} errors`,
        migratedCount: successCount,
        errorCount
      };
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      message: 'Migration failed',
      error: error.message
    };
  }
}

/**
 * Helper function to check if migration is needed
 */
export async function checkMigrationStatus() {
  try {
    const levelsQuery = query(collection(db, 'academicLevels'));
    const snapshot = await getDocs(levelsQuery);
    
    return {
      hasLevels: snapshot.size > 0,
      count: snapshot.size,
      needsMigration: snapshot.size === 0
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return {
      hasLevels: false,
      count: 0,
      needsMigration: true,
      error: error.message
    };
  }
}
