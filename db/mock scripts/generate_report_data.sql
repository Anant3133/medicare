-- Generate comprehensive data for Reports dashboard
-- This script creates realistic data for all report types (FIXED for actual schema)

-- ==========================================
-- 1. GENERATE REVENUE DATA (Past 30 days)
-- ==========================================

DO $$
DECLARE
  day_offset INTEGER;
  bill_count INTEGER;
  base_amount DECIMAL;
  admission_record RECORD;
  service_record RECORD;
  new_bill_id INTEGER;
BEGIN
  -- Generate bills for the last 30 days
  FOR day_offset IN 0..29 LOOP
    -- Create 3-8 bills per day
    bill_count := 3 + floor(random() * 6)::INTEGER;
    
    FOR i IN 1..bill_count LOOP
      -- Get a random admission
      SELECT admission_id INTO admission_record
      FROM admissions
      ORDER BY random()
      LIMIT 1;
      
      -- Generate bill with random amount between $500 and $5000
      base_amount := 500 + (random() * 4500);
      
      INSERT INTO bills (
        admission_id,
        amount,
        tax,
        discount,
        created_at,
        paid_at,
        status
      ) VALUES (
        admission_record.admission_id,
        base_amount,
        base_amount * 0.08, -- 8% tax
        base_amount * (random() * 0.1), -- 0-10% discount
        CURRENT_DATE - (day_offset || ' days')::INTERVAL + (random() * 24 || ' hours')::INTERVAL,
        CASE 
          WHEN random() < 0.7 THEN CURRENT_DATE - (day_offset || ' days')::INTERVAL + (random() * 48 || ' hours')::INTERVAL
          ELSE NULL
        END,
        CASE 
          WHEN random() < 0.7 THEN 'paid'
          ELSE 'pending'
        END
      ) RETURNING bill_id INTO new_bill_id;
      
      -- Add 1-3 line items to the bill
      FOR j IN 1..(1 + floor(random() * 3)::INTEGER) LOOP
        SELECT service_id INTO service_record
        FROM services
        ORDER BY random()
        LIMIT 1;
        
        INSERT INTO bill_items (
          bill_id,
          service_id,
          quantity,
          unit_price
        ) VALUES (
          new_bill_id,
          service_record.service_id,
          1 + floor(random() * 3)::INTEGER,
          100 + (random() * 500)
        );
      END LOOP;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Generated revenue data for 30 days';
END $$;

-- ==========================================
-- 2. GENERATE ADMISSION TRENDS (Past 30 days)
-- ==========================================

DO $$
DECLARE
  day_offset INTEGER;
  admission_count INTEGER;
  patient_record RECORD;
  doctor_record RECORD;
  bed_record RECORD;
  admission_date TIMESTAMP;
  new_admission_id INTEGER;
BEGIN
  -- Generate admissions for the last 30 days
  FOR day_offset IN 0..29 LOOP
    admission_date := CURRENT_DATE - (day_offset || ' days')::INTERVAL;
    
    -- Create 2-7 admissions per day
    admission_count := 2 + floor(random() * 6)::INTEGER;
    
    FOR i IN 1..admission_count LOOP
      -- Get random patient, doctor, and bed
      SELECT patient_id INTO patient_record
      FROM patients
      ORDER BY random()
      LIMIT 1;
      
      SELECT doctor_id INTO doctor_record
      FROM doctors
      ORDER BY random()
      LIMIT 1;
      
      SELECT bed_id INTO bed_record
      FROM beds
      WHERE status = 'available'
      ORDER BY random()
      LIMIT 1;
      
      -- If no available bed, get any bed
      IF bed_record.bed_id IS NULL THEN
        SELECT bed_id INTO bed_record
        FROM beds
        ORDER BY random()
        LIMIT 1;
      END IF;
      
      -- Insert admission
      INSERT INTO admissions (
        patient_id,
        doctor_id,
        bed_id,
        admitted_on,
        priority,
        admission_status,
        diagnosis,
        created_at
      ) VALUES (
        patient_record.patient_id,
        doctor_record.doctor_id,
        bed_record.bed_id,
        admission_date + (random() * 24 || ' hours')::INTERVAL,
        (1 + floor(random() * 5))::INTEGER, -- Priority 1-5
        CASE 
          WHEN day_offset < 15 AND random() < 0.6 THEN 'discharged'
          ELSE 'active'
        END,
        CASE floor(random() * 5)
          WHEN 0 THEN 'Cardiac complications'
          WHEN 1 THEN 'Respiratory infection'
          WHEN 2 THEN 'Post-surgical care'
          WHEN 3 THEN 'Emergency trauma'
          ELSE 'General medical care'
        END,
        admission_date
      ) RETURNING admission_id INTO new_admission_id;
      
      -- Update admission with discharge date if status is discharged
      IF day_offset < 15 AND random() < 0.6 THEN
        UPDATE admissions
        SET discharged_on = admission_date + ((2 + random() * 5) || ' days')::INTERVAL
        WHERE admission_id = new_admission_id;
      END IF;
    END LOOP;
    
    -- Mark some older admissions as discharged
    IF day_offset > 7 THEN
      UPDATE admissions
      SET 
        admission_status = 'discharged',
        discharged_on = admission_date + ((3 + random() * 7) || ' days')::INTERVAL
      WHERE 
        admitted_on::DATE = admission_date::DATE
        AND random() < 0.3
        AND admission_status = 'active';
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Generated admission trends data for 30 days';
END $$;

-- ==========================================
-- 3. UPDATE BED STATUSES FOR OCCUPANCY
-- ==========================================

DO $$
DECLARE
  total_beds INTEGER;
  occupied_count INTEGER;
  bed_record RECORD;
BEGIN
  -- Get total bed count
  SELECT COUNT(*) INTO total_beds FROM beds;
  
  -- Set 60-80% occupancy
  occupied_count := floor(total_beds * (0.6 + random() * 0.2))::INTEGER;
  
  -- First, set all beds to available
  UPDATE beds SET status = 'available';
  
  -- Set random beds to occupied
  FOR bed_record IN (
    SELECT bed_id 
    FROM beds 
    ORDER BY random() 
    LIMIT occupied_count
  ) LOOP
    UPDATE beds 
    SET status = 'occupied'
    WHERE bed_id = bed_record.bed_id;
  END LOOP;
  
  -- Set 5-10% to maintenance
  UPDATE beds 
  SET status = 'maintenance'
  WHERE bed_id IN (
    SELECT bed_id 
    FROM beds 
    WHERE status = 'available' 
    ORDER BY random() 
    LIMIT floor(total_beds * (0.05 + random() * 0.05))::INTEGER
  );
  
  RAISE NOTICE 'Updated bed occupancy statuses';
END $$;

-- ==========================================
-- 4. ASSIGN ACTIVE PATIENTS TO DOCTORS
-- ==========================================

DO $$
DECLARE
  doctor_record RECORD;
  patient_count INTEGER;
BEGIN
  -- Update active admissions to ensure they have valid doctor assignments
  FOR doctor_record IN (SELECT doctor_id FROM doctors) LOOP
    -- Assign 3-12 active patients per doctor
    patient_count := 3 + floor(random() * 10)::INTEGER;
    
    UPDATE admissions
    SET doctor_id = doctor_record.doctor_id
    WHERE admission_id IN (
      SELECT admission_id
      FROM admissions
      WHERE admission_status = 'active'
      ORDER BY random()
      LIMIT patient_count
    );
  END LOOP;
  
  RAISE NOTICE 'Assigned active patients to doctors';
END $$;

-- ==========================================
-- 5. GENERATE AUDIT LOG ENTRIES
-- ==========================================

DO $$
DECLARE
  day_offset INTEGER;
  log_count INTEGER;
  tables TEXT[] := ARRAY['patients', 'doctors', 'admissions', 'bills', 'beds'];
  actions TEXT[] := ARRAY['INSERT', 'UPDATE', 'DELETE'];
  user_emails TEXT[] := ARRAY['admin@medicare.com', 'doctor@medicare.com', 'staff@medicare.com'];
  table_name TEXT;
  action_type TEXT;
  user_email TEXT;
BEGIN
  -- Clear existing audit logs first
  DELETE FROM audit_log;
  
  -- Generate audit logs for the last 30 days
  FOR day_offset IN 0..29 LOOP
    log_count := 5 + floor(random() * 20)::INTEGER;
    
    FOR i IN 1..log_count LOOP
      table_name := tables[1 + floor(random() * array_length(tables, 1))::INTEGER];
      action_type := actions[1 + floor(random() * array_length(actions, 1))::INTEGER];
      user_email := user_emails[1 + floor(random() * array_length(user_emails, 1))::INTEGER];
      
      INSERT INTO audit_log (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by,
        changed_at
      ) VALUES (
        table_name,
        floor(random() * 1000)::INTEGER,
        action_type,
        CASE 
          WHEN action_type = 'INSERT' THEN NULL
          ELSE jsonb_build_object('status', 'old_value', 'updated_at', CURRENT_TIMESTAMP)
        END,
        CASE 
          WHEN action_type = 'DELETE' THEN NULL
          ELSE jsonb_build_object('status', 'new_value', 'updated_at', CURRENT_TIMESTAMP)
        END,
        user_email,
        CURRENT_TIMESTAMP - (day_offset || ' days')::INTERVAL - (random() * 24 || ' hours')::INTERVAL
      );
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Generated audit log entries for 30 days';
END $$;

-- ==========================================
-- SUMMARY STATISTICS
-- ==========================================

DO $$
DECLARE
  total_bills INTEGER;
  total_admissions INTEGER;
  active_admissions INTEGER;
  total_revenue DECIMAL;
  occupied_beds INTEGER;
  total_beds INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_bills FROM bills WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
  SELECT COUNT(*) INTO total_admissions FROM admissions WHERE admitted_on >= CURRENT_DATE - INTERVAL '30 days';
  SELECT COUNT(*) INTO active_admissions FROM admissions WHERE admission_status = 'active';
  SELECT SUM(total) INTO total_revenue FROM bills WHERE status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '30 days';
  SELECT COUNT(*) INTO occupied_beds FROM beds WHERE status = 'occupied';
  SELECT COUNT(*) INTO total_beds FROM beds;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'DATA GENERATION COMPLETE!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Bills (30 days): %', total_bills;
  RAISE NOTICE 'Total Revenue: $%', COALESCE(total_revenue, 0);
  RAISE NOTICE 'Admissions (30 days): %', total_admissions;
  RAISE NOTICE 'Active Admissions: %', active_admissions;
  RAISE NOTICE 'Bed Occupancy: %/% (%%)', occupied_beds, total_beds, ROUND((occupied_beds::DECIMAL / NULLIF(total_beds, 0) * 100), 1);
  RAISE NOTICE '============================================';
END $$;
