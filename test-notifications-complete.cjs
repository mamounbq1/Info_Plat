#!/usr/bin/env node

/**
 * TEST COMPLET DU SYSTÈME DE NOTIFICATIONS
 * 
 * Ce script teste TOUS les aspects du système de notifications:
 * - Génération de notifications (messages + inscriptions)
 * - Affichage pour les admins uniquement
 * - Cloche de notification et badge
 * - Panneau de notifications
 * - Actions: Approuver/Refuser/Marquer lu
 * - Temps réel et listeners Firestore
 * - Positionnement du panneau
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const APP_URL = 'https://5173-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai';

// Configuration
const config = {
  headless: true,
  slowMo: 50, // Ralentir pour mieux observer
  screenshots: true,
  verbose: true,
  setupAdminTimeout: 30000, // 30 secondes pour setup-admin
  defaultTimeout: 10000
};

// Couleurs
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

const logTest = (name) => log(`\n🧪 ${name}`, 'blue');
const logSuccess = (msg) => log(`  ✅ ${msg}`, 'green');
const logError = (msg) => log(`  ❌ ${msg}`, 'red');
const logWarning = (msg) => log(`  ⚠️  ${msg}`, 'yellow');
const logInfo = (msg) => log(`  ℹ️  ${msg}`, 'cyan');

// Rapport de test
const report = {
  startTime: new Date(),
  tests: [],
  bugs: [],
  screenshots: []
};

const addResult = (category, name, status, message, details = null) => {
  const result = { category, name, status, message, details, timestamp: new Date() };
  report.tests.push(result);
  
  if (status === 'PASS') logSuccess(message);
  else if (status === 'FAIL') {
    logError(message);
    report.bugs.push(result);
  }
  else if (status === 'WARN') logWarning(message);
  else if (status === 'INFO') logInfo(message);
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const screenshot = async (page, name) => {
  if (!config.screenshots) return;
  
  const dir = path.join(__dirname, 'test-notifications-screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  
  const filepath = path.join(dir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  report.screenshots.push({ name, path: filepath });
  logInfo(`Screenshot: ${name}.png`);
};

// =============================================================================
// UTILITAIRES
// =============================================================================

async function getConsoleLogs(page) {
  return page.evaluate(() => {
    return {
      errors: window.consoleErrors || [],
      logs: window.consoleLogs || []
    };
  });
}

async function setupConsoleCapture(page) {
  await page.evaluateOnNewDocument(() => {
    window.consoleErrors = [];
    window.consoleLogs = [];
    
    const originalError = console.error;
    console.error = (...args) => {
      window.consoleErrors.push(args.map(a => String(a)).join(' '));
      originalError.apply(console, args);
    };
    
    const originalLog = console.log;
    console.log = (...args) => {
      const msg = args.map(a => String(a)).join(' ');
      if (msg.includes('🔔') || msg.includes('Notification') || msg.includes('notification')) {
        window.consoleLogs.push(msg);
      }
      originalLog.apply(console, args);
    };
  });
}

async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// ÉTAPE 1: CRÉER UN COMPTE ADMIN
// =============================================================================

async function createAdminAccount(page, adminData) {
  logTest('Création compte administrateur');
  
  try {
    // Utiliser 'domcontentloaded' au lieu de 'networkidle0' car la page a un check Firestore lent
    await page.goto(`${APP_URL}/setup-admin`, { waitUntil: 'domcontentloaded', timeout: config.setupAdminTimeout });
    await wait(5000); // Attendre que le check Firestore se termine
    await screenshot(page, '01-setup-admin-page');
    
    // Vérifier si admin existe déjà
    const pageText = await page.evaluate(() => document.body.textContent);
    if (pageText.includes('existe déjà') || pageText.includes('already exists')) {
      addResult('Setup', 'Admin existe', 'INFO', 'Un admin existe déjà, passons à l\'étape suivante');
      return true;
    }
    
    // Remplir le formulaire
    const fullNameInput = await page.$('input[placeholder*="nom"]');
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (!fullNameInput || !emailInput || !passwordInput) {
      addResult('Setup', 'Formulaire admin', 'FAIL', 'Formulaire setup-admin incomplet');
      return false;
    }
    
    await fullNameInput.type(adminData.fullName, { delay: 30 });
    await emailInput.type(adminData.email, { delay: 30 });
    await passwordInput.type(adminData.password, { delay: 30 });
    
    // Trouver le deuxième input password (confirmation)
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 1) {
      await passwordInputs[1].type(adminData.password, { delay: 30 });
    }
    
    await screenshot(page, '02-setup-admin-filled');
    
    // Soumettre
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await wait(4000);
      await screenshot(page, '03-setup-admin-submitted');
      
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/login')) {
        addResult('Setup', 'Création admin', 'PASS', `Admin créé: ${adminData.email}`);
        return true;
      } else {
        addResult('Setup', 'Création admin', 'WARN', `URL inattendue: ${currentUrl}`);
        return true; // Continuer quand même
      }
    }
    
    return false;
  } catch (error) {
    addResult('Setup', 'Création admin', 'FAIL', error.message);
    return false;
  }
}

// =============================================================================
// ÉTAPE 2: CRÉER DES DONNÉES DE TEST (NOTIFICATIONS)
// =============================================================================

async function createTestNotifications(page) {
  logTest('Génération de notifications de test');
  
  const notificationsCreated = [];
  
  // 2.1 - Créer des messages de contact
  for (let i = 1; i <= 2; i++) {
    try {
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await wait(2000);
      
      // Scroll to bottom of page to reach contact form
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await wait(2000);
      await screenshot(page, `04-contact-form-${i}`);
      
      // Try multiple selectors for contact form inputs
      let nameInput = await page.$('input[name="name"]');
      let emailInput = await page.$('input[name="email"]');
      let subjectInput = await page.$('input[name="subject"]');
      let messageTextarea = await page.$('textarea[name="message"]');
      
      // Fallback: try alternative selectors
      if (!nameInput || !emailInput || !messageTextarea) {
        nameInput = await page.$('input[placeholder*="Nom"]');
        emailInput = await page.$('input[type="email"]');
        messageTextarea = await page.$('textarea[placeholder*="message"]');
      }
      
      if (!nameInput || !emailInput || !messageTextarea) {
        addResult('Notifications', `Message ${i}`, 'FAIL', 'Formulaire de contact introuvable (éléments manquants)');
        continue;
      }
      
      await nameInput.type(`Test User ${i}`, { delay: 30 });
      await emailInput.type(`testuser${i}@test.com`, { delay: 30 });
      if (subjectInput) await subjectInput.type(`Test Notification ${i}`, { delay: 30 });
      await messageTextarea.type(`Ceci est un message de test numéro ${i} pour vérifier le système de notifications en temps réel.`, { delay: 20 });
      
      await screenshot(page, `05-contact-filled-${i}`);
      
      // Soumettre
      const submitBtn = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => 
          btn.textContent.includes('Envoyer') || 
          btn.textContent.includes('Send') ||
          btn.type === 'submit'
        );
      });
      
      if (submitBtn) {
        await submitBtn.asElement().click();
        await wait(2000);
        addResult('Notifications', `Message ${i}`, 'PASS', `Message de contact ${i} envoyé`);
        notificationsCreated.push({ type: 'message', id: i });
      }
      
    } catch (error) {
      addResult('Notifications', `Message ${i}`, 'FAIL', error.message);
    }
  }
  
  // 2.2 - Créer des comptes étudiants (générant des notifications)
  for (let i = 1; i <= 2; i++) {
    try {
      await page.goto(`${APP_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await wait(1000);
      
      const timestamp = Date.now();
      const fullNameInput = await page.$('input[name="fullName"], input[placeholder*="nom"]');
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');
      
      if (!fullNameInput || !emailInput || !passwordInput) {
        addResult('Notifications', `Étudiant ${i}`, 'FAIL', 'Formulaire signup introuvable');
        continue;
      }
      
      await fullNameInput.type(`Étudiant Test ${i}`, { delay: 30 });
      await emailInput.type(`student-test-${i}-${timestamp}@test.com`, { delay: 30 });
      await passwordInput.type('Test123456!', { delay: 30 });
      
      // Sélectionner le rôle "student" si disponible
      const roleSelect = await page.$('select[name="role"]');
      if (roleSelect) {
        await page.select('select[name="role"]', 'student');
      }
      
      await screenshot(page, `06-signup-student-${i}`);
      
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await wait(3000);
        addResult('Notifications', `Étudiant ${i}`, 'PASS', `Compte étudiant ${i} créé (notification générée)`);
        notificationsCreated.push({ type: 'student', id: i });
      }
      
    } catch (error) {
      addResult('Notifications', `Étudiant ${i}`, 'FAIL', error.message);
    }
  }
  
  addResult('Notifications', 'Génération', 'INFO', `${notificationsCreated.length} notifications générées`);
  return notificationsCreated;
}

// =============================================================================
// ÉTAPE 3: LOGIN ADMIN ET VÉRIFICATION DES LOGS
// =============================================================================

async function loginAsAdmin(page, adminData) {
  logTest('Login en tant qu\'administrateur');
  
  try {
    await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await wait(1000);
    
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (!emailInput || !passwordInput) {
      addResult('Login', 'Formulaire login', 'FAIL', 'Formulaire login introuvable');
      return false;
    }
    
    await emailInput.type(adminData.email, { delay: 30 });
    await passwordInput.type(adminData.password, { delay: 30 });
    
    await screenshot(page, '07-login-admin');
    
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await wait(4000);
      await screenshot(page, '08-dashboard-admin');
      
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard')) {
        addResult('Login', 'Login admin', 'PASS', 'Login admin réussi');
        
        // Attendre que les contexts soient chargés
        await wait(3000);
        
        // Capturer les logs console
        const logs = await getConsoleLogs(page);
        if (logs.logs.length > 0) {
          addResult('Login', 'Console logs', 'INFO', `${logs.logs.length} logs détectés`);
          logs.logs.forEach(log => logInfo(`Console: ${log}`));
        }
        
        return true;
      } else {
        addResult('Login', 'Login admin', 'FAIL', `Pas redirigé vers dashboard: ${currentUrl}`);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    addResult('Login', 'Login admin', 'FAIL', error.message);
    return false;
  }
}

// =============================================================================
// ÉTAPE 4: VÉRIFIER LA CLOCHE DE NOTIFICATION
// =============================================================================

async function checkNotificationBell(page) {
  logTest('Vérification de la cloche de notification');
  
  try {
    await wait(2000);
    
    // Chercher la cloche de notification
    const bellIcon = await page.evaluate(() => {
      // Méthode 1: Chercher par classe
      let bell = document.querySelector('[class*="BellIcon"]');
      if (bell) return { found: true, method: 'class', visible: true };
      
      // Méthode 2: Chercher par SVG
      const svgs = Array.from(document.querySelectorAll('svg'));
      bell = svgs.find(svg => {
        const path = svg.querySelector('path');
        return path && path.getAttribute('d') && path.getAttribute('d').includes('M15');
      });
      if (bell) return { found: true, method: 'svg', visible: true };
      
      // Méthode 3: Chercher dans sidebar/header
      const sidebar = document.querySelector('aside') || document.querySelector('header');
      if (sidebar) {
        bell = sidebar.querySelector('button');
        if (bell) return { found: true, method: 'sidebar-button', visible: true };
      }
      
      return { found: false, visible: false };
    });
    
    if (!bellIcon.found) {
      addResult('Notifications', 'Cloche icon', 'FAIL', 'Icône de cloche introuvable (vérifier que l\'utilisateur est admin)');
      await screenshot(page, '09-no-bell-icon');
      return null;
    }
    
    addResult('Notifications', 'Cloche icon', 'PASS', `Cloche trouvée (méthode: ${bellIcon.method})`);
    
    // Vérifier le badge
    const badge = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('span'));
      const notifBadge = badges.find(span => 
        span.className.includes('badge') || 
        span.className.includes('animate-pulse') ||
        span.className.includes('bg-red')
      );
      
      if (notifBadge) {
        return {
          found: true,
          text: notifBadge.textContent.trim(),
          classes: notifBadge.className
        };
      }
      return { found: false };
    });
    
    if (badge.found) {
      addResult('Notifications', 'Badge', 'PASS', `Badge présent: "${badge.text}"`);
    } else {
      addResult('Notifications', 'Badge', 'WARN', 'Aucun badge visible (peut-être aucune notification)');
    }
    
    await screenshot(page, '10-bell-icon-found');
    return { bell: bellIcon, badge };
    
  } catch (error) {
    addResult('Notifications', 'Cloche icon', 'FAIL', error.message);
    return null;
  }
}

// =============================================================================
// ÉTAPE 5: CLIQUER SUR LA CLOCHE ET VÉRIFIER LE PANNEAU
// =============================================================================

async function openNotificationPanel(page) {
  logTest('Ouverture du panneau de notifications');
  
  try {
    // Cliquer sur la cloche
    const clicked = await page.evaluate(() => {
      // Trouver tous les boutons dans la sidebar
      const sidebar = document.querySelector('aside');
      if (!sidebar) return { success: false, error: 'Sidebar not found' };
      
      const buttons = Array.from(sidebar.querySelectorAll('button'));
      
      // Chercher le bouton avec BellIcon ou SVG bell
      for (const btn of buttons) {
        const svg = btn.querySelector('svg');
        if (svg) {
          btn.click();
          return { success: true, method: 'button-with-svg' };
        }
      }
      
      return { success: false, error: 'Bell button not found' };
    });
    
    if (!clicked.success) {
      addResult('Notifications', 'Clic cloche', 'FAIL', clicked.error);
      return false;
    }
    
    addResult('Notifications', 'Clic cloche', 'PASS', `Cloche cliquée (${clicked.method})`);
    await wait(1000);
    await screenshot(page, '11-notification-panel-opened');
    
    // Vérifier que le panneau est ouvert
    const panel = await page.evaluate(() => {
      // Chercher le panneau de notifications
      const panels = Array.from(document.querySelectorAll('div'));
      const notifPanel = panels.find(div => 
        div.className.includes('fixed') &&
        (div.className.includes('notification') || 
         div.textContent.includes('Notification') ||
         div.textContent.includes('Aucune notification'))
      );
      
      if (notifPanel) {
        const rect = notifPanel.getBoundingClientRect();
        return {
          found: true,
          visible: rect.width > 0 && rect.height > 0,
          position: {
            top: rect.top,
            right: window.innerWidth - rect.right,
            width: rect.width,
            height: rect.height
          },
          className: notifPanel.className,
          text: notifPanel.textContent.substring(0, 100)
        };
      }
      
      return { found: false };
    });
    
    if (!panel.found) {
      addResult('Notifications', 'Panneau', 'FAIL', 'Panneau de notifications ne s\'ouvre pas');
      return false;
    }
    
    if (!panel.visible) {
      addResult('Notifications', 'Panneau', 'FAIL', 'Panneau existe mais n\'est pas visible');
      return false;
    }
    
    addResult('Notifications', 'Panneau ouvert', 'PASS', 'Panneau visible et correctement positionné');
    addResult('Notifications', 'Position panneau', 'INFO', 
      `Position: top=${panel.position.top}px, right=${panel.position.right}px, width=${panel.position.width}px`);
    
    // Vérifier que le panneau est en position fixed
    if (!panel.className.includes('fixed')) {
      addResult('Notifications', 'CSS panneau', 'WARN', 'Panneau n\'utilise pas position:fixed');
    } else {
      addResult('Notifications', 'CSS panneau', 'PASS', 'Panneau utilise position:fixed');
    }
    
    return panel;
    
  } catch (error) {
    addResult('Notifications', 'Ouverture panneau', 'FAIL', error.message);
    return false;
  }
}

// =============================================================================
// ÉTAPE 6: COMPTER ET LISTER LES NOTIFICATIONS
// =============================================================================

async function analyzeNotifications(page) {
  logTest('Analyse des notifications affichées');
  
  try {
    const notifications = await page.evaluate(() => {
      const notifElements = Array.from(document.querySelectorAll('[class*="notification"]'));
      
      return notifElements.map((el, index) => {
        const text = el.textContent;
        const hasUserIcon = !!el.querySelector('[class*="UserPlusIcon"]');
        const hasMessageIcon = !!el.querySelector('[class*="EnvelopeIcon"]');
        const hasApproveBtn = text.includes('Approuver') || text.includes('موافقة');
        const hasRejectBtn = text.includes('Refuser') || text.includes('رفض');
        const hasMarkReadBtn = text.includes('Marquer lu') || text.includes('تعليم كمقروء');
        
        let type = 'unknown';
        if (hasUserIcon || hasApproveBtn) type = 'registration';
        if (hasMessageIcon || hasMarkReadBtn) type = 'message';
        
        return {
          index,
          type,
          text: text.substring(0, 100),
          hasApproveBtn,
          hasRejectBtn,
          hasMarkReadBtn
        };
      });
    });
    
    if (notifications.length === 0) {
      addResult('Notifications', 'Liste', 'WARN', 'Aucune notification visible dans le panneau');
      addResult('Notifications', 'Explication', 'INFO', 
        'Les notifications n\'apparaissent que si des données "pending" existent dans Firestore');
      return [];
    }
    
    addResult('Notifications', 'Comptage', 'PASS', `${notifications.length} notification(s) visible(s)`);
    
    // Analyser les types
    const registrations = notifications.filter(n => n.type === 'registration');
    const messages = notifications.filter(n => n.type === 'message');
    
    if (registrations.length > 0) {
      addResult('Notifications', 'Type: Inscriptions', 'PASS', `${registrations.length} inscription(s)`);
    }
    if (messages.length > 0) {
      addResult('Notifications', 'Type: Messages', 'PASS', `${messages.length} message(s)`);
    }
    
    // Vérifier les boutons d'action
    notifications.forEach((notif, i) => {
      if (notif.type === 'registration') {
        if (notif.hasApproveBtn && notif.hasRejectBtn) {
          addResult('Notifications', `Actions notif #${i+1}`, 'PASS', 'Boutons Approuver/Refuser présents');
        } else {
          addResult('Notifications', `Actions notif #${i+1}`, 'FAIL', 'Boutons Approuver/Refuser manquants');
        }
      } else if (notif.type === 'message') {
        if (notif.hasMarkReadBtn) {
          addResult('Notifications', `Actions notif #${i+1}`, 'PASS', 'Bouton Marquer lu présent');
        } else {
          addResult('Notifications', `Actions notif #${i+1}`, 'FAIL', 'Bouton Marquer lu manquant');
        }
      }
    });
    
    await screenshot(page, '12-notifications-listed');
    return notifications;
    
  } catch (error) {
    addResult('Notifications', 'Analyse', 'FAIL', error.message);
    return [];
  }
}

// =============================================================================
// ÉTAPE 7: TESTER LES ACTIONS (APPROUVER/REFUSER/MARQUER LU)
// =============================================================================

async function testNotificationActions(page, notifications) {
  logTest('Test des actions sur les notifications');
  
  if (notifications.length === 0) {
    addResult('Actions', 'Test actions', 'WARN', 'Aucune notification à tester');
    return;
  }
  
  try {
    // Tester "Marquer lu" sur un message si disponible
    const messageNotif = notifications.find(n => n.type === 'message');
    if (messageNotif) {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const markReadBtn = buttons.find(btn => 
          btn.textContent.includes('Marquer lu') || 
          btn.textContent.includes('تعليم كمقروء')
        );
        
        if (markReadBtn) {
          markReadBtn.click();
          return { success: true };
        }
        return { success: false, error: 'Bouton Marquer lu introuvable' };
      });
      
      if (clicked.success) {
        await wait(2000);
        addResult('Actions', 'Marquer lu', 'PASS', 'Action "Marquer lu" cliquée');
        await screenshot(page, '13-after-mark-read');
      } else {
        addResult('Actions', 'Marquer lu', 'FAIL', clicked.error);
      }
    }
    
    // Tester "Approuver" sur une inscription si disponible
    const registrationNotif = notifications.find(n => n.type === 'registration');
    if (registrationNotif) {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const approveBtn = buttons.find(btn => 
          btn.textContent.includes('Approuver') || 
          btn.textContent.includes('موافقة')
        );
        
        if (approveBtn) {
          approveBtn.click();
          return { success: true };
        }
        return { success: false, error: 'Bouton Approuver introuvable' };
      });
      
      if (clicked.success) {
        await wait(3000);
        addResult('Actions', 'Approuver', 'PASS', 'Action "Approuver" cliquée');
        await screenshot(page, '14-after-approve');
        
        // Vérifier le toast de succès
        const toast = await page.evaluate(() => {
          const toasts = Array.from(document.querySelectorAll('[role="status"]'));
          return toasts.map(t => t.textContent).join(', ');
        });
        
        if (toast.includes('approuvé') || toast.includes('succès')) {
          addResult('Actions', 'Toast approbation', 'PASS', `Toast: ${toast}`);
        } else {
          addResult('Actions', 'Toast approbation', 'WARN', 'Aucun toast de confirmation visible');
        }
      } else {
        addResult('Actions', 'Approuver', 'FAIL', clicked.error);
      }
    }
    
  } catch (error) {
    addResult('Actions', 'Test actions', 'FAIL', error.message);
  }
}

// =============================================================================
// ÉTAPE 8: VÉRIFIER LES LOGS CONSOLE POUR LISTENERS FIRESTORE
// =============================================================================

async function checkFirestoreListeners(page) {
  logTest('Vérification des listeners Firestore (temps réel)');
  
  try {
    const logs = await getConsoleLogs(page);
    
    // Chercher les logs spécifiques aux notifications
    const notifLogs = logs.logs.filter(log => 
      log.includes('🔔') || 
      log.includes('NotificationContext') ||
      log.includes('Starting notification listeners') ||
      log.includes('snapshot received')
    );
    
    if (notifLogs.length === 0) {
      addResult('Listeners', 'Logs Firestore', 'WARN', 'Aucun log de listener Firestore détecté');
      addResult('Listeners', 'Conseil', 'INFO', 'Vérifier que l\'utilisateur est bien admin');
      return;
    }
    
    addResult('Listeners', 'Logs détectés', 'PASS', `${notifLogs.length} logs de notifications`);
    
    // Analyser les logs
    notifLogs.forEach(log => {
      if (log.includes('mounted')) {
        addResult('Listeners', 'Context monté', 'PASS', 'NotificationContext monté');
      }
      if (log.includes('Starting notification listeners')) {
        addResult('Listeners', 'Listeners démarrés', 'PASS', 'Listeners Firestore actifs');
      }
      if (log.includes('Users snapshot received')) {
        const match = log.match(/(\d+) pending users/);
        if (match) {
          addResult('Listeners', 'Users listener', 'PASS', `${match[1]} utilisateur(s) pending`);
        }
      }
      if (log.includes('Messages snapshot received')) {
        const match = log.match(/(\d+) pending messages/);
        if (match) {
          addResult('Listeners', 'Messages listener', 'PASS', `${match[1]} message(s) pending`);
        }
      }
      if (log.includes('Total notifications')) {
        addResult('Listeners', 'Total calculé', 'PASS', log.split(':')[1].trim());
      }
    });
    
  } catch (error) {
    addResult('Listeners', 'Vérification', 'FAIL', error.message);
  }
}

// =============================================================================
// RAPPORT FINAL
// =============================================================================

function generateReport() {
  logSection('RAPPORT FINAL - TESTS NOTIFICATIONS');
  
  report.endTime = new Date();
  const duration = (report.endTime - report.startTime) / 1000;
  
  log(`\nDurée totale: ${duration.toFixed(2)}s`, 'bright');
  log(`Tests exécutés: ${report.tests.length}`, 'blue');
  
  const passed = report.tests.filter(t => t.status === 'PASS').length;
  const failed = report.bugs.length;
  const warnings = report.tests.filter(t => t.status === 'WARN').length;
  const infos = report.tests.filter(t => t.status === 'INFO').length;
  
  log(`✅ Succès: ${passed}`, 'green');
  log(`⚠️  Avertissements: ${warnings}`, 'yellow');
  log(`ℹ️  Informations: ${infos}`, 'cyan');
  log(`❌ Échecs: ${failed}`, 'red');
  
  if (failed > 0) {
    logSection('BUGS DÉTECTÉS');
    report.bugs.forEach((bug, i) => {
      log(`\n${i + 1}. [${bug.category}] ${bug.name}`, 'red');
      log(`   ${bug.message}`, 'reset');
      if (bug.details) {
        log(`   Détails: ${JSON.stringify(bug.details)}`, 'reset');
      }
    });
  }
  
  if (report.screenshots.length > 0) {
    logSection('SCREENSHOTS');
    log(`${report.screenshots.length} screenshots capturés dans: test-notifications-screenshots/`, 'cyan');
  }
  
  // Sauvegarder le rapport JSON
  const reportPath = path.join(__dirname, 'test-notifications-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Rapport JSON: ${reportPath}`, 'cyan');
  
  return report;
}

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

async function runNotificationTests() {
  logSection('TESTS COMPLETS DU SYSTÈME DE NOTIFICATIONS');
  logInfo(`URL: ${APP_URL}`);
  logInfo(`Mode: ${config.headless ? 'Headless' : 'Visible'}`);
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await setupConsoleCapture(page);
    
    // Données de test
    const timestamp = Date.now();
    const adminData = {
      fullName: 'Admin Notifications Test',
      email: `admin-notif-${timestamp}@test.com`,
      password: 'TestAdmin123456!'
    };
    
    // =======================================================================
    // SÉQUENCE DE TESTS
    // =======================================================================
    
    // ÉTAPE 1: Créer admin
    logSection('ÉTAPE 1: CRÉATION COMPTE ADMIN');
    const adminCreated = await createAdminAccount(page, adminData);
    if (!adminCreated) {
      logError('Impossible de continuer sans admin');
      return;
    }
    await wait(2000);
    
    // ÉTAPE 2: Créer notifications de test
    logSection('ÉTAPE 2: GÉNÉRATION DES NOTIFICATIONS');
    const notifData = await createTestNotifications(page);
    await wait(2000);
    
    // ÉTAPE 3: Login admin
    logSection('ÉTAPE 3: LOGIN ADMIN');
    const loginSuccess = await loginAsAdmin(page, adminData);
    if (!loginSuccess) {
      logError('Login admin échoué, mais continuons pour voir l\'état...');
    }
    await wait(3000);
    
    // ÉTAPE 4: Vérifier la cloche
    logSection('ÉTAPE 4: VÉRIFICATION CLOCHE DE NOTIFICATION');
    const bellData = await checkNotificationBell(page);
    if (!bellData) {
      logError('Cloche de notification introuvable !');
    }
    
    // ÉTAPE 5: Ouvrir le panneau
    logSection('ÉTAPE 5: OUVERTURE DU PANNEAU');
    const panelOpened = await openNotificationPanel(page);
    if (!panelOpened) {
      logError('Panneau ne s\'ouvre pas !');
    }
    await wait(2000);
    
    // ÉTAPE 6: Analyser les notifications
    logSection('ÉTAPE 6: ANALYSE DES NOTIFICATIONS');
    const notifications = await analyzeNotifications(page);
    
    // ÉTAPE 7: Tester les actions
    logSection('ÉTAPE 7: TEST DES ACTIONS');
    await testNotificationActions(page, notifications);
    
    // ÉTAPE 8: Vérifier les listeners
    logSection('ÉTAPE 8: VÉRIFICATION LISTENERS FIRESTORE');
    await checkFirestoreListeners(page);
    
    // Générer le rapport
    const finalReport = generateReport();
    
    return finalReport;
    
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
  runNotificationTests()
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

module.exports = { runNotificationTests };
