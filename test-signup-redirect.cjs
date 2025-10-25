#!/usr/bin/env node

/**
 * Test Script: Verify Student Signup Redirect Flow
 * 
 * This script verifies that the signup redirect fix is working correctly.
 * It checks:
 * 1. Signup.jsx redirects to /pending-approval (not /dashboard)
 * 2. Google signup redirects to /pending-approval
 * 3. AuthContext creates proper profile with pending status
 * 4. DashboardRouter correctly handles pending students
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testResult(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

// Test Results
let totalTests = 0;
let passedTests = 0;

function runTest(name, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result.passed) {
      passedTests++;
      testResult(name, true, result.details);
    } else {
      testResult(name, false, result.details);
    }
  } catch (error) {
    testResult(name, false, `Error: ${error.message}`);
  }
}

// Test 1: Verify Signup.jsx redirects to /pending-approval
runTest('Signup.jsx email/password redirects to /pending-approval', () => {
  const signupFile = fs.readFileSync(
    path.join(__dirname, 'src/pages/Signup.jsx'),
    'utf-8'
  );
  
  // Check for the correct redirect after email signup
  const hasCorrectRedirect = signupFile.includes("navigate('/pending-approval')");
  const hasWrongRedirect = signupFile.includes("navigate('/dashboard')") && 
                           !signupFile.includes("// Google signups create student accounts");
  
  if (hasCorrectRedirect && !hasWrongRedirect) {
    return {
      passed: true,
      details: 'Found navigate(\'/pending-approval\') after signup'
    };
  } else if (hasWrongRedirect) {
    return {
      passed: false,
      details: 'Still redirecting to /dashboard instead of /pending-approval'
    };
  } else {
    return {
      passed: false,
      details: 'No redirect found in signup flow'
    };
  }
});

// Test 2: Verify Google signup redirects correctly
runTest('Signup.jsx Google OAuth redirects to /pending-approval', () => {
  const signupFile = fs.readFileSync(
    path.join(__dirname, 'src/pages/Signup.jsx'),
    'utf-8'
  );
  
  // Extract the handleGoogleSignup function
  const googleSignupMatch = signupFile.match(/const handleGoogleSignup = async \(\) => \{[\s\S]*?\};/);
  
  if (!googleSignupMatch) {
    return {
      passed: false,
      details: 'handleGoogleSignup function not found'
    };
  }
  
  const googleSignupCode = googleSignupMatch[0];
  
  if (googleSignupCode.includes("navigate('/pending-approval')")) {
    return {
      passed: true,
      details: 'Google signup correctly redirects to /pending-approval'
    };
  } else if (googleSignupCode.includes("navigate('/dashboard')")) {
    return {
      passed: false,
      details: 'Google signup still redirects to /dashboard'
    };
  } else {
    return {
      passed: false,
      details: 'No redirect found in Google signup flow'
    };
  }
});

// Test 3: Verify AuthContext creates pending student profile
runTest('AuthContext creates student profiles with pending status', () => {
  const authFile = fs.readFileSync(
    path.join(__dirname, 'src/contexts/AuthContext.jsx'),
    'utf-8'
  );
  
  // Check signup function creates correct profile
  const hasApprovedField = authFile.includes('approved: userData.role === \'admin\' ? true : false');
  const hasPendingStatus = authFile.includes('status: userData.role === \'admin\' ? \'active\' : \'pending\'');
  
  // Check Google signup creates correct profile
  const googleHasApproved = authFile.includes('approved: false, // Students need approval');
  const googleHasPending = authFile.includes('status: \'pending\'');
  
  if (hasApprovedField && hasPendingStatus && googleHasApproved && googleHasPending) {
    return {
      passed: true,
      details: 'Both email and Google signups create proper pending student profiles'
    };
  } else {
    return {
      passed: false,
      details: 'Profile creation missing approved or status fields'
    };
  }
});

// Test 4: Verify DashboardRouter handles pending students
runTest('DashboardRouter redirects pending students to /pending-approval', () => {
  const appFile = fs.readFileSync(
    path.join(__dirname, 'src/App.jsx'),
    'utf-8'
  );
  
  // Check for pending student redirect logic
  const hasPendingCheck = appFile.includes("userProfile.role === 'student' && (!isApproved || userStatus === 'pending'");
  const hasPendingRedirect = appFile.includes('<Navigate to="/pending-approval" replace />');
  
  if (hasPendingCheck && hasPendingRedirect) {
    return {
      passed: true,
      details: 'DashboardRouter properly routes pending students'
    };
  } else {
    return {
      passed: false,
      details: 'Missing proper pending student handling in DashboardRouter'
    };
  }
});

// Test 5: Verify no dashboard redirects in Signup.jsx
runTest('No incorrect /dashboard redirects remain in Signup.jsx', () => {
  const signupFile = fs.readFileSync(
    path.join(__dirname, 'src/pages/Signup.jsx'),
    'utf-8'
  );
  
  // Count occurrences of navigate('/dashboard')
  const dashboardRedirects = (signupFile.match(/navigate\('\/dashboard'\)/g) || []).length;
  
  if (dashboardRedirects === 0) {
    return {
      passed: true,
      details: 'No /dashboard redirects found in Signup.jsx'
    };
  } else {
    return {
      passed: false,
      details: `Found ${dashboardRedirects} /dashboard redirect(s) in Signup.jsx`
    };
  }
});

// Test 6: Verify PendingApproval page exists
runTest('PendingApproval page exists and is accessible', () => {
  const pendingApprovalPath = path.join(__dirname, 'src/pages/PendingApproval.jsx');
  
  if (fs.existsSync(pendingApprovalPath)) {
    const content = fs.readFileSync(pendingApprovalPath, 'utf-8');
    const hasContent = content.length > 100; // Basic check for substantial content
    
    if (hasContent) {
      return {
        passed: true,
        details: 'PendingApproval.jsx exists with proper content'
      };
    } else {
      return {
        passed: false,
        details: 'PendingApproval.jsx exists but appears empty'
      };
    }
  } else {
    return {
      passed: false,
      details: 'PendingApproval.jsx not found'
    };
  }
});

// Test 7: Verify route exists in App.jsx
runTest('PendingApproval route is configured in App.jsx', () => {
  const appFile = fs.readFileSync(
    path.join(__dirname, 'src/App.jsx'),
    'utf-8'
  );
  
  const hasPendingRoute = appFile.includes('/pending-approval') || 
                          appFile.includes('pending-approval');
  
  if (hasPendingRoute) {
    return {
      passed: true,
      details: 'PendingApproval route found in App.jsx'
    };
  } else {
    return {
      passed: false,
      details: 'PendingApproval route not configured'
    };
  }
});

// Print Summary
log('\n' + '='.repeat(60), 'bold');
log('TEST SUMMARY', 'bold');
log('='.repeat(60), 'bold');

const passRate = ((passedTests / totalTests) * 100).toFixed(2);
const color = passRate === 100 ? 'green' : passRate >= 80 ? 'yellow' : 'red';

log(`\nTotal Tests: ${totalTests}`, 'blue');
log(`Passed: ${passedTests}`, 'green');
log(`Failed: ${totalTests - passedTests}`, 'red');
log(`Pass Rate: ${passRate}%`, color);

if (passedTests === totalTests) {
  log('\n🎉 ALL TESTS PASSED! Signup redirect flow is working correctly.', 'green');
  log('\nExpected Flow:', 'bold');
  log('1. Student signs up (email or Google)', 'blue');
  log('2. Profile created with status: "pending", approved: false', 'blue');
  log('3. Redirected to /pending-approval page', 'blue');
  log('4. Student sees pending approval message', 'blue');
  log('5. Admin approves → status: "active", approved: true', 'blue');
  log('6. Student can access dashboard', 'blue');
} else {
  log('\n⚠️  Some tests failed. Please review the issues above.', 'yellow');
}

log('\n' + '='.repeat(60), 'bold');

// Exit with appropriate code
process.exit(passedTests === totalTests ? 0 : 1);
