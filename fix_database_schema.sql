-- Fix database schema to match API requirements

-- Add verification_status column to designer_profiles
ALTER TABLE designer_profiles 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' 
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Add verification_status column to supplier_profiles  
ALTER TABLE supplier_profiles 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Add user_id column to designer_profiles for clarity (alias for existing id)
-- This will help maintain API compatibility
-- Note: This is redundant but helps with query readability
ALTER TABLE designer_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update the user_id column to match the existing id values
UPDATE designer_profiles SET user_id = id WHERE user_id IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_designer_profiles_verification_status ON designer_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_verification_status ON supplier_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_designer_profiles_user_id ON designer_profiles(user_id);