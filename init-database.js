const { Client } = require('pg');

const config = {
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'G256f5080@'
};

async function setupDatabase() {
  // First connect to postgres database to create designer_portal
  let client = new Client({ ...config, database: 'postgres' });
  
  try {
    console.log('🔍 Connecting to PostgreSQL...');
    await client.connect();
    
    // Drop and create database
    try {
      await client.query('DROP DATABASE IF EXISTS designer_portal');
      console.log('✅ Dropped existing database');
    } catch (err) {
      console.log('📝 No existing database to drop');
    }
    
    await client.query('CREATE DATABASE designer_portal');
    console.log('✅ Created designer_portal database');
    
    await client.end();
    
    // Now connect to designer_portal
    client = new Client({ ...config, database: 'designer_portal' });
    await client.connect();
    console.log('✅ Connected to designer_portal');
    
    // Create extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ Created extensions');
    
    // Create tables
    const tables = [
      `CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'designer', 'supplier', 'admin')),
        phone_number VARCHAR(20),
        profile_picture TEXT,
        bio TEXT,
        location VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        verification_token TEXT,
        password_reset_token TEXT,
        password_reset_expires TIMESTAMPTZ,
        stripe_customer_id VARCHAR(255),
        subscription_plan VARCHAR(50) DEFAULT 'free',
        subscription_status VARCHAR(50) DEFAULT 'active',
        subscription_ends_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ
      )`,
      
      `CREATE TABLE designer_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        specialty VARCHAR(255),
        experience_years INTEGER DEFAULT 0,
        portfolio_url TEXT,
        hourly_rate DECIMAL(10, 2),
        availability VARCHAR(50) DEFAULT 'available',
        skills TEXT[],
        certifications TEXT[],
        education TEXT,
        languages TEXT[],
        instagram_url TEXT,
        linkedin_url TEXT,
        website_url TEXT,
        verification_status VARCHAR(50) DEFAULT 'pending',
        verification_documents TEXT[],
        rating DECIMAL(3, 2) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        completed_projects INTEGER DEFAULT 0,
        location VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      `CREATE TABLE supplier_profiles (
        id UUID PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        business_registration TEXT,
        category TEXT[],
        products_services TEXT,
        business_description TEXT,
        business_hours JSONB,
        delivery_areas TEXT[],
        payment_methods TEXT[],
        minimum_order DECIMAL(10, 2),
        website_url TEXT,
        instagram_url TEXT,
        facebook_url TEXT,
        verification_status VARCHAR(50) DEFAULT 'pending',
        verification_documents TEXT[],
        rating DECIMAL(3, 2) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        location VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      `CREATE TABLE portfolio_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        images TEXT[] NOT NULL,
        category VARCHAR(100),
        project_date DATE,
        client_name VARCHAR(255),
        project_budget DECIMAL(10, 2),
        tags TEXT[],
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      `CREATE TABLE hiring_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_title VARCHAR(255) NOT NULL,
        project_description TEXT NOT NULL,
        project_budget DECIMAL(10, 2),
        project_timeline VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        contact_fee_paid BOOLEAN DEFAULT false,
        payment_session_id VARCHAR(255),
        client_phone VARCHAR(20),
        client_email VARCHAR(255),
        preferred_contact_method VARCHAR(50),
        location VARCHAR(255),
        project_type VARCHAR(100),
        room_dimensions VARCHAR(255),
        style_preferences TEXT,
        inspiration_images TEXT[],
        additional_notes TEXT,
        response_message TEXT,
        response_date TIMESTAMPTZ,
        completion_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      `CREATE TABLE conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hiring_request_id UUID REFERENCES hiring_requests(id) ON DELETE SET NULL,
        last_message_at TIMESTAMPTZ,
        last_message_preview TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(participant1_id, participant2_id)
      )`,
      
      `CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        attachments TEXT[],
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      `CREATE TABLE project_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        hiring_request_id UUID NOT NULL REFERENCES hiring_requests(id) ON DELETE CASCADE,
        reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        response_text TEXT,
        response_date TIMESTAMPTZ,
        is_verified BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(hiring_request_id, reviewer_id)
      )`,
      
      `CREATE TABLE supplier_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id VARCHAR(255),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        response_text TEXT,
        response_date TIMESTAMPTZ,
        is_verified BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        product_quality_rating INTEGER CHECK (product_quality_rating >= 1 AND product_quality_rating <= 5),
        delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
        service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      `CREATE TABLE analytics_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB,
        ip_address INET,
        user_agent TEXT,
        referrer TEXT,
        page_url TEXT,
        session_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      `CREATE TABLE payment_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'UGX',
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        stripe_payment_intent_id VARCHAR(255),
        stripe_session_id VARCHAR(255),
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    ];
    
    for (const sql of tables) {
      const tableName = sql.match(/CREATE TABLE (\w+)/)[1];
      await client.query(sql);
      console.log(`✅ Created table: ${tableName}`);
    }
    
    // Create indexes
    const indexes = [
      'CREATE INDEX idx_users_email ON users(email)',
      'CREATE INDEX idx_users_role ON users(role)',
      'CREATE INDEX idx_designer_profiles_user_id ON designer_profiles(user_id)',
      'CREATE INDEX idx_hiring_requests_client_id ON hiring_requests(client_id)',
      'CREATE INDEX idx_hiring_requests_designer_id ON hiring_requests(designer_id)',
      'CREATE INDEX idx_messages_conversation_id ON messages(conversation_id)',
      'CREATE INDEX idx_project_reviews_designer_id ON project_reviews(designer_id)',
      'CREATE INDEX idx_supplier_reviews_supplier_id ON supplier_reviews(supplier_id)'
    ];
    
    for (const sql of indexes) {
      await client.query(sql);
    }
    console.log('✅ Created indexes');
    
    // Create sample users
    await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_verified)
      VALUES 
        ('admin@womenindesign.community', crypt('AdminPass123!', gen_salt('bf')), 'System', 'Admin', 'admin', true, true),
        ('designer@example.com', crypt('Designer123!', gen_salt('bf')), 'Sarah', 'Nakamya', 'designer', true, true),
        ('supplier@example.com', crypt('Supplier123!', gen_salt('bf')), 'John', 'Mukasa', 'supplier', true, true),
        ('client@example.com', crypt('Client123!', gen_salt('bf')), 'Grace', 'Mugisha', 'client', true, true)
    `);
    console.log('✅ Created sample users');
    
    // Verify setup
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n✨ Database setup complete! ${result.rows[0].count} users created.`);
    
    // Show users
    const users = await client.query('SELECT email, role FROM users');
    console.log('\n📋 Available users:');
    users.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
    await client.end();
    console.log('\n🎉 Database initialization successful!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

setupDatabase();