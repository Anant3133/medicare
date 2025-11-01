# Medicare - Smart Hospital Bed & Patient Allocation System

## 📖 Project Overview (In Simple Terms)

### What Does This System Do?

Imagine you're running a hospital with limited beds. Patients keep coming in, and you need to:
- **Track which beds are available** and which are occupied
- **Admit patients** to the right type of bed (ICU, normal, maternity, etc.)
- **Manage a waiting list** when beds are full (priority patients get beds first)
- **Assign doctors** to patients and track their workload
- **Generate bills** automatically based on bed type, services, and stay duration
- **Keep records** of everything for auditing and reporting

**The Challenge:** Doing all this manually is chaotic! You might accidentally assign the same bed to two patients, lose track of who's waiting, or miscalculate bills.

**The Solution:** This system automates everything! It prevents double-bookings, automatically finds available beds, manages the waiting list by priority, and generates accurate bills - all in real-time.

---

## 🧠 How The System Works (The Logic)

### 1. **Patient Admission Flow**
```
Patient arrives → System checks for available beds
   ↓
Bed Available?
   YES → Allocate bed immediately → Update bed status to "occupied"
   NO → Add to waiting list with priority number (1=urgent, 5=low)
```

### 2. **Smart Bed Allocation**
- The system **locks** the bed record while checking (prevents two admissions grabbing the same bed)
- Automatically finds beds matching the required type (ICU, normal, etc.)
- If multiple staff members try to book the same bed simultaneously, only one succeeds (concurrency control)

### 3. **Priority-Based Waiting List**
- Patients with **priority 1** (critical) get beds first
- When a bed becomes available, the system automatically picks the highest-priority patient waiting
- Fair queue management within the same priority level (first-come, first-served)

### 4. **Automatic Billing**
```
Patient discharged → System calculates:
   - Number of days stayed
   - Bed type multiplier (ICU = 3x cost, Normal = 1x)
   - Additional services used (X-Ray, Surgery, etc.)
   - Tax calculation
   → Generates complete itemized bill
```

### 5. **Real-Time Updates**
- When you **admit a patient** → bed status updates automatically
- When you **discharge a patient** → bed becomes available immediately
- When you **view reports** → always shows current data (no refresh needed)

### 6. **Audit Trail**
- Every change is logged (who changed what, when)
- If someone updates a patient's phone number, the system records: old value, new value, timestamp
- Cannot be tampered with (automatic logging via database triggers)

---

## 🛠️ Technology Stack

### **Frontend** (What Users See)
| Technology | Purpose |
|------------|---------|
| **React 18** | Modern UI library for building interactive interfaces |
| **React Router DOM** | Navigate between pages (Dashboard, Admissions, Billing) |
| **Tailwind CSS** | Beautiful, responsive styling without writing custom CSS |
| **Axios** | Communicate with backend API (fetch data, submit forms) |
| **Vite** | Lightning-fast development server and build tool |

**Why these choices?**
- React: Component-based architecture makes UI reusable and maintainable
- Tailwind: Rapid styling with utility classes (no CSS files to manage)
- Vite: Blazing fast hot-reload during development

---

### **Backend** (The Brain)
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime for server-side code |
| **Express.js** | Web framework for building REST APIs |
| **pg (node-postgres)** | PostgreSQL database driver (pure SQL, no ORM) |
| **JWT (jsonwebtoken)** | Secure user authentication with tokens |
| **bcrypt** | Password hashing for security |
| **helmet** | Security headers to protect against attacks |
| **morgan** | HTTP request logging for debugging |

**Why these choices?**
- Node.js + Express: Fast, lightweight, easy to build REST APIs
- Pure SQL (no ORM): Direct control over queries, demonstrates DBMS concepts clearly
- JWT: Stateless authentication (no session storage needed)

---

### **Database** (The Memory)
| Technology | Purpose |
|------------|---------|
| **PostgreSQL 14+** | Powerful relational database with advanced features |
| **Pure SQL** | Direct SQL queries (no Sequelize, Prisma, or other ORMs) |
| **psql** | Command-line tool for database management |

**Why PostgreSQL?**
- Supports advanced features: stored procedures, triggers, views, materialized views
- ACID compliant (reliable transactions)
- Excellent concurrency control (multiple users can work simultaneously)
- Open-source and production-ready

---

## 📚 DBMS/SQL Concepts Demonstrated

### 1. **Database Schema Design & Normalization**

**What it is:** Organizing data into tables to eliminate redundancy.

**How we use it:**
```
❌ BAD (Denormalized):
Admission: patient_name, patient_phone, doctor_name, doctor_phone, bed_number, room_type...
   (Duplicate data if same patient admitted multiple times)

✅ GOOD (Normalized):
Patients table: id, name, phone, dob, blood_group...
Doctors table: id, name, specialization, department...
Admissions table: id, patient_id, doctor_id, bed_id, dates...
   (References to other tables, no duplication)
```

**Example in our code:**
- `patients` table stores patient info once
- `admissions` table references `patient_id` (foreign key)
- Same patient can have multiple admissions without data duplication

**Files:** `db/schema.sql` (lines 18-130)

---

### 2. **Primary Keys & Foreign Keys**

**What it is:** 
- **Primary Key:** Unique identifier for each record (like Aadhar number for people)
- **Foreign Key:** Links records between tables (ensures referenced records exist)

**How we use it:**
```sql
-- Primary Key (every table has one)
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,  -- Auto-incrementing unique ID
    ...
);

-- Foreign Key (links admissions to patients)
CREATE TABLE admissions (
    admission_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),  -- Must be valid patient
    doctor_id INT REFERENCES doctors(doctor_id),     -- Must be valid doctor
    bed_id INT REFERENCES beds(bed_id)               -- Must be valid bed
);
```

**Real-world benefit:** Can't admit a non-existent patient or assign a fake doctor!

**Files:** `db/schema.sql` (all table definitions)

---

### 3. **Constraints (Data Validation)**

**What it is:** Rules that ensure data quality (like form validation in the database).

**How we use it:**

#### **CHECK Constraints:**
```sql
-- Ensure priority is between 1-5
priority INT CHECK (priority BETWEEN 1 AND 5),

-- Ensure dates make sense
CHECK (discharge_date IS NULL OR discharge_date >= admission_date),

-- Bed capacity must be positive
capacity INT CHECK (capacity > 0)
```

#### **NOT NULL Constraints:**
```sql
full_name VARCHAR(255) NOT NULL,  -- Patient must have a name
dob DATE NOT NULL,                -- Must have date of birth
```

#### **UNIQUE Constraints:**
```sql
UNIQUE(room_number, floor),  -- No duplicate room numbers on same floor
UNIQUE(username)             -- No duplicate usernames
```

**Real-world benefit:** Database rejects invalid data before it's saved!

**Files:** `db/schema.sql` (throughout table definitions)

---

### 4. **Indexes (Performance Optimization)**

**What it is:** Like a book index - helps find data faster without scanning every row.

**How we use it:**

#### **B-tree Indexes (most common):**
```sql
-- Speed up searches by patient name
CREATE INDEX idx_patients_full_name ON patients(full_name);

-- Speed up filtering by status
CREATE INDEX idx_admissions_status ON admissions(status);
```

#### **Composite Indexes (multiple columns):**
```sql
-- Speed up queries filtering by status AND date together
CREATE INDEX idx_admissions_status_date 
ON admissions(status, admission_date);
```

#### **Partial Indexes (conditional):**
```sql
-- Only index active admissions (smaller, faster)
CREATE INDEX idx_active_admissions 
ON admissions(admission_date) 
WHERE status = 'active';
```

#### **GIN Indexes (for JSON data):**
```sql
-- Speed up searches in audit log JSON data
CREATE INDEX idx_audit_log_changes_gin 
ON audit_log USING GIN (changes);
```

**Real-world benefit:** 
- Without index: Search 10,000 patients = scan all 10,000 rows (slow)
- With index: Find patient in ~3-4 lookups (fast!)

**Files:** `db/indexes_and_views.sql` (lines 3-88), `db/schema.sql` (lines 166-169)

---

### 5. **Stored Procedures & Functions**

**What it is:** SQL code saved in the database - like reusable functions in programming.

**How we use it:**

#### **Example 1: Process Admission (Complex Workflow)**
```sql
CREATE FUNCTION process_admission(
    p_patient_id INT,
    p_doctor_id INT,
    p_bed_type bed_type_enum,
    p_priority INT,
    p_diagnosis TEXT
) RETURNS TABLE(...) AS $$
BEGIN
    -- Find available bed
    SELECT bed_id INTO v_bed_id 
    FROM get_available_beds(p_bed_type) 
    LIMIT 1 FOR UPDATE SKIP LOCKED;
    
    -- If bed found, admit patient
    IF v_bed_id IS NOT NULL THEN
        INSERT INTO admissions (...) VALUES (...);
        UPDATE beds SET status = 'occupied' WHERE bed_id = v_bed_id;
    ELSE
        -- No bed, add to waiting list
        INSERT INTO waiting_list (...) VALUES (...);
    END IF;
END;
$$ LANGUAGE plpgsql;
```

**Called from backend:**
```javascript
const result = await pool.query(
    'SELECT * FROM process_admission($1, $2, $3, $4, $5)',
    [patientId, doctorId, bedType, priority, diagnosis]
);
```

#### **Example 2: Generate Bill (Auto-calculation)**
```sql
CREATE FUNCTION generate_bill(p_admission_id INT)
RETURNS TABLE(bill_id INT, total_amount DECIMAL) AS $$
BEGIN
    -- Calculate days stayed
    -- Apply bed type multiplier
    -- Add service charges
    -- Calculate tax
    -- Create bill record
    -- Return bill details
END;
$$ LANGUAGE plpgsql;
```

**Real-world benefit:** 
- Complex logic stays in one place (database)
- All applications (web, mobile) use same logic
- Better performance (less data transferred)

**Files:** `db/functions.sql` (all 8 functions)
**Backend usage:** `backend/controllers/admissionController.js` (line 82-97), `backend/controllers/billingController.js` (line 71-86)

---

### 6. **Triggers (Automatic Actions)**

**What it is:** Automatic code that runs BEFORE or AFTER data changes (like event listeners).

**How we use it:**

#### **Audit Triggers (Automatic Logging):**
```sql
-- Function that logs changes
CREATE FUNCTION audit_patients() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        UPDATE patients 
        SET audit_log = audit_log || jsonb_build_object(
            'timestamp', NOW(),
            'operation', 'UPDATE',
            'old_values', row_to_json(OLD),
            'new_values', row_to_json(NEW)
        )
        WHERE patient_id = NEW.patient_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that fires on every update
CREATE TRIGGER audit_patients_trigger
AFTER UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION audit_patients();
```

**Real-world benefit:** 
- Developers don't need to write logging code
- Can't forget to log (it's automatic)
- Audit trail is tamper-proof

#### **Validation Triggers:**
```sql
-- Prevent double-booking beds
CREATE FUNCTION validate_bed_allocation() RETURNS TRIGGER AS $$
BEGIN
    -- Check if bed is already occupied
    IF bed_status != 'available' THEN
        RAISE EXCEPTION 'Bed is not available!';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER validate_bed_allocation_trigger
BEFORE INSERT ON admissions
FOR EACH ROW EXECUTE FUNCTION validate_bed_allocation();
```

**Real-world benefit:** Invalid data is rejected immediately!

#### **Auto-Update Triggers:**
```sql
-- Automatically free bed when patient discharged
CREATE FUNCTION auto_update_bed_on_discharge() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'discharged' AND OLD.status != 'discharged' THEN
        UPDATE beds SET status = 'available' 
        WHERE bed_id = NEW.bed_id;
    END IF;
    RETURN NEW;
END;
$$;
```

**Real-world benefit:** Bed status updates automatically, no manual intervention!

**Files:** `db/triggers.sql` (all 9 triggers)
**Triggered by:** Any INSERT/UPDATE/DELETE on patients, admissions, beds, bills

---

### 7. **Views (Virtual Tables)**

**What it is:** Saved queries that look like tables but don't store data (always show current data).

**How we use it:**

#### **Simple View:**
```sql
-- Show bed occupancy status
CREATE VIEW v_bed_occupancy AS
SELECT 
    b.bed_id,
    b.bed_number,
    r.room_number,
    r.floor,
    b.type,
    b.status,
    p.full_name AS patient_name,
    a.admission_date
FROM beds b
JOIN rooms r ON b.room_id = r.room_id
LEFT JOIN admissions a ON b.bed_id = a.bed_id AND a.status = 'active'
LEFT JOIN patients p ON a.patient_id = p.patient_id;
```

**Used in backend:**
```javascript
// Instead of complex JOIN query every time
const beds = await pool.query('SELECT * FROM v_bed_occupancy');
```

#### **Aggregate View:**
```sql
-- Doctor workload summary
CREATE VIEW v_doctor_workload AS
SELECT 
    d.doctor_id,
    d.full_name,
    COUNT(a.admission_id) AS active_patients,
    AVG(a.priority) AS avg_priority
FROM doctors d
LEFT JOIN admissions a ON d.doctor_id = a.doctor_id 
WHERE a.status = 'active'
GROUP BY d.doctor_id;
```

**Real-world benefit:**
- Simplifies complex queries
- Always shows current data (no stale cache)
- Reusable across multiple pages

**Files:** `db/indexes_and_views.sql` (lines 90-243)

---

### 8. **Materialized Views (Cached Results)**

**What it is:** Like a view, but stores results physically (faster, but needs manual refresh).

**How we use it:**
```sql
-- Department statistics (expensive calculation)
CREATE MATERIALIZED VIEW mv_department_statistics AS
SELECT 
    d.dept_id,
    d.dept_name,
    COUNT(DISTINCT doc.doctor_id) AS total_doctors,
    COUNT(DISTINCT a.admission_id) AS total_admissions,
    AVG(EXTRACT(DAY FROM (a.discharge_date - a.admission_date))) AS avg_stay_days,
    SUM(b.total_amount) AS total_revenue
FROM departments d
LEFT JOIN doctors doc ON d.dept_id = doc.dept_id
LEFT JOIN admissions a ON doc.doctor_id = a.doctor_id
LEFT JOIN bills b ON a.admission_id = b.admission_id
GROUP BY d.dept_id, d.dept_name;

-- Refresh when needed (e.g., once per day)
REFRESH MATERIALIZED VIEW mv_department_statistics;
```

**When to use:**
- **Regular View:** Real-time data (patient list, bed status)
- **Materialized View:** Heavy calculations, updated periodically (monthly reports)

**Real-world benefit:** Complex reports load instantly (pre-calculated)!

**Files:** `db/indexes_and_views.sql` (lines 245-264)
**Backend refresh:** `backend/controllers/reportController.js` (line 120-130)

---

### 9. **Transactions (ACID Properties)**

**What it is:** Group of operations that succeed or fail together (like a bank transfer).

**ACID Principles:**
- **Atomicity:** All or nothing (can't do half)
- **Consistency:** Database stays valid
- **Isolation:** Concurrent transactions don't interfere
- **Durability:** Committed data is permanent

**How we use it:**
```javascript
// Manual admission with transaction
const client = await pool.connect();
try {
    await client.query('BEGIN');  // Start transaction
    
    // Step 1: Lock the bed (prevent others from taking it)
    const bedResult = await client.query(
        'SELECT * FROM beds WHERE bed_id = $1 FOR UPDATE',
        [bedId]
    );
    
    // Step 2: Validate bed is available
    if (bedResult.rows[0].status !== 'available') {
        throw new Error('Bed not available');
    }
    
    // Step 3: Update bed status
    await client.query(
        'UPDATE beds SET status = $1 WHERE bed_id = $2',
        ['occupied', bedId]
    );
    
    // Step 4: Create admission
    await client.query(
        'INSERT INTO admissions (...) VALUES (...)',
        [patientId, bedId, doctorId, ...]
    );
    
    await client.query('COMMIT');  // Success! Save everything
} catch (error) {
    await client.query('ROLLBACK');  // Error! Undo everything
    throw error;
} finally {
    client.release();  // Return connection to pool
}
```

**Real-world benefit:**
- If admission creation fails, bed status doesn't change (remains available)
- Database never ends up in inconsistent state
- Multiple staff can work simultaneously without conflicts

**Files:** 
- `backend/config/db.js` (lines 40-56 - transaction helper)
- `backend/controllers/admissionController.js` (lines 100-180 - manual admission)
- `backend/services/admissionService.js` (all functions use transactions)

---

### 10. **Concurrency Control & Locking**

**What it is:** Managing multiple users accessing same data simultaneously.

**The Problem:**
```
Time    Staff A                     Staff B
10:00   Check bed 5 (available)
10:01                               Check bed 5 (available)
10:02   Admit patient to bed 5
10:03                               Admit patient to bed 5
        ❌ CONFLICT! Two patients in same bed!
```

**Our Solution: Row-Level Locking**
```sql
-- FOR UPDATE: Lock the row until transaction completes
SELECT * FROM beds 
WHERE bed_id = 5 AND status = 'available'
FOR UPDATE;
```

**How it works:**
```
Time    Staff A                              Staff B
10:00   SELECT ... FOR UPDATE (locks bed 5)
10:01                                        SELECT ... FOR UPDATE (waits...)
10:02   Admit patient, UPDATE bed status
10:03   COMMIT (releases lock)
10:04                                        Lock acquired, but bed now occupied
10:05                                        Check fails, admission rejected
        ✅ SAFE! Only one admission succeeds
```

**Advanced: SKIP LOCKED**
```sql
-- Don't wait for locked rows, skip to next available
SELECT * FROM beds 
WHERE status = 'available' 
FOR UPDATE SKIP LOCKED 
LIMIT 1;
```

**Real-world benefit:**
- High-traffic hospitals with multiple admission desks
- No double-booking even with 100 simultaneous users
- Efficient (doesn't block on busy beds, finds another)

**Files:** 
- `db/functions.sql` (line 15 - allocate_bed_to_admission function)
- `backend/services/admissionService.js` (line 25-30)

---

### 11. **Parameterized Queries (SQL Injection Prevention)**

**What it is:** Safe way to insert user data into SQL queries.

**❌ DANGEROUS (SQL Injection):**
```javascript
// NEVER DO THIS!
const query = `SELECT * FROM users WHERE username = '${username}'`;
// If username = "admin' OR '1'='1", logs in without password!
```

**✅ SAFE (Parameterized):**
```javascript
// Always use placeholders
const query = 'SELECT * FROM users WHERE username = $1';
const result = await pool.query(query, [username]);
// Database treats input as data, not code
```

**All our queries use this:**
```javascript
// Create patient (safe)
await pool.query(
    'INSERT INTO patients (full_name, dob, gender) VALUES ($1, $2, $3)',
    [name, dateOfBirth, gender]
);

// Update admission (safe)
await pool.query(
    'UPDATE admissions SET diagnosis = $1 WHERE admission_id = $2',
    [diagnosis, admissionId]
);
```

**Real-world benefit:** 
- Hackers can't inject malicious SQL
- Protects patient data from unauthorized access
- Industry standard security practice

**Files:** ALL backend controller files use parameterized queries
- `backend/controllers/patientController.js`
- `backend/controllers/admissionController.js`
- `backend/controllers/bedController.js`
- (Every SQL query in the backend!)

---

### 12. **Connection Pooling**

**What it is:** Reusing database connections instead of creating new ones.

**❌ WITHOUT Pooling:**
```
Request 1 → Open connection → Query → Close connection (slow)
Request 2 → Open connection → Query → Close connection (slow)
Request 3 → Open connection → Query → Close connection (slow)
```

**✅ WITH Pooling:**
```
Request 1 → Take connection from pool → Query → Return to pool (fast)
Request 2 → Reuse connection → Query → Return to pool (fast)
Request 3 → Reuse connection → Query → Return to pool (fast)
```

**Our configuration:**
```javascript
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,              // Maximum 20 connections
    idleTimeoutMillis: 30000,  // Close idle connections after 30s
    connectionTimeoutMillis: 2000  // Wait max 2s for connection
});
```

**Real-world benefit:**
- Faster response times (no connection overhead)
- Handles multiple users efficiently
- Prevents "too many connections" errors

**Files:** `backend/config/db.js` (lines 5-17)

---

## 🎯 How DBMS Concepts Work Together

### **Scenario: Admitting a Patient**

```
1. Frontend: User clicks "Admit Patient" → sends request
   ↓
2. Backend: Receives request, validates JWT token
   ↓
3. Database Transaction Begins:
   ├─ Step A: Call stored procedure process_admission(...)
   ├─ Step B: Function uses FOR UPDATE SKIP LOCKED (concurrency control)
   ├─ Step C: If bed found:
   │    ├─ Trigger validates bed is available (validation trigger)
   │    ├─ INSERT into admissions (parameterized query)
   │    ├─ UPDATE bed status to 'occupied'
   │    └─ Audit trigger logs the changes automatically
   ├─ Step D: If no bed:
   │    └─ INSERT into waiting_list (priority queue)
   └─ Step E: Transaction commits (ACID)
   ↓
4. Views automatically show updated data:
   ├─ v_bed_occupancy (shows bed as occupied)
   ├─ v_active_admissions (includes new admission)
   └─ v_doctor_workload (doctor's patient count +1)
   ↓
5. Backend: Returns response to frontend
   ↓
6. Frontend: Updates UI in real-time
```

**All these concepts working together ensure:**
- ✅ No duplicate bed allocations (locking)
- ✅ Data integrity (constraints, foreign keys)
- ✅ Automatic logging (triggers)
- ✅ Fast queries (indexes)
- ✅ Security (parameterized queries, JWT)
- ✅ Real-time updates (views)
- ✅ Consistency (transactions)

---

## 📁 Project File Structure

```
medicare/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── db.js              # Database connection pool & transaction helpers
│   ├── controllers/           # Request handlers (business logic)
│   │   ├── admissionController.js
│   │   ├── authController.js
│   │   ├── bedController.js
│   │   ├── billingController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   └── reportController.js
│   ├── routes/                # API endpoints
│   │   └── [7 route files]
│   ├── services/              # Complex business logic
│   │   ├── admissionService.js
│   │   └── billingService.js
│   ├── utils/                 # Helper functions
│   │   ├── errorHandler.js
│   │   └── sqlLoader.js
│   └── server.js              # Express app entry point
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js         # Axios API integration
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── BedGrid.jsx
│   │   │   └── AdmissionForm.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StaffAdmit.jsx
│   │   │   ├── WaitingList.jsx
│   │   │   ├── DoctorPatients.jsx
│   │   │   └── Billing.jsx
│   │   ├── App.jsx            # React Router setup
│   │   └── main.jsx
│   └── index.html
├── db/                         # Database SQL files
│   ├── schema.sql             # Table definitions
│   ├── functions.sql          # Stored procedures
│   ├── triggers.sql           # Triggers
│   ├── indexes_and_views.sql  # Performance optimization
│   └── seed.sql               # Sample data
└── postman_collection_medicare.json  # API testing
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Database
```bash
cd db
# Follow instructions in DATABASE_SETUP.md or MANUAL_SETUP.md
```

### 3. Configure Environment
```bash
# backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medicare
DB_USER=project_admin
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=5000
```

### 4. Run the Application
```bash
# From project root
npm run dev

# Or separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

### 6. Test with Postman
- Import `postman_collection_medicare.json`
- Run "Login" to get JWT token (auto-saved)
- Test all API endpoints

---

## 🎓 Learning Outcomes

By studying this project, you'll understand:

1. ✅ **Database Design:** Normalization, relationships, schema design
2. ✅ **SQL Mastery:** Complex queries, joins, subqueries, aggregations
3. ✅ **Advanced PostgreSQL:** Stored procedures, triggers, views, indexes
4. ✅ **Transaction Management:** ACID properties, commit/rollback
5. ✅ **Concurrency Control:** Row-level locking, deadlock prevention
6. ✅ **Security:** SQL injection prevention, authentication, authorization
7. ✅ **API Development:** RESTful design, error handling, middleware
8. ✅ **Frontend Integration:** React components, state management, API calls
9. ✅ **Full-Stack Architecture:** How frontend, backend, and database work together
10. ✅ **Real-World Patterns:** Connection pooling, audit logging, validation

---

## 📞 Support

For questions or issues:
- Check `README.md` for setup instructions
- Review `DATABASE_SETUP.md` for database configuration
- Use `MANUAL_SETUP.md` for step-by-step database setup
- Import Postman collection for API testing examples

---

**Built with ❤️ for learning DBMS concepts in a real-world application.**
