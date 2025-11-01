-- db/seed.sql
-- MEDICARE: Sample data for testing and demonstration
-- Demonstrates: Sample dataset with referential integrity

-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE waiting_list RESTART IDENTITY CASCADE;
TRUNCATE TABLE bill_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE bills RESTART IDENTITY CASCADE;
TRUNCATE TABLE services RESTART IDENTITY CASCADE;
TRUNCATE TABLE admissions RESTART IDENTITY CASCADE;
TRUNCATE TABLE beds RESTART IDENTITY CASCADE;
TRUNCATE TABLE rooms RESTART IDENTITY CASCADE;
TRUNCATE TABLE patients RESTART IDENTITY CASCADE;
TRUNCATE TABLE doctors RESTART IDENTITY CASCADE;
TRUNCATE TABLE departments RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Insert Departments
INSERT INTO departments (name, description) VALUES
('Cardiology', 'Heart and cardiovascular system'),
('Neurology', 'Brain and nervous system'),
('Orthopedics', 'Bones, joints, and muscles'),
('Pediatrics', 'Children and adolescents'),
('General Medicine', 'General medical conditions'),
('Emergency', 'Emergency and critical care'),
('ICU', 'Intensive Care Unit');

-- Insert Doctors
INSERT INTO doctors (name, specialization, dept_id, phone, email) VALUES
('Dr. Sarah Johnson', 'Cardiologist', 1, '555-0101', 'sarah.johnson@medicare.com'),
('Dr. Michael Chen', 'Neurologist', 2, '555-0102', 'michael.chen@medicare.com'),
('Dr. Emily Rodriguez', 'Orthopedic Surgeon', 3, '555-0103', 'emily.rodriguez@medicare.com'),
('Dr. David Kim', 'Pediatrician', 4, '555-0104', 'david.kim@medicare.com'),
('Dr. Lisa Anderson', 'General Physician', 5, '555-0105', 'lisa.anderson@medicare.com'),
('Dr. James Wilson', 'Emergency Medicine', 6, '555-0106', 'james.wilson@medicare.com'),
('Dr. Maria Garcia', 'Intensivist', 7, '555-0107', 'maria.garcia@medicare.com'),
('Dr. Robert Taylor', 'Cardiologist', 1, '555-0108', 'robert.taylor@medicare.com');

-- Insert Patients
INSERT INTO patients (full_name, dob, gender, phone, address, emergency_contact, blood_group) VALUES
('John Smith', '1980-05-15', 'M', '555-1001', '123 Main St, City', '555-1002', 'A+'),
('Mary Johnson', '1975-08-22', 'F', '555-1003', '456 Oak Ave, City', '555-1004', 'B+'),
('Robert Williams', '1990-03-10', 'M', '555-1005', '789 Pine Rd, City', '555-1006', 'O+'),
('Patricia Brown', '1985-12-05', 'F', '555-1007', '321 Elm St, City', '555-1008', 'AB+'),
('Michael Davis', '2010-06-18', 'M', '555-1009', '654 Maple Dr, City', '555-1010', 'A-'),
('Jennifer Wilson', '1970-09-30', 'F', '555-1011', '987 Cedar Ln, City', '555-1012', 'B-'),
('William Moore', '1995-11-25', 'M', '555-1013', '147 Birch Ave, City', '555-1014', 'O-'),
('Linda Taylor', '1988-02-14', 'F', '555-1015', '258 Spruce St, City', '555-1016', 'AB-'),
('James Anderson', '1965-07-08', 'M', '555-1017', '369 Willow Rd, City', '555-1018', 'A+'),
('Barbara Thomas', '1978-04-20', 'F', '555-1019', '741 Ash Dr, City', '555-1020', 'B+'),
('David Jackson', '2005-10-12', 'M', '555-1021', '852 Poplar Ln, City', '555-1022', 'O+'),
('Susan White', '1992-01-28', 'F', '555-1023', '963 Hickory Ave, City', '555-1024', 'A-');

-- Insert Rooms
INSERT INTO rooms (room_number, floor, room_type, capacity) VALUES
('101', 1, 'general', 2),
('102', 1, 'general', 2),
('103', 1, 'private', 1),
('104', 1, 'general', 2),
('201', 2, 'icu', 1),
('202', 2, 'icu', 1),
('203', 2, 'icu', 1),
('204', 2, 'private', 1),
('301', 3, 'general', 2),
('302', 3, 'general', 2),
('303', 3, 'emergency', 2),
('304', 3, 'private', 1);

-- Insert Beds
INSERT INTO beds (bed_number, room_id, bed_type, status) VALUES
-- Floor 1 General Rooms
('A', 1, 'normal', 'occupied'),
('B', 1, 'normal', 'available'),
('A', 2, 'normal', 'occupied'),
('B', 2, 'normal', 'occupied'),
('A', 3, 'normal', 'available'),
('A', 4, 'normal', 'available'),
('B', 4, 'normal', 'maintenance'),
-- Floor 2 ICU
('A', 5, 'icu', 'occupied'),
('A', 6, 'icu', 'occupied'),
('A', 7, 'icu', 'available'),
('A', 8, 'normal', 'available'),
-- Floor 3
('A', 9, 'normal', 'available'),
('B', 9, 'normal', 'available'),
('A', 10, 'normal', 'occupied'),
('B', 10, 'normal', 'available'),
('A', 11, 'normal', 'available'),
('B', 11, 'normal', 'available'),
('A', 12, 'normal', 'available');

-- Insert Services
INSERT INTO services (name, description, cost, category) VALUES
('Room Charges', 'Daily room charges', 1000.00, 'room'),
('ICU Charges', 'Daily ICU charges', 3000.00, 'room'),
('Doctor Consultation', 'General consultation', 500.00, 'consultation'),
('Specialist Consultation', 'Specialist doctor consultation', 1000.00, 'consultation'),
('Blood Test', 'Complete blood count', 300.00, 'lab'),
('X-Ray', 'X-ray imaging', 800.00, 'lab'),
('MRI Scan', 'MRI imaging', 5000.00, 'lab'),
('CT Scan', 'CT imaging', 4000.00, 'lab'),
('ECG', 'Electrocardiogram', 400.00, 'lab'),
('Surgery - Minor', 'Minor surgical procedure', 10000.00, 'procedure'),
('Surgery - Major', 'Major surgical procedure', 50000.00, 'procedure'),
('Physiotherapy', 'Physical therapy session', 600.00, 'procedure'),
('Medicines', 'General medicines', 500.00, 'medicine');

-- Insert Active Admissions
INSERT INTO admissions (patient_id, bed_id, doctor_id, admitted_on, admission_status, priority, diagnosis, notes) VALUES
(1, 1, 1, now() - INTERVAL '3 days', 'active', 2, 'Chest pain, suspected angina', 'Monitor cardiac enzymes'),
(2, 3, 2, now() - INTERVAL '5 days', 'active', 3, 'Migraine with aura', 'Neurological assessment ongoing'),
(3, 4, 3, now() - INTERVAL '2 days', 'active', 4, 'Fractured tibia', 'Post-surgery recovery'),
(4, 8, 7, now() - INTERVAL '1 day', 'active', 1, 'Respiratory distress', 'ICU monitoring required'),
(5, 9, 7, now() - INTERVAL '4 days', 'active', 1, 'Septic shock', 'Critical condition'),
(6, 14, 5, now() - INTERVAL '6 days', 'active', 5, 'Diabetes management', 'Insulin adjustment');

-- Insert Discharged Admissions (for billing and history)
INSERT INTO admissions (patient_id, bed_id, doctor_id, admitted_on, discharged_on, admission_status, priority, diagnosis, notes) VALUES
(7, NULL, 6, now() - INTERVAL '10 days', now() - INTERVAL '8 days', 'discharged', 3, 'Minor laceration', 'Stitches removed'),
(8, NULL, 4, now() - INTERVAL '15 days', now() - INTERVAL '12 days', 'discharged', 4, 'Viral fever', 'Recovered fully'),
(9, NULL, 1, now() - INTERVAL '20 days', now() - INTERVAL '15 days', 'discharged', 2, 'Myocardial infarction', 'Stable, follow-up scheduled');

-- Insert Waiting List
INSERT INTO waiting_list (patient_id, dept_id, priority, notes, status) VALUES
(10, 3, 2, 'Hip replacement surgery needed', 'waiting'),
(11, 4, 3, 'Pediatric checkup and vaccination', 'waiting'),
(12, 1, 1, 'Cardiac catheterization required', 'waiting');

-- Insert Bills for discharged patients
INSERT INTO bills (admission_id, amount, tax, discount, status, paid_at) VALUES
(7, 2500.00, 125.00, 0, 'paid', now() - INTERVAL '8 days'),
(8, 3200.00, 160.00, 200.00, 'paid', now() - INTERVAL '11 days'),
(9, 75000.00, 3750.00, 5000.00, 'paid', now() - INTERVAL '14 days');

-- Insert Bills for active admissions (pending)
INSERT INTO bills (admission_id, amount, tax, discount, status) VALUES
(1, 8500.00, 425.00, 0, 'pending'),
(2, 12000.00, 600.00, 1000.00, 'pending'),
(3, 18000.00, 900.00, 0, 'pending');

-- Insert Bill Items
INSERT INTO bill_items (bill_id, service_id, quantity, unit_price) VALUES
-- Bill 1 (discharged)
(1, 1, 2, 1000.00),  -- 2 days room
(1, 3, 1, 500.00),   -- Consultation
-- Bill 2 (discharged)
(2, 1, 3, 1000.00),  -- 3 days room
(2, 5, 2, 300.00),   -- Blood tests
-- Bill 3 (discharged - major surgery)
(3, 11, 1, 50000.00), -- Major surgery
(3, 2, 5, 3000.00),   -- 5 days ICU
(3, 8, 1, 4000.00),   -- CT Scan
-- Bill 4 (pending)
(4, 1, 3, 1000.00),
(4, 9, 2, 400.00),
-- Bill 5 (pending)
(5, 1, 5, 1000.00),
(5, 4, 2, 1000.00),
-- Bill 6 (pending)
(6, 10, 1, 10000.00),
(6, 6, 1, 800.00);

-- Insert Users for authentication
-- Password: admin123 (hashed with bcrypt, rounds=10)
-- In production, these would be properly hashed
INSERT INTO users (username, password_hash, role, email, full_name, is_active) VALUES
('admin', '$2b$10$rKvVLbH.xQ8mYH7YqLZ8hOX8bYqPXzDfU0kGXqQHqPXmT9N6fMQYq', 'admin', 'admin@medicare.com', 'System Administrator', true),
('doctor1', '$2b$10$rKvVLbH.xQ8mYH7YqLZ8hOX8bYqPXzDfU0kGXqQHqPXmT9N6fMQYq', 'doctor', 'doctor1@medicare.com', 'Dr. Sarah Johnson', true),
('doctor2', '$2b$10$rKvVLbH.xQ8mYH7YqLZ8hOX8bYqPXzDfU0kGXqQHqPXmT9N6fMQYq', 'doctor', 'doctor2@medicare.com', 'Dr. Michael Chen', true),
('staff1', '$2b$10$rKvVLbH.xQ8mYH7YqLZ8hOX8bYqPXzDfU0kGXqQHqPXmT9N6fMQYq', 'staff', 'staff1@medicare.com', 'Alice Staff', true),
('billing1', '$2b$10$rKvVLbH.xQ8mYH7YqLZ8hOX8bYqPXzDfU0kGXqQHqPXmT9N6fMQYq', 'billing', 'billing1@medicare.com', 'Bob Billing', true);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW mv_department_statistics;

-- Display summary
SELECT 'Database seeded successfully!' as message;
SELECT 'Departments: ' || COUNT(*) as summary FROM departments
UNION ALL
SELECT 'Doctors: ' || COUNT(*) FROM doctors
UNION ALL
SELECT 'Patients: ' || COUNT(*) FROM patients
UNION ALL
SELECT 'Rooms: ' || COUNT(*) FROM rooms
UNION ALL
SELECT 'Beds: ' || COUNT(*) FROM beds
UNION ALL
SELECT 'Active Admissions: ' || COUNT(*) FROM admissions WHERE admission_status = 'active'
UNION ALL
SELECT 'Services: ' || COUNT(*) FROM services
UNION ALL
SELECT 'Bills: ' || COUNT(*) FROM bills
UNION ALL
SELECT 'Users: ' || COUNT(*) FROM users;
