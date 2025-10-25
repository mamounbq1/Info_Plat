/**
 * TEST CMS COVERAGE - Vérification complète
 * 
 * Ce script teste si tous les éléments de la page d'accueil
 * sont modifiables dans le dashboard admin
 */

const fs = require('fs');
const path = require('path');

// Lire le contenu de LandingPage.jsx
const landingPagePath = path.join(__dirname, 'src/pages/LandingPage.jsx');
const landingPageContent = fs.readFileSync(landingPagePath, 'utf-8');

// Lire le contenu de useHomeContent.js
const useHomeContentPath = path.join(__dirname, 'src/hooks/useHomeContent.js');
const useHomeContentContent = fs.readFileSync(useHomeContentPath, 'utf-8');

// Lire le contenu de HomeContentManager.jsx
const homeContentManagerPath = path.join(__dirname, 'src/components/HomeContentManager.jsx');
const homeContentManagerContent = fs.readFileSync(homeContentManagerPath, 'utf-8');

console.log('🔍 TEST DE COUVERTURE CMS - ANALYSE COMPLÈTE\n');
console.log('='.repeat(70));

// 1. Sections dans LandingPage
console.log('\n📄 SECTIONS DANS LANDINGPAGE.JSX:');
const sectionsInLanding = [
  'HeroSection',
  'UrgentAnnouncementsBar',
  'StatisticsSection',
  'AboutSection',
  'NewsSection',
  'ClubsSection',
  'GallerySection',
  'TestimonialsSection',
  'QuickLinksSection',
  'ContactSection'
];

sectionsInLanding.forEach((section, idx) => {
  const exists = landingPageContent.includes(section);
  console.log(`${idx + 1}. ${section.padEnd(30)} ${exists ? '✅' : '❌'}`);
});

// 2. Collections Firestore utilisées dans useHomeContent
console.log('\n📦 COLLECTIONS FIRESTORE DANS USEHOMECONTENT:');
const collections = [
  'homepage (hero)',
  'homepage-features',
  'homepage-news',
  'homepage-testimonials',
  'homepage-stats',
  'homepage-announcements',
  'homepage-clubs',
  'homepage-gallery',
  'homepage-quicklinks',
  'homepage-contact',
  'homepage-about'
];

collections.forEach((col, idx) => {
  const exists = useHomeContentContent.includes(col.split(' ')[0]);
  console.log(`${idx + 1}. ${col.padEnd(30)} ${exists ? '✅' : '❌'}`);
});

// 3. Managers CMS disponibles
console.log('\n🛠️  MANAGERS CMS DANS DASHBOARD ADMIN:');
const managers = [
  { name: 'Hero', section: "'hero'" },
  { name: 'Features', section: "'features'" },
  { name: 'News', section: "'news'" },
  { name: 'Testimonials', section: "'testimonials'" },
  { name: 'Stats', section: "'stats'" },
  { name: 'Announcements', section: "'announcements'" },
  { name: 'Clubs', section: "'clubs'" },
  { name: 'Gallery', section: "'gallery'" },
  { name: 'Quick Links', section: "'quicklinks'" },
  { name: 'Contact', section: "'contact'" }
];

managers.forEach((manager, idx) => {
  const exists = homeContentManagerContent.includes(`activeSection === ${manager.section}`);
  console.log(`${idx + 1}. ${manager.name.padEnd(30)} ${exists ? '✅' : '❌'}`);
});

// 4. Index Firestore nécessaires
console.log('\n🔍 VÉRIFICATION DES INDEX FIRESTORE:');
const firestoreIndexPath = path.join(__dirname, 'firestore.indexes.json');
const indexesContent = fs.readFileSync(firestoreIndexPath, 'utf-8');
const indexesJson = JSON.parse(indexesContent);

const requiredIndexes = [
  'homepage-features',
  'homepage-news',
  'homepage-announcements',
  'homepage-clubs',
  'homepage-gallery',
  'homepage-quicklinks'
];

requiredIndexes.forEach((indexName, idx) => {
  const exists = indexesJson.indexes.some(index => index.collectionGroup === indexName);
  console.log(`${idx + 1}. ${indexName.padEnd(30)} ${exists ? '✅' : '❌'}`);
});

// 5. Règles Firestore
console.log('\n🔒 VÉRIFICATION DES RÈGLES FIRESTORE:');
const rulesPath = path.join(__dirname, 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

const requiredRules = [
  'homepage/',
  'homepage-features/',
  'homepage-news/',
  'homepage-testimonials/',
  'homepage-announcements/',
  'homepage-clubs/',
  'homepage-gallery/',
  'homepage-quicklinks/'
];

requiredRules.forEach((rule, idx) => {
  const exists = rulesContent.includes(`match /${rule}`);
  console.log(`${idx + 1}. ${rule.padEnd(30)} ${exists ? '✅' : '❌'}`);
});

// RÉSUMÉ FINAL
console.log('\n' + '='.repeat(70));
console.log('\n📊 RÉSUMÉ:');

const allSections = sectionsInLanding.every(s => landingPageContent.includes(s));
const allCollections = collections.every(c => useHomeContentContent.includes(c.split(' ')[0]));
const allManagers = managers.every(m => homeContentManagerContent.includes(`activeSection === ${m.section}`));
const allIndexes = requiredIndexes.every(i => indexesJson.indexes.some(idx => idx.collectionGroup === i));
const allRules = requiredRules.every(r => rulesContent.includes(`match /${r}`));

console.log(`✅ Sections LandingPage:        ${allSections ? 'TOUTES PRÉSENTES' : '❌ MANQUANTES'}`);
console.log(`✅ Collections Firestore:       ${allCollections ? 'TOUTES PRÉSENTES' : '❌ MANQUANTES'}`);
console.log(`✅ Managers CMS:                ${allManagers ? 'TOUS PRÉSENTS' : '❌ MANQUANTS'}`);
console.log(`✅ Index Firestore:             ${allIndexes ? 'TOUS PRÉSENTS' : '❌ MANQUANTS'}`);
console.log(`✅ Règles Firestore:            ${allRules ? 'TOUTES PRÉSENTES' : '❌ MANQUANTES'}`);

// ÉLÉMENTS MANQUANTS
console.log('\n⚠️  ÉLÉMENTS POTENTIELLEMENT MANQUANTS:');
let missingCount = 0;

// Vérifier AboutSection
if (!useHomeContentContent.includes('homepage-about')) {
  console.log(`❌ Collection 'homepage-about' non trouvée dans useHomeContent`);
  missingCount++;
}

if (!homeContentManagerContent.includes("'about'")) {
  console.log(`❌ Manager 'About' non trouvé dans HomeContentManager`);
  missingCount++;
}

if (missingCount === 0) {
  console.log('✅ Aucun élément manquant détecté!');
} else {
  console.log(`\n⚠️  Total: ${missingCount} élément(s) à corriger`);
}

console.log('\n' + '='.repeat(70));
console.log('\n✅ TEST TERMINÉ!\n');
