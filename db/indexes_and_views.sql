-- db/indexes_and_views.sql
-- MEDICARE: Performance indexes and materialized views
-- Demonstrates: Indexes, Views, Query Optimization, Materialized Views

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Index on foreign keys for faster joins
CREATE INDEX IF NOT EXISTS idx_doctors_dept ON doctors(dept_id);
COMMENT ON INDEX idx_doctors_dept IS 'Speed up department-doctor joins';

CREATE INDEX IF NOT EXISTS idx_beds_room ON beds(room_id);
COMMENT ON INDEX idx_beds_room IS 'Speed up room-bed joins';

CREATE INDEX IF NOT EXISTS idx_admissions_bed ON admissions(bed_id);
COMMENT ON INDEX idx_admissions_bed IS 'Speed up bed-admission lookups';

CREATE INDEX IF NOT EXISTS idx_admissions_doctor ON admissions(doctor_id);
COMMENT ON INDEX idx_admissions_doctor IS 'Speed up doctor-patient lookups';

CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
COMMENT ON INDEX idx_bills_status IS 'Filter bills by payment status efficiently';

CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);
COMMENT ON INDEX idx_bill_items_bill IS 'Speed up bill line item retrieval';

CREATE INDEX IF NOT EXISTS idx_waiting_list_dept ON waiting_list(dept_id);
COMMENT ON INDEX idx_waiting_list_dept IS 'Speed up waiting list queries by department';

CREATE INDEX IF NOT EXISTS idx_waiting_list_status ON waiting_list(status);
COMMENT ON INDEX idx_waiting_list_status IS 'Filter waiting list by status';

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_admissions_status_date ON admissions(admission_status, admitted_on DESC);
COMMENT ON INDEX idx_admissions_status_date IS 'Composite index for status + date queries';

CREATE INDEX IF NOT EXISTS idx_beds_status_type ON beds(status, bed_type);
COMMENT ON INDEX idx_beds_status_type IS 'Composite index for finding available beds by type';

CREATE INDEX IF NOT EXISTS idx_waiting_list_priority ON waiting_list(dept_id, status, priority, requested_on);
COMMENT ON INDEX idx_waiting_list_priority IS 'Composite index for priority queue operations';

-- Partial index: Only index active admissions (most commonly queried)
CREATE INDEX IF NOT EXISTS idx_admissions_active ON admissions(patient_id, admitted_on)
WHERE admission_status = 'active';
COMMENT ON INDEX idx_admissions_active IS 'Partial index for active admissions only - demonstrates selective indexing';

-- Partial index: Only index pending bills
CREATE INDEX IF NOT EXISTS idx_bills_pending ON bills(admission_id)
WHERE status = 'pending';
COMMENT ON INDEX idx_bills_pending IS 'Partial index for unpaid bills';

-- Index on JSONB columns in audit_log for searching
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log(operation);
-- GIN index for JSONB columns to search within JSON data
CREATE INDEX IF NOT EXISTS idx_audit_log_new_data ON audit_log USING GIN (new_data);
CREATE INDEX IF NOT EXISTS idx_audit_log_old_data ON audit_log USING GIN (old_data);
COMMENT ON INDEX idx_audit_log_new_data IS 'GIN index for searching within JSONB audit data';

-- Text search indexes (if needed for patient name searches)
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Index on user authentication
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE is_active = true;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Current bed occupancy with room and patient details
CREATE OR REPLACE VIEW v_bed_occupancy AS
SELECT 
  b.bed_id,
  b.bed_number,
  b.bed_type,
  b.status,
  r.room_number,
  r.floor,
  r.room_type,
  a.admission_id,
  p.patient_id,
  p.full_name as patient_name,
  p.phone as patient_phone,
  d.name as doctor_name,
  a.admitted_on,
  a.diagnosis
FROM beds b
JOIN rooms r ON b.room_id = r.room_id
LEFT JOIN admissions a ON b.bed_id = a.bed_id AND a.admission_status = 'active'
LEFT JOIN patients p ON a.patient_id = p.patient_id
LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
ORDER BY r.floor, r.room_number, b.bed_number;

COMMENT ON VIEW v_bed_occupancy IS 'Complete bed occupancy view with patient and doctor details';

-- View: Active admissions with full patient and doctor information
CREATE OR REPLACE VIEW v_active_admissions AS
SELECT 
  a.admission_id,
  a.admitted_on,
  a.priority,
  a.diagnosis,
  p.patient_id,
  p.full_name as patient_name,
  p.dob,
  p.gender,
  p.phone as patient_phone,
  p.emergency_contact,
  d.doctor_id,
  d.name as doctor_name,
  d.specialization,
  dept.name as department,
  b.bed_id,
  b.bed_number,
  b.bed_type,
  r.room_number,
  r.floor
FROM admissions a
JOIN patients p ON a.patient_id = p.patient_id
LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
LEFT JOIN departments dept ON d.dept_id = dept.dept_id
LEFT JOIN beds b ON a.bed_id = b.bed_id
LEFT JOIN rooms r ON b.room_id = r.room_id
WHERE a.admission_status = 'active'
ORDER BY a.priority ASC, a.admitted_on ASC;

COMMENT ON VIEW v_active_admissions IS 'All active admissions with complete patient/doctor/bed details';

-- View: Billing summary with admission details
CREATE OR REPLACE VIEW v_billing_summary AS
SELECT 
  b.bill_id,
  b.status as bill_status,
  b.amount,
  b.tax,
  b.discount,
  b.total,
  b.created_at as bill_date,
  b.paid_at,
  a.admission_id,
  a.admitted_on,
  a.discharged_on,
  COALESCE(
    EXTRACT(DAY FROM (COALESCE(a.discharged_on, now()) - a.admitted_on)), 
    0
  )::INT as days_stayed,
  p.patient_id,
  p.full_name as patient_name,
  p.phone as patient_phone,
  d.name as doctor_name
FROM bills b
JOIN admissions a ON b.admission_id = a.admission_id
JOIN patients p ON a.patient_id = p.patient_id
LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
ORDER BY b.created_at DESC;

COMMENT ON VIEW v_billing_summary IS 'Complete billing information with patient and stay details';

-- View: Doctor workload (number of active patients per doctor)
CREATE OR REPLACE VIEW v_doctor_workload AS
SELECT 
  d.doctor_id,
  d.name as doctor_name,
  d.specialization,
  dept.name as department,
  COUNT(a.admission_id) as active_patients,
  COUNT(CASE WHEN a.priority <= 2 THEN 1 END) as high_priority_patients
FROM doctors d
LEFT JOIN departments dept ON d.dept_id = dept.dept_id
LEFT JOIN admissions a ON d.doctor_id = a.doctor_id AND a.admission_status = 'active'
GROUP BY d.doctor_id, d.name, d.specialization, dept.name
ORDER BY active_patients DESC;

COMMENT ON VIEW v_doctor_workload IS 'Doctor workload statistics - demonstrates aggregate views';

-- View: Waiting list with patient priority
CREATE OR REPLACE VIEW v_waiting_list AS
SELECT 
  wl.wait_id,
  wl.requested_on,
  wl.priority,
  wl.status,
  EXTRACT(HOUR FROM (now() - wl.requested_on))::INT as hours_waiting,
  p.patient_id,
  p.full_name as patient_name,
  p.phone as patient_phone,
  p.emergency_contact,
  dept.name as department
FROM waiting_list wl
JOIN patients p ON wl.patient_id = p.patient_id
JOIN departments dept ON wl.dept_id = dept.dept_id
WHERE wl.status = 'waiting'
ORDER BY wl.priority ASC, wl.requested_on ASC;

COMMENT ON VIEW v_waiting_list IS 'Waiting list with patient details and wait time calculation';

-- View: Room occupancy statistics
CREATE OR REPLACE VIEW v_room_statistics AS
SELECT 
  r.room_id,
  r.room_number,
  r.floor,
  r.room_type,
  r.capacity,
  COUNT(b.bed_id) as total_beds,
  COUNT(CASE WHEN b.status = 'occupied' THEN 1 END) as occupied_beds,
  COUNT(CASE WHEN b.status = 'available' THEN 1 END) as available_beds,
  COUNT(CASE WHEN b.status = 'maintenance' THEN 1 END) as maintenance_beds,
  ROUND(
    COUNT(CASE WHEN b.status = 'occupied' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(b.bed_id)::NUMERIC, 0) * 100, 
    2
  ) as occupancy_percentage
FROM rooms r
LEFT JOIN beds b ON r.room_id = b.room_id
GROUP BY r.room_id, r.room_number, r.floor, r.room_type, r.capacity
ORDER BY r.floor, r.room_number;

COMMENT ON VIEW v_room_statistics IS 'Room-level occupancy statistics';

-- View: Revenue report
CREATE OR REPLACE VIEW v_revenue_report AS
SELECT 
  DATE(b.created_at) as bill_date,
  COUNT(b.bill_id) as total_bills,
  COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_bills,
  COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bills,
  SUM(b.total) as total_amount,
  SUM(CASE WHEN b.status = 'paid' THEN b.total ELSE 0 END) as revenue_collected,
  SUM(CASE WHEN b.status = 'pending' THEN b.total ELSE 0 END) as revenue_pending
FROM bills b
GROUP BY DATE(b.created_at)
ORDER BY bill_date DESC;

COMMENT ON VIEW v_revenue_report IS 'Daily revenue report with collection statistics';

-- View: Audit trail summary (recent changes)
CREATE OR REPLACE VIEW v_recent_audit_trail AS
SELECT 
  audit_id,
  table_name,
  record_id,
  operation,
  changed_by,
  changed_at,
  CASE 
    WHEN operation = 'UPDATE' THEN 
      jsonb_pretty(
        jsonb_object_agg(
          key, 
          jsonb_build_object('old', old_data->key, 'new', new_data->key)
        )
      )
    ELSE NULL
  END as changes
FROM audit_log,
     jsonb_each(COALESCE(new_data, old_data))
WHERE operation = 'UPDATE' 
  AND old_data IS NOT NULL 
  AND new_data IS NOT NULL
  AND old_data->key IS DISTINCT FROM new_data->key
GROUP BY audit_id, table_name, record_id, operation, changed_by, changed_at, old_data, new_data
ORDER BY changed_at DESC
LIMIT 100;

COMMENT ON VIEW v_recent_audit_trail IS 'Recent audit trail showing what changed - demonstrates JSONB operations';

-- View: Patient history summary
CREATE OR REPLACE VIEW v_patient_history AS
SELECT 
  p.patient_id,
  p.full_name,
  p.phone,
  COUNT(a.admission_id) as total_admissions,
  MAX(a.admitted_on) as last_admission,
  SUM(CASE WHEN a.admission_status = 'discharged' THEN 1 ELSE 0 END) as completed_admissions,
  SUM(CASE WHEN a.admission_status = 'active' THEN 1 ELSE 0 END) as current_admissions,
  COALESCE(SUM(b.total), 0) as total_billed,
  COALESCE(SUM(CASE WHEN b.status = 'paid' THEN b.total ELSE 0 END), 0) as total_paid,
  COALESCE(SUM(CASE WHEN b.status = 'pending' THEN b.total ELSE 0 END), 0) as outstanding_balance
FROM patients p
LEFT JOIN admissions a ON p.patient_id = a.patient_id
LEFT JOIN bills b ON a.admission_id = b.admission_id
GROUP BY p.patient_id, p.full_name, p.phone
ORDER BY last_admission DESC NULLS LAST;

COMMENT ON VIEW v_patient_history IS 'Patient admission and billing history summary';

-- ============================================
-- MATERIALIZED VIEW (for expensive queries)
-- ============================================

-- Materialized view: Department statistics (can be refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_department_statistics AS
SELECT 
  dept.dept_id,
  dept.name as department_name,
  COUNT(DISTINCT d.doctor_id) as total_doctors,
  COUNT(DISTINCT a.admission_id) as total_admissions,
  COUNT(DISTINCT CASE WHEN a.admission_status = 'active' THEN a.admission_id END) as active_admissions,
  COUNT(DISTINCT wl.wait_id) as waiting_patients,
  COALESCE(SUM(b.total), 0) as total_revenue,
  COALESCE(AVG(EXTRACT(DAY FROM (a.discharged_on - a.admitted_on))), 0) as avg_stay_days
FROM departments dept
LEFT JOIN doctors d ON dept.dept_id = d.dept_id
LEFT JOIN admissions a ON d.doctor_id = a.doctor_id
LEFT JOIN waiting_list wl ON dept.dept_id = wl.dept_id AND wl.status = 'waiting'
LEFT JOIN bills b ON a.admission_id = b.admission_id AND b.status = 'paid'
GROUP BY dept.dept_id, dept.name
ORDER BY total_admissions DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_dept_stats_name ON mv_department_statistics(department_name);

COMMENT ON MATERIALIZED VIEW mv_department_statistics IS 'Materialized view for department statistics - refresh periodically for performance';

-- To refresh the materialized view, run:
-- REFRESH MATERIALIZED VIEW mv_department_statistics;
