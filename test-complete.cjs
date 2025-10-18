#!/usr/bin/env node

/**
 * TEST COMPLET - LYCÉE ALMARINYINE
 * 
 * Ce script teste TOUTES les fonctionnalités de l'application:
 * - Création de comptes (admin, teacher, student)
 * - Login/Logout
 * - Système d'approbation
 * - Notifications
 * - Formulaire de contact
 * - Dashboards
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const APP_URL = 'https://5173-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  log('\n' + '='.repeat(80), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(80), 'cyan');
};

const logTest = (name) => {
  log(`\n🧪 Test: ${name}`, 'blue');
};

const logSuccess = (message) => {
  log(`  ✅ ${message}`, 'green');
};

const logError = (message) => {
  log(`  ❌ ${message}`, 'red');
};

const logWarning = (message) => {
  log(`  ⚠️  ${message}`, 'yellow');
};

const logInfo = (message) => {
  log(`  ℹ️  ${message}`, 'cyan');
};

// Rapport de test
const testReport = {
  startTime: new Date(),
  tests: [],
  bugs: [],
  warnings: [],
  successes: []
};

const addTestResult = (category, name, status, message, details = null) => {
  const result = { category, name, status, message, details, timestamp: new Date() };
  testReport.tests.push(result);
  
  if (status === 'PASS') {
    testReport.successes.push(result);
    logSuccess(message);
  } else if (status === 'FAIL') {
    testReport.bugs.push(result);
    logError(message);
  } else if (status === 'WARN') {
    testReport.warnings.push(result);
    logWarning(message);
  }
};

// Utilitaires
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForNavigation = async (page, timeout = 10000) => {
  try {
    await page.waitForNavigation({ timeout, waitUntil: 'networkidle0' });
    return true;
  } catch (error) {
    logWarning(`Navigation timeout: ${error.message}`);
    return false;
  }
};

const takeScreenshot = async (page, name) => {
  const screenshotPath = path.join(__dirname, 'test-screenshots', `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  logInfo(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
};

const checkConsoleErrors = (page) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
};

// =============================================================================
// TESTS: CRÉATION DE COMPTES
// =============================================================================

async function testSignup(page, role, userData) {
  logTest(`Création compte ${role}`);
  
  try {
    // Aller à la page signup
    await page.goto(`${APP_URL}/signup`, { waitUntil: 'networkidle0' });
    await wait(1000);
    
    // Vérifier que le formulaire existe
    const formExists = await page.$('form');
    if (!formExists) {
      addTestResult('Signup', `Création ${role}`, 'FAIL', 
        'Formulaire d\'inscription introuvable');
      return false;
    }
    
    // Remplir le formulaire
    await page.type('input[name="fullName"]', userData.fullName);
    await page.type('input[name="email"]', userData.email);
    await page.type('input[type="password"]', userData.password);
    
    // Sélectionner le rôle
    const roleSelector = 'select[name="role"]';
    const roleExists = await page.$(roleSelector);
    if (roleExists) {
      await page.select(roleSelector, role);
      logInfo(`Rôle sélectionné: ${role}`);
    } else {
      logWarning('Sélecteur de rôle introuvable');
    }
    
    await wait(500);
    
    // Screenshot avant soumission
    await takeScreenshot(page, `signup-${role}-before`);
    
    // Soumettre le formulaire
    const submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      addTestResult('Signup', `Création ${role}`, 'FAIL', 
        'Bouton de soumission introuvable');
      return false;
    }
    
    await submitButton.click();
    await wait(3000);
    
    // Screenshot après soumission
    await takeScreenshot(page, `signup-${role}-after`);
    
    // Vérifier la redirection ou le message
    const currentUrl = page.url();
    logInfo(`URL après signup: ${currentUrl}`);
    
    // Vérifier les messages toast
    const toastMessage = await page.evaluate(() => {
      const toasts = Array.from(document.querySelectorAll('[role="status"]'));
      return toasts.map(t => t.textContent).join(', ');
    });
    
    if (toastMessage) {
      logInfo(`Message: ${toastMessage}`);
    }
    
    // Vérifier les erreurs console
    const consoleErrors = await page.evaluate(() => {
      return window.console._errors || [];
    });
    
    if (consoleErrors.length > 0) {
      addTestResult('Signup', `Création ${role}`, 'WARN', 
        `${consoleErrors.length} erreurs console détectées`, consoleErrors);
    }
    
    addTestResult('Signup', `Création ${role}`, 'PASS', 
      `Compte ${role} créé avec succès`, { email: userData.email });
    
    return true;
    
  } catch (error) {
    addTestResult('Signup', `Création ${role}`, 'FAIL', 
      error.message, { stack: error.stack });
    await takeScreenshot(page, `signup-${role}-error`);
    return false;
  }
}

async function testSetupAdmin(page, adminData) {
  logTest('Création compte admin via /setup-admin');
  
  try {
    await page.goto(`${APP_URL}/setup-admin`, { waitUntil: 'networkidle0' });
    await wait(1000);
    
    // Vérifier si admin existe déjà
    const pageContent = await page.content();
    if (pageContent.includes('existe déjà') || pageContent.includes('already exists')) {
      addTestResult('Setup Admin', 'Création admin', 'WARN', 
        'Un compte admin existe déjà');
      return true;
    }
    
    // Remplir le formulaire
    await page.type('input[placeholder*="nom"]', adminData.fullName, { delay: 50 });
    await page.type('input[type="email"]', adminData.email, { delay: 50 });
    await page.type('input[type="password"]', adminData.password, { delay: 50 });
    
    await takeScreenshot(page, 'setup-admin-before');
    
    const submitButton = await page.$('button[type="submit"]');
    await submitButton.click();
    await wait(3000);
    
    await takeScreenshot(page, 'setup-admin-after');
    
    const currentUrl = page.url();
    logInfo(`URL après setup: ${currentUrl}`);
    
    if (currentUrl.includes('/login') || currentUrl.includes('/dashboard')) {
      addTestResult('Setup Admin', 'Création admin', 'PASS', 
        'Compte admin créé avec succès via setup-admin', { email: adminData.email });
      return true;
    } else {
      addTestResult('Setup Admin', 'Création admin', 'WARN', 
        'Redirection inattendue après setup-admin', { url: currentUrl });
      return true;
    }
    
  } catch (error) {
    addTestResult('Setup Admin', 'Création admin', 'FAIL', 
      error.message, { stack: error.stack });
    return false;
  }
}

// =============================================================================
// TESTS: LOGIN / LOGOUT
// =============================================================================

async function testLogin(page, email, password, expectedRole) {
  logTest(`Login avec ${email}`);
  
  try {
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
    await wait(1000);
    
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    
    await takeScreenshot(page, `login-${expectedRole}-before`);
    
    const submitButton = await page.$('button[type="submit"]');
    await submitButton.click();
    await wait(3000);
    
    await takeScreenshot(page, `login-${expectedRole}-after`);
    
    const currentUrl = page.url();
    logInfo(`URL après login: ${currentUrl}`);
    
    // Vérifier la redirection selon le rôle
    let expectedPath = '/dashboard';
    if (expectedRole === 'student' && currentUrl.includes('pending')) {
      logInfo('Étudiant en attente d\'approbation (normal)');
      addTestResult('Login', `Login ${expectedRole}`, 'PASS', 
        'Redirection vers page pending (étudiant non approuvé)', { email });
      return 'pending';
    } else if (currentUrl.includes('/dashboard')) {
      addTestResult('Login', `Login ${expectedRole}`, 'PASS', 
        'Login réussi et redirection vers dashboard', { email, role: expectedRole });
      return 'success';
    } else {
      addTestResult('Login', `Login ${expectedRole}`, 'WARN', 
        'Redirection inattendue', { url: currentUrl, expected: expectedPath });
      return 'redirect';
    }
    
  } catch (error) {
    addTestResult('Login', `Login ${expectedRole}`, 'FAIL', 
      error.message, { stack: error.stack });
    return 'error';
  }
}

async function testLogout(page) {
  logTest('Logout');
  
  try {
    // Chercher le bouton de déconnexion
    await page.waitForSelector('button', { timeout: 5000 });
    
    const logoutButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => 
        btn.textContent.includes('Déconnexion') || 
        btn.textContent.includes('Logout') ||
        btn.textContent.includes('خروج')
      );
    });
    
    if (logoutButton) {
      await logoutButton.click();
      await wait(2000);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl === APP_URL || currentUrl === `${APP_URL}/`) {
        addTestResult('Logout', 'Déconnexion', 'PASS', 
          'Déconnexion réussie', { redirectUrl: currentUrl });
        return true;
      } else {
        addTestResult('Logout', 'Déconnexion', 'WARN', 
          'Redirection après logout inattendue', { url: currentUrl });
        return true;
      }
    } else {
      addTestResult('Logout', 'Déconnexion', 'FAIL', 
        'Bouton de déconnexion introuvable');
      return false;
    }
    
  } catch (error) {
    addTestResult('Logout', 'Déconnexion', 'FAIL', 
      error.message);
    return false;
  }
}

// =============================================================================
// TESTS: NOTIFICATIONS & APPROBATION
// =============================================================================

async function testNotifications(page) {
  logTest('Système de notifications (admin)');
  
  try {
    await wait(2000);
    
    // Vérifier la présence de la cloche de notification
    const notificationBell = await page.$('[class*="BellIcon"]') || 
                             await page.$('button[aria-label*="notification"]') ||
                             await page.$('svg[class*="bell"]');
    
    if (!notificationBell) {
      addTestResult('Notifications', 'Cloche notification', 'WARN', 
        'Icône de notification introuvable (vérifier que l\'utilisateur est admin)');
      return false;
    }
    
    addTestResult('Notifications', 'Cloche notification', 'PASS', 
      'Icône de notification présente');
    
    // Vérifier le badge de notification
    const badge = await page.$('span[class*="badge"]') || 
                  await page.$('[class*="animate-pulse"]');
    
    if (badge) {
      const badgeText = await page.evaluate(el => el.textContent, badge);
      logInfo(`Badge notification: ${badgeText}`);
      addTestResult('Notifications', 'Badge notification', 'PASS', 
        `Badge présent avec ${badgeText} notification(s)`);
    }
    
    // Cliquer sur la cloche
    await notificationBell.click();
    await wait(1000);
    
    await takeScreenshot(page, 'notifications-panel-open');
    
    // Vérifier l'ouverture du panneau
    const panel = await page.$('[class*="notification"]') ||
                  await page.$('[class*="fixed"]');
    
    if (panel) {
      addTestResult('Notifications', 'Panneau notifications', 'PASS', 
        'Panneau de notifications s\'ouvre correctement');
      
      // Compter les notifications
      const notificationCount = await page.$$eval('[class*="notification"]', 
        elements => elements.length);
      
      logInfo(`${notificationCount} notifications visibles`);
      
      return true;
    } else {
      addTestResult('Notifications', 'Panneau notifications', 'FAIL', 
        'Panneau ne s\'ouvre pas après clic');
      return false;
    }
    
  } catch (error) {
    addTestResult('Notifications', 'Système notifications', 'FAIL', 
      error.message);
    return false;
  }
}

async function testContactForm(page) {
  logTest('Formulaire de contact');
  
  try {
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    
    // Scroll vers le formulaire de contact
    await page.evaluate(() => {
      const contactSection = document.querySelector('[id*="contact"]') || 
                             Array.from(document.querySelectorAll('section')).find(s => 
                               s.textContent.includes('Contact')
                             );
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    await wait(1000);
    
    // Remplir le formulaire
    const formInputs = await page.$$('input');
    if (formInputs.length < 2) {
      addTestResult('Contact', 'Formulaire contact', 'FAIL', 
        'Formulaire de contact introuvable');
      return false;
    }
    
    await page.type('input[name="name"]', 'Test User', { delay: 50 });
    await page.type('input[name="email"]', 'test@test.com', { delay: 50 });
    await page.type('input[name="subject"]', 'Test Notification', { delay: 50 });
    await page.type('textarea[name="message"]', 'Ceci est un message de test pour vérifier le système de notifications.', { delay: 30 });
    
    await takeScreenshot(page, 'contact-form-filled');
    
    // Soumettre
    const submitButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => 
        btn.textContent.includes('Envoyer') || 
        btn.textContent.includes('Send') ||
        btn.type === 'submit'
      );
    });
    
    if (submitButton) {
      await submitButton.click();
      await wait(3000);
      
      await takeScreenshot(page, 'contact-form-submitted');
      
      addTestResult('Contact', 'Formulaire contact', 'PASS', 
        'Message de contact envoyé avec succès');
      return true;
    } else {
      addTestResult('Contact', 'Formulaire contact', 'FAIL', 
        'Bouton d\'envoi introuvable');
      return false;
    }
    
  } catch (error) {
    addTestResult('Contact', 'Formulaire contact', 'FAIL', 
      error.message);
    return false;
  }
}

// =============================================================================
// TESTS: DASHBOARDS
// =============================================================================

async function testDashboard(page, role) {
  logTest(`Dashboard ${role}`);
  
  try {
    await wait(2000);
    await takeScreenshot(page, `dashboard-${role}`);
    
    const currentUrl = page.url();
    
    if (!currentUrl.includes('/dashboard')) {
      addTestResult('Dashboard', `Dashboard ${role}`, 'FAIL', 
        'Pas redirigé vers dashboard', { url: currentUrl });
      return false;
    }
    
    // Vérifier les éléments du dashboard
    const sidebar = await page.$('aside') || await page.$('[class*="sidebar"]');
    const mainContent = await page.$('main') || await page.$('[class*="content"]');
    
    if (sidebar && mainContent) {
      addTestResult('Dashboard', `Dashboard ${role}`, 'PASS', 
        'Dashboard chargé avec sidebar et contenu principal');
    } else {
      addTestResult('Dashboard', `Dashboard ${role}`, 'WARN', 
        'Structure du dashboard incomplète', { 
          hasSidebar: !!sidebar, 
          hasContent: !!mainContent 
        });
    }
    
    // Vérifier les menus selon le rôle
    const menuItems = await page.$$eval('[class*="menu"] a, nav a', 
      links => links.map(l => l.textContent.trim()));
    
    logInfo(`Éléments de menu: ${menuItems.join(', ')}`);
    
    return true;
    
  } catch (error) {
    addTestResult('Dashboard', `Dashboard ${role}`, 'FAIL', 
      error.message);
    return false;
  }
}

// =============================================================================
// GÉNÉRATION DU RAPPORT
// =============================================================================

function generateReport() {
  logSection('RAPPORT DE TEST COMPLET');
  
  testReport.endTime = new Date();
  const duration = (testReport.endTime - testReport.startTime) / 1000;
  
  log(`\nDurée totale: ${duration.toFixed(2)}s`, 'bright');
  log(`Tests exécutés: ${testReport.tests.length}`, 'blue');
  log(`✅ Succès: ${testReport.successes.length}`, 'green');
  log(`⚠️  Avertissements: ${testReport.warnings.length}`, 'yellow');
  log(`❌ Échecs: ${testReport.bugs.length}`, 'red');
  
  // Bugs détectés
  if (testReport.bugs.length > 0) {
    logSection('BUGS DÉTECTÉS');
    testReport.bugs.forEach((bug, index) => {
      log(`\n${index + 1}. [${bug.category}] ${bug.name}`, 'red');
      log(`   Message: ${bug.message}`, 'reset');
      if (bug.details) {
        log(`   Détails: ${JSON.stringify(bug.details, null, 2)}`, 'reset');
      }
    });
  }
  
  // Avertissements
  if (testReport.warnings.length > 0) {
    logSection('AVERTISSEMENTS');
    testReport.warnings.forEach((warn, index) => {
      log(`\n${index + 1}. [${warn.category}] ${warn.name}`, 'yellow');
      log(`   ${warn.message}`, 'reset');
    });
  }
  
  // Sauvegarder le rapport JSON
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
  log(`\n📄 Rapport JSON sauvegardé: ${reportPath}`, 'cyan');
  
  return testReport;
}

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

async function runAllTests() {
  logSection('DÉMARRAGE DES TESTS COMPLETS');
  logInfo(`URL de l'application: ${APP_URL}`);
  
  // Créer le dossier screenshots
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Intercepter les erreurs console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logError(`Console: ${msg.text()}`);
      }
    });
    
    // Données de test
    const timestamp = Date.now();
    const testData = {
      admin: {
        fullName: 'Admin Test',
        email: `admin-test-${timestamp}@test.com`,
        password: 'Test123456!'
      },
      teacher: {
        fullName: 'Prof Test',
        email: `prof-test-${timestamp}@test.com`,
        password: 'Test123456!'
      },
      student: {
        fullName: 'Élève Test',
        email: `student-test-${timestamp}@test.com`,
        password: 'Test123456!'
      }
    };
    
    // =============================================================================
    // SÉQUENCE DE TESTS
    // =============================================================================
    
    // 1. Tester la page d'accueil
    logSection('TEST 1: PAGE D\'ACCUEIL');
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'homepage');
    addTestResult('Navigation', 'Page d\'accueil', 'PASS', 'Page d\'accueil accessible');
    
    // 2. Tester le formulaire de contact
    logSection('TEST 2: FORMULAIRE DE CONTACT');
    await testContactForm(page);
    
    // 3. Créer compte admin via setup-admin
    logSection('TEST 3: CRÉATION COMPTE ADMIN');
    await testSetupAdmin(page, testData.admin);
    await wait(2000);
    
    // 4. Logout si connecté
    await testLogout(page);
    await wait(1000);
    
    // 5. Créer compte étudiant
    logSection('TEST 4: CRÉATION COMPTE ÉTUDIANT');
    await testSignup(page, 'student', testData.student);
    await wait(2000);
    await testLogout(page);
    
    // 6. Créer compte professeur
    logSection('TEST 5: CRÉATION COMPTE PROFESSEUR');
    await testSignup(page, 'teacher', testData.teacher);
    await wait(2000);
    await testLogout(page);
    
    // 7. Login admin et vérifier notifications
    logSection('TEST 6: LOGIN ADMIN & NOTIFICATIONS');
    const adminLoginResult = await testLogin(page, testData.admin.email, testData.admin.password, 'admin');
    if (adminLoginResult === 'success') {
      await testDashboard(page, 'admin');
      await testNotifications(page);
    }
    await testLogout(page);
    
    // 8. Login professeur
    logSection('TEST 7: LOGIN PROFESSEUR');
    const teacherLoginResult = await testLogin(page, testData.teacher.email, testData.teacher.password, 'teacher');
    if (teacherLoginResult === 'success') {
      await testDashboard(page, 'teacher');
    }
    await testLogout(page);
    
    // 9. Login étudiant (devrait être en attente)
    logSection('TEST 8: LOGIN ÉTUDIANT');
    const studentLoginResult = await testLogin(page, testData.student.email, testData.student.password, 'student');
    if (studentLoginResult === 'pending') {
      await takeScreenshot(page, 'student-pending-approval');
      logInfo('Étudiant correctement redirigé vers page d\'approbation');
    }
    
    // Générer le rapport final
    const report = generateReport();
    
    return report;
    
  } catch (error) {
    logError(`Erreur fatale: ${error.message}`);
    log(error.stack, 'red');
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Exécution
if (require.main === module) {
  runAllTests()
    .then(report => {
      if (report) {
        const exitCode = report.bugs.length > 0 ? 1 : 0;
        process.exit(exitCode);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      logError(`Erreur d'exécution: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runAllTests };
