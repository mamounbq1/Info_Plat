#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration EmailJS
 * 
 * Usage: node test-email-config.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Vérification de la configuration EmailJS...\n');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^VITE_EMAILJS_(\w+)=(.+)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

console.log('📋 Variables d\'environnement détectées:\n');

// Check each required variable
const required = {
  'PUBLIC_KEY': envVars.PUBLIC_KEY,
  'SERVICE_ID': envVars.SERVICE_ID,
  'TEMPLATE_ID': envVars.TEMPLATE_ID
};

let allConfigured = true;

Object.entries(required).forEach(([key, value]) => {
  if (value && value !== 'your_' + key.toLowerCase().replace(/_/g, '_') + '_here') {
    console.log(`  ✅ VITE_EMAILJS_${key}: ${value}`);
  } else {
    console.log(`  ❌ VITE_EMAILJS_${key}: NON CONFIGURÉ`);
    allConfigured = false;
  }
});

console.log('\n' + '='.repeat(60) + '\n');

if (allConfigured) {
  console.log('✅ Configuration EmailJS complète!\n');
  console.log('🎯 Prochaines étapes:\n');
  console.log('  1. Le serveur dev a déjà redémarré automatiquement');
  console.log('  2. Allez dans Admin Dashboard → Contenu du Site → Messages');
  console.log('  3. Répondez à un message pour tester l\'envoi d\'email');
  console.log('  4. Vérifiez votre boîte mail (peut prendre 1-2 minutes)\n');
  console.log('📧 Système d\'email activé et prêt!\n');
} else {
  console.log('❌ Configuration incomplète!\n');
  console.log('Veuillez vérifier que toutes les variables sont définies dans .env\n');
}

console.log('📚 Documentation: Voir EMAIL_SYSTEM_SETUP.md\n');
