const axios = require('axios');
const { Client } = require('pg');

// Configuration
const config = {
  apiBaseUrl: 'http://localhost:3000',
  liveBaseUrl: 'https://womenindesign.community',
  database: {
    host: 'localhost',
    port: 5433,
    database: 'designer_portal',
    user: 'postgres',
    password: 'G256f5080@'
  }
};

// Test results storage
const testResults = {
  database: {},
  authentication: {},
  api: {},
  frontend: {},
  mobile: {},
  integration: {}
};

// Utility functions
function logTest(category, testName, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} [${category}] ${testName}: ${status}${details ? ' - ' + details : ''}`);
  
  if (!testResults[category.toLowerCase()]) {
    testResults[category.toLowerCase()] = {};
  }
  testResults[category.toLowerCase()][testName] = { status, details };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Database Tests
async function testDatabase() {
  console.log('\n🔍 TESTING DATABASE CONNECTIVITY...\n');
  
  const client = new Client(config.database);
  
  try {
    // Test connection
    await client.connect();
    logTest('DATABASE', 'Connection', 'PASS', 'PostgreSQL connected successfully');
    
    // Test tables exist
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    const tables = await client.query(tableQuery);
    const expectedTables = [
      'users', 'designer_profiles', 'supplier_profiles', 
      'portfolio_items', 'hiring_requests', 'conversations', 
      'messages', 'project_reviews', 'supplier_reviews',
      'analytics_events', 'payment_transactions'
    ];
    
    const existingTables = tables.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      logTest('DATABASE', 'Schema', 'PASS', `All ${expectedTables.length} tables exist`);
    } else {
      logTest('DATABASE', 'Schema', 'FAIL', `Missing tables: ${missingTables.join(', ')}`);
    }
    
    // Test sample data
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const userCountNum = parseInt(userCount.rows[0].count);
    
    if (userCountNum >= 4) {
      logTest('DATABASE', 'Sample Data', 'PASS', `${userCountNum} users in database`);
    } else {
      logTest('DATABASE', 'Sample Data', 'WARN', `Only ${userCountNum} users found`);
    }
    
    // Test user roles
    const roleQuery = await client.query('SELECT DISTINCT role FROM users ORDER BY role');
    const roles = roleQuery.rows.map(row => row.role);
    const expectedRoles = ['admin', 'client', 'designer', 'supplier'];
    const hasAllRoles = expectedRoles.every(role => roles.includes(role));
    
    if (hasAllRoles) {
      logTest('DATABASE', 'User Roles', 'PASS', `All roles present: ${roles.join(', ')}`);
    } else {
      logTest('DATABASE', 'User Roles', 'WARN', `Roles found: ${roles.join(', ')}`);
    }
    
    await client.end();
    
  } catch (error) {
    logTest('DATABASE', 'Connection', 'FAIL', error.message);
    try {
      await client.end();
    } catch {}
  }
}

// Authentication Tests
async function testAuthentication() {
  console.log('\n🔐 TESTING AUTHENTICATION SYSTEM...\n');
  
  const testUsers = [
    { email: 'admin@womenindesign.community', password: 'AdminPass123!', role: 'admin' },
    { email: 'designer@example.com', password: 'Designer123!', role: 'designer' },
    { email: 'client@example.com', password: 'Client123!', role: 'client' },
    { email: 'supplier@example.com', password: 'Supplier123!', role: 'supplier' }
  ];
  
  for (const user of testUsers) {
    try {
      // Test login
      const loginResponse = await axios.post(`${config.apiBaseUrl}/api/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      if (loginResponse.data.success) {
        logTest('AUTH', `${user.role} Login`, 'PASS', `Token received`);
        
        // Test token verification
        const token = loginResponse.data.data.token;
        const verifyResponse = await axios.get(`${config.apiBaseUrl}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (verifyResponse.data.success && verifyResponse.data.data.user.role === user.role) {
          logTest('AUTH', `${user.role} Token Verify`, 'PASS', `Role: ${verifyResponse.data.data.user.role}`);
        } else {
          logTest('AUTH', `${user.role} Token Verify`, 'FAIL', 'Token verification failed');
        }
        
      } else {
        logTest('AUTH', `${user.role} Login`, 'FAIL', loginResponse.data.error);
      }
      
    } catch (error) {
      logTest('AUTH', `${user.role} Login`, 'FAIL', error.response?.data?.error || error.message);
    }
    
    await sleep(100); // Rate limiting
  }
  
  // Test registration
  try {
    const newUser = {
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'client',
      phoneNumber: '+256700111222'
    };
    
    const registerResponse = await axios.post(`${config.apiBaseUrl}/api/auth/register`, newUser);
    
    if (registerResponse.data.success) {
      logTest('AUTH', 'Registration', 'PASS', `New user created: ${newUser.email}`);
    } else {
      logTest('AUTH', 'Registration', 'FAIL', registerResponse.data.error);
    }
    
  } catch (error) {
    logTest('AUTH', 'Registration', 'FAIL', error.response?.data?.error || error.message);
  }
}

// API Endpoint Tests
async function testAPIEndpoints() {
  console.log('\n🌐 TESTING API ENDPOINTS...\n');
  
  const endpoints = [
    { path: '/api/health', method: 'GET', expected: 200 },
    { path: '/api/public/featured-designers', method: 'GET', expected: 200 },
    { path: '/api/public/featured-suppliers', method: 'GET', expected: 200 },
    { path: '/api/stats', method: 'GET', expected: 200 }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${config.apiBaseUrl}${endpoint.path}`,
        timeout: 10000
      });
      
      if (response.status === endpoint.expected) {
        logTest('API', endpoint.path, 'PASS', `Status: ${response.status}`);
        
        // Check data structure for specific endpoints
        if (endpoint.path.includes('featured-designers') && response.data.success) {
          const designers = response.data.data;
          if (Array.isArray(designers) && designers.length > 0) {
            logTest('API', 'Featured Designers Data', 'PASS', `${designers.length} designers loaded`);
          } else {
            logTest('API', 'Featured Designers Data', 'WARN', 'Using fallback data');
          }
        }
        
        if (endpoint.path.includes('featured-suppliers') && response.data.success) {
          const suppliers = response.data.data;
          if (Array.isArray(suppliers) && suppliers.length > 0) {
            logTest('API', 'Featured Suppliers Data', 'PASS', `${suppliers.length} suppliers loaded`);
          } else {
            logTest('API', 'Featured Suppliers Data', 'WARN', 'Using fallback data');
          }
        }
        
      } else {
        logTest('API', endpoint.path, 'FAIL', `Expected ${endpoint.expected}, got ${response.status}`);
      }
      
    } catch (error) {
      logTest('API', endpoint.path, 'FAIL', error.response?.status || error.message);
    }
    
    await sleep(100);
  }
}

// Frontend Tests
async function testFrontend() {
  console.log('\n🖥️ TESTING FRONTEND PAGES...\n');
  
  const pages = [
    { path: '/landing', name: 'Landing Page' },
    { path: '/auth/login', name: 'Login Page' },
    { path: '/auth/register', name: 'Register Page' },
    { path: '/mobile-test', name: 'Mobile Test Page' }
  ];
  
  for (const page of pages) {
    try {
      const response = await axios.get(`${config.apiBaseUrl}${page.path}`, {
        timeout: 10000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        logTest('FRONTEND', page.name, 'PASS', `Status: ${response.status}`);
        
        // Check for key content
        if (page.path === '/landing' && response.data.includes('Women in Design')) {
          logTest('FRONTEND', 'Landing Content', 'PASS', 'WID branding found');
        }
        
      } else {
        logTest('FRONTEND', page.name, 'WARN', `Status: ${response.status}`);
      }
      
    } catch (error) {
      logTest('FRONTEND', page.name, 'FAIL', error.response?.status || error.message);
    }
    
    await sleep(100);
  }
}

// Live Site Tests
async function testLiveSite() {
  console.log('\n🌍 TESTING LIVE DEPLOYMENT...\n');
  
  try {
    // Test live site accessibility
    const response = await axios.get(`${config.liveBaseUrl}/landing`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    
    if (response.status === 200) {
      logTest('LIVE', 'Site Accessibility', 'PASS', 'Site loads successfully');
      
      // Check for mobile optimizations
      if (response.data.includes('mobile-responsive.css')) {
        logTest('LIVE', 'Mobile CSS', 'PASS', 'Mobile styles loaded');
      }
      
      // Check for social media links
      if (response.data.includes('instagram.com/womenindesignug')) {
        logTest('LIVE', 'Social Media', 'PASS', 'Instagram link found');
      }
      
      if (response.data.includes('tiktok.com/@womenindesignug')) {
        logTest('LIVE', 'Social Media', 'PASS', 'TikTok link found');
      }
      
    } else {
      logTest('LIVE', 'Site Accessibility', 'FAIL', `Status: ${response.status}`);
    }
    
  } catch (error) {
    logTest('LIVE', 'Site Accessibility', 'FAIL', error.message);
  }
  
  // Test mobile test page
  try {
    const mobileTestResponse = await axios.get(`${config.liveBaseUrl}/mobile-test`, {
      timeout: 10000
    });
    
    if (mobileTestResponse.status === 200) {
      logTest('LIVE', 'Mobile Test Page', 'PASS', 'Test page accessible');
    }
    
  } catch (error) {
    logTest('LIVE', 'Mobile Test Page', 'FAIL', error.message);
  }
}

// Performance Tests
async function testPerformance() {
  console.log('\n⚡ TESTING PERFORMANCE...\n');
  
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${config.apiBaseUrl}/landing`, {
      timeout: 5000
    });
    
    const loadTime = Date.now() - startTime;
    
    if (loadTime < 2000) {
      logTest('PERFORMANCE', 'Page Load Time', 'PASS', `${loadTime}ms`);
    } else if (loadTime < 4000) {
      logTest('PERFORMANCE', 'Page Load Time', 'WARN', `${loadTime}ms`);
    } else {
      logTest('PERFORMANCE', 'Page Load Time', 'FAIL', `${loadTime}ms`);
    }
    
  } catch (error) {
    logTest('PERFORMANCE', 'Page Load Time', 'FAIL', error.message);
  }
}

// Error Handling Tests
async function testErrorHandling() {
  console.log('\n🚨 TESTING ERROR HANDLING...\n');
  
  // Test invalid login
  try {
    const response = await axios.post(`${config.apiBaseUrl}/api/auth/login`, {
      email: 'invalid@test.com',
      password: 'wrongpassword'
    });
    
    if (response.data.success === false) {
      logTest('ERROR', 'Invalid Login', 'PASS', 'Properly rejected');
    } else {
      logTest('ERROR', 'Invalid Login', 'FAIL', 'Should have been rejected');
    }
    
  } catch (error) {
    if (error.response?.status === 401 || error.response?.data?.success === false) {
      logTest('ERROR', 'Invalid Login', 'PASS', 'Properly rejected');
    } else {
      logTest('ERROR', 'Invalid Login', 'FAIL', error.message);
    }
  }
  
  // Test invalid endpoint
  try {
    const response = await axios.get(`${config.apiBaseUrl}/api/nonexistent`, {
      validateStatus: () => true
    });
    
    if (response.status === 404) {
      logTest('ERROR', 'Invalid Endpoint', 'PASS', '404 returned');
    } else {
      logTest('ERROR', 'Invalid Endpoint', 'WARN', `Status: ${response.status}`);
    }
    
  } catch (error) {
    logTest('ERROR', 'Invalid Endpoint', 'FAIL', error.message);
  }
}

// Generate Test Report
function generateReport() {
  console.log('\n📊 FULL STACK TEST REPORT\n');
  console.log('=' * 50);
  
  let totalTests = 0;
  let passedTests = 0;
  let warningTests = 0;
  let failedTests = 0;
  
  Object.keys(testResults).forEach(category => {
    const categoryTests = testResults[category];
    const categoryName = category.toUpperCase();
    
    if (Object.keys(categoryTests).length > 0) {
      console.log(`\n${categoryName}:`);
      
      Object.keys(categoryTests).forEach(testName => {
        const result = categoryTests[testName];
        const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`  ${emoji} ${testName}: ${result.status}${result.details ? ' - ' + result.details : ''}`);
        
        totalTests++;
        if (result.status === 'PASS') passedTests++;
        else if (result.status === 'WARN') warningTests++;
        else failedTests++;
      });
    }
  });
  
  console.log('\n' + '=' * 50);
  console.log('SUMMARY:');
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  if (warningTests > 0) console.log(`⚠️ Warnings: ${warningTests}`);
  if (failedTests > 0) console.log(`❌ Failed: ${failedTests}`);
  
  const overallStatus = failedTests === 0 ? (warningTests === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS ATTENTION';
  console.log(`\n🎯 Overall Status: ${overallStatus}`);
  
  if (overallStatus === 'EXCELLENT') {
    console.log('🎉 Full stack implementation is working perfectly!');
  } else if (overallStatus === 'GOOD') {
    console.log('✨ Full stack implementation is working well with minor issues.');
  } else {
    console.log('🔧 Full stack implementation needs attention for failed tests.');
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 STARTING FULL STACK TESTING...\n');
  console.log('Testing WID Uganda Platform Implementation');
  console.log('=' * 50);
  
  try {
    await testDatabase();
    await testAuthentication();
    await testAPIEndpoints();
    await testFrontend();
    await testLiveSite();
    await testPerformance();
    await testErrorHandling();
    
    generateReport();
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  }
}

// Execute tests
runAllTests().catch(console.error);