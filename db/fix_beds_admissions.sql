-- Quick fix: Insert beds and admissions using existing room/patient/doctor IDs

-- First, check what room IDs we have
DO $$
DECLARE
    room_count INT;
BEGIN
    SELECT COUNT(*) INTO room_count FROM rooms;
    RAISE NOTICE 'Found % rooms in database', room_count;
END $$;

-- Insert beds using actual room IDs from the database
-- We'll create 3-4 beds per room for the first 20 rooms

INSERT INTO beds (bed_number, room_id, bed_type, status, last_maintenance)
SELECT 
    'A' as bed_number,
    room_id,
    CASE 
        WHEN room_type = 'icu' THEN 'icu'
        WHEN room_type = 'emergency' THEN 'normal'
        WHEN room_type = 'private' THEN 'normal'
        ELSE 'normal'
    END as bed_type,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY room_id) % 3 = 0 THEN 'available'
        WHEN ROW_NUMBER() OVER (ORDER BY room_id) % 3 = 1 THEN 'occupied'
        ELSE 'available'
    END as status,
    CURRENT_DATE - (RANDOM() * 30)::INT as last_maintenance
FROM rooms
WHERE room_id <= (SELECT MIN(room_id) + 19 FROM rooms)
ORDER BY room_id;

-- Add bed B to rooms with capacity > 1
INSERT INTO beds (bed_number, room_id, bed_type, status, last_maintenance)
SELECT 
    'B' as bed_number,
    room_id,
    CASE 
        WHEN room_type = 'icu' THEN 'icu'
        WHEN room_type = 'emergency' THEN 'normal'
        WHEN room_type = 'private' THEN 'normal'
        ELSE 'normal'
    END as bed_type,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY room_id) % 2 = 0 THEN 'available'
        ELSE 'occupied'
    END as status,
    CURRENT_DATE - (RANDOM() * 30)::INT as last_maintenance
FROM rooms
WHERE capacity > 1 
AND room_id <= (SELECT MIN(room_id) + 19 FROM rooms)
ORDER BY room_id;

-- Add bed C and D to larger rooms
INSERT INTO beds (bed_number, room_id, bed_type, status, last_maintenance)
SELECT 
    bed_letter as bed_number,
    room_id,
    'normal' as bed_type,
    'available' as status,
    CURRENT_DATE - (RANDOM() * 30)::INT as last_maintenance
FROM rooms
CROSS JOIN (SELECT unnest(ARRAY['C', 'D']) as bed_letter) letters
WHERE capacity >= 3
AND room_id <= (SELECT MIN(room_id) + 15 FROM rooms)
ORDER BY room_id, bed_letter;

-- Now create some admissions using actual patient, bed, and doctor IDs
INSERT INTO admissions (patient_id, bed_id, doctor_id, admitted_on, admission_status, priority, diagnosis, notes)
SELECT 
    p.patient_id,
    b.bed_id,
    d.doctor_id,
    CURRENT_DATE - (RANDOM() * 10)::INT as admitted_on,
    'active' as admission_status,
    (RANDOM() * 4 + 1)::INT as priority,
    'General admission' as diagnosis,
    'Auto-generated admission' as notes
FROM (SELECT patient_id FROM patients ORDER BY patient_id LIMIT 15) p
CROSS JOIN LATERAL (
    SELECT bed_id FROM beds WHERE status = 'occupied' ORDER BY RANDOM() LIMIT 1
) b
CROSS JOIN LATERAL (
    SELECT doctor_id FROM doctors ORDER BY RANDOM() LIMIT 1
) d
LIMIT 15;

-- Update bed status to match admissions
UPDATE beds SET status = 'occupied' 
WHERE bed_id IN (SELECT DISTINCT bed_id FROM admissions WHERE admission_status = 'active' AND bed_id IS NOT NULL);

-- Create some bills for active admissions
INSERT INTO bills (admission_id, amount, tax, discount, status, created_at)
SELECT 
    admission_id,
    (RANDOM() * 5000 + 1000)::NUMERIC(12,2) as amount,
    (RANDOM() * 500 + 100)::NUMERIC(12,2) as tax,
    (RANDOM() * 200)::NUMERIC(12,2) as discount,
    CASE 
        WHEN RANDOM() > 0.7 THEN 'paid'
        ELSE 'pending'
    END as status,
    admitted_on as created_at
FROM admissions
WHERE admission_status = 'active'
LIMIT 10;

-- Show summary
DO $$
DECLARE
    bed_count INT;
    admission_count INT;
    bill_count INT;
BEGIN
    SELECT COUNT(*) INTO bed_count FROM beds;
    SELECT COUNT(*) INTO admission_count FROM admissions;
    SELECT COUNT(*) INTO bill_count FROM bills;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Data Fix Complete!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Beds created: %', bed_count;
    RAISE NOTICE 'Admissions created: %', admission_count;
    RAISE NOTICE 'Bills created: %', bill_count;
    RAISE NOTICE '==============================================';
END $$;
