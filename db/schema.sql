-- db/schema.sql
-- MEDICARE: schema.sql - normalized tables with constraints and comments
-- Demonstrates: Normalization, Constraints, Data Integrity, Referential Integrity

-- Drop tables if exist (for clean migration)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS waiting_list CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS admissions CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Departments table: Normalized hospital departments
CREATE TABLE departments (
  dept_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE departments IS 'Hospital departments for categorizing doctors and services';

-- Doctors table: Doctor information with department reference
CREATE TABLE doctors (
  doctor_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  dept_id INT NOT NULL REFERENCES departments(dept_id) ON DELETE RESTRICT,
  phone TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE doctors IS 'Doctor information with foreign key to departments';
COMMENT ON COLUMN doctors.dept_id IS 'Foreign key ensuring referential integrity with departments';

-- Patients table: Patient demographic information
CREATE TABLE patients (
  patient_id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  dob DATE,
  gender CHAR(1) CHECK (gender IN ('M','F','O')),
  phone TEXT,
  address TEXT,
  emergency_contact TEXT,
  blood_group TEXT CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE patients IS 'Patient master data with CHECK constraints for data validation';
COMMENT ON COLUMN patients.gender IS 'CHECK constraint ensures only valid gender values';

-- Rooms table: Physical room information
CREATE TABLE rooms (
  room_id SERIAL PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  floor INT NOT NULL CHECK (floor >= 0),
  room_type TEXT NOT NULL CHECK (room_type IN ('general','icu','private','emergency')),
  capacity INT NOT NULL DEFAULT 1 CHECK (capacity > 0),
  created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE rooms IS 'Hospital rooms with capacity and type constraints';

-- Beds table: Individual bed tracking with status
CREATE TABLE beds (
  bed_id SERIAL PRIMARY KEY,
  bed_number TEXT NOT NULL,
  room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  bed_type TEXT NOT NULL CHECK (bed_type IN ('normal','icu','pediatric','maternity')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance','reserved')),
  last_maintenance TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(room_id, bed_number)
);
COMMENT ON TABLE beds IS 'Bed inventory with CASCADE delete when room is removed';
COMMENT ON COLUMN beds.status IS 'Status with CHECK constraint and default value for data integrity';

-- Admissions table: Patient admission records
CREATE TABLE admissions (
  admission_id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  bed_id INT REFERENCES beds(bed_id) ON DELETE SET NULL,
  doctor_id INT REFERENCES doctors(doctor_id) ON DELETE SET NULL,
  admitted_on TIMESTAMP DEFAULT now(),
  discharged_on TIMESTAMP,
  admission_status TEXT NOT NULL DEFAULT 'active' CHECK (admission_status IN ('active','discharged','waiting','cancelled')),
  priority SMALLINT DEFAULT 5 CHECK (priority >= 1 AND priority <= 5),
  diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT discharge_after_admission CHECK (discharged_on IS NULL OR discharged_on >= admitted_on)
);
COMMENT ON TABLE admissions IS 'Admission records with multiple foreign keys and business rule constraints';
COMMENT ON COLUMN admissions.priority IS '1 is highest priority, 5 is lowest - for waiting list management';
COMMENT ON CONSTRAINT discharge_after_admission ON admissions IS 'Business rule: discharge must be after admission';

-- Services table: Billable services catalog
CREATE TABLE services (
  service_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  cost NUMERIC(12,2) NOT NULL CHECK (cost >= 0),
  category TEXT CHECK (category IN ('consultation','procedure','lab','medicine','room','other')),
  created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE services IS 'Service catalog for billing with positive cost constraint';

-- Bills table: Patient billing information
CREATE TABLE bills (
  bill_id SERIAL PRIMARY KEY,
  admission_id INT NOT NULL REFERENCES admissions(admission_id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  tax NUMERIC(12,2) DEFAULT 0 CHECK (tax >= 0),
  discount NUMERIC(12,2) DEFAULT 0 CHECK (discount >= 0),
  total NUMERIC(12,2) GENERATED ALWAYS AS (amount + tax - discount) STORED,
  created_at TIMESTAMP DEFAULT now(),
  paid_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled','refunded'))
);
COMMENT ON TABLE bills IS 'Billing records with computed total column (GENERATED ALWAYS)';
COMMENT ON COLUMN bills.total IS 'Generated column demonstrating computed values in PostgreSQL';

-- Bill Items table: Line items for each bill
CREATE TABLE bill_items (
  bill_item_id SERIAL PRIMARY KEY,
  bill_id INT NOT NULL REFERENCES bills(bill_id) ON DELETE CASCADE,
  service_id INT NOT NULL REFERENCES services(service_id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE bill_items IS 'Bill line items with quantity and computed subtotal';

-- Waiting List table: Queue for bed assignment
CREATE TABLE waiting_list (
  wait_id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  dept_id INT NOT NULL REFERENCES departments(dept_id) ON DELETE CASCADE,
  requested_on TIMESTAMP DEFAULT now(),
  priority SMALLINT DEFAULT 5 CHECK (priority >= 1 AND priority <= 5),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','assigned','cancelled')),
  notes TEXT,
  assigned_on TIMESTAMP,
  CONSTRAINT priority_order CHECK (priority >= 1 AND priority <= 5)
);
COMMENT ON TABLE waiting_list IS 'Priority queue for bed allocation when beds are full';

-- Audit Log table: Track all database changes
CREATE TABLE audit_log (
  audit_id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INT,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT,
  changed_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE audit_log IS 'Audit trail for all data modifications - populated by triggers';
COMMENT ON COLUMN audit_log.old_data IS 'JSONB column storing previous record state for updates/deletes';
COMMENT ON COLUMN audit_log.new_data IS 'JSONB column storing new record state for inserts/updates';

-- Users table: Authentication and authorization
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','doctor','staff','billing','patient')),
  email TEXT UNIQUE,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP
);
COMMENT ON TABLE users IS 'User authentication with role-based access control';
COMMENT ON COLUMN users.role IS 'Role-based access: admin, doctor, staff, billing, patient';

-- Create indexes (basic ones here, more in indexes_and_views.sql)
CREATE INDEX idx_admissions_patient ON admissions(patient_id);
CREATE INDEX idx_admissions_status ON admissions(admission_status);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_bills_admission ON bills(admission_id);

COMMENT ON INDEX idx_admissions_patient IS 'Index for fast patient lookup in admissions';
COMMENT ON INDEX idx_admissions_status IS 'Index for filtering by admission status';
