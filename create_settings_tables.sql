-- Create missing settings tables
CREATE TABLE IF NOT EXISTS platform_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
);

CREATE TABLE IF NOT EXISTS email_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (key, value, description) VALUES 
  ('platform_name', 'Women in Design Uganda', 'Platform name'),
  ('contact_fee', '10000', 'Contact fee in UGX'),
  ('max_portfolio_items', '50', 'Maximum portfolio items per user'),
  ('max_file_size', '10485760', 'Maximum file size in bytes (10MB)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO security_settings (key, value, description) VALUES 
  ('session_timeout', '7200', 'Session timeout in seconds (2 hours)'),
  ('max_login_attempts', '5', 'Maximum login attempts'),
  ('password_expiry_days', '90', 'Password expiry in days')
ON CONFLICT (key) DO NOTHING;