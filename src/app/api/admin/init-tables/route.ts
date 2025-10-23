import { NextRequest } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Admin access control
    if (user.email !== 'admin@womenindesignuganda.com') {
      return createSecureResponse({ error: 'Admin access required' }, 403);
    }

    // Create platform_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user_preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(255),
        last_name VARCHAR(255), 
        phone VARCHAR(20),
        timezone VARCHAR(100) DEFAULT 'Africa/Kampala',
        language VARCHAR(10) DEFAULT 'en',
        theme VARCHAR(20) DEFAULT 'light',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id)
      )
    `);

    // Create email_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create security_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS security_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user_documents table
    await query(`
      CREATE TABLE IF NOT EXISTS user_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        document_type VARCHAR(100) NOT NULL,
        file_url TEXT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        upload_date TIMESTAMP DEFAULT NOW(),
        verification_status VARCHAR(50) DEFAULT 'pending',
        admin_notes TEXT,
        verified_at TIMESTAMP,
        verified_by UUID REFERENCES users(id)
      )
    `);

    // Create user_verifications table
    await query(`
      CREATE TABLE IF NOT EXISTS user_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        verification_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        admin_id UUID REFERENCES users(id),
        admin_notes TEXT,
        rejection_reason TEXT
      )
    `);

    // Insert default platform settings
    await query(`
      INSERT INTO platform_settings (key, value, description) VALUES 
        ('platform_name', 'Women in Design Uganda', 'Platform name'),
        ('contact_fee', '10000', 'Contact fee in UGX'),
        ('max_portfolio_items', '50', 'Maximum portfolio items per user'),
        ('max_file_size', '10485760', 'Maximum file size in bytes (10MB)')
      ON CONFLICT (key) DO NOTHING
    `);

    // Insert default security settings
    await query(`
      INSERT INTO security_settings (key, value, description) VALUES 
        ('session_timeout', '7200', 'Session timeout in seconds (2 hours)'),
        ('max_login_attempts', '5', 'Maximum login attempts'),
        ('password_expiry_days', '90', 'Password expiry in days')
      ON CONFLICT (key) DO NOTHING
    `);

    return createSecureResponse({
      success: true,
      message: 'Database tables initialized successfully'
    });

  } catch (error) {
    console.error('Error initializing database tables:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}