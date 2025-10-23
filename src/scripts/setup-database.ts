#!/usr/bin/env node

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: 'postgres', // Connect to default database first
};

async function createDatabase() {
  const pool = new Pool(config);
  
  try {
    console.log('🔍 Connecting to PostgreSQL...');
    
    // Check if database exists
    const checkDb = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      ['designer_portal']
    );
    
    if (checkDb.rows.length === 0) {
      console.log('🏗️  Creating designer_portal database...');
      await pool.query('CREATE DATABASE designer_portal');
      console.log('✅ Database created successfully!');
    } else {
      console.log('ℹ️  Database designer_portal already exists');
    }
    
    await pool.end();
    
    // Now connect to the new database and run schema
    const dbPool = new Pool({
      ...config,
      database: 'designer_portal'
    });
    
    console.log('📋 Executing database schema...');
    const schemaPath = path.join(process.cwd(), 'src/lib/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await dbPool.query(schema);
    console.log('✅ Database schema executed successfully!');
    
    await dbPool.end();
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Load environment variables
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

createDatabase();