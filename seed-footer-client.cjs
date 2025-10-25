#!/usr/bin/env node

/**
 * Script pour initialiser le contenu du footer dans Firebase (version client)
 * Collection: homepage/footer
 * 
 * Ce script upload les informations existantes du footer vers l'éditeur admin
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhp2UOv8m9y0ZW1XFRw4nBt-n-l9guedc",
  authDomain: "eduinfor-fff3d.firebaseapp.com",
  projectId: "eduinfor-fff3d",
  storageBucket: "eduinfor-fff3d.firebasestorage.app",
  messagingSenderId: "711900463609",
  appId: "1:711900463609:web:f1ad2d2cf6dcc6e3a8d5b3"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase initialized');

// Données du footer par défaut (basées sur le contenu actuel de LandingPage.jsx)
const defaultFooterContent = {
  // Section 1: À Propos de l'école
  schoolNameFr: "Lycée d'Excellence",
  schoolNameAr: "ثانوية التميز",
  descriptionFr: "Établissement d'excellence dédié à former les leaders de demain",
  descriptionAr: "مؤسسة تعليمية متميزة مكرسة لتكوين قادة الغد",
  
  // Section 2: Titre de la colonne Liens Rapides
  linksColumnTitleFr: "Liens Rapides",
  linksColumnTitleAr: "روابط سريعة",
  
  // Section 3: Titre de la colonne Contact
  contactColumnTitleFr: "Contact",
  contactColumnTitleAr: "اتصل بنا",
  
  // Section 4: Réseaux sociaux
  socialTitleFr: "Suivez-nous",
  socialTitleAr: "تابعنا",
  
  // URLs des réseaux sociaux (vides par défaut - à remplir par l'admin)
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  
  // Section 5: Copyright
  copyrightTextFr: "© 2025 Lycée d'Excellence. Tous droits réservés.",
  copyrightTextAr: "© 2025 ثانوية التميز. جميع الحقوق محفوظة.",
  
  // Métadonnées
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function seedFooter() {
  try {
    console.log('\n🚀 Début de l\'initialisation du footer...\n');
    
    // Référence au document
    const footerRef = doc(db, 'homepage', 'footer');
    
    // Vérifier si le document existe déjà
    const footerDoc = await getDoc(footerRef);
    
    if (footerDoc.exists()) {
      console.log('⚠️  Le document footer existe déjà.');
      console.log('📄 Contenu actuel:', footerDoc.data());
      console.log('⏭️  Mise à jour du contenu...\n');
    } else {
      console.log('📝 Création du nouveau document footer...\n');
    }
    
    // Uploader le contenu du footer
    await setDoc(footerRef, defaultFooterContent);
    
    console.log('✅ Footer initialisé avec succès!\n');
    console.log('📋 Contenu uploadé:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏫 Section 1 - À Propos:');
    console.log(`   FR: ${defaultFooterContent.schoolNameFr}`);
    console.log(`   AR: ${defaultFooterContent.schoolNameAr}`);
    console.log(`   Description FR: ${defaultFooterContent.descriptionFr}`);
    console.log(`   Description AR: ${defaultFooterContent.descriptionAr}`);
    console.log('');
    console.log('🔗 Section 2 - Liens Rapides:');
    console.log(`   FR: ${defaultFooterContent.linksColumnTitleFr}`);
    console.log(`   AR: ${defaultFooterContent.linksColumnTitleAr}`);
    console.log('');
    console.log('📞 Section 3 - Contact:');
    console.log(`   FR: ${defaultFooterContent.contactColumnTitleFr}`);
    console.log(`   AR: ${defaultFooterContent.contactColumnTitleAr}`);
    console.log('');
    console.log('🌐 Section 4 - Réseaux Sociaux:');
    console.log(`   Titre FR: ${defaultFooterContent.socialTitleFr}`);
    console.log(`   Titre AR: ${defaultFooterContent.socialTitleAr}`);
    console.log(`   Facebook: ${defaultFooterContent.facebookUrl || '(non configuré)'}`);
    console.log(`   Twitter: ${defaultFooterContent.twitterUrl || '(non configuré)'}`);
    console.log(`   Instagram: ${defaultFooterContent.instagramUrl || '(non configuré)'}`);
    console.log(`   YouTube: ${defaultFooterContent.youtubeUrl || '(non configuré)'}`);
    console.log(`   LinkedIn: ${defaultFooterContent.linkedinUrl || '(non configuré)'}`);
    console.log('');
    console.log('©️  Section 5 - Copyright:');
    console.log(`   FR: ${defaultFooterContent.copyrightTextFr}`);
    console.log(`   AR: ${defaultFooterContent.copyrightTextAr}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 Succès! Le footer est maintenant éditable depuis:');
    console.log('   Admin Panel → Contact & Liens → Footer');
    console.log('');
    console.log('💡 Prochaines étapes:');
    console.log('   1. Connectez-vous au panneau admin');
    console.log('   2. Allez dans "Contact & Liens" → "Footer"');
    console.log('   3. Personnalisez les textes et ajoutez vos liens sociaux');
    console.log('   4. Sauvegardez - Le footer se mettra à jour automatiquement!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du footer:', error);
    throw error;
  }
}

// Exécuter le script
seedFooter()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
