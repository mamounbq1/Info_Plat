import { chromium } from 'playwright';
import fs from 'fs';

const config = {
  baseUrl: 'https://5173-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai',
  adminEmail: 'temp-admin@test.com',
  adminPassword: 'TempAdmin123!',
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  // Login
  await page.goto(`${config.baseUrl}/login`);
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', config.adminEmail);
  await page.fill('input[type="password"]', config.adminPassword);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Gallery page
  await page.goto(`${config.baseUrl}/admin/gallery`);
  await page.waitForTimeout(3000);
  
  const html = await page.content();
  fs.writeFileSync('debug-gallery.html', html);
  console.log('✅ Saved gallery HTML to debug-gallery.html');
  console.log('   File inputs found:', (html.match(/type="file"/g) || []).length);
  console.log('   "Ajouter" buttons found:', (html.match(/Ajouter/g) || []).length);
  console.log('   "إضافة" buttons found:', (html.match(/إضافة/g) || []).length);
  
  // About page
  await page.goto(`${config.baseUrl}/admin/about`);
  await page.waitForTimeout(3000);
  
  const html2 = await page.content();
  fs.writeFileSync('debug-about.html', html2);
  console.log('\\n✅ Saved about HTML to debug-about.html');
  console.log('   File inputs found:', (html2.match(/type="file"/g) || []).length);
  
  await browser.close();
}

main();
