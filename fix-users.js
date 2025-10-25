const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const config = {
  host: 'localhost',
  port: 5433,
  database: 'designer_portal',
  user: 'postgres',
  password: 'G256f5080@'
};

async function fixUserPasswords() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('🔍 Fixing user passwords with bcrypt...\n');
    
    const users = [
      { email: 'admin@womenindesign.community', password: 'AdminPass123!' },
      { email: 'designer@example.com', password: 'Designer123!' },
      { email: 'supplier@example.com', password: 'Supplier123!' },
      { email: 'client@example.com', password: 'Client123!' }
    ];
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [hashedPassword, user.email]
      );
      
      console.log(`✅ Updated password for ${user.email}`);
    }
    
    // Verify the update
    const result = await client.query('SELECT email, role FROM users');
    console.log('\n📋 Users in database:');
    result.rows.forEach(row => {
      console.log(`   - ${row.email} (${row.role})`);
    });
    
    await client.end();
    console.log('\n🎉 Password update complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

fixUserPasswords();