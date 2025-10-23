#!/usr/bin/env node

import { Pool } from 'pg';
import fs from 'fs';

// Load environment variables from .env.local
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'designer_portal',
};

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📊 Connection config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    password: config.password ? '***hidden***' : 'not set'
  });

  const pool = new Pool(config);
  
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connection successful!');
    console.log('🕐 Current time:', result.rows[0].current_time);
    console.log('📦 PostgreSQL version:', result.rows[0].version);
    
    // Test if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 Existing tables:');
      tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    } else {
      console.log('📋 No tables found - database may need to be initialized');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();