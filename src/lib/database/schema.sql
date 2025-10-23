-- PostgreSQL Database Schema for Designer Portal
-- This schema is based on the requirements in terms&ref.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (base table for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('designer', 'client', 'supplier')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Designer profiles table
CREATE TABLE designer_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialty TEXT[] NOT NULL, -- Array of design specialties
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    biography TEXT,
    location VARCHAR(255),
    hourly_rate DECIMAL(10,2),
    availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
    skills TEXT[], -- Array of skills
    education TEXT[], -- Array of education entries
    certifications TEXT[], -- Array of certifications
    website VARCHAR(500),
    instagram VARCHAR(255),
    linkedin VARCHAR(255),
    behance VARCHAR(255),
    dribbble VARCHAR(255),
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_projects INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio items table
CREATE TABLE portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    tags TEXT[], -- Array of project tags
    images TEXT NOT NULL, -- JSON array of image URLs
    project_date DATE,
    client_name VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    designer_id UUID NOT NULL REFERENCES designer_profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    project_id UUID, -- Optional reference to a specific project
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Supplier profiles table
CREATE TABLE supplier_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_description TEXT,
    category TEXT[] NOT NULL, -- Array of supplier categories
    location VARCHAR(255),
    business_phone VARCHAR(20) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    address TEXT,
    website VARCHAR(500),
    business_hours VARCHAR(255),
    delivery_areas TEXT[], -- Array of delivery areas
    minimum_order DECIMAL(10,2),
    payment_methods TEXT[], -- Array of payment methods
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2),
    images TEXT[] NOT NULL, -- Array of image URLs
    specifications JSONB, -- Key-value pairs for specifications
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hiring requests table
CREATE TABLE hiring_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    designer_id UUID NOT NULL REFERENCES designer_profiles(id) ON DELETE CASCADE,
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    timeline VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (for communication between users)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hiring_request_id UUID REFERENCES hiring_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments TEXT[], -- Array of attachment URLs
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hiring_request_id UUID NOT NULL REFERENCES hiring_requests(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255), -- For Stripe integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_designer_profiles_specialty ON designer_profiles USING GIN(specialty);
CREATE INDEX idx_designer_profiles_location ON designer_profiles(location);
CREATE INDEX idx_designer_profiles_availability ON designer_profiles(availability);
CREATE INDEX idx_portfolio_items_designer_id ON portfolio_items(designer_id);
-- CREATE INDEX idx_portfolio_items_featured ON portfolio_items(featured); -- Column does not exist
CREATE INDEX idx_reviews_designer_id ON reviews(designer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_supplier_profiles_category ON supplier_profiles USING GIN(category);
CREATE INDEX idx_supplier_profiles_location ON supplier_profiles(location);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_hiring_requests_client_id ON hiring_requests(client_id);
CREATE INDEX idx_hiring_requests_designer_id ON hiring_requests(designer_id);
CREATE INDEX idx_hiring_requests_status ON hiring_requests(status);
CREATE INDEX idx_messages_hiring_request_id ON messages(hiring_request_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_payments_hiring_request_id ON payments(hiring_request_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designer_profiles_updated_at BEFORE UPDATE ON designer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_profiles_updated_at BEFORE UPDATE ON supplier_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hiring_requests_updated_at BEFORE UPDATE ON hiring_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update designer average rating
CREATE OR REPLACE FUNCTION update_designer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE designer_profiles 
    SET average_rating = (
        SELECT COALESCE(AVG(rating::DECIMAL), 0.00)
        FROM reviews 
        WHERE designer_id = COALESCE(NEW.designer_id, OLD.designer_id)
    )
    WHERE id = COALESCE(NEW.designer_id, OLD.designer_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger to update designer rating when reviews are added/updated/deleted
CREATE TRIGGER update_designer_rating_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_designer_rating();

-- Messaging System Tables

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants table
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Message attachments table
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for messaging performance
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_read_at ON messages(read_at) WHERE read_at IS NULL;
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- Function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update conversation timestamp when new messages are added
CREATE TRIGGER update_conversation_timestamp_on_message
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Portfolio indexes for performance
CREATE INDEX idx_portfolio_items_designer_id ON portfolio_items(designer_id);
CREATE INDEX idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX idx_portfolio_items_is_public ON portfolio_items(is_public);
CREATE INDEX idx_portfolio_items_created_at ON portfolio_items(created_at DESC);
CREATE INDEX idx_portfolio_items_project_date ON portfolio_items(project_date DESC);
CREATE INDEX idx_portfolio_items_tags ON portfolio_items USING GIN(tags);
CREATE INDEX idx_portfolio_items_public_recent ON portfolio_items(is_public, created_at DESC) WHERE is_public = true;

-- Subscription plans table
CREATE TABLE subscription_plans (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
    interval VARCHAR(20) NOT NULL CHECK (interval IN ('monthly', 'yearly')),
    features TEXT[] NOT NULL,
    limits JSONB NOT NULL DEFAULT '{}',
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('designer', 'supplier')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(100) NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment sessions table for subscription changes and hiring
CREATE TABLE payment_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(100) REFERENCES subscription_plans(id),
    hiring_request_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
    type VARCHAR(20) NOT NULL DEFAULT 'subscription' CHECK (type IN ('subscription', 'contact_fee', 'project_payment')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription cancellations table for tracking
CREATE TABLE subscription_cancellations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cancelled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Supplier products table (for usage tracking)
CREATE TABLE supplier_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'UGX',
    images TEXT[], -- Array of image URLs
    specifications JSONB,
    availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'out_of_stock', 'discontinued')),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, price, currency, interval, features, limits, user_type) VALUES
('designer-free', 'Free', 0, 'UGX', 'monthly', 
 ARRAY['Up to 10 portfolio items', 'Basic image uploads', 'Public portfolio visibility', 'Community support', 'Basic analytics'],
 '{"portfolioItems": 10, "imageUploads": 50, "priority": "low"}',
 'designer'),
('designer-pro', 'Pro', 50000, 'UGX', 'yearly',
 ARRAY['Unlimited portfolio items', 'Unlimited image uploads', 'Advanced portfolio analytics', 'Priority support', 'Custom portfolio themes', 'Client collaboration tools', 'Export portfolio as PDF', 'Advanced search visibility'],
 '{"portfolioItems": -1, "imageUploads": -1, "priority": "high"}',
 'designer'),
('supplier-free', 'Free', 0, 'UGX', 'monthly',
 ARRAY['Up to 10 product lines', 'Basic product showcase', 'Public supplier profile', 'Community support', 'Basic analytics'],
 '{"productLines": 10, "priority": "low"}',
 'supplier'),
('supplier-business', 'Business', 200000, 'UGX', 'yearly',
 ARRAY['Unlimited product lines', 'Advanced product catalog', 'Bulk product upload', 'Priority support', 'Advanced analytics', 'Featured supplier status', 'Custom branding options', 'Enhanced search visibility'],
 '{"productLines": -1, "priority": "high"}',
 'supplier');

-- Hiring requests table
CREATE TABLE hiring_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    timeline VARCHAR(200) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    contact_fee_status VARCHAR(20) DEFAULT 'pending' CHECK (contact_fee_status IN ('pending', 'paid', 'refunded')),
    contact_preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project transactions table for tracking payments
CREATE TABLE project_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hiring_request_id UUID NOT NULL REFERENCES hiring_requests(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
    type VARCHAR(20) NOT NULL CHECK (type IN ('contact_fee', 'project_payment', 'milestone_payment')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX idx_payment_sessions_user_id ON payment_sessions(user_id);
CREATE INDEX idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX idx_payment_sessions_expires_at ON payment_sessions(expires_at);
CREATE INDEX idx_payment_sessions_type ON payment_sessions(type);
CREATE INDEX idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_category ON supplier_products(category);
CREATE INDEX idx_supplier_products_availability ON supplier_products(availability);

-- Hiring indexes for performance
CREATE INDEX idx_hiring_requests_client_id ON hiring_requests(client_id);
CREATE INDEX idx_hiring_requests_designer_id ON hiring_requests(designer_id);
CREATE INDEX idx_hiring_requests_status ON hiring_requests(status);
CREATE INDEX idx_hiring_requests_contact_fee_status ON hiring_requests(contact_fee_status);
CREATE INDEX idx_hiring_requests_created_at ON hiring_requests(created_at DESC);
CREATE INDEX idx_project_transactions_hiring_request_id ON project_transactions(hiring_request_id);
CREATE INDEX idx_project_transactions_client_id ON project_transactions(client_id);
CREATE INDEX idx_project_transactions_designer_id ON project_transactions(designer_id);
CREATE INDEX idx_project_transactions_status ON project_transactions(status);
CREATE INDEX idx_project_transactions_type ON project_transactions(type);