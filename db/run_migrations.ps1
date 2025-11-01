# PowerShell script to run database migrations
# Run this from the db folder: .\run_migrations.ps1

Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "Medicare Database Migration Script" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""

# Database connection parameters (modify these if needed)
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "medicare" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }

Write-Host "Database: $DB_NAME" -ForegroundColor Cyan
Write-Host "User: $DB_USER" -ForegroundColor Cyan
Write-Host "Host: $DB_HOST" -ForegroundColor Cyan
Write-Host "Port: $DB_PORT" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Host "Error: psql command not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL and add it to PATH" -ForegroundColor Red
    Write-Host "Default location: C:\Program Files\PostgreSQL\<version>\bin" -ForegroundColor Yellow
    exit 1
}

# Function to run SQL file
function Run-SqlFile {
    param(
        [string]$file,
        [string]$description
    )
    
    Write-Host "Running: $description" -ForegroundColor Yellow
    
    if (-not (Test-Path $file)) {
        Write-Host "Error: File $file not found!" -ForegroundColor Red
        exit 1
    }
    
    $env:PGPASSWORD = Read-Host "Enter PostgreSQL password for user '$DB_USER'" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:PGPASSWORD)
    $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $file 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Success: $description" -ForegroundColor Green
        Write-Host ""
        return $true
    } else {
        Write-Host "✗ Failed: $description" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        return $false
    }
}

# Get current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Run migrations in order
Write-Host "Starting migrations..." -ForegroundColor Cyan
Write-Host ""

$files = @(
    @{file="schema.sql"; desc="Creating tables and schema"},
    @{file="functions.sql"; desc="Creating stored procedures and functions"},
    @{file="triggers.sql"; desc="Creating triggers"},
    @{file="indexes_and_views.sql"; desc="Creating indexes and views"},
    @{file="seed.sql"; desc="Inserting seed data"}
)

$success = $true
foreach ($item in $files) {
    $filePath = Join-Path $scriptPath $item.file
    if (-not (Run-SqlFile -file $filePath -description $item.desc)) {
        $success = $false
        break
    }
}

if ($success) {
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "✓ All migrations completed successfully!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database is ready to use!" -ForegroundColor Cyan
    Write-Host "You can now start the backend server." -ForegroundColor Cyan
} else {
    Write-Host "===========================================" -ForegroundColor Red
    Write-Host "✗ Migration failed!" -ForegroundColor Red
    Write-Host "===========================================" -ForegroundColor Red
    exit 1
}
