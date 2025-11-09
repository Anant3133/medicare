-- Generate Random Test Data for Medicare Database
-- Run this script to populate the database with realistic random data

-- Clear existing data (in correct order due to foreign keys)
DELETE FROM bill_items;
DELETE FROM bills;
DELETE FROM waiting_list;
DELETE FROM admissions;
DELETE FROM beds;
DELETE FROM rooms;
DELETE FROM patients;
DELETE FROM doctors;
DELETE FROM departments;
DELETE FROM services;
DELETE FROM users;

-- Insert Departments (10 departments)
INSERT INTO departments (name, description) VALUES
('Emergency Medicine', 'Emergency and trauma care services'),
('Cardiology', 'Heart and cardiovascular disease treatment'),
('Neurology', 'Brain and nervous system disorders'),
('Orthopedics', 'Bone, joint and muscle treatment'),
('Pediatrics', 'Child healthcare and treatment'),
('General Surgery', 'Surgical procedures and operations'),
('ICU', 'Intensive care and critical patients'),
('Maternity', 'Pregnancy and childbirth services'),
('Oncology', 'Cancer treatment and care'),
('Radiology', 'Medical imaging and diagnostics');

-- Insert Doctors (30 doctors)
INSERT INTO doctors (name, specialization, dept_id, phone, email) VALUES
-- Emergency Medicine
('Dr. Sarah Mitchell', 'Emergency Medicine', 1, '555-1001', 'sarah.mitchell@medicare.com'),
('Dr. John Parker', 'Trauma Care', 1, '555-1002', 'john.parker@medicare.com'),
('Dr. Rachel Green', 'Emergency Physician', 1, '555-1003', 'rachel.green@medicare.com'),

-- Cardiology
('Dr. James Anderson', 'Interventional Cardiology', 2, '555-1004', 'james.anderson@medicare.com'),
('Dr. William Scott', 'Cardiac Surgery', 2, '555-1005', 'william.scott@medicare.com'),
('Dr. Patricia Lee', 'Electrophysiology', 2, '555-1006', 'patricia.lee@medicare.com'),

-- Neurology
('Dr. Emily Watson', 'Clinical Neurology', 3, '555-1007', 'emily.watson@medicare.com'),
('Dr. Thomas Brown', 'Neurosurgery', 3, '555-1008', 'thomas.brown@medicare.com'),
('Dr. Linda Martinez', 'Stroke Specialist', 3, '555-1009', 'linda.martinez@medicare.com'),

-- Orthopedics
('Dr. Michael Brooks', 'Joint Replacement', 4, '555-1010', 'michael.brooks@medicare.com'),
('Dr. Steven Wilson', 'Sports Medicine', 4, '555-1011', 'steven.wilson@medicare.com'),
('Dr. Karen White', 'Spine Surgery', 4, '555-1012', 'karen.white@medicare.com'),

-- Pediatrics
('Dr. Lisa Chen', 'General Pediatrics', 5, '555-1013', 'lisa.chen@medicare.com'),
('Dr. Andrew Miller', 'Pediatric ICU', 5, '555-1014', 'andrew.miller@medicare.com'),
('Dr. Nancy Kim', 'Neonatology', 5, '555-1015', 'nancy.kim@medicare.com'),

-- General Surgery
('Dr. Robert Martinez', 'Laparoscopic Surgery', 6, '555-1016', 'robert.martinez@medicare.com'),
('Dr. Charles Davis', 'Vascular Surgery', 6, '555-1017', 'charles.davis@medicare.com'),
('Dr. Barbara Johnson', 'GI Surgery', 6, '555-1018', 'barbara.johnson@medicare.com'),

-- ICU
('Dr. Jennifer Davis', 'Critical Care', 7, '555-1019', 'jennifer.davis@medicare.com'),
('Dr. Richard Taylor', 'Intensivist', 7, '555-1020', 'richard.taylor@medicare.com'),
('Dr. Susan Clark', 'Pulmonology & Critical Care', 7, '555-1021', 'susan.clark@medicare.com'),

-- Maternity
('Dr. Amanda Wilson', 'Obstetrics & Gynecology', 8, '555-1022', 'amanda.wilson@medicare.com'),
('Dr. Daniel Robinson', 'High Risk Pregnancy', 8, '555-1023', 'daniel.robinson@medicare.com'),
('Dr. Michelle Anderson', 'Gynecologic Surgery', 8, '555-1024', 'michelle.anderson@medicare.com'),

-- Oncology
('Dr. David Thompson', 'Medical Oncology', 9, '555-1025', 'david.thompson@medicare.com'),
('Dr. Christopher Lee', 'Surgical Oncology', 9, '555-1026', 'christopher.lee@medicare.com'),
('Dr. Jessica Moore', 'Radiation Oncology', 9, '555-1027', 'jessica.moore@medicare.com'),

-- Radiology
('Dr. Maria Garcia', 'Diagnostic Radiology', 10, '555-1028', 'maria.garcia@medicare.com'),
('Dr. Kevin Wright', 'Interventional Radiology', 10, '555-1029', 'kevin.wright@medicare.com'),
('Dr. Angela Harris', 'Neuroradiology', 10, '555-1030', 'angela.harris@medicare.com');

-- Insert Patients (50 patients)
INSERT INTO patients (full_name, dob, gender, phone, address, emergency_contact, blood_group) VALUES
('John Smith', '1985-03-15', 'M', '555-2001', '123 Oak Street, Apt 4B', '555-2002', 'O+'),
('Emily Johnson', '1990-07-22', 'F', '555-2003', '456 Maple Avenue, Suite 12', '555-2004', 'A+'),
('Michael Davis', '1978-11-08', 'M', '555-2005', '789 Pine Road, Unit 3', '555-2006', 'B+'),
('Sarah Williams', '1995-02-14', 'F', '555-2007', '321 Elm Street, Floor 2', '555-2008', 'AB+'),
('Robert Brown', '1982-09-30', 'M', '555-2009', '654 Cedar Lane', '555-2010', 'O-'),
('Jennifer Miller', '1988-12-05', 'F', '555-2011', '987 Birch Boulevard', '555-2012', 'A-'),
('David Wilson', '1975-06-18', 'M', '555-2013', '147 Spruce Court', '555-2014', 'B-'),
('Lisa Anderson', '1992-04-25', 'F', '555-2015', '258 Willow Way', '555-2016', 'AB-'),
('James Martinez', '1980-08-12', 'M', '555-2017', '369 Ash Avenue', '555-2018', 'O+'),
('Mary Garcia', '1987-01-20', 'F', '555-2019', '741 Poplar Place', '555-2020', 'A+'),
('William Taylor', '1993-10-03', 'M', '555-2021', '852 Hickory Hill', '555-2022', 'B+'),
('Patricia Thomas', '1979-05-17', 'F', '555-2023', '963 Magnolia Drive', '555-2024', 'AB+'),
('Christopher Lee', '1986-09-28', 'M', '555-2025', '159 Sycamore Street', '555-2026', 'O-'),
('Barbara White', '1991-03-11', 'F', '555-2027', '357 Dogwood Lane', '555-2028', 'A-'),
('Daniel Harris', '1984-07-06', 'M', '555-2029', '486 Redwood Road', '555-2030', 'B-'),
('Nancy Clark', '1989-11-22', 'F', '555-2031', '624 Palm Circle', '555-2032', 'AB-'),
('Matthew Lewis', '1977-02-09', 'M', '555-2033', '735 Cypress Way', '555-2034', 'O+'),
('Karen Walker', '1994-06-14', 'F', '555-2035', '846 Sequoia Street', '555-2036', 'A+'),
('Steven Hall', '1983-12-27', 'M', '555-2037', '957 Beech Boulevard', '555-2038', 'B+'),
('Betty Young', '1990-04-30', 'F', '555-2039', '168 Fir Avenue', '555-2040', 'AB+'),
('Kevin King', '1976-08-15', 'M', '555-2041', '279 Laurel Lane', '555-2042', 'O-'),
('Sandra Wright', '1988-10-19', 'F', '555-2043', '381 Juniper Drive', '555-2044', 'A-'),
('Brian Scott', '1985-03-02', 'M', '555-2045', '492 Chestnut Court', '555-2046', 'B-'),
('Dorothy Green', '1992-07-21', 'F', '555-2047', '513 Walnut Way', '555-2048', 'AB-'),
('George Baker', '1981-11-04', 'M', '555-2049', '624 Hazel Hill', '555-2050', 'O+'),
('Helen Adams', '1987-01-16', 'F', '555-2051', '735 Alder Avenue', '555-2052', 'A+'),
('Frank Nelson', '1993-05-29', 'M', '555-2053', '846 Elder Street', '555-2054', 'B+'),
('Anna Carter', '1979-09-10', 'F', '555-2055', '957 Locust Lane', '555-2056', 'AB+'),
('Paul Mitchell', '1986-02-23', 'M', '555-2057', '168 Maple Court', '555-2058', 'O-'),
('Carol Perez', '1991-06-07', 'F', '555-2059', '279 Oak Drive', '555-2060', 'A-'),
('Mark Roberts', '1984-10-12', 'M', '555-2061', '381 Pine Way', '555-2062', 'B-'),
('Michelle Turner', '1989-12-25', 'F', '555-2063', '492 Elm Place', '555-2064', 'AB-'),
('Edward Phillips', '1977-04-08', 'M', '555-2065', '513 Cedar Hill', '555-2066', 'O+'),
('Donna Campbell', '1994-08-18', 'F', '555-2067', '624 Birch Boulevard', '555-2068', 'A+'),
('Jason Parker', '1983-11-30', 'M', '555-2069', '735 Spruce Avenue', '555-2070', 'B+'),
('Ruth Evans', '1990-03-13', 'F', '555-2071', '846 Willow Street', '555-2072', 'AB+'),
('Ronald Edwards', '1978-07-26', 'M', '555-2073', '957 Ash Lane', '555-2074', 'O-'),
('Sharon Collins', '1988-09-05', 'F', '555-2075', '168 Poplar Court', '555-2076', 'A-'),
('Larry Stewart', '1985-01-18', 'M', '555-2077', '279 Hickory Drive', '555-2078', 'B-'),
('Cynthia Morris', '1992-05-31', 'F', '555-2079', '381 Magnolia Way', '555-2080', 'AB-'),
('Raymond Rogers', '1980-09-14', 'M', '555-2081', '492 Sycamore Place', '555-2082', 'O+'),
('Diane Reed', '1987-12-27', 'F', '555-2083', '513 Dogwood Hill', '555-2084', 'A+'),
('Gregory Cook', '1993-02-10', 'M', '555-2085', '624 Redwood Avenue', '555-2086', 'B+'),
('Judith Morgan', '1979-06-23', 'F', '555-2087', '735 Palm Street', '555-2088', 'AB+'),
('Dennis Bell', '1986-10-05', 'M', '555-2089', '846 Cypress Lane', '555-2090', 'O-'),
('Rebecca Murphy', '1991-01-19', 'F', '555-2091', '957 Sequoia Court', '555-2092', 'A-'),
('Jerry Bailey', '1984-05-02', 'M', '555-2093', '168 Beech Drive', '555-2094', 'B-'),
('Katherine Rivera', '1989-08-14', 'F', '555-2095', '279 Fir Way', '555-2096', 'AB-'),
('Walter Cooper', '1977-11-26', 'M', '555-2097', '381 Laurel Place', '555-2098', 'O+'),
('Teresa Richardson', '1994-03-09', 'F', '555-2099', '492 Juniper Hill', '555-2100', 'A+');

-- Insert Rooms (40 rooms across 4 floors - only valid room types)
INSERT INTO rooms (room_number, floor, room_type, capacity) VALUES
-- Floor 1 (10 rooms)
('101', 1, 'general', 2), ('102', 1, 'general', 2), ('103', 1, 'general', 2), ('104', 1, 'general', 2),
('105', 1, 'private', 1), ('106', 1, 'private', 1), ('107', 1, 'general', 2), ('108', 1, 'general', 2),
('109', 1, 'private', 1), ('110', 1, 'general', 2),
-- Floor 2 (10 rooms)
('201', 2, 'general', 2), ('202', 2, 'general', 2), ('203', 2, 'icu', 1), ('204', 2, 'icu', 1),
('205', 2, 'private', 1), ('206', 2, 'general', 2), ('207', 2, 'general', 2), ('208', 2, 'icu', 1),
('209', 2, 'private', 1), ('210', 2, 'general', 2),
-- Floor 3 (10 rooms)
('301', 3, 'general', 2), ('302', 3, 'general', 2), ('303', 3, 'private', 1), ('304', 3, 'private', 1),
('305', 3, 'private', 1), ('306', 3, 'general', 2), ('307', 3, 'private', 1), ('308', 3, 'general', 2),
('309', 3, 'private', 1), ('310', 3, 'general', 2),
-- Floor 4 (10 rooms)
('401', 4, 'general', 2), ('402', 4, 'general', 2), ('403', 4, 'emergency', 1), ('404', 4, 'emergency', 1),
('405', 4, 'private', 1), ('406', 4, 'general', 2), ('407', 4, 'emergency', 1), ('408', 4, 'general', 2),
('409', 4, 'private', 1), ('410', 4, 'general', 2);

-- Insert Beds (60 beds total)
INSERT INTO beds (bed_number, room_id, bed_type, status) VALUES
-- Floor 1 beds
('101-A', 1, 'normal', 'available'), ('101-B', 1, 'normal', 'available'),
('102-A', 2, 'normal', 'available'), ('102-B', 2, 'normal', 'available'),
('103-A', 3, 'normal', 'available'), ('103-B', 3, 'normal', 'available'),
('104-A', 4, 'normal', 'available'), ('104-B', 4, 'normal', 'available'),
('105-A', 5, 'normal', 'available'),
('106-A', 6, 'normal', 'available'),
('107-A', 7, 'normal', 'available'), ('107-B', 7, 'normal', 'available'),
('108-A', 8, 'normal', 'available'), ('108-B', 8, 'normal', 'available'),
('109-A', 9, 'normal', 'available'),
('110-A', 10, 'normal', 'available'), ('110-B', 10, 'normal', 'available'),
-- Floor 2 beds
('201-A', 11, 'normal', 'available'), ('201-B', 11, 'normal', 'available'),
('202-A', 12, 'normal', 'available'), ('202-B', 12, 'normal', 'available'),
('203-A', 13, 'icu', 'available'),
('204-A', 14, 'icu', 'available'),
('205-A', 15, 'normal', 'available'),
('206-A', 16, 'normal', 'available'), ('206-B', 16, 'normal', 'available'),
('207-A', 17, 'normal', 'available'), ('207-B', 17, 'normal', 'available'),
('208-A', 18, 'icu', 'available'),
('209-A', 19, 'normal', 'available'),
('210-A', 20, 'normal', 'available'), ('210-B', 20, 'normal', 'available'),
-- Floor 3 beds
('301-A', 21, 'normal', 'available'), ('301-B', 21, 'normal', 'available'),
('302-A', 22, 'normal', 'available'), ('302-B', 22, 'normal', 'available'),
('303-A', 23, 'normal', 'available'),
('304-A', 24, 'normal', 'available'),
('305-A', 25, 'normal', 'available'),
('306-A', 26, 'normal', 'available'), ('306-B', 26, 'normal', 'available'),
('307-A', 27, 'normal', 'available'),
('308-A', 28, 'normal', 'available'), ('308-B', 28, 'normal', 'available'),
('309-A', 29, 'normal', 'available'),
('310-A', 30, 'normal', 'available'), ('310-B', 30, 'normal', 'available'),
-- Floor 4 beds
('401-A', 31, 'normal', 'available'), ('401-B', 31, 'normal', 'available'),
('402-A', 32, 'normal', 'available'), ('402-B', 32, 'normal', 'available'),
('403-A', 33, 'normal', 'available'),
('404-A', 34, 'normal', 'available'),
('405-A', 35, 'normal', 'available'),
('406-A', 36, 'normal', 'available'), ('406-B', 36, 'normal', 'available'),
('407-A', 37, 'normal', 'available'),
('408-A', 38, 'normal', 'available'), ('408-B', 38, 'normal', 'available'),
('409-A', 39, 'normal', 'available'),
('410-A', 40, 'normal', 'available'), ('410-B', 40, 'normal', 'available');

-- Insert Services (20 services)
INSERT INTO services (name, description, cost, category) VALUES
('General Consultation', 'General doctor consultation', 500.00, 'consultation'),
('Specialist Consultation', 'Specialist doctor consultation', 1000.00, 'consultation'),
('X-Ray', 'X-Ray imaging', 800.00, 'lab'),
('CT Scan', 'CT scan imaging', 3000.00, 'lab'),
('MRI', 'MRI imaging', 5000.00, 'lab'),
('Ultrasound', 'Ultrasound imaging', 1200.00, 'lab'),
('ECG', 'Electrocardiogram', 400.00, 'lab'),
('Blood Test - Basic', 'Complete blood count', 300.00, 'lab'),
('Blood Test - Comprehensive', 'Comprehensive metabolic panel', 1500.00, 'lab'),
('Urine Analysis', 'Urinalysis test', 200.00, 'lab'),
('Minor Surgery', 'Minor surgical procedure', 15000.00, 'procedure'),
('Major Surgery', 'Major surgical procedure', 50000.00, 'procedure'),
('Physiotherapy Session', 'Physical therapy session', 600.00, 'procedure'),
('Emergency Care', 'Emergency treatment', 2000.00, 'procedure'),
('Ambulance Service', 'Emergency ambulance', 1000.00, 'other'),
('Oxygen Support', 'Per day oxygen support', 500.00, 'medicine'),
('IV Drip', 'Intravenous therapy', 300.00, 'medicine'),
('Wound Dressing', 'Wound care and dressing', 250.00, 'procedure'),
('Vaccination', 'Vaccination service', 150.00, 'other'),
('Health Checkup', 'Comprehensive health checkup', 2500.00, 'consultation');

-- Insert Admissions (25 active + 10 discharged)
-- Active admissions
INSERT INTO admissions (patient_id, bed_id, doctor_id, admitted_on, priority, diagnosis, notes, admission_status) VALUES
(1, 1, 1, NOW() - INTERVAL '5 days', 2, 'Diabetic ketoacidosis', 'Requires insulin therapy', 'active'),
(2, 3, 13, NOW() - INTERVAL '3 days', 3, 'Acute asthma exacerbation', 'Nebulization ongoing', 'active'),
(3, 5, 4, NOW() - INTERVAL '7 days', 1, 'Acute myocardial infarction', 'Post-angioplasty care', 'active'),
(4, 7, 20, NOW() - INTERVAL '2 days', 2, 'Severe allergic reaction', 'Antihistamine protocol', 'active'),
(5, 9, 4, NOW() - INTERVAL '10 days', 1, 'Heart failure', 'Diuretic therapy', 'active'),
(6, 11, 7, NOW() - INTERVAL '4 days', 3, 'Chronic migraine', 'Pain management', 'active'),
(7, 13, 6, NOW() - INTERVAL '6 days', 2, 'Unstable angina', 'Cardiology monitoring', 'active'),
(8, 15, 22, NOW() - INTERVAL '1 day', 4, 'Normal delivery', 'Postpartum care', 'active'),
(9, 17, 1, NOW() - INTERVAL '8 days', 2, 'COPD exacerbation', 'Oxygen therapy', 'active'),
(10, 19, 7, NOW() - INTERVAL '3 days', 3, 'Thyroid storm', 'Endocrinology consult', 'active'),
(11, 21, 16, NOW() - INTERVAL '2 days', 4, 'Appendicitis', 'Post-op recovery', 'active'),
(12, 23, 10, NOW() - INTERVAL '5 days', 2, 'Severe osteoarthritis', 'Joint replacement surgery', 'active'),
(13, 25, 1, NOW() - INTERVAL '9 days', 1, 'Diabetic foot ulcer', 'Wound care', 'active'),
(14, 27, 14, NOW() - INTERVAL '4 days', 2, 'Hypertensive crisis', 'BP monitoring', 'active'),
(15, 29, 11, NOW() - INTERVAL '6 days', 3, 'Knee ligament tear', 'Orthopedic care', 'active'),
(16, 31, 13, NOW() - INTERVAL '3 days', 3, 'Panic disorder', 'Psychiatric evaluation', 'active'),
(17, 33, 10, NOW() - INTERVAL '7 days', 2, 'Herniated disc', 'Conservative management', 'active'),
(18, 35, 22, NOW() - INTERVAL '1 day', 4, 'Routine prenatal checkup', 'Observation', 'active'),
(19, 37, 16, NOW() - INTERVAL '5 days', 2, 'Obstructive sleep apnea', 'CPAP therapy', 'active'),
(20, 39, 7, NOW() - INTERVAL '4 days', 3, 'Clinical depression', 'Medication adjustment', 'active'),
(21, 41, 19, NOW() - INTERVAL '12 days', 1, 'Acute kidney injury', 'Dialysis', 'active'),
(22, 43, 22, NOW() - INTERVAL '2 days', 4, 'Pregnancy monitoring', 'High-risk pregnancy', 'active'),
(23, 45, 16, NOW() - INTERVAL '6 days', 2, 'Chronic prostatitis', 'Antibiotic therapy', 'active'),
(24, 47, 22, NOW() - INTERVAL '3 days', 3, 'PCOS management', 'Hormonal therapy', 'active'),
(25, 49, 10, NOW() - INTERVAL '8 days', 2, 'Chronic gout', 'Uric acid management', 'active');

-- Discharged admissions
INSERT INTO admissions (patient_id, bed_id, doctor_id, admitted_on, discharged_on, priority, diagnosis, notes, admission_status) VALUES
(26, NULL, 16, NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days', 3, 'Pneumonia', 'Recovered fully', 'discharged'),
(27, NULL, 13, NOW() - INTERVAL '25 days', NOW() - INTERVAL '18 days', 4, 'Acid reflux', 'Medication prescribed', 'discharged'),
(28, NULL, 10, NOW() - INTERVAL '30 days', NOW() - INTERVAL '22 days', 2, 'Fibromyalgia flare', 'Pain controlled', 'discharged'),
(29, NULL, 16, NOW() - INTERVAL '18 days', NOW() - INTERVAL '14 days', 4, 'Routine surgery', 'Successful', 'discharged'),
(30, NULL, 22, NOW() - INTERVAL '35 days', NOW() - INTERVAL '28 days', 3, 'Pregnancy complications', 'Delivered healthy baby', 'discharged'),
(31, NULL, 19, NOW() - INTERVAL '22 days', NOW() - INTERVAL '16 days', 2, 'Chronic pain syndrome', 'Pain managed', 'discharged'),
(32, NULL, 13, NOW() - INTERVAL '28 days', NOW() - INTERVAL '20 days', 4, 'Routine checkup', 'All clear', 'discharged'),
(33, NULL, 7, NOW() - INTERVAL '40 days', NOW() - INTERVAL '30 days', 1, 'Stroke', 'Rehabilitation ongoing', 'discharged'),
(34, NULL, 1, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', 3, 'Anemia', 'Iron supplementation', 'discharged'),
(35, NULL, 11, NOW() - INTERVAL '26 days', NOW() - INTERVAL '19 days', 4, 'Sports injury', 'Healed well', 'discharged');

-- Update bed status for active admissions
UPDATE beds SET status = 'occupied' WHERE bed_id IN (1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39,41,43,45,47,49);

-- Put some beds in maintenance
UPDATE beds SET status = 'maintenance' WHERE bed_id IN (2, 12, 22, 32, 42);

-- Insert Waiting List (8 patients)
INSERT INTO waiting_list (patient_id, dept_id, requested_on, priority, status, notes) VALUES
(36, 2, NOW() - INTERVAL '2 hours', 1, 'waiting', 'Cardiac emergency - Needs immediate ICU bed'),
(37, 7, NOW() - INTERVAL '4 hours', 1, 'waiting', 'Respiratory failure - Critical condition'),
(38, 3, NOW() - INTERVAL '1 day', 2, 'waiting', 'Chronic back pain - Requires surgery'),
(39, 8, NOW() - INTERVAL '6 hours', 2, 'waiting', 'Labor pains - Expected delivery soon'),
(40, 4, NOW() - INTERVAL '3 hours', 3, 'waiting', 'Fracture - Cast applied, needs bed'),
(41, 9, NOW() - INTERVAL '2 days', 2, 'waiting', 'Cancer treatment - Chemotherapy scheduled'),
(42, 6, NOW() - INTERVAL '1 day', 3, 'waiting', 'Hernia repair - Elective surgery'),
(43, 5, NOW() - INTERVAL '5 hours', 2, 'waiting', 'Child patient - Viral infection, needs monitoring');

-- Insert Bills (30 bills - mix of pending/paid/cancelled)
-- Bills for discharged patients (all paid)
INSERT INTO bills (admission_id, amount, tax, discount, paid_at, status) VALUES
(26, 8500.00, 1530.00, 0.00, NOW() - INTERVAL '15 days', 'paid'),
(27, 5200.00, 936.00, 500.00, NOW() - INTERVAL '18 days', 'paid'),
(28, 12000.00, 2160.00, 1000.00, NOW() - INTERVAL '22 days', 'paid'),
(29, 18000.00, 3240.00, 2000.00, NOW() - INTERVAL '14 days', 'paid'),
(30, 25000.00, 4500.00, 0.00, NOW() - INTERVAL '28 days', 'paid'),
(31, 9500.00, 1710.00, 0.00, NOW() - INTERVAL '16 days', 'paid'),
(32, 3500.00, 630.00, 300.00, NOW() - INTERVAL '20 days', 'paid'),
(33, 45000.00, 8100.00, 5000.00, NOW() - INTERVAL '30 days', 'paid'),
(34, 6800.00, 1224.00, 0.00, NOW() - INTERVAL '10 days', 'paid'),
(35, 11500.00, 2070.00, 1500.00, NOW() - INTERVAL '19 days', 'paid');

-- Bills for active patients (pending)
INSERT INTO bills (admission_id, amount, tax, discount, status) VALUES
(1, 15000.00, 2700.00, 1000.00, 'pending'),
(2, 7500.00, 1350.00, 0.00, 'pending'),
(3, 35000.00, 6300.00, 3000.00, 'pending'),
(4, 5000.00, 900.00, 500.00, 'pending'),
(5, 25000.00, 4500.00, 2000.00, 'pending'),
(6, 9000.00, 1620.00, 0.00, 'pending'),
(7, 18000.00, 3240.00, 1500.00, 'pending'),
(8, 12000.00, 2160.00, 0.00, 'pending'),
(9, 16000.00, 2880.00, 1000.00, 'pending'),
(10, 8500.00, 1530.00, 500.00, 'pending'),
(11, 22000.00, 3960.00, 2000.00, 'pending'),
(12, 40000.00, 7200.00, 4000.00, 'pending'),
(13, 19000.00, 3420.00, 1500.00, 'pending'),
(14, 11000.00, 1980.00, 1000.00, 'pending'),
(15, 13500.00, 2430.00, 0.00, 'pending'),
(16, 7200.00, 1296.00, 500.00, 'pending'),
(17, 14000.00, 2520.00, 1000.00, 'pending'),
(18, 5500.00, 990.00, 0.00, 'pending'),
(19, 10500.00, 1890.00, 500.00, 'pending'),
(20, 8000.00, 1440.00, 0.00, 'pending');

-- Insert Bill Items (multiple services per bill)
-- Bill 1 items (no subtotal - it's generated)
INSERT INTO bill_items (bill_id, service_id, quantity, unit_price) VALUES
(1, 2, 1, 1000.00),
(1, 9, 1, 1500.00),
(1, 4, 1, 3000.00),
(1, 16, 5, 500.00);

-- Bill 2 items
INSERT INTO bill_items (bill_id, service_id, quantity, unit_price) VALUES
(2, 1, 1, 500.00),
(2, 8, 2, 300.00),
(2, 14, 1, 2000.00);

-- Bill 3 items (high cost - cardiac)
INSERT INTO bill_items (bill_id, service_id, quantity, unit_price) VALUES
(3, 2, 2, 1000.00),
(3, 12, 1, 50000.00),
(3, 5, 1, 5000.00);

-- Add more bill items for other bills
INSERT INTO bill_items (bill_id, service_id, quantity, unit_price) VALUES
(11, 11, 1, 15000.00),
(11, 3, 1, 800.00),
(12, 12, 1, 50000.00),
(12, 13, 3, 600.00),
(13, 18, 10, 250.00),
(13, 16, 7, 500.00),
(14, 2, 1, 1000.00),
(14, 7, 2, 400.00);

-- Insert Users (authentication)
-- Password hash for 'admin123'
INSERT INTO users (username, password_hash, role, email, full_name, is_active) VALUES
('admin', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'admin', 'admin@medicare.com', 'System Administrator', true),
('doctor1', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'doctor', 'sarah.mitchell@medicare.com', 'Dr. Sarah Mitchell', true),
('doctor2', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'doctor', 'james.anderson@medicare.com', 'Dr. James Anderson', true),
('doctor3', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'doctor', 'emily.watson@medicare.com', 'Dr. Emily Watson', true),
('staff1', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'staff', 'staff1@medicare.com', 'Alice Staff', true),
('staff2', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'staff', 'staff2@medicare.com', 'Bob Staff', true),
('billing1', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'billing', 'billing1@medicare.com', 'Carol Billing', true),
('billing2', '$2b$10$zw3hQwpYKwERa311mc2dzun8.JgUy4rK0kDCsC5cpk13TX4EcRQhW', 'billing', 'billing2@medicare.com', 'David Billing', true);

-- Refresh materialized view if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_department_statistics') THEN
        REFRESH MATERIALIZED VIEW mv_department_statistics;
    END IF;
END $$;

-- Display summary
SELECT '========================================' as separator;
SELECT '✅ RANDOM DATA GENERATION COMPLETE!' as message;
SELECT '========================================' as separator;

SELECT 'DATA SUMMARY:' as info;
SELECT 'Departments: ' || COUNT(*) as summary FROM departments
UNION ALL SELECT 'Doctors: ' || COUNT(*) FROM doctors
UNION ALL SELECT 'Patients: ' || COUNT(*) FROM patients
UNION ALL SELECT 'Rooms: ' || COUNT(*) FROM rooms
UNION ALL SELECT 'Beds: ' || COUNT(*) FROM beds
UNION ALL SELECT 'Services: ' || COUNT(*) FROM services
UNION ALL SELECT 'Active Admissions: ' || COUNT(*) FROM admissions WHERE admission_status = 'active'
UNION ALL SELECT 'Discharged Admissions: ' || COUNT(*) FROM admissions WHERE admission_status = 'discharged'
UNION ALL SELECT 'Waiting List: ' || COUNT(*) FROM waiting_list
UNION ALL SELECT 'Bills (Total): ' || COUNT(*) FROM bills
UNION ALL SELECT 'Bills (Paid): ' || COUNT(*) FROM bills WHERE status = 'paid'
UNION ALL SELECT 'Bills (Pending): ' || COUNT(*) FROM bills WHERE status = 'pending'
UNION ALL SELECT 'Bill Items: ' || COUNT(*) FROM bill_items
UNION ALL SELECT 'Users: ' || COUNT(*) FROM users;

SELECT '========================================' as separator;
SELECT 'Bed Status Breakdown:' as info;
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM beds), 2) || '%' as percentage
FROM beds
GROUP BY status
ORDER BY count DESC;

SELECT '========================================' as separator;
SELECT 'You can now test the application with realistic data!' as message;
SELECT 'Login credentials: admin / admin123' as credentials;
