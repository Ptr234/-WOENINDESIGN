import { query } from '../lib/database/connection';
import AuthService from '../lib/auth';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Admin user details
    const adminEmail = 'admin@womenindesignuganda.com';
    const adminPassword = 'AdminPass123!';
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if admin user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      return;
    }

    // Hash the password
    const hashedPassword = await AuthService.hashPassword(adminPassword);

    // Create admin user
    const result = await query(
      `INSERT INTO users (
        id, email, password_hash, role, first_name, last_name, 
        is_verified, is_active, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, true, true, NOW(), NOW()
      ) RETURNING id, email`,
      [adminEmail, hashedPassword, 'admin', firstName, lastName]
    );

    const adminUser = result.rows[0];

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 User ID:', adminUser.id);
    console.log('\n🎯 You can now login with these credentials to access the admin dashboard.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n🎉 Admin user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  });