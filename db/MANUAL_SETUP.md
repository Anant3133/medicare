# Manual Database Setup Steps

## Step 1: Create Database (Choose ONE method)

### Method A: Using pgAdmin (Easiest)
1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to PostgreSQL server (enter your password)
3. Right-click **Databases** → **Create** → **Database**
4. Enter name: `medicare`
5. Click **Save**

### Method B: Using psql Command Line
```powershell
# Open Command Prompt or PowerShell
psql -U postgres
# Enter your password when prompted
# Then run:
CREATE DATABASE medicare;
\q
```

### Method C: Using SQL Shell (comes with PostgreSQL)
1. Open **SQL Shell (psql)** from Start Menu
2. Press Enter for defaults (Server, Database, Port, Username)
3. Enter your PostgreSQL password
4. Run: `CREATE DATABASE medicare;`
5. Exit: `\q`

---

## Step 2: Run Migrations

After creating the database, run these commands ONE BY ONE:

```powershell
cd C:\Users\Anant\OneDrive\Desktop\medicare\db

# Set your password (replace YOUR_PASSWORD)
$env:PGPASSWORD = "YOUR_PASSWORD"

# Run each SQL file
psql -U postgres -d medicare -f schema.sql
psql -U postgres -d medicare -f functions.sql
psql -U postgres -d medicare -f triggers.sql
psql -U postgres -d medicare -f indexes_and_views.sql
psql -U postgres -d medicare -f seed.sql

# Clear password
$env:PGPASSWORD = $null
```

---

## Step 3: Verify Setup

```powershell
# Connect to database
psql -U postgres -d medicare

# Inside psql, check tables:
\dt

# You should see 12 tables:
# - departments, doctors, patients, rooms, beds
# - admissions, services, bills, bill_items
# - waiting_list, audit_log, users

# Check functions:
\df

# Check views:
\dv

# Exit:
\q
```

---

## Common Issues

### "Password authentication failed"
- Your password might be different
- Try: `postgres`, `admin`, or the password from installation
- Check: C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf

### "psql not found"
```powershell
# Add PostgreSQL to PATH (replace version number):
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

### Database already exists
```sql
DROP DATABASE medicare;
CREATE DATABASE medicare;
```
