const { Client } = require('pg');

async function testConnection() {
  const configs = [
    {
      name: 'Config with port 5433',
      host: 'localhost',
      port: 5433,
      database: 'postgres',
      user: 'postgres',
      password: 'G256f5080@'
    },
    {
      name: 'Config with port 5432',
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'G256f5080@'
    },
    {
      name: 'Config without password',
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: ''
    }
  ];

  for (const config of configs) {
    console.log(`\n🔍 Testing: ${config.name}`);
    const client = new Client(config);
    
    try {
      await client.connect();
      console.log(`✅ SUCCESS: Connected with ${config.name}`);
      
      const result = await client.query('SELECT current_database(), current_user, version()');
      console.log('Database:', result.rows[0].current_database);
      console.log('User:', result.rows[0].current_user);
      console.log('Version:', result.rows[0].version.split('\n')[0]);
      
      await client.end();
      return config; // Return successful config
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
    }
  }
  
  return null;
}

testConnection().then(config => {
  if (config) {
    console.log('\n✨ Successful configuration found!');
    console.log('Update your .env.local with:');
    console.log(`DB_PORT=${config.port}`);
    console.log(`DB_PASSWORD=${config.password || '(no password)'}`);
  } else {
    console.log('\n❌ No working configuration found');
  }
});