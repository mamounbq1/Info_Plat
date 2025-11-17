#!/usr/bin/env node

/**
 * FINAL COMPREHENSIVE TEST
 * Handles modals, file inputs, and full workflow
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

function log(message, level = 'INFO') {
  const time = new Date().toISOString().substr(11, 8);
  const emoji = {
    'INFO': '📝',
    'SUCCESS': '✅',
    'ERROR': '❌',
    'WARNING': '⚠️',
    'TEST': '🧪'
  }[level] || '📝';
  console.log(`[${time}] ${emoji} ${message}`);
}

async function createTestImage(name) {
  const filePath = path.join(__dirname, 'temp', `${name}.png`);
  fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
  
  // 1x1 red PNG
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(filePath, buffer);
  
  return filePath;
}

async function screenshot(page, name) {
  const dir = path.join(__dirname, 'final-screenshots');
  fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: false });
  return filepath;
}

async function loginAsAdmin(page) {
  log('Logging in as temp-admin...', 'TEST');
  
  await page.goto(`${config.baseUrl}/login`);
  await page.waitForTimeout(2000);
  
  await page.fill('input[type="email"]', config.adminEmail);
  await page.fill('input[type="password"]', config.adminPassword);
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(5000);
  
  if (page.url().includes('/admin') || page.url().includes('/dashboard')) {
    log('Login successful!', 'SUCCESS');
    await screenshot(page, '01-login-success');
    return true;
  }
  
  log('Login failed', 'ERROR');
  return false;
}

async function testGalleryUpload(page) {
  log('\\n=== TEST: Gallery Manager ===', 'TEST');
  
  try {
    await page.goto(`${config.baseUrl}/admin/gallery`);
    await page.waitForTimeout(3000);
    await screenshot(page, '02-gallery-page');
    
    // Click "Ajouter Image" button to open modal
    log('Looking for "Ajouter Image" button...');
    const addBtn = page.locator('button:has-text("Ajouter Image"), button:has-text("إضافة صورة")').first();
    
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      log('✓ Clicked add button');
      await page.waitForTimeout(2000);
      await screenshot(page, '03-gallery-modal-opened');
      
      // Now the file input should be visible in the modal
      const fileInputCount = await page.locator('input[type="file"]').count();
      log(`Found ${fileInputCount} file input(s) in modal`);
      
      if (fileInputCount > 0) {
        const imagePath = await createTestImage('gallery-test');
        await page.locator('input[type="file"]').first().setInputFiles(imagePath);
        log('✓ Image file uploaded');
        
        await page.waitForTimeout(4000);
        await screenshot(page, '04-gallery-image-uploaded');
        
        // Save the gallery item
        const saveBtn = page.locator('button:has-text("Enregistrer"), button[type="submit"]').first();
        if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveBtn.click();
          log('✓ Clicked save');
          await page.waitForTimeout(3000);
          await screenshot(page, '05-gallery-saved');
          
          log('✅ GALLERY UPLOAD COMPLETED!', 'SUCCESS');
          fs.unlinkSync(imagePath);
          return true;
        }
      }
    } else {
      log('Add button not found', 'WARNING');
    }
    
    return false;
    
  } catch (error) {
    log(`Error: ${error.message}`, 'ERROR');
    return false;
  }
}

async function testAboutUpload(page) {
  log('\\n=== TEST: About Manager ===', 'TEST');
  
  try {
    await page.goto(`${config.baseUrl}/admin/about`);
    await page.waitForTimeout(3000);
    await screenshot(page, '06-about-page');
    
    // About page should have direct file input (no modal)
    const fileInputCount = await page.locator('input[type="file"]').count();
    log(`Found ${fileInputCount} file input(s)`);
    
    if (fileInputCount > 0) {
      const imagePath = await createTestImage('about-test');
      await page.locator('input[type="file"]').first().setInputFiles(imagePath);
      log('✓ Image uploaded');
      
      await page.waitForTimeout(4000);
      await screenshot(page, '07-about-image-uploaded');
      
      // Save
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Save")').first();
      if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveBtn.click();
        log('✓ Clicked save');
        await page.waitForTimeout(3000);
        await screenshot(page, '08-about-saved');
        
        log('✅ ABOUT IMAGE SAVED!', 'SUCCESS');
        fs.unlinkSync(imagePath);
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    log(`Error: ${error.message}`, 'ERROR');
    return false;
  }
}

async function testEventsUpload(page) {
  log('\\n=== TEST: Events Manager ===', 'TEST');
  
  try {
    await page.goto(`${config.baseUrl}/admin/events`);
    await page.waitForTimeout(3000);
    await screenshot(page, '09-events-page');
    
    // Click add event button
    const addBtn = page.locator('button:has-text("Ajouter"), button:has-text("Add")').first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      log('✓ Clicked add event');
      await page.waitForTimeout(2000);
      await screenshot(page, '10-event-modal-opened');
      
      // Fill required fields
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.fill('Test Event - Image Upload Test');
        log('✓ Filled title');
      }
      
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible().catch(() => false)) {
        await dateInput.fill('2025-12-15');
        log('✓ Set date');
      }
      
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('This is a test event to verify image upload functionality.');
        log('✓ Filled description');
      }
      
      // Upload image
      const fileInputCount = await page.locator('input[type="file"]').count();
      if (fileInputCount > 0) {
        const imagePath = await createTestImage('event-test');
        await page.locator('input[type="file"]').first().setInputFiles(imagePath);
        log('✓ Event cover image uploaded');
        
        await page.waitForTimeout(4000);
        await screenshot(page, '11-event-image-uploaded');
        
        // Save
        const saveBtn = page.locator('button:has-text("Enregistrer"), button[type="submit"]').first();
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click();
          log('✓ Clicked save');
          await page.waitForTimeout(3000);
          await screenshot(page, '12-event-saved');
          
          log('✅ EVENT WITH IMAGE SAVED!', 'SUCCESS');
          fs.unlinkSync(imagePath);
          return true;
        }
      }
    }
    
    return false;
    
  } catch (error) {
    log(`Error: ${error.message}`, 'ERROR');
    return false;
  }
}

async function testSiteSettingsUpload(page) {
  log('\\n=== TEST: Site Settings - Logo ===', 'TEST');
  
  try {
    await page.goto(`${config.baseUrl}/admin/settings`);
    await page.waitForTimeout(3000);
    await screenshot(page, '13-settings-page');
    
    const fileInputCount = await page.locator('input[type="file"]').count();
    log(`Found ${fileInputCount} file input(s)`);
    
    if (fileInputCount > 0) {
      const imagePath = await createTestImage('logo-test');
      await page.locator('input[type="file"]').first().setInputFiles(imagePath);
      log('✓ Logo uploaded');
      
      await page.waitForTimeout(4000);
      await screenshot(page, '14-settings-logo-uploaded');
      
      // Save
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Save")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        log('✓ Clicked save settings');
        await page.waitForTimeout(3000);
        await screenshot(page, '15-settings-saved');
        
        log('✅ LOGO SAVED!', 'SUCCESS');
        fs.unlinkSync(imagePath);
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    log(`Error: ${error.message}`, 'ERROR');
    return false;
  }
}

async function checkVisitorView(page) {
  log('\\n=== TEST: Visitor View ===', 'TEST');
  
  try {
    // Logout
    const logoutBtn = page.locator('text=/Déconnexion|Logout/i').first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      log('✓ Logged out');
    }
    
    // Visit homepage
    await page.goto(config.baseUrl);
    await page.waitForTimeout(5000);
    await screenshot(page, '16-homepage-visitor');
    
    // Check for images
    const allImages = await page.locator('img[src*="firebasestorage"]').count();
    log(`Firebase Storage images found: ${allImages}`);
    
    if (allImages > 0) {
      log('✅ IMAGES VISIBLE TO VISITORS!', 'SUCCESS');
      return true;
    } else {
      log('No Firebase Storage images found', 'WARNING');
      return false;
    }
    
  } catch (error) {
    log(`Error: ${error.message}`, 'ERROR');
    return false;
  }
}

async function main() {
  console.log('\\n' + '='.repeat(80));
  console.log('🚀 FINAL COMPREHENSIVE TEST - ALL 6 COMPONENTS');
  console.log('='.repeat(80) + '\\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
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
    log(`Fatal error: ${error.message}`, 'ERROR');
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('\\n' + '='.repeat(80));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(80) + '\\n');
  
  const tests = [
    ['🔐 Login', results.login],
    ['🖼️  Gallery Upload', results.gallery],
    ['📄 About Image Upload', results.about],
    ['📅 Events Upload', results.events],
    ['⚙️  Site Settings Logo', results.settings],
    ['👁️  Visitor View', results.visitor]
  ];
  
  tests.forEach(([name, result]) => {
    const status = result === true ? '✅ PASS' : result === false ? '❌ FAIL' : '⏭️  SKIP';
    console.log(`${status} ${name}`);
  });
  
  const passed = tests.filter(([_, r]) => r === true).length;
  const total = tests.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log('\\n' + '='.repeat(80));
  console.log(`🎯 FINAL SCORE: ${passed}/${total} tests passed (${percentage}%)`);
  console.log('='.repeat(80));
  
  if (passed === total) {
    console.log('\\n🎉 ALL TESTS PASSED! Image upload system is working perfectly!');
  } else if (passed >= total / 2) {
    console.log('\\n⚠️  Some tests failed. Check screenshots for details.');
  } else {
    console.log('\\n❌ Most tests failed. Review implementation and screenshots.');
  }
  
  console.log('\\n📸 Screenshots: ./final-screenshots/');
  console.log('📝 Temp files: ./temp/\\n');
}

main().catch(console.error);
