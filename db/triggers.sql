-- db/triggers.sql
-- MEDICARE: Triggers for audit logging and business rules
-- Demonstrates: Triggers, Audit Trails, Automatic Data Validation

-- Trigger function: Audit log for patients table
CREATE OR REPLACE FUNCTION audit_patients()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, operation, new_data, changed_by)
    VALUES ('patients', NEW.patient_id, 'INSERT', row_to_json(NEW)::jsonb, current_user);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, changed_by)
    VALUES ('patients', NEW.patient_id, 'UPDATE', 
            row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, current_user);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, changed_by)
    VALUES ('patients', OLD.patient_id, 'DELETE', row_to_json(OLD)::jsonb, current_user);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on patients table
CREATE TRIGGER trg_audit_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION audit_patients();

COMMENT ON TRIGGER trg_audit_patients ON patients IS 'Audit trigger capturing all changes to patients table';

-- Trigger function: Audit log for admissions table
CREATE OR REPLACE FUNCTION audit_admissions()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, operation, new_data, changed_by)
    VALUES ('admissions', NEW.admission_id, 'INSERT', row_to_json(NEW)::jsonb, current_user);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, changed_by)
    VALUES ('admissions', NEW.admission_id, 'UPDATE', 
            row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, current_user);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, changed_by)
    VALUES ('admissions', OLD.admission_id, 'DELETE', row_to_json(OLD)::jsonb, current_user);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on admissions table
CREATE TRIGGER trg_audit_admissions
AFTER INSERT OR UPDATE OR DELETE ON admissions
FOR EACH ROW EXECUTE FUNCTION audit_admissions();

COMMENT ON TRIGGER trg_audit_admissions ON admissions IS 'Audit trigger for admission records - demonstrates automatic logging';

-- Trigger function: Audit log for beds table
CREATE OR REPLACE FUNCTION audit_beds()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, operation, new_data, changed_by)
    VALUES ('beds', NEW.bed_id, 'INSERT', row_to_json(NEW)::jsonb, current_user);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, changed_by)
    VALUES ('beds', NEW.bed_id, 'UPDATE', 
            row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, current_user);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, changed_by)
    VALUES ('beds', OLD.bed_id, 'DELETE', row_to_json(OLD)::jsonb, current_user);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on beds table
CREATE TRIGGER trg_audit_beds
AFTER INSERT OR UPDATE OR DELETE ON beds
FOR EACH ROW EXECUTE FUNCTION audit_beds();

COMMENT ON TRIGGER trg_audit_beds ON beds IS 'Audit trigger for bed status changes';

-- Trigger function: Audit log for bills table
CREATE OR REPLACE FUNCTION audit_bills()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, operation, new_data, changed_by)
    VALUES ('bills', NEW.bill_id, 'INSERT', row_to_json(NEW)::jsonb, current_user);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, changed_by)
    VALUES ('bills', NEW.bill_id, 'UPDATE', 
            row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, current_user);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, changed_by)
    VALUES ('bills', OLD.bill_id, 'DELETE', row_to_json(OLD)::jsonb, current_user);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on bills table
CREATE TRIGGER trg_audit_bills
AFTER INSERT OR UPDATE OR DELETE ON bills
FOR EACH ROW EXECUTE FUNCTION audit_bills();

COMMENT ON TRIGGER trg_audit_bills ON bills IS 'Audit trigger for billing records';

-- Trigger function: Validate bed allocation
-- Prevents assigning an already occupied bed
CREATE OR REPLACE FUNCTION validate_bed_allocation()
RETURNS TRIGGER AS $$
DECLARE
  v_bed_status TEXT;
BEGIN
  -- Only check if bed_id is being set or changed
  IF NEW.bed_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.bed_id IS DISTINCT FROM NEW.bed_id) THEN
    -- Check current bed status
    SELECT status INTO v_bed_status
    FROM beds
    WHERE bed_id = NEW.bed_id;
    
    IF v_bed_status IS NULL THEN
      RAISE EXCEPTION 'Bed ID % does not exist', NEW.bed_id;
    END IF;
    
    IF v_bed_status != 'available' THEN
      RAISE EXCEPTION 'Bed ID % is not available (current status: %)', NEW.bed_id, v_bed_status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on admissions table (BEFORE INSERT/UPDATE)
CREATE TRIGGER trg_validate_bed_allocation
BEFORE INSERT OR UPDATE ON admissions
FOR EACH ROW
WHEN (NEW.bed_id IS NOT NULL)
EXECUTE FUNCTION validate_bed_allocation();

COMMENT ON TRIGGER trg_validate_bed_allocation ON admissions IS 'BEFORE trigger preventing assignment of unavailable beds - demonstrates data validation';

-- Trigger function: Auto-update bed status on discharge
CREATE OR REPLACE FUNCTION auto_update_bed_on_discharge()
RETURNS TRIGGER AS $$
BEGIN
  -- When admission status changes to 'discharged', free the bed
  IF NEW.admission_status = 'discharged' AND OLD.admission_status != 'discharged' THEN
    IF NEW.bed_id IS NOT NULL THEN
      UPDATE beds
      SET status = 'available'
      WHERE bed_id = NEW.bed_id;
      
      RAISE NOTICE 'Bed % automatically freed on discharge', NEW.bed_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on admissions table (AFTER UPDATE)
CREATE TRIGGER trg_auto_update_bed_on_discharge
AFTER UPDATE ON admissions
FOR EACH ROW
WHEN (NEW.admission_status = 'discharged')
EXECUTE FUNCTION auto_update_bed_on_discharge();

COMMENT ON TRIGGER trg_auto_update_bed_on_discharge ON admissions IS 'AFTER trigger automatically freeing beds on discharge - demonstrates cascading updates';

-- Trigger function: Update last login timestamp for users
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This would be called manually in application when user logs in
-- CREATE TRIGGER trg_update_last_login
-- BEFORE UPDATE ON users
-- FOR EACH ROW EXECUTE FUNCTION update_last_login();

-- Trigger function: Validate admission dates
CREATE OR REPLACE FUNCTION validate_admission_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure discharged_on is after admitted_on
  IF NEW.discharged_on IS NOT NULL AND NEW.discharged_on < NEW.admitted_on THEN
    RAISE EXCEPTION 'Discharge date cannot be before admission date';
  END IF;
  
  -- Ensure admitted_on is not in the future
  IF NEW.admitted_on > now() + INTERVAL '1 day' THEN
    RAISE EXCEPTION 'Admission date cannot be more than 1 day in the future';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on admissions table (BEFORE INSERT/UPDATE)
CREATE TRIGGER trg_validate_admission_dates
BEFORE INSERT OR UPDATE ON admissions
FOR EACH ROW EXECUTE FUNCTION validate_admission_dates();

COMMENT ON TRIGGER trg_validate_admission_dates ON admissions IS 'BEFORE trigger validating business rules for dates';

-- Trigger function: Notify when bed becomes available
-- This could be used to automatically assign waiting list patients
CREATE OR REPLACE FUNCTION notify_bed_available()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'available' AND OLD.status != 'available' THEN
    -- In a real system, this could trigger a notification or automatic assignment
    -- For now, we just raise a notice
    RAISE NOTICE 'Bed % (%) is now available in room %', 
                 NEW.bed_id, NEW.bed_type, NEW.room_id;
    
    -- Could insert into a notifications table or trigger waiting list processing
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on beds table (AFTER UPDATE)
CREATE TRIGGER trg_notify_bed_available
AFTER UPDATE ON beds
FOR EACH ROW
WHEN (NEW.status = 'available')
EXECUTE FUNCTION notify_bed_available();

COMMENT ON TRIGGER trg_notify_bed_available ON beds IS 'AFTER trigger for notifications when beds become available';

-- Trigger function: Validate bill payment
CREATE OR REPLACE FUNCTION validate_bill_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- When marking bill as paid, set paid_at timestamp
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    IF NEW.paid_at IS NULL THEN
      NEW.paid_at := now();
    END IF;
  END IF;
  
  -- Ensure paid_at is set only when status is paid
  IF NEW.status != 'paid' AND NEW.paid_at IS NOT NULL THEN
    RAISE EXCEPTION 'Payment date can only be set when bill status is paid';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on bills table (BEFORE UPDATE)
CREATE TRIGGER trg_validate_bill_payment
BEFORE UPDATE ON bills
FOR EACH ROW EXECUTE FUNCTION validate_bill_payment();

COMMENT ON TRIGGER trg_validate_bill_payment ON bills IS 'BEFORE trigger ensuring payment date consistency';
