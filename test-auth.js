const axios = require('axios');

const baseURL = 'http://localhost:3000';

async function testAuthentication() {
  console.log('🔍 Testing Authentication System\n');
  
  const testCases = [
    {
      name: 'Client Login',
      email: 'client@example.com',
      password: 'Client123!'
    },
    {
      name: 'Designer Login',
      email: 'designer@example.com',
      password: 'Designer123!'
    },
    {
      name: 'Admin Login',
      email: 'admin@womenindesign.community',
      password: 'AdminPass123!'
    }
  ];
  
  for (const test of testCases) {
    console.log(`\n📝 Testing: ${test.name}`);
    console.log(`   Email: ${test.email}`);
    
    try {
      const response = await axios.post(`${baseURL}/api/auth/login`, {
        email: test.email,
        password: test.password
      });
      
      if (response.data.success) {
        console.log(`   ✅ Login successful!`);
        console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
        console.log(`   User Role: ${response.data.data.user.role}`);
        console.log(`   User Name: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
        
        // Test token verification
        const verifyResponse = await axios.get(`${baseURL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${response.data.data.token}`
          }
        });
        
        if (verifyResponse.data.success) {
          console.log(`   ✅ Token verification successful!`);
        }
      } else {
        console.log(`   ❌ Login failed: ${response.data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
    }
  }
  
  // Test registration
  console.log('\n\n📝 Testing Registration');
  const newUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'client',
    phoneNumber: '+256700111222'
  };
  
  try {
    const response = await axios.post(`${baseURL}/api/auth/register`, newUser);
    
    if (response.data.success) {
      console.log(`   ✅ Registration successful!`);
      console.log(`   User ID: ${response.data.data.user.id}`);
      console.log(`   Email: ${response.data.data.user.email}`);
    } else {
      console.log(`   ❌ Registration failed: ${response.data.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
  }
  
  console.log('\n\n✨ Authentication testing complete!');
}

testAuthentication().catch(console.error);