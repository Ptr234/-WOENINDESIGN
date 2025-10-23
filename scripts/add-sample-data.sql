-- Sample data for testing dashboard functionality
-- This script adds sample data to make the dashboards more functional

-- Add a designer profile for the existing user
INSERT INTO designer_profiles (id, specialty, years_of_experience, biography, location, hourly_rate, availability, skills, education, certifications, average_rating, total_projects)
SELECT 
  id,
  ARRAY['Brand Identity', 'Web Design', 'UI/UX'],
  3,
  'Passionate designer with experience in creating compelling brand identities and user experiences.',
  'Kampala, Uganda',
  45.00,
  'available',
  ARRAY['Adobe Creative Suite', 'Figma', 'Sketch', 'HTML/CSS', 'User Research'],
  ARRAY['Bachelor of Fine Arts - Makerere University'],
  ARRAY['Adobe Certified Expert'],
  4.8,
  12
FROM users WHERE role = 'client' AND email = 'petergra38@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  years_of_experience = EXCLUDED.years_of_experience,
  biography = EXCLUDED.biography,
  location = EXCLUDED.location,
  hourly_rate = EXCLUDED.hourly_rate,
  availability = EXCLUDED.availability,
  skills = EXCLUDED.skills,
  education = EXCLUDED.education,
  certifications = EXCLUDED.certifications,
  average_rating = EXCLUDED.average_rating,
  total_projects = EXCLUDED.total_projects;

-- Add sample hiring requests/projects
INSERT INTO hiring_requests (client_id, designer_id, project_title, project_description, budget, timeline, status, created_at) 
SELECT 
  u.id as client_id,
  u.id as designer_id,
  'E-commerce Brand Identity',
  'Need a complete brand identity package including logo, color palette, typography, and brand guidelines for a new e-commerce platform.',
  1500.00,
  '3 weeks',
  'in_progress',
  NOW() - INTERVAL '2 days'
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO hiring_requests (client_id, designer_id, project_title, project_description, budget, timeline, status, created_at) 
SELECT 
  u.id as client_id,
  u.id as designer_id,
  'Mobile App UI Design',
  'Design user interface for a financial mobile application with focus on user experience and accessibility.',
  2200.00,
  '4 weeks',
  'completed',
  NOW() - INTERVAL '15 days'
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO hiring_requests (client_id, designer_id, project_title, project_description, budget, timeline, status, created_at) 
SELECT 
  u.id as client_id,
  u.id as designer_id,
  'Website Redesign',
  'Redesign existing corporate website with modern aesthetics and improved user flow.',
  1800.00,
  '5 weeks',
  'pending',
  NOW() - INTERVAL '1 day'
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

-- Add sample portfolio items
INSERT INTO portfolio_items (designer_id, title, description, category, tags, images, project_date, client_name, is_public)
SELECT 
  u.id as designer_id,
  'Minimalist Logo Design',
  'Clean and modern logo design for tech startup focusing on minimalism and brand recognition.',
  'Branding',
  ARRAY['logo', 'minimalist', 'tech', 'startup'],
  '["https://images.unsplash.com/photo-1551650975-87deedd944c3"]',
  '2024-01-15',
  'TechStart Uganda',
  true
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO portfolio_items (designer_id, title, description, category, tags, images, project_date, client_name, is_public)
SELECT 
  u.id as designer_id,
  'Food App Interface',
  'User interface design for food delivery mobile application with focus on user experience.',
  'Mobile UI',
  ARRAY['mobile', 'app', 'food', 'ui/ux'],
  '["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c"]',
  '2024-02-20',
  'FoodieExpress',
  true
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO portfolio_items (designer_id, title, description, category, tags, images, project_date, client_name, is_public)
SELECT 
  u.id as designer_id,
  'Corporate Website',
  'Complete website redesign for professional services company with modern aesthetic.',
  'Web Design',
  ARRAY['website', 'corporate', 'professional', 'modern'],
  '["https://images.unsplash.com/photo-1547658719-da2b51169166"]',
  '2024-03-10',
  'Business Solutions Ltd',
  true
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

-- Add sample reviews
INSERT INTO reviews (designer_id, client_id, client_name, rating, comment, created_at)
SELECT 
  u.id as designer_id,
  u.id as client_id,
  u.first_name || ' ' || u.last_name as client_name,
  5,
  'Excellent work! Very professional and delivered exactly what we needed. Highly recommended!',
  NOW() - INTERVAL '5 days'
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (designer_id, client_id, client_name, rating, comment, created_at)
SELECT 
  u.id as designer_id,
  u.id as client_id,
  'Sarah Johnson',
  4,
  'Great designer with excellent communication. The final design exceeded our expectations.',
  NOW() - INTERVAL '10 days'
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

-- Add supplier profile (optional)
INSERT INTO supplier_profiles (id, business_name, business_description, category, location, business_phone, business_email, address)
SELECT 
  u.id,
  'Creative Supplies Co.',
  'Professional design supplies and materials for creative professionals.',
  ARRAY['Art Supplies', 'Design Tools', 'Paper Products'],
  'Kampala, Uganda',
  '+256700123456',
  'sales@creativesupplies.ug',
  'Plot 123, Industrial Area, Kampala'
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_description = EXCLUDED.business_description,
  category = EXCLUDED.category,
  location = EXCLUDED.location,
  business_phone = EXCLUDED.business_phone,
  business_email = EXCLUDED.business_email,
  address = EXCLUDED.address;

-- Add sample products
INSERT INTO products (supplier_id, name, description, category, price, images, specifications, in_stock)
SELECT 
  u.id as supplier_id,
  'Premium Design Paper',
  'High-quality paper perfect for design projects and presentations.',
  'Paper & Materials',
  25.00,
  ARRAY['https://images.unsplash.com/photo-1586281380349-632531db7ed4'],
  '{"weight": "300gsm", "size": "A4", "finish": "matte"}',
  true
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO products (supplier_id, name, description, category, price, images, specifications, in_stock)
SELECT 
  u.id as supplier_id,
  'Professional Marker Set',
  'Complete set of professional markers for design and illustration work.',
  'Drawing Tools',
  85.00,
  ARRAY['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0'],
  '{"count": "48", "type": "alcohol-based", "brand": "professional"}',
  true
FROM users u WHERE u.email = 'petergra38@gmail.com'
ON CONFLICT DO NOTHING;

-- Update user to have admin role for testing
UPDATE users 
SET role = 'admin' 
WHERE email = 'petergra38@gmail.com';

COMMIT;