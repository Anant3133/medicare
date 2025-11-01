# Medicare Database Setup Guide

## 📋 Prerequisites
- PostgreSQL installed and running
- psql available in PATH

## 🚀 Quick Setup (3 Steps)

### Step 1: Create the Database
Open a new PowerShell terminal and run:

```powershell
# Login to PostgreSQL (it will ask for password)
psql -U postgres

# Inside psql, create the database:
CREATE DATABASE medicare;

# Exit psql
\q
```

### Step 2: Run the Migration Script
Navigate to the db folder and run:

```powershell
cd C:\Users\Anant\OneDrive\Desktop\medicare\db
.\setup_database.ps1
```

When prompted, enter your PostgreSQL password (default is usually the one you set during installation).

### Step 3: Verify Setup
```powershell
# Connect to the database
psql -U postgres -d medicare

# Check tables
\dt

# Check functions
\df

# Check views
\dv

# Exit
\q
```

## 📊 What Gets Created

✅ **12 Tables:**
- departments, doctors, patients, rooms, beds
- admissions, services, bills, bill_items
- waiting_list, audit_log, users

✅ **8+ Stored Procedures/Functions:**
- `process_admission()` - Complete admission workflow
- `allocate_bed_to_admission()` - Smart bed allocation with locking
- `discharge_patient()` - Discharge workflow
- `generate_bill()` - Automatic bill generation
- `calculate_admission_bill()` - Bill calculation
- `get_available_beds()` - Find available beds
- `get_bed_occupancy_stats()` - Statistics
- `get_next_waiting_patient()` - Priority queue

✅ **9 Triggers:**
- Audit logging (patients, admissions, beds, bills)
- Validation (bed allocation, dates, payments)
- Auto-update (bed status on discharge)
- Notifications

✅ **20+ Indexes & 10+ Views:**
- B-tree, GIN, partial, composite indexes
- Views for reporting (occupancy, workload, billing, etc.)
- Materialized view for department statistics

✅ **Sample Data:**
- 7 departments
- 8 doctors
- 12 patients
- 12 rooms (4 floors)
- 18 beds (mixed status)
- 13 services
- 9 admissions (6 active, 3 discharged)
- 6 bills
- 5 users (admin, staff, doctor roles)

## 🔄 Is it Dynamic?

**YES! The database is fully dynamic:**

### ✅ Automatic Updates:
1. **Triggers handle auto-updates:**
   - When you discharge a patient → bed status automatically changes to "available"
   - When you create/update records → audit log automatically tracks changes
   - When you allocate beds → validation triggers prevent conflicts

2. **Stored Procedures manage workflows:**
   - Admission → automatically finds & allocates beds
   - Discharge → automatically frees beds and updates status
   - Billing → automatically calculates totals

3. **Views always show current data:**
   - `v_bed_occupancy` - Real-time bed status
   - `v_active_admissions` - Current active patients
   - `v_billing_summary` - Latest billing info
   - No manual refresh needed!

### 📝 Adding New Data:
You can add data in 3 ways:

1. **Through the Frontend:**
   - Add patients, create admissions, generate bills
   - Everything updates automatically via API

2. **Through SQL:**
   ```sql
   INSERT INTO patients (full_name, dob, gender, phone, blood_group)
   VALUES ('New Patient', '1995-05-15', 'F', '555-1234', 'A+');
   ```

3. **Through Postman:**
   - Use the API endpoints to create/update data
   - Test all CRUD operations

### 🔒 Safety Features:
- **Constraints** prevent invalid data (CHECK, FOREIGN KEY, UNIQUE)
- **Transactions** ensure data consistency (ACID properties)
- **Row-level locking** prevents race conditions (`SELECT FOR UPDATE`)
- **Audit logs** track all changes automatically

## 🎯 After Setup:

Your backend will connect automatically using the `.env` configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medicare
DB_USER=postgres
DB_PASSWORD=your_password_here
```

No manual updates needed - everything is dynamic and real-time!

## 🆘 Troubleshooting

**psql not found?**
```powershell
# Add PostgreSQL to PATH (adjust version number):
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

**Database already exists?**
```powershell
# Drop and recreate:
psql -U postgres -c "DROP DATABASE IF EXISTS medicare;"
psql -U postgres -c "CREATE DATABASE medicare;"
```

**Permission denied?**
- Make sure PostgreSQL service is running
- Check Windows Services → postgresql-x64-16 (or your version)
