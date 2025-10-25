-- Drop and recreate database (run as superuser)
-- DROP DATABASE IF EXISTS designer_portal;
-- CREATE DATABASE designer_portal;

-- Connect to designer_portal database
\c designer_portal;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS project_reviews CASCADE;
DROP TABLE IF EXISTS supplier_reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS hiring_requests CASCADE;
DROP TABLE IF EXISTS portfolio_items CASCADE;
DROP TABLE IF EXISTS supplier_profiles CASCADE;
DROP TABLE IF EXISTS designer_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
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
);

-- Create designer profiles table
CREATE TABLE designer_profiles (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create supplier profiles table
CREATE TABLE supplier_profiles (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create portfolio items table
CREATE TABLE portfolio_items (
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
);

-- Create hiring requests table
CREATE TABLE hiring_requests (
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
);

-- Create conversations table
CREATE TABLE conversations (
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
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments TEXT[],
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project reviews table
CREATE TABLE project_reviews (
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
);

-- Create supplier reviews table
CREATE TABLE supplier_reviews (
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, reviewer_id)
);

-- Create analytics events table
CREATE TABLE analytics_events (
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
);

-- Create payment transactions table
CREATE TABLE payment_transactions (
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
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_designer_profiles_user_id ON designer_profiles(user_id);
CREATE INDEX idx_designer_profiles_verification_status ON designer_profiles(verification_status);
CREATE INDEX idx_supplier_profiles_verification_status ON supplier_profiles(verification_status);
CREATE INDEX idx_portfolio_designer_id ON portfolio_items(designer_id);
CREATE INDEX idx_hiring_requests_client_id ON hiring_requests(client_id);
CREATE INDEX idx_hiring_requests_designer_id ON hiring_requests(designer_id);
CREATE INDEX idx_hiring_requests_status ON hiring_requests(status);
CREATE INDEX idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_project_reviews_designer_id ON project_reviews(designer_id);
CREATE INDEX idx_supplier_reviews_supplier_id ON supplier_reviews(supplier_id);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- Create admin user
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    is_verified
) VALUES (
    'admin@womenindesign.community',
    crypt('AdminPassword123!', gen_salt('bf')),
    'System',
    'Admin',
    'admin',
    true,
    true
);

-- Create sample designer user
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    phone_number,
    location,
    bio,
    is_active,
    is_verified
) VALUES (
    uuid_generate_v4(),
    'sarah.nakamya@example.com',
    crypt('Designer123!', gen_salt('bf')),
    'Sarah',
    'Nakamya',
    'designer',
    '+256700123456',
    'Kampala, Uganda',
    'Professional interior designer with 5 years of experience',
    true,
    true
) RETURNING id;

-- Create designer profile for Sarah
INSERT INTO designer_profiles (
    user_id,
    specialty,
    experience_years,
    hourly_rate,
    skills,
    verification_status
) VALUES (
    (SELECT id FROM users WHERE email = 'sarah.nakamya@example.com'),
    'Interior Design',
    5,
    150000.00,
    ARRAY['Residential Design', '3D Visualization', 'Space Planning', 'Color Theory'],
    'verified'
);

-- Create sample supplier user
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    phone_number,
    location,
    is_active,
    is_verified
) VALUES (
    uuid_generate_v4(),
    'supplier@ugandafurniture.com',
    crypt('Supplier123!', gen_salt('bf')),
    'John',
    'Mukasa',
    'supplier',
    '+256700987654',
    'Kampala, Uganda',
    true,
    true
) RETURNING id;

-- Create supplier profile
INSERT INTO supplier_profiles (
    id,
    business_name,
    category,
    products_services,
    business_description,
    verification_status
) VALUES (
    (SELECT id FROM users WHERE email = 'supplier@ugandafurniture.com'),
    'Uganda Furniture Hub',
    ARRAY['Furniture', 'Home Decor'],
    'Premium furniture and home decor items',
    'Leading supplier of quality furniture in Uganda',
    'verified'
);

-- Create sample client user
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    phone_number,
    location,
    is_active,
    is_verified
) VALUES (
    'client@example.com',
    crypt('Client123!', gen_salt('bf')),
    'Grace',
    'Mugisha',
    'client',
    '+256700555555',
    'Entebbe, Uganda',
    true,
    true
);

-- Display created users
SELECT email, role, first_name, last_name, is_verified FROM users;

-- Show table counts
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Designer Profiles', COUNT(*) FROM designer_profiles
UNION ALL
SELECT 'Supplier Profiles', COUNT(*) FROM supplier_profiles;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;