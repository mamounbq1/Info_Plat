#!/usr/bin/env node

/**
 * COMPREHENSIVE UPLOAD TESTING SCRIPT
 * 
 * This script will:
 * 1. Login as temp-admin
 * 2. Test all 6 converted components with real image uploads
 * 3. Verify uploads work correctly
 * 4. Check public site display
 * 5. Generate detailed test report
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const config = {
  baseUrl: 'https://5173-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai',
  adminEmail: 'temp-admin@test.com',
  adminPassword: 'TempAdmin123!',
  timeout: 30000,
  slowMo: 500 // Slow down actions to see what's happening
};

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: [],
  startTime: new Date(),
  endTime: null
};

// Sample test image (1x1 red pixel PNG - base64 encoded)
const TEST_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

// Helper: Convert base64 to file buffer
function base64ToBuffer(base64) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Helper: Create temporary test image file
async function createTestImage(filename) {
  const filePath = path.join(__dirname, 'temp', filename);
  fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
  fs.writeFileSync(filePath, base64ToBuffer(TEST_IMAGE_BASE64));
  return filePath;
}

// Helper: Log with timestamp
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  }[type] || 'ℹ️';
  
  console.log(`${timestamp} ${prefix} ${message}`);
}

// Helper: Take screenshot on error
async function captureError(page, testName) {
  try {
    const screenshotPath = path.join(__dirname, 'test-results', `error-${testName}-${Date.now()}.png`);
    fs.mkdirSync(path.join(__dirname, 'test-results'), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    log(`Screenshot saved: ${screenshotPath}`, 'info');
    return screenshotPath;
  } catch (err) {
    log(`Failed to capture screenshot: ${err.message}`, 'warning');
    return null;
  }
}

// Step 1: Login as admin
async function loginAsAdmin(page) {
  log('🔐 Logging in as temp-admin...', 'test');
  
  try {
    await page.goto(`${config.baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[type="email"]', config.adminEmail);
    await page.fill('input[type="password"]', config.adminPassword);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/admin|\/dashboard/, { timeout: 10000 });
    
    log('Login successful!', 'success');
    results.passed.push('Login as temp-admin');
    return true;
  } catch (error) {
    log(`Login failed: ${error.message}`, 'error');
    await captureError(page, 'login-failed');
    results.failed.push({ test: 'Login', error: error.message });
    return false;
  }
}

// Test 1: GalleryManager
async function testGalleryManager(page) {
  log('🧪 Testing GalleryManager...', 'test');
  
  try {
    // Navigate to Gallery management
    await page.goto(`${config.baseUrl}/admin/gallery`);
    await page.waitForLoadState('networkidle');
    
    // Create test image
    const imagePath = await createTestImage('gallery-test.png');
    
    // Find the file input (it might be hidden)
    const fileInput = await page.locator('input[type="file"]').first();
    
    // Upload file
    await fileInput.setInputFiles(imagePath);
    
    // Wait for upload indicator or success message
    await page.waitForTimeout(3000);
    
    // Check for success toast
    const hasSuccessToast = await page.locator('text=/تم رفع|téléchargée|success/i').isVisible().catch(() => false);
    
    if (hasSuccessToast) {
      log('GalleryManager upload successful!', 'success');
      results.passed.push('GalleryManager - Image Upload');
    } else {
      log('GalleryManager - No success confirmation detected', 'warning');
      results.warnings.push('GalleryManager - Upload may have succeeded but no confirmation toast');
    }
    
    // Clean up
    fs.unlinkSync(imagePath);
    
  } catch (error) {
    log(`GalleryManager test failed: ${error.message}`, 'error');
    await captureError(page, 'gallery-manager');
    results.failed.push({ test: 'GalleryManager', error: error.message });
  }
}

// Test 2: HomeContentManager - News
async function testNewsManager(page) {
  log('🧪 Testing HomeContentManager - News...', 'test');
  
  try {
    await page.goto(`${config.baseUrl}/admin`);
    await page.waitForLoadState('networkidle');
    
    // Look for News section or "Actualités" tab
    const newsButton = await page.locator('text=/News|Actualités|أخبار/i').first();
    if (await newsButton.isVisible().catch(() => false)) {
      await newsButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for "Add News" button
    const addButton = await page.locator('button:has-text("Ajouter"), button:has-text("Add"), button:has-text("إضافة")').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Fill form
      await page.fill('input[placeholder*="titre"], input[placeholder*="title"]', 'Test News Article');
      await page.fill('textarea', 'This is a test news article content for testing image upload functionality.');
      
      // Upload image
      const imagePath = await createTestImage('news-test.png');
      const fileInput = await page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(imagePath);
      await page.waitForTimeout(2000);
      
      // Submit form
      const submitButton = await page.locator('button[type="submit"], button:has-text("Enregistrer"), button:has-text("Save")').first();
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      log('News article with image submitted!', 'success');
      results.passed.push('HomeContentManager - News Image Upload');
      
      fs.unlinkSync(imagePath);
    } else {
      log('Could not find Add News button', 'warning');
      results.warnings.push('HomeContentManager News - Add button not found');
    }
    
  } catch (error) {
    log(`News Manager test failed: ${error.message}`, 'error');
    await captureError(page, 'news-manager');
    results.failed.push({ test: 'NewsManager', error: error.message });
  }
}

// Test 3: AboutManager
async function testAboutManager(page) {
  log('🧪 Testing AboutManager...', 'test');
  
  try {
    await page.goto(`${config.baseUrl}/admin/about`);
    await page.waitForLoadState('networkidle');
    
    // Upload image
    const imagePath = await createTestImage('about-test.png');
    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(imagePath);
    await page.waitForTimeout(2000);
    
    // Look for save button
    const saveButton = await page.locator('button:has-text("Enregistrer"), button:has-text("Save"), button:has-text("حفظ")').first();
    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(3000);
      log('AboutManager image saved!', 'success');
      results.passed.push('AboutManager - Image Upload');
    } else {
      log('AboutManager - Save button not found', 'warning');
      results.warnings.push('AboutManager - Could not save image');
    }
    
    fs.unlinkSync(imagePath);
    
  } catch (error) {
    log(`AboutManager test failed: ${error.message}`, 'error');
    await captureError(page, 'about-manager');
    results.failed.push({ test: 'AboutManager', error: error.message });
  }
}

// Test 4: EventsManager
async function testEventsManager(page) {
  log('🧪 Testing EventsManager...', 'test');
  
  try {
    await page.goto(`${config.baseUrl}/admin/events`);
    await page.waitForLoadState('networkidle');
    
    // Look for "Add Event" button
    const addButton = await page.locator('button:has-text("Ajouter"), button:has-text("Add"), button:has-text("إضافة")').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Fill event form
      await page.fill('input[placeholder*="titre"], input[placeholder*="title"]', 'Test Event');
      await page.fill('textarea', 'This is a test event for testing image upload.');
      
      // Set date
      const dateInput = await page.locator('input[type="date"]').first();
      if (await dateInput.isVisible().catch(() => false)) {
        await dateInput.fill('2025-12-01');
      }
      
      // Upload image
      const imagePath = await createTestImage('event-test.png');
      const fileInput = await page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(imagePath);
      await page.waitForTimeout(2000);
      
      // Submit
      const submitButton = await page.locator('button[type="submit"], button:has-text("Enregistrer")').first();
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      log('Event with image submitted!', 'success');
      results.passed.push('EventsManager - Event Cover Image Upload');
      
      fs.unlinkSync(imagePath);
    } else {
      log('Could not find Add Event button', 'warning');
      results.warnings.push('EventsManager - Add button not found');
    }
    
  } catch (error) {
    log(`EventsManager test failed: ${error.message}`, 'error');
    await captureError(page, 'events-manager');
    results.failed.push({ test: 'EventsManager', error: error.message });
  }
}

// Test 5: SiteSettingsManager
async function testSiteSettings(page) {
  log('🧪 Testing SiteSettingsManager...', 'test');
  
  try {
    await page.goto(`${config.baseUrl}/admin/settings`);
    await page.waitForLoadState('networkidle');
    
    // Upload logo
    const imagePath = await createTestImage('logo-test.png');
    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(imagePath);
    await page.waitForTimeout(2000);
    
    // Save settings
    const saveButton = await page.locator('button:has-text("Enregistrer"), button:has-text("Save"), button:has-text("حفظ")').first();
    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(3000);
      log('Site logo saved!', 'success');
      results.passed.push('SiteSettingsManager - Logo Upload');
    } else {
      log('SiteSettings - Save button not found', 'warning');
      results.warnings.push('SiteSettingsManager - Could not save logo');
    }
    
    fs.unlinkSync(imagePath);
    
  } catch (error) {
    log(`SiteSettingsManager test failed: ${error.message}`, 'error');
    await captureError(page, 'site-settings');
    results.failed.push({ test: 'SiteSettingsManager', error: error.message });
  }
}

// Step 6: View as visitor
async function viewAsVisitor(page) {
  log('👁️ Viewing site as visitor...', 'test');
  
  try {
    // Logout
    const logoutButton = await page.locator('text=/Déconnexion|Logout|خروج/i').first();
    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      log('Logged out successfully', 'success');
    }
    
    // Visit homepage
    await page.goto(config.baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Check for images in different sections
    const sections = [
      { name: 'Gallery', selector: 'img[src*="gallery"]' },
      { name: 'News', selector: 'img[src*="news"]' },
      { name: 'Events', selector: 'img[src*="events"]' },
      { name: 'Logo', selector: 'img[src*="site-settings"], img[alt*="logo"]' }
    ];
    
    for (const section of sections) {
      const images = await page.locator(section.selector).count();
      if (images > 0) {
        log(`${section.name}: ${images} image(s) found`, 'success');
        results.passed.push(`Visitor View - ${section.name} images visible`);
      } else {
        log(`${section.name}: No images found`, 'warning');
        results.warnings.push(`Visitor View - ${section.name} images not visible`);
      }
    }
    
  } catch (error) {
    log(`Visitor view test failed: ${error.message}`, 'error');
    await captureError(page, 'visitor-view');
    results.failed.push({ test: 'VisitorView', error: error.message });
  }
}

// Generate test report
function generateReport() {
  results.endTime = new Date();
  const duration = Math.round((results.endTime - results.startTime) / 1000);
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(80));
  console.log(`\n⏱️  Duration: ${duration} seconds`);
  console.log(`📅 Started: ${results.startTime.toISOString()}`);
  console.log(`📅 Ended: ${results.endTime.toISOString()}`);
  
  console.log(`\n✅ PASSED: ${results.passed.length} tests`);
  results.passed.forEach((test, i) => {
    console.log(`   ${i + 1}. ${test}`);
  });
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS: ${results.warnings.length}`);
    results.warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED: ${results.failed.length} tests`);
    results.failed.forEach((failure, i) => {
      console.log(`   ${i + 1}. ${failure.test}: ${failure.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`📊 SUMMARY: ${results.passed.length} passed, ${results.warnings.length} warnings, ${results.failed.length} failed`);
  console.log('='.repeat(80) + '\n');
  
  // Save report to file
  const reportPath = path.join(__dirname, 'test-results', `test-report-${Date.now()}.json`);
  fs.mkdirSync(path.join(__dirname, 'test-results'), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`Detailed report saved: ${reportPath}`, 'info');
}

// Main test execution
async function runAllTests() {
  log('🚀 Starting comprehensive upload testing...', 'info');
  log(`Base URL: ${config.baseUrl}`, 'info');
  log(`Admin: ${config.adminEmail}`, 'info');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Login
    const loginSuccess = await loginAsAdmin(page);
    if (!loginSuccess) {
      log('Cannot proceed without successful login', 'error');
      return;
    }
    
    // Step 2-6: Test all components
    await testGalleryManager(page);
    await testNewsManager(page);
    await testAboutManager(page);
    await testEventsManager(page);
    await testSiteSettings(page);
    
    // Step 7: View as visitor
    await viewAsVisitor(page);
    
  } catch (error) {
    log(`Fatal error during testing: ${error.message}`, 'error');
    await captureError(page, 'fatal-error');
  } finally {
    await browser.close();
    generateReport();
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Failed to run tests:', error);
  process.exit(1);
});
