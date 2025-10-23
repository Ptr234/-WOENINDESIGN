-- Add sample data for testing

-- Insert sample users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sarah.designer@example.com', '$2b$10$example_hash_1', 'designer', 'Sarah', 'Johnson', '+256701234567', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'mike.architect@example.com', '$2b$10$example_hash_2', 'designer', 'Mike', 'Chen', '+256701234568', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'jane.interior@example.com', '$2b$10$example_hash_3', 'designer', 'Jane', 'Smith', '+256701234569', true, true),
('550e8400-e29b-41d4-a716-446655440004', 'acme.supplies@example.com', '$2b$10$example_hash_4', 'supplier', 'John', 'Supplier', '+256701234570', true, true),
('550e8400-e29b-41d4-a716-446655440005', 'premium.materials@example.com', '$2b$10$example_hash_5', 'supplier', 'Mary', 'Materials', '+256701234571', true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample designer profiles
INSERT INTO designer_profiles (id, user_id, specialty, years_of_experience, biography, location, hourly_rate, verification_status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', ARRAY['Interior Design', 'Residential'], 5, 'Passionate interior designer with 5 years of experience creating beautiful living spaces.', 'Kampala, Uganda', 50000.00, 'verified'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Architecture', 'Commercial'], 8, 'Licensed architect specializing in sustainable commercial buildings.', 'Entebbe, Uganda', 75000.00, 'verified'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', ARRAY['Interior Design', 'Hospitality'], 3, 'Creative designer focused on hospitality and restaurant spaces.', 'Jinja, Uganda', 40000.00, 'verified')
ON CONFLICT (id) DO NOTHING;

-- Insert sample supplier profiles
INSERT INTO supplier_profiles (id, business_name, business_description, category, location, business_phone, business_email, verification_status) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'ACME Design Supplies', 'Premium furniture and design materials for professionals', ARRAY['Furniture', 'Lighting', 'Decor'], 'Kampala, Uganda', '+256701234570', 'acme.supplies@example.com', 'verified'),
('550e8400-e29b-41d4-a716-446655440005', 'Premium Materials Co', 'High-quality construction and design materials', ARRAY['Building Materials', 'Finishes', 'Hardware'], 'Entebbe, Uganda', '+256701234571', 'premium.materials@example.com', 'verified')
ON CONFLICT (id) DO NOTHING;