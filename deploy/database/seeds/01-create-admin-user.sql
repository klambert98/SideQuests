-- ============================================================================
-- SEED: Create Initial Admin User
-- ============================================================================
-- Creates the initial admin user for the portfolio
-- Update the email, password hash, and name as needed
-- Password shown is hashed with bcrypt (example: "password123")
-- ============================================================================

INSERT INTO users (id, email, password, name, role, bio, "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'klambert2@duck.com', 
  '$2a$10$Tz4XPU59ao0vZBfKXwArl.fTtkcM2ziknmK5luf2autxesVDNNGry',
  'Kayla', 
  'admin',
  'Site administrator', 
  NOW(), 
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, name, role, "createdAt" 
FROM users 
WHERE email = 'klambert2@duck.com';
