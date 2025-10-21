/**
 * Script d'initialisation des statistiques
 * Ce script crée le document stats dans Firestore avec les données par défaut
 * 
 * Usage: node init-stats.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { config } from './src/config/firebase.js';

// Initialiser Firebase
const app = initializeApp(config.firebaseConfig);
const db = getFirestore(app);

const defaultStats = {
  stats0: {
    labelFr: 'Élèves',
    labelAr: 'طلاب',
    value: '1200',
    icon: '👨‍🎓',
    order: 0
  },
  stats1: {
    labelFr: 'Enseignants',
    labelAr: 'أساتذة',
    value: '80',
    icon: '👨‍🏫',
    order: 1
  },
  stats2: {
    labelFr: 'Taux de Réussite',
    labelAr: 'معدل النجاح',
    value: '95%',
    icon: '🎓',
    order: 2
  },
  stats3: {
    labelFr: 'Clubs',
    labelAr: 'أندية',
    value: '15',
    icon: '🏆',
    order: 3
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function initializeStats() {
  try {
    console.log('📊 Initialisation des statistiques...');
    
    const statsRef = doc(db, 'homepage', 'stats');
    await setDoc(statsRef, defaultStats);
    
    console.log('✅ Statistiques initialisées avec succès!');
    console.log('📈 4 statistiques créées:');
    console.log('  - 👨‍🎓 1200 Élèves');
    console.log('  - 👨‍🏫 80 Enseignants');
    console.log('  - 🎓 95% Taux de Réussite');
    console.log('  - 🏆 15 Clubs');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initializeStats();
