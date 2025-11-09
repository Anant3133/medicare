# Medicare Database Documentation

## Table of Contents
1. [Database Overview](#database-overview)
2. [Database Concepts Implemented](#database-concepts-implemented)
3. [Schema Design](#schema-design)
4. [Database Setup & Connection](#database-setup--connection)
5. [Advanced Features](#advanced-features)
6. [Performance Optimization](#performance-optimization)
7. [Security & Access Control](#security--access-control)

---

## Database Overview

**Database Management System:** PostgreSQL 14+  
**Database Name:** `medicare`  
**Purpose:** Hospital Management System with comprehensive patient, admission, billing, and bed management

### Key Features Implemented:
- Normalized relational database design (3NF)
- Referential integrity with foreign keys
- Data validation using CHECK constraints
- Automated audit logging with triggers
- Business logic encapsulation in stored procedures
- Query optimization with indexes and views
- Transaction management for data consistency
- Role-based access control

---

## Database Concepts Implemented

### 1. **Normalization**
The database follows **Third Normal Form (3NF)** to eliminate data redundancy and improve data integrity.

**Implementation:**
- Separate tables for entities (patients, doctors, departments, beds, rooms)
- No repeating groups
- All non-key attributes depend only on primary keys
- No transitive dependencies

**Example:**
```sql
-- Departments table (normalized)
CREATE TABLE departments (
  dept_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Doctors reference departments (no redundant dept info in doctors table)
CREATE TABLE doctors (
  doctor_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INT REFERENCES departments(dept_id)
);
```

### 2. **Referential Integrity**
Foreign key constraints ensure data consistency across related tables.

**Types of Referential Actions:**

- **CASCADE**: Automatically propagate changes
```sql
-- When a room is deleted, all its beds are also deleted
beds.room_id REFERENCES rooms(room_id) ON DELETE CASCADE
```

- **RESTRICT**: Prevent deletion if references exist
```sql
-- Cannot delete a department if doctors are assigned to it
doctors.dept_id REFERENCES departments(dept_id) ON DELETE RESTRICT
```

- **SET NULL**: Set to NULL when referenced record is deleted
```sql
-- If a doctor is deleted, admission record remains but doctor_id becomes NULL
admissions.doctor_id REFERENCES doctors(doctor_id) ON DELETE SET NULL
```

### 3. **Data Integrity Constraints**

#### **CHECK Constraints**
Enforce business rules at the database level:

```sql
-- Gender must be M, F, or O
gender CHAR(1) CHECK (gender IN ('M','F','O'))

-- Blood group validation
blood_group TEXT CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-'))

-- Room type validation
room_type TEXT CHECK (room_type IN ('general','icu','private','emergency'))

-- Bed status validation
status TEXT CHECK (status IN ('available','occupied','maintenance','reserved'))

-- Priority range (1 = highest, 5 = lowest)
priority SMALLINT CHECK (priority >= 1 AND priority <= 5)

-- Positive amounts only
cost NUMERIC(12,2) CHECK (cost >= 0)
```

#### **UNIQUE Constraints**
Prevent duplicate values:

```sql
-- Unique room numbers
room_number TEXT NOT NULL UNIQUE

-- Unique bed within a room
UNIQUE(room_id, bed_number)

-- Unique email addresses
email TEXT UNIQUE
```

#### **NOT NULL Constraints**
Ensure required fields are always populated:

```sql
-- Required patient information
full_name TEXT NOT NULL
specialization TEXT NOT NULL
```

#### **DEFAULT Values**
Set automatic default values:

```sql
-- Default timestamps
created_at TIMESTAMP DEFAULT now()

-- Default status
status TEXT DEFAULT 'available'
admission_status TEXT DEFAULT 'active'

-- Default capacity
capacity INT DEFAULT 1
```

### 4. **Computed Columns (GENERATED ALWAYS)**
PostgreSQL automatically calculates these values:

```sql
-- Bill total is automatically calculated
total NUMERIC(12,2) GENERATED ALWAYS AS (amount + tax - discount) STORED

-- Bill item subtotal
subtotal NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
```

### 5. **Triggers**
Automatically execute functions in response to database events.

**Audit Logging Triggers:**
```sql
-- Function that captures all changes
CREATE OR REPLACE FUNCTION audit_patients()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, operation, new_data)
    VALUES ('patients', 'INSERT', row_to_json(NEW)::jsonb);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, operation, old_data, new_data)
    VALUES ('patients', 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, old_data)
    VALUES ('patients', 'DELETE', row_to_json(OLD)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to table
CREATE TRIGGER trg_audit_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION audit_patients();
```

**Business Rule Triggers:**
```sql
-- Validate bed allocation before assignment
CREATE TRIGGER trg_validate_bed_allocation
BEFORE INSERT OR UPDATE ON admissions
FOR EACH ROW EXECUTE FUNCTION validate_bed_allocation();

-- Automatically update bed status when admission changes
CREATE TRIGGER trg_update_bed_on_admission
AFTER UPDATE OF admission_status ON admissions
FOR EACH ROW EXECUTE FUNCTION update_bed_status_on_discharge();
```

### 6. **Stored Procedures & Functions**
Encapsulate business logic in the database.

**Benefits:**
- Reduce network traffic
- Ensure consistent business logic
- Better performance for complex operations
- Transaction safety

**Example - Bed Allocation:**
```sql
CREATE OR REPLACE FUNCTION allocate_bed_to_admission(
  p_admission_id INT,
  p_bed_type TEXT DEFAULT 'normal'
)
RETURNS INT AS $$
DECLARE
  v_bed_id INT;
BEGIN
  -- Find and lock an available bed
  SELECT bed_id INTO v_bed_id
  FROM beds
  WHERE status = 'available' AND bed_type = p_bed_type
  ORDER BY bed_id
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  -- Update bed status
  UPDATE beds SET status = 'occupied' WHERE bed_id = v_bed_id;
  
  -- Assign bed to admission
  UPDATE admissions SET bed_id = v_bed_id WHERE admission_id = p_admission_id;
  
  RETURN v_bed_id;
END;
$$ LANGUAGE plpgsql;
```

### 7. **Transaction Management**
Ensure ACID properties (Atomicity, Consistency, Isolation, Durability).

**Implementation:**
```javascript
// backend/config/db.js
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

**Usage Example:**
```javascript
// Complete admission with automatic bed allocation (all or nothing)
await transaction(async (client) => {
  // Create admission
  const admission = await client.query(
    'INSERT INTO admissions (...) VALUES (...) RETURNING *'
  );
  
  // Allocate bed
  await client.query(
    'SELECT allocate_bed_to_admission($1, $2)',
    [admission.rows[0].admission_id, 'icu']
  );
  
  // Create initial bill
  await client.query(
    'INSERT INTO bills (...) VALUES (...)'
  );
});
```

### 8. **Concurrency Control**
Handle multiple simultaneous users safely.

**Row-Level Locking:**
```sql
-- FOR UPDATE locks selected rows
SELECT * FROM beds
WHERE status = 'available'
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

**SKIP LOCKED:** Prevents waiting for locked rows (improves concurrency)

### 9. **JSONB Data Type**
Store and query JSON data efficiently.

**Usage in Audit Log:**
```sql
-- Store complete record state as JSONB
old_data JSONB,
new_data JSONB

-- Query JSON data
SELECT * FROM audit_log
WHERE new_data->>'patient_id' = '123';

-- GIN index for fast JSON searches
CREATE INDEX idx_audit_log_new_data ON audit_log USING GIN (new_data);
```

### 10. **Views**
Simplify complex queries with reusable views.

**Regular Views:**
```sql
CREATE VIEW v_bed_occupancy AS
SELECT 
  b.bed_id, b.bed_number, b.status,
  r.room_number, r.floor,
  p.full_name as patient_name,
  d.name as doctor_name
FROM beds b
JOIN rooms r ON b.room_id = r.room_id
LEFT JOIN admissions a ON b.bed_id = a.bed_id
LEFT JOIN patients p ON a.patient_id = p.patient_id
LEFT JOIN doctors d ON a.doctor_id = d.doctor_id;
```

**Materialized Views:**
```sql
-- Pre-computed view for expensive queries
CREATE MATERIALIZED VIEW mv_department_stats AS
SELECT 
  dept_id,
  COUNT(DISTINCT doctor_id) as total_doctors,
  COUNT(admission_id) as total_admissions
FROM doctors d
LEFT JOIN admissions a ON d.doctor_id = a.doctor_id
GROUP BY dept_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW mv_department_stats;
```

---

## Schema Design

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│ Departments │◄──────│   Doctors    │       │   Patients  │
└─────────────┘       └──────────────┘       └─────────────┘
                             │                      │
                             │                      │
                             ▼                      ▼
                      ┌─────────────────────────────────┐
                      │        Admissions               │
                      └─────────────────────────────────┘
                                    │
                                    │
                      ┌─────────────┼─────────────┐
                      ▼                            ▼
               ┌─────────────┐             ┌───────────┐
               │    Bills    │             │   Beds    │
               └─────────────┘             └───────────┘
                      │                          │
                      ▼                          │
               ┌─────────────┐                  │
               │ Bill_Items  │                  │
               └─────────────┘                  │
                      │                          │
                      ▼                          ▼
               ┌─────────────┐             ┌───────────┐
               │  Services   │             │   Rooms   │
               └─────────────┘             └───────────┘
```

### Core Tables

#### **1. Departments**
Organizes hospital departments
```sql
- dept_id (PK)
- name (UNIQUE)
- description
- created_at
```

#### **2. Doctors**
Doctor information with department assignment
```sql
- doctor_id (PK)
- name
- specialization
- dept_id (FK → departments)
- phone, email
- created_at
```

#### **3. Patients**
Patient demographic information
```sql
- patient_id (PK)
- full_name
- dob, gender, blood_group
- phone, address, emergency_contact
- created_at
```

#### **4. Rooms**
Physical room inventory
```sql
- room_id (PK)
- room_number (UNIQUE)
- floor, room_type
- capacity
- created_at
```

#### **5. Beds**
Individual bed tracking
```sql
- bed_id (PK)
- bed_number
- room_id (FK → rooms, CASCADE)
- bed_type, status
- last_maintenance
- UNIQUE(room_id, bed_number)
```

#### **6. Admissions**
Patient admission records
```sql
- admission_id (PK)
- patient_id (FK → patients, CASCADE)
- bed_id (FK → beds, SET NULL)
- doctor_id (FK → doctors, SET NULL)
- admitted_on, discharged_on
- admission_status, priority
- diagnosis, notes
- CHECK: discharged_on >= admitted_on
```

#### **7. Services**
Billable services catalog
```sql
- service_id (PK)
- name (UNIQUE)
- description, category
- cost (CHECK >= 0)
```

#### **8. Bills**
Patient billing records
```sql
- bill_id (PK)
- admission_id (FK → admissions, CASCADE)
- amount, tax, discount
- total (GENERATED COLUMN)
- status, paid_at
```

#### **9. Bill_Items**
Line items for bills
```sql
- bill_item_id (PK)
- bill_id (FK → bills, CASCADE)
- service_id (FK → services, RESTRICT)
- quantity, unit_price
- subtotal (GENERATED COLUMN)
```

#### **10. Waiting_List**
Queue for bed assignment
```sql
- wait_id (PK)
- patient_id (FK → patients)
- dept_id (FK → departments)
- requested_on, assigned_on
- priority, status, notes
```

#### **11. Audit_Log**
Complete audit trail
```sql
- audit_id (PK)
- table_name, record_id, operation
- old_data (JSONB)
- new_data (JSONB)
- changed_by, changed_at
```

#### **12. Users**
Authentication and authorization
```sql
- user_id (PK)
- username (UNIQUE)
- password_hash
- role, email, full_name
- is_active, last_login
```

---

## Database Setup & Connection

### Prerequisites
- PostgreSQL 14 or higher installed
- Node.js 16+ (for backend)
- Database user with CREATE DATABASE privileges

### Installation Steps

#### 1. **Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE medicare;

# Connect to the database
\c medicare
```

#### 2. **Run Migration Scripts**

**Option A: PowerShell (Windows)**
```powershell
cd db
.\run_migrations.ps1
```

**Option B: Bash (Linux/Mac)**
```bash
cd db
chmod +x run_migrations.sh
./run_migrations.sh
```

**Option C: Manual Execution**
```bash
psql -U postgres -d medicare -f db/schema.sql
psql -U postgres -d medicare -f db/triggers.sql
psql -U postgres -d medicare -f db/functions.sql
psql -U postgres -d medicare -f db/indexes_and_views.sql
psql -U postgres -d medicare -f db/seed.sql
```

#### 3. **Configure Backend Connection**

Create `.env` file in `/backend` directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medicare
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

#### 4. **Connection Pool Configuration**

**File:** `backend/config/db.js`

```javascript
const { Pool } = require('pg');

// Connection pool with optimized settings
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                      // Maximum connections in pool
  idleTimeoutMillis: 30000,     // Close idle connections after 30s
  connectionTimeoutMillis: 2000 // Timeout after 2s if can't connect
});
```

**Benefits of Connection Pooling:**
- Reuses database connections
- Reduces connection overhead
- Handles concurrent requests efficiently
- Automatic connection management

#### 5. **Parameterized Queries**

**Always use parameterized queries to prevent SQL injection:**

```javascript
// ❌ NEVER DO THIS (SQL Injection vulnerability)
const result = await pool.query(
  `SELECT * FROM users WHERE username = '${username}'`
);

// ✅ CORRECT (Safe from SQL injection)
const result = await pool.query(
  'SELECT * FROM users WHERE username = $1',
  [username]
);
```

---

## Advanced Features

### 1. **Audit Logging System**

Every change to critical tables is automatically logged:

**What's Logged:**
- Table name and record ID
- Operation type (INSERT, UPDATE, DELETE)
- Complete before/after state (JSONB)
- User who made the change
- Timestamp

**Query Audit Trail:**
```sql
-- See all changes to a specific patient
SELECT * FROM audit_log
WHERE table_name = 'patients'
  AND record_id = 123
ORDER BY changed_at DESC;

-- See who modified admission records today
SELECT * FROM audit_log
WHERE table_name = 'admissions'
  AND changed_at >= CURRENT_DATE;

-- Search within JSON data
SELECT * FROM audit_log
WHERE new_data->>'diagnosis' LIKE '%COVID%';
```

### 2. **Business Logic Functions**

**Complete Admission Workflow:**
```sql
-- Admits patient, allocates bed, or adds to waiting list
SELECT process_admission(
  patient_id := 1,
  doctor_id := 5,
  bed_type := 'icu',
  priority := 1,
  diagnosis := 'Cardiac Emergency'
);
```

**Discharge Patient:**
```sql
-- Discharges patient and frees bed
SELECT discharge_patient(admission_id := 42);
```

**Calculate Bill:**
```sql
-- Generates complete bill with all services
SELECT calculate_admission_bill(admission_id := 42);
```

### 3. **Waiting List Management**

```sql
-- Add patient to waiting list
INSERT INTO waiting_list (patient_id, dept_id, priority, notes)
VALUES (15, 3, 1, 'Urgent surgery required');

-- Get next patient for bed allocation (by priority)
SELECT * FROM waiting_list
WHERE status = 'waiting' AND dept_id = 3
ORDER BY priority ASC, requested_on ASC
LIMIT 1;
```

---

## Performance Optimization

### 1. **Indexes**

**B-Tree Indexes (Default):**
```sql
-- Single column indexes
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_beds_status ON beds(status);

-- Composite indexes for common query patterns
CREATE INDEX idx_admissions_status_date 
ON admissions(admission_status, admitted_on DESC);

CREATE INDEX idx_beds_status_type 
ON beds(status, bed_type);
```

**Partial Indexes (Index only specific rows):**
```sql
-- Index only active admissions (most queried)
CREATE INDEX idx_admissions_active 
ON admissions(patient_id, admitted_on)
WHERE admission_status = 'active';

-- Index only pending bills
CREATE INDEX idx_bills_pending 
ON bills(admission_id)
WHERE status = 'pending';
```

**GIN Indexes (For JSONB and arrays):**
```sql
-- Enable fast searches within JSONB columns
CREATE INDEX idx_audit_log_new_data 
ON audit_log USING GIN (new_data);
```

**Index Usage Tips:**
- Index foreign keys for faster joins
- Use composite indexes for multi-column WHERE clauses
- Partial indexes save space and improve performance
- Don't over-index (slows down INSERT/UPDATE)

### 2. **Query Optimization Techniques**

**Use EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT * FROM admissions a
JOIN patients p ON a.patient_id = p.patient_id
WHERE a.admission_status = 'active';
```

**Optimize Joins:**
```sql
-- Use appropriate JOIN types
-- INNER JOIN for required relationships
-- LEFT JOIN for optional relationships
```

**Avoid SELECT *:**
```sql
-- ❌ Fetches unnecessary data
SELECT * FROM patients;

-- ✅ Select only needed columns
SELECT patient_id, full_name, phone FROM patients;
```

### 3. **Materialized Views**

Pre-compute expensive queries:
```sql
-- Create materialized view
CREATE MATERIALIZED VIEW mv_department_statistics AS
SELECT 
  d.dept_id,
  d.name as department_name,
  COUNT(DISTINCT doc.doctor_id) as total_doctors,
  COUNT(a.admission_id) as total_admissions,
  AVG(EXTRACT(EPOCH FROM (a.discharged_on - a.admitted_on))/86400) as avg_stay_days
FROM departments d
LEFT JOIN doctors doc ON d.dept_id = doc.dept_id
LEFT JOIN admissions a ON doc.doctor_id = a.doctor_id
GROUP BY d.dept_id, d.name;

-- Query the materialized view (fast!)
SELECT * FROM mv_department_statistics;

-- Refresh when data changes
REFRESH MATERIALIZED VIEW mv_department_statistics;
```

---

## Security & Access Control

### 1. **Role-Based Access Control**

**User Roles:**
- `admin` - Full system access
- `doctor` - Patient and medical records
- `staff` - Admissions and bed management
- `billing` - Billing and payments
- `patient` - Personal records only

**Implementation:**
```javascript
// Middleware checks user role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Protected route
router.get('/admissions', 
  authenticateToken, 
  requireRole(['admin', 'doctor', 'staff']),
  getAdmissions
);
```

### 2. **Password Security**

```javascript
const bcrypt = require('bcryptjs');

// Hash password before storing
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password during login
const isValid = await bcrypt.compare(password, user.password_hash);
```

### 3. **SQL Injection Prevention**

**Always use parameterized queries:**
```javascript
// ✅ Safe from SQL injection
const result = await pool.query(
  'SELECT * FROM users WHERE username = $1 AND role = $2',
  [username, role]
);
```

### 4. **Database User Permissions**

```sql
-- Create application user with limited privileges
CREATE USER medicare_app WITH PASSWORD 'secure_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE medicare TO medicare_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO medicare_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO medicare_app;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM medicare_app;
```

---

## Database Migration Files

### Execution Order:
1. **schema.sql** - Create tables with constraints
2. **triggers.sql** - Set up audit logging and business rule triggers
3. **functions.sql** - Create stored procedures and functions
4. **indexes_and_views.sql** - Add performance indexes and views
5. **seed.sql** - Insert initial data (departments, default users, services)

### Automated Migration Script

**PowerShell (Windows):**
```powershell
# run_migrations.ps1
$files = @("schema.sql", "triggers.sql", "functions.sql", "indexes_and_views.sql", "seed.sql")
foreach ($file in $files) {
    psql -U postgres -d medicare -f $file
}
```

---

## Connection Testing

**Test database connectivity:**
```javascript
// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});
```

---

## Summary of Concepts

| Concept | Purpose | Implementation |
|---------|---------|----------------|
| **Normalization** | Eliminate redundancy | 3NF schema design |
| **Foreign Keys** | Referential integrity | CASCADE, RESTRICT, SET NULL |
| **CHECK Constraints** | Data validation | Gender, status, range checks |
| **Triggers** | Automated actions | Audit logging, business rules |
| **Stored Procedures** | Business logic | Admission workflow, billing |
| **Transactions** | Data consistency | ACID compliance |
| **Indexes** | Query performance | B-tree, partial, GIN indexes |
| **Views** | Query simplification | Bed occupancy, reports |
| **JSONB** | Flexible data storage | Audit trail data |
| **Concurrency Control** | Multi-user safety | Row-level locking |
| **Connection Pooling** | Performance | Reusable connections |
| **Parameterized Queries** | Security | SQL injection prevention |

---

**Last Updated:** November 8, 2025  
**Database Version:** PostgreSQL 14+  
**Schema Version:** 1.0
