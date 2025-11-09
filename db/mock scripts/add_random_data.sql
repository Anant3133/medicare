-- Add Random Test Data to Medicare Database (without deleting existing data)
-- Run this to add more realistic test data

-- Insert additional departments
INSERT INTO departments (name, description) VALUES
('Dermatology', 'Skin and hair disorders'),
('Ophthalmology', 'Eye care and vision services'),
('ENT', 'Ear, Nose and Throat treatment'),
('Psychiatry', 'Mental health services'),
('Physiotherapy', 'Physical rehabilitation')
ON CONFLICT (name) DO NOTHING;

-- Insert additional doctors
INSERT INTO doctors (name, specialization, dept_id, phone, email) 
SELECT 'Dr. Sarah Mitchell', 'Emergency Medicine', dept_id, '555-1001', 'sarah.mitchell@medicare.com'
FROM departments WHERE name = 'Emergency Medicine' LIMIT 1
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (name, specialization, dept_id, phone, email) 
SELECT 'Dr. James Anderson', 'Cardiologist', dept_id, '555-1002', 'james.anderson@medicare.com'
FROM departments WHERE name = 'Cardiology' LIMIT 1
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (name, specialization, dept_id, phone, email) 
SELECT 'Dr. Emily Watson', 'Neurologist', dept_id, '555-1003', 'emily.watson@medicare.com'
FROM departments WHERE name = 'Neurology' LIMIT 1
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (name, specialization, dept_id, phone, email) 
SELECT 'Dr. Michael Brooks', 'Orthopedic Surgeon', dept_id, '555-1004', 'michael.brooks@medicare.com'
FROM departments WHERE name = 'Orthopedics' LIMIT 1
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (name, specialization, dept_id, phone, email) 
SELECT 'Dr. Lisa Chen', 'Pediatrician', dept_id, '555-1005', 'lisa.chen@medicare.com'
FROM departments WHERE name = 'Pediatrics' LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Insert random patients
INSERT INTO patients (full_name, dob, gender, phone, address, emergency_contact, blood_group) VALUES
('Alice Thompson', '1988-05-12', 'F', '555-2001', '123 Main St, Apt 5', '555-2002', 'A+'),
('Bob Wilson', '1975-08-23', 'M', '555-2003', '456 Oak Ave', '555-2004', 'O+'),
('Carol Davis', '1992-11-30', 'F', '555-2005', '789 Pine Rd', '555-2006', 'B+'),
('David Martinez', '1980-03-18', 'M', '555-2007', '321 Elm St', '555-2008', 'AB+'),
('Emma Johnson', '1995-07-22', 'F', '555-2009', '654 Cedar Ln', '555-2010', 'A-'),
('Frank Brown', '1970-12-05', 'M', '555-2011', '987 Birch Blvd', '555-2012', 'O-'),
('Grace Lee', '1985-09-14', 'F', '555-2013', '147 Maple Ave', '555-2014', 'B-'),
('Henry Taylor', '1998-02-28', 'M', '555-2015', '258 Willow Way', '555-2016', 'AB-'),
('Iris Anderson', '1982-06-10', 'F', '555-2017', '369 Ash Ct', '555-2018', 'A+'),
('Jack Miller', '1990-10-25', 'M', '555-2019', '741 Spruce Dr', '555-2020', 'O+');

-- Insert more services
INSERT INTO services (name, description, cost, category) VALUES
('COVID-19 Test', 'RT-PCR test for COVID-19', 500.00, 'lab'),
('Dental Consultation', 'Dental checkup and cleaning', 800.00, 'consultation'),
('Dialysis Session', 'Kidney dialysis treatment', 3000.00, 'procedure'),
('Chemotherapy Session', 'Cancer chemotherapy', 15000.00, 'procedure'),
('Insulin Injection', 'Insulin administration', 200.00, 'medicine'),
('ICU Bed (per day)', 'Intensive care unit bed', 5000.00, 'room'),
('General Ward Bed (per day)', 'General ward accommodation', 1500.00, 'room'),
('Private Room (per day)', 'Private room accommodation', 3000.00, 'room'),
('Nebulization', 'Breathing treatment', 300.00, 'procedure'),
('Bandaging', 'Wound bandaging', 150.00, 'procedure')
ON CONFLICT (name) DO NOTHING;

-- Display summary
SELECT '========================================' as separator;
SELECT '✅ RANDOM DATA ADDED SUCCESSFULLY!' as message;
SELECT '========================================' as separator;

SELECT 'CURRENT DATA COUNTS:' as info;
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
UNION ALL SELECT 'Users: ' || COUNT(*) FROM users;

SELECT '========================================' as separator;
SELECT 'Data added successfully!' as message;
SELECT 'You can now test with realistic patient and service data' as note;
