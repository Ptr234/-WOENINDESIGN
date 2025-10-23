import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'admin_settings', 10, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Admin access control for Women in Design
    if (user.email !== 'admin@womenindesignuganda.com') {
      return createSecureResponse({ error: 'Admin access required' }, 403);
    }

    // Get platform settings
    const platformSettings = await getPlatformSettings();
    
    // Get admin user settings
    const adminSettings = await getAdminUserSettings(user.id);
    
    // Get email settings
    const emailSettings = await getEmailSettings();
    
    // Get security settings
    const securitySettings = await getSecuritySettings();

    return createSecureResponse({
      success: true,
      data: {
        platform: platformSettings,
        admin: adminSettings,
        email: emailSettings,
        security: securitySettings
      }
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'admin_settings_update', 5, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Admin access control
    if (user.email !== 'admin@womenindesignuganda.com') {
      return createSecureResponse({ error: 'Admin access required' }, 403);
    }

    const body = await request.json();
    const { section, settings } = body;

    switch (section) {
      case 'platform':
        await updatePlatformSettings(settings);
        break;
      case 'admin':
        await updateAdminUserSettings(user.id, settings);
        break;
      case 'email':
        await updateEmailSettings(settings);
        break;
      case 'security':
        await updateSecuritySettings(settings);
        break;
      default:
        return createSecureResponse({ error: 'Invalid settings section' }, 400);
    }

    return createSecureResponse({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

async function getPlatformSettings() {
  try {
    const result = await query(`
      SELECT key, value, description FROM platform_settings 
      WHERE is_active = true
    `);
    
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description
      };
    });
    
    return settings;
  } catch (error) {
    // Return default settings if table doesn't exist
    return {
      platform_name: { value: 'Women in Design Uganda', description: 'Platform name' },
      contact_fee: { value: '10000', description: 'Contact fee in UGX' },
      registration_enabled: { value: 'true', description: 'Allow new user registration' },
      maintenance_mode: { value: 'false', description: 'Platform maintenance mode' },
      max_portfolio_items: { value: '50', description: 'Maximum portfolio items per user' },
      max_file_size: { value: '10485760', description: 'Maximum file upload size in bytes' }
    };
  }
}

async function getAdminUserSettings(userId: string) {
  try {
    const result = await query(`
      SELECT first_name, last_name, email, phone, 
             notifications_enabled, email_notifications, 
             dashboard_theme, timezone, language
      FROM users 
      LEFT JOIN user_preferences ON users.id = user_preferences.user_id
      WHERE users.id = $1
    `, [userId]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        notifications: user.notifications_enabled || true,
        emailNotifications: user.email_notifications || true,
        theme: user.dashboard_theme || 'light',
        timezone: user.timezone || 'Africa/Kampala',
        language: user.language || 'en'
      };
    }
  } catch (error) {
    console.error('Error fetching admin user settings:', error);
  }
  
  return {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@womenindesignuganda.com',
    phone: '',
    notifications: true,
    emailNotifications: true,
    theme: 'light',
    timezone: 'Africa/Kampala',
    language: 'en'
  };
}

async function getEmailSettings() {
  try {
    const result = await query(`
      SELECT smtp_host, smtp_port, smtp_user, smtp_secure,
             welcome_email_enabled, notification_email_enabled,
             daily_digest_enabled, weekly_report_enabled
      FROM email_settings 
      WHERE is_active = true
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error fetching email settings:', error);
  }

  return {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_secure: true,
    welcome_email_enabled: true,
    notification_email_enabled: true,
    daily_digest_enabled: false,
    weekly_report_enabled: true
  };
}

async function getSecuritySettings() {
  try {
    const result = await query(`
      SELECT session_timeout, max_login_attempts, 
             password_expiry_days, two_factor_enabled,
             ip_whitelist_enabled, rate_limit_enabled
      FROM security_settings 
      WHERE is_active = true
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error fetching security settings:', error);
  }

  return {
    session_timeout: 7200, // 2 hours in seconds
    max_login_attempts: 5,
    password_expiry_days: 90,
    two_factor_enabled: false,
    ip_whitelist_enabled: false,
    rate_limit_enabled: true
  };
}

async function updatePlatformSettings(settings: any) {
  try {
    // Create settings table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Update or insert each setting
    for (const [key, value] of Object.entries(settings)) {
      await query(`
        INSERT INTO platform_settings (key, value, description, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (key) 
        DO UPDATE SET value = $2, updated_at = NOW()
      `, [key, value, `Platform setting for ${key}`]);
    }
  } catch (error) {
    console.error('Error updating platform settings:', error);
    throw error;
  }
}

async function updateAdminUserSettings(userId: string, settings: any) {
  try {
    // Update user table
    await query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW()
      WHERE id = $4
    `, [settings.firstName, settings.lastName, settings.phone, userId]);

    // Create or update user preferences
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        notifications_enabled BOOLEAN DEFAULT true,
        email_notifications BOOLEAN DEFAULT true,
        dashboard_theme VARCHAR(20) DEFAULT 'light',
        timezone VARCHAR(50) DEFAULT 'Africa/Kampala',
        language VARCHAR(5) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);

    await query(`
      INSERT INTO user_preferences (
        user_id, notifications_enabled, email_notifications, 
        dashboard_theme, timezone, language, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        notifications_enabled = $2,
        email_notifications = $3,
        dashboard_theme = $4,
        timezone = $5,
        language = $6,
        updated_at = NOW()
    `, [
      userId, 
      settings.notifications, 
      settings.emailNotifications,
      settings.theme,
      settings.timezone,
      settings.language
    ]);
  } catch (error) {
    console.error('Error updating admin user settings:', error);
    throw error;
  }
}

async function updateEmailSettings(settings: any) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        smtp_host VARCHAR(255),
        smtp_port INTEGER,
        smtp_user VARCHAR(255),
        smtp_secure BOOLEAN DEFAULT true,
        welcome_email_enabled BOOLEAN DEFAULT true,
        notification_email_enabled BOOLEAN DEFAULT true,
        daily_digest_enabled BOOLEAN DEFAULT false,
        weekly_report_enabled BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      INSERT INTO email_settings (
        smtp_host, smtp_port, smtp_user, smtp_secure,
        welcome_email_enabled, notification_email_enabled,
        daily_digest_enabled, weekly_report_enabled, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        smtp_host = $1,
        smtp_port = $2,
        smtp_user = $3,
        smtp_secure = $4,
        welcome_email_enabled = $5,
        notification_email_enabled = $6,
        daily_digest_enabled = $7,
        weekly_report_enabled = $8,
        updated_at = NOW()
    `, [
      settings.smtp_host,
      settings.smtp_port,
      settings.smtp_user,
      settings.smtp_secure,
      settings.welcome_email_enabled,
      settings.notification_email_enabled,
      settings.daily_digest_enabled,
      settings.weekly_report_enabled
    ]);
  } catch (error) {
    console.error('Error updating email settings:', error);
    throw error;
  }
}

async function updateSecuritySettings(settings: any) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS security_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_timeout INTEGER DEFAULT 7200,
        max_login_attempts INTEGER DEFAULT 5,
        password_expiry_days INTEGER DEFAULT 90,
        two_factor_enabled BOOLEAN DEFAULT false,
        ip_whitelist_enabled BOOLEAN DEFAULT false,
        rate_limit_enabled BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      INSERT INTO security_settings (
        session_timeout, max_login_attempts, password_expiry_days,
        two_factor_enabled, ip_whitelist_enabled, rate_limit_enabled, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        session_timeout = $1,
        max_login_attempts = $2,
        password_expiry_days = $3,
        two_factor_enabled = $4,
        ip_whitelist_enabled = $5,
        rate_limit_enabled = $6,
        updated_at = NOW()
    `, [
      settings.session_timeout,
      settings.max_login_attempts,
      settings.password_expiry_days,
      settings.two_factor_enabled,
      settings.ip_whitelist_enabled,
      settings.rate_limit_enabled
    ]);
  } catch (error) {
    console.error('Error updating security settings:', error);
    throw error;
  }
}