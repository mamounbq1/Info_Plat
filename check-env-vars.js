#!/usr/bin/env node

/**
 * Script to verify environment variables are present during Vercel build
 * This runs BEFORE the Vite build to ensure variables are available
 */

console.log('\n========================================');
console.log('🔍 CHECKING ENVIRONMENT VARIABLES');
console.log('========================================\n');

const requiredVars = [
  'VITE_EMAILJS_PUBLIC_KEY',
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_ID',
  'VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

let allPresent = true;
let emailjsPresent = true;

console.log('📧 EmailJS Variables:');
requiredVars.slice(0, 4).forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 15)}...` : 'NOT SET';
  console.log(`  ${status} ${varName}: ${display}`);
  if (!value) {
    allPresent = false;
    emailjsPresent = false;
  }
});

console.log('\n🔥 Firebase Variables:');
requiredVars.slice(4).forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 15)}...` : 'NOT SET';
  console.log(`  ${status} ${varName}: ${display}`);
  if (!value) allPresent = false;
});

console.log('\n========================================');
if (allPresent) {
  console.log('✅ ALL ENVIRONMENT VARIABLES PRESENT');
} else if (emailjsPresent === false) {
  console.log('❌ EMAILJS VARIABLES MISSING!');
  console.log('⚠️  Build will continue but emails will not work');
} else {
  console.log('⚠️  SOME VARIABLES MISSING');
}
console.log('========================================\n');

// Exit with 0 to allow build to continue even if vars are missing
process.exit(0);
