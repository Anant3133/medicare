-- Medicare Database - Comprehensive Mock Data Script
-- This script inserts realistic test data for all tables
-- Run this after running schema.sql

-- ============================================
-- CLEAR EXISTING DATA (OPTIONAL)
-- ============================================
-- Uncomment if you want to start fresh
-- TRUNCATE TABLE audit_log, waiting_list, bill_items, bills, services, admissions, beds, rooms, patients, doctors, departments, users RESTART IDENTITY CASCADE;

-- ============================================
-- 1. USERS - Authentication Data
-- ============================================
-- Password for all users: "admin123" (hashed with bcrypt salt rounds=10)
-- Hash generated using: bcrypt.hash('admin123', 10)
INSERT INTO users (username, password_hash, role, email, full_name, is_active) VALUES
-- Admins
('admin', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'admin', 'admin@medicare.com', 'System Administrator', true),
('admin2', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'admin', 'admin2@medicare.com', 'Sarah Johnson', true),

-- Doctors
('doctor1', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'doctor', 'dr.smith@medicare.com', 'Dr. John Smith', true),
('doctor2', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'doctor', 'dr.patel@medicare.com', 'Dr. Priya Patel', true),
('doctor3', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'doctor', 'dr.chen@medicare.com', 'Dr. Wei Chen', true),
('doctor4', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'doctor', 'dr.garcia@medicare.com', 'Dr. Maria Garcia', true),
('doctor5', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'doctor', 'dr.kumar@medicare.com', 'Dr. Raj Kumar', true),

-- Staff
('staff1', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'staff', 'staff1@medicare.com', 'Emily Davis', true),
('staff2', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'staff', 'staff2@medicare.com', 'Michael Brown', true),
('staff3', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'staff', 'staff3@medicare.com', 'Lisa Anderson', true),

-- Billing
('billing1', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'billing', 'billing1@medicare.com', 'Robert Wilson', true),
('billing2', '$2b$10$XWg4UI8MtJfZwFQfG2dnRO7lSzcX5WGZn7w7BKTftyN0gMLt6z.9W', 'billing', 'billing2@medicare.com', 'Jennifer Martinez', true);

-- ============================================
-- 2. DEPARTMENTS
-- ============================================
INSERT INTO departments (name, description) VALUES
('Cardiology', 'Heart and cardiovascular system treatment'),
('Neurology', 'Brain and nervous system disorders'),
('Orthopedics', 'Bone, joint, and muscle treatment'),
('Pediatrics', 'Medical care for infants, children, and adolescents'),
('Emergency', 'Emergency and trauma care'),
('Oncology', 'Cancer treatment and care'),
('Radiology', 'Medical imaging and diagnostics'),
('General Surgery', 'Surgical procedures and operations'),
('Obstetrics & Gynecology', 'Women''s health and childbirth'),
('Internal Medicine', 'Adult disease diagnosis and treatment');

-- ============================================
-- 3. DOCTORS
-- ============================================
INSERT INTO doctors (name, specialization, dept_id, phone, email) VALUES
-- Cardiology
('Dr. John Smith', 'Cardiologist', 1, '555-0101', 'dr.smith@medicare.com'),
('Dr. Sarah Williams', 'Interventional Cardiologist', 1, '555-0102', 'dr.williams@medicare.com'),

-- Neurology
('Dr. Priya Patel', 'Neurologist', 2, '555-0201', 'dr.patel@medicare.com'),
('Dr. Michael Chang', 'Neurosurgeon', 2, '555-0202', 'dr.chang@medicare.com'),

-- Orthopedics
('Dr. Wei Chen', 'Orthopedic Surgeon', 3, '555-0301', 'dr.chen@medicare.com'),
('Dr. James Taylor', 'Sports Medicine Specialist', 3, '555-0302', 'dr.taylor@medicare.com'),

-- Pediatrics
('Dr. Maria Garcia', 'Pediatrician', 4, '555-0401', 'dr.garcia@medicare.com'),
('Dr. Lisa Anderson', 'Pediatric Surgeon', 4, '555-0402', 'dr.anderson@medicare.com'),

-- Emergency
('Dr. Raj Kumar', 'Emergency Medicine', 5, '555-0501', 'dr.kumar@medicare.com'),
('Dr. Emily Davis', 'Trauma Surgeon', 5, '555-0502', 'dr.davis@medicare.com'),

-- Oncology
('Dr. David Lee', 'Medical Oncologist', 6, '555-0601', 'dr.lee@medicare.com'),
('Dr. Jennifer White', 'Radiation Oncologist', 6, '555-0602', 'dr.white@medicare.com'),

-- Radiology
('Dr. Robert Brown', 'Radiologist', 7, '555-0701', 'dr.brown@medicare.com'),

-- General Surgery
('Dr. Amanda Martinez', 'General Surgeon', 8, '555-0801', 'dr.martinez@medicare.com'),
('Dr. Kevin Thompson', 'Laparoscopic Surgeon', 8, '555-0802', 'dr.thompson@medicare.com'),

-- OB/GYN
('Dr. Michelle Harris', 'Obstetrician', 9, '555-0901', 'dr.harris@medicare.com'),
('Dr. Steven Clark', 'Gynecologist', 9, '555-0902', 'dr.clark@medicare.com'),

-- Internal Medicine
('Dr. Patricia Lewis', 'Internal Medicine', 10, '555-1001', 'dr.lewis@medicare.com'),
('Dr. Christopher Walker', 'Geriatric Medicine', 10, '555-1002', 'dr.walker@medicare.com');

-- ============================================
-- 4. PATIENTS
-- ============================================
INSERT INTO patients (full_name, dob, gender, phone, address, emergency_contact, blood_group) VALUES
-- General patients
('John Doe', '1985-03-15', 'M', '555-1001', '123 Main St, Springfield', 'Jane Doe: 555-1002', 'O+'),
('Jane Smith', '1990-07-22', 'F', '555-1003', '456 Oak Ave, Riverside', 'Robert Smith: 555-1004', 'A+'),
('Robert Johnson', '1978-11-30', 'M', '555-1005', '789 Pine Rd, Lakewood', 'Mary Johnson: 555-1006', 'B+'),
('Mary Williams', '1995-05-18', 'F', '555-1007', '321 Elm St, Hillside', 'John Williams: 555-1008', 'AB+'),
('James Brown', '1962-09-25', 'M', '555-1009', '654 Maple Dr, Greenville', 'Sarah Brown: 555-1010', 'O-'),

-- Pediatric patients
('Emma Davis', '2015-04-10', 'F', '555-1011', '987 Cedar Ln, Fairview', 'Michael Davis: 555-1012', 'A+'),
('Noah Miller', '2018-08-05', 'M', '555-1013', '147 Birch Ct, Meadowview', 'Lisa Miller: 555-1014', 'B+'),
('Olivia Wilson', '2020-01-20', 'F', '555-1015', '258 Spruce Way, Brookside', 'David Wilson: 555-1016', 'O+'),

-- Elderly patients
('William Taylor', '1945-12-03', 'M', '555-1017', '369 Walnut Blvd, Riverside', 'Susan Taylor: 555-1018', 'A-'),
('Elizabeth Anderson', '1950-06-14', 'F', '555-1019', '741 Ash St, Parkside', 'Thomas Anderson: 555-1020', 'B-'),

-- Emergency cases
('Michael Thomas', '1982-02-28', 'M', '555-1021', '852 Cypress Ave, Downtown', 'Jennifer Thomas: 555-1022', 'AB-'),
('Sarah Martinez', '1988-10-12', 'F', '555-1023', '963 Redwood Dr, Uptown', 'Carlos Martinez: 555-1024', 'O+'),

-- Maternity cases
('Jessica Garcia', '1992-03-08', 'F', '555-1025', '159 Magnolia St, Westside', 'Daniel Garcia: 555-1026', 'A+'),
('Ashley Rodriguez', '1994-07-19', 'F', '555-1027', '357 Willow Ln, Eastside', 'Jose Rodriguez: 555-1028', 'B+'),

-- Various conditions
('Christopher Lee', '1975-11-11', 'M', '555-1029', '486 Hickory Rd, Southside', 'Michelle Lee: 555-1030', 'O+'),
('Amanda White', '1987-04-25', 'F', '555-1031', '753 Cherry Ct, Northside', 'Ryan White: 555-1032', 'A-'),
('Daniel Harris', '1980-08-17', 'M', '555-1033', '951 Poplar Dr, Midtown', 'Laura Harris: 555-1034', 'B+'),
('Laura Clark', '1993-12-06', 'F', '555-1035', '246 Sycamore Way, Heights', 'Brian Clark: 555-1036', 'AB+'),
('Brian Lewis', '1970-05-30', 'M', '555-1037', '864 Dogwood Ave, Valley', 'Amy Lewis: 555-1038', 'O-'),
('Amy Walker', '1998-09-14', 'F', '555-1039', '135 Oakwood Blvd, Plaza', 'Mark Walker: 555-1040', 'A+');

-- ============================================
-- 5. ROOMS
-- ============================================
INSERT INTO rooms (room_number, floor, room_type, capacity) VALUES
-- Ground Floor - Emergency
('E-101', 0, 'emergency', 1),
('E-102', 0, 'emergency', 1),
('E-103', 0, 'emergency', 2),
('E-104', 0, 'emergency', 2),

-- First Floor - ICU
('ICU-201', 1, 'icu', 1),
('ICU-202', 1, 'icu', 1),
('ICU-203', 1, 'icu', 1),
('ICU-204', 1, 'icu', 1),
('ICU-205', 1, 'icu', 2),

-- Second Floor - General Wards
('G-301', 2, 'general', 4),
('G-302', 2, 'general', 4),
('G-303', 2, 'general', 4),
('G-304', 2, 'general', 6),
('G-305', 2, 'general', 6),

-- Third Floor - Private Rooms
('P-401', 3, 'private', 1),
('P-402', 3, 'private', 1),
('P-403', 3, 'private', 1),
('P-404', 3, 'private', 1),
('P-405', 3, 'private', 1),
('P-406', 3, 'private', 2),
('P-407', 3, 'private', 2),

-- Fourth Floor - Pediatric
('PED-501', 4, 'general', 2),
('PED-502', 4, 'general', 2),
('PED-503', 4, 'general', 3);

-- ============================================
-- 6. BEDS
-- ============================================
INSERT INTO beds (bed_number, room_id, bed_type, status, last_maintenance) VALUES
-- Emergency Room Beds
('A', 1, 'normal', 'occupied', '2024-10-15'),
('A', 2, 'normal', 'available', '2024-10-20'),
('A', 3, 'normal', 'occupied', '2024-10-18'),
('B', 3, 'normal', 'available', '2024-10-18'),
('A', 4, 'normal', 'occupied', '2024-10-22'),
('B', 4, 'normal', 'maintenance', '2024-10-25'),

-- ICU Beds
('A', 5, 'icu', 'occupied', '2024-10-10'),
('A', 6, 'icu', 'occupied', '2024-10-12'),
('A', 7, 'icu', 'available', '2024-10-14'),
('A', 8, 'icu', 'occupied', '2024-10-16'),
('A', 9, 'icu', 'occupied', '2024-10-18'),
('B', 9, 'icu', 'available', '2024-10-18'),

-- General Ward Beds
('A', 10, 'normal', 'occupied', '2024-09-30'),
('B', 10, 'normal', 'occupied', '2024-09-30'),
('C', 10, 'normal', 'available', '2024-09-30'),
('D', 10, 'normal', 'available', '2024-09-30'),

('A', 11, 'normal', 'occupied', '2024-10-01'),
('B', 11, 'normal', 'occupied', '2024-10-01'),
('C', 11, 'normal', 'occupied', '2024-10-01'),
('D', 11, 'normal', 'available', '2024-10-01'),

('A', 12, 'normal', 'available', '2024-10-05'),
('B', 12, 'normal', 'available', '2024-10-05'),
('C', 12, 'normal', 'reserved', '2024-10-05'),
('D', 12, 'normal', 'available', '2024-10-05'),

('A', 13, 'normal', 'occupied', '2024-10-08'),
('B', 13, 'normal', 'occupied', '2024-10-08'),
('C', 13, 'normal', 'occupied', '2024-10-08'),
('D', 13, 'normal', 'occupied', '2024-10-08'),
('E', 13, 'normal', 'available', '2024-10-08'),
('F', 13, 'normal', 'available', '2024-10-08'),

('A', 14, 'normal', 'occupied', '2024-10-10'),
('B', 14, 'normal', 'occupied', '2024-10-10'),
('C', 14, 'normal', 'available', '2024-10-10'),
('D', 14, 'normal', 'available', '2024-10-10'),
('E', 14, 'normal', 'maintenance', '2024-10-10'),
('F', 14, 'normal', 'available', '2024-10-10'),

-- Private Room Beds
('A', 15, 'normal', 'occupied', '2024-10-12'),
('A', 16, 'normal', 'occupied', '2024-10-13'),
('A', 17, 'normal', 'available', '2024-10-14'),
('A', 18, 'normal', 'occupied', '2024-10-15'),
('A', 19, 'normal', 'available', '2024-10-16'),
('A', 20, 'normal', 'occupied', '2024-10-17'),
('B', 20, 'normal', 'available', '2024-10-17'),
('A', 21, 'normal', 'available', '2024-10-18'),
('B', 21, 'normal', 'available', '2024-10-18'),

-- Pediatric Beds
('A', 22, 'pediatric', 'occupied', '2024-10-20'),
('B', 22, 'pediatric', 'occupied', '2024-10-20'),
('A', 23, 'pediatric', 'occupied', '2024-10-21'),
('B', 23, 'pediatric', 'available', '2024-10-21'),
('A', 24, 'pediatric', 'available', '2024-10-22'),
('B', 24, 'pediatric', 'available', '2024-10-22'),
('C', 24, 'pediatric', 'available', '2024-10-22');

-- ============================================
-- 7. ADMISSIONS
-- ============================================
INSERT INTO admissions (patient_id, bed_id, doctor_id, admitted_on, admission_status, priority, diagnosis, notes) VALUES
-- Active admissions
(1, 1, 1, '2024-11-01 08:30:00', 'active', 2, 'Acute Myocardial Infarction', 'Patient stable, monitoring required'),
(2, 7, 3, '2024-11-02 14:15:00', 'active', 1, 'Stroke', 'Critical condition, ICU monitoring'),
(3, 5, 10, '2024-11-03 10:00:00', 'active', 3, 'Pneumonia', 'Responding well to antibiotics'),
(4, 13, 7, '2024-11-04 16:45:00', 'active', 4, 'Appendicitis', 'Post-surgery recovery'),
(5, 14, 5, '2024-11-05 09:20:00', 'active', 2, 'Fractured Femur', 'Surgical fixation completed'),

-- ICU patients
(11, 8, 9, '2024-11-01 22:30:00', 'active', 1, 'Multiple Trauma', 'Motor vehicle accident, critical'),
(12, 11, 9, '2024-11-03 03:15:00', 'active', 1, 'Severe Burns', 'Third-degree burns, 40% body surface'),

-- Pediatric admissions
(6, 46, 7, '2024-11-04 11:00:00', 'active', 3, 'Acute Bronchitis', 'Improving with treatment'),
(7, 47, 8, '2024-11-05 15:30:00', 'active', 4, 'Dehydration', 'IV fluids administered'),
(8, 48, 7, '2024-11-06 10:00:00', 'active', 2, 'Febrile Seizure', 'Observation required'),

-- General ward admissions
(15, 19, 14, '2024-11-02 12:00:00', 'active', 4, 'Diabetes Management', 'Blood sugar stabilization'),
(16, 20, 18, '2024-11-03 14:30:00', 'active', 3, 'Hypertension', 'Medication adjustment'),
(17, 21, 14, '2024-11-04 09:00:00', 'active', 4, 'Gastroenteritis', 'Rehydration therapy'),
(18, 22, 5, '2024-11-05 16:00:00', 'active', 3, 'Hip Replacement Recovery', 'Physical therapy in progress'),

-- Private room admissions
(19, 37, 11, '2024-11-01 10:00:00', 'active', 2, 'Chemotherapy', 'Cycle 3 of treatment protocol'),
(20, 38, 14, '2024-11-02 08:00:00', 'active', 3, 'Cardiac Catheterization', 'Post-procedure observation'),
(13, 40, 15, '2024-11-03 07:00:00', 'active', 2, 'Pregnancy - High Risk', 'Gestational diabetes monitoring'),
(14, 42, 15, '2024-11-04 12:00:00', 'active', 2, 'Pregnancy - Preeclampsia', 'Bed rest and monitoring'),

-- Discharged admissions (for billing demonstration)
(1, NULL, 1, '2024-10-15 10:00:00', 'discharged', 2, 'Chest Pain - Ruled out MI', 'Discharged with follow-up'),
(3, NULL, 14, '2024-10-20 14:30:00', 'discharged', 4, 'Food Poisoning', 'Fully recovered'),
(5, NULL, 5, '2024-10-25 11:00:00', 'discharged', 3, 'Sprained Ankle', 'Physical therapy recommended');

-- Update discharged_on for discharged admissions
UPDATE admissions SET discharged_on = '2024-10-17 15:00:00' WHERE admission_id = 19;
UPDATE admissions SET discharged_on = '2024-10-22 10:00:00' WHERE admission_id = 20;
UPDATE admissions SET discharged_on = '2024-10-28 09:00:00' WHERE admission_id = 21;

-- ============================================
-- 8. SERVICES (Billing Catalog)
-- ============================================
INSERT INTO services (name, description, cost, category) VALUES
-- Consultations
('General Consultation', 'Standard doctor consultation', 150.00, 'consultation'),
('Specialist Consultation', 'Specialist doctor consultation', 300.00, 'consultation'),
('Emergency Consultation', 'Emergency department consultation', 500.00, 'consultation'),
('Follow-up Visit', 'Follow-up consultation', 100.00, 'consultation'),

-- Procedures
('Minor Surgery', 'Minor surgical procedure', 2000.00, 'procedure'),
('Major Surgery', 'Major surgical procedure', 15000.00, 'procedure'),
('Cardiac Catheterization', 'Heart catheterization procedure', 8000.00, 'procedure'),
('Endoscopy', 'Gastrointestinal endoscopy', 3500.00, 'procedure'),
('Colonoscopy', 'Colon examination', 4000.00, 'procedure'),
('Appendectomy', 'Appendix removal surgery', 12000.00, 'procedure'),
('Hip Replacement', 'Total hip replacement surgery', 25000.00, 'procedure'),
('Chemotherapy Session', 'One chemotherapy treatment session', 5000.00, 'procedure'),

-- Lab Tests
('Complete Blood Count', 'CBC test', 50.00, 'lab'),
('Blood Sugar Test', 'Glucose level test', 30.00, 'lab'),
('Lipid Profile', 'Cholesterol and lipid tests', 80.00, 'lab'),
('Liver Function Test', 'LFT panel', 100.00, 'lab'),
('Kidney Function Test', 'Renal function panel', 100.00, 'lab'),
('ECG', 'Electrocardiogram', 75.00, 'lab'),
('Echocardiogram', '2D Echo test', 500.00, 'lab'),
('CT Scan', 'CT imaging scan', 1200.00, 'lab'),
('MRI Scan', 'Magnetic resonance imaging', 2500.00, 'lab'),
('X-Ray', 'Standard X-ray imaging', 150.00, 'lab'),
('Ultrasound', 'Ultrasound imaging', 300.00, 'lab'),

-- Medicines
('IV Fluids', 'Intravenous fluid therapy', 200.00, 'medicine'),
('Antibiotics Course', 'Full course of antibiotics', 500.00, 'medicine'),
('Pain Medication', 'Pain management medication', 100.00, 'medicine'),
('Cardiac Medication', 'Heart medication', 300.00, 'medicine'),
('Insulin', 'Diabetes insulin medication', 250.00, 'medicine'),
('Anesthesia', 'Surgical anesthesia', 1500.00, 'medicine'),

-- Room Charges
('General Ward - Per Day', 'General ward room charge', 500.00, 'room'),
('Private Room - Per Day', 'Private room charge', 2000.00, 'room'),
('ICU - Per Day', 'Intensive care unit charge', 5000.00, 'room'),
('Emergency Room - Per Day', 'Emergency room charge', 1000.00, 'room'),

-- Other
('Nursing Care - Per Day', 'Nursing services charge', 300.00, 'other'),
('Physical Therapy Session', 'One PT session', 200.00, 'other'),
('Ambulance Service', 'Emergency ambulance', 800.00, 'other'),
('Medical Supplies', 'General medical supplies', 150.00, 'other');

-- ============================================
-- 9. BILLS
-- ============================================
INSERT INTO bills (admission_id, amount, tax, discount, status, paid_at) VALUES
-- Paid bills (for discharged patients)
(19, 2500.00, 250.00, 100.00, 'paid', '2024-10-17 16:00:00'),
(20, 1800.00, 180.00, 0.00, 'paid', '2024-10-22 11:00:00'),
(21, 5500.00, 550.00, 500.00, 'paid', '2024-10-28 10:00:00'),

-- Pending bills (for active admissions)
(1, 15000.00, 1500.00, 500.00, 'pending', NULL),
(2, 35000.00, 3500.00, 1000.00, 'pending', NULL),
(3, 8500.00, 850.00, 300.00, 'pending', NULL),
(4, 18000.00, 1800.00, 0.00, 'pending', NULL),
(5, 28000.00, 2800.00, 1500.00, 'pending', NULL),
(6, 45000.00, 4500.00, 2000.00, 'pending', NULL),
(7, 52000.00, 5200.00, 3000.00, 'pending', NULL),
(8, 3500.00, 350.00, 100.00, 'pending', NULL),
(9, 2800.00, 280.00, 0.00, 'pending', NULL),
(10, 4200.00, 420.00, 200.00, 'pending', NULL);

-- ============================================
-- 10. BILL ITEMS (Line Items)
-- ============================================
INSERT INTO bill_items (bill_id, service_id, quantity, unit_price) VALUES
-- Bill 1 (admission_id 19 - discharged)
(1, 1, 3, 150.00),    -- General Consultation x3
(1, 13, 2, 50.00),    -- CBC x2
(1, 28, 2, 500.00),   -- General Ward x2 days
(1, 26, 1, 500.00),   -- Antibiotics

-- Bill 2 (admission_id 20 - discharged)
(2, 4, 1, 100.00),    -- Follow-up Visit
(2, 14, 1, 30.00),    -- Blood Sugar Test
(2, 28, 3, 500.00),   -- General Ward x3 days

-- Bill 3 (admission_id 21 - discharged)
(3, 2, 1, 300.00),    -- Specialist Consultation
(3, 10, 1, 12000.00), -- Appendectomy
(3, 27, 1, 1500.00),  -- Anesthesia
(3, 28, 3, 500.00),   -- General Ward x3 days

-- Bill 4 (admission_id 1 - active cardiac patient)
(4, 3, 1, 500.00),    -- Emergency Consultation
(4, 7, 1, 8000.00),   -- Cardiac Catheterization
(4, 17, 1, 75.00),    -- ECG
(4, 18, 1, 500.00),   -- Echocardiogram
(4, 31, 6, 5000.00),  -- ICU x6 days
(4, 32, 6, 300.00),   -- Nursing Care x6 days

-- Bill 5 (admission_id 2 - active stroke patient)
(5, 3, 1, 500.00),    -- Emergency Consultation
(5, 20, 1, 2500.00),  -- MRI Scan
(5, 19, 1, 1200.00),  -- CT Scan
(5, 31, 5, 5000.00),  -- ICU x5 days
(5, 32, 5, 300.00),   -- Nursing Care x5 days
(5, 25, 2, 300.00),   -- Cardiac Medication x2

-- Bill 6 (admission_id 3 - active pneumonia patient)
(6, 2, 1, 300.00),    -- Specialist Consultation
(6, 21, 1, 150.00),   -- X-Ray
(6, 26, 1, 500.00),   -- Antibiotics
(6, 28, 4, 500.00),   -- General Ward x4 days
(6, 32, 4, 300.00),   -- Nursing Care x4 days

-- Bill 7 (admission_id 11 - active hip replacement)
(7, 2, 2, 300.00),    -- Specialist Consultation x2
(7, 11, 1, 25000.00), -- Hip Replacement
(7, 27, 1, 1500.00),  -- Anesthesia
(7, 29, 3, 2000.00),  -- Private Room x3 days
(7, 33, 5, 200.00);   -- Physical Therapy x5 sessions

-- ============================================
-- 11. WAITING LIST
-- ============================================
INSERT INTO waiting_list (patient_id, dept_id, requested_on, priority, status, notes) VALUES
-- Active waiting
(10, 1, '2024-11-06 08:00:00', 2, 'waiting', 'Needs cardiac bed urgently'),
(9, 2, '2024-11-06 10:30:00', 1, 'waiting', 'Neurological emergency'),
(14, 9, '2024-11-06 12:00:00', 2, 'waiting', 'Maternity - due date approaching'),
(16, 3, '2024-11-06 14:15:00', 3, 'waiting', 'Orthopedic consultation required'),
(17, 5, '2024-11-06 16:45:00', 1, 'waiting', 'Emergency case - chest pain'),

-- Assigned (bed allocated)
(1, 1, '2024-11-01 07:00:00', 2, 'assigned', 'Assigned to ICU bed'),
(6, 4, '2024-11-04 10:00:00', 3, 'assigned', 'Assigned to pediatric ward'),

-- Cancelled
(18, 6, '2024-11-05 09:00:00', 4, 'cancelled', 'Patient condition improved');

UPDATE waiting_list SET assigned_on = '2024-11-01 08:30:00' WHERE wait_id IN (6);
UPDATE waiting_list SET assigned_on = '2024-11-04 11:00:00' WHERE wait_id IN (7);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify data insertion

-- SELECT 'Users:', COUNT(*) FROM users;
-- SELECT 'Departments:', COUNT(*) FROM departments;
-- SELECT 'Doctors:', COUNT(*) FROM doctors;
-- SELECT 'Patients:', COUNT(*) FROM patients;
-- SELECT 'Rooms:', COUNT(*) FROM rooms;
-- SELECT 'Beds:', COUNT(*) FROM beds;
-- SELECT 'Admissions:', COUNT(*) FROM admissions;
-- SELECT 'Services:', COUNT(*) FROM services;
-- SELECT 'Bills:', COUNT(*) FROM bills;
-- SELECT 'Bill Items:', COUNT(*) FROM bill_items;
-- SELECT 'Waiting List:', COUNT(*) FROM waiting_list;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Mock data insertion completed successfully!';
  RAISE NOTICE '📊 Database now contains realistic test data for all tables';
  RAISE NOTICE '🏥 Ready for testing Medicare Hospital Management System';
END $$;
