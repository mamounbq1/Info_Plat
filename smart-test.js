#!/usr/bin/env node

/**
 * SMART TESTING - Works with hidden file inputs
 * File inputs are hidden but accessible via JavaScript
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
};

function log(message, emoji = '📝') {
  const timestamp = new Date().toISOString().substr(11, 8);
  console.log(`[${timestamp}] ${emoji} ${message}`);
}

async function createTestImage(filename) {
  const filePath = path.join(__dirname, 'temp', filename);
  fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
  
  // Simple 1x1 red PNG
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(filePath, buffer);
  
  return filePath;
}

async function screenshot(page, name) {
  const dir = path.join(__dirname, 'test-screenshots');
  fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: false, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  return filepath;
}

async function loginAsAdmin(page) {
  log('Logging in as temp-admin...', '🔐');
  
  await page.goto(`${config.baseUrl}/login`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  await page.fill('input[type="email"]', config.adminEmail);
  await page.fill('input[type="password"]', config.adminPassword);
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(5000);
  
  if (page.url().includes('/admin') || page.url().includes('/dashboard')) {
    log('✅ Login successful!', '✅');
    return true;
  }
  
  log('❌ Login failed', '❌');
  return false;
}

async function testGalleryUpload(page) {
  log('\n=== Testing Gallery Manager ===', '🧪');
  
  try {
    await page.goto(`${config.baseUrl}/admin/gallery`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    log('Gallery page loaded');
    await screenshot(page, 'gallery-before');
    
    // Find ALL file inputs (even hidden ones)
    const fileInputCount = await page.locator('input[type="file"]').count();
    log(`Found ${fileInputCount} file input(s)`);
    
    if (fileInputCount > 0) {
      const imagePath = await createTestImage('gallery-test.png');
      
      // Use setInputFiles which works even on hidden inputs
      await page.locator('input[type="file"]').first().setInputFiles(imagePath);
      log('✓ File set to input');
      
      // Wait for upload (look for image in Firebase URL or preview)
      await page.waitForTimeout(5000);
      
      // Check if upload succeeded by looking for Firebase Storage URLs or success message
      const pageContent = await page.content();
      const hasFirebaseUrl = pageContent.includes('firebasestorage.googleapis.com');
      const hasSuccessMsg = pageContent.toLowerCase().includes('success') || 
                           pageContent.toLowerCase().includes('succès') ||
                           pageContent.includes('تم');
      
      if (hasFirebaseUrl || hasSuccessMsg) {
        log('✅ GALLERY UPLOAD SUCCESS!', '✅');
        await screenshot(page, 'gallery-after-success');
        fs.unlinkSync(imagePath);
        return true;
      } else {
        log('⚠️  Upload completed but no confirmation', '⚠️');
        await screenshot(page, 'gallery-after');
        fs.unlinkSync(imagePath);
        return false;
      }
    }
    
    log('❌ No file input found', '❌');
    return false;
    
  } catch (error) {
    log(`❌ Gallery error: ${error.message}`, '❌');
    return false;
  }
}

async function testAboutUpload(page) {
  log('\n=== Testing About Manager ===', '🧪');
  
  try {
    await page.goto(`${config.baseUrl}/admin/about`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    log('About page loaded');
    await screenshot(page, 'about-before');
    
    const fileInputCount = await page.locator('input[type="file"]').count();
    log(`Found ${fileInputCount} file input(s)`);
    
    if (fileInputCount > 0) {
      const imagePath = await createTestImage('about-test.png');
      await page.locator('input[type="file"]').first().setInputFiles(imagePath);
      log('✓ File set to input');
      
      await page.waitForTimeout(5000);
      
      // Try to save
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Save")').first();
      if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveBtn.click();
        log('✓ Clicked save button');
        await page.waitForTimeout(3000);
        
        const pageContent = await page.content();
        const hasSuccess = pageContent.toLowerCase().includes('success') ||
                          pageContent.toLowerCase().includes('succès') ||
                          pageContent.toLowerCase().includes('enregistré');
        
        if (hasSuccess) {
          log('✅ ABOUT IMAGE SAVED!', '✅');
          await screenshot(page, 'about-after-success');
          fs.unlinkSync(imagePath);
          return true;
        }
      }
      
      log('⚠️  Save button not found or no confirmation', '⚠️');
      await screenshot(page, 'about-after');
      fs.unlinkSync(imagePath);
      return false;
    }
    
    log('❌ No file input found', '❌');
    return false;
    
  } catch (error) {
    log(`❌ About error: ${error.message}`, '❌');
    return false;
  }
}

async function testEventsUpload(page) {
  log('\n=== Testing Events Manager ===', '🧪');
  
  try {
    await page.goto(`${config.baseUrl}/admin/events`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    log('Events page loaded');
    await screenshot(page, 'events-before');
    
    // Look for "Add" button
    const addBtn = page.locator('button:has-text("Ajouter"), button:has-text("Add")').first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      log('✓ Clicked add event button');
      await page.waitForTimeout(2000);
      
      // Fill required fields
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await titleInput.fill('Test Event - Image Upload');
        log('✓ Filled title');
      }
      
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dateInput.fill('2025-12-15');
        log('✓ Set date');
      }
      
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await textarea.fill('Test event description for image upload testing.');
        log('✓ Filled description');
      }
      
      // Upload image
      const fileInputCount = await page.locator('input[type="file"]').count();
      if (fileInputCount > 0) {
        const imagePath = await createTestImage('event-test.png');
        await page.locator('input[type="file"]').first().setInputFiles(imagePath);
        log('✓ Image file set');
        await page.waitForTimeout(4000);
        
        // Save
        const saveBtn = page.locator('button:has-text("Enregistrer"), button[type="submit"]').first();
        if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveBtn.click();
          log('✓ Clicked save');
          await page.waitForTimeout(3000);
          
          const pageContent = await page.content();
          const hasSuccess = pageContent.toLowerCase().includes('success') ||
                            pageContent.toLowerCase().includes('succès');
          
          if (hasSuccess) {
            log('✅ EVENT WITH IMAGE SAVED!', '✅');
            await screenshot(page, 'events-after-success');
            fs.unlinkSync(imagePath);
            return true;
          }
        }
        
        await screenshot(page, 'events-after');
        fs.unlinkSync(imagePath);
      }
    }
    
    log('⚠️  Could not complete event creation', '⚠️');
    return false;
    
  } catch (error) {
    log(`❌ Events error: ${error.message}`, '❌');
    return false;
  }
}

async function testSiteSettingsUpload(page) {
  log('\n=== Testing Site Settings ===', '🧪');
  
  try {
    await page.goto(`${config.baseUrl}/admin/settings`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    log('Settings page loaded');
    await screenshot(page, 'settings-before');
    
    const fileInputCount = await page.locator('input[type="file"]').count();
    log(`Found ${fileInputCount} file input(s)`);
    
    if (fileInputCount > 0) {
      const imagePath = await createTestImage('logo-test.png');
      await page.locator('input[type="file"]').first().setInputFiles(imagePath);
      log('✓ Logo file set');
      
      await page.waitForTimeout(5000);
      
      // Save
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Save")').first();
      if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveBtn.click();
        log('✓ Clicked save settings');
        await page.waitForTimeout(3000);
        
        const pageContent = await page.content();
        const hasSuccess = pageContent.toLowerCase().includes('success') ||
                          pageContent.toLowerCase().includes('succès');
        
        if (hasSuccess) {
          log('✅ LOGO SAVED!', '✅');
          await screenshot(page, 'settings-after-success');
          fs.unlinkSync(imagePath);
          return true;
        }
      }
      
      log('⚠️  Save completed but no confirmation', '⚠️');
      await screenshot(page, 'settings-after');
      fs.unlinkSync(imagePath);
      return false;
    }
    
    log('❌ No file input found', '❌');
    return false;
    
  } catch (error) {
    log(`❌ Settings error: ${error.message}`, '❌');
    return false;
  }
}

async function checkVisitorView(page) {
  log('\n=== Checking Visitor View ===', '👁️');
  
  try {
    // Logout
    const logoutBtn = page.locator('text=/Déconnexion|Logout/i').first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    }
    
    await page.goto(config.baseUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    
    await screenshot(page, 'homepage-visitor');
    
    const pageContent = await page.content();
    
    // Count Firebase Storage images
    const firebaseImages = (pageContent.match(/firebasestorage\.googleapis\.com/g) || []).length;
    log(`Firebase Storage images found: ${firebaseImages}`);
    
    // Check specific folders
    const hasGallery = pageContent.includes('gallery');
    const hasNews = pageContent.includes('news');
    const hasEvents = pageContent.includes('events');
    const hasAbout = pageContent.includes('about');
    
    log(`Gallery images: ${hasGallery ? '✓' : '✗'}`);
    log(`News images: ${hasNews ? '✓' : '✗'}`);
    log(`Events images: ${hasEvents ? '✓' : '✗'}`);
    log(`About images: ${hasAbout ? '✓' : '✗'}`);
    
    if (firebaseImages > 0) {
      log('✅ IMAGES VISIBLE TO VISITORS!', '✅');
      return true;
    } else {
      log('⚠️  No Firebase images found', '⚠️');
      return false;
    }
    
  } catch (error) {
    log(`❌ Visitor view error: ${error.message}`, '❌');
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 SMART TESTING - HIDDEN FILE INPUT COMPATIBLE');
  console.log('='.repeat(80) + '\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Suppress console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      log(`Browser: ${msg.text()}`, '⚠️');
    }
  });
  
  const results = {};
  
  try {
    results.login = await loginAsAdmin(page);
    
    if (results.login) {
      results.gallery = await testGalleryUpload(page);
      results.about = await testAboutUpload(page);
      results.events = await testEventsUpload(page);
      results.settings = await testSiteSettingsUpload(page);
      results.visitor = await checkVisitorView(page);
    }
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, '❌');
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  const tests = [
    ['Login', results.login],
    ['Gallery Upload', results.gallery],
    ['About Image Upload', results.about],
    ['Events Upload', results.events],
    ['Settings Logo Upload', results.settings],
    ['Visitor View', results.visitor]
  ];
  
  tests.forEach(([name, result]) => {
    const status = result === true ? '✅ PASS' : result === false ? '❌ FAIL' : '⏭️  SKIP';
    console.log(`${status} - ${name}`);
  });
  
  const passed = tests.filter(([_, r]) => r === true).length;
  const total = tests.length;
  
  console.log('\n' + '='.repeat(80));
  console.log(`🎯 SCORE: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  console.log('='.repeat(80) + '\n');
  
  console.log('📸 Screenshots saved in: ./test-screenshots/');
  console.log('📝 Temp files in: ./temp/\n');
}

main().catch(console.error);
