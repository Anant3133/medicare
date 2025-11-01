-- Update user passwords to correct hash for 'admin123'
DELETE FROM users;

INSERT INTO users (username, password_hash, role, email, full_name, is_active) VALUES
('admin', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'admin', 'admin@medicare.com', 'System Administrator', true),
('doctor1', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'doctor', 'doctor1@medicare.com', 'Dr. Sarah Johnson', true),
('doctor2', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'doctor', 'doctor2@medicare.com', 'Dr. Michael Chen', true),
('staff1', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'staff', 'staff1@medicare.com', 'Alice Staff', true),
('billing1', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'billing', 'billing1@medicare.com', 'Bob Billing', true);

SELECT 'Users updated successfully! All passwords are now: admin123' as message;
SELECT username, role, email FROM users ORDER BY user_id;
