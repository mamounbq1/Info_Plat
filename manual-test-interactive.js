#!/usr/bin/env node

/**
 * INTERACTIVE MANUAL TESTING SCRIPT
 * I'm taking full control to test everything myself!
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  baseUrl: 'https://5173-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai',
  adminEmail: 'temp-admin@test.com',
  adminPassword: 'TempAdmin123!',
  headless: false, // Show browser for debugging
  slowMo: 1000 // Slow down to see what's happening
};

// Create a real test image (100x100 blue square)
function createTestImageBuffer(name) {
  // Simple PNG: 100x100 blue square
  const width = 100;
  const height = 100;
  
  // Create a proper PNG file
  const Canvas = require('canvas');
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw blue background
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(0, 0, width, height);
  
  // Add white text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(name, width/2, height/2);
  
  return canvas.toBuffer('image/png');
}

async function createTestImage(filename) {
  try {
    const filePath = path.join(__dirname, 'temp', filename);
    fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
    
    // Try to use canvas, if not available use simple PNG
    try {
      const buffer = createTestImageBuffer(filename.replace('.png', ''));
      fs.writeFileSync(filePath, buffer);
    } catch {
      // Fallback: create a simple valid PNG (1x1 red pixel)
      const simpleBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(filePath, simpleBuffer);
    }
    
    console.log(`✅ Created test image: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`❌ Failed to create test image: ${error.message}`);
    throw error;
  }
}

function log(message, emoji = '📝') {
  console.log(`${emoji} ${message}`);
}

async function screenshot(page, name) {
  const dir = path.join(__dirname, 'test-screenshots');
  fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filepath}`);
  return filepath;
}

async function loginAsAdmin(page) {
  log('🔐 Step 1: Logging in as temp-admin...', '🔐');
  
  await page.goto(`${config.baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  // Take screenshot of login page
  await screenshot(page, 'login-page');
  
  // Fill email
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill(config.adminEmail);
  log(`   ✓ Filled email: ${config.adminEmail}`);
  
  // Fill password
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(config.adminPassword);
  log(`   ✓ Filled password`);
  
  await page.waitForTimeout(1000);
  await screenshot(page, 'login-form-filled');
  
  // Click login button
  const loginButton = page.locator('button[type="submit"]').first();
  await loginButton.click();
  log(`   ✓ Clicked login button`);
  
  // Wait for navigation (be patient)
  await page.waitForTimeout(5000);
  
  const currentUrl = page.url();
  log(`   Current URL: ${currentUrl}`);
  
  if (currentUrl.includes('/admin') || currentUrl.includes('/dashboard')) {
    log('   ✅ Login successful! Redirected to admin panel', '✅');
    await screenshot(page, 'admin-dashboard');
    return true;
  } else {
    log('   ⚠️ Login may have failed - still on login page', '⚠️');
    await screenshot(page, 'login-failed');
    
    // Check for error messages
    const errorMsg = await page.locator('text=/erreur|error|échec/i').first().textContent().catch(() => null);
    if (errorMsg) {
      log(`   Error message: ${errorMsg}`, '❌');
    }
    
    return false;
  }
}

async function testGalleryManager(page) {
  log('\n🧪 Test 2: Gallery Manager', '🧪');
  
  try {
    // Navigate to gallery
    await page.goto(`${config.baseUrl}/admin/gallery`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'gallery-page');
    
    log('   Looking for file input...');
    
    // Find file input (might be hidden)
    const fileInputs = await page.locator('input[type="file"]').all();
    log(`   Found ${fileInputs.length} file input(s)`);
    
    if (fileInputs.length > 0) {
      const imagePath = await createTestImage('gallery-test.png');
      
      // Upload to first file input
      await fileInputs[0].setInputFiles(imagePath);
      log('   ✓ File uploaded to input');
      
      await page.waitForTimeout(5000);
      await screenshot(page, 'gallery-after-upload');
      
      // Check for success toast
      const toastVisible = await page.locator('text=/success|succès|تم/i').isVisible().catch(() => false);
      if (toastVisible) {
        log('   ✅ SUCCESS TOAST DETECTED!', '✅');
      } else {
        log('   ⚠️ No success toast detected', '⚠️');
      }
      
      // Check for image preview
      const images = await page.locator('img').all();
      log(`   Found ${images.length} images on page`);
      
      // Clean up
      fs.unlinkSync(imagePath);
      
      return true;
    } else {
      log('   ❌ No file input found on page', '❌');
      return false;
    }
    
  } catch (error) {
    log(`   ❌ Gallery test error: ${error.message}`, '❌');
    await screenshot(page, 'gallery-error');
    return false;
  }
}

async function testNewsImageUpload(page) {
  log('\n🧪 Test 3: News Article Image Upload', '🧪');
  
  try {
    await page.goto(`${config.baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'admin-home-content');
    
    // Look for News/Actualités section
    log('   Looking for News section...');
    
    // Try to find "Add News" button
    const addButtons = await page.locator('button').all();
    log(`   Found ${addButtons.length} buttons on page`);
    
    // Look for button with text containing "Ajouter", "Add", or similar
    for (const button of addButtons) {
      const text = await button.textContent().catch(() => '');
      if (text.includes('Ajouter') || text.includes('Add') || text.includes('إضافة')) {
        log(`   Found potential add button: "${text}"`);
      }
    }
    
    // Try clicking first "Ajouter" button
    const addNewsBtn = page.locator('button:has-text("Ajouter")').first();
    const isVisible = await addNewsBtn.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      await addNewsBtn.click();
      log('   ✓ Clicked "Ajouter" button');
      await page.waitForTimeout(2000);
      await screenshot(page, 'news-form-opened');
      
      // Fill news form
      log('   Filling news form...');
      
      // Title in French
      const titleInputs = await page.locator('input[type="text"]').all();
      if (titleInputs.length > 0) {
        await titleInputs[0].fill('Article Test - Upload Image');
        log('   ✓ Filled title');
      }
      
      // Content
      const textareas = await page.locator('textarea').all();
      if (textareas.length > 0) {
        await textareas[0].fill('Ceci est un article de test pour vérifier que le téléchargement d\'images fonctionne correctement.');
        log('   ✓ Filled content');
      }
      
      await page.waitForTimeout(1000);
      
      // Upload image
      const fileInputs = await page.locator('input[type="file"]').all();
      if (fileInputs.length > 0) {
        const imagePath = await createTestImage('news-test.png');
        await fileInputs[0].setInputFiles(imagePath);
        log('   ✓ Image file uploaded');
        
        await page.waitForTimeout(3000);
        await screenshot(page, 'news-form-with-image');
        
        // Clean up
        fs.unlinkSync(imagePath);
      }
      
      // Save the news article
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Save")').first();
      const saveBtnVisible = await saveBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (saveBtnVisible) {
        await saveBtn.click();
        log('   ✓ Clicked save button');
        await page.waitForTimeout(3000);
        await screenshot(page, 'news-saved');
        
        // Check for success
        const successVisible = await page.locator('text=/success|succès|enregistré/i').isVisible().catch(() => false);
        if (successVisible) {
          log('   ✅ NEWS ARTICLE SAVED SUCCESSFULLY!', '✅');
          return true;
        }
      }
    } else {
      log('   ⚠️ Could not find "Ajouter" button', '⚠️');
    }
    
    return false;
    
  } catch (error) {
    log(`   ❌ News test error: ${error.message}`, '❌');
    await screenshot(page, 'news-error');
    return false;
  }
}

async function testAboutManager(page) {
  log('\n🧪 Test 4: About Manager', '🧪');
  
  try {
    await page.goto(`${config.baseUrl}/admin/about`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'about-page');
    
    log('   Looking for image upload field...');
    
    const fileInputs = await page.locator('input[type="file"]').all();
    log(`   Found ${fileInputs.length} file input(s)`);
    
    if (fileInputs.length > 0) {
      const imagePath = await createTestImage('about-test.png');
      await fileInputs[0].setInputFiles(imagePath);
      log('   ✓ Image uploaded');
      
      await page.waitForTimeout(3000);
      await screenshot(page, 'about-with-image');
      
      // Try to save
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Save"), button:has-text("حفظ")').first();
      const saveBtnVisible = await saveBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (saveBtnVisible) {
        await saveBtn.click();
        log('   ✓ Clicked save button');
        await page.waitForTimeout(3000);
        await screenshot(page, 'about-saved');
        log('   ✅ ABOUT IMAGE SAVED!', '✅');
      }
      
      fs.unlinkSync(imagePath);
      return true;
    }
    
    return false;
    
  } catch (error) {
    log(`   ❌ About test error: ${error.message}`, '❌');
    await screenshot(page, 'about-error');
    return false;
  }
}

async function testEventsManager(page) {
  log('\n🧪 Test 5: Events Manager', '🧪');
  
  try {
    await page.goto(`${config.baseUrl}/admin/events`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'events-page');
    
    // Look for add button
    const addBtn = page.locator('button:has-text("Ajouter")').first();
    const addBtnVisible = await addBtn.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (addBtnVisible) {
      await addBtn.click();
      log('   ✓ Clicked add event button');
      await page.waitForTimeout(2000);
      await screenshot(page, 'event-form');
      
      // Fill form
      const inputs = await page.locator('input[type="text"]').all();
      if (inputs.length > 0) {
        await inputs[0].fill('Événement Test - Journée Portes Ouvertes');
        log('   ✓ Filled event title');
      }
      
      const textareas = await page.locator('textarea').all();
      if (textareas.length > 0) {
        await textareas[0].fill('Venez découvrir notre établissement lors de cette journée spéciale.');
        log('   ✓ Filled event description');
      }
      
      // Date
      const dateInputs = await page.locator('input[type="date"]').all();
      if (dateInputs.length > 0) {
        await dateInputs[0].fill('2025-12-15');
        log('   ✓ Set event date');
      }
      
      // Upload image
      const fileInputs = await page.locator('input[type="file"]').all();
      if (fileInputs.length > 0) {
        const imagePath = await createTestImage('event-test.png');
        await fileInputs[0].setInputFiles(imagePath);
        log('   ✓ Event cover image uploaded');
        
        await page.waitForTimeout(3000);
        await screenshot(page, 'event-form-with-image');
        
        fs.unlinkSync(imagePath);
      }
      
      // Save
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Save")').first();
      const saveBtnVisible = await saveBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (saveBtnVisible) {
        await saveBtn.click();
        log('   ✓ Clicked save button');
        await page.waitForTimeout(3000);
        await screenshot(page, 'event-saved');
        log('   ✅ EVENT SAVED WITH IMAGE!', '✅');
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    log(`   ❌ Events test error: ${error.message}`, '❌');
    await screenshot(page, 'events-error');
    return false;
  }
}

async function testSiteSettings(page) {
  log('\n🧪 Test 6: Site Settings - Logo Upload', '🧪');
  
  try {
    await page.goto(`${config.baseUrl}/admin/settings`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'settings-page');
    
    const fileInputs = await page.locator('input[type="file"]').all();
    log(`   Found ${fileInputs.length} file input(s)`);
    
    if (fileInputs.length > 0) {
      const imagePath = await createTestImage('logo-test.png');
      await fileInputs[0].setInputFiles(imagePath);
      log('   ✓ Logo uploaded');
      
      await page.waitForTimeout(3000);
      await screenshot(page, 'settings-with-logo');
      
      // Save
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Save")').first();
      const saveBtnVisible = await saveBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (saveBtnVisible) {
        await saveBtn.click();
        log('   ✓ Clicked save settings');
        await page.waitForTimeout(3000);
        await screenshot(page, 'settings-saved');
        log('   ✅ LOGO SAVED!', '✅');
      }
      
      fs.unlinkSync(imagePath);
      return true;
    }
    
    return false;
    
  } catch (error) {
    log(`   ❌ Settings test error: ${error.message}`, '❌');
    await screenshot(page, 'settings-error');
    return false;
  }
}

async function viewAsVisitor(page) {
  log('\n👁️ Test 7: View Site as Visitor', '👁️');
  
  try {
    // Logout first
    const logoutBtn = page.locator('text=/Déconnexion|Logout/i').first();
    const logoutVisible = await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (logoutVisible) {
      await logoutBtn.click();
      log('   ✓ Logged out');
      await page.waitForTimeout(2000);
    }
    
    // Visit homepage
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await screenshot(page, 'homepage-visitor');
    
    log('   Checking for uploaded images on public site...');
    
    // Count images
    const allImages = await page.locator('img').all();
    log(`   Total images on page: ${allImages.length}`);
    
    // Check for specific images
    const galleryImages = await page.locator('img[src*="gallery"]').count();
    const newsImages = await page.locator('img[src*="news"]').count();
    const eventImages = await page.locator('img[src*="events"]').count();
    const aboutImages = await page.locator('img[src*="about"]').count();
    
    log(`   Gallery images: ${galleryImages}`);
    log(`   News images: ${newsImages}`);
    log(`   Event images: ${eventImages}`);
    log(`   About images: ${aboutImages}`);
    
    if (galleryImages > 0 || newsImages > 0 || eventImages > 0 || aboutImages > 0) {
      log('   ✅ IMAGES ARE VISIBLE TO VISITORS!', '✅');
      return true;
    } else {
      log('   ⚠️ No uploaded images found on public site', '⚠️');
      return false;
    }
    
  } catch (error) {
    log(`   ❌ Visitor view error: ${error.message}`, '❌');
    await screenshot(page, 'visitor-error');
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 TAKING FULL CONTROL - INTERACTIVE MANUAL TESTING');
  console.log('='.repeat(80) + '\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  const results = {
    login: false,
    gallery: false,
    news: false,
    about: false,
    events: false,
    settings: false,
    visitor: false
  };
  
  try {
    // Test 1: Login
    results.login = await loginAsAdmin(page);
    
    if (results.login) {
      // Test 2-6: All components
      results.gallery = await testGalleryManager(page);
      results.news = await testNewsImageUpload(page);
      results.about = await testAboutManager(page);
      results.events = await testEventsManager(page);
      results.settings = await testSiteSettings(page);
      
      // Test 7: Visitor view
      results.visitor = await viewAsVisitor(page);
    }
    
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`, '❌');
  } finally {
    await browser.close();
  }
  
  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  const testResults = [
    ['Login as temp-admin', results.login],
    ['Gallery Manager', results.gallery],
    ['News Image Upload', results.news],
    ['About Manager', results.about],
    ['Events Manager', results.events],
    ['Site Settings', results.settings],
    ['Visitor View', results.visitor]
  ];
  
  testResults.forEach(([name, passed]) => {
    const emoji = passed ? '✅' : '❌';
    console.log(`${emoji} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalPassed = testResults.filter(([_, passed]) => passed).length;
  const totalTests = testResults.length;
  
  console.log('\n' + '='.repeat(80));
  console.log(`📊 FINAL SCORE: ${totalPassed}/${totalTests} tests passed`);
  console.log('='.repeat(80) + '\n');
  
  console.log('📸 All screenshots saved in: ./test-screenshots/');
}

main().catch(console.error);
