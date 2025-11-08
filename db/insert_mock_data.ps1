# insert_mock_data.ps1
# PowerShell script to insert mock data into Medicare database

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Medicare Database - Mock Data Insertion" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "medicare"
$DB_USER = "project_admin"

# Set password environment variable to avoid prompts
$env:PGPASSWORD = "Projectadmin@123"

# Get script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "   Database: $DB_NAME" -ForegroundColor Gray
Write-Host "   Host: $DB_HOST" -ForegroundColor Gray
Write-Host "   User: $DB_USER" -ForegroundColor Gray
Write-Host ""

# Check if psql is available
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "ERROR: psql command not found!" -ForegroundColor Red
    Write-Host "   Please ensure PostgreSQL is installed and added to PATH" -ForegroundColor Red
    Write-Host "   Typical path: C:\Program Files\PostgreSQL\16\bin" -ForegroundColor Gray
    exit 1
}

Write-Host "PostgreSQL found: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
$testConnection = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot connect to database!" -ForegroundColor Red
    Write-Host "   Connection details: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -ForegroundColor Red
    Write-Host "   Error: $testConnection" -ForegroundColor Red
    exit 1
}

Write-Host "Database connection successful!" -ForegroundColor Green
Write-Host ""

# Show current data counts
Write-Host "Current data counts:" -ForegroundColor Yellow
$tables = @('users', 'departments', 'doctors', 'patients', 'rooms', 'beds', 'admissions', 'services', 'bills', 'bill_items', 'waiting_list')

foreach ($table in $tables) {
    $count = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ${table}: $($count.Trim()) records" -ForegroundColor Gray
    }
}
Write-Host ""

# Ask for confirmation
Write-Host "WARNING: This will insert mock data into the database" -ForegroundColor Yellow
Write-Host "   If tables already have data you may get duplicate errors" -ForegroundColor Yellow
Write-Host ""
$response = Read-Host "Do you want to continue? (yes/no)"

if ($response -ne "yes") {
    Write-Host "Operation cancelled by user" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Inserting mock data..." -ForegroundColor Yellow

# Run the SQL file
$sqlFile = Join-Path $SCRIPT_DIR "insert_mock_data.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found!" -ForegroundColor Red
    Write-Host "   Expected location: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "   Reading SQL file: $sqlFile" -ForegroundColor Gray

# Execute SQL file
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sqlFile 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Error inserting data!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

Write-Host "Mock data inserted successfully!" -ForegroundColor Green
Write-Host ""

# Show updated data counts
Write-Host "Updated data counts:" -ForegroundColor Yellow

foreach ($table in $tables) {
    $count = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ${table}: $($count.Trim()) records" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Mock Data Insertion Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your database is now populated with realistic test data!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of inserted data:" -ForegroundColor Yellow
Write-Host "   - 13 Users (admin + doctors + staff + billing)" -ForegroundColor Gray
Write-Host "   - 10 Departments" -ForegroundColor Gray
Write-Host "   - 18 Doctors across specializations" -ForegroundColor Gray
Write-Host "   - 20 Patients with complete demographics" -ForegroundColor Gray
Write-Host "   - 24 Rooms (emergency + ICU + general + private)" -ForegroundColor Gray
Write-Host "   - 53 Beds with various statuses" -ForegroundColor Gray
Write-Host "   - 21 Admissions (active and discharged)" -ForegroundColor Gray
Write-Host "   - 37 Services in catalog" -ForegroundColor Gray
Write-Host "   - 13 Bills with line items" -ForegroundColor Gray
Write-Host "   - 8 Waiting list entries" -ForegroundColor Gray
Write-Host ""
Write-Host "You can now test the application with this data!" -ForegroundColor Green
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null
