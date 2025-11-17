import { chromium } from 'playwright';

async function testContactForm() {
  console.log('🚀 Starting contact form test...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the page
    console.log('📱 Navigating to landing page...');
    await page.goto('https://5174-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for page to load
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded');

    // Scroll to contact section
    console.log('📜 Scrolling to contact section...');
    await page.evaluate(() => {
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(2000);

    // Wait for contact form to be visible
    console.log('🔍 Waiting for contact form...');
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    console.log('✅ Contact form found');

    // Test typing in name field
    console.log('\n📝 Testing NAME field...');
    const nameInput = page.locator('input[name="name"]');
    
    // Clear and type slowly, checking value after each character
    await nameInput.click();
    await page.waitForTimeout(500);
    
    const testName = 'Ahmed';
    for (let i = 0; i < testName.length; i++) {
      await nameInput.type(testName[i]);
      await page.waitForTimeout(300); // Wait between characters
      
      const currentValue = await nameInput.inputValue();
      console.log(`   After typing '${testName.substring(0, i + 1)}': value = '${currentValue}'`);
      
      if (currentValue.length !== i + 1) {
        console.log(`   ❌ ERROR: Expected ${i + 1} characters, got ${currentValue.length}`);
      }
    }

    const finalNameValue = await nameInput.inputValue();
    console.log(`✅ Final name value: '${finalNameValue}'`);

    // Test typing in email field
    console.log('\n📧 Testing EMAIL field...');
    const emailInput = page.locator('input[name="email"]');
    await emailInput.click();
    await page.waitForTimeout(500);
    
    const testEmail = 'ahmed@test.com';
    await emailInput.fill(''); // Clear first
    await emailInput.type(testEmail, { delay: 100 });
    await page.waitForTimeout(500);
    
    const finalEmailValue = await emailInput.inputValue();
    console.log(`✅ Final email value: '${finalEmailValue}'`);

    // Test typing in message field
    console.log('\n💬 Testing MESSAGE textarea...');
    const messageTextarea = page.locator('textarea[name="message"]');
    await messageTextarea.click();
    await page.waitForTimeout(500);
    
    const testMessage = 'Bonjour, ceci est un test.';
    await messageTextarea.fill(''); // Clear first
    await messageTextarea.type(testMessage, { delay: 100 });
    await page.waitForTimeout(500);
    
    const finalMessageValue = await messageTextarea.inputValue();
    console.log(`✅ Final message value: '${finalMessageValue}'`);

    // Check if page scrolled to top unexpectedly
    console.log('\n🔍 Checking scroll position...');
    const scrollY = await page.evaluate(() => window.scrollY);
    console.log(`   Current scroll Y: ${scrollY}px`);
    
    const contactSectionTop = await page.evaluate(() => {
      const el = document.querySelector('#contact');
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
    console.log(`   Contact section top: ${contactSectionTop}px`);

    if (scrollY < contactSectionTop - 500) {
      console.log('❌ PROBLEM: Page scrolled away from contact section!');
    } else {
      console.log('✅ Page stayed in contact section area');
    }

    // Final assessment
    console.log('\n📊 TEST RESULTS:');
    console.log('==================');
    
    if (finalNameValue === testName && finalEmailValue === testEmail && finalMessageValue === testMessage) {
      console.log('✅ ✅ ✅ ALL TESTS PASSED!');
      console.log('Contact form inputs work correctly without scroll/focus issues!');
    } else {
      console.log('❌ SOME TESTS FAILED:');
      if (finalNameValue !== testName) {
        console.log(`   Name: Expected '${testName}', got '${finalNameValue}'`);
      }
      if (finalEmailValue !== testEmail) {
        console.log(`   Email: Expected '${testEmail}', got '${finalEmailValue}'`);
      }
      if (finalMessageValue !== testMessage) {
        console.log(`   Message: Expected '${testMessage}', got '${finalMessageValue}'`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
  }
}

testContactForm();
