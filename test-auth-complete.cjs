#!/usr/bin/env node

/**
 * 🔐 COMPLETE AUTHENTICATION & SUBSCRIPTION TEST SUITE
 * 
 * This script tests all login and subscription-related functionality:
 * - Login page and authentication
 * - Signup/registration flow
 * - Password reset functionality
 * - Profile creation
 * - Pending approval workflow
 * - Protected routes
 * - Role-based redirects
 * 
 * Run with: node test-auth-complete.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
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

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  total: 0
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function pass(testName, details = '') {
  testResults.passed.push({ name: testName, details });
  testResults.total++;
  log(`✅ PASS: ${testName}`, 'green');
  if (details) log(`   → ${details}`, 'reset');
}

function fail(testName, reason) {
  testResults.failed.push({ name: testName, reason });
  testResults.total++;
  log(`❌ FAIL: ${testName}`, 'red');
  log(`   → ${reason}`, 'red');
}

function warn(message) {
  testResults.warnings.push(message);
  log(`⚠️  WARNING: ${message}`, 'yellow');
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    pass(`File exists: ${description}`, filePath);
  } else {
    fail(`File missing: ${description}`, filePath);
  }
  return exists;
}

function checkComponentContent(filePath, componentName, requiredPatterns) {
  if (!fs.existsSync(filePath)) {
    fail(`Component not found: ${componentName}`, filePath);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let allPassed = true;

  requiredPatterns.forEach(({ pattern, description }) => {
    const regex = new RegExp(pattern);
    if (regex.test(content)) {
      pass(`${componentName}: ${description}`);
    } else {
      fail(`${componentName}: ${description}`, `Pattern not found: ${pattern}`);
      allPassed = false;
    }
  });

  return allPassed;
}

// Test 1: Check Login Component
function testLoginComponent() {
  logSection('TEST 1: LOGIN COMPONENT');
  
  const loginPath = './src/pages/Login.jsx';
  
  if (!checkFileExists(loginPath, 'Login component')) {
    return;
  }

  const requiredFeatures = [
    { pattern: 'useState.*email', description: 'Email state management' },
    { pattern: 'useState.*password', description: 'Password state management' },
    { pattern: 'useState.*showPassword', description: 'Show/hide password feature' },
    { pattern: 'useState.*rememberMe', description: 'Remember me checkbox' },
    { pattern: 'handleSubmit', description: 'Form submission handler' },
    { pattern: 'login.*email.*password', description: 'Login function call' },
    { pattern: 'loginWithGoogle', description: 'Google login integration' },
    { pattern: 'type.*email', description: 'Email input field' },
    { pattern: 'type=.*password', description: 'Password input field' },
    { pattern: 'EyeIcon|EyeSlashIcon', description: 'Password visibility toggle icons' },
    { pattern: 'forgot-password', description: 'Forgot password link' },
    { pattern: '/signup', description: 'Signup page link' },
    { pattern: 'toast\\.error', description: 'Error toast notifications' },
    { pattern: 'isArabic', description: 'Bilingual support (FR/AR)' },
    { pattern: 'disabled=.*loading', description: 'Loading state handling' }
  ];

  checkComponentContent(loginPath, 'Login', requiredFeatures);
}

// Test 2: Check Signup Component
function testSignupComponent() {
  logSection('TEST 2: SIGNUP/REGISTRATION COMPONENT');
  
  const signupPath = './src/pages/Signup.jsx';
  
  if (!checkFileExists(signupPath, 'Signup component')) {
    return;
  }

  const requiredFeatures = [
    { pattern: 'fullName', description: 'Full name field' },
    { pattern: 'email', description: 'Email field' },
    { pattern: 'password', description: 'Password field' },
    { pattern: 'confirmPassword', description: 'Confirm password field' },
    { pattern: 'agreeToTerms', description: 'Terms & conditions checkbox' },
    { pattern: 'validatePassword', description: 'Password validation function' },
    { pattern: 'passwordStrength', description: 'Password strength indicator' },
    { pattern: 'length.*uppercase.*lowercase.*number', description: 'Password requirements' },
    { pattern: 'PasswordRequirement', description: 'Password requirement component' },
    { pattern: 'signup.*email.*password', description: 'Signup function call' },
    { pattern: 'role.*student', description: 'Student role assignment' },
    { pattern: 'loginWithGoogle', description: 'Google signup integration' },
    { pattern: 'pending.*approval', description: 'Approval workflow message' },
    { pattern: 'CheckCircleIcon|XCircleIcon', description: 'Validation icons' }
  ];

  checkComponentContent(signupPath, 'Signup', requiredFeatures);
}

// Test 3: Check Forgot Password Component
function testForgotPasswordComponent() {
  logSection('TEST 3: FORGOT PASSWORD COMPONENT');
  
  const forgotPath = './src/pages/ForgotPassword.jsx';
  
  if (!checkFileExists(forgotPath, 'ForgotPassword component')) {
    return;
  }

  const requiredFeatures = [
    { pattern: 'useState.*email', description: 'Email state' },
    { pattern: 'useState.*emailSent', description: 'Email sent confirmation state' },
    { pattern: 'resetPassword', description: 'Password reset function' },
    { pattern: 'handleSubmit', description: 'Form submission' },
    { pattern: 'type.*email', description: 'Email input field' },
    { pattern: 'emailSent.*true', description: 'Success message display' },
    { pattern: '/login', description: 'Back to login link' },
    { pattern: 'EnvelopeIcon', description: 'Email icon' },
    { pattern: 'toast\\.success', description: 'Success notification' }
  ];

  checkComponentContent(forgotPath, 'ForgotPassword', requiredFeatures);
}

// Test 4: Check CreateProfile Component
function testCreateProfileComponent() {
  logSection('TEST 4: CREATE PROFILE COMPONENT');
  
  const profilePath = './src/pages/CreateProfile.jsx';
  
  if (!checkFileExists(profilePath, 'CreateProfile component')) {
    return;
  }

  const requiredFeatures = [
    { pattern: 'checkExistingProfile', description: 'Profile existence check' },
    { pattern: 'getDoc.*users', description: 'Firestore user document check' },
    { pattern: 'setDoc.*users', description: 'User profile creation' },
    { pattern: 'fullName', description: 'Full name field' },
    { pattern: 'role', description: 'Role selection' },
    { pattern: 'student|teacher|admin', description: 'Role options' },
    { pattern: 'navigate.*dashboard', description: 'Dashboard redirect' },
    { pattern: 'checking', description: 'Loading state for check' }
  ];

  checkComponentContent(profilePath, 'CreateProfile', requiredFeatures);
}

// Test 5: Check PendingApproval Component
function testPendingApprovalComponent() {
  logSection('TEST 5: PENDING APPROVAL COMPONENT');
  
  const pendingPath = './src/pages/PendingApproval.jsx';
  
  if (!checkFileExists(pendingPath, 'PendingApproval component')) {
    return;
  }

  const requiredFeatures = [
    { pattern: 'userProfile', description: 'User profile access' },
    { pattern: 'status.*rejected', description: 'Rejected status handling' },
    { pattern: 'status.*pending', description: 'Pending status handling' },
    { pattern: 'ClockIcon', description: 'Pending icon' },
    { pattern: 'XCircleIcon', description: 'Rejected icon' },
    { pattern: 'logout', description: 'Logout functionality' },
    { pattern: 'fullName.*email', description: 'User info display' },
    { pattern: 'contact.*administration', description: 'Contact information' }
  ];

  checkComponentContent(pendingPath, 'PendingApproval', requiredFeatures);
}

// Test 6: Check AuthContext
function testAuthContext() {
  logSection('TEST 6: AUTHENTICATION CONTEXT');
  
  const authPath = './src/contexts/AuthContext.jsx';
  
  if (!checkFileExists(authPath, 'AuthContext')) {
    return;
  }

  const requiredFeatures = [
    { pattern: 'createUserWithEmailAndPassword', description: 'Email/password signup' },
    { pattern: 'signInWithEmailAndPassword', description: 'Email/password login' },
    { pattern: 'signOut', description: 'Logout function' },
    { pattern: 'sendPasswordResetEmail', description: 'Password reset' },
    { pattern: 'GoogleAuthProvider', description: 'Google authentication' },
    { pattern: 'signInWithPopup', description: 'Google popup signin' },
    { pattern: 'sendEmailVerification', description: 'Email verification' },
    { pattern: 'setPersistence', description: 'Session persistence' },
    { pattern: 'browserSessionPersistence', description: 'Session storage' },
    { pattern: 'browserLocalPersistence', description: 'Local storage' },
    { pattern: 'onAuthStateChanged', description: 'Auth state listener' },
    { pattern: 'currentUser', description: 'Current user state' },
    { pattern: 'userProfile', description: 'User profile state' },
    { pattern: 'approved.*status', description: 'Approval system' },
    { pattern: 'role.*admin.*teacher.*student', description: 'Role-based access' }
  ];

  checkComponentContent(authPath, 'AuthContext', requiredFeatures);
}

// Test 7: Check Protected Routes
function testProtectedRoutes() {
  logSection('TEST 7: PROTECTED ROUTES');
  
  const appPath = './src/App.jsx';
  
  if (!checkFileExists(appPath, 'App component')) {
    return;
  }

  const requiredFeatures = [
    { pattern: 'ProtectedRoute', description: 'Protected route component' },
    { pattern: 'Navigate.*login', description: 'Login redirect for unauthenticated' },
    { pattern: 'currentUser', description: 'Current user check' },
    { pattern: 'isAdmin', description: 'Admin role check' },
    { pattern: 'adminOnly', description: 'Admin-only routes' },
    { pattern: 'DashboardRouter', description: 'Dashboard routing logic' },
    { pattern: 'userProfile.*role', description: 'Role-based routing' }
  ];

  checkComponentContent(appPath, 'App (Protected Routes)', requiredFeatures);
}

// Test 8: Check Role-Based Redirects
function testRoleBasedRedirects() {
  logSection('TEST 8: ROLE-BASED REDIRECTS');
  
  const appPath = './src/App.jsx';
  
  if (!fs.existsSync(appPath)) {
    fail('App component not found', appPath);
    return;
  }

  const content = fs.readFileSync(appPath, 'utf8');
  
  const checks = [
    { pattern: /case\s+['"]admin['"]/, description: 'Admin role redirect' },
    { pattern: /case\s+['"]teacher['"]/, description: 'Teacher role redirect' },
    { pattern: /case\s+['"]student['"]/, description: 'Student role redirect' },
    { pattern: /AdminDashboard/, description: 'Admin dashboard component' },
    { pattern: /TeacherDashboard/, description: 'Teacher dashboard component' },
    { pattern: /StudentDashboard|EnhancedStudentDashboard/, description: 'Student dashboard component' },
    { pattern: /pending.*approval/, description: 'Pending approval redirect' },
    { pattern: /create-profile/, description: 'Profile creation redirect' }
  ];

  checks.forEach(({ pattern, description }) => {
    if (pattern.test(content)) {
      pass(`Role redirect: ${description}`);
    } else {
      fail(`Role redirect: ${description}`, 'Pattern not found in App.jsx');
    }
  });
}

// Test 9: Check Firebase Configuration
function testFirebaseConfig() {
  logSection('TEST 9: FIREBASE CONFIGURATION');
  
  const configPath = './src/config/firebase.js';
  
  if (!checkFileExists(configPath, 'Firebase config')) {
    return;
  }

  const content = fs.readFileSync(configPath, 'utf8');
  
  const checks = [
    { pattern: /initializeApp/, description: 'Firebase initialization' },
    { pattern: /getAuth/, description: 'Firebase Auth' },
    { pattern: /getFirestore/, description: 'Firebase Firestore' },
    { pattern: /getStorage/, description: 'Firebase Storage' },
    { pattern: /VITE_FIREBASE_API_KEY/, description: 'API Key env variable' },
    { pattern: /VITE_FIREBASE_AUTH_DOMAIN/, description: 'Auth domain env variable' },
    { pattern: /VITE_FIREBASE_PROJECT_ID/, description: 'Project ID env variable' }
  ];

  checks.forEach(({ pattern, description }) => {
    if (pattern.test(content)) {
      pass(`Firebase config: ${description}`);
    } else {
      fail(`Firebase config: ${description}`, 'Not found in firebase.js');
    }
  });
}

// Test 10: Check Environment Variables
function testEnvironmentVariables() {
  logSection('TEST 10: ENVIRONMENT VARIABLES');
  
  const envPath = './.env';
  const envExamplePath = './.env.example';
  
  if (checkFileExists(envExamplePath, '.env.example')) {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    requiredVars.forEach(varName => {
      if (content.includes(varName)) {
        pass(`Env variable template: ${varName}`);
      } else {
        fail(`Env variable template: ${varName}`, 'Not found in .env.example');
      }
    });
  }

  if (fs.existsSync(envPath)) {
    pass('Environment file exists', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('YOUR_API_KEY') || envContent.includes('demo-api-key')) {
      warn('.env contains placeholder values - update with real Firebase config');
    } else {
      pass('.env appears to have real Firebase configuration');
    }
  } else {
    warn('.env file not found - copy from .env.example and configure');
  }
}

// Test 11: Check Dashboard Components
function testDashboardComponents() {
  logSection('TEST 11: DASHBOARD COMPONENTS');
  
  const dashboards = [
    { path: './src/pages/StudentDashboard.jsx', name: 'StudentDashboard' },
    { path: './src/pages/EnhancedStudentDashboard.jsx', name: 'EnhancedStudentDashboard' },
    { path: './src/pages/AdminDashboard.jsx', name: 'AdminDashboard' },
    { path: './src/pages/TeacherDashboard.jsx', name: 'TeacherDashboard' }
  ];

  dashboards.forEach(({ path, name }) => {
    if (fs.existsSync(path)) {
      pass(`Dashboard component exists: ${name}`, path);
    } else {
      warn(`Dashboard component not found: ${name} at ${path}`);
    }
  });
}

// Test 12: Security Check
function testSecurityFeatures() {
  logSection('TEST 12: SECURITY FEATURES');
  
  // Check for security rules file
  checkFileExists('./firestore.rules', 'Firestore security rules');
  checkFileExists('./storage.rules', 'Storage security rules');
  
  // Check Login component for security features
  const loginPath = './src/pages/Login.jsx';
  if (fs.existsSync(loginPath)) {
    const content = fs.readFileSync(loginPath, 'utf8');
    
    if (/disabled=.*loading/.test(content)) {
      pass('Security: Login button disabled during loading');
    } else {
      warn('Login button should be disabled during loading to prevent multiple submits');
    }
    
    if (/type=.*password/.test(content)) {
      pass('Security: Password input uses type="password"');
    }
    
    if (/showPassword/.test(content)) {
      pass('Security: Password visibility toggle available');
    }
  }

  // Check Signup component for security features
  const signupPath = './src/pages/Signup.jsx';
  if (fs.existsSync(signupPath)) {
    const content = fs.readFileSync(signupPath, 'utf8');
    
    if (/minLength.*8/.test(content)) {
      pass('Security: Minimum password length enforced (8 characters)');
    } else {
      warn('Should enforce minimum password length of 8 characters');
    }
    
    if (/password.*confirmPassword/.test(content)) {
      pass('Security: Password confirmation field present');
    }
    
    if (/agreeToTerms/.test(content)) {
      pass('Security: Terms and conditions acceptance required');
    }
  }
}

// Generate Report
function generateReport() {
  logSection('TEST SUMMARY REPORT');
  
  const passRate = testResults.total > 0 
    ? ((testResults.passed.length / testResults.total) * 100).toFixed(2) 
    : 0;
  
  log(`Total Tests: ${testResults.total}`, 'bright');
  log(`✅ Passed: ${testResults.passed.length}`, 'green');
  log(`❌ Failed: ${testResults.failed.length}`, 'red');
  log(`⚠️  Warnings: ${testResults.warnings.length}`, 'yellow');
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');
  
  if (testResults.failed.length > 0) {
    console.log('\n' + '─'.repeat(80));
    log('FAILED TESTS:', 'red');
    console.log('─'.repeat(80));
    testResults.failed.forEach((test, index) => {
      log(`${index + 1}. ${test.name}`, 'red');
      log(`   Reason: ${test.reason}`, 'reset');
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n' + '─'.repeat(80));
    log('WARNINGS:', 'yellow');
    console.log('─'.repeat(80));
    testResults.warnings.forEach((warning, index) => {
      log(`${index + 1}. ${warning}`, 'yellow');
    });
  }
  
  console.log('\n' + '='.repeat(80));
  if (testResults.failed.length === 0) {
    log('🎉 ALL AUTHENTICATION TESTS PASSED! 🎉', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED - REVIEW ABOVE', 'yellow');
  }
  console.log('='.repeat(80) + '\n');
  
  // Save results to JSON
  const reportPath = './test-auth-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  log(`Report saved to: ${reportPath}`, 'cyan');
}

// Main execution
function runAllTests() {
  log('🔐 AUTHENTICATION & SUBSCRIPTION TEST SUITE', 'bright');
  log('Testing all login and registration functionality...', 'cyan');
  
  try {
    testLoginComponent();
    testSignupComponent();
    testForgotPasswordComponent();
    testCreateProfileComponent();
    testPendingApprovalComponent();
    testAuthContext();
    testProtectedRoutes();
    testRoleBasedRedirects();
    testFirebaseConfig();
    testEnvironmentVariables();
    testDashboardComponents();
    testSecurityFeatures();
    
    generateReport();
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
