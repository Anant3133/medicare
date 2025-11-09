-- db/functions.sql
-- MEDICARE: Stored procedures and functions demonstrating procedural SQL
-- Demonstrates: Stored Procedures, Functions, Transactions, Business Logic in DB

-- Function: Get available beds by type
-- Returns all available beds of a specific type with room information
CREATE OR REPLACE FUNCTION get_available_beds(bed_type_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  bed_id INT,
  bed_number TEXT,
  bed_type TEXT,
  room_number TEXT,
  floor INT,
  room_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.bed_id,
    b.bed_number,
    b.bed_type,
    r.room_number,
    r.floor,
    r.room_type
  FROM beds b
  JOIN rooms r ON b.room_id = r.room_id
  WHERE b.status = 'available'
    AND (bed_type_filter IS NULL OR b.bed_type = bed_type_filter)
  ORDER BY r.floor, r.room_number, b.bed_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_beds IS 'Returns available beds with room info - demonstrates stored functions';

-- Function: Allocate bed with concurrency control
-- Uses FOR UPDATE to prevent race conditions during bed allocation
CREATE OR REPLACE FUNCTION allocate_bed_to_admission(
  p_admission_id INT,
  p_bed_type TEXT DEFAULT 'normal'
)
RETURNS INT AS $$
DECLARE
  v_bed_id INT;
BEGIN
  -- Lock an available bed FOR UPDATE to prevent concurrent allocation
  -- This demonstrates row-level locking for concurrency control
  SELECT bed_id INTO v_bed_id
  FROM beds
  WHERE status = 'available'
    AND bed_type = p_bed_type
  ORDER BY bed_id
  LIMIT 1
  FOR UPDATE SKIP LOCKED; -- Skip locked rows for better concurrency
  
  IF v_bed_id IS NULL THEN
    RAISE EXCEPTION 'No available beds of type % found', p_bed_type;
  END IF;
  
  -- Update admission FIRST (while bed is still 'available' so trigger passes)
  UPDATE admissions
  SET bed_id = v_bed_id,
      admission_status = 'active'
  WHERE admission_id = p_admission_id;
  
  -- THEN update bed status to occupied
  UPDATE beds
  SET status = 'occupied'
  WHERE bed_id = v_bed_id;
  
  RETURN v_bed_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION allocate_bed_to_admission IS 'Allocates bed with FOR UPDATE locking - demonstrates concurrency control';

-- Procedure: Process patient admission
-- Complete admission workflow with transaction handling
CREATE OR REPLACE FUNCTION process_admission(
  p_patient_id INT,
  p_doctor_id INT,
  p_bed_type TEXT,
  p_priority SMALLINT,
  p_diagnosis TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_admission_id INT;
  v_bed_id INT;
BEGIN
  -- This entire function runs in a transaction
  -- If any step fails, everything rolls back
  
  -- Create admission record with waiting status
  INSERT INTO admissions (
    patient_id,
    doctor_id,
    admission_status,
    priority,
    diagnosis,
    notes
  )
  VALUES (
    p_patient_id,
    p_doctor_id,
    'waiting',
    p_priority,
    p_diagnosis,
    p_notes
  )
  RETURNING admission_id INTO v_admission_id;
  
  -- Try to allocate a bed
  BEGIN
    v_bed_id := allocate_bed_to_admission(v_admission_id, p_bed_type);
    
    RAISE NOTICE 'Admission % created and bed % allocated', v_admission_id, v_bed_id;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- If no bed available, add to waiting list
      INSERT INTO waiting_list (patient_id, dept_id, priority, notes)
      SELECT p_patient_id, d.dept_id, p_priority, 'Auto-added from admission'
      FROM doctors d
      WHERE d.doctor_id = p_doctor_id;
      
      RAISE NOTICE 'No bed available. Patient added to waiting list.';
  END;
  
  RETURN v_admission_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_admission IS 'Complete admission workflow with automatic bed allocation or waiting list - demonstrates transaction handling';

-- Function: Discharge patient
-- Handles patient discharge and frees up the bed
CREATE OR REPLACE FUNCTION discharge_patient(
  p_admission_id INT
)
RETURNS VOID AS $$
DECLARE
  v_bed_id INT;
BEGIN
  -- Get the bed_id before updating
  SELECT bed_id INTO v_bed_id
  FROM admissions
  WHERE admission_id = p_admission_id;
  
  -- Update admission status
  UPDATE admissions
  SET admission_status = 'discharged',
      discharged_on = now()
  WHERE admission_id = p_admission_id
    AND admission_status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admission % not found or already discharged', p_admission_id;
  END IF;
  
  -- Free up the bed
  IF v_bed_id IS NOT NULL THEN
    UPDATE beds
    SET status = 'available'
    WHERE bed_id = v_bed_id;
  END IF;
  
  RAISE NOTICE 'Patient discharged from admission %, bed % freed', p_admission_id, v_bed_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION discharge_patient IS 'Discharge patient and free bed - demonstrates multi-table updates';

-- Function: Calculate bill for admission
-- Generates bill based on room charges and duration
CREATE OR REPLACE FUNCTION calculate_admission_bill(
  p_admission_id INT,
  p_room_charge_per_day NUMERIC DEFAULT 1000.00
)
RETURNS NUMERIC AS $$
DECLARE
  v_days INT;
  v_amount NUMERIC;
  v_bed_type TEXT;
  v_multiplier NUMERIC;
BEGIN
  -- Calculate days stayed
  SELECT 
    COALESCE(EXTRACT(DAY FROM (COALESCE(discharged_on, now()) - admitted_on)), 1),
    b.bed_type
  INTO v_days, v_bed_type
  FROM admissions a
  LEFT JOIN beds b ON a.bed_id = b.bed_id
  WHERE a.admission_id = p_admission_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admission % not found', p_admission_id;
  END IF;
  
  -- Different rates for different bed types
  v_multiplier := CASE v_bed_type
    WHEN 'icu' THEN 3.0
    WHEN 'maternity' THEN 1.5
    WHEN 'pediatric' THEN 1.2
    ELSE 1.0
  END;
  
  v_amount := v_days * p_room_charge_per_day * v_multiplier;
  
  RETURN v_amount;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_admission_bill IS 'Calculate bill amount based on stay duration and bed type';

-- Function: Generate bill for admission
-- Creates a bill record with calculated amounts
CREATE OR REPLACE FUNCTION generate_bill(
  p_admission_id INT
)
RETURNS INT AS $$
DECLARE
  v_bill_id INT;
  v_amount NUMERIC;
  v_tax NUMERIC;
BEGIN
  -- Check if bill already exists
  SELECT bill_id INTO v_bill_id
  FROM bills
  WHERE admission_id = p_admission_id;
  
  IF v_bill_id IS NOT NULL THEN
    RAISE EXCEPTION 'Bill already exists for admission %', p_admission_id;
  END IF;
  
  -- Calculate amount
  v_amount := calculate_admission_bill(p_admission_id);
  v_tax := v_amount * 0.05; -- 5% tax
  
  -- Create bill
  INSERT INTO bills (admission_id, amount, tax, status)
  VALUES (p_admission_id, v_amount, v_tax, 'pending')
  RETURNING bill_id INTO v_bill_id;
  
  -- Add room charge as line item
  INSERT INTO bill_items (bill_id, service_id, quantity, unit_price)
  SELECT v_bill_id, service_id, 1, v_amount
  FROM services
  WHERE name = 'Room Charges'
  LIMIT 1;
  
  RETURN v_bill_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_bill IS 'Generate complete bill for an admission with tax calculation';

-- Function: Get bed occupancy statistics
-- Returns aggregated stats for reporting
CREATE OR REPLACE FUNCTION get_bed_occupancy_stats()
RETURNS TABLE (
  total_beds BIGINT,
  occupied_beds BIGINT,
  available_beds BIGINT,
  maintenance_beds BIGINT,
  occupancy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_beds,
    COUNT(*) FILTER (WHERE status = 'occupied')::BIGINT as occupied_beds,
    COUNT(*) FILTER (WHERE status = 'available')::BIGINT as available_beds,
    COUNT(*) FILTER (WHERE status = 'maintenance')::BIGINT as maintenance_beds,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'occupied')::NUMERIC / 
       NULLIF(COUNT(*)::NUMERIC, 0) * 100), 2
    ) as occupancy_rate
  FROM beds;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_bed_occupancy_stats IS 'Returns bed occupancy statistics - demonstrates aggregate functions';

-- Function: Get next patient from waiting list
-- Returns highest priority patient waiting for a specific department
CREATE OR REPLACE FUNCTION get_next_waiting_patient(p_dept_id INT)
RETURNS TABLE (
  wait_id INT,
  patient_id INT,
  patient_name TEXT,
  priority SMALLINT,
  waiting_since TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wl.wait_id,
    wl.patient_id,
    p.full_name,
    wl.priority,
    wl.requested_on
  FROM waiting_list wl
  JOIN patients p ON wl.patient_id = p.patient_id
  WHERE wl.dept_id = p_dept_id
    AND wl.status = 'waiting'
  ORDER BY wl.priority ASC, wl.requested_on ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_waiting_patient IS 'Get next patient from waiting list by priority - demonstrates queue management';
