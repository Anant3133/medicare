# PowerShell script to generate comprehensive report data for Medicare system
# This populates the database with realistic data for testing the Reports dashboard

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Medicare Report Data Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "medicare"
$DB_USER = "project_admin"

# Prompt for password
Write-Host "Enter PostgreSQL password for user '$DB_USER':" -ForegroundColor Yellow
$DB_PASSWORD = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
$DB_PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for password
$env:PGPASSWORD = $DB_PASSWORD_PLAIN

Write-Host ""
Write-Host "Connecting to database: ${DB_NAME}@${DB_HOST}:${DB_PORT}" -ForegroundColor Green
Write-Host ""

# Run the SQL script
$scriptPath = Join-Path $PSScriptRoot "generate_report_data.sql"

if (Test-Path $scriptPath) {
    Write-Host "Executing SQL script: $scriptPath" -ForegroundColor Green
    Write-Host ""
    
    # Execute the SQL file
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SUCCESS! Report data generated." -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now:" -ForegroundColor Cyan
        Write-Host "  1. Refresh your Reports page (Ctrl+Shift+R)" -ForegroundColor White
        Write-Host "  2. View Occupancy, Revenue, Admissions, and Doctor Workload charts" -ForegroundColor White
        Write-Host "  3. Check Audit Logs with proper timestamps" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "ERROR: Failed to generate data" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. PostgreSQL is running" -ForegroundColor White
        Write-Host "  2. Database credentials are correct" -ForegroundColor White
        Write-Host "  3. Database 'medicare_db' exists" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "ERROR: SQL script not found at: $scriptPath" -ForegroundColor Red
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
